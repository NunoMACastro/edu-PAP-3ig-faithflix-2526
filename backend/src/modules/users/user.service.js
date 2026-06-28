/**
 * @file Ficheiro `real_dev/backend/src/modules/users/user.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { toPublicUser as toSessionPublicUser } from "../auth/session.service.js";
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
    assertParentalSettings,
    assertProfileUpdate,
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
 * Constroi filtros seguros para a listagem administrativa.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Filtros recebidos.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
function buildAdminUserQuery(filters = {}) {
    const query = {};
    const { search, status } = assertAdminUserFilters(filters);

    if (search) {
        // O texto ja foi escapado, por isso a regex serve apenas pesquisa literal.
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    if (status) {
        query.accountStatus = status;
    }

    return query;
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
 * @param {{ search?: unknown, status?: unknown }} [filters={}] Filtros admin.
 * @returns {Promise<Array<ReturnType<typeof toPublicUser>>>} Lista pública de utilizadores.
 */
export async function listUsers(filters = {}) {
    const db = await getDb();
    const users = await db
        .collection("users")
        .find(buildAdminUserQuery(filters), { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

    return users.map(toPublicUser);
}

/**
 * Mantem a rota legacy de role ligada ao fluxo auditado da MF5.
 *
 * @param {string} actorUserId Id do admin autenticado.
 * @param {string} targetUserId - Target user id.
 * @param {{ role?: unknown }} input - Role dados.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Utilizador público atualizado.
 */
export async function updateUserRole(actorUserId, targetUserId, input) {
    return updateUserByAdmin(actorUserId, targetUserId, input);
}

/**
 * Atualiza role/estado de uma conta com protecoes administrativas.
 *
 * @param {string} actorUserId Id do admin autenticado.
 * @param {string} targetUserId Id do utilizador alvo.
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Utilizador atualizado.
 * @throws {HttpError} Quando a operacao tentaria remover o proprio acesso admin.
 */
export async function updateUserByAdmin(actorUserId, targetUserId, input) {
    const update = assertAdminUserUpdate(input);
    const db = await getDb();
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

    const now = new Date();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
        { $set: { ...update, updatedAt: now } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    await db.collection("admin_audit_logs").insertOne({
        actorUserId: actorObjectId,
        action: "user.admin_update",
        targetType: "user",
        targetUserId: targetObjectId,
        changes: update,
        createdAt: now,
    });

    if (update.accountStatus === "blocked") {
        await db.collection("sessions").deleteMany({ userId: targetObjectId });
    }

    return toPublicUser(user);
}
