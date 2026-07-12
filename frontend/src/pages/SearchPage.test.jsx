/**
 * @file Testes comportamentais da pesquisa URL-driven e race-safe.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { SearchPage } from "./SearchPage.jsx";

const mocks = vi.hoisted(() => ({
    search: vi.fn(),
    listTaxonomies: vi.fn(),
    home: vi.fn(),
    sessionUser: null,
    reportMetric: vi.fn(),
}));

vi.mock("../services/api/searchApi.js", () => ({
    searchApi: { search: mocks.search },
}));

vi.mock("../services/api/catalogApi.js", () => ({
    catalogApi: { listTaxonomies: mocks.listTaxonomies },
}));

vi.mock("../services/api/discoveryApi.js", () => ({
    discoveryApi: { home: mocks.home },
}));
vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => ({ user: mocks.sessionUser }),
}));
vi.mock("../services/api/analyticsApi.js", () => ({
    reportAnonymousMetric: mocks.reportMetric,
}));

/** @returns {JSX.Element} Query string observável. */
function LocationProbe() {
    const location = useLocation();
    return <output data-testid="search-location">{location.search}</output>;
}

/** @param {string} initialEntry URL inicial. @returns {void} */
function renderPage(initialEntry) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path="/pesquisa"
                    element={
                        <>
                            <SearchPage />
                            <LocationProbe />
                        </>
                    }
                />
            </Routes>
        </MemoryRouter>,
    );
}

function searchResponse({ query = "fe", page = 1, total = 25 } = {}) {
    return {
        query,
        page,
        limit: 12,
        total,
        items: [
            {
                id: `item-${query}-${page}`,
                title: `Resultado ${query} ${page}`,
                slug: `resultado-${query}-${page}`,
                synopsis: "Descrição pública do resultado.",
                type: "movie",
                posterUrl: "",
                taxonomyNames: [],
            },
        ],
    };
}

describe("SearchPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.listTaxonomies.mockResolvedValue({ items: [] });
        mocks.home.mockResolvedValue({ carousels: [], formats: [] });
        mocks.search.mockResolvedValue(searchResponse());
        mocks.sessionUser = null;
    });

    it("regista submissão anónima apenas quando existe sessão", async () => {
        mocks.sessionUser = { id: "user-1" };
        const user = userEvent.setup();
        renderPage("/pesquisa");

        await user.type(screen.getByLabelText("Pesquisa"), "família");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(mocks.reportMetric).toHaveBeenCalledWith("search_submit", {
            category: "uncategorized",
        });
    });

    it("restaura filtros/página do URL e pagina preservando-os", async () => {
        mocks.search.mockImplementation(async (input) =>
            searchResponse({ query: input.query, page: input.page }),
        );
        const user = userEvent.setup();
        renderPage("/pesquisa?q=fe&type=movie&sort=rating&page=2");

        expect(
            await screen.findByRole("link", {
                name: "Ver detalhe: Resultado fe 2",
            }),
        ).toBeInTheDocument();
        expect(mocks.search).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: "fe", type: "movie", sort: "rating", page: 2 }),
            expect.objectContaining({ signal: expect.any(AbortSignal) }),
        );

        await user.click(screen.getByRole("button", { name: "Seguinte" }));
        expect(
            await screen.findByRole("link", {
                name: "Ver detalhe: Resultado fe 3",
            }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("search-location")).toHaveTextContent("page=3");
        expect(screen.getByTestId("search-location")).toHaveTextContent("type=movie");
    });

    it("submissão canónica reinicia a página", async () => {
        mocks.search.mockResolvedValue(searchResponse({ query: "antiga", page: 4 }));
        const user = userEvent.setup();
        renderPage("/pesquisa?q=antiga&page=4&sort=title");

        const input = await screen.findByRole("textbox", { name: "Pesquisa" });
        await user.clear(input);
        await user.type(input, "nova pesquisa");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        await waitFor(() => {
            expect(screen.getByTestId("search-location")).toHaveTextContent(
                "q=nova+pesquisa&page=1",
            );
        });
    });

    it("ignora uma resposta antiga depois de nova navegação", async () => {
        let resolveOld;
        const oldResponse = new Promise((resolve) => {
            resolveOld = resolve;
        });
        mocks.search
            .mockReturnValueOnce(oldResponse)
            .mockResolvedValueOnce(searchResponse({ query: "nova", page: 1 }));
        const user = userEvent.setup();
        renderPage("/pesquisa?q=antiga&page=1&sort=title");

        const input = screen.getByRole("textbox", { name: "Pesquisa" });
        await user.clear(input);
        await user.type(input, "nova");
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));
        expect(
            await screen.findByRole("link", {
                name: "Ver detalhe: Resultado nova 1",
            }),
        ).toBeInTheDocument();

        resolveOld(searchResponse({ query: "antiga", page: 1 }));
        await waitFor(() => {
            expect(screen.queryByText("Resultado antiga 1")).not.toBeInTheDocument();
        });
    });

    it("permite repetir uma pesquisa falhada e codifica o slug no link", async () => {
        mocks.search
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Pesquisa indisponível." }),
            )
            .mockResolvedValueOnce({
                ...searchResponse({ query: "segura" }),
                items: [
                    {
                        id: "content-1",
                        title: "Resultado seguro",
                        slug: "conteudo/com espaço?origem=teste",
                        synopsis: "Descrição pública.",
                        type: "movie",
                        posterUrl: "",
                        taxonomyNames: [],
                    },
                ],
            });
        const user = userEvent.setup();
        renderPage("/pesquisa?q=segura&page=1&sort=title");

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Pesquisa indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(
            await screen.findByRole("link", {
                name: "Ver detalhe: Resultado seguro",
            }),
        ).toHaveAttribute(
            "href",
            "/catalogo/conteudo%2Fcom%20espa%C3%A7o%3Forigem%3Dteste",
        );
        expect(mocks.search).toHaveBeenCalledTimes(2);
    });

    it("aborta taxonomias e discovery quando a página desmonta", () => {
        mocks.listTaxonomies.mockReturnValue(new Promise(() => {}));
        mocks.home.mockReturnValue(new Promise(() => {}));
        const view = renderPage("/pesquisa");
        const taxonomySignal = mocks.listTaxonomies.mock.calls[0][0].signal;
        const discoverySignal = mocks.home.mock.calls[0][0].signal;

        view.unmount();

        expect(taxonomySignal.aborted).toBe(true);
        expect(discoverySignal.aborted).toBe(true);
    });

    it("permite repetir o carregamento dos temas", async () => {
        mocks.listTaxonomies
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Temas indisponíveis." }),
            )
            .mockResolvedValueOnce({
                items: [{ id: "tema-1", name: "Família" }],
            });
        const user = userEvent.setup();
        renderPage("/pesquisa");

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Temas indisponíveis.",
        );
        await user.click(
            screen.getByRole("button", {
                name: "Tentar carregar temas novamente",
            }),
        );

        expect(await screen.findByRole("option", { name: "Família" }))
            .toBeInTheDocument();
        expect(mocks.listTaxonomies).toHaveBeenCalledTimes(2);
    });

    it("apresenta temas rápidos e novidades antes de pesquisar", async () => {
        mocks.listTaxonomies.mockResolvedValue({
            items: [{ id: "tema-familia", name: "Família" }],
        });
        mocks.home.mockResolvedValue({
            carousels: [
                {
                    id: "recent",
                    items: [
                        {
                            id: "recent-1",
                            slug: "estreia-recente",
                            title: "Estreia recente",
                            type: "documentary",
                            posterUrl: "/recent.webp",
                        },
                    ],
                },
            ],
            formats: [],
        });
        const user = userEvent.setup();
        renderPage("/pesquisa");

        const topic = await screen.findByRole("button", {
            name: "Família",
            exact: true,
        });
        expect(
            await screen.findByRole("heading", {
                name: "Adicionados recentemente",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Ver detalhe: Estreia recente" }),
        ).toHaveAttribute("href", "/catalogo/estreia-recente");

        await user.click(topic);

        await waitFor(() => {
            expect(screen.getByTestId("search-location")).toHaveTextContent(
                "q=Fam%C3%ADlia",
            );
            expect(screen.getByTestId("search-location")).toHaveTextContent(
                "taxonomyId=tema-familia",
            );
        });
    });

    it("trata a discovery como melhoria opcional e não a carrega com query", async () => {
        mocks.home.mockRejectedValue(
            new ApiError({ status: 503, message: "Discovery indisponível." }),
        );
        const view = renderPage("/pesquisa");

        await waitFor(() => expect(mocks.home).toHaveBeenCalledOnce());
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        view.unmount();
        vi.clearAllMocks();
        mocks.listTaxonomies.mockResolvedValue({ items: [] });
        mocks.search.mockResolvedValue(searchResponse({ query: "fe" }));
        renderPage("/pesquisa?q=fe&page=1&sort=title");

        await screen.findByRole("link", {
            name: "Ver detalhe: Resultado fe 1",
        });
        expect(mocks.home).not.toHaveBeenCalled();
    });

    it("remove filtros ativos preservando a query e regressando à página 1", async () => {
        mocks.search.mockImplementation(async (input) =>
            searchResponse({ query: input.query, page: input.page }),
        );
        const user = userEvent.setup();
        renderPage("/pesquisa?q=fe&type=movie&sort=rating&page=2");

        await screen.findByRole("link", {
            name: "Ver detalhe: Resultado fe 2",
        });
        await user.click(
            screen.getByRole("button", {
                name: "Remover filtro Tipo: Filme",
            }),
        );

        await waitFor(() => {
            const location = screen.getByTestId("search-location");
            expect(location).toHaveTextContent("q=fe");
            expect(location).toHaveTextContent("page=1");
            expect(location).not.toHaveTextContent("type=movie");
            expect(location).toHaveTextContent("sort=rating");
        });
    });

    it("expõe e volta a recolher os filtros mobile depois da submissão", async () => {
        const user = userEvent.setup();
        renderPage("/pesquisa");

        const toggle = screen.getByRole("button", {
            name: "Mostrar filtros",
        });
        expect(toggle).toHaveAttribute("aria-expanded", "false");

        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(toggle).toHaveAccessibleName("Ocultar filtros");

        await user.type(
            screen.getByRole("textbox", { name: "Pesquisa" }),
            "esperança",
        );
        await user.click(screen.getByRole("button", { name: "Pesquisar" }));

        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(toggle).toHaveAccessibleName("Mostrar filtros");
    });

    it("orienta uma pesquisa sem resultados sem alterar a query", async () => {
        mocks.search.mockResolvedValue({
            ...searchResponse({ query: "inexistente", total: 0 }),
            items: [],
        });
        renderPage("/pesquisa?q=inexistente&type=movie&page=1&sort=title");

        expect(
            await screen.findByRole("heading", {
                name: "Sem resultados para a pesquisa",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Ver catálogo completo" }),
        ).toHaveAttribute("href", "/catalogo");
        expect(
            screen.getByRole("button", { name: "Limpar filtros", exact: true }),
        ).toBeInTheDocument();
    });
});
