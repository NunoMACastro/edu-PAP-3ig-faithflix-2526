import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    reporter: [
        ["list"],
        [
            "html",
            { outputFolder: "playwright-report/e2e-html-report", open: "never" },
        ],
    ],
    use: {
        baseURL: "http://127.0.0.1:5173",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: [
        {
            command: "npm --prefix real_dev/backend run dev",
            url: "http://127.0.0.1:3000/health",
            reuseExistingServer: true,
            timeout: 30_000,
        },
        {
            command:
                "VITE_API_BASE_URL=http://127.0.0.1:3000 npm --prefix real_dev/frontend run dev -- --host 127.0.0.1 --port 5173",
            url: "http://127.0.0.1:5173",
            reuseExistingServer: true,
            timeout: 30_000,
        },
    ],
});
