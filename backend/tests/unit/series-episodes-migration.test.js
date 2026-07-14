/**
 * @file Provas unitárias do migrador transacional série -> episódio.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import {
    runInTransaction,
    setDbForTests,
} from "../../src/config/database.js";
import {
    applySeriesEpisodeMigration,
    assertReviewedSeriesEpisodeMapping,
    inspectSeriesEpisodeMigration,
    preflightSeriesEpisodeMigration,
} from "../../src/modules/catalog/series-episodes-migration.js";
import {
    assertSeriesEpisodeApplyAllowed,
    parseSeriesEpisodeMigrationArguments,
} from "../../scripts/migrate-series-episodes.js";

/** @param {unknown} actual Valor. @param {unknown} expected Condição. @returns {boolean} */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) return String(actual) === String(expected);
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$in" in expected) {
            return expected.$in.some((item) => matchesValue(actual, item));
        }
        if ("$ne" in expected) return !matchesValue(actual, expected.$ne);
        if ("$exists" in expected) return (actual !== undefined) === expected.$exists;
    }
    return actual === expected;
}

/** @param {Record<string, unknown>} row Documento. @param {Record<string, unknown>} query Filtro. @returns {boolean} */
function matches(row, query = {}) {
    return Object.entries(query).every(([field, expected]) => {
        if (field === "$or") return expected.some((branch) => matches(row, branch));
        return matchesValue(row[field], expected);
    });
}

class MigrationDb {
    constructor(initial) {
        this.tables = new Map(Object.entries(initial));
        this.writeCount = 0;
        this.activeSessionReads = 0;
        this.maxConcurrentSessionReads = 0;
    }

    rows(name) {
        if (!this.tables.has(name)) this.tables.set(name, []);
        return this.tables.get(name);
    }

    async runInTransaction(work) {
        return work({ db: this, session: { migration: true } });
    }

    collection(name) {
        const rows = this.rows(name);
        return {
            find: (query = {}, options = {}) => ({
                toArray: async () => {
                    if (options.session) {
                        this.activeSessionReads += 1;
                        this.maxConcurrentSessionReads = Math.max(
                            this.maxConcurrentSessionReads,
                            this.activeSessionReads,
                        );
                        await Promise.resolve();
                        this.activeSessionReads -= 1;
                    }
                    return rows.filter((row) => matches(row, query));
                },
            }),
            findOne: async (query = {}) =>
                rows.find((row) => matches(row, query)) ?? null,
            countDocuments: async (query = {}) =>
                rows.filter((row) => matches(row, query)).length,
            updateOne: async (query, update) => {
                const row = rows.find((candidate) => matches(candidate, query));
                if (!row) return { matchedCount: 0, modifiedCount: 0 };
                Object.assign(row, update.$set ?? {});
                for (const field of Object.keys(update.$unset ?? {})) delete row[field];
                this.writeCount += 1;
                return { matchedCount: 1, modifiedCount: 1 };
            },
            updateMany: async (query, update) => {
                const selected = rows.filter((row) => matches(row, query));
                for (const row of selected) {
                    Object.assign(row, update.$set ?? {});
                    for (const field of Object.keys(update.$unset ?? {})) delete row[field];
                }
                this.writeCount += selected.length;
                return { matchedCount: selected.length, modifiedCount: selected.length };
            },
            deleteOne: async (query) => {
                const index = rows.findIndex((row) => matches(row, query));
                if (index < 0) return { deletedCount: 0 };
                rows.splice(index, 1);
                this.writeCount += 1;
                return { deletedCount: 1 };
            },
        };
    }
}

function fixture() {
    const seriesId = new ObjectId();
    const episodeId = new ObjectId();
    const userId = new ObjectId();
    const series = {
        _id: seriesId,
        type: "series",
        status: "published",
        media: { url: "/legacy.mp4" },
        mediaStatus: "ready",
    };
    const episode = {
        _id: episodeId,
        type: "episode",
        status: "published",
    };
    const mapping = assertReviewedSeriesEpisodeMapping({
        reviewed: true,
        reviewedBy: "Docente PAP",
        episodes: [{
            episodeId: String(episodeId),
            seriesId: String(seriesId),
            seasonNumber: 1,
            episodeNumber: 1,
        }],
        seriesProgress: [{
            seriesId: String(seriesId),
            episodeId: String(episodeId),
        }],
    });
    const db = new MigrationDb({
        contents: [series, episode],
        playback_progress: [{
            _id: new ObjectId(),
            userId,
            contentId: seriesId,
            currentTimeSeconds: 80,
            durationSeconds: 300,
            completed: false,
            lastWatchedAt: new Date("2026-07-01T10:00:00Z"),
        }],
        user_content_lists: [
            {
                _id: new ObjectId(),
                userId,
                contentId: episodeId,
                type: "favorite",
                createdAt: new Date("2026-07-01T00:00:00Z"),
                updatedAt: new Date("2026-07-02T00:00:00Z"),
            },
            {
                _id: new ObjectId(),
                userId,
                contentId: seriesId,
                type: "favorite",
                createdAt: new Date("2026-07-03T00:00:00Z"),
                updatedAt: new Date("2026-07-03T00:00:00Z"),
            },
        ],
        content_ratings: [],
        content_comments: [{
            _id: new ObjectId(),
            userId,
            contentId: episodeId,
            body: "Comentário",
        }],
    });
    return { db, mapping, seriesId, episodeId };
}

afterEach(() => setDbForTests(null));

test("mapping aplica allowlists e exige revisão humana explícita", () => {
    const { mapping } = fixture();
    assert.equal(mapping.reviewedBy, "Docente PAP");
    assert.throws(
        () => assertReviewedSeriesEpisodeMapping({
            reviewed: true,
            reviewedBy: "Docente PAP",
            titleHint: "não permitido",
            episodes: [],
        }),
        (error) => error.code === "MIGRATION_MAPPING_INVALID",
    );
    assert.throws(
        () => assertReviewedSeriesEpisodeMapping({
            reviewed: true,
            reviewedBy: "Docente PAP",
            episodes: [{
                episodeId: String(new ObjectId()),
                seriesId: String(new ObjectId()),
                seasonNumber: 1,
                episodeNumber: 1,
                inferredFromTitle: true,
            }],
        }),
        (error) => error.code === "MIGRATION_MAPPING_INVALID",
    );
});

test("dry-run inspeciona e projeta sem qualquer escrita", async () => {
    const { db, mapping } = fixture();
    const before = await inspectSeriesEpisodeMigration(db);
    const projected = await preflightSeriesEpisodeMigration(db, mapping);

    assert.equal(before.publishedOrphanEpisodeIds.length, 1);
    assert.equal(projected.finalHierarchy.size, 1);
    assert.equal(db.writeCount, 0);
});

test("apply exige transação e converge engagement/progresso de forma idempotente", async () => {
    const { db, mapping, seriesId, episodeId } = fixture();
    await assert.rejects(
        () => applySeriesEpisodeMigration(db, mapping),
        (error) => error.code === "TRANSACTION_CONTEXT_REQUIRED",
    );

    setDbForTests(db);
    const first = await runInTransaction(({ db: txDb, session }) =>
        applySeriesEpisodeMigration(txDb, mapping, { session }),
    );
    assert.equal(first.invalidEpisodeIds.length, 0);
    assert.equal(String(db.rows("contents")[1].seriesId), String(seriesId));
    assert.equal(db.rows("user_content_lists").length, 1);
    assert.equal(String(db.rows("content_comments")[0].contentId), String(seriesId));
    assert.equal(String(db.rows("playback_progress")[0].contentId), String(episodeId));
    assert.equal("media" in db.rows("contents")[0], false);
    assert.equal(db.maxConcurrentSessionReads, 1);

    const writesAfterFirst = db.writeCount;
    await runInTransaction(({ db: txDb, session }) =>
        applySeriesEpisodeMigration(txDb, mapping, { session }),
    );
    assert.equal(db.writeCount, writesAfterFirst);
});

test("CLI exige base explícita, opt-in e confirmação em apply", () => {
    const options = parseSeriesEpisodeMigrationArguments([
        "--apply",
        "--mapping",
        "mapping.json",
        "--database",
        "faithflix_demo",
        "--confirm-reviewed-mapping",
    ]);
    assert.doesNotThrow(() =>
        assertSeriesEpisodeApplyAllowed(
            options,
            {
                ALLOW_SERIES_EPISODE_MIGRATION: "true",
                MONGODB_DB_NAME: "faithflix_demo",
            },
            "faithflix_demo",
        ),
    );
    assert.throws(
        () => assertSeriesEpisodeApplyAllowed(
            options,
            { MONGODB_DB_NAME: "faithflix_demo" },
            "faithflix_demo",
        ),
        (error) => error.code === "MIGRATION_APPLY_NOT_ALLOWED",
    );
});
