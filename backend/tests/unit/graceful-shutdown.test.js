/**
 * @file Testes do fecho HTTP/Mongo idempotente e limitado no tempo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { createGracefulShutdown } from "../../src/runtime/graceful-shutdown.js";

function createSilentLogger() {
    return {
        info() {},
        warn() {},
    };
}

test("shutdown fecha HTTP antes de Mongo e partilha a mesma Promise", async () => {
    const events = [];
    const server = {
        close(callback) {
            events.push("http:stop-accepting");
            queueMicrotask(() => {
                events.push("http:drained");
                callback();
            });
        },
        closeIdleConnections() {
            events.push("http:close-idle");
        },
        closeAllConnections() {
            events.push("http:force-close");
        },
    };
    let databaseCloses = 0;
    const shutdown = createGracefulShutdown({
        server,
        logger: createSilentLogger(),
        async closeDatabase() {
            databaseCloses += 1;
            events.push("mongo:close");
        },
    });

    const first = shutdown("SIGTERM");
    const second = shutdown("SIGINT");
    assert.equal(first, second);
    assert.deepEqual(await first, { forced: false, drained: true });
    assert.equal(databaseCloses, 1);
    assert.deepEqual(events, [
        "http:stop-accepting",
        "http:close-idle",
        "http:drained",
        "mongo:close",
    ]);
});

test("shutdown força ligações ativas depois de um timeout limitado", async () => {
    const events = [];
    let finishClose;
    const server = {
        close(callback) {
            events.push("http:stop-accepting");
            finishClose = callback;
        },
        closeIdleConnections() {
            events.push("http:close-idle");
        },
        closeAllConnections() {
            events.push("http:force-close");
            finishClose();
        },
    };
    const shutdown = createGracefulShutdown({
        server,
        logger: createSilentLogger(),
        timeoutMs: 5,
        forceCloseGraceMs: 5,
        async closeDatabase() {
            events.push("mongo:close");
        },
    });

    assert.deepEqual(await shutdown("SIGTERM"), {
        forced: true,
        drained: true,
    });
    assert.deepEqual(events, [
        "http:stop-accepting",
        "http:close-idle",
        "http:force-close",
        "mongo:close",
    ]);
});

test("shutdown tenta fechar Mongo uma vez mesmo se o fecho HTTP falhar", async () => {
    let databaseCloses = 0;
    const shutdown = createGracefulShutdown({
        server: {
            close(callback) {
                callback(new Error("detalhe HTTP interno"));
            },
            closeIdleConnections() {},
        },
        logger: createSilentLogger(),
        async closeDatabase() {
            databaseCloses += 1;
        },
    });

    await assert.rejects(
        () => shutdown("SIGINT"),
        (error) => {
            assert.equal(error.code, "GRACEFUL_SHUTDOWN_FAILED");
            assert.equal(error.message, "Graceful shutdown incompleto.");
            return true;
        },
    );
    await assert.rejects(() => shutdown("SIGTERM"));
    assert.equal(databaseCloses, 1);
});
