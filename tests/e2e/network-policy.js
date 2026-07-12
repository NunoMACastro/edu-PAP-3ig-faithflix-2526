/**
 * @file Política de rede determinística para testes Playwright FaithFlix.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const FIXTURE_ROOT = resolve("tests/fixtures/media");

const fixtureRoutes = new Map([
    ["/__fixtures__/synthetic-progressive.mp4", { path: resolve(FIXTURE_ROOT, "synthetic-progressive.mp4"), contentType: "video/mp4" }],
    ["/__fixtures__/synthetic-init.mp4", { path: resolve(FIXTURE_ROOT, "synthetic-init.mp4"), contentType: "video/mp4" }],
    ["/__fixtures__/synthetic-segment.m4s", { path: resolve(FIXTURE_ROOT, "synthetic-segment.m4s"), contentType: "video/mp4" }],
    ["/__fixtures__/synthetic.m3u8", { path: resolve(FIXTURE_ROOT, "synthetic.m3u8"), contentType: "application/vnd.apple.mpegurl" }],
    ["/__fixtures__/synthetic.mpd", { path: resolve(FIXTURE_ROOT, "synthetic.mpd"), contentType: "application/dash+xml" }],
]);

/**
 * Interpreta um único intervalo HTTP para permitir media seeking em browsers.
 *
 * @param {string | undefined} header Cabeçalho `Range` recebido.
 * @param {number} size Tamanho total do ficheiro.
 * @returns {{ start: number, end: number } | null} Intervalo inclusivo ou null.
 */
function parseByteRange(header, size) {
    const match = String(header ?? "").match(/^bytes=(\d+)-(\d*)$/u);
    if (!match) return null;

    const start = Number(match[1]);
    const requestedEnd = match[2] ? Number(match[2]) : size - 1;
    const end = Math.min(requestedEnd, size - 1);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        return null;
    }

    return { start, end };
}

/**
 * Instala a allowlist loopback e as respostas de media sintética num contexto.
 *
 * @param {import("@playwright/test").BrowserContext} context Contexto Playwright.
 * @param {{ readOnly?: boolean }} [options] Opções adicionais do harness.
 * @returns {Promise<void>}
 */
export async function installDeterministicNetworkPolicy(context, options = {}) {
    await context.route("**/*", async (route) => {
        const requestUrl = new URL(route.request().url());
        const fixture = fixtureRoutes.get(requestUrl.pathname);

        if (fixture) {
            const body = await readFile(fixture.path);
            const rangeHeader = route.request().headers().range;
            const range = parseByteRange(rangeHeader, body.length);

            if (rangeHeader && !range) {
                await route.fulfill({
                    status: 416,
                    headers: { "content-range": `bytes */${body.length}` },
                });
                return;
            }

            if (range) {
                const partialBody = body.subarray(range.start, range.end + 1);
                await route.fulfill({
                    status: 206,
                    contentType: fixture.contentType,
                    headers: {
                        "accept-ranges": "bytes",
                        "content-range": `bytes ${range.start}-${range.end}/${body.length}`,
                        "content-length": String(partialBody.length),
                    },
                    body: partialBody,
                });
                return;
            }

            await route.fulfill({
                status: 200,
                contentType: fixture.contentType,
                headers: {
                    "accept-ranges": "bytes",
                    "content-length": String(body.length),
                },
                body,
            });
            return;
        }

        if (!LOOPBACK_HOSTS.has(requestUrl.hostname)) {
            await route.abort("blockedbyclient");
            return;
        }

        if (
            options.readOnly === true &&
            route.request().method() === "PUT" &&
            /^\/api\/playback\/[a-f\d]{24}\/progress$/iu.test(
                requestUrl.pathname,
            )
        ) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ progress: null, readOnly: true }),
            });
            return;
        }

        if (
            options.readOnly === true &&
            route.request().method() === "POST" &&
            requestUrl.pathname === "/api/analytics/events"
        ) {
            await route.fulfill({ status: 204 });
            return;
        }

        await route.continue();
    });
}
