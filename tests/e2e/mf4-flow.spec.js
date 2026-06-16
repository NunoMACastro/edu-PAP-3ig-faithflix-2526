import { expect, test } from "@playwright/test";

const PASSWORD = "password-segura-123";
const USER_EMAIL = "mf4-user@faithflix.test";
const ADMIN_EMAIL = "mf4-admin@faithflix.test";
const TRIAL_EMAIL = "mf4-trial@faithflix.test";
const APPLICATION_EMAIL = "mf4-candidatura@faithflix.test";
const CHARITY_NAME = "Associacao E2E MF4";
const DISTRIBUTION_MONTH = "2099-04";

/**
 * Authenticates an E2E fixture user through the real browser UI.
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
    await expect(page.getByText("Sessao iniciada.")).toBeVisible();
}

test("MF4 cobre subscricao, trial, candidatura, pool, historico e notificacoes", async ({
    browser,
}) => {
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();

    await login(userPage, USER_EMAIL);
    await userPage.goto("/planos");
    await expect(
        userPage.getByRole("heading", { name: "Planos FaithFlix" }),
    ).toBeVisible();

    await userPage
        .getByRole("button", { name: "Checkout aprovado" })
        .first()
        .click();
    await expect(userPage.getByRole("status")).toContainText(
        "Pagamento simulado aprovado.",
    );
    await expect(userPage.getByText("active")).toBeVisible();

    await userPage
        .getByRole("button", { name: "Simular recusa" })
        .first()
        .click();
    await expect(userPage.getByRole("alert")).toContainText(
        "Pagamento simulado recusado.",
    );

    await userPage.goto("/notificacoes");
    await expect(
        userPage.getByRole("heading", { name: "Centro de notificacoes" }),
    ).toBeVisible();
    await expect(userPage.getByText("Subscricao ativa")).toBeVisible();
    await expect(userPage.getByText("Pagamento recusado")).toBeVisible();
    await userPage
        .getByRole("button", { name: "Marcar como lida" })
        .first()
        .click();
    await expect(userPage.getByRole("status")).toContainText(
        "Notificacao marcada como lida.",
    );

    await userPage.goto("/associacoes/candidatura");
    await userPage.getByLabel("Nome da associacao").fill(CHARITY_NAME);
    await userPage.getByLabel("Pessoa de contacto").fill("Pessoa E2E MF4");
    await userPage.getByLabel("Email").fill(APPLICATION_EMAIL);
    await userPage.getByLabel("Telefone").fill("+351 210 000 004");
    await userPage.getByLabel("Website publico").fill("https://example.test");
    await userPage
        .getByLabel("Missao")
        .fill("Validar o fluxo solidario MF4 em browser real.");
    await userPage
        .getByRole("button", { name: "Submeter candidatura" })
        .click();
    await expect(userPage.getByRole("status")).toContainText(
        "Candidatura recebida com estado pending.",
    );

    const trialContext = await browser.newContext();
    const trialPage = await trialContext.newPage();

    await login(trialPage, TRIAL_EMAIL);
    await trialPage.goto("/planos");
    await trialPage
        .getByRole("button", { name: "Iniciar trial" })
        .first()
        .click();
    await expect(trialPage.getByRole("status")).toContainText(
        "Trial iniciado durante 14 dias.",
    );
    await trialPage
        .getByRole("button", { name: "Iniciar trial" })
        .first()
        .click();
    await expect(trialPage.getByRole("alert")).toContainText(
        "Trial ja utilizado por este utilizador.",
    );

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await login(adminPage, ADMIN_EMAIL);
    await adminPage.goto("/admin/associacoes/candidaturas");
    const applicationRow = adminPage
        .getByRole("row")
        .filter({ hasText: CHARITY_NAME });

    await expect(applicationRow).toBeVisible();
    await applicationRow.getByRole("button", { name: "Aprovar" }).click();
    await expect(adminPage.getByRole("status")).toContainText(
        "Decisao registada.",
    );

    await adminPage.goto("/admin/associacoes/membros");
    await adminPage.getByLabel("Associacao").selectOption({
        label: CHARITY_NAME,
    });
    await adminPage.getByLabel("Utilizador").selectOption({
        label: USER_EMAIL,
    });
    await adminPage.getByRole("button", { name: "Guardar ligacao" }).click();
    await expect(adminPage.getByRole("status")).toContainText(
        "Utilizador ligado a associacao.",
    );

    await adminPage.goto("/admin/associacoes/pool");
    await adminPage.getByLabel("Mes").fill(DISTRIBUTION_MONTH);
    await adminPage
        .getByRole("button", { name: "Executar distribuicao" })
        .click();
    await expect(adminPage.getByRole("status")).toContainText(
        "Distribuicao criada.",
    );
    await expect(adminPage.getByText(DISTRIBUTION_MONTH)).toBeVisible();
    await expect(adminPage.getByText(CHARITY_NAME)).toBeVisible();

    await userPage.goto("/associacoes");
    const charityCard = userPage.locator("article").filter({
        hasText: CHARITY_NAME,
    });

    await expect(charityCard).toBeVisible();
    await charityCard
        .getByRole("link", { name: "Historico privado" })
        .click();
    await expect(
        userPage.getByRole("heading", { name: "Historico privado" }),
    ).toBeVisible();
    await expect(userPage.getByText(DISTRIBUTION_MONTH)).toBeVisible();
    await expect(
        userPage.getByRole("link", { name: "Exportar CSV" }),
    ).toBeVisible();

    await userContext.close();
    await trialContext.close();
    await adminContext.close();
});
