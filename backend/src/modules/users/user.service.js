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
    assertRoleUpdate,
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
 * Lista utilizadores para administradores sem campos internos de autenticação.
 *
 * @returns {Promise<Array<ReturnType<typeof toPublicUser>>>} Lista pública de utilizadores.
 */
export async function listUsers(filters = {}) {
    const db = await getDb();

    const users = await db
        .collection("users")
        .find(buildAdminUserQuery(filters), {
            projection: { passwordHash: 0 },
        })
        .sort({ createdAt: -1 })
        .toArray();

    return users.map((user) => ({
        ...toPublicUser(user),
        accountStatus: user.accountStatus ?? "active",
    }));
}

/**
 * Atualiza a role de um utilizador.
 *
 * @param {string} targetUserId - Target user id.
 * @param {{ role?: unknown }} input - Role dados.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Utilizador público atualizado.
 */
export async function updateUserRole(targetUserId, input) {
    const update = assertRoleUpdate(input);
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: asUserObjectId(targetUserId) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}
/**
 * Atualiza role ou estado de uma conta através de administrador.
 *
 * @param {string} actorUserId
 * @param {string} targetUserId
 * @param {{ role?: unknown, accountStatus?: unknown }} input
 * @returns {Promise<ReturnType<typeof toPublicUser> & { accountStatus: string }>}
 */
export async function updateUserByAdmin(
    actorUserId,
    targetUserId,
    input,
) {
    const update = assertAdminUserUpdate(input);
    const db = await getDb();

    const actorObjectId = asUserObjectId(actorUserId);
    const targetObjectId = asUserObjectId(targetUserId);

    if (actorObjectId.equals(targetObjectId)) {
        if (update.role && update.role !== "admin") {
            throw new HttpError(
                400,
                "Nao podes retirar o teu proprio acesso admin.",
            );
        }

        if (update.accountStatus === "blocked") {
            throw new HttpError(
                400,
                "Nao podes bloquear a tua propria conta.",
            );
        }
    }

    const user = await db.collection("users").findOneAndUpdate(
        {
            _id: targetObjectId,
            accountStatus: { $ne: "deleted" },
        },
        {
            $set: {
                ...update,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: "after",
        },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    await writeAdminAuditLog(db, {
        actorUserId: actorObjectId,
        targetUserId: targetObjectId,
        action: "user_admin_update",
        changes: update,
    });

    return {
        ...toPublicUser(user),
        accountStatus: user.accountStatus ?? "active",
    };
}