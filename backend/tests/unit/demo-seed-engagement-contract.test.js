/**
 * @file Contrato entre engagement demo, séries agregadoras e episódios.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { setDbForTests } from "../../src/config/database.js";
import { seedDemoEngagement } from "../../scripts/seed-demo-engagement.js";
import { configureDemoSeedContext } from "../../scripts/demo-seed-utils.js";

afterEach(() => setDbForTests(null));

test("engagement exclui episódios e progresso exclui séries sem perder contagens", async () => {
    const context = configureDemoSeedContext({
        referenceDate: new Date("2026-07-10T12:00:00.000Z"),
        dataSeed: "faithflix-demo-v2",
        adminPassword: "admin-password-demo",
        userPassword: "user-password-demo",
    });
    const inserted = new Map();
    setDbForTests({
        collection(name) {
            return {
                async insertMany(documents) {
                    inserted.set(name, documents);
                    return { insertedCount: documents.length };
                },
            };
        },
    });

    const summary = await seedDemoEngagement();
    assert.equal(summary.listEntries, 120);
    assert.equal(summary.playbackProgress, 240);
    assert.equal(summary.ratings, 300);
    assert.equal(summary.comments, 60);

    const contentById = new Map(
        context.contents.map((content) => [String(content._id), content]),
    );
    for (const collectionName of [
        "user_content_lists",
        "content_ratings",
        "content_comments",
    ]) {
        assert(
            inserted.get(collectionName).every((row) =>
                ["movie", "series", "documentary"].includes(
                    contentById.get(String(row.contentId))?.type,
                )),
        );
    }
    assert(
        inserted.get("playback_progress").every((row) => {
            const content = contentById.get(String(row.contentId));
            return content?.status === "published" && content.type !== "series";
        }),
    );

    const progressCounts = new Map();
    for (const row of inserted.get("playback_progress")) {
        const contentId = String(row.contentId);
        progressCounts.set(contentId, (progressCounts.get(contentId) ?? 0) + 1);
    }
    assert.deepEqual(
        [...progressCounts.values()]
            .sort((left, right) => right - left)
            .slice(0, 4),
        [24, 18, 12, 8],
    );

    for (const collectionName of [
        "user_content_lists",
        "playback_progress",
        "content_ratings",
    ]) {
        const rows = inserted.get(collectionName);
        const keys = rows.map((row) =>
            [row.userId, row.contentId, row.type ?? ""].join(":"));
        assert.equal(new Set(keys).size, rows.length);
    }
});
