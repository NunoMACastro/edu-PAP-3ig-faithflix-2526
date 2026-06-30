import { expect, test } from "@playwright/test";

const SCREENSHOT_DIR = "docs/evidence/MF8/screenshots";

const VIEWPORTS = [
    { name: "desktop", width: 1280, height: 720 },
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
        heading: "Associa\u00e7\u00f5es apoiadas",
    },
];

test.describe("MF8 sweep visual responsivo", () => {
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
