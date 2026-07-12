/**
 * @file Gate browser real da hierarquia série -> episódio.
 *
 * Exige a mesma base local replica set `_e2e` dos restantes fluxos formais.
 * A fixture é instalada previamente por `npm run seed:e2e:mf2`; este config
 * nunca cria dados nem reutiliza processos de desenvolvimento.
 */

import { defineConfig, devices } from "@playwright/test";
import { assertFormalE2eEnvironment } from "./scripts/e2e-environment.mjs";
import { resolveE2eMediaStorageRoot } from "./real_dev/backend/scripts/e2e-media-fixture.js";

const { mongoUri, mongoDbName } = assertFormalE2eEnvironment(process.env);
const mediaStorageRoot = resolveE2eMediaStorageRoot(process.env);

export default defineConfig({
    testDir: "tests/e2e",
    testMatch: "series-episodes.spec.js",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    workers: 1,
    reporter: "list",
    outputDir: "/tmp/faithflix-series-playwright",
    use: {
        baseURL: "http://127.0.0.1:5183",
        serviceWorkers: "block",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "off",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: [
        {
            command: "npm --prefix real_dev/backend start",
            url: "http://127.0.0.1:3103/health/ready",
            env: {
                NODE_ENV: "test",
                HOST: "127.0.0.1",
                PORT: "3103",
                SERVICE_NAME: "faithflix-api-series-e2e",
                BUILD_VERSION: "series-e2e",
                FRONTEND_ORIGIN: "http://127.0.0.1:5183",
                FORCE_HTTPS: "false",
                TRUST_PROXY_HOPS: "0",
                RATE_LIMIT_PEPPER: "faithflix-series-e2e-local-only",
                MONGODB_URI: mongoUri,
                MONGODB_DB_NAME: mongoDbName,
                MEDIA_STORAGE_ROOT: mediaStorageRoot,
            },
            reuseExistingServer: false,
            timeout: 30_000,
        },
        {
            command:
                "VITE_API_BASE_URL=http://127.0.0.1:3103 npm --prefix real_dev/frontend run preview -- --mode test --host 127.0.0.1 --port 5183",
            url: "http://127.0.0.1:5183",
            reuseExistingServer: false,
            timeout: 30_000,
        },
    ],
});
