/**
 * @file Prova browser isolada dos adapters com fixtures exclusivamente locais.
 *
 * Sessão, playback e mutações são interceptados no browser; este ficheiro não
 * arranca o backend, não abre MongoDB e não executa seeds. A prova cobre apenas
 * integração local do player e nunca representa vídeo/4K/streaming real.
 */

import { expect, test } from "./test.js";

const API_ORIGIN = "http://127.0.0.1:3199";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

const protocolFixtures = {
    progressive: {
        url: "/__fixtures__/synthetic-progressive.mp4",
        mimeType: "video/mp4",
    },
    hls: {
        url: "/__fixtures__/synthetic.m3u8",
        mimeType: "application/vnd.apple.mpegurl",
    },
    dash: {
        url: "/__fixtures__/synthetic.mpd",
        mimeType: "application/dash+xml",
    },
};

/**
 * Produz o DTO fechado do protocolo pedido sem URLs em options/tracks.
 *
 * @param {keyof typeof protocolFixtures} protocol Protocolo em validação.
 * @returns {Record<string, unknown>} Resposta autenticada do playback.
 */
function playbackResponse(protocol) {
    const fixture = protocolFixtures[protocol];

    return {
        content: {
            id: `synthetic-${protocol}`,
            title: `Fixture sintética ${protocol}`,
            mediaStatus: "ready",
            isPlayable: true,
            source: { protocol, ...fixture },
            selectedAudioLanguage: "pt",
            selectedQuality: "720p",
            qualityOptions: [
                {
                    value: "720p",
                    label: "Fixture local",
                    locked: false,
                    selected: true,
                },
            ],
            tracks: { subtitles: [], audio: [] },
            preferences: {
                subtitleLanguage: "",
                audioLanguage: "pt",
                quality: "720p",
            },
        },
        progress: { currentTimeSeconds: 0 },
    };
}

/**
 * Intercepta toda a API necessária ao shell/player sem servidor de aplicação.
 *
 * @param {import("@playwright/test").Page} page Página Playwright.
 * @returns {Promise<void>}
 */
async function installApiFixtures(page) {
    await page.route(`${API_ORIGIN}/api/**`, async (route) => {
        const request = route.request();
        const requestUrl = new URL(request.url());
        const playbackMatch = requestUrl.pathname.match(
            /^\/api\/playback\/synthetic-(progressive|hls|dash)$/u,
        );

        if (requestUrl.pathname === "/api/session/me") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    user: {
                        id: "browser-fixture-user",
                        name: "Fixture browser",
                        role: "subscriber",
                    },
                }),
            });
            return;
        }

        if (requestUrl.pathname === "/api/session/csrf-token") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ csrfToken: "synthetic-csrf-token" }),
            });
            return;
        }

        if (playbackMatch && request.method() === "GET") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: { "cache-control": "private, no-store" },
                body: JSON.stringify(playbackResponse(playbackMatch[1])),
            });
            return;
        }

        if (
            requestUrl.pathname.endsWith("/progress") ||
            requestUrl.pathname === "/api/playback/preferences"
        ) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ saved: true }),
            });
            return;
        }

        await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({
                code: "UNEXPECTED_TEST_REQUEST",
                message: "Pedido não previsto pela fixture.",
            }),
        });
    });
}

for (const protocol of Object.keys(protocolFixtures)) {
    test(`player local ${protocol} chega a canplay sem rede externa`, async ({
        page,
    }) => {
        const externalRequests = [];
        const diagnostics = [];
        page.on("console", (message) => {
            if (["warning", "error"].includes(message.type())) {
                diagnostics.push(`console:${message.type()}:${message.text()}`);
            }
        });
        page.on("requestfailed", (request) => {
            diagnostics.push(
                `requestfailed:${request.url()}:${request.failure()?.errorText}`,
            );
        });
        page.on("response", (response) => {
            if (response.url().includes("/__fixtures__/")) {
                diagnostics.push(`response:${response.status()}:${response.url()}`);
            }
        });
        page.on("request", (request) => {
            const requestUrl = new URL(request.url());
            if (
                ["http:", "https:"].includes(requestUrl.protocol) &&
                !LOOPBACK_HOSTS.has(requestUrl.hostname)
            ) {
                externalRequests.push(request.url());
            }
        });
        await installApiFixtures(page);

        await page.goto(`/ver/synthetic-${protocol}`);

        await expect(
            page.getByRole("heading", {
                name: `Fixture sintética ${protocol}`,
            }),
        ).toBeVisible();
        const player = page.getByTestId("faithflix-player");
        await expect(player).toBeVisible();
        await player.evaluate((video) => {
            // Chromium pode adiar o buffer DASH até existir intenção de play.
            // Muted evita depender da política de autoplay do ambiente de teste.
            globalThis.__faithflixMediaEvents = [];
            for (const eventName of [
                "loadedmetadata",
                "loadeddata",
                "canplay",
                "canplaythrough",
                "play",
                "playing",
                "timeupdate",
                "ended",
                "error",
            ]) {
                video.addEventListener(eventName, () => {
                    globalThis.__faithflixMediaEvents.push(eventName);
                });
            }
            video.muted = true;
            void video.play().catch(() => {});
        });
        try {
            await expect.poll(
                () => player.evaluate((video) => video.readyState),
                { message: `${protocol} não chegou ao evento canplay` },
            ).toBeGreaterThanOrEqual(3);
        } catch (error) {
            const videoState = await player.evaluate((video) => ({
                readyState: video.readyState,
                networkState: video.networkState,
                currentSrc: video.currentSrc,
                currentTime: video.currentTime,
                duration: video.duration,
                paused: video.paused,
                ended: video.ended,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                error: video.error
                    ? { code: video.error.code, message: video.error.message }
                    : null,
                buffered: Array.from(
                    { length: video.buffered.length },
                    (_, index) => [
                        video.buffered.start(index),
                        video.buffered.end(index),
                    ],
                ),
                events: globalThis.__faithflixMediaEvents,
            }));
            throw new Error(
                `${error.message}\nDiagnóstico media: ${JSON.stringify({ videoState, diagnostics })}`,
            );
        }
        await expect(page.getByText("A preparar vídeo...")).toBeHidden();
        await expect(page.getByRole("alert")).toHaveCount(0);
        expect(externalRequests).toEqual([]);
    });
}
