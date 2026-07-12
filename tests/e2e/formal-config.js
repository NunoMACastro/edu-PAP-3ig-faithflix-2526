/**
 * @file Factory testável da configuração Playwright funcional FaithFlix.
 */

import { defineConfig, devices } from "@playwright/test";
import { assertFormalE2eEnvironment } from "../../scripts/e2e-environment.mjs";
import { resolveE2eMediaStorageRoot } from "../../real_dev/backend/scripts/e2e-media-fixture.js";

export const CROSS_BROWSER_TAG = /@cross-browser/u;

/**
 * Constrói a configuração formal após validar o alvo MongoDB isolado.
 *
 * Chromium executa a suite funcional inteira. Firefox e WebKit executam o
 * sweep sem mutações persistentes de domínio marcado, evitando repetir essas
 * mutações sobre a mesma fixture.
 * Os fluxos mutáveis cross-browser continuam a exigir reseed isolado por
 * engine antes de poderem constituir prova.
 *
 * @param {Record<string, string | undefined>} source Ambiente do processo.
 * @returns {import("@playwright/test").PlaywrightTestConfig} Configuração.
 */
export function createFormalE2eConfig(source) {
    const { mongoUri, mongoDbName } = assertFormalE2eEnvironment(source);
    const mediaStorageRoot = resolveE2eMediaStorageRoot(source);
    const backendEnvironment = {
        NODE_ENV: "test",
        HOST: "127.0.0.1",
        PORT: "3101",
        SERVICE_NAME: "faithflix-api-e2e",
        BUILD_VERSION: "local-e2e",
        FRONTEND_ORIGIN: "http://127.0.0.1:5181",
        FORCE_HTTPS: "false",
        TRUST_PROXY_HOPS: "0",
        RATE_LIMIT_PEPPER: "faithflix-e2e-local-only",
        MONGODB_URI: mongoUri,
        MONGODB_DB_NAME: mongoDbName,
        MEDIA_STORAGE_ROOT: mediaStorageRoot,
    };

    return defineConfig({
        testDir: "tests/e2e",
        testIgnore: [
            "media-fixtures.spec.js",
            "demo-read-only.spec.js",
            "series-episodes.spec.js",
        ],
        timeout: 60_000,
        expect: { timeout: 10_000 },
        fullyParallel: false,
        workers: 1,
        reporter: [
            ["list"],
            [
                "html",
                {
                    outputFolder: "playwright-report/e2e-html-report",
                    open: "never",
                },
            ],
        ],
        use: {
            baseURL: "http://127.0.0.1:5181",
            serviceWorkers: "block",
            trace: "retain-on-failure",
            screenshot: "only-on-failure",
            video: "retain-on-failure",
        },
        projects: [
            {
                name: "chromium",
                metadata: { scope: "functional-suite" },
                use: { ...devices["Desktop Chrome"] },
            },
            {
                name: "firefox",
                metadata: { scope: "critical-domain-read-only" },
                grep: CROSS_BROWSER_TAG,
                use: { ...devices["Desktop Firefox"] },
            },
            {
                name: "webkit",
                metadata: { scope: "critical-domain-read-only" },
                grep: CROSS_BROWSER_TAG,
                use: { ...devices["Desktop Safari"] },
            },
        ],
        webServer: [
            {
                command: "npm --prefix real_dev/backend start",
                url: "http://127.0.0.1:3101/health/ready",
                env: backendEnvironment,
                reuseExistingServer: false,
                timeout: 30_000,
            },
            {
                command:
                    "npm --prefix real_dev/frontend run preview -- --host 127.0.0.1 --port 5181",
                url: "http://127.0.0.1:5181",
                reuseExistingServer: false,
                timeout: 30_000,
            },
        ],
    });
}
