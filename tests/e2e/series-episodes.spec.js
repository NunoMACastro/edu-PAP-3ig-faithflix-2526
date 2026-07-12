/**
 * @file Gate browser real da hierarquia série -> episódio.
 *
 * Pré-condição: executar `npm run seed:e2e:mf2` sobre a mesma base `_e2e`.
 * Não existem mocks HTTP; catálogo, sessão, playback e media usam os processos
 * reais iniciados por `playwright.series.config.js`.
 */

import { expect, test } from "./test.js";

const API_ORIGIN = "http://127.0.0.1:3103";
const SERIES_SLUG = "familia-em-oracao-e2e";
const FIRST_EPISODE_SLUG = "familia-em-oracao-e2e-t1-e1";
const SECOND_EPISODE_SLUG = "familia-em-oracao-e2e-t2-e1";
const EMPTY_SERIES_SLUG = "salmos-em-casa-e2e";

/**
 * Autentica a persona MF2 instalada pelo seed formal.
 *
 * @param {import("@playwright/test").Page} page Página real.
 * @returns {Promise<void>} Termina com a sessão visível no layout.
 */
async function login(page) {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("e2e@faithflix.test");
    await page.getByTestId("password-input").fill("password-segura-123");
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("catálogo e pesquisa mostram séries sem expor episódios isolados", async ({
    request,
}) => {
    const detailResponse = await request.get(
        `${API_ORIGIN}/api/catalog/${SERIES_SLUG}`,
    );
    expect(
        detailResponse.status(),
        "Executa primeiro npm run seed:e2e:mf2 na mesma base isolada.",
    ).toBe(200);
    const detail = await detailResponse.json();

    expect(detail.content.type).toBe("series");
    expect(detail.content.isPlayable).toBe(false);
    expect(detail.seasons.map((season) => season.seasonNumber)).toEqual([1, 2]);
    expect(detail.seasons.flatMap((season) => season.episodes)).toHaveLength(2);

    const catalogResponse = await request.get(
        `${API_ORIGIN}/api/catalog?page=1&limit=24`,
    );
    expect(catalogResponse.status()).toBe(200);
    const catalog = await catalogResponse.json();
    expect(catalog.items.some((item) => item.slug === SERIES_SLUG)).toBe(true);
    expect(catalog.items.every((item) => item.type !== "episode")).toBe(true);

    const searchResponse = await request.get(
        `${API_ORIGIN}/api/search?q=e2e&page=1&limit=24`,
    );
    expect(searchResponse.status()).toBe(200);
    const search = await searchResponse.json();
    expect(search.items.every((item) => item.type !== "episode")).toBe(true);
});

test("link legacy canonicaliza e a navegação atravessa temporadas até ao player", async ({
    page,
}) => {
    await login(page);
    await page.goto(`/catalogo/${FIRST_EPISODE_SLUG}`);

    await expect(page).toHaveURL(
        new RegExp(
            `/catalogo/${SERIES_SLUG}/episodios/${FIRST_EPISODE_SLUG}$`,
            "u",
        ),
    );
    await expect(
        page.getByRole("heading", { name: "O Recomeço E2E" }),
    ).toBeVisible();
    await expect(page.getByText("Temporada 1 · Episódio 1")).toBeVisible();

    await page.getByRole("link", { name: "Episódio seguinte" }).click();
    await expect(page).toHaveURL(
        new RegExp(
            `/catalogo/${SERIES_SLUG}/episodios/${SECOND_EPISODE_SLUG}$`,
            "u",
        ),
    );
    await expect(page.getByText("Temporada 2 · Episódio 1")).toBeVisible();

    await page.getByRole("link", { name: "Reproduzir episódio" }).click();
    const player = page.getByTestId("faithflix-player");
    await expect(player).toBeVisible();
    await expect(page.getByRole("link", { name: "Família em Oração E2E" }))
        .toBeVisible();
    await expect(page.getByText("· T2 E1")).toBeVisible();
    await expect
        .poll(() => player.evaluate((video) => video.readyState))
        .toBeGreaterThanOrEqual(2);
});

test("série publicada sem episódios apresenta estado Em breve", async ({ page }) => {
    await page.goto(`/catalogo/${EMPTY_SERIES_SLUG}`);
    await expect(
        page.getByRole("heading", { name: "Salmos em Casa E2E" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Em breve" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Começar série" })).toHaveCount(0);
});
