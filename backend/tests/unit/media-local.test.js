/**
 * @file Testes unitários da ingestão local MP4 e semântica HTTP Range.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
    access,
    mkdir,
    mkdtemp,
    readFile,
    rm,
    symlink,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { toPublicMediaAsset } from "../../src/modules/media/media-assets.service.js";
import { resolveMediaByteRange } from "../../src/modules/media/media-http.js";
import {
    buildMediaStorageConfig,
    createOpaqueMediaStorageKey,
    ensureMediaStorageRoot,
    mediaStoragePaths,
    openMediaStorageFile,
    storeMediaUpload,
} from "../../src/modules/media/media-storage.service.js";
import {
    assertActivateMediaUploadPayload,
    assertCreateMediaUploadPayload,
    assertMediaUploadHeaders,
    MAX_MEDIA_UPLOAD_BYTES,
} from "../../src/modules/media/media.validation.js";

/**
 * Constrói um cabeçalho/ficheiro mínimo com box `ftyp` suficiente para validar
 * a fronteira de ingestão, sem representar um vídeo real de demonstração.
 *
 * @returns {Buffer} Bytes ISO BMFF sintéticos.
 */
function minimalMp4() {
    return Buffer.concat([
        Buffer.from([0, 0, 0, 24]),
        Buffer.from("ftyp", "ascii"),
        Buffer.from("isom", "ascii"),
        Buffer.from([0, 0, 2, 0]),
        Buffer.from("isom", "ascii"),
        Buffer.from("mp42", "ascii"),
    ]);
}

/**
 * Cria uma raiz descartável e regista a limpeza automática no teste.
 *
 * @param {import("node:test").TestContext} t Contexto node:test.
 * @returns {Promise<string>} Diretório temporário.
 */
async function temporaryStorage(t) {
    const root = await mkdtemp(join(tmpdir(), "faithflix-media-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    return root;
}

test("payload de criação usa allowlist e contrato MP4 fechado", () => {
    const sha256 = "A".repeat(64);
    assert.deepEqual(
        assertCreateMediaUploadPayload({
            quality: " 1080P ",
            mimeType: "video/mp4",
            expectedSizeBytes: 24,
            expectedSha256: sha256,
        }),
        {
            quality: "1080p",
            mimeType: "video/mp4",
            expectedSizeBytes: 24,
            expectedSha256: sha256.toLowerCase(),
        },
    );

    for (const payload of [
        { quality: "8k" },
        { quality: "1080p", mimeType: "application/x-mpegURL" },
        { quality: "1080p", filename: "../../public/video.mp4" },
        { quality: "1080p", expectedSizeBytes: MAX_MEDIA_UPLOAD_BYTES + 1 },
        { quality: "1080p", expectedSha256: "not-a-hash" },
    ]) {
        assert.throws(
            () => assertCreateMediaUploadPayload(payload),
            (error) =>
                error.statusCode === 400 &&
                error.code === "MEDIA_UPLOAD_INVALID",
        );
    }
});

test("ativação exige apenas expectedVersion inteiro positivo", () => {
    assert.deepEqual(assertActivateMediaUploadPayload({ expectedVersion: 3 }), {
        expectedVersion: 3,
    });
    assert.throws(
        () => assertActivateMediaUploadPayload({ expectedVersion: "3" }),
        (error) =>
            error.statusCode === 400 &&
            error.code === "EXPECTED_VERSION_REQUIRED",
    );
    assert.throws(
        () =>
            assertActivateMediaUploadPayload({
                expectedVersion: 3,
                mediaUrl: "/public/injected.mp4",
            }),
        (error) => error.code === "MEDIA_UPLOAD_INVALID",
    );
});

test("headers permitem streaming chunked mas validam MIME, tamanho e limite", () => {
    assert.deepEqual(
        assertMediaUploadHeaders(
            { "content-type": "video/mp4; charset=binary" },
            {},
        ),
        { contentLength: null },
    );
    assert.deepEqual(
        assertMediaUploadHeaders(
            { "content-type": "video/mp4", "content-length": "24" },
            { expectedSizeBytes: 24 },
        ),
        { contentLength: 24 },
    );
    assert.throws(
        () =>
            assertMediaUploadHeaders(
                { "content-type": "application/octet-stream" },
                {},
            ),
        (error) => error.statusCode === 415,
    );
    assert.throws(
        () =>
            assertMediaUploadHeaders(
                { "content-type": "video/mp4", "content-length": "25" },
                { expectedSizeBytes: 24 },
            ),
        (error) => error.code === "MEDIA_UPLOAD_INVALID",
    );
    assert.throws(
        () =>
            assertMediaUploadHeaders(
                { "content-type": "video/mp4", "content-length": "25" },
                {},
                24,
            ),
        (error) =>
            error.statusCode === 413 &&
            error.code === "MEDIA_UPLOAD_TOO_LARGE",
    );
});

test("configuração impede storage público e limites acima de 512 MiB", () => {
    assert.throws(
        () =>
            buildMediaStorageConfig({
                MEDIA_STORAGE_ROOT: "../frontend/public/private-media",
            }),
        (error) => error.code === "MEDIA_STORAGE_CONFIGURATION_INVALID",
    );
    assert.throws(
        () =>
            buildMediaStorageConfig({
                MEDIA_UPLOAD_MAX_BYTES: String(MAX_MEDIA_UPLOAD_BYTES + 1),
            }),
        (error) => error.code === "MEDIA_STORAGE_CONFIGURATION_INVALID",
    );
    assert.equal(
        buildMediaStorageConfig({ MEDIA_UPLOAD_MAX_BYTES: "1048576" })
            .maxUploadBytes,
        1_048_576,
    );
});

test("storage root rejeita symlink final, ficheiro e alias intermédio público", async (t) => {
    const root = await temporaryStorage(t);
    const safeTarget = join(root, "safe-target");
    await mkdir(safeTarget);

    const finalSymlink = join(root, "final-symlink");
    await symlink(safeTarget, finalSymlink, "dir");
    await assert.rejects(
        ensureMediaStorageRoot(finalSymlink),
        (error) => error.code === "MEDIA_STORAGE_CONFIGURATION_INVALID",
    );

    const fileRoot = join(root, "not-a-directory");
    await writeFile(fileRoot, "not a directory");
    await assert.rejects(
        ensureMediaStorageRoot(fileRoot),
        (error) => error.code === "MEDIA_STORAGE_CONFIGURATION_INVALID",
    );

    const publicAlias = join(root, "public-alias");
    const frontendPublic = resolve(process.cwd(), "../frontend/public");
    await symlink(frontendPublic, publicAlias, "dir");
    const forbiddenChildName = `__media-storage-test-${process.pid}`;
    const forbiddenRoot = join(publicAlias, forbiddenChildName);
    await assert.rejects(
        ensureMediaStorageRoot(forbiddenRoot),
        (error) => error.code === "MEDIA_STORAGE_CONFIGURATION_INVALID",
    );
    await assert.rejects(
        access(join(frontendPublic, forbiddenChildName)),
        { code: "ENOENT" },
    );
});

test("storage key é opaca e paths manipulados são recusados", () => {
    const key = createOpaqueMediaStorageKey();
    assert.match(key, /^[a-f0-9]{64}\.mp4$/);
    assert.throws(
        () => mediaStoragePaths("../../frontend/public/video.mp4", tmpdir()),
        (error) => error.code === "MEDIA_STORAGE_KEY_INVALID",
    );
});

test("upload válido calcula SHA-256 e só publica o ficheiro final", async (t) => {
    const root = await temporaryStorage(t);
    const bytes = minimalMp4();
    const storageKey = createOpaqueMediaStorageKey();
    const expectedSha256 = createHash("sha256").update(bytes).digest("hex");
    const stored = await storeMediaUpload(
        Readable.from([bytes.subarray(0, 7), bytes.subarray(7)]),
        {
            root,
            storageKey,
            maxBytes: 1_024,
            expectedSizeBytes: bytes.length,
            expectedSha256,
            contentLength: bytes.length,
        },
    );

    assert.deepEqual(stored, {
        sizeBytes: bytes.length,
        sha256: expectedSha256,
        mimeType: "video/mp4",
    });
    const paths = mediaStoragePaths(storageKey, root);
    assert.deepEqual(await readFile(paths.finalPath), bytes);
    await assert.rejects(access(paths.partialPath), { code: "ENOENT" });

    const opened = await openMediaStorageFile(storageKey, root);
    assert.equal(opened.sizeBytes, bytes.length);
    await opened.handle.close();
});

test("upload inválido ou demasiado grande nunca deixa final nem partial", async (t) => {
    const root = await temporaryStorage(t);

    for (const scenario of [
        {
            bytes: Buffer.from("not-an-mp4"),
            maxBytes: 1_024,
            expectedCode: "MEDIA_UPLOAD_INVALID",
        },
        {
            bytes: minimalMp4(),
            maxBytes: 16,
            expectedCode: "MEDIA_UPLOAD_TOO_LARGE",
        },
        {
            bytes: minimalMp4(),
            maxBytes: 1_024,
            contentLength: 25,
            expectedCode: "MEDIA_UPLOAD_INVALID",
        },
    ]) {
        const storageKey = createOpaqueMediaStorageKey();
        const paths = mediaStoragePaths(storageKey, root);
        await assert.rejects(
            storeMediaUpload(Readable.from([scenario.bytes]), {
                root,
                storageKey,
                maxBytes: scenario.maxBytes,
                contentLength: scenario.contentLength,
            }),
            (error) => error.code === scenario.expectedCode,
        );
        await assert.rejects(access(paths.partialPath), { code: "ENOENT" });
        await assert.rejects(access(paths.finalPath), { code: "ENOENT" });
    }
});

test("stream interrompido é limpo e não pode produzir asset final", async (t) => {
    const root = await temporaryStorage(t);
    const storageKey = createOpaqueMediaStorageKey();
    const paths = mediaStoragePaths(storageKey, root);
    const interrupted = Readable.from(
        (async function* interruptedUpload() {
            yield minimalMp4().subarray(0, 12);
            const error = new Error("client disconnected");
            error.code = "ABORT_ERR";
            throw error;
        })(),
    );

    await assert.rejects(
        storeMediaUpload(interrupted, {
            root,
            storageKey,
            maxBytes: 1_024,
        }),
        (error) =>
            error.statusCode === 400 && error.code === "MEDIA_UPLOAD_INVALID",
    );
    await assert.rejects(access(paths.partialPath), { code: "ENOENT" });
    await assert.rejects(access(paths.finalPath), { code: "ENOENT" });
});

test("byte ranges cobrem resposta completa, prefixo, aberto e sufixo", () => {
    assert.deepEqual(resolveMediaByteRange(undefined, 100), {
        statusCode: 200,
        start: 0,
        end: 99,
        length: 100,
        contentRange: null,
    });
    assert.deepEqual(resolveMediaByteRange("bytes=10-19", 100), {
        statusCode: 206,
        start: 10,
        end: 19,
        length: 10,
        contentRange: "bytes 10-19/100",
    });
    assert.deepEqual(resolveMediaByteRange("bytes=90-", 100), {
        statusCode: 206,
        start: 90,
        end: 99,
        length: 10,
        contentRange: "bytes 90-99/100",
    });
    assert.deepEqual(resolveMediaByteRange("bytes=-7", 100), {
        statusCode: 206,
        start: 93,
        end: 99,
        length: 7,
        contentRange: "bytes 93-99/100",
    });
    assert.equal(resolveMediaByteRange("bytes=0-999", 100).end, 99);
});

test("ranges inválidos e múltiplos devolvem 416 com Content-Range total", () => {
    for (const header of [
        "bytes=100-",
        "bytes=20-10",
        "bytes=-0",
        "bytes=0-1,5-8",
        "items=0-1",
    ]) {
        assert.throws(
            () => resolveMediaByteRange(header, 100),
            (error) =>
                error.statusCode === 416 &&
                error.code === "MEDIA_RANGE_INVALID" &&
                error.contentRange === "bytes */100",
        );
    }
});

test("serialização administrativa nunca revela storageKey", () => {
    const storageKey = createOpaqueMediaStorageKey();
    const asset = toPublicMediaAsset({
        _id: new ObjectId(),
        contentId: new ObjectId(),
        storageKey,
        quality: "1080p",
        mimeType: "video/mp4",
        sizeBytes: 24,
        sha256: "a".repeat(64),
        status: "uploaded",
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    assert.equal("storageKey" in asset, false);
    assert.equal(JSON.stringify(asset).includes(storageKey), false);
    assert.equal(asset.mimeType, "video/mp4");
});
