/**
 * @file Services de exportacao, eliminacao e consentimentos de privacidade.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { verifyPassword } from "../auth/auth.password.js";
import { assertAnotherActiveAdminRemains } from "../users/admin-invariant.service.js";
import {
    assertConsentPayload,
    assertDeleteAccountPayload,
    CONSENT_VERSION,
    DEFAULT_CONSENTS,
} from "./privacy.validation.js";

/**
 * Garante invariantes de consentimento e pedidos de eliminação.
 *
 * @returns {Promise<void>}
 */
export async function ensurePrivacyIndexes() {
    const db = await getDb();
    await db.collection("user_consents").createIndex({ userId: 1 }, { unique: true });
    await db
        .collection("user_consent_events")
        .createIndex({ userId: 1, changedAt: -1 });
    await db
        .collection("privacy_deletion_requests")
        .createIndex({ userId: 1, requestedAt: -1 });
}

const USER_EXPORT_COLLECTIONS = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "content_comments",
    "charity_memberships",
    "subscriptions",
    "payment_attempts",
    "trials",
    "notification_preferences",
    "notifications",
    "demo_email_outbox",
    "user_consents",
    "user_consent_events",
];

const PERSONAL_COLLECTIONS_TO_DELETE = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "notification_preferences",
    "notifications",
    "demo_email_outbox",
    "user_consents",
    "user_consent_events",
    "trials",
    "billing_customer_locks",
    "charity_memberships",
    "password_reset_tokens",
];

const SENSITIVE_EXPORT_KEYS = new Set([
    "password",
    "passwordHash",
    "token",
    "tokenHash",
    "sessionToken",
    "cookie",
    "secret",
]);

/**
 * Converte um id vindo da sessao para `ObjectId`.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {ObjectId} Id convertido para MongoDB.
 * @throws {HttpError} Quando o id da sessao nao e valido.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Utilizador invalido.");
    }

    return new ObjectId(userId);
}

/**
 * Converte valores MongoDB para JSON estavel.
 *
 * @param {unknown} value Valor vindo da base de dados.
 * @returns {unknown} Valor serializavel.
 */
function toExportValue(value) {
    if (value instanceof ObjectId) {
        return String(value);
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(toExportValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => !SENSITIVE_EXPORT_KEYS.has(key))
                .map(([key, nested]) => [key, toExportValue(nested)]),
        );
    }

    return value;
}

/**
 * Remove campos internos do documento de utilizador.
 *
 * @param {Record<string, unknown>} user Documento `users`.
 * @returns {Record<string, unknown>} Dados publicos exportaveis.
 */
function toExportableUser(user) {
    return toExportValue({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus ?? "active",
        parentalMaxAgeRating: user.parentalMaxAgeRating ?? 18,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}

/**
 * Carrega uma colecao filtrando sempre pelo dono autenticado.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {string} collectionName Nome da colecao.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<Record<string, unknown>[]>} Documentos exportaveis.
 */
async function exportOwnedCollection(db, collectionName, userObjectId) {
    const rows = await db
        .collection(collectionName)
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .toArray();

    return rows.map(toExportValue);
}

/**
 * Exporta partilhas familiares onde o utilizador e owner ou membro.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<Record<string, unknown>[]>} Memberships familiares exportaveis.
 */
async function exportFamilyMemberships(db, userObjectId) {
    const rows = await db
        .collection("subscription_family_memberships")
        .find({
            $or: [
                { ownerUserId: userObjectId },
                { memberUserId: userObjectId },
            ],
        })
        .sort({ createdAt: -1 })
        .toArray();

    return rows.map(toExportValue);
}

/**
 * Gera a exportacao RGPD do utilizador autenticado.
 *
 * @param {string} userId Id vindo de `req.user.id`.
 * @returns {Promise<{ generatedAt: string, user: Record<string, unknown>, sections: Record<string, Record<string, unknown>[]> }>} Exportacao completa.
 * @throws {HttpError} Quando a conta nao existe.
 */
export async function buildUserDataExport(userId) {
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    const entries = await Promise.all(
        USER_EXPORT_COLLECTIONS.map(async (collectionName) => [
            collectionName,
            await exportOwnedCollection(db, collectionName, userObjectId),
        ]),
    );
    const sections = Object.fromEntries(entries);
    sections.subscription_family_memberships = await exportFamilyMemberships(db, userObjectId);

    return {
        generatedAt: new Date().toISOString(),
        user: toExportableUser(user),
        sections,
    };
}

/**
 * Remove documentos pessoais de colecoes cujo conteudo pertence ao utilizador.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @param {import("mongodb").ClientSession | undefined} session Sessao transacional.
 * @returns {Promise<Record<string, number>>} Contagem por colecao.
 */
async function deletePersonalCollections(db, userObjectId, session) {
    const entries = [];
    for (const collectionName of PERSONAL_COLLECTIONS_TO_DELETE) {
        const ownershipFilter = collectionName === "billing_customer_locks"
            ? { _id: userObjectId }
            : { userId: userObjectId };
        const result = await db
            .collection(collectionName)
            .deleteMany(ownershipFilter, { session });
        entries.push([collectionName, result.deletedCount ?? 0]);
    }

    return Object.fromEntries(entries);
}

/**
 * Anonimiza comentarios sem destruir a discussao publica ja moderada.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @param {import("mongodb").ClientSession | undefined} session Sessao transacional.
 * @returns {Promise<number>} Numero de comentarios alterados.
 */
async function anonymizeComments(db, userObjectId, session) {
    const result = await db.collection("content_comments").updateMany(
        { userId: userObjectId },
        {
            $set: {
                body: "Comentario removido por eliminacao de conta.",
                authorName: "Conta eliminada",
                deletedByUser: true,
                updatedAt: new Date(),
            },
            $unset: {
                userId: "",
                email: "",
                authorEmail: "",
            },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Cancela subscricoes operacionais sem apagar historico financeiro agregado.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @param {import("mongodb").ClientSession | undefined} session Sessao transacional.
 * @returns {Promise<number>} Numero de subscricoes atualizadas.
 */
async function cancelSubscriptionsForDeletedAccount(db, userObjectId, session) {
    const result = await db.collection("subscriptions").updateMany(
        { userId: userObjectId },
        {
            $set: {
                status: "canceled",
                cancelAtPeriodEnd: true,
                accountDeleted: true,
                updatedAt: new Date(),
            },
            $unset: {
                contactEmail: "",
                customerEmail: "",
            },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Invalida convites e partilhas familiares associados a uma conta eliminada.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @param {string} userEmail Email original a remover de convites pendentes.
 * @param {import("mongodb").ClientSession | undefined} session Sessao transacional.
 * @returns {Promise<number>} Numero de memberships atualizadas.
 */
async function invalidateFamilyMembershipsForDeletedAccount(
    db,
    userObjectId,
    userEmail,
    session,
) {
    const identityFilter = {
        $or: [
            { ownerUserId: userObjectId },
            { memberUserId: userObjectId },
            { invitedEmail: userEmail },
        ],
    };
    const collection = db.collection("subscription_family_memberships");
    const result = await collection.updateMany(
        {
            ...identityFilter,
            status: { $in: ["pending", "active"] },
        },
        {
            $set: {
                status: "removed",
                removedReason: "account_deleted",
                removedAt: new Date(),
                updatedAt: new Date(),
            },
        },
        { session },
    );
    await collection.updateMany(
        identityFilter,
        {
            $unset: {
                invitedEmail: "",
                contactEmail: "",
            },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Mantém o ledger financeiro exigido, removendo campos de contacto facultativos.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Utilizador eliminado.
 * @param {import("mongodb").ClientSession | undefined} session Sessão transacional.
 * @returns {Promise<number>} Registos financeiros pseudonimizados.
 */
async function scrubRetainedFinancialRecords(db, userObjectId, session) {
    const result = await db.collection("payment_attempts").updateMany(
        { userId: userObjectId },
        {
            $set: { accountDeleted: true, updatedAt: new Date() },
            $unset: {
                email: "",
                customerEmail: "",
                payerEmail: "",
            },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Elimina a propria conta com confirmacao forte e limpeza controlada.
 *
 * @param {string} userId Id vindo da sessao.
 * @param {Record<string, unknown>} input Pedido recebido do frontend.
 * @returns {Promise<{ deleted: true, removed: Record<string, number>, commentsAnonymized: number, subscriptionsCanceled: number, familyMembershipsUpdated: number }>} Resultado operacional.
 */
export async function deleteMyAccount(userId, input) {
    const { password } = assertDeleteAccountPayload(input);
    const userObjectId = asUserObjectId(userId);
    const db = await getDb();
    const currentUser = await db.collection("users").findOne({ _id: userObjectId });

    if (!currentUser?.passwordHash) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    if (!(await verifyPassword(password, currentUser.passwordHash))) {
        throw new HttpError(
            403,
            "Password atual incorreta.",
            undefined,
            "CURRENT_PASSWORD_INVALID",
        );
    }

    return runInTransaction(async ({ db: transactionDb, session }) => {
        const user = await transactionDb.collection("users").findOne(
            { _id: userObjectId, passwordHash: currentUser.passwordHash },
            { session },
        );

        if (!user || ["deleted", "blocked"].includes(user.accountStatus)) {
            throw new HttpError(
                409,
                "A conta mudou durante o pedido. Tenta novamente.",
                undefined,
                "ACCOUNT_STATE_CHANGED",
            );
        }

        const now = new Date();
        await assertAnotherActiveAdminRemains({
            db: transactionDb,
            session,
            user,
            now,
        });
        const removed = await deletePersonalCollections(
            transactionDb,
            userObjectId,
            session,
        );
        const commentsAnonymized = await anonymizeComments(
            transactionDb,
            userObjectId,
            session,
        );
        const subscriptionsCanceled =
            await cancelSubscriptionsForDeletedAccount(
                transactionDb,
                userObjectId,
                session,
            );
        const familyMembershipsUpdated =
            await invalidateFamilyMembershipsForDeletedAccount(
                transactionDb,
                userObjectId,
                user.email,
                session,
            );
        await scrubRetainedFinancialRecords(
            transactionDb,
            userObjectId,
            session,
        );
        await transactionDb
            .collection("password_reset_dev_outbox")
            .deleteMany({ email: user.email }, { session });
        await transactionDb
            .collection("sessions")
            .deleteMany({ userId: userObjectId }, { session });
        await transactionDb.collection("privacy_deletion_requests").insertOne(
            {
                userId: userObjectId,
                requestedAt: now,
                accountStatusBefore: user.accountStatus ?? "active",
            },
            { session },
        );

        const updateResult = await transactionDb.collection("users").updateOne(
            { _id: userObjectId, passwordHash: currentUser.passwordHash },
            {
                $set: {
                    name: "Conta eliminada",
                    email: `deleted-${String(userObjectId)}@faithflix.local`,
                    accountStatus: "deleted",
                    role: "user",
                    deletedAt: now,
                    updatedAt: now,
                },
                $unset: { passwordHash: "" },
            },
            { session },
        );

        if (updateResult.matchedCount !== 1) {
            throw new HttpError(
                409,
                "A conta mudou durante o pedido. Tenta novamente.",
                undefined,
                "ACCOUNT_STATE_CHANGED",
            );
        }

        return {
            deleted: true,
            removed,
            commentsAnonymized,
            subscriptionsCanceled,
            familyMembershipsUpdated,
        };
    });
}

/**
 * Constrói o estado publico de consentimentos.
 *
 * @param {Record<string, unknown> | null} document Documento persistido.
 * @returns {{ version: string, consents: typeof DEFAULT_CONSENTS, updatedAt: string | null }} Estado visivel.
 */
function toPublicConsents(document) {
    return {
        version: document?.version ?? CONSENT_VERSION,
        consents: {
            ...DEFAULT_CONSENTS,
            ...(document?.consents ?? {}),
        },
        updatedAt: document?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lê os consentimentos atuais do utilizador autenticado.
 *
 * @param {string} userId Id vindo da sessao.
 * @returns {Promise<ReturnType<typeof toPublicConsents>>} Estado atual.
 */
export async function getMyConsents(userId) {
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const document = await db
        .collection("user_consents")
        .findOne({ userId: userObjectId });

    return toPublicConsents(document);
}

/**
 * Atualiza consentimentos atuais e grava evento historico.
 *
 * @param {string} userId Id vindo da sessao.
 * @param {Record<string, unknown>} input Dados recebidos do frontend.
 * @returns {Promise<ReturnType<typeof toPublicConsents>>} Estado atualizado.
 */
export async function updateMyConsents(userId, input) {
    const consents = assertConsentPayload(input);
    const userObjectId = asUserObjectId(userId);
    const now = new Date();

    await runInTransaction(async ({ db, session }) => {
        await db.collection("user_consents").updateOne(
            { userId: userObjectId },
            {
                $set: {
                    userId: userObjectId,
                    version: CONSENT_VERSION,
                    consents,
                    updatedAt: now,
                },
                $setOnInsert: { createdAt: now },
            },
            { upsert: true, session },
        );

        await db.collection("user_consent_events").insertOne(
            {
                userId: userObjectId,
                version: CONSENT_VERSION,
                consents,
                changedAt: now,
            },
            { session },
        );
    });

    return {
        version: CONSENT_VERSION,
        consents,
        updatedAt: now.toISOString(),
    };
}
