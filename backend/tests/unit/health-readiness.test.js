/**
 * @file Testes unitários do contrato de liveness/readiness.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
    getLivenessStatus,
    getReadinessStatus,
    READINESS_DEADLINE_MS,
} from "../../src/modules/system/health.service.js";

test("liveness confirma apenas o processo e não a base de dados", () => {
    const status = getLivenessStatus();

    assert.equal(status.status, "ok");
    assert.equal(status.live, true);
    assert.equal(status.dependencies.api, "ok");
    assert.equal(status.dependencies.database, "not_checked");
    assert.equal(typeof status.timestamp, "string");
    assert.equal(Number.isInteger(status.uptimeSeconds), true);
});

test("readiness saudável usa o budget integral no ping e devolve estado seguro", async () => {
    let receivedBudget;
    const status = await getReadinessStatus({
        async ping(maxTimeMS) {
            receivedBudget = maxTimeMS;
        },
    });

    assert.equal(READINESS_DEADLINE_MS, 500);
    assert.equal(receivedBudget, 500);
    assert.equal(status.status, "ok");
    assert.equal(status.ready, true);
    assert.equal(status.dependencies.database, "ok");
});

test("readiness falha fechado sem expor a exceção da base de dados", async () => {
    const status = await getReadinessStatus({
        async ping() {
            throw new Error("segredo-interno-mongodb");
        },
    });
    const serialized = JSON.stringify(status);

    assert.equal(status.status, "unavailable");
    assert.equal(status.ready, false);
    assert.equal(status.dependencies.database, "unavailable");
    assert.doesNotMatch(serialized, /segredo-interno-mongodb|error|uri/iu);
});

test("readiness aplica deadline wall-clock também a um ping bloqueado", async () => {
    const startedAt = performance.now();
    const status = await getReadinessStatus({
        ping: () => new Promise(() => {}),
        deadlineMs: 25,
    });
    const durationMs = performance.now() - startedAt;

    assert.equal(status.ready, false);
    assert.ok(durationMs >= 20, `deadline terminou cedo: ${durationMs}ms`);
    assert.ok(durationMs < 250, `deadline excedido: ${durationMs}ms`);
});
