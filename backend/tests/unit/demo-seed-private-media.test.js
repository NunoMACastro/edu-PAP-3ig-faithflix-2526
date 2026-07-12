/**
 * @file Provas filesystem do MP4 privado criado pelo seed demo.
 */

import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { prepareDemoMediaFiles } from "../../scripts/seed-demo-catalog.js";
import { configureDemoSeedContext } from "../../scripts/demo-seed-utils.js";

const config = {
    referenceDate: new Date("2026-07-10T12:00:00.000Z"),
    dataSeed: "faithflix-demo-v2",
    adminPassword: "admin-password-demo",
    userPassword: "user-password-demo",
};

test("seed instala fixture auditada com nomes opacos e permissões privadas", async (t) => {
    const root = await mkdtemp(join(tmpdir(), "faithflix-demo-media-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    const assets = configureDemoSeedContext(config).mediaAssets.slice(0, 2);

    await prepareDemoMediaFiles(assets, { storageRoot: root });
    // Uma segunda passagem substitui apenas as chaves determinísticas da demo.
    await prepareDemoMediaFiles(assets, { storageRoot: root });

    assert.equal((await stat(root)).mode & 0o077, 0);
    for (const asset of assets) {
        assert.match(asset.storageKey, /^[a-f0-9]{64}\.mp4$/u);
        const path = join(root, asset.storageKey);
        const fileStats = await stat(path);
        assert.equal(fileStats.size, asset.sizeBytes);
        assert.equal(fileStats.mode & 0o077, 0);
        assert.equal((await readFile(path)).length, asset.sizeBytes);
        await assert.rejects(access(`${path}.partial`), { code: "ENOENT" });
    }
});

test("fixture alterada falha antes de remover um asset privado existente", async (t) => {
    const root = await mkdtemp(join(tmpdir(), "faithflix-demo-media-"));
    const invalidFixture = join(root, "invalid.mp4");
    t.after(() => rm(root, { recursive: true, force: true }));
    const [asset] = configureDemoSeedContext(config).mediaAssets;
    await prepareDemoMediaFiles([asset], { storageRoot: root });
    const original = await readFile(join(root, asset.storageKey));
    await writeFile(invalidFixture, Buffer.from("not-a-fixture"));

    await assert.rejects(
        () => prepareDemoMediaFiles([asset], {
            storageRoot: root,
            fixturePath: invalidFixture,
        }),
        (error) => error.code === "DEMO_MEDIA_FIXTURE_INVALID",
    );
    assert.deepEqual(await readFile(join(root, asset.storageKey)), original);
});
