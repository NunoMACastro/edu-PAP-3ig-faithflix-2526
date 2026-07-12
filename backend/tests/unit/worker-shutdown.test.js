/**
 * @file Testes isolados dos sinais e ciclo de shutdown do worker financeiro.
 */

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import { runWorker, workerPollMs } from "../../src/worker.js";

function createMemoryLogger(entries) {
    return {
        info(message, context) {
            entries.push({ level: "info", message, context });
        },
        error(message, context) {
            entries.push({ level: "error", message, context });
        },
    };
}

test("worker identifica o primeiro sinal, aguarda o ciclo e fecha Mongo uma vez", async () => {
    const processTarget = new EventEmitter();
    const entries = [];
    let resolveCycle;
    let markCycleStarted;
    let databaseCloses = 0;
    const cycleStarted = new Promise((resolveStarted) => {
        markCycleStarted = resolveStarted;
    });
    const activeCycle = new Promise((resolveActiveCycle) => {
        resolveCycle = resolveActiveCycle;
    });

    const workerPromise = runWorker({
        processTarget,
        log: createMemoryLogger(entries),
        prepare: async () => {},
        ownerId: "worker-unit-test",
        pollMs: 10_000,
        runCycle: async () => {
            markCycleStarted();
            return activeCycle;
        },
        closeDb: async () => {
            databaseCloses += 1;
        },
    });

    await cycleStarted;
    processTarget.emit("SIGTERM");
    processTarget.emit("SIGTERM");
    processTarget.emit("SIGINT");
    await Promise.resolve();

    assert.equal(databaseCloses, 0, "o ciclo ativo ainda não terminou");
    resolveCycle({ subscriptions: 1, pool: "skipped" });
    await workerPromise;

    const shutdownLogs = entries.filter(
        ({ message }) => message === "FaithFlix worker shutdown requested",
    );
    assert.equal(shutdownLogs.length, 1);
    assert.deepEqual(shutdownLogs[0].context, { signal: "SIGTERM" });
    assert.equal(databaseCloses, 1);
    assert.equal(processTarget.listenerCount("SIGTERM"), 0);
    assert.equal(processTarget.listenerCount("SIGINT"), 0);
});

test("worker remove listeners e fecha Mongo se a preparação falhar", async () => {
    const processTarget = new EventEmitter();
    const startupError = new Error("startup failure sintético");
    let databaseCloses = 0;

    await assert.rejects(
        () =>
            runWorker({
                processTarget,
                log: createMemoryLogger([]),
                prepare: async () => {
                    throw startupError;
                },
                closeDb: async () => {
                    databaseCloses += 1;
                },
            }),
        (error) => error === startupError,
    );

    assert.equal(databaseCloses, 1);
    assert.equal(processTarget.listenerCount("SIGTERM"), 0);
    assert.equal(processTarget.listenerCount("SIGINT"), 0);
});

test("workerPollMs mantém limites contra busy loop", () => {
    assert.equal(workerPollMs(undefined), 60_000);
    assert.equal(workerPollMs("10000"), 10_000);
    assert.throws(
        () => workerPollMs("9999"),
        (error) => error.code === "WORKER_POLL_INVALID",
    );
});
