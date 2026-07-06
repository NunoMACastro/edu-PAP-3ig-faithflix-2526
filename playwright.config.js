// playwright.config.js
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
            // O E2E valida a app pública do aluno; por isso o servidor arranca em backend/.
            command: "npm --prefix backend run dev",
            url: "http://127.0.0.1:3000/health",
            reuseExistingServer: true,
            timeout: 30_000,
        },
        {
            // O frontend recebe a base da API por variável de ambiente e mantém cookies de sessão.
            command:
                "VITE_API_BASE_URL=http://127.0.0.1:3000 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173",
            url: "http://127.0.0.1:5173",
            reuseExistingServer: true,
            timeout: 30_000,
        },
    ],
});