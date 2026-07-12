/**
 * @file Configuração Playwright isolada para media sintética, sem backend/DB.
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    testMatch: "media-fixtures.spec.js",
    timeout: 45_000,
    expect: { timeout: 15_000 },
    reporter: "list",
    outputDir: "/tmp/faithflix-media-playwright",
    use: {
        baseURL: "http://127.0.0.1:5182",
        serviceWorkers: "block",
        trace: "off",
        screenshot: "off",
        video: "off",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ],
    webServer: {
        command:
            "npm --prefix real_dev/frontend run preview -- --mode test --host 127.0.0.1 --port 5182",
        url: "http://127.0.0.1:5182",
        reuseExistingServer: false,
        timeout: 30_000,
    },
});
