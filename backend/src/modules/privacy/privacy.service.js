/**
 * @file Services de exportacao, eliminacao e consentimentos de privacidade.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    assertConsentPayload,
    assertDeleteAccountPayload,
    CONSENT_VERSION,
    DEFAULT_CONSENTS,
} from "./privacy.validation.js";

const USER_EXPORT_COLLECTIONS = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "content_comments",
    "subscriptions",
    "payment_attempts",
    "trials",
    "notification_preferences",
    "notifications",
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
    "user_consents",
    "user_consent_events",
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
 * @returns {Promise<Record<string, number>>} Contagem por colecao.
 */
async function deletePersonalCollections(db, userObjectId) {
    const entries = await Promise.all(
        PERSONAL_COLLECTIONS_TO_DELETE.map(async (collectionName) => {
            const result = await db
                .collection(collectionName)
                .deleteMany({ userId: userObjectId });

            return [collectionName, result.deletedCount ?? 0];
        }),
    );

    return Object.fromEntries(entries);
}

/**
 * Anonimiza comentarios sem destruir a discussao publica ja moderada.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @returns {Promise<number>} Numero de comentarios alterados.
 */
async function anonymizeComments(db, userObjectId) {
    const result = await db.collection("content_comments").updateMany(
        { userId: userObjectId },
        {
            $set: {
                body: "Comentario removido por eliminacao de conta.",
                authorName: "Conta eliminada",
                deletedByUser: true,
                updatedAt: new Date(),
            },
        },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Cancela subscricoes operacionais sem apagar historico financeiro agregado.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @returns {Promise<number>} Numero de subscricoes atualizadas.
 */
async function cancelSubscriptionsForDeletedAccount(db, userObjectId) {
    const result = await db.collection("subscriptions").updateMany(
        { userId: userObjectId },
        {
            $set: {
                status: "canceled",
                cancelAtPeriodEnd: true,
                accountDeleted: true,
                updatedAt: new Date(),
            },
        },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Invalida convites e partilhas familiares associados a uma conta eliminada.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @returns {Promise<number>} Numero de memberships atualizadas.
 */
async function invalidateFamilyMembershipsForDeletedAccount(db, userObjectId) {
    const result = await db.collection("subscription_family_memberships").updateMany(
        {
            $or: [
                { ownerUserId: userObjectId },
                { memberUserId: userObjectId },
            ],
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
    assertDeleteAccountPayload(input);

    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    const now = new Date();
    const [removed, commentsAnonymized, subscriptionsCanceled, familyMembershipsUpdated] =
        await Promise.all([
            deletePersonalCollections(db, userObjectId),
            anonymizeComments(db, userObjectId),
            cancelSubscriptionsForDeletedAccount(db, userObjectId),
            invalidateFamilyMembershipsForDeletedAccount(db, userObjectId),
            db.collection("sessions").deleteMany({ userId: userObjectId }),
        ]);

    await db.collection("privacy_deletion_requests").insertOne({
        userId: userObjectId,
        requestedAt: now,
        accountStatusBefore: user.accountStatus ?? "active",
    });

    await db.collection("users").updateOne(
        { _id: userObjectId },
        {
            $set: {
                name: "Conta eliminada",
                email: `deleted-${String(userObjectId)}@faithflix.local`,
                accountStatus: "deleted",
                role: "user",
                deletedAt: now,
                updatedAt: now,
            },
            $unset: {
                passwordHash: "",
            },
        },
    );

    return {
        deleted: true,
        removed,
        commentsAnonymized,
        subscriptionsCanceled,
        familyMembershipsUpdated,
    };
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
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const now = new Date();

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
        { upsert: true },
    );

    await db.collection("user_consent_events").insertOne({
        userId: userObjectId,
        version: CONSENT_VERSION,
        consents,
        changedAt: now,
    });

    return {
        version: CONSENT_VERSION,
        consents,
        updatedAt: now.toISOString(),
    };
}
