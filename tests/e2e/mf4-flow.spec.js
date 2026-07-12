import { createNetworkSafeContext, expect, test } from "./test.js";

const PASSWORD = "password-segura-123";
const USER_EMAIL = "user-mf4@faithflix.test";
const ADMIN_EMAIL = "admin-mf4@faithflix.test";
const CHARITY_USER_EMAIL = "charity-mf4@faithflix.test";
const APPLICATION_EMAIL = "candidatura-mf4@faithflix.test";
const APPLICATION_NAME = "Associacao E2E MF4 Candidatura";
const SEEDED_CHARITY_NAME = "Associa\u00e7\u00e3o Esperan\u00e7a MF4";
const SEEDED_DISTRIBUTION_MONTH = "2026-06";

/**
 * Authenticates an E2E fixture user through the browser UI.
 *
 * @param {import("@playwright/test").Page} page - Playwright page.
 * @param {string} email - Fixture user email.
 * @returns {Promise<void>} Resolves after the session is active.
 */
async function login(page, email) {
    await page.goto("/login");
    await expect(page.getByTestId("auth-form")).toBeVisible();
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("MF4 cobre subscricao, trial, candidatura, pool, historico e notificacoes", async ({
    browser,
}) => {
    const userContext = await createNetworkSafeContext(browser);
    const userPage = await userContext.newPage();

    await login(userPage, USER_EMAIL);
    await userPage.goto("/planos");
    await expect(
        userPage.getByRole("heading", {
            name: "Escolhe como queres viver a FaithFlix.",
        }),
    ).toBeVisible();
    await expect(userPage.getByText("Subscri\u00e7\u00e3o pr\u00f3pria")).toBeVisible();
    await userPage.getByRole("button", { name: "Cancelar renova\u00e7\u00e3o" }).click();
    await expect(userPage.getByRole("status")).toContainText(
        "Renova\u00e7\u00e3o cancelada no fim do ciclo atual.",
    );

    await userPage.goto("/associacoes/candidatura");
    await expect(
        userPage.getByRole("heading", { name: "Candidatura de associa\u00e7\u00e3o" }),
    ).toBeVisible();
    await userPage.getByLabel("Nome da associa\u00e7\u00e3o").fill(APPLICATION_NAME);
    await userPage.getByLabel("Contacto principal").fill("Pessoa E2E MF4");
    await userPage.getByLabel("Email").fill(APPLICATION_EMAIL);
    await userPage.getByLabel("Telefone").fill("+351 210 000 004");
    await userPage.getByLabel("Miss\u00e3o").fill(
        "Validar o fluxo solidario MF4 em browser real.",
    );
    await userPage.getByLabel("Website").fill("https://example.test");
    await userPage
        .getByRole("button", { name: "Submeter candidatura" })
        .click();
    await expect(userPage.getByRole("status")).toContainText(
        "Candidatura submetida para revis\u00e3o.",
    );

    const charityContext = await createNetworkSafeContext(browser);
    const charityPage = await charityContext.newPage();

    await login(charityPage, CHARITY_USER_EMAIL);
    await charityPage.goto("/planos");
    await charityPage.getByRole("button", { name: "Iniciar trial" }).click();
    await expect(charityPage.getByRole("status")).toContainText("Trial iniciado.");
    await charityPage.goto("/notificacoes");
    await expect(
        charityPage.getByRole("heading", { name: "Notifica\u00e7\u00f5es" }),
    ).toBeVisible();
    await expect(charityPage.getByText("Trial iniciado")).toBeVisible();
    await charityPage
        .getByRole("button", { name: "Marcar como lida" })
        .first()
        .click();

    await charityPage.goto("/associacoes");
    const charityCard = charityPage.locator("article").filter({
        hasText: SEEDED_CHARITY_NAME,
    });

    await expect(charityCard).toBeVisible();
    await charityPage
        .getByRole("link", { name: "\u00c1rea da associa\u00e7\u00e3o" })
        .click();
    await expect(
        charityPage.getByRole("heading", { name: "Hist\u00f3rico da associa\u00e7\u00e3o" }),
    ).toBeVisible();
    await expect(charityPage.getByText(SEEDED_DISTRIBUTION_MONTH)).toBeVisible();
    await expect(
        charityPage.getByRole("link", { name: "Exportar CSV" }),
    ).toBeVisible();

    const adminContext = await createNetworkSafeContext(browser);
    const adminPage = await adminContext.newPage();

    await login(adminPage, ADMIN_EMAIL);
    await adminPage.goto("/admin/charity-applications");
    const applicationCard = adminPage.locator("article").filter({
        hasText: APPLICATION_NAME,
    });

    await expect(applicationCard).toBeVisible();
    await applicationCard.getByRole("button", { name: "Rejeitar" }).click();
    await expect(applicationCard).not.toBeVisible();

    await adminPage.goto("/admin/pool/dashboard");
    await expect(
        adminPage.getByRole("heading", { name: "Dashboard da pool solid\u00e1ria" }),
    ).toBeVisible();
    const seededDistribution = adminPage.locator("article").filter({
        hasText: SEEDED_DISTRIBUTION_MONTH,
    });

    await expect(seededDistribution).toBeVisible();
    await expect(seededDistribution).toContainText("Estado: completed");

    await userContext.close();
    await charityContext.close();
    await adminContext.close();
});
