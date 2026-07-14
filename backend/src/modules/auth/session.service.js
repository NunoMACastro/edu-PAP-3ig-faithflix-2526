/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/session.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { SESSION_TTL_MS } from "../../config/session.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { createOpaqueToken, hashToken, isOpaqueToken } from "./token.js";

/**
 * Converte um documento interno de utilizador para o formato público de sessão.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, email: string, role: string, parentalMaxAgeRating?: number }} user - MongoDB user document.
 * @returns {{ id: string, name: string, email: string, role: string, parentalMaxAgeRating: number }} Dados públicos do utilizador.
 */
export function toPublicUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus ?? "active",
        parentalMaxAgeRating: Number.isInteger(user.parentalMaxAgeRating)
            ? user.parentalMaxAgeRating
            : 18,
    };
}

/**
 * Verifica se uma conta pode manter uma sessao autenticada.
 *
 * @param {{ accountStatus?: string }} user Documento de utilizador.
 * @returns {boolean} Verdadeiro apenas para contas operacionais.
 */
function canAuthenticate(user) {
    return (user.accountStatus ?? "active") === "active";
}

/**
 * Cria uma sessão no servidor e devolve o token opaco do cookie.
 *
 * @param {{ _id: import("mongodb").ObjectId }} user - Documento de utilizador que recebe a nova sessão.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession, ensureIndexes?: boolean }} [options] Contexto transacional opcional; `ensureIndexes:false` só é usado quando o caller já garantiu os índices antes da transação.
 * @returns {Promise<string>} Token opaco de sessão para guardar no cookie HttpOnly.
 */
export async function createSession(user, options = {}) {
    if (options.ensureIndexes !== false) {
        await ensureAuthIndexes();
    }

    const db = options.db ?? (await getDb());
    const token = createOpaqueToken();
    const now = new Date();

    await db.collection("sessions").insertOne(
        {
            userId: user._id,
            tokenHash: hashToken(token),
            createdAt: now,
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        },
        { session: options.session },
    );

    return token;
}

/**
 * Resolve um token de sessão para o utilizador público autenticado.
 *
 * @param {string | undefined} sessionToken - Token read from the session cookie.
 * @returns {Promise<null | { token: string, user: ReturnType<typeof toPublicUser> }>} Sessão resolvida ou null.
 */
export async function resolveSession(sessionToken) {
    if (!sessionToken || !isOpaqueToken(sessionToken)) {
        return null;
    }

    const db = await getDb();
    const session = await db.collection("sessions").findOne({
        tokenHash: hashToken(sessionToken),
        expiresAt: { $gt: new Date() },
    });

    if (!session) {
        return null;
    }

    const userId =
        session.userId instanceof ObjectId
            ? session.userId
            : new ObjectId(session.userId);
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
        return null;
    }

    if (!canAuthenticate(user)) {
        await db.collection("sessions").deleteOne({ _id: session._id });
        return null;
    }

    return { token: sessionToken, user: toPublicUser(user) };
}

/**
 * Apaga uma sessão no servidor pelo token do cookie.
 *
 * @param {string | undefined} sessionToken - Token lido do pedido atual.
 * @returns {Promise<void>} Termina depois de apagar ou ignorar a sessão.
 */
export async function deleteSession(sessionToken) {
    if (!sessionToken || !isOpaqueToken(sessionToken)) {
        return;
    }

    const db = await getDb();
    await db
        .collection("sessions")
        .deleteOne({ tokenHash: hashToken(sessionToken) });
}
