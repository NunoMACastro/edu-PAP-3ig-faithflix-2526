/**
 * @file Testes das listas pessoais paginadas e independentes.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyLibraryPage } from "./MyLibraryPage.jsx";

const mocks = vi.hoisted(() => ({
    listFavorites: vi.fn(),
    listWatchlist: vi.fn(),
    listHistory: vi.fn(),
}));

vi.mock("../services/api/libraryApi.js", () => ({ libraryApi: mocks }));

function listResponse(title, overrides = {}) {
    return {
        items: title
            ? [{ id: title, title, slug: title.toLowerCase(), posterUrl: "" }]
            : [],
        page: 1,
        limit: 12,
        total: title ? 1 : 0,
        totalPages: 1,
        ...overrides,
    };
}

function renderLibrary() {
    return render(
        <MemoryRouter>
            <MyLibraryPage />
        </MemoryRouter>,
    );
}

describe("MyLibraryPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.listFavorites.mockResolvedValue(listResponse("Favorito"));
        mocks.listWatchlist.mockResolvedValue(listResponse("Mais tarde"));
        mocks.listHistory.mockResolvedValue(listResponse("Histórico visto"));
    });

    it("carrega as três listas com paginação limitada e sinais separados", async () => {
        renderLibrary();

        expect(await screen.findByText("Favorito")).toBeInTheDocument();
        expect(await screen.findByText("Mais tarde")).toBeInTheDocument();
        expect(await screen.findByText("Histórico visto")).toBeInTheDocument();
        expect(mocks.listFavorites).toHaveBeenCalledWith(
            { page: 1, limit: 12 },
            { signal: expect.any(AbortSignal) },
        );
        expect(mocks.listWatchlist).toHaveBeenCalledWith(
            { page: 1, limit: 12 },
            { signal: expect.any(AbortSignal) },
        );
    });

    it("pagina apenas a secção escolhida", async () => {
        mocks.listFavorites.mockResolvedValueOnce(
            listResponse("Favorito", { total: 13, totalPages: 2 }),
        );
        mocks.listFavorites.mockResolvedValueOnce(
            listResponse("Favorito página dois", {
                page: 2,
                total: 13,
                totalPages: 2,
            }),
        );
        const user = userEvent.setup();
        renderLibrary();

        await user.click(
            await screen.findByRole("button", {
                name: "Página seguinte de Favoritos",
            }),
        );

        expect(await screen.findByText("Favorito página dois"))
            .toBeInTheDocument();
        expect(mocks.listFavorites).toHaveBeenLastCalledWith(
            { page: 2, limit: 12 },
            { signal: expect.any(AbortSignal) },
        );
        expect(mocks.listWatchlist).toHaveBeenCalledOnce();
    });

    it("codifica o slug antes de construir o link de detalhe", async () => {
        mocks.listFavorites.mockResolvedValue(
            listResponse("Favorito", {
                items: [
                    {
                        id: "favorite-1",
                        title: "Favorito",
                        slug: "favorito/edicao",
                        posterUrl: "",
                    },
                ],
            }),
        );

        renderLibrary();

        expect(
            await screen.findByRole("link", {
                name: "Ver detalhe: Favorito",
            }),
        ).toHaveAttribute("href", "/catalogo/favorito%2Fedicao");
    });

    it("cancela todas as leituras pendentes ao desmontar", () => {
        mocks.listFavorites.mockReturnValue(new Promise(() => {}));
        mocks.listWatchlist.mockReturnValue(new Promise(() => {}));
        mocks.listHistory.mockReturnValue(new Promise(() => {}));
        const view = renderLibrary();
        const signals = [
            mocks.listFavorites.mock.calls[0][1].signal,
            mocks.listWatchlist.mock.calls[0][1].signal,
            mocks.listHistory.mock.calls[0][1].signal,
        ];

        view.unmount();

        expect(signals.every((signal) => signal.aborted)).toBe(true);
    });

    it("permite repetir apenas a lista que falhou", async () => {
        mocks.listHistory
            .mockRejectedValueOnce(new Error("detalhe técnico"))
            .mockResolvedValueOnce(listResponse("Recuperado"));
        const user = userEvent.setup();
        renderLibrary();

        const historySection = screen.getByRole("heading", {
            name: "Histórico",
        }).closest("section");
        await waitFor(() => {
            expect(historySection).toHaveTextContent(
                "Ocorreu um erro inesperado.",
            );
        });
        await user.click(
            screen.getAllByRole("button", { name: "Tentar novamente" })[0],
        );

        expect(await screen.findByText("Recuperado")).toBeInTheDocument();
        expect(mocks.listFavorites).toHaveBeenCalledOnce();
    });
});
