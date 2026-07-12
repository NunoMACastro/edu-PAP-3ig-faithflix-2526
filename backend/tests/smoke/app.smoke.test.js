/**
 * @file Ficheiro `real_dev/backend/tests/smoke/app.smoke.test.js` da implementação real_dev.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { setDbForTests } from "../../src/config/database.js";
import { startTestServer } from "../helpers/test-server.js";

let testServer;

/**
 * Cria a DB mínima de smoke para garantir que nenhum middleware usa MongoDB
 * configurado. O contador existe apenas em memória durante este ficheiro.
 *
 * @returns {{ collection: (name: string) => Record<string, Function> }} DB fake.
 */
function createSmokeDb() {
    const counters = new Map();

    return {
        async command(command) {
            assert.deepEqual(command, { ping: 1, maxTimeMS: 500 });
            return { ok: 1 };
        },

        collection(name) {
            if (name === "rate_limit_counters") {
                return {
                    async findOneAndUpdate(query, update) {
                        const key = `${query.scope}:${query.keyHash}:${query.windowStart.toISOString()}`;
                        const current = counters.get(key) ?? {
                            ...query,
                            ...(update.$setOnInsert ?? {}),
                            count: 0,
                        };
                        current.count += Number(update.$inc?.count ?? 0);
                        counters.set(key, current);
                        return current;
                    },
                };
            }

            return {
                async findOne() {
                    return null;
                },
            };
        },
    };
}

before(async () => {
    setDbForTests(createSmokeDb());
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }

    setDbForTests(null);
});

test("health smoke separa processo vivo de readiness MongoDB", async () => {
    const [liveResponse, readyResponse, aliasResponse] = await Promise.all([
        fetch(`${testServer.baseUrl}/health/live`, {
            headers: { Cookie: "faithflix_session=opaco" },
        }),
        fetch(`${testServer.baseUrl}/health/ready`),
        fetch(`${testServer.baseUrl}/health`),
    ]);
    const [liveBody, readyBody, aliasBody] = await Promise.all([
        liveResponse.json(),
        readyResponse.json(),
        aliasResponse.json(),
    ]);

    assert.equal(liveResponse.status, 200);
    assert.equal(liveBody.live, true);
    assert.equal(liveBody.dependencies.database, "not_checked");
    assert.equal(liveResponse.headers.get("cache-control"), "no-store");
    assert.equal(liveResponse.headers.get("set-cookie"), null);

    assert.equal(readyResponse.status, 200);
    assert.equal(readyBody.ready, true);
    assert.equal(readyBody.dependencies.database, "ok");
    assert.equal(readyResponse.headers.get("cache-control"), "no-store");

    assert.equal(aliasResponse.status, 200);
    assert.equal(aliasBody.ready, true);
    assert.equal(aliasBody.dependencies.database, "ok");
    assert.ok(aliasResponse.headers.get("x-request-id"));
});

test("GET /api devolve informacao da API FaithFlix", async () => {
    const response = await fetch(`${testServer.baseUrl}/api`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.name, "FaithFlix API");
    assert.equal(body.status, "ok");
});

test("GET /api permite origem frontend local configurada", async () => {
    const response = await fetch(`${testServer.baseUrl}/api`, {
        headers: {
            Origin: "http://127.0.0.1:5181",
        },
    });

    assert.equal(response.status, 200);
    assert.equal(
        response.headers.get("access-control-allow-origin"),
        "http://127.0.0.1:5181",
    );
    assert.equal(
        response.headers.get("access-control-allow-credentials"),
        "true",
    );
});

test("rota inexistente devolve 404 em JSON", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/nao-existe`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.message, "Recurso nao encontrado.");
    assert.equal(body.details.path, "/api/nao-existe");
});

test("sessao sem cookie devolve utilizador nulo", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/session/me`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user, null);
});

test("sessao com cookie em formato invalido nao autentica", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/session/me`, {
        headers: {
            Cookie: "faithflix_session=falso",
        },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user, null);
});

test("MF3 protege rotas autenticadas sem cookie de sessao", async () => {
    const [ratingResponse, commentResponse, recommendationsResponse] =
        await Promise.all([
            fetch(`${testServer.baseUrl}/api/ratings/64f000000000000000000001`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ value: 5 }),
            }),
            fetch(`${testServer.baseUrl}/api/comments/64f000000000000000000001`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ body: "Muito bom" }),
            }),
            fetch(`${testServer.baseUrl}/api/recommendations/me`),
        ]);

    assert.equal(ratingResponse.status, 401);
    assert.equal(commentResponse.status, 401);
    assert.equal(recommendationsResponse.status, 401);
});

test("MF3 devolve 400 em negativos publicos antes de consultar dados", async () => {
    const [searchResponse, relatedResponse, catalogResponse] = await Promise.all([
        fetch(`${testServer.baseUrl}/api/search?q=f`),
        fetch(`${testServer.baseUrl}/api/discovery/related/id-invalido`),
        fetch(`${testServer.baseUrl}/api/catalog?limit=100`),
    ]);

    assert.equal(searchResponse.status, 400);
    assert.equal(relatedResponse.status, 400);
    assert.equal(catalogResponse.status, 400);
});
