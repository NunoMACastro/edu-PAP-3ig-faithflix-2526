import { expect, test } from "./test.js";

const SCREENSHOT_DIR =
    process.env.PUBLISH_EVIDENCE === "true"
        ? "docs/evidence/MF8/screenshots"
        : "test-results/mf8/screenshots";

const VIEWPORTS = [
    { name: "desktop", width: 1366, height: 900 },
    { name: "mobile", width: 390, height: 844 },
];

const PAGES = [
    {
        name: "home",
        path: "/",
        heading: "FaithFlix",
    },
    {
        name: "catalogo",
        path: "/catalogo",
        heading: "Cat\u00e1logo FaithFlix",
    },
    {
        name: "associacoes",
        path: "/associacoes",
        heading: "Ver hist\u00f3rias. Apoiar vidas.",
    },
    {
        name: "planos",
        path: "/planos",
        heading: "Escolhe como queres viver a FaithFlix.",
    },
    {
        name: "login",
        path: "/login",
        heading: "A tua pr\u00f3xima hist\u00f3ria come\u00e7a aqui.",
    },
];

test.describe("MF8 sweep visual responsivo @cross-browser", () => {
    for (const viewport of VIEWPORTS) {
        for (const pageCase of PAGES) {
            test(`${pageCase.name} ${viewport.name}`, async ({ page }) => {
                await page.setViewportSize({
                    width: viewport.width,
                    height: viewport.height,
                });

                await page.goto(pageCase.path);
                await expect(page.getByRole("banner")).toBeVisible();
                await expect(
                    page.getByRole("heading", { name: pageCase.heading }),
                ).toBeVisible();
                await page.waitForLoadState("networkidle");
                await expect(page.getByText(/A carregar/u)).toHaveCount(0);

                const hasHorizontalOverflow = await page.evaluate(
                    () => document.documentElement.scrollWidth > window.innerWidth + 1,
                );

                expect(hasHorizontalOverflow).toBe(false);

                await page.screenshot({
                    path: `${SCREENSHOT_DIR}/${pageCase.name}-${viewport.name}.png`,
                    fullPage: true,
                });
            });
        }
    }
});

for (const pageCase of [
    {
        name: "associacoes",
        path: "/associacoes",
        heading: "Ver hist\u00f3rias. Apoiar vidas.",
    },
    {
        name: "planos",
        path: "/planos",
        heading: "Escolhe como queres viver a FaithFlix.",
    },
    {
        name: "login",
        path: "/login",
        heading: "A tua pr\u00f3xima hist\u00f3ria come\u00e7a aqui.",
    },
]) {
    for (const viewport of [
        { name: "wide", width: 2048, height: 1152 },
        { name: "tablet", width: 768, height: 900 },
    ]) {
        test(`${pageCase.name} ${viewport.name} sem overflow`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await page.goto(pageCase.path);
            await expect(page.getByRole("heading", {
                name: pageCase.heading,
            })).toBeVisible();
            await page.waitForLoadState("networkidle");
            await expect(page.getByText(/A carregar/u)).toHaveCount(0);

            const hasHorizontalOverflow = await page.evaluate(
                () => document.documentElement.scrollWidth > window.innerWidth + 1,
            );
            expect(hasHorizontalOverflow).toBe(false);

            await page.screenshot({
                path: `${SCREENSHOT_DIR}/${pageCase.name}-${viewport.name}.png`,
                fullPage: true,
            });
        });
    }
}
