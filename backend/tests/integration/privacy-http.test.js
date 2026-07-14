/**
 * @file Integração HTTP das jornadas de privacidade e consentimentos.
 *
 * A suite arranca a aplicação Express numa porta loopback aleatória e injeta uma
 * persistência transacional em memória. Não consulta MongoDB, não usa dados reais
 * e não altera a configuração local. O objetivo é provar a composição entre
 * sessão, CSRF, routers, controllers, services, envelopes e cookie de sessão.
 */

import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { sessionConfig } from "../../src/config/session.js";
import { hashPassword } from "../../src/modules/auth/auth.password.js";
import { createOpaqueToken, hashToken } from "../../src/modules/auth/token.js";
import { startTestServer } from "../helpers/test-server.js";

const ALLOWED_ORIGIN = "http://127.0.0.1:5181";
const CURRENT_PASSWORD = "password-segura-123";
const USER_ID = new ObjectId("64f100000000000000000501");
const OTHER_USER_ID = new ObjectId("64f100000000000000000502");

let testServer;
let sessionToken;
let state = {};

/**
 * Compara ids MongoDB, datas e escalares sem coerções permissivas.
 *
 * @param {unknown} actual Valor persistido.
 * @param {unknown} expected Valor do filtro.
 * @returns {boolean} Verdadeiro quando os valores representam a mesma chave.
 */
function sameValue(actual, expected) {
    if (actual instanceof ObjectId || expected instanceof ObjectId) {
        return String(actual) === String(expected);
    }

    if (actual instanceof Date || expected instanceof Date) {
        return actual instanceof Date
            && expected instanceof Date
            && actual.getTime() === expected.getTime();
    }

    return actual === expected;
}

/**
 * Avalia um valor contra os operadores MongoDB usados pelo sistema auditado.
 *
 * @param {unknown} actual Valor persistido.
 * @param {unknown} expected Condição do filtro.
 * @returns {boolean} Resultado da condição.
 */
function matchesValue(actual, expected) {
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$gt" in expected) return actual > expected.$gt;
        if ("$in" in expected) {
            return expected.$in.some((entry) => sameValue(actual, entry));
        }
        if ("$exists" in expected) {
            return expected.$exists === (actual !== undefined);
        }
    }

    return sameValue(actual, expected);
}

/**
 * Aplica o subset de filtros usado pelas rotas de privacidade.
 *
 * @param {Record<string, unknown>} document Documento candidato.
 * @param {Record<string, unknown>} [query={}] Filtro MongoDB simplificado.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(document, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") {
            return expected.some((condition) => matches(document, condition));
        }

        return matchesValue(document[key], expected);
    });
}

/**
 * Constrói os campos literais seguros de um filtro de upsert.
 *
 * @param {Record<string, unknown>} filter Filtro recebido.
 * @returns {Record<string, unknown>} Campos que podem iniciar o documento.
 */
function fieldsFromFilter(filter) {
    return Object.fromEntries(
        Object.entries(filter).filter(
            ([key, value]) => !key.startsWith("$")
                && !(value && typeof value === "object"
                    && !(value instanceof ObjectId)
                    && !(value instanceof Date)
                    && Object.keys(value).some((entry) => entry.startsWith("$"))),
        ),
    );
}

/**
 * Aplica operadores de update suficientes para as jornadas auditadas.
 *
 * @param {Record<string, unknown>} document Documento mutável.
 * @param {Record<string, unknown>} update Operadores MongoDB.
 * @param {boolean} inserted Indica se o documento nasceu neste upsert.
 * @returns {void}
 */
function applyUpdate(document, update, inserted = false) {
    if (inserted) Object.assign(document, update.$setOnInsert ?? {});
    Object.assign(document, update.$set ?? {});

    for (const key of Object.keys(update.$unset ?? {})) {
        delete document[key];
    }

    for (const [key, amount] of Object.entries(update.$inc ?? {})) {
        document[key] = Number(document[key] ?? 0) + amount;
    }

    for (const [key, push] of Object.entries(update.$push ?? {})) {
        const current = Array.isArray(document[key]) ? document[key] : [];
        const values = Array.isArray(push?.$each) ? push.$each : [push];
        const next = [...current, ...values];
        document[key] = Number.isInteger(push?.$slice)
            ? next.slice(push.$slice)
            : next;
    }
}

/**
 * Devolve uma coleção MongoDB em memória com os métodos usados pelas services.
 *
 * @param {string} name Nome da coleção.
 * @returns {Record<string, Function>} Double mutável da coleção.
 */
function collection(name) {
    state[name] ??= [];
    const rows = state[name];

    return {
        async createIndex() {},

        async findOne(query) {
            return rows.find((document) => matches(document, query)) ?? null;
        },

        find(query = {}) {
            let result = rows.filter((document) => matches(document, query));

            return {
                sort(sort = {}) {
                    const sortEntries = Object.entries(sort);
                    result = result.toSorted((left, right) => {
                        for (const [key, direction] of sortEntries) {
                            if (left[key] < right[key]) return -1 * direction;
                            if (left[key] > right[key]) return direction;
                        }
                        return 0;
                    });
                    return this;
                },
                async toArray() {
                    return result.map((document) => ({ ...document }));
                },
            };
        },

        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            return { insertedId };
        },

        async updateOne(filter, update, options = {}) {
            let document = rows.find((candidate) => matches(candidate, filter));
            let inserted = false;

            if (!document && options.upsert) {
                document = { ...fieldsFromFilter(filter), _id: new ObjectId() };
                rows.push(document);
                inserted = true;
            }

            if (!document) return { matchedCount: 0, modifiedCount: 0 };
            applyUpdate(document, update, inserted);
            return {
                matchedCount: inserted ? 0 : 1,
                modifiedCount: 1,
                upsertedCount: inserted ? 1 : 0,
            };
        },

        async updateMany(filter, update) {
            const documents = rows.filter((document) => matches(document, filter));
            for (const document of documents) applyUpdate(document, update);
            return { matchedCount: documents.length, modifiedCount: documents.length };
        },

        async deleteOne(filter) {
            const index = rows.findIndex((document) => matches(document, filter));
            if (index === -1) return { deletedCount: 0 };
            rows.splice(index, 1);
            return { deletedCount: 1 };
        },

        async deleteMany(filter) {
            const retained = rows.filter((document) => !matches(document, filter));
            const deletedCount = rows.length - retained.length;
            rows.splice(0, rows.length, ...retained);
            return { deletedCount };
        },

        async findOneAndUpdate(filter, update, options = {}) {
            let document = rows.find((candidate) => matches(candidate, filter));
            const inserted = !document;

            if (!document && options.upsert) {
                document = { ...fieldsFromFilter(filter), _id: new ObjectId() };
                rows.push(document);
            }

            if (!document) return null;
            applyUpdate(document, update, inserted);
            return document;
        },

        async countDocuments(filter = {}) {
            return rows.filter((document) => matches(document, filter)).length;
        },
    };
}

const privacyDb = {
    collection,

    /**
     * Mantém explícita a fronteira transacional chamada pela aplicação.
     *
     * @param {(context: { db: object, session: object }) => Promise<unknown>} work Unidade transacional.
     * @returns {Promise<unknown>} Resultado da unidade.
     */
    runInTransaction(work) {
        return work({ db: privacyDb, session: { kind: "memory-transaction" } });
    },
};

/**
 * Repõe fixtures independentes antes de cada cenário HTTP.
 *
 * @returns {Promise<void>} Termina depois de gerar o hash da password.
 */
async function resetState() {
    sessionToken = createOpaqueToken();
    const passwordHash = await hashPassword(CURRENT_PASSWORD);
    const otherSessionToken = createOpaqueToken();

    state = {
        users: [
            {
                _id: USER_ID,
                name: "Utilizador Privacidade",
                email: "privacy@example.test",
                role: "user",
                accountStatus: "active",
                parentalMaxAgeRating: 16,
                passwordHash,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            {
                _id: OTHER_USER_ID,
                name: "Outro Utilizador",
                email: "other@example.test",
                role: "user",
                accountStatus: "active",
                passwordHash,
            },
        ],
        sessions: [
            {
                _id: new ObjectId(),
                userId: USER_ID,
                tokenHash: hashToken(sessionToken),
                expiresAt: new Date("2999-01-01T00:00:00.000Z"),
            },
            {
                _id: new ObjectId(),
                userId: OTHER_USER_ID,
                tokenHash: hashToken(otherSessionToken),
                expiresAt: new Date("2999-01-01T00:00:00.000Z"),
            },
        ],
        playback_progress: [
            {
                _id: new ObjectId(),
                userId: USER_ID,
                contentId: new ObjectId(),
                progressSeconds: 120,
                sessionToken: "internal-value",
                createdAt: new Date("2026-01-02T00:00:00.000Z"),
            },
            {
                _id: new ObjectId(),
                userId: OTHER_USER_ID,
                progressSeconds: 30,
            },
        ],
        user_consents: [
            {
                _id: new ObjectId(),
                userId: USER_ID,
                version: "faithflix-privacy-v1",
                consents: {
                    personalizedRecommendations: false,
                    operationalNotifications: true,
                    anonymousMetrics: false,
                },
                updatedAt: new Date("2026-01-03T00:00:00.000Z"),
            },
        ],
        user_consent_events: [],
        content_comments: [
            {
                _id: new ObjectId(),
                userId: USER_ID,
                body: "Comentário de teste",
                authorName: "Utilizador Privacidade",
            },
        ],
        subscriptions: [{ _id: new ObjectId(), userId: USER_ID, status: "active" }],
        payment_attempts: [
            {
                _id: new ObjectId(),
                userId: USER_ID,
                email: "privacy@example.test",
                status: "approved",
            },
        ],
        subscription_family_memberships: [
            {
                _id: new ObjectId(),
                ownerUserId: USER_ID,
                invitedEmail: "member@example.test",
                status: "pending",
                createdAt: new Date("2026-01-04T00:00:00.000Z"),
            },
        ],
        charity_memberships: [
            { _id: new ObjectId(), userId: USER_ID, charityId: new ObjectId() },
        ],
        billing_customer_locks: [{ _id: USER_ID, userId: USER_ID }],
        password_reset_tokens: [{ _id: new ObjectId(), userId: USER_ID }],
        password_reset_dev_outbox: [
            { _id: new ObjectId(), email: "privacy@example.test" },
        ],
        notification_preferences: [{ _id: new ObjectId(), userId: USER_ID }],
        notifications: [{ _id: new ObjectId(), userId: USER_ID }],
        demo_email_outbox: [{ _id: new ObjectId(), userId: USER_ID }],
        media_preferences: [],
        user_content_lists: [],
        content_ratings: [],
        trials: [],
        privacy_deletion_requests: [],
        rate_limit_counters: [],
    };
}

/**
 * Devolve o cookie opaco da fixture sem o expor em mensagens de erro.
 *
 * @returns {string} Cabeçalho Cookie autenticado.
 */
function sessionCookie() {
    return `${sessionConfig.cookieName}=${sessionToken}`;
}

/**
 * Pede um token CSRF ligado à sessão atual.
 *
 * @returns {Promise<string>} Token bruto usado apenas no pedido seguinte.
 */
async function requestCsrfToken() {
    const response = await fetch(`${testServer.baseUrl}/api/session/csrf-token`, {
        headers: { Cookie: sessionCookie() },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body.csrfToken, "string");
    return body.csrfToken;
}

/**
 * Constrói headers de uma mutação browser autenticada.
 *
 * @param {string} csrfToken Token ligado à sessão.
 * @returns {Record<string, string>} Headers seguros do pedido.
 */
function mutationHeaders(csrfToken) {
    return {
        Cookie: sessionCookie(),
        Origin: ALLOWED_ORIGIN,
        "Sec-Fetch-Site": "same-site",
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
    };
}

before(async () => {
    setDbForTests(privacyDb);
    testServer = await startTestServer();
});

beforeEach(resetState);

after(async () => {
    if (testServer) await testServer.close();
    setDbForTests(null);
});

test("privacidade recusa leitura anónima com envelope privado", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/privacy/export`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.code, "AUTH_REQUIRED");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("GET export atravessa auth e devolve apenas dados próprios sanitizados", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/privacy/export`, {
        headers: { Cookie: sessionCookie() },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(body.export.user.email, "privacy@example.test");
    assert.equal("passwordHash" in body.export.user, false);
    assert.equal(body.export.sections.playback_progress.length, 1);
    assert.equal("sessionToken" in body.export.sections.playback_progress[0], false);
    assert.equal(body.export.sections.subscription_family_memberships.length, 1);
});

test("PUT consents aplica CSRF, persiste o estado e recusa tipos inválidos", async () => {
    const csrfToken = await requestCsrfToken();
    const consents = {
        personalizedRecommendations: true,
        operationalNotifications: false,
        anonymousMetrics: true,
    };
    const response = await fetch(`${testServer.baseUrl}/api/privacy/consents`, {
        method: "PUT",
        headers: mutationHeaders(csrfToken),
        body: JSON.stringify(consents),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), ALLOWED_ORIGIN);
    assert.deepEqual(body.consentState.consents, consents);
    assert.deepEqual(state.user_consents[0].consents, consents);
    assert.equal(state.user_consent_events.length, 1);

    const invalidResponse = await fetch(
        `${testServer.baseUrl}/api/privacy/consents`,
        {
            method: "PUT",
            headers: mutationHeaders(csrfToken),
            body: JSON.stringify({
                ...consents,
                operationalNotifications: "false",
            }),
        },
    );
    const invalidBody = await invalidResponse.json();

    assert.equal(invalidResponse.status, 400);
    assert.match(invalidBody.message, /verdadeiro ou falso/u);
    assert.equal(state.user_consent_events.length, 1);
});

test("DELETE account com password errada não altera dados nem limpa o cookie", async () => {
    const csrfToken = await requestCsrfToken();
    const response = await fetch(`${testServer.baseUrl}/api/privacy/account`, {
        method: "DELETE",
        headers: mutationHeaders(csrfToken),
        body: JSON.stringify({
            confirmation: "ELIMINAR CONTA",
            password: "password-errada-123",
        }),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.code, "CURRENT_PASSWORD_INVALID");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(state.users[0].accountStatus, "active");
    assert.ok(state.users[0].passwordHash);
    assert.equal(state.sessions.length, 2);
    assert.equal(state.privacy_deletion_requests.length, 0);
});

test("DELETE account válido limpa a sessão e confirma efeitos principais", async () => {
    const csrfToken = await requestCsrfToken();
    const response = await fetch(`${testServer.baseUrl}/api/privacy/account`, {
        method: "DELETE",
        headers: mutationHeaders(csrfToken),
        body: JSON.stringify({
            confirmation: "ELIMINAR CONTA",
            password: CURRENT_PASSWORD,
        }),
    });
    const body = await response.json();
    const deletedUser = state.users.find((user) => sameValue(user._id, USER_ID));

    assert.equal(response.status, 200);
    assert.equal(body.deleted, true);
    assert.match(
        response.headers.get("set-cookie") ?? "",
        new RegExp(`^${sessionConfig.cookieName}=;`),
    );
    assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/u);
    assert.equal(deletedUser.accountStatus, "deleted");
    assert.equal(deletedUser.role, "user");
    assert.equal("passwordHash" in deletedUser, false);
    assert.equal(state.sessions.length, 1);
    assert.equal(String(state.sessions[0].userId), String(OTHER_USER_ID));
    assert.equal(state.user_consents.length, 0);
    assert.equal(state.privacy_deletion_requests.length, 1);
    assert.equal(state.content_comments[0].deletedByUser, true);
    assert.equal("userId" in state.content_comments[0], false);
    assert.equal(state.subscriptions[0].status, "canceled");
    assert.equal("email" in state.payment_attempts[0], false);
    assert.equal(
        state.subscription_family_memberships[0].status,
        "removed",
    );
});
