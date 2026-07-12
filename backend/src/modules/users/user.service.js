/**
 * @file Ficheiro `real_dev/backend/src/modules/users/user.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { paginationMetadata } from "../../utils/pagination.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { toPublicUser as toSessionPublicUser } from "../auth/session.service.js";
import {
    assertAnotherActiveAdminRemains,
    isActiveAdmin,
} from "./admin-invariant.service.js";
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
    assertParentalSettings,
    assertProfileUpdate,
    parseAdminUserPagination,
} from "./user.validation.js";

/**
 * Converte um documento interno de utilizador para o formato público de perfil.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, email: string, role: string, parentalMaxAgeRating?: number, createdAt?: Date, updatedAt?: Date }} user - MongoDB user document.
 * @returns {{ id: string, name: string, email: string, role: string, parentalMaxAgeRating: number, createdAt?: Date, updatedAt?: Date }} Perfil público do utilizador.
 */
function toPublicUser(user) {
    return {
        ...toSessionPublicUser(user),
        accountStatus: user.accountStatus ?? "active",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

/**
 * Converte um id de utilizador num ObjectId MongoDB.
 *
 * @param {string} userId - Id do utilizador vindo de parâmetros ou da sessão.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Utilizador invalido.");
    }

    return new ObjectId(userId);
}

/**
 * Determina se a alteracao retira uma conta do conjunto de admins ativos.
 *
 * @param {{ role?: string, accountStatus?: string }} before Estado persistido.
 * @param {{ role?: string, accountStatus?: string }} update Alteracao validada.
 * @returns {boolean} Verdadeiro quando a garantia do ultimo admin deve ser verificada.
 */
function removesActiveAdmin(before, update) {
    if (!isActiveAdmin(before)) {
        return false;
    }

    return !isActiveAdmin({
        role: update.role ?? before.role,
        accountStatus: update.accountStatus ?? before.accountStatus ?? "active",
    });
}

/**
 * Constroi filtros seguros para a listagem administrativa.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Filtros recebidos.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
export function buildAdminUserQuery(filters = {}) {
    const clauses = [];
    const { search, status } = assertAdminUserFilters(filters);

    if (search) {
        // O texto ja foi escapado, por isso a regex serve apenas pesquisa literal.
        clauses.push({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
        });
    }

    if (status === "active") {
        clauses.push({
            $or: [
                { accountStatus: "active" },
                { accountStatus: null },
                { accountStatus: { $exists: false } },
            ],
        });
    } else if (status) {
        clauses.push({ accountStatus: status });
    }

    if (clauses.length === 0) return {};
    if (clauses.length === 1) return clauses[0];
    return { $and: clauses };
}

/**
 * Gets the authenticated user's profile.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Perfil público.
 */
export async function getMyProfile(userId) {
    const db = await getDb();
    const user = await db
        .collection("users")
        .findOne({ _id: asUserObjectId(userId) });

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}

/**
 * Atualiza apenas campos de perfil em autosserviço.
 *
 * @param {string} userId - Authenticated user id.
 * @param {{ name?: unknown }} input - Profile dados.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Perfil público atualizado.
 */
export async function updateMyProfile(userId, input) {
    const update = assertProfileUpdate(input);
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: asUserObjectId(userId) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}

/**
 * Atualiza o limite parental do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @param {{ parentalMaxAgeRating?: unknown }} input - Parental dados.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Perfil público atualizado.
 */
export async function updateParentalSettings(userId, input) {
    const update = assertParentalSettings(input);
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: asUserObjectId(userId) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}

/**
 * Lista utilizadores para administradores sem campos internos de autenticacao.
 *
 * @param {{ search?: unknown, status?: unknown, page?: unknown, limit?: unknown }} [filters={}] Filtros admin.
 * @returns {Promise<{users: Array<ReturnType<typeof toPublicUser>>, page: number, limit: number, total: number, totalPages: number}>} Pagina publica de utilizadores.
 */
export async function listUsers(filters = {}) {
    const db = await getDb();
    const query = buildAdminUserQuery(filters);
    const { page, limit } = parseAdminUserPagination(filters);
    const collection = db.collection("users");
    const [users, total] = await Promise.all([
        collection
            .find(query, { projection: { passwordHash: 0 } })
            .sort({ createdAt: -1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        collection.countDocuments(query),
    ]);

    return {
        users: users.map(toPublicUser),
        ...paginationMetadata({ page, limit, total }),
    };
}

/**
 * Mantem a rota legacy de role ligada ao fluxo auditado da MF5.
 *
 * @param {string} actorUserId Id do admin autenticado.
 * @param {string} targetUserId - Target user id.
 * @param {{ role?: unknown }} input - Role dados.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Utilizador público atualizado.
 */
export async function updateUserRole(
    actorUserId,
    targetUserId,
    input,
    context = {},
) {
    return updateUserByAdmin(actorUserId, targetUserId, input, context);
}

/**
 * Atualiza role/estado de uma conta com protecoes administrativas.
 *
 * @param {string} actorUserId Id do admin autenticado.
 * @param {string} targetUserId Id do utilizador alvo.
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Utilizador atualizado.
 * @throws {HttpError} Quando a operacao tentaria remover o proprio acesso admin.
 */
export async function updateUserByAdmin(
    actorUserId,
    targetUserId,
    input,
    context = {},
) {
    const update = assertAdminUserUpdate(input);
    const actorObjectId = asUserObjectId(actorUserId);
    const targetObjectId = asUserObjectId(targetUserId);

    if (String(actorObjectId) === String(targetObjectId)) {
        if (update.role && update.role !== "admin") {
            throw new HttpError(
                400,
                "Nao podes remover o teu proprio acesso admin.",
            );
        }

        if (update.accountStatus === "blocked") {
            throw new HttpError(
                400,
                "Nao podes bloquear a tua propria conta.",
            );
        }
    }

    return runInTransaction(async ({ db, session }) => {
        const users = db.collection("users");
        const before = await users.findOne(
            { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
            { session },
        );

        if (!before) {
            throw new HttpError(404, "Utilizador nao encontrado.");
        }

        // Preserva o estado anterior mesmo em doubles que devolvem a mesma referencia.
        const beforeSnapshot = { ...before };

        if (removesActiveAdmin(before, update)) {
            await assertAnotherActiveAdminRemains({
                db,
                session,
                user: before,
                now: new Date(),
            });
        }

        const now = new Date();
        const user = await users.findOneAndUpdate(
            { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
            { $set: { ...update, updatedAt: now } },
            { returnDocument: "after", session },
        );

        if (!user) {
            throw new HttpError(409, "O utilizador foi alterado em concorrencia.");
        }

        if (update.accountStatus === "blocked") {
            await db
                .collection("sessions")
                .deleteMany({ userId: targetObjectId }, { session });
        }

        await writeAdminAudit({
            db,
            session,
            actorUserId: actorObjectId,
            action: "user.admin_update",
            targetType: "user",
            targetId: targetObjectId,
            before: {
                role: beforeSnapshot.role,
                accountStatus: beforeSnapshot.accountStatus ?? "active",
            },
            after: {
                role: user.role,
                accountStatus: user.accountStatus ?? "active",
            },
            requestId: context.requestId,
            metadata: { changedFields: Object.keys(update).sort() },
        });

        return toPublicUser(user);
    });
}
