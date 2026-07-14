/**
 * @file Testes unitários dos controlos de CSRF, rate limit e reset atómico.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { env, isProduction } from "../../src/config/env.js";
import { getSessionCookieOptions } from "../../src/config/session.js";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import {
    rateLimit,
    releaseRateLimit,
    reserveRateLimit,
} from "../../src/middlewares/rate-limit.middleware.js";
import { resetPassword } from "../../src/modules/auth/auth.service.js";
import { assertValidPassword } from "../../src/modules/auth/auth.validation.js";
import { createNotification } from "../../src/modules/notifications/notifications.service.js";
import { assertDeleteAccountPayload } from "../../src/modules/privacy/privacy.validation.js";
import { HttpError } from "../../src/utils/http-error.js";
import {
    rotateCsrfToken,
    verifyCsrfToken,
} from "../../src/modules/auth/csrf.service.js";
import { createOpaqueToken, hashToken } from "../../src/modules/auth/token.js";

afterEach(() => {
    setDbForTests(null);
});

test("CSRF roda token, persiste apenas hash e valida a sessão", async () => {
    const sessionToken = createOpaqueToken();
    const session = {
        tokenHash: hashToken(sessionToken),
        expiresAt: new Date("2999-01-01T00:00:00.000Z"),
    };
    const db = {
        collection(name) {
            assert.equal(name, "sessions");
            return {
                async updateOne(_filter, update) {
                    Object.assign(session, update.$set);
                    const push = update.$push?.csrfTokenHashes;
                    if (push) {
                        session.csrfTokenHashes = [
                            ...(session.csrfTokenHashes ?? []),
                            ...(push.$each ?? []),
                        ].slice(push.$slice ?? 0);
                    }
                    return { matchedCount: 1, modifiedCount: 1 };
                },
                async findOne() {
                    return session;
                },
            };
        },
    };
    setDbForTests(db);

    const csrfToken = await rotateCsrfToken(sessionToken);

    assert.equal(typeof csrfToken, "string");
    assert.equal("csrfToken" in session, false);
    assert.equal(session.csrfTokenHash, hashToken(csrfToken));
    assert.equal(await verifyCsrfToken(sessionToken, csrfToken), true);
    assert.equal(await verifyCsrfToken(sessionToken, createOpaqueToken()), false);
});

test("CSRF conserva um conjunto curto de tokens para tabs concorrentes", async () => {
    const sessionToken = createOpaqueToken();
    const session = {
        tokenHash: hashToken(sessionToken),
        expiresAt: new Date("2999-01-01T00:00:00.000Z"),
        csrfTokenHashes: [],
    };
    setDbForTests({
        collection() {
            return {
                async updateOne(_filter, update) {
                    Object.assign(session, update.$set);
                    const push = update.$push.csrfTokenHashes;
                    session.csrfTokenHashes = [
                        ...session.csrfTokenHashes,
                        ...push.$each,
                    ].slice(push.$slice);
                    return { modifiedCount: 1 };
                },
                async findOne() {
                    return session;
                },
            };
        },
    });

    const firstToken = await rotateCsrfToken(sessionToken);
    const secondToken = await rotateCsrfToken(sessionToken);

    assert.equal(await verifyCsrfToken(sessionToken, firstToken), true);
    assert.equal(await verifyCsrfToken(sessionToken, secondToken), true);
    assert.equal(session.csrfTokenHashes.length, 2);
    assert.equal("csrfToken" in session, false);
});

test("password e cookie partilham limites seguros", () => {
    assert.equal(assertValidPassword("a".repeat(128)).length, 128);
    assert.throws(() => assertValidPassword("a".repeat(129)), /128/u);
    assert.equal(
        assertDeleteAccountPayload({
            confirmation: "ELIMINAR CONTA",
            password: "a".repeat(128),
        }).password.length,
        128,
    );
    assert.throws(
        () =>
            assertDeleteAccountPayload({
                confirmation: "ELIMINAR CONTA",
                password: "a".repeat(129),
            }),
        /password atual/u,
    );
    assert.equal(
        getSessionCookieOptions().secure,
        isProduction || env.forceHttps,
    );
});

test("qualquer erro 5xx usa mensagem pública genérica", () => {
    const state = {};
    let logLine = "";
    const originalConsoleError = console.error;
    const response = {
        status(statusCode) {
            state.statusCode = statusCode;
            return this;
        },
        json(body) {
            state.body = body;
            return this;
        },
    };

    try {
        console.error = (line) => {
            logLine = String(line);
        };
        errorHandler(
            { name: "DependencyError", statusCode: 503, message: "host interno" },
            {
                id: "request-test",
                method: "GET",
                path: "/api/test",
                originalUrl: "/api/test?token=nao-registar",
            },
            response,
            () => {},
        );
    } finally {
        console.error = originalConsoleError;
    }

    assert.equal(state.statusCode, 503);
    assert.equal(state.body.code, "INTERNAL_ERROR");
    assert.equal(state.body.message, "Erro interno do servidor.");
    assert.equal(JSON.stringify(state.body).includes("host interno"), false);
    assert.match(logLine, /"path":"\/api\/test"/u);
    assert.doesNotMatch(logLine, /nao-registar|token=/u);
});

test("integração pausada preserva o código operacional 503 estável", () => {
    const state = {};
    const response = {
        status(statusCode) {
            state.statusCode = statusCode;
            return this;
        },
        json(body) {
            state.body = body;
            return this;
        },
    };
    const originalConsoleError = console.error;

    try {
        console.error = () => {};
        errorHandler(
            new HttpError(
                503,
                "Integração temporariamente indisponível.",
                undefined,
                "INTEGRATION_DISABLED",
            ),
            { id: "request-test", method: "POST", path: "/api/payments" },
            response,
            () => {},
        );
    } finally {
        console.error = originalConsoleError;
    }

    assert.equal(state.statusCode, 503);
    assert.equal(state.body.code, "INTEGRATION_DISABLED");
    assert.equal(
        state.body.message,
        "Integração temporariamente indisponível.",
    );
});

test("rate limit devolve 429 e Retry-After depois do limite", async () => {
    let count = 0;
    const db = {
        collection(name) {
            assert.equal(name, "rate_limit_counters");
            return {
                async findOneAndUpdate() {
                    count += 1;
                    return { count };
                },
            };
        },
    };
    setDbForTests(db);
    const middleware = rateLimit({
        scope: "test",
        limit: 2,
        windowMs: 60_000,
        key: () => "subject",
    });
    const headers = new Map();
    const res = {
        setHeader(name, value) {
            headers.set(name, value);
        },
    };

    async function invoke() {
        return new Promise((resolve) => {
            middleware({ ip: "127.0.0.1" }, res, (error) => resolve(error));
        });
    }

    assert.equal(await invoke(), undefined);
    assert.equal(await invoke(), undefined);
    const error = await invoke();
    assert.equal(error.statusCode, 429);
    assert.equal(error.code, "RATE_LIMITED");
    assert.ok(Number(headers.get("Retry-After")) >= 1);
});

test("limite por email conserva falhas e liberta logins bem-sucedidos", async () => {
    let count = 0;
    setDbForTests({
        collection() {
            return {
                async findOneAndUpdate() {
                    count += 1;
                    return { count };
                },
                async updateOne(_filter, update) {
                    count += Number(update.$inc?.count ?? 0);
                    return { modifiedCount: 1 };
                },
            };
        },
    });

    for (let index = 0; index < 8; index += 1) {
        const successfulAttempt = await reserveRateLimit({
            scope: "auth:login:email-failures",
            subject: "user@example.test",
            limit: 5,
            windowMs: 60_000,
        });
        assert.equal(successfulAttempt.count, 1);
        await releaseRateLimit(successfulAttempt);
    }

    let lastFailure;
    for (let index = 0; index < 6; index += 1) {
        lastFailure = await reserveRateLimit({
            scope: "auth:login:email-failures",
            subject: "user@example.test",
            limit: 5,
            windowMs: 60_000,
        });
    }

    assert.equal(lastFailure.count, 6);
    assert.ok(lastFailure.count > lastFailure.limit);
});

test("consentimento bloqueia alertas opcionais mas preserva transacionais", async () => {
    const userId = new ObjectId();
    const notifications = [];
    setDbForTests({
        collection(name) {
            if (name === "notification_preferences") {
                return {
                    async findOne() {
                        return {
                            settings: {
                                inApp: false,
                                email: false,
                                continueWatching: true,
                            },
                        };
                    },
                };
            }

            if (name === "user_consents") {
                return {
                    async findOne() {
                        return {
                            consents: { operationalNotifications: false },
                        };
                    },
                };
            }

            if (name === "notifications") {
                return {
                    async findOne() {
                        return null;
                    },
                    async insertOne(document) {
                        const insertedId = new ObjectId();
                        notifications.push({ ...document, _id: insertedId });
                        return { insertedId };
                    },
                };
            }

            throw new Error(`Coleção inesperada: ${name}`);
        },
    });

    const optional = await createNotification(String(userId), {
        type: "continue_watching",
        title: "Continua a ver",
        message: "Ainda tens um conteúdo por terminar.",
    });
    const transactional = await createNotification(String(userId), {
        type: "payment_failed",
        title: "Pagamento recusado",
        message: "Não foi possível concluir o pagamento.",
    });

    assert.equal(optional.skipped, true);
    assert.equal(transactional.skipped, false);
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].type, "payment_failed");
});

test("dois resets concorrentes consomem o token uma única vez e revogam sessões", async () => {
    const resetToken = createOpaqueToken();
    const userId = new ObjectId();
    const reset = {
        _id: new ObjectId(),
        userId,
        tokenHash: hashToken(resetToken),
        usedAt: null,
        expiresAt: new Date("2999-01-01T00:00:00.000Z"),
    };
    const user = { _id: userId, passwordHash: "old" };
    const sessions = [{ userId }, { userId }];
    const db = {
        async runInTransaction(work) {
            return work({ db: this, session: { test: true } });
        },
        collection(name) {
            if (name === "password_reset_tokens") {
                return {
                    async findOne() {
                        return reset.usedAt ? null : { _id: reset._id };
                    },
                    async findOneAndUpdate() {
                        if (reset.usedAt) return null;
                        const previous = { ...reset };
                        reset.usedAt = new Date();
                        return previous;
                    },
                    async updateMany() {
                        return { modifiedCount: 0 };
                    },
                };
            }

            if (name === "users") {
                return {
                    async updateOne(_filter, update) {
                        user.passwordHash = update.$set.passwordHash;
                        return { matchedCount: 1, modifiedCount: 1 };
                    },
                };
            }

            if (name === "sessions") {
                return {
                    async deleteMany() {
                        const deletedCount = sessions.length;
                        sessions.length = 0;
                        return { deletedCount };
                    },
                };
            }

            throw new Error(`Coleção inesperada: ${name}`);
        },
    };
    setDbForTests(db);

    const results = await Promise.allSettled([
        resetPassword({ token: resetToken, password: "password-nova-123" }),
        resetPassword({ token: resetToken, password: "password-outra-456" }),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.equal(sessions.length, 0);
    assert.notEqual(user.passwordHash, "old");
});
