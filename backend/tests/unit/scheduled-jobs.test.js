/**
 * @file Testes do lease distribuído de jobs sem MongoDB real.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
    claimScheduledJob,
    completeScheduledJob,
    failScheduledJob,
    registerScheduledJob,
} from "../../src/modules/jobs/scheduled-jobs.service.js";

/**
 * Aplica operadores mínimos a um documento em memória.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} update Update Mongo.
 * @param {boolean} inserted Indica upsert.
 * @returns {void}
 */
function applyUpdate(row, update, inserted = false) {
    Object.assign(row, update.$set ?? {});
    if (inserted) Object.assign(row, update.$setOnInsert ?? {});
    for (const [key, amount] of Object.entries(update.$inc ?? {})) {
        row[key] = Number(row[key] ?? 0) + Number(amount);
    }
    for (const key of Object.keys(update.$unset ?? {})) delete row[key];
}

/**
 * Cria a coleção atómica mínima usada pelos testes.
 *
 * @returns {{ db: { collection: () => Record<string, Function> }, rows: Record<string, unknown>[] }} Double.
 */
function createJobDb() {
    const rows = [];
    const collection = {
        async updateOne(filter, update, options = {}) {
            let row = rows.find(
                (candidate) =>
                    candidate.key === filter.key &&
                    (filter.leaseOwner === undefined ||
                        candidate.leaseOwner === filter.leaseOwner) &&
                    (filter.status === undefined ||
                        candidate.status === filter.status),
            );
            if (!row && options.upsert) {
                row = { key: filter.key };
                rows.push(row);
                applyUpdate(row, update, true);
                return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
            }
            if (!row) return { matchedCount: 0, modifiedCount: 0 };
            applyUpdate(row, update);
            return { matchedCount: 1, modifiedCount: 1 };
        },
        async findOneAndUpdate(filter, update) {
            const row = rows.find((candidate) => {
                if (candidate.key !== filter.key) return false;
                if (!(candidate.nextRunAt <= filter.nextRunAt.$lte)) return false;
                const idle = ["idle", "failed"].includes(candidate.status);
                const expired =
                    candidate.status === "running" &&
                    candidate.leaseExpiresAt <= filter.$or[1].leaseExpiresAt.$lte;
                return idle || expired;
            });
            if (!row) return null;
            applyUpdate(row, update);
            return row;
        },
    };
    return {
        rows,
        db: { collection: () => collection },
    };
}

test("apenas um worker reclama o mesmo job pronto", async () => {
    const { db, rows } = createJobDb();
    const now = new Date("2026-07-09T10:00:00.000Z");
    await registerScheduledJob({
        db,
        key: "billing:hourly",
        type: "billing-hourly",
        nextRunAt: now,
    });

    const [first, second] = await Promise.all([
        claimScheduledJob({ db, key: "billing:hourly", ownerId: "worker-a", leaseMs: 30_000, now }),
        claimScheduledJob({ db, key: "billing:hourly", ownerId: "worker-b", leaseMs: 30_000, now }),
    ]);

    assert.equal([first, second].filter(Boolean).length, 1);
    assert.equal(rows[0].status, "running");
    assert.equal(rows[0].attempts, 1);
});

test("metadata legacy com value null não simula um lease reclamado", async () => {
    const db = {
        collection() {
            return {
                async findOneAndUpdate() {
                    return { value: null, ok: 1 };
                },
            };
        },
    };

    const claimed = await claimScheduledJob({
        db,
        key: "pool:2026-06",
        ownerId: "worker",
        leaseMs: 5_000,
        now: new Date("2026-07-01T00:00:00.000Z"),
    });
    assert.equal(claimed, null);
});

test("corrida E11000 no registo reutiliza o job criado pelo vencedor", async () => {
    const duplicate = new Error("duplicate key");
    duplicate.code = 11000;
    const db = {
        collection() {
            return {
                async updateOne() {
                    throw duplicate;
                },
            };
        },
    };

    await assert.doesNotReject(() => registerScheduledJob({
        db,
        key: "pool:2026-06",
        type: "monthly_pool",
        nextRunAt: new Date("2026-07-01T00:00:00.000Z"),
    }));
});

test("lease expirado pode ser recuperado e owner antigo não o fecha", async () => {
    const { db, rows } = createJobDb();
    const start = new Date("2026-07-09T10:00:00.000Z");
    await registerScheduledJob({ db, key: "billing:hourly", type: "billing-hourly", nextRunAt: start });
    await claimScheduledJob({ db, key: "billing:hourly", ownerId: "worker-a", leaseMs: 5_000, now: start });
    const recoveredAt = new Date(start.getTime() + 6_000);
    const recovered = await claimScheduledJob({ db, key: "billing:hourly", ownerId: "worker-b", leaseMs: 5_000, now: recoveredAt });

    assert.equal(recovered.leaseOwner, "worker-b");
    assert.equal(
        await completeScheduledJob({ db, key: "billing:hourly", ownerId: "worker-a", nextRunAt: new Date(recoveredAt.getTime() + 60_000) }),
        false,
    );
    assert.equal(rows[0].status, "running");
});

test("conclusão terminal e falha limpam sempre o lease", async () => {
    const { db, rows } = createJobDb();
    const now = new Date("2026-07-09T10:00:00.000Z");
    await registerScheduledJob({ db, key: "pool:2026-06", type: "monthly-pool", nextRunAt: now });
    await claimScheduledJob({ db, key: "pool:2026-06", ownerId: "worker", leaseMs: 5_000, now });
    await failScheduledJob({
        db,
        key: "pool:2026-06",
        ownerId: "worker",
        retryAt: new Date(now.getTime() + 60_000),
        errorCode: "DEPENDENCY_UNAVAILABLE",
        now,
    });

    assert.equal(rows[0].status, "failed");
    assert.equal("leaseOwner" in rows[0], false);

    const retryAt = rows[0].nextRunAt;
    await claimScheduledJob({ db, key: "pool:2026-06", ownerId: "worker-2", leaseMs: 5_000, now: retryAt });
    await completeScheduledJob({ db, key: "pool:2026-06", ownerId: "worker-2", terminal: true, now: retryAt });

    assert.equal(rows[0].status, "completed");
    assert.equal("nextRunAt" in rows[0], false);
    assert.equal("leaseExpiresAt" in rows[0], false);
});
