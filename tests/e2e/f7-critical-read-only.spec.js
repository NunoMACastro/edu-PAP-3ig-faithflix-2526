/**
 * @file Sweep E2E crítico sem mutações persistentes de domínio.
 *
 * Requer previamente as fixtures E2E isoladas MF2/MF4. A presença deste spec
 * configura a cobertura, mas só um resultado executado pode constituir prova.
 * O login cria sessões e os rate limiters podem criar contadores técnicos com
 * TTL; por isso este cenário não é descrito como absolutamente read-only.
 */

import { expect, test } from "./test.js";

const API_ORIGIN = "http://127.0.0.1:3101";
const FRONTEND_ORIGIN = "http://127.0.0.1:5181";
const PASSWORD = "password-segura-123";

/**
 * Autentica uma fixture através da API mantendo o cookie no contexto do teste.
 *
 * @param {import("@playwright/test").APIRequestContext} request Contexto HTTP.
 * @param {string} email Email reservado da fixture.
 * @returns {Promise<void>}
 */
async function loginApi(request, email) {
    const response = await request.post(`${API_ORIGIN}/api/auth/login`, {
        headers: { Origin: FRONTEND_ORIGIN },
        data: { email, password: PASSWORD },
    });
    expect(response.status()).toBe(200);
}

test.describe("F7 contratos críticos sem mutação de domínio @cross-browser", () => {
    test("health separa liveness e readiness", async ({ request }) => {
        const live = await request.get(`${API_ORIGIN}/health/live`);
        expect(live.status()).toBe(200);
        expect(live.headers()["cache-control"]).toContain("no-store");
        expect(await live.json()).toMatchObject({ live: true });

        const ready = await request.get(`${API_ORIGIN}/health/ready`);
        expect(ready.status()).toBe(200);
        expect(ready.headers()["cache-control"]).toContain("no-store");
        expect(await ready.json()).toMatchObject({ ready: true });
    });

    test("auth, RBAC, privacidade e CSRF falham fechados", async ({ request }) => {
        await loginApi(request, "e2e@faithflix.test");

        const forbidden = await request.get(`${API_ORIGIN}/api/catalog/admin`);
        expect(forbidden.status()).toBe(403);
        expect(await forbidden.json()).toMatchObject({ code: "FORBIDDEN" });

        const consents = await request.get(`${API_ORIGIN}/api/privacy/consents`);
        expect(consents.status()).toBe(200);
        expect(await consents.json()).toHaveProperty("consentState");

        const missingCsrf = await request.put(
            `${API_ORIGIN}/api/privacy/consents`,
            {
                headers: { Origin: FRONTEND_ORIGIN },
                data: {
                    personalizedRecommendations: false,
                    operationalNotifications: true,
                    anonymousMetrics: false,
                },
            },
        );
        expect(missingCsrf.status()).toBe(403);
        expect(await missingCsrf.json()).toMatchObject({
            code: "CSRF_INVALID",
        });

        const token = await request.get(`${API_ORIGIN}/api/session/csrf-token`);
        expect(token.status()).toBe(200);
        expect(token.headers()["cache-control"]).toContain("no-store");
        expect(await token.json()).toHaveProperty("csrfToken");
    });

    test("pesquisa pública e catálogo admin são alcançáveis", async ({ page }) => {
        await page.goto("/pesquisa?q=Piloto&page=1&sort=title");
        await expect(page.getByRole("heading", { name: "Pesquisa" })).toBeVisible();
        await expect(page.getByText(/resultado/u)).toBeVisible();

        await page.goto("/login");
        await page.getByTestId("email-input").fill("admin-mf4@faithflix.test");
        await page.getByTestId("password-input").fill(PASSWORD);
        await page.getByTestId("login-submit").click();
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

        await page.goto("/admin/catalogo");
        await expect(
            page.getByRole("heading", { name: "Gestão de catálogo" }),
        ).toBeVisible();
        await expect(page.getByText(/Vídeo (ainda não disponível|disponível)/u).first()).toBeVisible();
    });
});
