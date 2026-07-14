/** @file Inserção do catálogo e dos MP4 privados FaithFlix demo-v2. */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import {
    mediaStorageConfig,
    removeMediaStorageFiles,
    storeMediaUpload,
} from "../src/modules/media/media-storage.service.js";

import {
    DEMO_FIXTURE,
    DEMO_MEDIA_FIXTURE_SHA256,
    DEMO_MEDIA_FIXTURE_SIZE_BYTES,
    addDays,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

const SYNTHETIC_MEDIA_FIXTURE = fileURLToPath(
    new URL(
        "../../../tests/fixtures/media/synthetic-progressive.mp4",
        import.meta.url,
    ),
);

/**
 * Copia a fixture auditada para cada storage key privada da demo.
 *
 * Apenas chaves determinísticas pertencentes ao manifesto são removidas antes
 * da escrita. O diretório inteiro nunca é apagado, preservando outros uploads
 * locais que possam existir no mesmo `MEDIA_STORAGE_ROOT`.
 *
 * @param {Record<string, unknown>[]} mediaAssets Assets do manifesto.
 * @param {{ storageRoot?: string, fixturePath?: string }} [options] Paths injetáveis em testes.
 * @returns {Promise<void>} Termina quando todos os ficheiros finais existem.
 */
export async function prepareDemoMediaFiles(mediaAssets, options = {}) {
    const storageRoot = options.storageRoot ?? mediaStorageConfig.root;
    const fixturePath = options.fixturePath ?? SYNTHETIC_MEDIA_FIXTURE;
    const bytes = await readFile(fixturePath);
    const checksum = createHash("sha256").update(bytes).digest("hex");

    if (
        bytes.length !== DEMO_MEDIA_FIXTURE_SIZE_BYTES ||
        checksum !== DEMO_MEDIA_FIXTURE_SHA256
    ) {
        const error = new Error(
            "A fixture sintetica de media nao corresponde ao artefacto auditado.",
        );
        error.code = "DEMO_MEDIA_FIXTURE_INVALID";
        throw error;
    }

    try {
        for (const asset of mediaAssets) {
            await removeMediaStorageFiles(asset.storageKey, storageRoot);
            const stored = await storeMediaUpload(Readable.from([bytes]), {
                root: storageRoot,
                storageKey: asset.storageKey,
                maxBytes: bytes.length,
                expectedSizeBytes: asset.sizeBytes,
                expectedSha256: asset.sha256,
                contentLength: bytes.length,
            });
            if (
                stored.sizeBytes !== asset.sizeBytes ||
                stored.sha256 !== asset.sha256
            ) {
                throw Object.assign(
                    new Error("Asset privado da demo ficou incoerente."),
                    { code: "DEMO_MEDIA_STORAGE_INVALID" },
                );
            }
        }
    } catch (error) {
        await Promise.all(
            mediaAssets.map((asset) =>
                removeMediaStorageFiles(asset.storageKey, storageRoot).catch(
                    () => undefined,
                )),
        );
        throw error;
    }
}

/**
 * Remove exclusivamente os ficheiros cujas chaves pertencem ao manifesto demo.
 *
 * @param {Record<string, unknown>[]} mediaAssets Assets determinísticos.
 * @param {{ storageRoot?: string }} [options] Raiz privada opcional.
 * @returns {Promise<void>} Termina quando final e `.partial` deixam de existir.
 */
export async function cleanupDemoMediaFiles(mediaAssets, options = {}) {
    const storageRoot = options.storageRoot ?? mediaStorageConfig.root;
    await Promise.all(
        mediaAssets.map((asset) =>
            removeMediaStorageFiles(asset.storageKey, storageRoot)),
    );
}

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoCatalog() {
    const db = await getDemoDb();
    const {
        taxonomies,
        contents,
        contentIds,
        mediaAssets,
        userIds,
        referenceDate,
        dataSeed,
    } = getDemoContext();
    await prepareDemoMediaFiles(mediaAssets);

    try {
        await db.collection("taxonomies").insertMany(taxonomies);
        await db.collection("contents").insertMany(contents);
        await db.collection("media_assets").insertMany(mediaAssets);
        await db.collection("content_revisions").insertMany([
            {
                _id: deterministicId("content-revision", 1, dataSeed),
                contentId: contentIds[44],
                action: "demo-initial-draft",
                snapshot: contents[44],
                changedBy: userIds.moderator,
                demoFixture: DEMO_FIXTURE,
                createdAt: addDays(referenceDate, -2),
            },
            {
                _id: deterministicId("content-revision", 2, dataSeed),
                contentId: contentIds[45],
                action: "demo-editorial-review",
                snapshot: contents[45],
                changedBy: userIds.moderator,
                demoFixture: DEMO_FIXTURE,
                createdAt: addDays(referenceDate, -1),
            },
        ]);
        return {
            taxonomies: taxonomies.length,
            contents: contents.length,
            published: contents.filter((item) => item.status === "published").length,
            mediaAssets: mediaAssets.length,
        };
    } catch (error) {
        await cleanupDemoMediaFiles(mediaAssets).catch(() => undefined);
        throw error;
    }
}
