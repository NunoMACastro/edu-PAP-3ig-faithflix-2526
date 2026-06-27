import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const appBaseUrl = "http://127.0.0.1:4176";
const profileFile = "/private/tmp/faithflix-mf7-profile.txt";
const evidenceDir = new URL(".", import.meta.url);

/**
 * Resolve um ficheiro de evidence para caminho absoluto local.
 *
 * @param {string} filename Nome do ficheiro dentro da pasta de evidence browser.
 * @returns {string} Caminho absoluto compatível com APIs que não aceitam `URL`.
 */
function evidencePath(filename) {
    return fileURLToPath(new URL(filename, evidenceDir));
}

const scenarios = [
    {
        id: "mf7-mobile-390-anonymous-home",
        profile: "anonymous",
        viewport: { width: 390, height: 844 },
        path: "/",
        description: "Visitante em mobile: hero visível e sem links admin.",
        screenshot: "mf7-mobile-390-anonymous-home.png",
        validate: async (page) => {
            const h1 = await page.locator("h1").first().innerText();
            const navText = await page.locator("nav").innerText();
            const heroColor = await page
                .locator(".hero-section h1")
                .evaluate((element) => getComputedStyle(element).color);

            return {
                h1,
                navText,
                heroColor,
                ok:
                    h1 === "FaithFlix" &&
                    !navText.includes("Admin") &&
                    heroColor === "rgb(255, 250, 242)",
            };
        },
    },
    {
        id: "mf7-tablet-768-user-admin-denied",
        profile: "user",
        viewport: { width: 768, height: 900 },
        path: "/admin/metricas",
        description: "User comum em tablet: rota admin bloqueada visualmente.",
        screenshot: "mf7-tablet-768-user-admin-denied.png",
        validate: async (page) => {
            const bodyExcerpt = await page.locator("body").innerText();

            return {
                bodyExcerpt,
                ok:
                    bodyExcerpt.includes("Não tem permissão para aceder a esta área.") &&
                    bodyExcerpt.includes("Conteúdo, comunidade e impacto solidário."),
            };
        },
    },
    {
        id: "mf7-desktop-1366-moderator-catalog",
        profile: "moderator",
        viewport: { width: 1366, height: 900 },
        path: "/admin/catalogo",
        description:
            "Moderator em desktop: acede ao catálogo admin, sem link de utilizadores.",
        screenshot: "mf7-desktop-1366-moderator-catalog.png",
        validate: async (page) => {
            const h1 = await page.locator("h1").first().innerText();
            const navText = await page.locator("nav").innerText();

            return {
                h1,
                navText,
                ok:
                    h1 === "Gestão de catálogo" &&
                    navText.includes("Admin catálogo") &&
                    !navText.includes("Admin utilizadores") &&
                    !navText.includes("Métricas") &&
                    !navText.includes("Integrações"),
            };
        },
    },
    {
        id: "mf7-desktop-1440-admin-home",
        profile: "admin",
        viewport: { width: 1440, height: 900 },
        path: "/",
        description: "Admin em desktop largo: hero e links admin esperados.",
        screenshot: "mf7-desktop-1440-admin-home.png",
        validate: async (page) => {
            const h1 = await page.locator("h1").first().innerText();
            const navText = await page.locator("nav").innerText();

            return {
                h1,
                navText,
                ok:
                    h1 === "FaithFlix" &&
                    navText.includes("Admin catálogo") &&
                    navText.includes("Admin utilizadores") &&
                    navText.includes("Métricas") &&
                    navText.includes("Integrações"),
            };
        },
    },
    {
        id: "mf7-keyboard-skip-link",
        profile: "anonymous",
        viewport: { width: 1280, height: 820 },
        path: "/",
        description: "Teclado: Tab foca o skip link e Enter move foco para o main.",
        screenshot: "mf7-keyboard-skip-link.png",
        validate: async (page) => {
            await page.keyboard.press("Tab");
            await page.waitForTimeout(180);

            const focusedBeforeEnter = await page.evaluate(() => ({
                className: document.activeElement?.className ?? "",
                text: document.activeElement?.textContent?.trim() ?? "",
                top:
                    document.activeElement instanceof HTMLElement
                        ? document.activeElement.getBoundingClientRect().top
                        : null,
                transform:
                    document.activeElement instanceof HTMLElement
                        ? getComputedStyle(document.activeElement).transform
                        : "",
            }));

            await page.keyboard.press("Enter");
            await page.waitForTimeout(100);

            const focusedAfterEnter = await page.evaluate(() => ({
                id: document.activeElement?.id ?? "",
                hash: window.location.hash,
            }));

            return {
                focusedBeforeEnter,
                focusedAfterEnter,
                ok:
                    focusedBeforeEnter.className.includes("skip-link") &&
                    focusedBeforeEnter.text === "Saltar para o conteúdo principal" &&
                    focusedBeforeEnter.top >= 0 &&
                    focusedAfterEnter.id === "conteudo-principal" &&
                    focusedAfterEnter.hash === "#conteudo-principal",
            };
        },
        prepareScreenshot: async (page) => {
            await page.locator(".skip-link").focus();
            await page.waitForTimeout(180);
        },
    },
];

const browser = await chromium.launch();
const results = [];

try {
    for (const scenario of scenarios) {
        await writeFile(profileFile, `${scenario.profile}\n`, "utf8");

        const page = await browser.newPage({ viewport: scenario.viewport });
        const url = `${appBaseUrl}${scenario.path}`;

        await page.goto(url, { waitUntil: "networkidle" });
        const check = await scenario.validate(page);
        if (scenario.prepareScreenshot) {
            await scenario.prepareScreenshot(page);
        }
        await page.screenshot({
            fullPage: true,
            path: evidencePath(scenario.screenshot),
        });
        await page.close();

        results.push({
            id: scenario.id,
            profile: scenario.profile,
            viewport: scenario.viewport,
            url,
            description: scenario.description,
            screenshot: scenario.screenshot,
            check,
        });
    }
} finally {
    await browser.close();
}

const failed = results.filter((result) => !result.check.ok);

await writeFile(
    evidencePath("mf7-browser-validation-results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
    "utf8",
);

if (failed.length > 0) {
    console.error(JSON.stringify({ failed }, null, 2));
    process.exit(1);
}

console.log(`MF7 browser evidence PASS: ${results.length}/${results.length}`);
