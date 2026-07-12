/**
 * @file Contratos puramente locais do harness E2E formal.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertFormalE2eEnvironment } from "../../scripts/e2e-environment.mjs";
import {
    CROSS_BROWSER_TAG,
    createFormalE2eConfig,
} from "../e2e/formal-config.js";
import { E2E_COVERAGE, REQUIRED_E2E_AREAS } from "../e2e/coverage-manifest.js";
import { resolveE2eMediaStorageRoot } from "../../real_dev/backend/scripts/e2e-media-fixture.js";

const SAFE_ENV = Object.freeze({
    NODE_ENV: "test",
    TEST_MONGODB_URI: "mongodb://127.0.0.1:27027/?replicaSet=faithflix-e2e",
    TEST_MONGODB_DB_NAME: "faithflix_contract_e2e",
    MONGODB_URI: "mongodb://127.0.0.1:27017",
    MONGODB_DB_NAME: "faithflix",
});

test("guard exige ambiente test, URI explícita e DB _e2e", () => {
    assert.throws(() => assertFormalE2eEnvironment({}), /NODE_ENV=test/u);
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, NODE_ENV: "development" }),
        /NODE_ENV=test/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, TEST_MONGODB_URI: "" }),
        /TEST_MONGODB_URI/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({
            ...SAFE_ENV,
            TEST_MONGODB_URI: "mongodb://127.0.0.1:27027/",
        }),
        /replicaSet/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({
            ...SAFE_ENV,
            TEST_MONGODB_URI:
                "mongodb://127.0.0.1:27027/?replicaSet=faithflix-e2e&proxyHost=proxy.invalid",
        }),
        /apenas o parâmetro replicaSet/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({
            ...SAFE_ENV,
            TEST_MONGODB_URI:
                "mongodb://user:fixture@127.0.0.1:27027/?replicaSet=faithflix-e2e",
        }),
        /não pode incluir credenciais/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({
            ...SAFE_ENV,
            TEST_MONGODB_URI:
                "mongodb://127.0.0.1:0/?replicaSet=faithflix-e2e",
        }),
        /porta inválida/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, TEST_MONGODB_DB_NAME: "faithflix_test" }),
        /terminar em _e2e/u,
    );
});

test("guard recusa Internet, nomes operacionais e configuração normal", () => {
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, PUBLISH_EVIDENCE: "true" }),
        /não pode publicar artefactos/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, TEST_MONGODB_URI: "mongodb+srv://cluster.invalid" }),
        /mongodb:\/\//u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, TEST_MONGODB_DB_NAME: "shared_e2e" }),
        /partilhada/u,
    );
    assert.throws(
        () => assertFormalE2eEnvironment({ ...SAFE_ENV, MONGODB_URI: SAFE_ENV.TEST_MONGODB_URI }),
        /configuração MongoDB normal/u,
    );
    assert.deepEqual(assertFormalE2eEnvironment(SAFE_ENV), {
        mongoUri: SAFE_ENV.TEST_MONGODB_URI,
        mongoDbName: SAFE_ENV.TEST_MONGODB_DB_NAME,
    });
});

test("Playwright usa três engines, servidores novos e DB isolada sem URI no comando", () => {
    const config = createFormalE2eConfig(SAFE_ENV);
    assert.deepEqual(config.projects.map(({ name }) => name), [
        "chromium",
        "firefox",
        "webkit",
    ]);
    assert.equal(config.workers, 1);
    assert.deepEqual(config.testIgnore, [
        "media-fixtures.spec.js",
        "demo-read-only.spec.js",
        "series-episodes.spec.js",
    ]);
    assert.equal(config.projects[1].grep, CROSS_BROWSER_TAG);
    assert.equal(config.projects[2].grep, CROSS_BROWSER_TAG);

    for (const server of config.webServer) {
        assert.equal(server.reuseExistingServer, false);
        assert.doesNotMatch(server.command, /\bdev\b|--watch/u);
        assert.doesNotMatch(server.command, /mongodb(?:\+srv)?:\/\//u);
    }
    assert.equal(config.webServer[0].env.NODE_ENV, "test");
    assert.equal(config.webServer[0].env.MONGODB_URI, SAFE_ENV.TEST_MONGODB_URI);
    assert.equal(config.webServer[0].env.MONGODB_DB_NAME, SAFE_ENV.TEST_MONGODB_DB_NAME);
    assert.equal(
        config.webServer[0].env.MEDIA_STORAGE_ROOT,
        resolveE2eMediaStorageRoot(SAFE_ENV),
    );
    assert.notEqual(config.webServer[0].env.MONGODB_URI, SAFE_ENV.MONGODB_URI);
});

test("media E2E exige DB isolada e raiz temporária absoluta", () => {
    assert.throws(
        () => resolveE2eMediaStorageRoot({ ...SAFE_ENV, TEST_MONGODB_DB_NAME: "faithflix" }),
        /_e2e/u,
    );
    assert.throws(
        () => resolveE2eMediaStorageRoot({ ...SAFE_ENV, MEDIA_STORAGE_ROOT: "relative/media" }),
        /absoluta e temporaria/u,
    );
    assert.throws(
        () => resolveE2eMediaStorageRoot({ ...SAFE_ENV, MEDIA_STORAGE_ROOT: "/var/media" }),
        /absoluta e temporaria/u,
    );
    assert.match(
        resolveE2eMediaStorageRoot(SAFE_ENV),
        /faithflix-e2e-media-faithflix_contract_e2e$/u,
    );
});

test("inventário contém todas as áreas sem declarar resultados", () => {
    assert.deepEqual(Object.keys(E2E_COVERAGE), REQUIRED_E2E_AREAS);
    const serialized = JSON.stringify(E2E_COVERAGE);
    assert.doesNotMatch(serialized, /\bpass(?:ed)?\b|validado/iu);
    assert.match(E2E_COVERAGE.jobs.limitation, /não existe ainda prova browser/iu);
    assert.match(E2E_COVERAGE.media.limitation, /Não prova vídeo real/iu);
});

test("package root expõe os scripts formais sem watchers nem seeds no E2E", async () => {
    const [
        packageJson,
        backendPackage,
        frontendPackage,
        mf4Spec,
        mf2Spec,
        mf9Spec,
        mf2Seed,
        mf9Seed,
        sharedFixtures,
        serverSource,
        seriesConfig,
        seriesSpec,
    ] = await Promise.all(
        [
            "package.json",
            "real_dev/backend/package.json",
            "real_dev/frontend/package.json",
            "tests/e2e/mf4-flow.spec.js",
            "tests/e2e/mf2-flow.spec.js",
            "tests/e2e/mf9-family-subscription.spec.js",
            "real_dev/backend/scripts/seed-mf2-e2e.js",
            "real_dev/backend/scripts/seed-mf9-e2e.js",
            "tests/e2e/test.js",
            "real_dev/backend/src/server.js",
            "playwright.series.config.js",
            "tests/e2e/series-episodes.spec.js",
        ].map(async (path, index) => {
            const content = await readFile(path, "utf8");
            return index < 3 ? JSON.parse(content) : content;
        }),
    );
    const requiredScripts = [
        "lint",
        "test:unit",
        "test:integration",
        "test:contracts",
        "test:security",
        "test:e2e",
        "test:a11y",
        "check:media",
        "validate",
    ];
    for (const name of requiredScripts) assert.equal(typeof packageJson.scripts[name], "string");
    assert.match(packageJson.scripts["test:e2e"], /^node scripts\/e2e-environment\.mjs/u);
    assert.doesNotMatch(packageJson.scripts["test:e2e"], /seed:|--watch|\bdev\b/u);
    assert.match(
        packageJson.scripts["test:e2e:series"],
        /^node scripts\/e2e-environment\.mjs/u,
    );
    assert.doesNotMatch(
        packageJson.scripts["test:e2e:series"],
        /seed:|--watch|\bdev\b/u,
    );
    assert.equal(
        frontendPackage.scripts["test:contracts"],
        "vitest run src/services/api",
    );
    assert.doesNotMatch(
        frontendPackage.scripts["test:contracts"],
        /passWithNoTests/u,
    );
    assert.match(
        backendPackage.scripts["test:security"],
        /^node --test .+ && node scripts\/check-security-baseline\.mjs$/u,
    );
    assert.doesNotMatch(mf4Spec, /browser\.newContext\(/u);
    assert.doesNotMatch(mf9Spec, /browser\.newContext\(/u);
    assert.match(mf4Spec, /createNetworkSafeContext/u);
    assert.match(mf9Spec, /createNetworkSafeContext/u);
    assert.match(mf2Spec, /api.{0,8}media/u);
    assert.doesNotMatch(mf2Spec, /\/media\/piloto\.mp4/u);
    assert.match(mf9Spec, /\/api\/media/u);
    assert.doesNotMatch(mf9Spec, /mf9-1080|mf9-2160/u);
    for (const seedSource of [mf2Seed, mf9Seed]) {
        assert.match(seedSource, /installE2eMediaAsset/u);
        assert.doesNotMatch(seedSource, /playbackUrl:\s*["']\/media\//u);
    }
    assert.match(sharedFixtures, /installDeterministicNetworkPolicy\(context\)/u);
    assert.match(seriesConfig, /assertFormalE2eEnvironment/u);
    assert.match(seriesConfig, /real_dev\/backend start/u);
    assert.match(seriesConfig, /real_dev\/frontend run preview/u);
    assert.doesNotMatch(seriesConfig, /\bdev\b|reuseExistingServer:\s*true/u);
    assert.doesNotMatch(seriesSpec, /page\.route|route\.fulfill/u);
    assert.match(seriesSpec, /API_ORIGIN\s*=\s*["']http:\/\/127\.0\.0\.1:3103["']/u);
    assert.match(seriesSpec, /\/api\/catalog/u);
    assert.match(seriesSpec, /SECOND_EPISODE_SLUG/u);
    assert.match(mf2Seed, /seasonNumber:\s*2/u);
    assert.equal(createFormalE2eConfig(SAFE_ENV).webServer[0].env.HOST, "127.0.0.1");
    assert.match(serverSource, /app\.listen\(env\.port, env\.host,/u);
});
