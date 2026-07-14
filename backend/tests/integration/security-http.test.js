/**
 * @file Integração HTTP dos limites de origem, CSRF e headers defensivos.
 *
 * A suite injeta toda a persistência necessária em memória. Nunca consulta nem
 * escreve na configuração MongoDB do ambiente local.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { sessionConfig } from "../../src/config/session.js";
import { createOpaqueToken, hashToken } from "../../src/modules/auth/token.js";
import { startTestServer } from "../helpers/test-server.js";

const ALLOWED_ORIGIN = "http://127.0.0.1:5181";
const sessionToken = createOpaqueToken();
const userId = new ObjectId("64f100000000000000000099");

let testServer;
let sessionDocument;
const rateLimitCounters = new Map();
const passwordResetTokens = [];

/**
 * Compara o subset de filtros MongoDB usado pela resolução/rotação da sessão.
 *
 * @param {Record<string, unknown>} row Documento em memória.
 * @param {Record<string, unknown>} query Filtro recebido.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, query) {
    return Object.entries(query).every(([key, expected]) => {
        const actual = row[key];

        if (expected instanceof ObjectId) {
            return String(actual) === String(expected);
        }

        if (expected && typeof expected === "object" && "$gt" in expected) {
            return actual > expected.$gt;
        }

        return actual === expected;
    });
}

/**
 * Cria persistência mínima para uma sessão autenticada.
 *
 * @returns {{ collection: (name: string) => Record<string, Function> }} DB fake.
 */
function createSecurityDb() {
    sessionDocument = {
        _id: new ObjectId(),
        userId,
        tokenHash: hashToken(sessionToken),
        expiresAt: new Date("2999-01-01T00:00:00.000Z"),
    };
    const user = {
        _id: userId,
        name: "Utilizador Segurança",
        email: "security@example.test",
        role: "user",
        accountStatus: "active",
    };

    return {
        collection(name) {
            if (name === "sessions") {
                return {
                    async findOne(query) {
                        return sessionDocument && matches(sessionDocument, query)
                            ? sessionDocument
                            : null;
                    },
                    async updateOne(query, update) {
                        if (!sessionDocument || !matches(sessionDocument, query)) {
                            return { matchedCount: 0, modifiedCount: 0 };
                        }

                        Object.assign(sessionDocument, update.$set ?? {});
                        const push = update.$push?.csrfTokenHashes;
                        if (push) {
                            sessionDocument.csrfTokenHashes = [
                                ...(sessionDocument.csrfTokenHashes ?? []),
                                ...(push.$each ?? []),
                            ].slice(push.$slice ?? 0);
                        }
                        return { matchedCount: 1, modifiedCount: 1 };
                    },
                    async deleteOne(query) {
                        if (!sessionDocument || !matches(sessionDocument, query)) {
                            return { deletedCount: 0 };
                        }

                        sessionDocument = null;
                        return { deletedCount: 1 };
                    },
                };
            }

            if (name === "users") {
                return {
                    async findOne(query) {
                        return matches(user, query) ? user : null;
                    },
                };
            }

            if (name === "rate_limit_counters") {
                return {
                    async findOneAndUpdate(filter) {
                        const key = [
                            filter.scope,
                            filter.keyHash,
                            filter.windowStart.toISOString(),
                        ].join(":");
                        const count = (rateLimitCounters.get(key) ?? 0) + 1;
                        rateLimitCounters.set(key, count);
                        return { count };
                    },
                };
            }

            if (name === "password_reset_tokens") {
                return {
                    async insertOne(document) {
                        const insertedId = new ObjectId();
                        passwordResetTokens.push({ ...document, _id: insertedId });
                        return { insertedId };
                    },
                };
            }

            throw new Error(`Coleção inesperada no teste HTTP: ${name}`);
        },
    };
}

before(async () => {
    setDbForTests(createSecurityDb());
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }

    setDbForTests(null);
});

test("API aplica headers defensivos sem expor tecnologia", async () => {
    const response = await fetch(`${testServer.baseUrl}/api`);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.match(
        response.headers.get("content-security-policy") ?? "",
        /default-src 'none'/u,
    );
});

test("browser autenticado exige origin allowlisted e CSRF ligado à sessão", async () => {
    const cookie = `${sessionConfig.cookieName}=${sessionToken}`;
    const tokenResponse = await fetch(
        `${testServer.baseUrl}/api/session/csrf-token`,
        { headers: { Cookie: cookie } },
    );
    const tokenBody = await tokenResponse.json();

    assert.equal(tokenResponse.status, 200);
    assert.equal(tokenResponse.headers.get("cache-control"), "no-store");
    assert.equal(typeof tokenBody.csrfToken, "string");
    assert.equal("csrfToken" in sessionDocument, false);
    assert.equal(sessionDocument.csrfTokenHash, hashToken(tokenBody.csrfToken));

    const missingTokenResponse = await fetch(
        `${testServer.baseUrl}/api/session/logout`,
        {
            method: "POST",
            headers: {
                Cookie: cookie,
                Origin: ALLOWED_ORIGIN,
                "Sec-Fetch-Site": "same-site",
            },
        },
    );
    const missingTokenBody = await missingTokenResponse.json();

    assert.equal(missingTokenResponse.status, 403);
    assert.equal(missingTokenBody.code, "CSRF_INVALID");
    assert.equal(typeof missingTokenBody.requestId, "string");

    const missingMetadataResponse = await fetch(
        `${testServer.baseUrl}/api/session/logout`,
        {
            method: "POST",
            headers: { Cookie: cookie },
        },
    );
    const missingMetadataBody = await missingMetadataResponse.json();

    assert.equal(missingMetadataResponse.status, 403);
    assert.equal(missingMetadataBody.code, "CSRF_INVALID");

    const foreignOriginResponse = await fetch(
        `${testServer.baseUrl}/api/session/logout`,
        {
            method: "POST",
            headers: {
                Cookie: cookie,
                Origin: "https://attacker.example",
                "Sec-Fetch-Site": "cross-site",
                "X-CSRF-Token": tokenBody.csrfToken,
            },
        },
    );
    const foreignOriginBody = await foreignOriginResponse.json();

    assert.equal(foreignOriginResponse.status, 403);
    assert.equal(foreignOriginBody.code, "ORIGIN_FORBIDDEN");
    assert.ok(sessionDocument);

    const logoutResponse = await fetch(
        `${testServer.baseUrl}/api/session/logout`,
        {
            method: "POST",
            headers: {
                Cookie: cookie,
                Origin: ALLOWED_ORIGIN,
                "Sec-Fetch-Site": "same-site",
                "X-CSRF-Token": tokenBody.csrfToken,
            },
        },
    );

    assert.equal(logoutResponse.status, 204);
    assert.equal(sessionDocument, null);
});

test("recuperação limita cumulativamente email e IP", async () => {
    async function forgot(email) {
        return fetch(`${testServer.baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
    }

    rateLimitCounters.clear();
    passwordResetTokens.length = 0;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        assert.equal((await forgot("same@example.test")).status, 200);
    }
    const emailLimited = await forgot("same@example.test");
    assert.equal(emailLimited.status, 429);
    assert.equal((await emailLimited.json()).code, "RATE_LIMITED");

    rateLimitCounters.clear();
    for (let attempt = 0; attempt < 10; attempt += 1) {
        assert.equal(
            (await forgot(`recover-${attempt}@example.test`)).status,
            200,
        );
    }
    const ipLimited = await forgot("recover-10@example.test");
    assert.equal(ipLimited.status, 429);
    assert.equal((await ipLimited.json()).code, "RATE_LIMITED");
    assert.ok(Number(ipLimited.headers.get("retry-after")) >= 1);
    assert.equal(passwordResetTokens.length, 13);
    assert.ok(
        passwordResetTokens.every(
            (token) =>
                token.dummy === true &&
                !("userId" in token) &&
                !("email" in token),
        ),
    );
});
