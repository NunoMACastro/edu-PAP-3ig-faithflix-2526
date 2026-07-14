/**
 * @file Testes unitários dos adapters progressive/HLS/DASH.
 */

import { describe, expect, it, vi } from "vitest";
import { attachMediaSource } from "./mediaAdapter.js";

function video({ nativeHls = false } = {}) {
    const element = document.createElement("video");
    element.canPlayType = vi.fn(() => nativeHls ? "probably" : "");
    return element;
}

describe("attachMediaSource", () => {
    it("liga e destrói uma fonte progressive", async () => {
        const element = video();
        const adapter = await attachMediaSource(element, {
            url: "/fixtures/video.mp4",
            protocol: "progressive",
            mimeType: "video/mp4",
        });

        expect(element.getAttribute("src")).toBe("/fixtures/video.mp4");
        expect(element.crossOrigin).toBe("use-credentials");
        adapter.destroy();
        expect(element.hasAttribute("src")).toBe(false);
    });

    it("resolve media protegida para a origem configurada da API", async () => {
        const element = video();
        await attachMediaSource(element, {
            url: "/api/media/asset-id",
            protocol: "progressive",
            mimeType: "video/mp4",
        });

        expect(element.src).toBe("http://localhost:3101/api/media/asset-id");
        expect(element.crossOrigin).toBe("use-credentials");
    });

    it("prefere HLS nativo sem carregar o chunk", async () => {
        const loadHls = vi.fn();
        const element = video({ nativeHls: true });
        const adapter = await attachMediaSource(
            element,
            {
                url: "/fixtures/master.m3u8",
                protocol: "hls",
                mimeType: "application/vnd.apple.mpegurl",
            },
            { loadHls },
        );

        expect(adapter.kind).toBe("hls-native");
        expect(loadHls).not.toHaveBeenCalled();
    });

    it("usa hls.js, propaga erro fatal e liberta o adapter", async () => {
        const destroy = vi.fn();
        const on = vi.fn();
        const off = vi.fn();
        const attachMedia = vi.fn();
        const loadSource = vi.fn();
        class HlsFake {
            static Events = { ERROR: "error" };
            static isSupported = () => true;
            on = on;
            off = off;
            attachMedia = attachMedia;
            loadSource = loadSource;
            destroy = destroy;
        }
        const onError = vi.fn();
        const element = video();
        const adapter = await attachMediaSource(
            element,
            {
                url: "/fixtures/master.m3u8",
                protocol: "hls",
                mimeType: "application/vnd.apple.mpegurl",
            },
            { loadHls: async () => ({ default: HlsFake }), onError },
        );

        expect(loadSource).toHaveBeenCalledWith("/fixtures/master.m3u8");
        expect(attachMedia).toHaveBeenCalledWith(element);
        on.mock.calls[0][1]("error", { fatal: true });
        expect(onError).toHaveBeenCalledOnce();
        adapter.destroy();
        expect(destroy).toHaveBeenCalledOnce();
    });

    it("inicializa e destrói dashjs", async () => {
        const initialize = vi.fn();
        const reset = vi.fn();
        const on = vi.fn();
        const off = vi.fn();
        const factory = Object.assign(
            () => ({ create: () => ({ initialize, reset, on, off }) }),
            { events: { ERROR: "error" } },
        );
        const element = video();
        const adapter = await attachMediaSource(
            element,
            {
                url: "/fixtures/manifest.mpd",
                protocol: "dash",
                mimeType: "application/dash+xml",
            },
            { loadDash: async () => ({ MediaPlayer: factory }) },
        );

        expect(initialize).toHaveBeenCalledWith(
            element,
            "http://localhost:3000/fixtures/manifest.mpd",
            false,
        );
        adapter.destroy();
        expect(reset).toHaveBeenCalledOnce();
    });
});
