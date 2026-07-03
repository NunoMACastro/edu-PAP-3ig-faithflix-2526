/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { hashPassword, verifyPassword } from "./auth.password.js";
import {
    assertValidEmail,
    assertValidName,
    assertValidPassword,
} from "./auth.validation.js";
import { createSession, toPublicUser } from "./session.service.js";
import { createOpaqueToken, hashToken, isOpaqueToken } from "./token.js";

const RESET_TTL_MS = 1000 * 60 * 30;
const DEV_RESET_OUTBOX_FLAG = "ENABLE_DEV_RESET_TOKEN_OUTBOX";
const PASSWORD_RESET_RESPONSE = {
    message: "Se o email existir, foi criado um pedido de recuperacao.",
};

/**
 * Verifica se a outbox dev-only separada de tokens de recuperação está ativa.
 *
 * @returns {boolean} Verdadeiro apenas em ambientes não produtivos com a flag explícita ativa.
 */
function isDevResetOutboxEnabled() {
    return (
        process.env[DEV_RESET_OUTBOX_FLAG] === "true" &&
        process.env.NODE_ENV !== "production"
    );
}

/**
 * Guarda o token de recuperação original numa outbox dev-only separada para evidência PAP.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {{ email: string, userId: unknown, resetToken: string, expiresAt: Date, now: Date }} tokenData - Dados de evidência do token de recuperação.
 * @returns {Promise<void>} Termina depois de escrever opcionalmente a entrada da outbox.
 */
async function writeDevResetOutbox(
    db,
    { email, userId, resetToken, expiresAt, now },
) {
    if (!isDevResetOutboxEnabled()) {
        return;
    }

    await db.collection("password_reset_dev_outbox").insertOne({
        email,
        userId,
        resetToken,
        createdAt: now,
        expiresAt,
    });
}

/**
 * Regista um utilizador e cria a sessão autenticada inicial.
 *
 * @param {{ name?: unknown, email?: unknown, password?: unknown }} input - Dados de registo.
 * @returns {Promise<{ user: ReturnType<typeof toPublicUser>, token: string }>} Utilizador público e token de sessão.
 */
export async function registerUser(input) {
    await ensureAuthIndexes();

    const name = assertValidName(input?.name);
    const email = assertValidEmail(input?.email);
    const password = assertValidPassword(input?.password);
    const db = await getDb();

    try {
        const now = new Date();
        const result = await db.collection("users").insertOne({
            name,
            email,
            passwordHash: await hashPassword(password),
            role: "user",
            parentalMaxAgeRating: 18,
            createdAt: now,
            updatedAt: now,
        });

        const user = {
            _id: result.insertedId,
            name,
            email,
            role: "user",
            parentalMaxAgeRating: 18,
        };

        return { user: toPublicUser(user), token: await createSession(user) };
    } catch (error) {
        if (error.code === 11000) {
            throw new HttpError(409, "Este email ja esta registado.");
        }

        throw error;
    }
}

/**
 * Autentica um utilizador com email e password.
 *
 * @param {{ email?: unknown, password?: unknown }} input - Dados de login.
 * @returns {Promise<{ user: ReturnType<typeof toPublicUser>, token: string }>} Utilizador público e token de sessão.
 */
export async function loginUser(input) {
    const email = assertValidEmail(input?.email);
    const password = String(input?.password ?? "");
    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    if (
        !user ||
        ["blocked", "deleted"].includes(user.accountStatus) ||
        !(await verifyPassword(password, user.passwordHash))
    ) {
        throw new HttpError(401, "Credenciais invalidas.");
    }

    return { user: toPublicUser(user), token: await createSession(user) };
}

/**
 * Cria um token de recuperação de password quando o email existe.
 *
 * @param {{ email?: unknown }} input - Dados de recuperação de password.
 * @param {{ db?: import("mongodb").Db }} [options] - Dependências opcionais para testes.
 * @returns {Promise<{ message: string }>} Resposta pública genérica.
 */
export async function requestPasswordReset(input, options = {}) {
    const email = assertValidEmail(input?.email);
    const db = options.db ?? (await getDb());
    const user = await db.collection("users").findOne({ email });

    if (!user) {
        return { ...PASSWORD_RESET_RESPONSE };
    }

    const resetToken = createOpaqueToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RESET_TTL_MS);

    await db.collection("password_reset_tokens").insertOne({
        userId: user._id,
        tokenHash: hashToken(resetToken),
        usedAt: null,
        createdAt: now,
        expiresAt,
    });

    await writeDevResetOutbox(db, {
        email,
        userId: user._id,
        resetToken,
        expiresAt,
        now,
    });

    return { ...PASSWORD_RESET_RESPONSE };
}

/**
 * Lê o token de recuperação mais recente da outbox dev-only separada.
 *
 * @param {unknown} emailInput - Email cujo token dev de recuperação mais recente deve ser lido.
 * @param {{ db?: import("mongodb").Db }} [options] - Dependências opcionais para testes.
 * @returns {Promise<{ email: string, resetToken: string, expiresAt: Date }>} Registo dev-only mais recente do token.
 */
export async function getLatestDevPasswordResetToken(emailInput, options = {}) {
    if (!isDevResetOutboxEnabled()) {
        throw new HttpError(404, "Canal dev-only de reset desativado.");
    }

    const email = assertValidEmail(emailInput);
    const db = options.db ?? (await getDb());
    const entry = await db.collection("password_reset_dev_outbox").findOne(
        {
            email,
            expiresAt: { $gt: new Date() },
        },
        {
            sort: { createdAt: -1 },
            projection: { _id: 0, email: 1, resetToken: 1, expiresAt: 1 },
        },
    );

    if (!entry) {
        throw new HttpError(404, "Token dev-only nao encontrado.");
    }

    return {
        email: entry.email,
        resetToken: entry.resetToken,
        expiresAt: entry.expiresAt,
    };
}

/**
 * Substitui uma password usando um token válido ainda não usado.
 *
 * @param {{ token?: unknown, password?: unknown }} input - Dados de reset.
 * @returns {Promise<{ message: string }>} Success message.
 */
export async function resetPassword(input) {
    const token = String(input?.token ?? "").trim();
    const password = assertValidPassword(input?.password);

    if (!isOpaqueToken(token)) {
        throw new HttpError(400, "Token de recuperacao invalido ou expirado.");
    }

    const db = await getDb();
    const reset = await db.collection("password_reset_tokens").findOne({
        tokenHash: hashToken(token),
        usedAt: null,
        expiresAt: { $gt: new Date() },
    });

    if (!reset) {
        throw new HttpError(400, "Token de recuperacao invalido ou expirado.");
    }

    await db.collection("users").updateOne(
        { _id: reset.userId },
        {
            $set: {
                passwordHash: await hashPassword(password),
                updatedAt: new Date(),
            },
        },
    );

    await db
        .collection("password_reset_tokens")
        .updateOne({ _id: reset._id }, { $set: { usedAt: new Date() } });

    return { message: "Password atualizada com sucesso." };
}
