/**
 * @file Contratos HTTP isolados de liveness/readiness com DB in-memory.
 */

import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { setDbForTests } from "../../src/config/database.js";
import { startTestServer } from "../helpers/test-server.js";

let mode;
let topologyProbeCalls;
let collectionCalls;
let receivedBudgets;
let testServer;

const healthDb = {
    async assertTransactionSupport(maxTimeMS) {
        topologyProbeCalls += 1;
        receivedBudgets.push(maxTimeMS);

        if (mode === "unavailable") {
            throw new Error("falha MongoDB interna que nunca deve sair no HTTP");
        }

        if (mode === "blocked") {
            return new Promise(() => {});
        }
    },

    async command() {
        throw new Error("readiness não pode degradar para um ping simples");
    },

    collection() {
        collectionCalls += 1;
        throw new Error("health não pode consultar sessões ou coleções");
    },
};

before(async () => {
    setDbForTests(healthDb);
    testServer = await startTestServer();
});

beforeEach(() => {
    mode = "healthy";
    topologyProbeCalls = 0;
    collectionCalls = 0;
    receivedBudgets = [];
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }
    setDbForTests(null);
});

test("GET /health/live permanece 200 com DB indisponível e cookie opaco", async () => {
    mode = "unavailable";

    const response = await fetch(`${testServer.baseUrl}/health/live`, {
        headers: { Cookie: "faithflix_session=valor-opaco" },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.live, true);
    assert.equal(body.dependencies.database, "not_checked");
    assert.equal(topologyProbeCalls, 0);
    assert.equal(collectionCalls, 0);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.ok(response.headers.get("x-request-id"));
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
});

test("GET /health/ready devolve 503 seguro quando MongoDB falha", async () => {
    mode = "unavailable";

    const response = await fetch(`${testServer.baseUrl}/health/ready`, {
        headers: { Cookie: "faithflix_session=valor-opaco" },
    });
    const body = await response.json();
    const serialized = JSON.stringify(body);

    assert.equal(response.status, 503);
    assert.equal(body.status, "unavailable");
    assert.equal(body.ready, false);
    assert.equal(body.dependencies.database, "unavailable");
    assert.equal(topologyProbeCalls, 1);
    assert.equal(collectionCalls, 0);
    assert.deepEqual(receivedBudgets, [500]);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.doesNotMatch(serialized, /mongodb|falha|error|uri|details/iu);
});

test("GET /health é alias exato de readiness indisponível", async () => {
    mode = "unavailable";

    const response = await fetch(`${testServer.baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.ready, false);
    assert.equal(body.dependencies.database, "unavailable");
    assert.equal(topologyProbeCalls, 1);
    assert.equal(collectionCalls, 0);
});

test("GET /health/ready devolve 200 quando o probe transacional responde", async () => {
    const response = await fetch(`${testServer.baseUrl}/health/ready`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.ready, true);
    assert.equal(body.dependencies.database, "ok");
    assert.equal(topologyProbeCalls, 1);
    assert.equal(collectionCalls, 0);
    assert.deepEqual(receivedBudgets, [500]);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.ok(response.headers.get("x-request-id"));
});

test("GET /health/ready termina perto do deadline total de 500 ms", async () => {
    mode = "blocked";
    const startedAt = performance.now();

    const response = await fetch(`${testServer.baseUrl}/health/ready`);
    const durationMs = performance.now() - startedAt;
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.ready, false);
    assert.equal(topologyProbeCalls, 1);
    assert.equal(collectionCalls, 0);
    assert.deepEqual(receivedBudgets, [500]);
    assert.ok(durationMs >= 450, `deadline terminou cedo: ${durationMs}ms`);
    assert.ok(durationMs < 1_500, `deadline excedido: ${durationMs}ms`);
});
