/**
 * @file Instalação segura da fixture MP4 privada usada pelos seeds E2E.
 *
 * O helper deriva uma raiz temporária por base `_e2e`, valida-a através da
 * mesma camada de storage do produto e nunca copia media para o frontend.
 */

import { createReadStream } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { ObjectId } from "mongodb";
import {
    createOpaqueMediaStorageKey,
    ensureMediaStorageRoot,
    removeMediaStorageFiles,
    storeMediaUpload,
} from "../src/modules/media/media-storage.service.js";

const SYNTHETIC_PROGRESSIVE_FIXTURE = fileURLToPath(
    new URL(
        "../../../tests/fixtures/media/synthetic-progressive.mp4",
        import.meta.url,
    ),
);

/**
 * Confirma que um path pertence ao diretório temporário do sistema.
 *
 * @param {string} parent Diretório pai absoluto.
 * @param {string} candidate Path absoluto candidato.
 * @returns {boolean} Verdadeiro para o próprio pai ou um descendente.
 */
function pathIsInside(parent, candidate) {
    const child = relative(parent, candidate);
    return child === "" || (!child.startsWith("..") && !isAbsolute(child));
}

/**
 * Resolve a raiz partilhada pelo seed e pelo backend Playwright.
 *
 * Quando `MEDIA_STORAGE_ROOT` não é fornecida, o nome da DB isolada produz uma
 * localização determinística dentro de `tmp`. Um override continua obrigado a
 * ser absoluto e temporário.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente E2E.
 * @returns {string} Raiz absoluta e temporária.
 */
export function resolveE2eMediaStorageRoot(source = process.env) {
    const mongoDbName = source.TEST_MONGODB_DB_NAME?.trim() ?? "";
    if (!/^[A-Za-z0-9_-]+_e2e$/u.test(mongoDbName)) {
        throw new Error(
            "TEST_MONGODB_DB_NAME valida e terminada em _e2e e obrigatoria para media E2E.",
        );
    }

    const configuredRoot = source.MEDIA_STORAGE_ROOT?.trim();
    const root = configuredRoot
        ? resolve(configuredRoot)
        : join(tmpdir(), `faithflix-e2e-media-${mongoDbName}`);
    const temporaryRoot = resolve(tmpdir());

    if (
        (configuredRoot && !isAbsolute(configuredRoot)) ||
        !pathIsInside(temporaryRoot, root)
    ) {
        throw new Error(
            "MEDIA_STORAGE_ROOT E2E tem de ser absoluta e temporaria.",
        );
    }

    return root;
}

/**
 * Remove ficheiros e documentos do próprio marcador E2E antes do reseed.
 *
 * @param {import("mongodb").Db} db Base E2E já autorizada.
 * @param {string} e2eTag Marcador fechado do seed.
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {Promise<void>} Termina depois da limpeza limitada ao marcador.
 */
export async function cleanupE2eMediaAssets(
    db,
    e2eTag,
    source = process.env,
) {
    const root = resolveE2eMediaStorageRoot(source);
    await ensureMediaStorageRoot(root);
    const assets = await db
        .collection("media_assets")
        .find({ e2eFixture: e2eTag })
        .toArray();

    for (const asset of assets) {
        await removeMediaStorageFiles(asset.storageKey, root);
    }
    await db.collection("media_assets").deleteMany({ e2eFixture: e2eTag });
}

/**
 * Copia a fixture auditada por stream e cria um asset ativo canónico.
 *
 * @param {import("mongodb").Db} db Base E2E autorizada.
 * @param {{ contentId: ObjectId, createdBy: ObjectId, quality: string, e2eTag: string, now: Date, assetId?: ObjectId, source?: Record<string, string | undefined> }} input Identidade e metadata do asset.
 * @returns {Promise<Record<string, unknown>>} Documento inserido.
 */
export async function installE2eMediaAsset(db, input) {
    const root = resolveE2eMediaStorageRoot(input.source ?? process.env);
    await ensureMediaStorageRoot(root);

    const storageKey = createOpaqueMediaStorageKey();
    const stored = await storeMediaUpload(
        createReadStream(SYNTHETIC_PROGRESSIVE_FIXTURE),
        { storageKey, root },
    );
    const asset = {
        _id: input.assetId ?? new ObjectId(),
        contentId: input.contentId,
        storageKey,
        quality: input.quality,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        sha256: stored.sha256,
        status: "ready",
        active: true,
        createdBy: input.createdBy,
        activatedBy: input.createdBy,
        e2eFixture: input.e2eTag,
        createdAt: input.now,
        updatedAt: input.now,
        uploadedAt: input.now,
        activatedAt: input.now,
    };

    try {
        await db.collection("media_assets").insertOne(asset);
        return asset;
    } catch (error) {
        await removeMediaStorageFiles(storageKey, root).catch(() => undefined);
        throw error;
    }
}
