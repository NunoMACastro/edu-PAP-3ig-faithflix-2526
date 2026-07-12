/**
 * @file Testes do hero cinematográfico e das suas salvaguardas de media.
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentDetailHero } from "./ContentDetailHero.jsx";

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

function renderHero() {
    return render(
        <ContentDetailHero
            content={content}
            durationLabel="49 min"
            ageRatingLabel="6+"
            primaryAction={<button type="button">Reproduzir</button>}
        />,
    );
}

describe("ContentDetailHero", () => {
    beforeEach(() => {
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
});
