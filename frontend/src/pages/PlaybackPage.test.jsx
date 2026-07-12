/**
 * @file Testes comportamentais do player autenticado e da fonte canónica.
 */

import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { PlaybackPage } from "./PlaybackPage.jsx";

const mocks = vi.hoisted(() => ({
    getPlayback: vi.fn(),
    saveProgress: vi.fn(),
    savePreferences: vi.fn(),
    attachMediaSource: vi.fn(),
    createProgressQueue: vi.fn(),
    destroyAdapter: vi.fn(),
    queue: null,
    reportMetric: vi.fn(),
}));

vi.mock("../services/api/playbackApi.js", () => ({
    playbackApi: {
        getPlayback: mocks.getPlayback,
        saveProgress: mocks.saveProgress,
        savePreferences: mocks.savePreferences,
    },
}));

vi.mock("../components/playback/mediaAdapter.js", () => ({
    attachMediaSource: mocks.attachMediaSource,
}));

vi.mock("../components/playback/progressQueue.js", () => ({
    createProgressQueue: mocks.createProgressQueue,
}));
vi.mock("../services/api/analyticsApi.js", () => ({
    reportAnonymousMetric: mocks.reportMetric,
}));

/**
 * Cria o contrato de playback sem qualquer URL em options ou tracks.
 *
 * @param {Record<string, unknown>} [overrides] Alterações de topo do conteúdo.
 * @returns {Record<string, unknown>} Resposta autenticada.
 */
function playbackResponse(overrides = {}) {
    const selectedQuality = overrides.selectedQuality ?? "720p";

    return {
        content: {
            id: "content-1",
            title: "Filme de teste",
            mediaStatus: "ready",
            isPlayable: true,
            source: {
                url: "/__fixtures__/sample.mp4",
                protocol: "progressive",
                mimeType: "video/mp4",
            },
            selectedAudioLanguage: "pt",
            selectedQuality,
            qualityOptions: [
                {
                    value: "720p",
                    label: "HD",
                    locked: false,
                    selected: selectedQuality === "720p",
                },
                {
                    value: "1080p",
                    label: "Full HD",
                    locked: false,
                    selected: selectedQuality === "1080p",
                },
                {
                    value: "4k",
                    label: "2160p",
                    locked: true,
                    selected: false,
                    lockedReason: "Requer outro plano",
                },
            ],
            tracks: {
                subtitles: [
                    { language: "pt", label: "Português", locked: false },
                ],
                audio: [
                    { language: "pt", label: "Português", locked: false },
                    { language: "en", label: "Inglês", locked: false },
                ],
            },
            preferences: {
                subtitleLanguage: "",
                audioLanguage: "pt",
                quality: "4k",
            },
            ...overrides,
        },
        progress: { currentTimeSeconds: 12 },
    };
}

/** @returns {ReturnType<typeof render>} Página montada na rota real. */
function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/ver/content-1"]}>
            <Routes>
                <Route path="/ver/:contentId" element={<PlaybackPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("PlaybackPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.queue = {
            enqueue: vi.fn().mockResolvedValue(30),
            close: vi.fn().mockResolvedValue(30),
            getLastSaved: vi.fn(() => 12),
        };
        mocks.getPlayback.mockResolvedValue(playbackResponse());
        mocks.saveProgress.mockResolvedValue({ progress: { currentTimeSeconds: 30 } });
        mocks.savePreferences.mockResolvedValue({ saved: true });
        mocks.attachMediaSource.mockResolvedValue({
            kind: "progressive",
            destroy: mocks.destroyAdapter,
        });
        mocks.createProgressQueue.mockImplementation(() => mocks.queue);
    });

    it("liga a única source ao adapter e retoma progresso confirmado", async () => {
        const view = renderPage();
        const player = await screen.findByTestId("faithflix-player");

        await waitFor(() => expect(mocks.attachMediaSource).toHaveBeenCalledOnce());
        expect(mocks.attachMediaSource.mock.calls[0][1]).toEqual({
            url: "/__fixtures__/sample.mp4",
            protocol: "progressive",
            mimeType: "video/mp4",
        });
        expect(mocks.attachMediaSource.mock.calls[0][2].signal)
            .toBeInstanceOf(AbortSignal);
        expect(mocks.createProgressQueue).toHaveBeenCalledWith(
            expect.any(Function),
            { initialPosition: 12 },
        );

        fireEvent.loadedMetadata(player);
        expect(player.currentTime).toBe(12);
        fireEvent.canPlay(player);
        expect(screen.queryByText("A preparar vídeo...")).not.toBeInTheDocument();

        const persist = mocks.createProgressQueue.mock.calls[0][0];
        await persist(31);
        expect(mocks.saveProgress).toHaveBeenCalledWith(
            "content-1",
            31,
            { keepalive: true },
        );

        view.unmount();
        expect(mocks.destroyAdapter).toHaveBeenCalledOnce();
        expect(mocks.queue.close).toHaveBeenCalledWith(12);
    });

    it("explica MEDIA_NOT_READY e permite repetir a leitura", async () => {
        mocks.getPlayback
            .mockReset()
            .mockRejectedValueOnce(
                new ApiError({
                    status: 409,
                    code: "MEDIA_NOT_READY",
                    message: "Media not ready.",
                }),
            )
            .mockResolvedValueOnce(playbackResponse());
        const user = userEvent.setup();
        renderPage();

        expect(
            await screen.findByRole("heading", {
                name: "Vídeo ainda não disponível",
            }),
        ).toBeInTheDocument();
        expect(mocks.attachMediaSource).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(await screen.findByText("Filme de teste")).toBeInTheDocument();
        expect(mocks.getPlayback).toHaveBeenCalledTimes(2);
    });

    it("usa a seleção canónica e volta ao backend após mudar qualidade", async () => {
        const nextResponse = playbackResponse({
            source: {
                url: "/__fixtures__/master.m3u8",
                protocol: "hls",
                mimeType: "application/vnd.apple.mpegurl",
            },
            selectedAudioLanguage: "pt",
            selectedQuality: "1080p",
            preferences: {
                subtitleLanguage: "",
                audioLanguage: "pt",
                quality: "1080p",
            },
        });
        mocks.getPlayback
            .mockReset()
            .mockResolvedValueOnce(playbackResponse())
            .mockResolvedValueOnce(nextResponse);
        const user = userEvent.setup();
        renderPage();

        const quality = await screen.findByLabelText("Qualidade");
        expect(quality).toHaveValue("720p");
        expect(
            screen.getByRole("option", { name: "2160p - Requer outro plano" }),
        ).toBeDisabled();

        await user.selectOptions(quality, "1080p");
        await waitFor(() => expect(mocks.savePreferences).toHaveBeenCalledWith({
            subtitleLanguage: "",
            audioLanguage: "pt",
            quality: "1080p",
        }));
        await waitFor(() => expect(mocks.getPlayback).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(mocks.attachMediaSource).toHaveBeenCalledTimes(2));
        expect(mocks.attachMediaSource.mock.calls[1][1]).toMatchObject({
            protocol: "hls",
        });
        expect(quality).toHaveValue("1080p");
    });

    it("reverte uma preferência otimista quando a escrita falha", async () => {
        mocks.savePreferences.mockRejectedValueOnce(
            new ApiError({
                status: 503,
                message: "Preferência temporariamente indisponível.",
            }),
        );
        const user = userEvent.setup();
        renderPage();

        const audio = await screen.findByLabelText("Áudio");
        expect(audio).toHaveValue("pt");
        await user.selectOptions(audio, "en");

        await waitFor(() => expect(audio).toHaveValue("pt"));
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Preferência temporariamente indisponível.",
        );
        expect(mocks.getPlayback).toHaveBeenCalledOnce();
    });

    it("coalesce progresso e faz flush em pause, pagehide e unmount", async () => {
        const view = renderPage();
        const player = await screen.findByTestId("faithflix-player");
        await waitFor(() => expect(mocks.createProgressQueue).toHaveBeenCalledOnce());

        player.currentTime = 30;
        fireEvent.timeUpdate(player);
        fireEvent.pause(player);
        act(() => globalThis.dispatchEvent(new Event("pagehide")));

        expect(mocks.queue.enqueue).toHaveBeenCalledTimes(3);
        expect(mocks.queue.enqueue).toHaveBeenNthCalledWith(1, 30);
        expect(mocks.queue.enqueue).toHaveBeenNthCalledWith(2, 30);
        expect(mocks.queue.enqueue).toHaveBeenNthCalledWith(3, 30);

        view.unmount();
        expect(mocks.queue.close).toHaveBeenCalledWith(30);
    });

    it("substitui o player preto por erro e retry do mesmo protocolo", async () => {
        const user = userEvent.setup();
        renderPage();
        const player = await screen.findByTestId("faithflix-player");
        await waitFor(() => expect(mocks.attachMediaSource).toHaveBeenCalledOnce());

        act(() => {
            mocks.attachMediaSource.mock.calls[0][2].onError(
                new Error("stream failure"),
            );
        });

        expect(player).not.toBeVisible();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível reproduzir este vídeo.",
        );
        await user.click(
            screen.getByRole("button", {
                name: "Tentar reproduzir novamente",
            }),
        );
        await waitFor(() => expect(mocks.attachMediaSource).toHaveBeenCalledTimes(2));
    });

    it("cancela a leitura autenticada quando a rota desmonta", () => {
        mocks.getPlayback.mockReset().mockReturnValue(new Promise(() => {}));
        const view = renderPage();
        const signal = mocks.getPlayback.mock.calls[0][1].signal;

        view.unmount();

        expect(signal.aborted).toBe(true);
    });

    it("emite métricas started/completed uma vez e sem ids", async () => {
        mocks.getPlayback.mockResolvedValue(
            playbackResponse({ type: "episode", durationSeconds: 120 }),
        );
        renderPage();
        const player = await screen.findByTestId("faithflix-player");

        fireEvent.play(player);
        fireEvent.play(player);
        fireEvent.ended(player);
        fireEvent.ended(player);

        expect(mocks.reportMetric).toHaveBeenCalledTimes(2);
        expect(mocks.reportMetric).toHaveBeenNthCalledWith(
            1,
            "playback_started",
            { category: "episode" },
        );
        expect(mocks.reportMetric).toHaveBeenNthCalledWith(
            2,
            "playback_completed",
            { category: "episode" },
        );
    });
});
