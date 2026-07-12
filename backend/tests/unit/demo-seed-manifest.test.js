/** @file Contratos puros do manifesto FaithFlix demo-v2. */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
    DEMO_EXPECTED_COUNTS,
    configureDemoSeedContext,
} from "../../scripts/demo-seed-utils.js";

const config = {
    referenceDate: new Date("2026-07-10T12:00:00.000Z"),
    dataSeed: "faithflix-demo-v2",
    adminPassword: "admin-password-demo",
    userPassword: "user-password-demo",
};
const frontendPublicRoot = fileURLToPath(
    new URL("../../../frontend/public/", import.meta.url),
);

test("manifesto demo-v2 é determinístico e cumpre volumes base", () => {
    const first = configureDemoSeedContext(config);
    const firstIds = first.contents.map((item) => String(item._id));
    const second = configureDemoSeedContext(config);

    assert.equal(first.users.length, DEMO_EXPECTED_COUNTS.users);
    assert.equal(first.contents.length, DEMO_EXPECTED_COUNTS.contents);
    assert.equal(first.publishedContents.length, DEMO_EXPECTED_COUNTS.publishedContents);
    assert.equal(first.taxonomies.length, DEMO_EXPECTED_COUNTS.taxonomies);
    assert.equal(first.mediaAssets.length, DEMO_EXPECTED_COUNTS.mediaAssets);
    assert.deepEqual(second.contents.map((item) => String(item._id)), firstIds);
    assert.deepEqual(
        second.mediaAssets.map((item) => item.storageKey),
        first.mediaAssets.map((item) => item.storageKey),
    );
    assert.equal(new Set(firstIds).size, firstIds.length);
    assert.equal(
        new Set(first.mediaAssets.map((item) => item.storageKey)).size,
        first.mediaAssets.length,
    );
});

test("manifesto cobre estados, roles, parental e doze meses fechados", () => {
    const context = configureDemoSeedContext(config);
    const count = (field, value) => context.users.filter((item) => item[field] === value).length;

    assert.equal(count("accountStatus", "active"), 30);
    assert.equal(count("accountStatus", "blocked"), 4);
    assert.equal(count("accountStatus", "deleted"), 2);
    assert.equal(count("role", "admin"), 2);
    assert.equal(count("role", "moderator"), 2);
    assert.equal(count("role", "user"), 32);
    assert.deepEqual(
        [...new Set(context.contents.map((item) => item.ageRating))].sort((a, b) => a - b),
        [0, 6, 10, 12, 16, 18],
    );
    assert.equal(context.distributionMonths.length, 12);
    assert(context.distributionMonths.every((month) => month < "2026-07"));
    assert(context.contents.every((item) => !item.createdAt || item.createdAt <= config.referenceDate));
    assert(context.contents.every((item) => !item.publishedAt || item.publishedAt <= config.referenceDate));
});

test("manifesto separa engagement de playback e usa apenas assets privados", () => {
    const context = configureDemoSeedContext(config);
    const contentById = new Map(
        context.contents.map((content) => [String(content._id), content]),
    );
    const episodes = context.contents.filter((content) => content.type === "episode");
    const publicPublished = context.contents.filter(
        (content) =>
            content.status === "published" &&
            ["movie", "series", "documentary"].includes(content.type),
    );
    const assetsByContent = new Map(
        context.mediaAssets.map((asset) => [String(asset.contentId), asset]),
    );

    assert(
        context.publicEngagementContents.every((content) =>
            ["movie", "series", "documentary"].includes(content.type)),
    );
    assert(
        context.playablePublishedContents.every(
            (content) => content.status === "published" && content.type !== "series",
        ),
    );
    assert.equal(publicPublished.length, DEMO_EXPECTED_COUNTS.embeddings);
    assert.equal(episodes.length, 14);
    assert.equal(episodes.filter((content) => content.status === "published").length, 10);
    assert.equal(
        new Set(
            episodes.map(
                (episode) =>
                    `${episode.seriesId}:${episode.seasonNumber}:${episode.episodeNumber}`,
            ),
        ).size,
        episodes.length,
    );
    assert(
        episodes.every((episode) => {
            const series = contentById.get(String(episode.seriesId));
            return (
                series?.type === "series" &&
                Number.isSafeInteger(episode.seasonNumber) &&
                episode.seasonNumber > 0 &&
                Number.isSafeInteger(episode.episodeNumber) &&
                episode.episodeNumber > 0 &&
                (episode.status !== "published" || series.status === "published")
            );
        }),
    );

    for (const content of context.contents) {
        const asset = assetsByContent.get(String(content._id));
        const playable = content.status === "published" && content.type !== "series";

        assert.equal(Boolean(asset), playable);
        assert.equal(content.mediaStatus, playable ? "ready" : "pending");
        assert.deepEqual(content.qualityOptions, []);
        assert.deepEqual(content.tracks, { subtitles: [], audio: [] });

        if (playable) {
            assert.equal(content.media.url, `/api/media/${asset._id}`);
            assert.equal(content.media.protocol, "progressive");
            assert.equal(content.media.mimeType, "video/mp4");
            assert.equal(content.media.quality, "720p");
        } else {
            assert.equal(content.media.playbackUrl, "");
        }
    }
});

test("manifesto referencia os 96 artworks WebP públicos", async () => {
    const context = configureDemoSeedContext(config);
    const artworkUrls = context.contents.flatMap((content) => [
        content.assets.posterUrl,
        content.assets.backdropUrl,
    ]);

    assert.equal(artworkUrls.length, DEMO_EXPECTED_COUNTS.contents * 2);
    assert.equal(new Set(artworkUrls).size, artworkUrls.length);

    await Promise.all(artworkUrls.map(async (artworkUrl) => {
        assert.match(
            artworkUrl,
            /^\/media\/demo\/artwork\/[a-z0-9-]+-(?:poster|backdrop)\.webp$/u,
        );
        const artwork = await readFile(resolve(frontendPublicRoot, artworkUrl.slice(1)));
        assert.equal(artwork.subarray(0, 4).toString("ascii"), "RIFF");
        assert.equal(artwork.subarray(8, 12).toString("ascii"), "WEBP");
    }));
});
