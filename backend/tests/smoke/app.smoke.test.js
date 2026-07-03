/**
 * @file Ficheiro `real_dev/backend/tests/smoke/app.smoke.test.js` da implementação real_dev.
 */

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
    const [
        ratingResponse,
        commentResponse,
        recommendationsResponse,
        feedbackResponse,
        eventsResponse,
    ] =
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
            fetch(`${testServer.baseUrl}/api/recommendations/feedback`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    contentId: "64f000000000000000000001",
                    action: "not_interested",
                }),
            }),
            fetch(`${testServer.baseUrl}/api/recommendations/events`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    events: [
                        {
                            eventType: "shown",
                            contentId: "64f000000000000000000001",
                        },
                    ],
                }),
            }),
        ]);

    assert.equal(ratingResponse.status, 401);
    assert.equal(commentResponse.status, 401);
    assert.equal(recommendationsResponse.status, 401);
    assert.equal(feedbackResponse.status, 401);
    assert.equal(eventsResponse.status, 401);
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
