/** @file Smoke browser sem mutações de domínio para o dataset Atlas demo-v2. */

import { createNetworkSafeContext, expect, test } from "./test.js";

const API_ORIGIN = "http://127.0.0.1:3102";

/** @param {import("@playwright/test").Page} page Página. @param {string} email Email. @param {string} password Password do ambiente. */
async function login(page, email, password) {
    await page.goto("/login");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(password);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/** @param {import("@playwright/test").Browser} browser Browser do teste. */
function createDemoContext(browser) {
    return createNetworkSafeContext(browser, undefined, { readOnly: true });
}

/** @param {import("@playwright/test").APIRequestContext} request Cliente. */
async function catalogFixtures(request) {
    const firstResponse = await request.get(
        `${API_ORIGIN}/api/catalog?page=1&limit=24`,
    );
    expect(firstResponse.status()).toBe(200);
    const firstPage = await firstResponse.json();
    const remainingPages = Math.max(
        0,
        Math.ceil(firstPage.total / firstPage.limit) - 1,
    );
    const additionalResponses = await Promise.all(
        Array.from({ length: remainingPages }, (_, index) =>
            request.get(
                `${API_ORIGIN}/api/catalog?page=${index + 2}&limit=24`,
            ),
        ),
    );
    additionalResponses.forEach((response) =>
        expect(response.status()).toBe(200),
    );
    const additionalPages = await Promise.all(
        additionalResponses.map((response) => response.json()),
    );
    const catalog = {
        ...firstPage,
        items: [
            ...firstPage.items,
            ...additionalPages.flatMap((page) => page.items),
        ],
    };
    return {
        catalog,
        playable: catalog.items.find(
            (item) => item.isPlayable && item.ageRating <= 12,
        ),
        restricted: catalog.items.find(
            (item) => item.isPlayable && item.ageRating >= 16,
        ),
    };
}

test("home, catálogo paginado, pesquisa e detalhe usam o manifesto publicado", async ({ browser, request }) => {
    const { catalog, playable } = await catalogFixtures(request);
    expect(catalog.total).toBe(34);
    const secondPage = await request.get(`${API_ORIGIN}/api/catalog?page=2&limit=12`);
    expect(secondPage.status()).toBe(200);
    expect((await secondPage.json()).items.length).toBeGreaterThan(0);

    const context = await createDemoContext(browser);
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#home-title")).toBeVisible();
    await page.goto("/catalogo");
    await expect(page.getByRole("heading", { name: "Catálogo FaithFlix" })).toBeVisible();
    await expect(page.locator(".catalog-hero-count")).toContainText("34");
    await page.goto(`/pesquisa?q=${encodeURIComponent(playable.title)}&page=1&sort=title`);
    await expect(
        page.getByRole("heading", { name: "O que queres descobrir?" }),
    ).toBeVisible();
    await expect(page.getByText(playable.title, { exact: true }).first()).toBeVisible();
    await page.goto(`/catalogo/${playable.slug}`);
    await expect(page.getByRole("heading", { name: playable.title, exact: true })).toBeVisible();
    await context.close();
});

test("personas demonstram personalização, cold-start, opt-out, biblioteca e notificações", async ({ browser }) => {
    const proContext = await createDemoContext(browser);
    const proPage = await proContext.newPage();
    await login(proPage, "pro@faithflix.demo", process.env.DEMO_USER_PASSWORD);
    await proPage.goto("/para-si");
    await expect(proPage.getByText("As sugestões usam sinais agregados")).toBeVisible();
    await proPage.goto("/biblioteca");
    await expect(proPage.getByRole("heading", { name: "A minha biblioteca" })).toBeVisible();
    await expect(proPage.getByText(/Página 1 de 2 \(13 conteúdos\)/u).first()).toBeVisible();
    await proPage.goto("/notificacoes");
    await expect(proPage.getByRole("heading", { name: "Notificações" })).toBeVisible();
    await expect(proPage.getByRole("heading", { name: "Recentes" })).toBeVisible();

    for (const email of ["cold-start@faithflix.demo", "associacao@faithflix.demo"]) {
        const context = await createDemoContext(browser);
        const page = await context.newPage();
        await login(page, email, process.env.DEMO_USER_PASSWORD);
        await page.goto("/para-si");
        await expect(page.getByText("Ainda há poucos sinais teus")).toBeVisible();
        await context.close();
    }
    await proContext.close();
});

test("player chega a canplay e aplica parental control e entitlements Pro/Família", async ({ browser, request }) => {
    const { playable, restricted } = await catalogFixtures(request);

    const proContext = await createDemoContext(browser);
    const proPage = await proContext.newPage();
    await login(proPage, "pro@faithflix.demo", process.env.DEMO_USER_PASSWORD);
    await proPage.goto(`/ver/${playable.id}`);
    const player = proPage.getByTestId("faithflix-player");
    await expect(player).toBeVisible();
    await expect.poll(() => player.evaluate((video) => video.readyState)).toBeGreaterThanOrEqual(3);
    await expect
        .poll(() => player.evaluate((video) => video.currentSrc || video.src))
        .toMatch(/http:\/\/127\.0\.0\.1:3102\/api\/media\/[a-f\d]{24}$/iu);
    await proPage.goto("/planos");
    await expect(
        proPage.getByRole("region", { name: "A tua subscrição" })
            .getByRole("heading", { name: "Pro" }),
    ).toBeVisible();

    const familyContext = await createDemoContext(browser);
    const familyPage = await familyContext.newPage();
    await login(familyPage, "familia-owner@faithflix.demo", process.env.DEMO_USER_PASSWORD);
    await familyPage.goto(`/ver/${playable.id}`);
    await expect(familyPage.getByTestId("faithflix-player")).toBeVisible();
    await familyPage.goto("/planos");
    await expect(
        familyPage.getByRole("region", { name: "A tua subscrição" })
            .getByRole("heading", { name: "Família" }),
    ).toBeVisible();

    const memberContext = await createDemoContext(browser);
    const memberPage = await memberContext.newPage();
    await login(memberPage, "familia-membro@faithflix.demo", process.env.DEMO_USER_PASSWORD);
    await memberPage.goto(`/ver/${restricted.id}`);
    await expect(memberPage.getByRole("alert")).toBeVisible();

    await Promise.all([proContext.close(), familyContext.close(), memberContext.close()]);
});

test("admin lê utilizadores, métricas, candidaturas, pool, integrações e passagens", async ({ browser }) => {
    const context = await createDemoContext(browser);
    const page = await context.newPage();
    await login(page, "admin@faithflix.demo", process.env.DEMO_ADMIN_PASSWORD);
    for (const [path, heading] of [
        ["/admin", "Dashboard"],
        ["/admin/catalogo", "Catálogo"],
        ["/admin/utilizadores", "Contas e permissões"],
        ["/admin/metricas", "Métricas"],
        ["/admin/charity-applications", "Candidaturas"],
        ["/admin/pool/dashboard", "Histórico da pool"],
        ["/admin/pool/distribution", "Distribuição mensal"],
        ["/admin/integracoes", "Integrações"],
        ["/admin/passagens-biblicas", "Passagens bíblicas"],
    ]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
    await context.close();
});
