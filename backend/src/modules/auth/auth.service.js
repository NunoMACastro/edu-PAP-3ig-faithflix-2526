/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.service.js` da implementação real_dev.
 */

import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { isDemoMailboxEnvironmentEnabled } from "../demo-mailbox/demo-mailbox.config.js";
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
const PASSWORD_HASH_PATTERN = /^[a-f0-9]{32}:[a-f0-9]{128}$/i;
const DUMMY_LOGIN_PASSWORD = "faithflix-login-dummy-not-a-credential";
const DUMMY_LOGIN_PASSWORD_HASH =
    "6661697468666c69782d617574682d31:c1b23e369fa188e56b73762de813e69fd650766ad66d10809525c0b9726e2d64c53464bca9af1c24153dd7217edf26cbb3b960836fe8c11b7864455ee338d691";
const PASSWORD_RESET_RESPONSE = {
    message: "Se o email existir, foi criado um pedido de recuperação.",
};

/**
 * Confirma se um documento representa uma conta que pode iniciar sessão.
 * Estados desconhecidos falham fechados; documentos legacy sem estado mantêm
 * a compatibilidade histórica como contas ativas.
 *
 * @param {Record<string, unknown> | null} user Documento de utilizador encontrado.
 * @returns {boolean} Verdadeiro apenas para uma conta operacional.
 */
function canLogin(user) {
    return Boolean(user) && (user.accountStatus ?? "active") === "active";
}

/**
 * Confirma o formato produzido por `hashPassword`, antes de permitir que esse
 * valor substitua o hash dummy usado para equalizar o trabalho criptográfico.
 *
 * @param {unknown} passwordHash Hash persistido no documento de utilizador.
 * @returns {boolean} Verdadeiro quando o formato `salt:key` é suportado.
 */
function hasSupportedPasswordHash(passwordHash) {
    return (
        typeof passwordHash === "string" &&
        PASSWORD_HASH_PATTERN.test(passwordHash)
    );
}

/**
 * Identifica um commit cujo resultado final permaneceu desconhecido depois dos
 * retries internos do driver.
 *
 * @param {unknown} error Erro MongoDB ou double fiel.
 * @returns {boolean} Verdadeiro apenas para `UnknownTransactionCommitResult`.
 */
function isUnknownTransactionCommitResult(error) {
    return (
        typeof error?.hasErrorLabel === "function" &&
        error.hasErrorLabel("UnknownTransactionCommitResult")
    );
}

/**
 * Reconcilia um registo depois de um resultado de commit desconhecido.
 *
 * Só devolve sucesso quando encontra exatamente o utilizador e a sessão/token
 * criados pela callback desta tentativa. Um utilizador anterior com o mesmo
 * email nunca satisfaz a comparação de `_id` e `tokenHash`.
 *
 * @param {string} email Email normalizado.
 * @param {{ user: Record<string, unknown>, token: string } | null} attempted Resultado construído antes do commit.
 * @returns {Promise<null | { user: ReturnType<typeof toPublicUser>, token: string }>} Resultado reconciliado ou null.
 */
async function reconcileUnknownRegistration(email, attempted) {
    if (!attempted) return null;

    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user || String(user._id) !== String(attempted.user._id)) {
        return null;
    }

    const session = await db.collection("sessions").findOne({
        userId: user._id,
        tokenHash: hashToken(attempted.token),
        expiresAt: { $gt: new Date() },
    });

    return session
        ? { user: toPublicUser(user), token: attempted.token }
        : null;
}

/**
 * Verifica se a outbox dev-only separada de tokens de recuperação está ativa.
 *
 * @returns {boolean} Verdadeiro apenas em ambientes não produtivos com a flag explícita ativa.
 */
function isDevResetOutboxEnabled() {
    return (
        (process.env[DEV_RESET_OUTBOX_FLAG] === "true" &&
            process.env.NODE_ENV !== "production") ||
        isDemoMailboxEnvironmentEnabled(process.env)
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
    // A derivação é CPU-bound e determinística para esta tentativa; calculá-la
    // antes reduz o tempo da transação e evita refazê-la num retry transiente.
    const passwordHash = await hashPassword(password);
    let attemptedRegistration = null;
    try {
        return await runInTransaction(async ({ db, session }) => {
            const now = new Date();
            const document = {
                name,
                email,
                passwordHash,
                role: "user",
                accountStatus: "active",
                parentalMaxAgeRating: 18,
                createdAt: now,
                updatedAt: now,
            };
            const result = await db
                .collection("users")
                .insertOne(document, { session });
            const user = { ...document, _id: result.insertedId };

            const token = await createSession(user, {
                db,
                session,
                ensureIndexes: false,
            });
            attemptedRegistration = { user, token };

            return {
                user: toPublicUser(user),
                token,
            };
        });
    } catch (error) {
        if (isUnknownTransactionCommitResult(error)) {
            const reconciled = await reconcileUnknownRegistration(
                email,
                attemptedRegistration,
            );
            if (reconciled) return reconciled;
        }

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
 * @param {{ onAuthenticated?: () => Promise<void>, passwordVerifier?: typeof verifyPassword }} [options] Hooks internos; o verifier injetável permite observar o contrato criptográfico em testes isolados.
 * @returns {Promise<{ user: ReturnType<typeof toPublicUser>, token: string }>} Utilizador público e token de sessão.
 */
export async function loginUser(input, options = {}) {
    const email = assertValidEmail(input?.email);
    const password =
        typeof input?.password === "string" ? input.password : "";
    const db = await getDb();
    const user = await db.collection("users").findOne({ email });
    const passwordHasSafeLength =
        password.length >= 10 && password.length <= 128;
    const accountCanLogin = canLogin(user);
    const userHasSupportedPasswordHash =
        accountCanLogin && hasSupportedPasswordHash(user.passwordHash);
    const passwordVerifier = options.passwordVerifier ?? verifyPassword;

    // Uma tentativa com email válido executa sempre exatamente uma derivação
    // limitada. O hash real só é usado quando a conta pode autenticar.
    const passwordMatches = await passwordVerifier(
        passwordHasSafeLength ? password : DUMMY_LOGIN_PASSWORD,
        userHasSupportedPasswordHash
            ? user.passwordHash
            : DUMMY_LOGIN_PASSWORD_HASH,
    );

    if (
        !accountCanLogin ||
        !userHasSupportedPasswordHash ||
        !passwordHasSafeLength ||
        !passwordMatches
    ) {
        throw new HttpError(
            401,
            "Credenciais inválidas.",
            undefined,
            "AUTH_INVALID_CREDENTIALS",
        );
    }

    await options.onAuthenticated?.();
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
    const resetToken = createOpaqueToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RESET_TTL_MS);

    await db.collection("password_reset_tokens").insertOne({
        ...(user ? { userId: user._id } : {}),
        dummy: !user,
        tokenHash: hashToken(resetToken),
        usedAt: null,
        createdAt: now,
        expiresAt,
    });

    if (user) {
        await writeDevResetOutbox(db, {
            email,
            userId: user._id,
            resetToken,
            expiresAt,
            now,
        });
    }

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
    const token = typeof input?.token === "string" ? input.token.trim() : "";
    const password = assertValidPassword(input?.password);

    if (!isOpaqueToken(token)) {
        throw new HttpError(400, "Código de recuperação inválido ou expirado.");
    }

    const tokenHash = hashToken(token);
    const lookupDb = await getDb();
    const availableReset = await lookupDb
        .collection("password_reset_tokens")
        .findOne(
            {
                tokenHash,
                dummy: { $ne: true },
                usedAt: null,
                expiresAt: { $gt: new Date() },
            },
            { projection: { _id: 1 } },
        );

    if (!availableReset) {
        throw new HttpError(
            400,
            "Código de recuperação inválido ou expirado.",
            undefined,
            "RESET_TOKEN_INVALID",
        );
    }

    // O trabalho CPU-intensivo só acontece depois de provar que o token existe.
    const passwordHash = await hashPassword(password);

    await runInTransaction(async ({ db, session }) => {
        const now = new Date();
        const tokenCollection = db.collection("password_reset_tokens");
        const claimedResult = await tokenCollection.findOneAndUpdate(
            {
                tokenHash,
                dummy: { $ne: true },
                usedAt: null,
                expiresAt: { $gt: now },
            },
            { $set: { usedAt: now } },
            { session, returnDocument: "before" },
        );
        const reset = claimedResult?.value ?? claimedResult;

        if (!reset) {
            throw new HttpError(
                400,
                "Código de recuperação inválido ou expirado.",
                undefined,
                "RESET_TOKEN_INVALID",
            );
        }

        const userResult = await db.collection("users").updateOne(
            { _id: reset.userId },
            { $set: { passwordHash, updatedAt: now } },
            { session },
        );

        if (userResult.matchedCount !== 1) {
            throw new HttpError(
                400,
                "Código de recuperação inválido ou expirado.",
                undefined,
                "RESET_TOKEN_INVALID",
            );
        }

        await tokenCollection.updateMany(
            { userId: reset.userId, usedAt: null },
            { $set: { usedAt: now, revokedAt: now } },
            { session },
        );
        await db
            .collection("sessions")
            .deleteMany({ userId: reset.userId }, { session });
    });

    return { message: "Password atualizada com sucesso." };
}
