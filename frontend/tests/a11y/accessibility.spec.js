/**
 * @file Auditoria Axe e reflow do frontend com API sintética exclusivamente local.
 *
 * Este harness não arranca backend, não abre MongoDB e não executa seeds. As
 * respostas permitem apenas renderizar estados representativos da interface.
 */

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../../../../tests/e2e/test.js";

const API_ORIGIN = "http://127.0.0.1:3199";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

const content = {
    id: "content-a11y-1",
    slug: "conteudo-acessivel",
    title: "Conteúdo acessível",
    synopsis: "Sinopse sintética usada apenas para validar a interface local.",
    type: "movie",
    durationSeconds: 5_400,
    ageRating: 12,
    posterUrl: "",
    backdropUrl: "",
    assets: { posterUrl: "", backdropUrl: "" },
    mediaStatus: "pending",
    isPlayable: false,
    status: "published",
    version: 1,
    taxonomyIds: ["taxonomy-1"],
    credits: { directors: [], creators: [], cast: [] },
    updatedAt: "2026-07-12T08:00:00.000Z",
};

const adminUser = {
    id: "admin-a11y-1",
    name: "Administrador local",
    email: "admin@faithflix.test",
    role: "admin",
    accountStatus: "active",
    parentalMaxAgeRating: 18,
};

const customerUser = {
    ...adminUser,
    id: "customer-a11y-1",
    name: "Cliente local",
    email: "cliente@faithflix.test",
    role: "user",
};

/**
 * Envia JSON com os cabeçalhos mínimos esperados pelo cliente API.
 *
 * @param {import("@playwright/test").Route} route Rota intercetada.
 * @param {unknown} body Corpo serializável.
 * @returns {Promise<void>} Termina depois de responder.
 */
function fulfillJson(route, body) {
    return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
    });
}

/**
 * Instala respostas determinísticas para páginas públicas e autenticadas.
 *
 * @param {import("@playwright/test").Page} page Página atual.
 * @param {{ authenticated?: boolean | "customer", subscriptionState?: "none" | "active" }} [options] Estado de sessão a simular.
 * @returns {Promise<void>} Termina depois de instalar a rota.
 */
async function installApiFixtures(
    page,
    { authenticated = false, subscriptionState = "none" } = {},
) {
    const sessionUser = authenticated === "customer"
        ? customerUser
        : authenticated
          ? adminUser
          : null;

    await page.route(`${API_ORIGIN}/api/**`, async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;

        if (path === "/api/session/me") {
            await fulfillJson(route, { user: sessionUser });
            return;
        }
        if (path === "/api/session/csrf-token") {
            await fulfillJson(route, { csrfToken: "a11y-local-token" });
            return;
        }
        if (path === "/api/discovery/home") {
            await fulfillJson(route, {
                carousels: [
                    {
                        id: "recent",
                        title: "Adicionados recentemente",
                        items: [content],
                    },
                    {
                        id: "most-watched",
                        title: "Mais vistos",
                        items: [content],
                    },
                ],
                formats: [
                    {
                        type: "movie",
                        count: 1,
                        sampleTitle: content.title,
                        posterUrl: "",
                        backdropUrl: "",
                    },
                ],
            });
            return;
        }
        if (path === "/api/catalog/taxonomies") {
            await fulfillJson(route, {
                items: [{ id: "taxonomy-1", name: "Esperança" }],
            });
            return;
        }
        if (path === "/api/catalog/admin") {
            await fulfillJson(route, {
                items: [{ ...content, version: 1 }],
                page: 1,
                limit: 12,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/biblical-passages/admin") {
            await fulfillJson(route, {
                items: [{
                    id: "passage-a11y-1",
                    book: "Provérbios",
                    chapterStart: 3,
                    verseStart: 5,
                    chapterEnd: 3,
                    verseEnd: 6,
                    translation: "Parafraseado",
                    text: "Confia no Senhor de todo o teu coração.",
                    theme: "Confiança",
                    reflection: "A fé orienta cada decisão.",
                    status: "published",
                }],
                page: 1,
                limit: 50,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/charities/admin/lookup") {
            await fulfillJson(route, {
                charities: [{ id: "charity-a11y-1", name: "Associação Acessível" }],
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/catalog/admin/options") {
            await fulfillJson(route, { seriesOptions: [] });
            return;
        }
        if (path === "/api/catalog/admin/content-a11y-1") {
            await fulfillJson(route, { content });
            return;
        }
        if (path === "/api/catalog/taxonomies/admin") {
            await fulfillJson(route, {
                items: [{
                    id: "taxonomy-1",
                    name: "Esperança",
                    slug: "esperanca",
                    description: "Conteúdos sobre esperança.",
                    status: "active",
                    version: 1,
                    usageCount: 1,
                    updatedAt: "2026-07-12T08:00:00.000Z",
                }],
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/admin/metrics") {
            await fulfillJson(route, {
                metrics: {
                    generatedAt: "2026-07-12T08:00:00.000Z",
                    range: { from: "2026-06-13", to: "2026-07-12" },
                    users: { total: 10, active: 9, blocked: 1, deleted: 0 },
                    catalog: { published: 1, draft: 1, archived: 0, mediaPending: 1, mediaFailed: 0 },
                    subscriptions: { active: 2, trialing: 1, familyMembers: 1, familyInvitationsPending: 0 },
                    notifications: { created: 2 },
                    privacy: { deletionRequests: 0, consentEvents: 1 },
                    solidarity: { approvedCharities: 1, pendingApplications: 1, distributedCents: 1000 },
                    integrations: { total: 3, enabled: 2, disabled: 1, invalid: 0 },
                    anonymousMetrics: { total: 4, byType: { catalog_view: 1, search_submit: 1, playback_started: 1, playback_completed: 1 } },
                },
            });
            return;
        }
        if (path === "/api/recommendations/me") {
            await fulfillJson(route, {
                coldStart: false,
                groups: [{
                    id: "semantic-a11y",
                    title: "Parecidos com o que acompanhas",
                    items: [content],
                    explanation: {
                        title: "Porque recomendamos",
                        message: "Comparação semântica interna.",
                        signals: ["embeddings de conteudo", "atividade"],
                        confidence: "semantic-baseline",
                    },
                }],
            });
            return;
        }
        if (path === "/api/catalog/conteudo-acessivel") {
            await fulfillJson(route, { content, seasons: [] });
            return;
        }
        if (path === "/api/catalog/conteudo-acessivel/biblical-passages") {
            await fulfillJson(route, { items: [] });
            return;
        }
        if (path === "/api/discovery/related/content-a11y-1") {
            await fulfillJson(route, { items: [] });
            return;
        }
        if (path === "/api/ratings/content-a11y-1/summary") {
            await fulfillJson(route, {
                summary: {
                    average: 0,
                    count: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                },
            });
            return;
        }
        if (path === "/api/comments/content-a11y-1") {
            await fulfillJson(route, {
                items: [],
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/catalog") {
            await fulfillJson(route, {
                items: [content],
                page: Number(url.searchParams.get("page")) || 1,
                limit: Number(url.searchParams.get("limit")) || 12,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/search") {
            await fulfillJson(route, {
                items: [content],
                page: 1,
                limit: 12,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/charities/public") {
            await fulfillJson(route, {
                charities: [{
                    id: "charity-a11y-1",
                    name: "Associação Acessível",
                    mission: "Apoio comunitário local com acompanhamento continuado e responsável.",
                    websiteUrl: "https://example.test/",
                    approvedAt: "2025-01-01T00:00:00.000Z",
                }],
                impact: {
                    eligibleCharities: 1,
                    totalDistributedCents: 125000,
                    completedMonths: 6,
                    currency: "EUR",
                },
            });
            return;
        }
        if (path === "/api/subscriptions/plans") {
            await fulfillJson(route, {
                plans: [
                    {
                        id: "plan-a11y-pro",
                        code: "faithflix-monthly",
                        name: "FaithFlix Pro Mensal",
                        interval: "monthly",
                        priceCents: 799,
                        currency: "EUR",
                        solidaritySharePercent: 20,
                        tier: "pro",
                        maxQuality: "1080p",
                        qualityRank: 1080,
                        familySharing: false,
                        maxFamilyMembers: 1,
                        features: ["Streaming até Full HD"],
                    },
                    {
                        id: "plan-a11y-family",
                        code: "faithflix-family-monthly",
                        name: "FaithFlix Família Mensal",
                        interval: "monthly",
                        priceCents: 1299,
                        currency: "EUR",
                        solidaritySharePercent: 20,
                        tier: "family",
                        maxQuality: "2160p",
                        qualityRank: 2160,
                        familySharing: true,
                        maxFamilyMembers: 5,
                        features: ["Partilha com até 5 utilizadores"],
                    },
                ],
            });
            return;
        }
        if (path === "/api/subscriptions/me") {
            if (subscriptionState === "active") {
                const activeSubscription = {
                    status: "active",
                    planCode: "faithflix-monthly",
                    currentPeriodEnd: "2026-08-12T00:00:00.000Z",
                    cancelAtPeriodEnd: false,
                    hasPremiumAccess: true,
                    accessSource: "own",
                    plan: {
                        code: "faithflix-monthly",
                        name: "FaithFlix Pro",
                        tier: "pro",
                    },
                    entitlements: {
                        tier: "pro",
                        maxQuality: "1080p",
                        familySharing: false,
                        maxFamilyMembers: 1,
                    },
                };
                await fulfillJson(route, {
                    subscription: activeSubscription,
                    access: activeSubscription,
                    family: {
                        ownedFamily: null,
                        pendingInvitations: [],
                        activeMembership: null,
                    },
                });
                return;
            }
            await fulfillJson(route, {
                subscription: {
                    status: "none",
                    hasPremiumAccess: false,
                    accessSource: "none",
                    entitlements: {
                        tier: "none",
                        maxQuality: "720p",
                        familySharing: false,
                        maxFamilyMembers: 1,
                    },
                },
                family: {
                    ownedFamily: null,
                    pendingInvitations: [],
                    activeMembership: null,
                },
            });
            return;
        }
        if (path === "/api/users/me") {
            await fulfillJson(route, { user: sessionUser ?? adminUser });
            return;
        }
        if (path === "/api/users") {
            await fulfillJson(route, {
                users: [adminUser],
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/privacy/consents") {
            await fulfillJson(route, {
                consentState: {
                    consents: {
                        personalizedRecommendations: false,
                        operationalNotifications: true,
                        anonymousMetrics: false,
                    },
                    updatedAt: "2026-07-10T00:00:00.000Z",
                },
            });
            return;
        }
        if (["/api/me/favorites", "/api/me/watchlist", "/api/me/history"].includes(path)) {
            await fulfillJson(route, {
                items: [content],
                page: 1,
                limit: 12,
                total: 1,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/playback/me/continue-watching") {
            await fulfillJson(route, {
                items: [],
                page: 1,
                limit: 12,
                total: 0,
                totalPages: 1,
            });
            return;
        }
        if (path === "/api/notifications") {
            await fulfillJson(route, { notifications: [], page: 1, total: 0 });
            return;
        }
        if (path === "/api/notifications/preferences/me") {
            await fulfillJson(route, {
                preferences: {
                    inApp: true,
                    email: false,
                    continueWatching: true,
                },
            });
            return;
        }

        await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({
                code: "UNEXPECTED_A11Y_REQUEST",
                message: "Pedido não previsto pela fixture local.",
            }),
        });
    });
}

/**
 * Regista e devolve pedidos HTTP externos observados no browser.
 *
 * @param {import("@playwright/test").Page} page Página atual.
 * @returns {string[]} Array preenchido à medida que surgem pedidos externos.
 */
function collectExternalRequests(page) {
    const externalRequests = [];
    page.on("request", (request) => {
        const url = new URL(request.url());
        if (
            ["http:", "https:"].includes(url.protocol) &&
            !LOOPBACK_HOSTS.has(url.hostname)
        ) {
            externalRequests.push(request.url());
        }
    });
    return externalRequests;
}

/**
 * Falha apenas por violações Axe com impacto serious/critical, preservando as
 * restantes no resultado para revisão futura sem inflacionar o checkpoint.
 *
 * @param {import("@playwright/test").Page} page Página já estabilizada.
 * @returns {Promise<void>} Termina quando a análise passa.
 */
async function expectNoBlockingAxeViolations(page) {
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact),
    );
    const summary = blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target),
    }));

    expect(blocking, JSON.stringify(summary, null, 2)).toEqual([]);
}

/**
 * Confirma que o documento não cria overflow horizontal fora de contentores.
 *
 * @param {import("@playwright/test").Page} page Página atual.
 * @returns {Promise<void>} Termina depois da asserção.
 */
async function expectNoPageOverflow(page) {
    const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth + 1,
    );
}

/**
 * Impede que linguagem de bastidores volte às superfícies apresentadas ao público.
 *
 * @param {import("@playwright/test").Page} page Página pública atual.
 * @returns {Promise<void>} Termina depois de validar o texto visível.
 */
async function expectNoOperationalCopy(page) {
    const visibleCopy = await page.locator("body").innerText();
    expect(visibleCopy).not.toMatch(/\b(?:simulad\w*|demonstração|PAP)\b/iu);
}

/**
 * Confirma o alvo de interação adotado pelos tokens públicos da aplicação.
 *
 * @param {import("@playwright/test").Locator} locator Controlo único e visível.
 * @returns {Promise<void>} Termina depois de validar largura e altura úteis.
 */
async function expectMinimumTargetSize(locator) {
    const dimensions = await locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { height: rect.height, width: rect.width };
    });

    expect(dimensions.height).toBeGreaterThanOrEqual(44);
    expect(dimensions.width).toBeGreaterThanOrEqual(44);
}

const viewportMatrix = [
    { name: "mobile-390x844", width: 390, height: 844 },
    { name: "tablet-768x900", width: 768, height: 900 },
    { name: "desktop-1280x720", width: 1280, height: 720 },
    { name: "desktop-1440x900", width: 1440, height: 900 },
];

for (const viewport of viewportMatrix) {
    test(`@a11y home ${viewport.name} sem bloqueios Axe ou overflow`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const externalRequests = collectExternalRequests(page);
        await installApiFixtures(page);
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "Conteúdo acessível", level: 1 }))
            .toBeVisible();

        await expectNoBlockingAxeViolations(page);
        await expectNoPageOverflow(page);
        await expectNoOperationalCopy(page);
        await page.screenshot({
            path: `/tmp/faithflix-a11y-${viewport.name}.png`,
            fullPage: true,
        });
        expect(externalRequests).toEqual([]);
    });
}

for (const scenario of [
    { path: "/catalogo", heading: "Catálogo FaithFlix" },
    { path: "/catalogo/conteudo-acessivel", heading: "Conteúdo acessível" },
    { path: "/pesquisa?q=esperanca", heading: "O que queres descobrir?" },
    { path: "/associacoes", heading: "Ver histórias. Apoiar vidas." },
    { path: "/associacoes/candidatura", heading: "Candidatura de associação" },
    { path: "/planos", heading: "Escolhe como queres viver a FaithFlix." },
    { path: "/login", heading: "A tua próxima história começa aqui." },
    { path: "/rota-inexistente", heading: "Página não encontrada" },
]) {
    test(`@a11y rota pública ${scenario.path}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const externalRequests = collectExternalRequests(page);
        await installApiFixtures(page);
        await page.goto(scenario.path);
        await expect(page.getByRole("heading", { name: scenario.heading, level: 1 }))
            .toBeVisible();

        await expectNoBlockingAxeViolations(page);
        await expectNoPageOverflow(page);
        await expectNoOperationalCopy(page);
        expect(externalRequests).toEqual([]);
    });
}

test("@a11y controlos públicos mantêm alvo mínimo de 44 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const externalRequests = collectExternalRequests(page);
    await installApiFixtures(page);

    await page.goto("/associacoes/candidatura");
    await expect(
        page.getByRole("heading", { name: "Candidatura de associação", level: 1 }),
    ).toBeVisible();
    const applicationFields = page.locator(
        ".charity-application-form input, .charity-application-form textarea",
    );
    const applicationFieldCount = await applicationFields.count();
    expect(applicationFieldCount).toBe(6);
    for (let index = 0; index < applicationFieldCount; index += 1) {
        await expectMinimumTargetSize(applicationFields.nth(index));
    }

    await page.goto("/associacoes");
    await expectMinimumTargetSize(
        page.getByRole("link", { name: "Visitar website: Associação Acessível" }),
    );

    await page.goto("/catalogo");
    await expectMinimumTargetSize(
        page.getByRole("link", { name: "Pesquisa avançada" }),
    );

    await page.goto("/planos");
    await expectMinimumTargetSize(
        page.getByRole("link", { name: "Conhecer associações" }),
    );

    await page.goto("/login");
    await expectMinimumTargetSize(
        page.getByRole("button", { name: "Mostrar palavra-passe" }),
    );

    expect(externalRequests).toEqual([]);
});

const loginViewportMatrix = [
    { name: "wide-2048x1152", width: 2048, height: 1152 },
    { name: "desktop-1366x900", width: 1366, height: 900 },
    { name: "tablet-768x900", width: 768, height: 900 },
    { name: "mobile-390x844", width: 390, height: 844 },
];

for (const viewport of loginViewportMatrix) {
    test(`@a11y login responsivo ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const externalRequests = collectExternalRequests(page);
        await installApiFixtures(page);
        await page.goto("/login");
        await expect(
            page.getByRole("heading", {
                name: "A tua próxima história começa aqui.",
                level: 1,
            }),
        ).toBeVisible();

        await expectNoBlockingAxeViolations(page);
        await expectNoPageOverflow(page);
        expect(externalRequests).toEqual([]);

        const evidencePath =
            process.env.PUBLISH_EVIDENCE === "true" &&
            viewport.name === "desktop-1366x900"
                ? "docs/evidence/MF8/screenshots/login-desktop.png"
                : process.env.PUBLISH_EVIDENCE === "true" &&
                    viewport.name === "mobile-390x844"
                  ? "docs/evidence/MF8/screenshots/login-mobile.png"
                  : `/tmp/faithflix-login-${viewport.name}.png`;

        await page.screenshot({ path: evidencePath, fullPage: true });
    });
}

for (const scenario of [
    { path: "/conta", heading: "A minha conta" },
    { path: "/biblioteca", heading: "A minha biblioteca" },
    { path: "/notificacoes", heading: "Notificações" },
    { path: "/admin/utilizadores", heading: "Contas e permissões" },
    { path: "/admin/catalogo", heading: "Catálogo" },
    { path: "/admin/catalogo/novo", heading: "Novo conteúdo" },
    { path: "/admin/catalogo/content-a11y-1/editar", heading: "Conteúdo acessível" },
    { path: "/admin/catalogo/taxonomias", heading: "Taxonomias" },
    { path: "/admin/passagens-biblicas/associacoes", heading: "Passagens bíblicas" },
    { path: "/admin/charity-members", heading: "Membros de associações" },
]) {
    test(`@a11y rota autenticada ${scenario.path}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const externalRequests = collectExternalRequests(page);
        await installApiFixtures(page, { authenticated: true });
        await page.goto(scenario.path);
        await expect(page.getByRole("heading", { name: scenario.heading, level: 1 }))
            .toBeVisible();

        await expectNoBlockingAxeViolations(page);
        await expectNoPageOverflow(page);
        expect(externalRequests).toEqual([]);
    });
}

test("@a11y menu móvel fecha com Escape e restitui o foco", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installApiFixtures(page);
    await page.goto("/");
    const header = page.locator(".app-header");
    const menuButton = page.getByRole("button", { name: "Abrir menu principal" });

    expect(await header.evaluate((element) => element.getBoundingClientRect().height))
        .toBeLessThanOrEqual(72);
    await menuButton.click();
    await expect(page.getByRole("navigation", { name: "Navegação principal" }))
        .toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
});

test("@a11y menu de conta do cliente sobrepõe o header sem scroll interno", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await installApiFixtures(page, { authenticated: "customer" });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Para si" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Planos" })).toBeHidden();
    const accountSummary = page.getByText("A minha conta", { exact: true });
    await accountSummary.click();
    const accountPanel = page.locator(".public-account-menu-panel");
    await expect(accountPanel).toBeVisible();

    const layout = await page.locator(".main-nav").evaluate((navigation) => {
        const panel = navigation.querySelector(".public-account-menu-panel");
        const panelRect = panel.getBoundingClientRect();
        const styles = getComputedStyle(navigation);
        return {
            overflowX: styles.overflowX,
            overflowY: styles.overflowY,
            panelLeft: panelRect.left,
            panelRight: panelRect.right,
            viewportWidth: document.documentElement.clientWidth,
        };
    });

    expect(layout.overflowX).toBe("visible");
    expect(layout.overflowY).toBe("visible");
    expect(layout.panelLeft).toBeGreaterThanOrEqual(0);
    expect(layout.panelRight).toBeLessThanOrEqual(layout.viewportWidth);
    await expectNoBlockingAxeViolations(page);
    await expectNoPageOverflow(page);

    await page.keyboard.press("Escape");
    await expect(accountPanel).toBeHidden();
    await expect(accountSummary).toBeFocused();

    await page.getByRole("link", { name: "Para si" }).click();
    await expect(page.getByRole("heading", { name: "Para si", level: 1 })).toBeVisible();
    const visibleCopy = await page.locator("main").innerText();
    expect(visibleCopy).not.toMatch(/embeddings|baseline|cold-start|confian[cç]a|sinais:/iu);
    await expect(page.getByText("Porque aparece aqui", { exact: true })).toHaveCount(0);
    await expectNoBlockingAxeViolations(page);
    await expectNoPageOverflow(page);
});

test("@a11y conta apresenta gestão do plano e confirmação de cancelamento", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await installApiFixtures(page, {
        authenticated: "customer",
        subscriptionState: "active",
    });
    await page.goto("/conta");

    await expect(page.getByRole("heading", { name: "FaithFlix Pro" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Alterar plano" }))
        .toHaveAttribute("href", "/planos#comparar-planos");
    const cancelRenewal = page.getByRole("button", { name: "Cancelar renovação" });
    await expect(cancelRenewal).toBeVisible();
    await expectNoBlockingAxeViolations(page);
    await expectNoPageOverflow(page);

    await cancelRenewal.click();
    const dialog = page.getByRole("dialog", { name: "Cancelar renovação" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancelar", exact: true }))
        .toBeFocused();
    await expectNoBlockingAxeViolations(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cancelRenewal).toBeFocused();
});

test("@a11y confirmação de plano fecha com Escape e restitui o foco", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installApiFixtures(page, { authenticated: true });
    await page.goto("/planos");
    const chooseButton = page.getByRole("button", { name: "Escolher Pro" });

    await expect(chooseButton).toBeVisible();
    await chooseButton.click();
    const dialog = page.getByRole("dialog", { name: "FaithFlix Pro" });
    await expect(dialog).toBeVisible();
    await expectNoOperationalCopy(page);
    await expect(
        dialog.getByRole("button", { name: "Confirmar subscrição" }),
    ).toBeFocused();
    await expectNoBlockingAxeViolations(page);

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(chooseButton).toBeFocused();
    await expectNoPageOverflow(page);
});

test("@a11y reflow equivalente a 200% em 1440x900 continua utilizável", async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await installApiFixtures(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Conteúdo acessível", level: 1 }))
        .toBeVisible();
    await expect(page.getByRole("button", { name: "Abrir menu principal" }))
        .toBeVisible();
    await expectNoPageOverflow(page);
});

for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
]) {
    test(`@a11y dashboard administrativo ${viewport.name}`, async ({ page }) => {
        const externalRequests = collectExternalRequests(page);
        await installApiFixtures(page, { authenticated: true });
        await page.setViewportSize(viewport);
        await page.goto("/admin");
        await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
        await expectNoBlockingAxeViolations(page);
        await expectNoPageOverflow(page);

        if (viewport.name === "mobile") {
            const menu = page.getByRole("button", { name: "Abrir navegação administrativa" });
            await menu.click();
            await expect(page.getByRole("dialog", { name: "Navegação administrativa" })).toBeVisible();
            await expectNoBlockingAxeViolations(page);
            await page.keyboard.press("Escape");
            await expect(menu).toBeFocused();
        }

        expect(externalRequests).toEqual([]);
    });
}

test("@a11y catálogo administrativo list-first em 320 px", async ({ page }) => {
    await installApiFixtures(page, { authenticated: true });
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/admin/catalogo");
    await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
    await expect(page.getByRole("table")).toBeHidden();
    await expect(page.locator(".catalog-mobile-results > li")).toHaveCount(1);
    await expectNoBlockingAxeViolations(page);
    await expectNoPageOverflow(page);
});
