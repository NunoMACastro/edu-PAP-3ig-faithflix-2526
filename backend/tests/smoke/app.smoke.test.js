import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startTestServer } from "../helpers/test-server.js";

let testServer;

before(async () => {
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }
});

test("GET /health devolve estado operacional basico", async () => {
    const response = await fetch(`${testServer.baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(response.headers.get("x-request-id"));
    assert.equal(body.status, "ok");
    assert.equal(body.dependencies.api, "ok");
    assert.equal(body.dependencies.database, "not_configured");
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
            Origin: "http://127.0.0.1:5173",
        },
    });

    assert.equal(response.status, 200);
    assert.equal(
        response.headers.get("access-control-allow-origin"),
        "http://127.0.0.1:5173",
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

test("sessao sem cookie devolve 401", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/session/me`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.message, "Sessao nao autenticada.");
});

test("sessao com cookie falso continua a devolver 401", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/session/me`, {
        headers: {
            Cookie: "faithflix_session=falso",
        },
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.message, "Sessao nao autenticada.");
});
