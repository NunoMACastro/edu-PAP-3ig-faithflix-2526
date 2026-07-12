import { expect, test } from "./test.js";
import {
    MF2_REGISTER_EMAIL,
    MF2_REGISTER_PASSWORD,
    MF2_RESET_EMAIL,
    MF2_RESET_NEW_PASSWORD,
    MF2_RESET_OLD_PASSWORD,
    MF2_RESET_TOKEN,
} from "../fixtures/mf2-auth.js";

test("MF2 fluxo principal: login, media privada, listas e biblioteca", async ({
    page,
}) => {
    await page.goto("/login");
    await expect(page.getByTestId("auth-form")).toBeVisible();
    await page.getByTestId("email-input").fill("e2e@faithflix.test");
    await page.getByTestId("password-input").fill("password-segura-123");
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

    const catalogStart = performance.now();
    await page.goto("/catalogo");
    await expect(
        page.getByRole("heading", { name: "Cat\u00e1logo FaithFlix" }),
    ).toBeVisible();
    await expect(page.getByText("Piloto FaithFlix")).toBeVisible();
    const catalogLoadMs = performance.now() - catalogStart;
    console.log(`RNF07 catalogLoadMs=${Math.round(catalogLoadMs)}`);
    expect(catalogLoadMs).toBeLessThan(3000);

    await page.goto("/catalogo/piloto-faithflix");
    await expect(page.getByTestId("content-detail")).toBeVisible();
    await page.getByRole("link", { name: "Reproduzir" }).click();
    const player = page.getByTestId("faithflix-player");
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute(
        "src",
        /\/api\/media\/[a-f\d]{24}$/iu,
    );
    await expect(player).not.toHaveAttribute("src", /\/media\/piloto/iu);

    await page.goto("/catalogo/piloto-faithflix");
    await expect(page.getByTestId("content-detail")).toBeVisible();

    await page.getByRole("button", { name: /adicionar aos favoritos/i }).click();
    await page.getByRole("button", { name: /adicionar a watchlist/i }).click();
    await page.goto("/biblioteca");
    await expect(page.getByTestId("my-library")).toBeVisible();
    await expect(
        page
            .getByTestId("my-library")
            .getByRole("heading", { name: "Piloto FaithFlix" })
            .first(),
    ).toBeVisible();
});

test("MF2 identidade: registo, logout e novo login", async ({ page }) => {
    await page.goto("/login?next=%2Fcatalogo");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(
        page.getByRole("heading", { name: "Criar a minha conta" }),
    ).toBeVisible();

    await page.getByTestId("name-input").fill("Registo MF2");
    await page.getByTestId("email-input").fill(MF2_REGISTER_EMAIL);
    await page.getByTestId("password-input").fill(MF2_REGISTER_PASSWORD);
    await page.getByTestId("register-submit").click();

    await expect(page).toHaveURL(/\/catalogo$/u);
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/$/u);

    await page.goto("/login");
    await page.getByTestId("email-input").fill(MF2_REGISTER_EMAIL);
    await page.getByTestId("password-input").fill(MF2_REGISTER_PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});

test("MF2 identidade: recuperação genérica e reset sem expor o token", async ({
    page,
}) => {
    await page.goto("/login");
    await page.getByRole("button", {
        name: "Esqueceste-te da palavra-passe?",
    }).click();
    await page.getByTestId("email-input").fill(MF2_RESET_EMAIL);
    await page.getByTestId("forgot-submit").click();

    await expect(
        page.getByText("Se o email existir, foi criado um pedido de recuperacao."),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/token=/u);

    await page.getByRole("button", { name: "Já tenho um token" }).click();
    await page.getByTestId("token-input").fill(MF2_RESET_TOKEN);
    await page.getByTestId("password-input").fill(MF2_RESET_NEW_PASSWORD);
    await page.getByTestId("reset-submit").click();
    await expect(
        page.getByText("Palavra-passe atualizada. Já podes iniciar sessão."),
    ).toBeVisible();

    await page.getByTestId("email-input").fill(MF2_RESET_EMAIL);
    await page.getByTestId("password-input").fill(MF2_RESET_OLD_PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("alert")).toBeVisible();

    await page.getByTestId("password-input").fill(MF2_RESET_NEW_PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
