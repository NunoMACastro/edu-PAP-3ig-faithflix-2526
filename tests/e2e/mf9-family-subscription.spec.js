import { expect, test } from "@playwright/test";

const PASSWORD = "password-segura-123";
const OWNER_EMAIL = "owner-mf9@faithflix.test";
const MEMBER_EMAIL = "member-mf9@faithflix.test";
const PRO_EMAIL = "pro-mf9@faithflix.test";
const CONTENT_SLUG = "mf9-qualidade-familiar";
const CONTENT_ID = "64f909100000000000000001";

/**
 * Inicia sessao por UI com uma conta de fixture MF9.
 *
 * @param {import("@playwright/test").Page} page Pagina Playwright.
 * @param {string} email Email da conta fixture.
 * @returns {Promise<void>} Termina quando a sessao fica ativa.
 */
async function login(page, email) {
    await page.goto("/login");
    await expect(page.getByTestId("auth-form")).toBeVisible();
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("status")).toHaveText("Sessão iniciada.");
}

/**
 * Lê as opções reais de um `<select>` para validar labels, valores e bloqueios.
 *
 * @param {import("@playwright/test").Locator} selectLocator Locator do select.
 * @returns {Promise<Array<{ label: string, value: string, disabled: boolean }>>} Opções do DOM.
 */
async function readSelectOptions(selectLocator) {
    return selectLocator.evaluate((select) =>
        Array.from(select.options).map((option) => ({
            label: option.textContent.trim(),
            value: option.value,
            disabled: option.disabled,
        })),
    );
}

/**
 * Localiza o selector de qualidade dentro dos controlos do player.
 *
 * @param {import("@playwright/test").Page} page Pagina Playwright.
 * @returns {import("@playwright/test").Locator} Locator do select de qualidade.
 */
function qualitySelect(page) {
    return page
        .locator(".player-controls label")
        .filter({ hasText: "Qualidade" })
        .locator("select");
}

test("MF9 cobre partilha familiar real e qualidade 4K limitada por plano", async ({
    browser,
}) => {
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();

    await login(ownerPage, OWNER_EMAIL);
    await ownerPage.goto("/planos");
    await expect(
        ownerPage.getByRole("heading", { name: "Subscrição" }),
    ).toBeVisible();
    await expect(ownerPage.getByText("Plano: Família")).toBeVisible();
    await expect(ownerPage.getByText("1/5 lugares usados.")).toBeVisible();
    await ownerPage.getByLabel("Email da conta").fill(MEMBER_EMAIL);
    await ownerPage.getByRole("button", { name: "Convidar" }).click();
    await expect(ownerPage.getByRole("status")).toContainText(
        "Convite familiar criado.",
    );
    await expect(ownerPage.getByText(MEMBER_EMAIL)).toBeVisible();

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();

    await login(memberPage, MEMBER_EMAIL);
    await memberPage.goto("/planos");
    await expect(memberPage.getByText("Convite pendente")).toBeVisible();
    await memberPage.getByRole("button", { name: "Aceitar" }).click();
    await expect(memberPage.getByRole("status")).toContainText(
        "Convite familiar aceite.",
    );
    await expect(memberPage.getByText("Partilha familiar")).toBeVisible();
    await expect(memberPage.getByText("Plano: Família")).toBeVisible();

    await memberPage.goto(`/catalogo/${CONTENT_SLUG}`);
    await expect(
        memberPage.getByRole("heading", { name: "Qualidade Familiar MF9" }),
    ).toBeVisible();
    await memberPage.getByRole("link", { name: "Reproduzir" }).click();
    await expect(memberPage.getByTestId("faithflix-player")).toBeVisible();
    const memberQualitySelect = qualitySelect(memberPage);
    const memberQualityOptions = await readSelectOptions(memberQualitySelect);
    const member4kOption = memberQualityOptions.find(
        (option) => option.label === "4K",
    );

    expect(member4kOption).toEqual(
        expect.objectContaining({ label: "4K", disabled: false }),
    );
    await memberQualitySelect.selectOption(member4kOption.value);
    await expect(memberPage.getByTestId("faithflix-player")).toHaveAttribute(
        "src",
        /mf9-2160/,
    );

    const proContext = await browser.newContext();
    const proPage = await proContext.newPage();

    await login(proPage, PRO_EMAIL);
    await proPage.goto(`/ver/${CONTENT_ID}`);
    await expect(proPage.getByTestId("faithflix-player")).toBeVisible();
    const proQualitySelect = qualitySelect(proPage);
    const proQualityOptions = await readSelectOptions(proQualitySelect);

    expect(proQualityOptions).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ label: "Full HD", disabled: false }),
            expect.objectContaining({
                label: "4K - Plano Família",
                disabled: true,
            }),
        ]),
    );
    await expect(proPage.getByTestId("faithflix-player")).toHaveAttribute(
        "src",
        /mf9-1080/,
    );

    await ownerPage.goto("/planos");
    const memberCard = ownerPage.locator("article").filter({
        hasText: MEMBER_EMAIL,
    });

    await expect(memberCard).toBeVisible();
    await memberCard.getByRole("button", { name: "Remover" }).click();
    await expect(ownerPage.getByRole("status")).toContainText(
        "Membro familiar removido.",
    );

    await memberPage.goto(`/ver/${CONTENT_ID}`);
    await expect(memberPage.getByRole("alert")).toContainText(
        "Subscrição ativa obrigatória",
    );

    await ownerContext.close();
    await memberContext.close();
    await proContext.close();
});
