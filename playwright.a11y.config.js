/**
 * @file Configuração Axe isolada: preview estático, sem backend ou base de dados.
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "real_dev/frontend/tests/a11y",
    testMatch: "accessibility.spec.js",
    timeout: 45_000,
    expect: { timeout: 10_000 },
    reporter: "list",
    outputDir: "/tmp/faithflix-a11y-playwright",
    use: {
        baseURL: "http://127.0.0.1:5183",
        serviceWorkers: "block",
        trace: "off",
        screenshot: "only-on-failure",
        video: "off",
    },
    projects: [
        {
            name: "chromium-a11y",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command:
            "npm --prefix real_dev/frontend run preview -- --mode test --host 127.0.0.1 --port 5183",
        url: "http://127.0.0.1:5183",
        reuseExistingServer: false,
        timeout: 30_000,
    },
});
