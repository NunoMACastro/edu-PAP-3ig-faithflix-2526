import { createNetworkSafeContext, expect, test } from "./test.js";

const PASSWORD = "password-segura-123";
const OWNER_EMAIL = "owner-mf9@faithflix.test";
const MEMBER_EMAIL = "member-mf9@faithflix.test";
const PRO_EMAIL = "pro-mf9@faithflix.test";
const CONTENT_SLUG = "mf9-qualidade-familiar";
const CONTENT_ID = "64f909100000000000000001";
const MEDIA_ASSET_ID = "64f909200000000000000001";

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
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/**
 * Confirma que o player usa a rota autenticada do único asset MP4 sintético.
 *
 * A fixture declara 1080p, sem fabricar uma variante 4K nem expor um path do
 * frontend. A autorização efetiva continua a ser exercida pelo pedido media.
 *
 * @param {import("@playwright/test").Page} page Página autenticada.
 * @returns {Promise<void>} Termina quando fonte e opções são seguras.
 */
async function assertPrivate1080Playback(page) {
    const player = page.getByTestId("faithflix-player");
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute(
        "src",
        new RegExp(`/api/media/${MEDIA_ASSET_ID}$`, "u"),
    );
    await expect(player).not.toHaveAttribute("src", /\/media\/mf9|2160/iu);
    await expect(
        page.locator('option[value="2160p"], option[value="4k"]'),
    ).toHaveCount(0);
}

test("MF9 cobre partilha familiar com um asset MP4 privado sem falsa opção 4K", async ({
    browser,
}) => {
    const ownerContext = await createNetworkSafeContext(browser);
    const ownerPage = await ownerContext.newPage();

    await login(ownerPage, OWNER_EMAIL);
    await ownerPage.goto("/planos");
    await expect(
        ownerPage.getByRole("heading", {
            name: "Escolhe como queres viver a FaithFlix.",
        }),
    ).toBeVisible();
    const ownerSubscription = ownerPage.getByRole("region", {
        name: "A tua subscrição",
    });
    await expect(
        ownerSubscription.getByRole("heading", { name: "Família" }),
    ).toBeVisible();
    await expect(ownerPage.getByText("1/5 lugares usados.")).toBeVisible();
    await ownerPage.goto(`/ver/${CONTENT_ID}`);
    await assertPrivate1080Playback(ownerPage);
    await ownerPage.goto("/planos");
    await ownerPage.getByLabel("Email da conta").fill(MEMBER_EMAIL);
    await ownerPage.getByRole("button", { name: "Convidar" }).click();
    await expect(ownerPage.getByRole("status")).toContainText(
        "Convite familiar criado.",
    );
    await expect(ownerPage.getByText(MEMBER_EMAIL)).toBeVisible();

    const memberContext = await createNetworkSafeContext(browser);
    const memberPage = await memberContext.newPage();

    await login(memberPage, MEMBER_EMAIL);
    await memberPage.goto("/planos");
    await expect(memberPage.getByText("Convite pendente")).toBeVisible();
    await memberPage.getByRole("button", { name: "Aceitar" }).click();
    await expect(memberPage.getByRole("status")).toContainText(
        "Convite familiar aceite.",
    );
    await expect(memberPage.getByText("Partilha familiar")).toBeVisible();
    const memberSubscription = memberPage.getByRole("region", {
        name: "A tua subscrição",
    });
    await expect(
        memberSubscription.getByRole("heading", { name: "Família" }),
    ).toBeVisible();

    await memberPage.goto(`/catalogo/${CONTENT_SLUG}`);
    await expect(
        memberPage.getByRole("heading", { name: "Qualidade Familiar MF9" }),
    ).toBeVisible();
    await memberPage.getByRole("link", { name: "Reproduzir" }).click();
    await assertPrivate1080Playback(memberPage);

    const proContext = await createNetworkSafeContext(browser);
    const proPage = await proContext.newPage();

    await login(proPage, PRO_EMAIL);
    await proPage.goto(`/ver/${CONTENT_ID}`);
    await assertPrivate1080Playback(proPage);

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
