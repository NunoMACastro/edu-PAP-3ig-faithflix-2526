/** @file Configuração Playwright read-only para a base Atlas demo-v2. */

import { randomUUID } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";
import { assertDemoVerifyEnvironment } from "./real_dev/backend/scripts/seed-safety.js";

const target = assertDemoVerifyEnvironment(process.env);
const userPassword = process.env.DEMO_USER_PASSWORD?.trim();
const adminPassword = process.env.DEMO_ADMIN_PASSWORD?.trim();
const rateLimitPepper = `faithflix-demo-smoke-${randomUUID()}`;
if (!userPassword || !adminPassword) {
    throw new Error("O smoke demo exige DEMO_USER_PASSWORD e DEMO_ADMIN_PASSWORD.");
}

export default defineConfig({
    testDir: "tests/e2e",
    testMatch: "demo-read-only.spec.js",
    timeout: 90_000,
    expect: { timeout: 12_000 },
    workers: 1,
    reporter: "list",
    use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:5182",
        serviceWorkers: "block",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: [
        {
            command: "npm --prefix real_dev/backend start",
            url: "http://127.0.0.1:3102/health/ready",
            env: {
                NODE_ENV: "development",
                HOST: "127.0.0.1",
                PORT: "3102",
                SERVICE_NAME: "faithflix-api-demo-smoke",
                BUILD_VERSION: "demo-smoke",
                FRONTEND_ORIGIN: "http://127.0.0.1:5182",
                FORCE_HTTPS: "false",
                TRUST_PROXY_HOPS: "0",
                RATE_LIMIT_PEPPER: rateLimitPepper,
                MONGODB_URI: target.mongoUri,
                MONGODB_DB_NAME: target.mongoDbName,
            },
            reuseExistingServer: false,
            timeout: 45_000,
        },
        {
            command:
                "VITE_API_BASE_URL=http://127.0.0.1:3102 npm --prefix real_dev/frontend run preview -- --mode test --host 127.0.0.1 --port 5182",
            url: "http://127.0.0.1:5182",
            reuseExistingServer: false,
            timeout: 30_000,
        },
    ],
});
