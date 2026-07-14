/**
 * @file Regressões focadas dos guards de configuração e autorização base.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { parseAllowedOrigins } from "../../src/config/cors.js";
import { setDbForTests } from "../../src/config/database.js";
import { corsMiddleware } from "../../src/middlewares/cors.middleware.js";
import { safeRequestId } from "../../src/middlewares/request-logger.middleware.js";
import { requireAuth } from "../../src/modules/auth/auth.middleware.js";
import { requireActiveSubscription } from "../../src/modules/subscriptions/subscription-access.middleware.js";

afterEach(() => setDbForTests(null));

function responseDouble() {
    const headers = new Map();
    return {
        headers,
        getHeader(name) {
            return headers.get(name);
        },
        setHeader(name, value) {
            headers.set(name, value);
        },
    };
}

test("CORS rejeita lista vazia, deduplica e exige HTTPS em produção", () => {
    assert.throws(
        () => parseAllowedOrigins("", { production: false }),
        /pelo menos uma origin/u,
    );
    assert.throws(
        () => parseAllowedOrigins(", ,", { production: true }),
        /pelo menos uma origin/u,
    );
    assert.deepEqual(
        parseAllowedOrigins("https://app.example,https://app.example", {
            production: true,
        }),
        ["https://app.example"],
    );
    assert.throws(
        () => parseAllowedOrigins("http://app.example", { production: true }),
        /HTTPS/u,
    );
});

test("CORS permite Range e expõe headers necessários a media e CSV", () => {
    const res = responseDouble();
    let continued = false;

    corsMiddleware(
        {
            headers: { origin: "http://127.0.0.1:5181" },
            method: "GET",
        },
        res,
        () => {
            continued = true;
        },
    );

    assert.equal(continued, true);
    assert.match(res.headers.get("Access-Control-Allow-Headers"), /Range/u);
    assert.match(res.headers.get("Access-Control-Allow-Methods"), /HEAD/u);
    assert.match(
        res.headers.get("Access-Control-Expose-Headers"),
        /Content-Disposition/u,
    );
    assert.match(
        res.headers.get("Access-Control-Expose-Headers"),
        /Content-Range/u,
    );
});

test("request id aceita apenas ASCII visível curto", () => {
    assert.equal(safeRequestId("request-123"), "request-123");
    assert.equal(safeRequestId(" request-123 "), null);
    assert.equal(safeRequestId("a".repeat(129)), null);
    assert.equal(safeRequestId("linha\nnova"), null);
    assert.equal(safeRequestId(["duplicado"]), null);
});

test("requireAuth marca também o 401 como privado", () => {
    const res = responseDouble();
    let forwarded;
    requireAuth({}, res, (error) => {
        forwarded = error;
    });

    assert.equal(forwarded.statusCode, 401);
    assert.equal(forwarded.code, "AUTH_REQUIRED");
    assert.equal(res.headers.get("Cache-Control"), "private, no-store");
    assert.match(res.headers.get("Vary"), /Cookie/u);
});

test("middleware premium devolve código estável sem subscrição", async () => {
    setDbForTests({
        collection(name) {
            if (name === "subscriptions" || name === "subscription_family_memberships") {
                return { async findOne() { return null; } };
            }
            throw new Error(`Coleção inesperada: ${name}`);
        },
    });
    const res = responseDouble();
    const error = await new Promise((resolve) => {
        requireActiveSubscription(
            { user: { id: String(new ObjectId()) } },
            res,
            resolve,
        );
    });

    assert.equal(error.statusCode, 403);
    assert.equal(error.code, "SUBSCRIPTION_REQUIRED");
    assert.equal(res.headers.get("Cache-Control"), "private, no-store");
});

test("middleware premium encaminha rejeição da base sem deixar pedido pendurado", async () => {
    const dependencyError = new Error("database unavailable");
    setDbForTests({
        collection() {
            throw dependencyError;
        },
    });
    const res = responseDouble();
    const forwarded = await new Promise((resolve) => {
        requireActiveSubscription(
            { user: { id: String(new ObjectId()) } },
            res,
            resolve,
        );
    });

    assert.equal(forwarded, dependencyError);
});
