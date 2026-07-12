/**
 * @file Testes comportamentais da home pública cancelável e fail-closed.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { DiscoveryHomePage } from "./DiscoveryHomePage.jsx";

const mocks = vi.hoisted(() => ({
    sessionStatus: "authenticated",
    home: vi.fn(),
}));

vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => ({ status: mocks.sessionStatus }),
}));

vi.mock("../services/api/discoveryApi.js", () => ({
    discoveryApi: { home: mocks.home },
}));

/**
 * Renderiza a home dentro do router usado pelos links.
 *
 * @returns {import("@testing-library/react").RenderResult} Resultado RTL.
 */
function renderHome() {
    return render(
        <MemoryRouter>
            <DiscoveryHomePage />
        </MemoryRouter>,
    );
}

/**
 * Constrói uma resposta pública representativa da discovery.
 *
 * @param {boolean} isPlayable Disponibilidade autorizada do destaque.
 * @returns {Record<string, unknown>} Envelope público.
 */
function homeResponse(isPlayable = false) {
    return {
        carousels: [
            {
                id: "recent",
                title: "Adicionados recentemente",
                items: [
                    {
                        id: "hero-1",
                        slug: "o-caminho",
                        title: "O Caminho",
                        synopsis: "Uma história de esperança.",
                        type: "movie",
                        durationSeconds: 5400,
                        ageRating: 12,
                        posterUrl: "/hero-poster.jpg",
                        backdropUrl: "/hero-backdrop.jpg",
                        mediaStatus: isPlayable ? "ready" : "pending",
                        isPlayable,
                    },
                ],
            },
            {
                id: "most-watched",
                title: "Mais vistos",
                items: [
                    {
                        id: "popular-1",
                        slug: "popular",
                        title: "Popular",
                        type: "documentary",
                        posterUrl: "/popular.jpg",
                    },
                ],
            },
        ],
        formats: [
            {
                type: "documentary",
                count: 2,
                sampleTitle: "Popular",
                posterUrl: "/format.jpg",
            },
        ],
    };
}

describe("DiscoveryHomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.home.mockResolvedValue(homeResponse());
    });

    it("falha fechado para media pendente e traduz metadata técnica", async () => {
        renderHome();

        expect(
            await screen.findByRole("heading", { name: "O Caminho", level: 1 }),
        ).toBeInTheDocument();
        expect(document.querySelector(".home-hero-meta")).toHaveTextContent(
            "Filme",
        );
        expect(
            screen.getByRole("button", { name: "Vídeo ainda não disponível" }),
        ).toBeDisabled();
        expect(
            screen.queryByRole("link", { name: "Reproduzir" }),
        ).not.toBeInTheDocument();
    });

    it("mantém imagens abaixo da dobra em lazy loading", async () => {
        renderHome();

        await screen.findByText("Popular");

        expect(
            document.querySelector('img[src="/popular.jpg"]'),
        ).toHaveAttribute("loading", "lazy");
        expect(document.querySelector('img[src="/format.jpg"]')).toHaveAttribute(
            "loading",
            "lazy",
        );
        expect(
            document.querySelector(
                '.discovery-carousel img[src="/hero-poster.jpg"]',
            ),
        ).toHaveAttribute("loading", "lazy");
        expect(
            document.querySelector('.home-hero-image[src="/hero-backdrop.jpg"]'),
        ).not.toHaveAttribute("loading", "lazy");
    });

    it("permite repetir uma leitura falhada com erro seguro", async () => {
        mocks.home
            .mockRejectedValueOnce(
                new ApiError({
                    status: 503,
                    message: "Descoberta temporariamente indisponível.",
                }),
            )
            .mockResolvedValueOnce(homeResponse(true));
        const user = userEvent.setup();

        renderHome();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Descoberta temporariamente indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(
            await screen.findByRole("link", { name: "Reproduzir" }),
        ).toHaveAttribute("href", "/ver/hero-1");
        expect(mocks.home).toHaveBeenCalledTimes(2);
        expect(mocks.home).toHaveBeenLastCalledWith({
            signal: expect.any(AbortSignal),
        });
    });

    it("aborta a leitura pendente ao desmontar", () => {
        mocks.home.mockReturnValue(new Promise(() => {}));

        const view = renderHome();
        const signal = mocks.home.mock.calls[0][0].signal;

        view.unmount();
        expect(signal.aborted).toBe(true);
    });

    it("codifica ids e slugs ao construir links dinâmicos", async () => {
        const response = homeResponse(true);
        response.carousels[0].items[0].id = "hero/1";
        response.carousels[0].items[0].slug = "o-caminho/edicao";
        response.carousels[1].items[0].slug = "popular/edicao";
        mocks.home.mockResolvedValue(response);

        renderHome();

        expect(
            await screen.findByRole("link", { name: "Reproduzir" }),
        ).toHaveAttribute("href", "/ver/hero%2F1");
        expect(
            screen.getByRole("link", { name: "Ver detalhe", exact: true }),
        ).toHaveAttribute("href", "/catalogo/o-caminho%2Fedicao");
        expect(
            screen.getByRole("link", { name: "Ver detalhe de Popular" }),
        ).toHaveAttribute("href", "/catalogo/popular%2Fedicao");
    });

    it("não converte indisponibilidade de sessão em redirect para login", async () => {
        mocks.sessionStatus = "unavailable";
        mocks.home.mockResolvedValue(homeResponse(true));

        renderHome();

        expect(
            await screen.findByRole("button", {
                name: "Sessão temporariamente indisponível",
            }),
        ).toBeDisabled();
        expect(
            screen.queryByRole("link", { name: "Entrar para reproduzir" }),
        ).not.toBeInTheDocument();
    });
});
