/**
 * @file Testes do builder puro e fail-closed da configuração de ambiente.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { buildEnv } from "../../src/config/env.js";

const VALID_PRODUCTION_ENV = {
    NODE_ENV: "production",
    HOST: "0.0.0.0",
    PORT: "4101",
    SERVICE_NAME: "faithflix-api-production",
    MONGODB_URI: "mongodb://database.internal:27017",
    MONGODB_DB_NAME: "faithflix_production",
    RATE_LIMIT_PEPPER: "x".repeat(32),
    FORCE_HTTPS: "true",
    TRUST_PROXY_HOPS: "2",
    BUILD_VERSION: "release-1",
};

test("buildEnv mantém defaults apenas fora de produção", () => {
    assert.deepEqual(buildEnv({ NODE_ENV: "test" }), {
        nodeEnv: "test",
        host: "127.0.0.1",
        port: 3101,
        serviceName: "faithflix-api",
        mongoUri: "mongodb://127.0.0.1:27017",
        mongoDbName: "faithflix",
        forceHttps: false,
        trustProxy: false,
        rateLimitPepper: "faithflix-development-only",
        buildVersion: "local",
    });
});

test("buildEnv recusa NODE_ENV desconhecido sem cair em defaults de desenvolvimento", () => {
    assert.throws(
        () => buildEnv({ NODE_ENV: "prod-private-value" }),
        (error) => {
            assert.equal(error.code, "ENVIRONMENT_INVALID");
            assert.deepEqual(error.fields, ["NODE_ENV"]);
            assert.equal(error.message.includes("prod-private-value"), false);
            return true;
        },
    );

    assert.throws(
        () => buildEnv({ NODE_ENV: true }),
        (error) => {
            assert.deepEqual(error.fields, ["NODE_ENV"]);
            return true;
        },
    );
});

test("buildEnv exige toda a baseline operacional explícita em produção", () => {
    assert.throws(
        () => buildEnv({ NODE_ENV: "production" }),
        (error) => {
            assert.equal(error.code, "ENVIRONMENT_INVALID");
            assert.deepEqual(error.fields, [
                "FORCE_HTTPS",
                "HOST",
                "MONGODB_DB_NAME",
                "MONGODB_URI",
                "RATE_LIMIT_PEPPER",
                "SERVICE_NAME",
                "TRUST_PROXY_HOPS",
            ]);
            assert.equal(
                error.message,
                `Configuracao de ambiente invalida: ${error.fields.join(", ")}.`,
            );
            return true;
        },
    );
});

test("buildEnv nunca inclui valores sensíveis nos erros de produção", () => {
    const sensitiveUri = "mongodb://private-user:private-password@db.invalid";
    const sensitivePepper = "short-private-pepper";

    assert.throws(
        () =>
            buildEnv({
                ...VALID_PRODUCTION_ENV,
                SERVICE_NAME: "",
                MONGODB_URI: sensitiveUri,
                RATE_LIMIT_PEPPER: sensitivePepper,
                FORCE_HTTPS: "false",
                TRUST_PROXY_HOPS: "0",
            }),
        (error) => {
            assert.deepEqual(error.fields, [
                "FORCE_HTTPS",
                "RATE_LIMIT_PEPPER",
                "SERVICE_NAME",
                "TRUST_PROXY_HOPS",
            ]);
            assert.doesNotMatch(error.message, /private-user|private-password/);
            assert.equal(error.message.includes(sensitivePepper), false);
            return true;
        },
    );
});

test("buildEnv aceita uma configuração de produção completa e fechada", () => {
    assert.deepEqual(buildEnv(VALID_PRODUCTION_ENV), {
        nodeEnv: "production",
        host: "0.0.0.0",
        port: 4101,
        serviceName: "faithflix-api-production",
        mongoUri: "mongodb://database.internal:27017",
        mongoDbName: "faithflix_production",
        forceHttps: true,
        trustProxy: 2,
        rateLimitPepper: "x".repeat(32),
        buildVersion: "release-1",
    });
});

test("buildEnv reporta apenas PORT quando a porta é inválida", () => {
    assert.throws(
        () => buildEnv({ NODE_ENV: "test", PORT: "3101-invalid" }),
        (error) => {
            assert.deepEqual(error.fields, ["PORT"]);
            assert.equal(
                error.message,
                "Configuracao de ambiente invalida: PORT.",
            );
            assert.equal(error.message.includes("3101-invalid"), false);
            return true;
        },
    );
});

test("buildEnv limita o bind a endereços explícitos conhecidos", () => {
    assert.throws(
        () => buildEnv({ NODE_ENV: "test", HOST: "lan.example.test" }),
        (error) => {
            assert.deepEqual(error.fields, ["HOST"]);
            assert.equal(error.message.includes("lan.example.test"), false);
            return true;
        },
    );
    assert.equal(buildEnv({ NODE_ENV: "test", HOST: "::1" }).host, "::1");
});
