/**
 * @file Regressão do CTA de reprodução para conteúdo sem media.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import {
    ContentDetailPage,
    EpisodeContextPage,
} from "./ContentDetailPage.jsx";

const mocks = vi.hoisted(() => ({
    getDetail: vi.fn(),
    getPreview: vi.fn(),
    listForContent: vi.fn(),
    sessionStatus: "authenticated",
    refreshSession: vi.fn(),
}));

vi.mock("../services/api/catalogApi.js", () => ({
    catalogApi: { getDetail: mocks.getDetail },
}));
vi.mock("../services/api/biblicalPassagesApi.js", () => ({
    biblicalPassagesApi: { listForContent: mocks.listForContent },
}));
vi.mock("../services/api/playbackApi.js", () => ({
    playbackApi: { getPreview: mocks.getPreview },
}));
vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => ({
        status: mocks.sessionStatus,
        refreshSession: mocks.refreshSession,
    }),
}));
vi.mock("../components/comments/CommentsPanel.jsx", () => ({
    CommentsPanel: () => null,
}));
vi.mock("../components/discovery/RelatedContent.jsx", () => ({
    RelatedContent: () => null,
}));
vi.mock("../components/library/LibraryActions.jsx", () => ({
    LibraryActions: () => null,
}));
vi.mock("../components/ratings/RatingBox.jsx", () => ({
    RatingBox: () => null,
}));

function content(isPlayable) {
    return {
        id: "content-1",
        title: "Conteúdo",
        synopsis: "Sinopse pública suficientemente descritiva.",
        type: "movie",
        durationSeconds: 120,
        ageRating: 6,
        assets: {},
        mediaStatus: isPlayable ? "ready" : "pending",
        isPlayable,
    };
}

function renderPage(entry = "/catalogo/conteudo") {
    return render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
                <Route
                    path="/catalogo/:seriesSlug/episodios/:episodeSlug"
                    element={<EpisodeContextPage />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

describe("ContentDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.refreshSession.mockResolvedValue(null);
        mocks.listForContent.mockResolvedValue({ items: [] });
        mocks.getPreview.mockResolvedValue({ content: { source: null } });
    });

    it("desativa reprodução e explica media pendente", async () => {
        mocks.getDetail.mockResolvedValue({ content: content(false) });
        renderPage();

        expect(
            await screen.findByRole("button", {
                name: "Vídeo ainda não disponível",
            }),
        ).toBeDisabled();
        expect(screen.queryByRole("link", { name: "Reproduzir" }))
            .not.toBeInTheDocument();
    });

    it("mantém o CTA autenticado apenas quando a media está pronta", async () => {
        mocks.getDetail.mockResolvedValue({
            content: { ...content(true), id: "content/com espaço" },
        });
        renderPage();

        expect(await screen.findByRole("link", { name: "Reproduzir" }))
            .toHaveAttribute("href", "/ver/content%2Fcom%20espa%C3%A7o");
        await waitFor(() => expect(mocks.getPreview).toHaveBeenCalledWith(
            "content/com espaço",
            { signal: expect.any(AbortSignal) },
        ));
    });

    it("não pede preview para visitante nem para media pendente", async () => {
        mocks.sessionStatus = "anonymous";
        mocks.getDetail.mockResolvedValue({ content: content(true) });
        renderPage();

        expect(await screen.findByRole("link", {
            name: "Entrar para reproduzir",
        })).toBeInTheDocument();
        expect(mocks.getPreview).not.toHaveBeenCalled();

        mocks.sessionStatus = "authenticated";
        mocks.getDetail.mockResolvedValue({ content: content(false) });
        renderPage("/catalogo/outro-conteudo");
        expect(await screen.findByRole("button", {
            name: "Vídeo ainda não disponível",
        })).toBeDisabled();
        expect(mocks.getPreview).not.toHaveBeenCalled();
    });

    it("aborta o preview privado no unmount sem bloquear o detalhe", async () => {
        mocks.getDetail.mockResolvedValue({ content: content(true) });
        mocks.getPreview.mockReturnValue(new Promise(() => {}));
        const view = renderPage();

        await screen.findByRole("link", { name: "Reproduzir" });
        await waitFor(() => expect(mocks.getPreview).toHaveBeenCalledOnce());
        const previewSignal = mocks.getPreview.mock.calls[0][1].signal;

        view.unmount();
        expect(previewSignal.aborted).toBe(true);
    });

    it("apresenta metadados, temas e créditos apenas quando existem", async () => {
        mocks.getDetail.mockResolvedValue({
            content: {
                ...content(true),
                title: "Vozes da Capela",
                releaseYear: 2025,
                taxonomies: [
                    { id: "taxonomy-1", name: "Família", slug: "familia" },
                    { id: "taxonomy-2", name: "Serviço", slug: "servico" },
                ],
                credits: {
                    directors: ["Marta Figueiredo"],
                    creators: ["Tiago Nascimento"],
                    cast: [{ name: "Ana Martins", role: "Maestrina" }],
                },
            },
        });

        renderPage();

        expect(await screen.findByRole("heading", { name: "Vozes da Capela" }))
            .toBeInTheDocument();
        expect(screen.getAllByText("2025").length).toBeGreaterThan(0);
        expect(screen.getByText("Família, Serviço")).toBeInTheDocument();
        expect(screen.getByText("Marta Figueiredo")).toBeInTheDocument();
        expect(screen.getByText("Tiago Nascimento")).toBeInTheDocument();
        expect(screen.getByText("Ana Martins")).toBeInTheDocument();
        expect(screen.getByText("Maestrina")).toBeInTheDocument();
    });

    it("aborta as duas leituras quando a página desmonta", () => {
        mocks.getDetail.mockReturnValue(new Promise(() => {}));
        mocks.listForContent.mockReturnValue(new Promise(() => {}));
        const view = renderPage();
        const detailSignal = mocks.getDetail.mock.calls[0][1].signal;
        const passagesSignal = mocks.listForContent.mock.calls[0][1].signal;

        view.unmount();

        expect(detailSignal.aborted).toBe(true);
        expect(passagesSignal.aborted).toBe(true);
    });

    it("permite repetir detalhe e passagens depois de falhas", async () => {
        mocks.getDetail
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Detalhe indisponível." }),
            )
            .mockResolvedValueOnce({ content: content(false) });
        mocks.listForContent
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Passagens indisponíveis." }),
            )
            .mockResolvedValueOnce({ items: [] });
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText("Detalhe indisponível."))
            .toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Conteúdo indisponível",
            }),
        ).toBeInTheDocument();
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(
            await screen.findByRole("button", {
                name: "Vídeo ainda não disponível",
            }),
        ).toBeDisabled();
        expect(await screen.findByText("Passagens indisponíveis."))
            .toBeInTheDocument();
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );
        expect(await screen.findByText("Sem passagens bíblicas associadas"))
            .toBeInTheDocument();
    });

    it("trata 404 como estado permanente sem apresentar retry", async () => {
        mocks.getDetail.mockRejectedValue(
            new ApiError({ status: 404, message: "Conteúdo não encontrado." }),
        );
        renderPage();

        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: "Conteúdo não encontrado",
            }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Tentar novamente" }))
            .not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Voltar ao catálogo" }))
            .toHaveAttribute("href", "/catalogo");
    });

    it("não trata uma sessão indisponível como logout", async () => {
        mocks.sessionStatus = "unavailable";
        mocks.getDetail.mockResolvedValue({ content: content(true) });
        const user = userEvent.setup();
        renderPage();

        expect(
            await screen.findByRole("button", {
                name: "Sessão temporariamente indisponível",
            }),
        ).toBeDisabled();
        expect(screen.queryByRole("link", { name: "Entrar para reproduzir" }))
            .not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Tentar confirmar sessão" }),
        );
        expect(mocks.refreshSession).toHaveBeenCalledTimes(1);
    });

    it("apresenta série vazia como Em breve e episódios pelo caminho canónico", async () => {
        mocks.getDetail.mockResolvedValue({
            content: {
                ...content(false),
                id: "series-1",
                type: "series",
                title: "Caminhos de Fé",
                slug: "caminhos-de-fe",
                seasonCount: 1,
                episodeCount: 1,
            },
            seasons: [
                {
                    seasonNumber: 1,
                    episodes: [
                        {
                            id: "episode-1",
                            slug: "primeiro-passo",
                            title: "Primeiro passo",
                            synopsis: "Um episódio contextual.",
                            seasonNumber: 1,
                            episodeNumber: 1,
                            durationSeconds: 900,
                            isPlayable: true,
                            canonicalPath:
                                "/catalogo/caminhos-de-fe/episodios/primeiro-passo",
                        },
                    ],
                },
            ],
        });
        renderPage("/catalogo/caminhos-de-fe");

        expect(await screen.findByRole("heading", { name: "Caminhos de Fé" }))
            .toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ver episódio" }))
            .toHaveAttribute(
                "href",
                "/catalogo/caminhos-de-fe/episodios/primeiro-passo",
            );
        expect(screen.getByRole("link", { name: "Reproduzir" }))
            .toHaveAttribute("href", "/ver/episode-1");
    });

    it("mostra episódio dentro da série com navegação entre temporadas", async () => {
        mocks.getDetail.mockResolvedValue({
            content: {
                ...content(true),
                id: "episode-9",
                type: "episode",
                title: "Novo começo",
                slug: "novo-comeco",
                seasonNumber: 2,
                episodeNumber: 1,
            },
            series: {
                id: "series-1",
                title: "Caminhos de Fé",
                slug: "caminhos-de-fe",
            },
            canonicalPath: "/catalogo/caminhos-de-fe/episodios/novo-comeco",
            previousEpisode: {
                canonicalPath:
                    "/catalogo/caminhos-de-fe/episodios/fim-temporada-1",
            },
            nextEpisode: {
                canonicalPath:
                    "/catalogo/caminhos-de-fe/episodios/segundo-passo",
            },
        });
        renderPage("/catalogo/caminhos-de-fe/episodios/novo-comeco");

        expect(await screen.findByRole("heading", { name: "Novo começo" }))
            .toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Episódio anterior" }))
            .toHaveAttribute(
                "href",
                "/catalogo/caminhos-de-fe/episodios/fim-temporada-1",
            );
        expect(screen.getByRole("link", { name: "Episódio seguinte" }))
            .toHaveAttribute(
                "href",
                "/catalogo/caminhos-de-fe/episodios/segundo-passo",
            );
    });
});
