/**
 * @file Testes do hero cinematográfico e das suas salvaguardas de media.
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentDetailHero } from "./ContentDetailHero.jsx";

const mocks = vi.hoisted(() => ({
    attachMediaSource: vi.fn(),
    destroyAdapter: vi.fn(),
}));

vi.mock("../playback/mediaAdapter.js", () => ({
    attachMediaSource: mocks.attachMediaSource,
}));

const content = {
    id: "content-1",
    title: "Vozes da Capela",
    synopsis: "Um coro encontra novas formas de acompanhar a comunidade.",
    type: "documentary",
    releaseYear: 2025,
    assets: {
        backdropUrl: "/backdrop.jpg",
        previewUrl: "/preview.mp4",
    },
    taxonomies: [{ id: "taxonomy-1", name: "Família", slug: "familia" }],
};

let mediaState;
let intersectionCallback;

/**
 * Configura media queries previsíveis para cada cenário.
 *
 * @param {{ desktop?: boolean, reducedMotion?: boolean, saveData?: boolean }} options Preferências.
 */
function configureEnvironment({
    desktop = true,
    reducedMotion = false,
    saveData = false,
} = {}) {
    vi.stubGlobal("matchMedia", vi.fn((query) => ({
        matches: query.includes("min-width") ? desktop : reducedMotion,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })));
    Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: {
            saveData,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        },
    });
}

function renderHero(props = {}) {
    return render(
        <ContentDetailHero
            content={content}
            durationLabel="49 min"
            ageRatingLabel="6+"
            primaryAction={<button type="button">Reproduzir</button>}
            {...props}
        />,
    );
}

describe("ContentDetailHero", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        mediaState = { paused: false };
        intersectionCallback = null;
        configureEnvironment();
        vi.stubGlobal("IntersectionObserver", class {
            constructor(callback) {
                intersectionCallback = callback;
            }
            observe() {}
            disconnect() {}
        });
        vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => {
            mediaState.paused = false;
            return Promise.resolve();
        });
        vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
            mediaState.paused = true;
        });
        mocks.attachMediaSource.mockResolvedValue({
            kind: "progressive",
            destroy: mocks.destroyAdapter,
        });
    });

    it("reproduz preview elegível sem som e oferece controlos explícitos", async () => {
        const user = userEvent.setup();
        renderHero();

        const video = await waitFor(() => {
            const element = document.querySelector("video");
            expect(element).not.toBeNull();
            return element;
        });
        expect(video).toHaveAttribute("src", "/preview.mp4");
        expect(video).toHaveAttribute("playsinline");
        expect(document.querySelector(".content-detail-hero"))
            .toHaveClass("content-detail-hero-previewing");
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();

        await user.click(
            screen.getByRole("button", { name: "Ativar som do preview" }),
        );
        expect(video.muted).toBe(false);
        await user.click(
            screen.getByRole("button", { name: "Pausar preview" }),
        );
        expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Reproduzir preview" }))
            .toHaveAttribute("aria-pressed", "true");
    });

    it.each([
        ["mobile", { desktop: false }],
        ["movimento reduzido", { reducedMotion: true }],
        ["poupança de dados", { saveData: true }],
    ])("usa backdrop sem transferir vídeo em %s", async (_label, options) => {
        configureEnvironment(options);
        renderHero();

        await waitFor(() => {
            expect(document.querySelector("video")).toBeNull();
        });
        expect(document.querySelector('img[src="/backdrop.jpg"]')).not.toBeNull();
        if (_label === "mobile" || _label === "movimento reduzido") {
            expect(document.querySelector(".content-detail-hero"))
                .toHaveClass("content-detail-hero-static");
        }
    });

    it("remove silenciosamente o preview quando o asset falha", async () => {
        renderHero();
        const video = await waitFor(() => {
            const element = document.querySelector("video");
            expect(element).not.toBeNull();
            return element;
        });

        fireEvent.error(video);

        await waitFor(() => expect(document.querySelector("video")).toBeNull());
        expect(screen.queryByRole("button", { name: /preview/u })).toBeNull();
    });

    it("pausa fora do viewport e retoma quando volta a ficar visível", async () => {
        renderHero();
        await waitFor(() => expect(intersectionCallback).toBeTypeOf("function"));

        act(() => intersectionCallback([{ isIntersecting: false }]));
        expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
        act(() => intersectionCallback([{ isIntersecting: true }]));
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it("liga a fonte privada pelo adapter e destrói-a no cleanup", async () => {
        const privateSource = {
            url: "/api/media/private-preview",
            protocol: "progressive",
            mimeType: "video/mp4",
        };
        const view = renderHero({ previewSource: privateSource });

        const video = await waitFor(() => {
            expect(mocks.attachMediaSource).toHaveBeenCalledOnce();
            return document.querySelector("video");
        });
        expect(video).not.toHaveAttribute("src", "/preview.mp4");
        expect(mocks.attachMediaSource).toHaveBeenCalledWith(
            video,
            privateSource,
            expect.objectContaining({
                signal: expect.any(AbortSignal),
                onError: expect.any(Function),
            }),
        );
        await waitFor(() => expect(HTMLMediaElement.prototype.play)
            .toHaveBeenCalled());

        view.unmount();
        expect(mocks.destroyAdapter).toHaveBeenCalledOnce();
    });

    it("volta ao backdrop quando o adapter privado sinaliza erro", async () => {
        renderHero({
            previewSource: {
                url: "/api/media/private-preview",
                protocol: "progressive",
                mimeType: "video/mp4",
            },
        });
        await waitFor(() => expect(mocks.attachMediaSource).toHaveBeenCalledOnce());

        act(() => {
            mocks.attachMediaSource.mock.calls[0][2].onError(
                new Error("media indisponível"),
            );
        });

        await waitFor(() => expect(document.querySelector("video")).toBeNull());
        expect(document.querySelector('img[src="/backdrop.jpg"]')).not.toBeNull();
    });
});
