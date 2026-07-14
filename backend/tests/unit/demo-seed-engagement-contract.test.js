/**
 * @file Contrato entre engagement demo, perfis de gosto, parental e recomendação.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { setDbForTests } from "../../src/config/database.js";
import { seedDemoEngagement } from "../../scripts/seed-demo-engagement.js";
import { configureDemoSeedContext } from "../../scripts/demo-seed-utils.js";

afterEach(() => setDbForTests(null));

test("engagement cria utilização coerente, diversa e útil para recomendações", async () => {
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
    assert.equal(summary.notifications, 48);

    const contentById = new Map(
        context.contents.map((content) => [String(content._id), content]),
    );
    const userById = new Map(
        context.users.map((user) => [String(user._id), user]),
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

    for (const collectionName of [
        "user_content_lists",
        "playback_progress",
        "content_ratings",
        "content_comments",
    ]) {
        assert(
            inserted.get(collectionName).every((row) => {
                const user = userById.get(String(row.userId));
                const content = contentById.get(String(row.contentId));
                return content.ageRating <= user.parentalMaxAgeRating;
            }),
            `${collectionName} contém atividade acima do limite parental`,
        );
    }

    const engagedUsers = context.users.filter(
        (user) => user.accountStatus === "active" && user.key !== "coldStart",
    );
    for (const user of engagedUsers) {
        const owns = (collectionName) => inserted
            .get(collectionName)
            .filter((row) => String(row.userId) === String(user._id));
        assert(owns("user_content_lists").length >= 2);
        assert(owns("playback_progress").length >= 7);
        assert(owns("content_ratings").length >= 6);
        assert(owns("content_ratings").some((row) => row.value >= 4));
    }

    const coldStart = context.users.find((user) => user.key === "coldStart");
    for (const collectionName of [
        "user_content_lists",
        "playback_progress",
        "content_ratings",
        "content_comments",
    ]) {
        assert.equal(
            inserted.get(collectionName).some(
                (row) => String(row.userId) === String(coldStart._id),
            ),
            false,
        );
    }

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

    const ratingCounts = context.publicEngagementContents.map((content) =>
        inserted.get("content_ratings").filter(
            (row) => String(row.contentId) === String(content._id),
        ).length);
    assert(Math.min(...ratingCounts) >= 8);
    assert(Math.max(...ratingCounts) <= 12);

    /**
     * Calcula a taxonomia dominante usando os mesmos pesos base dos sinais.
     *
     * @param {string} userKey Chave da persona.
     * @returns {string} ID da taxonomia com maior peso.
     */
    const profileTopTaxonomy = (userKey) => {
        const user = context.users.find((candidate) => candidate.key === userKey);
        const taxonomyWeights = new Map();
        const addContent = (content, weight) => {
            const effectiveContent = content.type === "episode"
                ? contentById.get(String(content.seriesId))
                : content;
            for (const taxonomyId of effectiveContent.taxonomyIds) {
                const key = String(taxonomyId);
                taxonomyWeights.set(key, (taxonomyWeights.get(key) ?? 0) + weight);
            }
        };

        for (const row of inserted.get("user_content_lists")) {
            if (String(row.userId) !== String(user._id)) continue;
            addContent(
                contentById.get(String(row.contentId)),
                row.type === "favorite" ? 3 : 2,
            );
        }
        for (const row of inserted.get("playback_progress")) {
            if (String(row.userId) !== String(user._id)) continue;
            addContent(contentById.get(String(row.contentId)), 1);
        }
        for (const row of inserted.get("content_ratings")) {
            if (String(row.userId) !== String(user._id) || row.value < 4) continue;
            addContent(contentById.get(String(row.contentId)), 3);
        }

        return [...taxonomyWeights.entries()]
            .toSorted((left, right) => right[1] - left[1])[0][0];
    };
    assert.equal(
        new Set([
            profileTopTaxonomy("pro"),
            profileTopTaxonomy("familyOwner"),
            profileTopTaxonomy("familyMember"),
        ]).size,
        3,
    );

    const canonicalNotificationTypes = new Set([
        "subscription_activated",
        "payment_failed",
        "trial_started",
        "continue_watching",
        "family_invitation",
        "family_invitation_accepted",
        "family_member_removed",
    ]);
    assert(
        inserted.get("notifications").every((row) =>
            canonicalNotificationTypes.has(row.type)),
    );
    assert(
        inserted.get("content_comments")
            .filter((row) => row.status === "visible")
            .every((row) => !/^Partilha \d+/u.test(row.body)),
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
    const personalListPairs = inserted.get("user_content_lists").map((row) =>
        [row.userId, row.contentId].join(":"));
    assert.equal(new Set(personalListPairs).size, personalListPairs.length);
});
