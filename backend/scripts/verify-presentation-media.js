/**
 * @file Verificação read-only dos filmes e variantes usados na apresentação.
 */

import assert from "node:assert/strict";
import {
    closeDatabase,
    getDb,
} from "../src/config/database.js";
import { env } from "../src/config/env.js";
import { getMediaDeliveryContext } from "../src/modules/media/media-assets.service.js";
import { inspectMediaStorageFile } from "../src/modules/media/media-storage.service.js";
import { getPlayback } from "../src/modules/playback/playback.service.js";

const TARGETS = Object.freeze([
    Object.freeze({ slug: "o-valor-do-silencio", durationSeconds: 37 }),
    Object.freeze({ slug: "cartas-a-proxima-geracao", durationSeconds: 20 }),
    Object.freeze({ slug: "a-oficina-do-bairro", durationSeconds: 8 }),
]);
const DETACHED_CHILD_SLUGS = Object.freeze([
    "projeto-reconstruir",
    "arquivo-de-testemunhos",
    "caderno-de-producao",
    "especial-de-esperanca",
]);

/**
 * Valida o dataset, os ficheiros privados e as decisões de entitlement.
 *
 * @returns {Promise<void>}
 */
async function main() {
    if (!env.mongoDbName.endsWith("_demo")) {
        throw new Error("A verificação de apresentação exige uma base _demo.");
    }

    const db = await getDb();
    const targetSlugs = TARGETS.map(({ slug }) => slug);
    const contents = await db.collection("contents")
        .find({ slug: { $in: targetSlugs } })
        .toArray();
    assert.equal(contents.length, TARGETS.length);
    const contentBySlug = new Map(contents.map((content) => [content.slug, content]));

    const users = await db.collection("users")
        .find({
            email: {
                $in: ["pro@faithflix.demo", "familia-owner@faithflix.demo"],
            },
            accountStatus: { $ne: "deleted" },
        })
        .toArray();
    const userByEmail = new Map(users.map((user) => [user.email, user]));
    const proUser = userByEmail.get("pro@faithflix.demo");
    const familyUser = userByEmail.get("familia-owner@faithflix.demo");
    assert(proUser, "Utilizador Pro demo em falta.");
    assert(familyUser, "Responsável Família demo em falta.");

    const summary = [];
    for (const target of TARGETS) {
        const content = contentBySlug.get(target.slug);
        assert(content, `Conteúdo em falta: ${target.slug}.`);
        assert.equal(content.type, "movie");
        assert.equal(content.status, "published");
        assert.equal(content.mediaStatus, "ready");
        assert.equal(content.durationSeconds, target.durationSeconds);
        assert.deepEqual(
            content.qualityOptions.map((option) => option.value),
            ["1080p", "2160p"],
        );

        const assets = await db.collection("media_assets")
            .find({
                contentId: content._id,
                status: "ready",
                active: true,
            })
            .sort({ quality: 1 })
            .toArray();
        assert.equal(assets.length, 2);
        assert.deepEqual(
            assets.map((asset) => asset.quality),
            ["1080p", "2160p"],
        );
        for (const asset of assets) {
            const inspected = await inspectMediaStorageFile(asset.storageKey);
            assert.equal(inspected.sizeBytes, asset.sizeBytes);
            assert.equal(inspected.sha256, asset.sha256);
        }

        const proPlayback = await getPlayback(
            String(content._id),
            String(proUser._id),
        );
        const familyPlayback = await getPlayback(
            String(content._id),
            String(familyUser._id),
        );
        assert.equal(proPlayback.content.selectedQuality, "1080p");
        assert.equal(familyPlayback.content.selectedQuality, "2160p");
        assert.equal(
            proPlayback.content.qualityOptions.find(
                (option) => option.value === "2160p",
            )?.locked,
            true,
        );
        assert.equal(
            familyPlayback.content.qualityOptions.find(
                (option) => option.value === "2160p",
            )?.locked,
            false,
        );

        const hdAsset = assets.find((asset) => asset.quality === "1080p");
        const ultraHdAsset = assets.find((asset) => asset.quality === "2160p");
        await getMediaDeliveryContext(String(hdAsset._id), String(proUser._id));
        await getMediaDeliveryContext(
            String(ultraHdAsset._id),
            String(familyUser._id),
        );
        await assert.rejects(
            getMediaDeliveryContext(
                String(ultraHdAsset._id),
                String(proUser._id),
            ),
            (error) => error?.code === "MEDIA_QUALITY_FORBIDDEN",
        );

        summary.push({
            title: content.title,
            type: content.type,
            qualities: assets.map((asset) => asset.quality),
            proSelectedQuality: proPlayback.content.selectedQuality,
            familySelectedQuality: familyPlayback.content.selectedQuality,
            storageIntegrity: "verified",
        });
    }

    const detachedChildren = await db.collection("contents")
        .find({ slug: { $in: DETACHED_CHILD_SLUGS } })
        .toArray();
    assert.equal(detachedChildren.length, DETACHED_CHILD_SLUGS.length);
    for (const child of detachedChildren) {
        assert.equal(child.type, "movie");
        assert.equal(child.seriesId, undefined);
        assert.equal(child.seasonNumber, undefined);
        assert.equal(child.episodeNumber, undefined);
    }

    console.log(
        JSON.stringify(
            {
                database: env.mongoDbName,
                verified: true,
                contents: summary,
                detachedChildrenPreserved: detachedChildren.length,
            },
            null,
            2,
        ),
    );
}

try {
    await main();
} catch (error) {
    console.error(
        error instanceof Error ? error.message : "A verificação de media falhou.",
    );
    process.exitCode = 1;
} finally {
    await closeDatabase();
}
