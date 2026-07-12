/**
 * @file Testes de seleção resiliente, acessibilidade e URLs do catálogo público.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { CatalogPage } from "./CatalogPage.jsx";

const mocks = vi.hoisted(() => ({
    sessionStatus: "anonymous",
    listPublished: vi.fn(),
    getDetail: vi.fn(),
    home: vi.fn(),
    mine: vi.fn(),
    sessionUser: null,
    reportMetric: vi.fn(),
}));

vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => ({
        status: mocks.sessionStatus,
        user: mocks.sessionUser,
    }),
}));
vi.mock("../services/api/analyticsApi.js", () => ({
    reportAnonymousMetric: mocks.reportMetric,
}));
vi.mock("../services/api/catalogApi.js", () => ({
    catalogApi: {
        listPublished: mocks.listPublished,
        getDetail: mocks.getDetail,
    },
}));
vi.mock("../services/api/discoveryApi.js", () => ({
    discoveryApi: { home: mocks.home },
}));
vi.mock("../services/api/recommendationsApi.js", () => ({
    recommendationsApi: { mine: mocks.mine },
}));
vi.mock("../components/playback/ContinueWatchingStrip.jsx", () => ({
    ContinueWatchingStrip: () => null,
}));

/**
 * Renderiza a página pública sem backend ou sessão real.
 *
 * @param {string} entry URL inicial.
 * @returns {ReturnType<typeof render>} Controlos do render.
 */
function renderPage(entry = "/catalogo") {
    return render(
        <MemoryRouter initialEntries={[entry]}>
            <CatalogPage />
        </MemoryRouter>,
    );
}

/**
 * Constrói uma página pública representativa.
 *
 * @param {Record<string, unknown>[]} items Conteúdos devolvidos.
 * @returns {Record<string, unknown>} Envelope paginado.
 */
function catalogResponse(items = []) {
    return {
        items,
        page: 1,
        limit: 24,
        total: items.length,
    };
}

/**
 * Cria um conteúdo público mínimo reutilizável nos cenários de fallback.
 *
 * @param {Partial<Record<string, unknown>>} overrides Campos a substituir.
 * @returns {Record<string, unknown>} Conteúdo público.
 */
function publicContent(overrides = {}) {
    return {
        id: "content-1",
        slug: "conteudo-seguro",
        title: "Conteúdo seguro",
        synopsis: "Sinopse pública.",
        type: "movie",
        durationSeconds: 5400,
        ageRating: 12,
        assets: {},
        ...overrides,
    };
}

describe("CatalogPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "anonymous";
        mocks.sessionUser = null;
        mocks.listPublished.mockResolvedValue(catalogResponse());
        mocks.getDetail.mockResolvedValue({ content: null });
        mocks.home.mockResolvedValue({ carousels: [], formats: [] });
        mocks.mine.mockResolvedValue({ groups: [] });
    });

    it("regista a vista do filtro sem enviar identificadores", async () => {
        mocks.sessionStatus = "authenticated";
        mocks.sessionUser = { id: "user-1" };
        renderPage("/catalogo?type=series");

        await waitFor(() =>
            expect(mocks.reportMetric).toHaveBeenCalledWith("catalog_view", {
                category: "series",
            }),
        );
    });

    it("permite repetir a leitura e codifica o slug no link integral", async () => {
        mocks.listPublished
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Catálogo indisponível." }),
            )
            .mockResolvedValueOnce(
                catalogResponse([
                    publicContent({
                        slug: "conteudo/com espaço?origem=catálogo",
                    }),
                ]),
            );
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Catálogo indisponível.",
        );
        const firstOptions = mocks.listPublished.mock.calls[0][1];
        expect(firstOptions.signal).toBeInstanceOf(AbortSignal);

        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        const links = await screen.findAllByRole("link", {
            name: "Ver detalhe: Conteúdo seguro",
        });
        expect(links[0]).toHaveAttribute(
            "href",
            "/catalogo/conteudo%2Fcom%20espa%C3%A7o%3Forigem%3Dcat%C3%A1logo",
        );
        expect(mocks.listPublished).toHaveBeenCalledTimes(2);
    });

    it("usa a primeira recomendação semântica e apresenta a explicação", async () => {
        mocks.sessionStatus = "authenticated";
        mocks.listPublished.mockResolvedValue(
            catalogResponse([publicContent()]),
        );
        mocks.mine.mockResolvedValue({
            coldStart: false,
            personalizationEnabled: true,
            groups: [
                {
                    id: "semantic-similar",
                    explanation: {
                        message: "Relaciona-se com conteúdos que acompanhas.",
                    },
                    items: [
                        {
                            id: "recommended-1",
                            slug: "recomendado/especial",
                            title: "Recomendado compacto",
                        },
                    ],
                },
            ],
        });
        mocks.getDetail.mockResolvedValue({
            content: publicContent({
                id: "recommended-1",
                slug: "recomendado/especial",
                title: "Escolha semântica",
                assets: {
                    posterUrl: "/recommended-poster.webp",
                    backdropUrl: "/recommended-backdrop.webp",
                },
            }),
        });

        renderPage();

        expect(
            await screen.findByRole("heading", {
                name: "Escolha semântica",
                level: 2,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText("Recomendado para ti")).toBeInTheDocument();
        expect(
            screen.getByText("Relaciona-se com conteúdos que acompanhas."),
        ).toBeInTheDocument();
        expect(mocks.getDetail).toHaveBeenCalledWith(
            "recomendado/especial",
            { signal: expect.any(AbortSignal) },
        );
        expect(
            document.querySelector(
                '.catalog-spotlight-image[src="/recommended-backdrop.webp"]',
            ),
        ).toHaveAttribute("loading", "lazy");
    });

    it("usa uma recomendação geral sem a apresentar como personalizada", async () => {
        mocks.sessionStatus = "authenticated";
        mocks.mine.mockResolvedValue({
            coldStart: true,
            personalizationEnabled: false,
            groups: [
                {
                    id: "popular-start",
                    explanation: { message: "Popular no catálogo." },
                    items: [{ id: "popular-1", title: "Popular" }],
                },
            ],
        });
        mocks.getDetail.mockResolvedValue({
            content: publicContent({ id: "popular-1", title: "Popular" }),
        });

        renderPage();

        expect(
            await screen.findByRole("heading", { name: "Popular", level: 2 }),
        ).toBeInTheDocument();
        expect(screen.getByText("Em destaque")).toBeInTheDocument();
        expect(screen.queryByText("Popular no catálogo.")).not.toBeInTheDocument();
    });

    it("recorre ao conteúdo mais recente quando a recomendação falha", async () => {
        mocks.sessionStatus = "authenticated";
        mocks.mine.mockRejectedValue(
            new ApiError({ status: 503, message: "Recomendação indisponível." }),
        );
        mocks.home.mockResolvedValue({
            carousels: [
                {
                    id: "recent",
                    items: [
                        publicContent({
                            id: "recent-1",
                            title: "Estreia recente",
                            posterUrl: "/recent-poster.webp",
                            backdropUrl: "/recent-backdrop.webp",
                        }),
                    ],
                },
            ],
            formats: [],
        });

        renderPage();

        expect(
            await screen.findByRole("heading", {
                name: "Estreia recente",
                level: 2,
            }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("recorre ao primeiro item do catálogo quando não existe discovery", async () => {
        mocks.listPublished.mockResolvedValue(
            catalogResponse([publicContent({ title: "Fallback do catálogo" })]),
        );

        renderPage();

        expect(
            await screen.findByRole("heading", {
                name: "Fallback do catálogo",
                level: 2,
            }),
        ).toBeInTheDocument();
    });

    it("não consulta recomendações numa sessão anónima", async () => {
        mocks.home.mockResolvedValue({
            carousels: [
                {
                    id: "recent",
                    items: [publicContent({ title: "Destaque público" })],
                },
            ],
            formats: [],
        });

        renderPage();

        expect(
            await screen.findByRole("heading", {
                name: "Destaque público",
                level: 2,
            }),
        ).toBeInTheDocument();
        expect(mocks.mine).not.toHaveBeenCalled();
    });

    it("omite spotlight e pedidos suplementares quando existe um filtro", async () => {
        mocks.listPublished.mockResolvedValue(
            catalogResponse([publicContent({ type: "movie" })]),
        );

        renderPage("/catalogo?type=movie");

        await screen.findByRole("heading", { name: "Filmes no catálogo" });
        expect(document.querySelector(".catalog-spotlight")).toBeNull();
        expect(mocks.home).not.toHaveBeenCalled();
        expect(mocks.mine).not.toHaveBeenCalled();
        expect(mocks.getDetail).not.toHaveBeenCalled();
    });

    it("aborta catálogo e discovery quando a página desmonta", () => {
        mocks.listPublished.mockReturnValue(new Promise(() => {}));
        mocks.home.mockReturnValue(new Promise(() => {}));
        const view = renderPage();
        const catalogSignal = mocks.listPublished.mock.calls[0][1].signal;
        const discoverySignal = mocks.home.mock.calls[0][0].signal;

        view.unmount();

        expect(catalogSignal.aborted).toBe(true);
        expect(discoverySignal.aborted).toBe(true);
    });

    it("aborta o detalhe recomendado quando a página desmonta", async () => {
        mocks.sessionStatus = "authenticated";
        mocks.mine.mockResolvedValue({
            coldStart: false,
            personalizationEnabled: true,
            groups: [
                {
                    id: "semantic-similar",
                    items: [{ id: "recommended-1", title: "Recomendado" }],
                },
            ],
        });
        mocks.getDetail.mockReturnValue(new Promise(() => {}));
        const view = renderPage();

        await waitFor(() => expect(mocks.getDetail).toHaveBeenCalledOnce());
        const detailSignal = mocks.getDetail.mock.calls[0][1].signal;
        view.unmount();

        expect(detailSignal.aborted).toBe(true);
    });
});
