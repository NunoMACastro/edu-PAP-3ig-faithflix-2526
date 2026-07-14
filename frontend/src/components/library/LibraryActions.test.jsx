/**
 * @file Testes das ações canceláveis e reversíveis da biblioteca pessoal.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../services/api/apiErrors.js";
import { LibraryActions } from "./LibraryActions.jsx";

const mocks = vi.hoisted(() => ({
    sessionStatus: "authenticated",
    listFavorites: vi.fn(),
    listWatchlist: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    addWatchlist: vi.fn(),
    removeWatchlist: vi.fn(),
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => ({ status: mocks.sessionStatus }),
}));

vi.mock("../../services/api/libraryApi.js", () => ({
    libraryApi: {
        listFavorites: mocks.listFavorites,
        listWatchlist: mocks.listWatchlist,
        addFavorite: mocks.addFavorite,
        removeFavorite: mocks.removeFavorite,
        addWatchlist: mocks.addWatchlist,
        removeWatchlist: mocks.removeWatchlist,
    },
}));

/**
 * Renderiza o componente dentro do router exigido pelo redirect de login.
 *
 * @returns {import("@testing-library/react").RenderResult} Resultado RTL.
 */
function renderActions() {
    return render(
        <MemoryRouter initialEntries={["/catalogo/filme"]}>
            <LibraryActions contentId="content-1" />
        </MemoryRouter>,
    );
}

describe("LibraryActions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.listFavorites.mockResolvedValue({ items: [] });
        mocks.listWatchlist.mockResolvedValue({ items: [] });
        mocks.addFavorite.mockResolvedValue({ saved: true });
        mocks.removeFavorite.mockResolvedValue({ saved: false });
        mocks.addWatchlist.mockResolvedValue({ saved: true });
        mocks.removeWatchlist.mockResolvedValue({ saved: false });
    });

    it("carrega as listas com paginação limitada e sinal cancelável", async () => {
        mocks.listFavorites.mockResolvedValue({
            items: [{ id: "content-1" }],
        });

        renderActions();

        expect(
            await screen.findByRole("button", {
                name: "Remover dos favoritos",
            }),
        ).toBeInTheDocument();
        expect(mocks.listFavorites).toHaveBeenCalledWith(
            { page: 1, limit: 50 },
            { signal: expect.any(AbortSignal) },
        );
    });

    it("procura o conteúdo além da primeira página paginada", async () => {
        mocks.listFavorites
            .mockResolvedValueOnce({ items: [], totalPages: 2 })
            .mockResolvedValueOnce({
                items: [{ id: "content-1" }],
                totalPages: 2,
            });

        renderActions();

        expect(
            await screen.findByRole("button", {
                name: "Remover dos favoritos",
            }),
        ).toBeInTheDocument();
        expect(mocks.listFavorites).toHaveBeenNthCalledWith(
            2,
            { page: 2, limit: 50 },
            { signal: expect.any(AbortSignal) },
        );
    });

    it("reverte a atualização otimista quando a escrita falha", async () => {
        mocks.addFavorite.mockRejectedValue(
            new ApiError({
                status: 503,
                message: "Serviço temporariamente indisponível.",
            }),
        );
        const user = userEvent.setup();
        renderActions();

        const button = await screen.findByRole("button", {
            name: "Adicionar aos favoritos",
        });
        await user.click(button);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Serviço temporariamente indisponível.",
        );
        expect(
            screen.getByRole("button", { name: "Adicionar aos favoritos" }),
        ).toBeEnabled();
    });

    it("cancela leituras pendentes quando o componente desmonta", () => {
        mocks.listFavorites.mockReturnValue(new Promise(() => {}));
        mocks.listWatchlist.mockReturnValue(new Promise(() => {}));
        const view = renderActions();
        const signal = mocks.listFavorites.mock.calls[0][1].signal;

        view.unmount();

        expect(signal.aborted).toBe(true);
    });

    it("mantém apenas uma escrita por ação enquanto o pedido está pendente", async () => {
        mocks.addWatchlist.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderActions();

        const button = await screen.findByRole("button", {
            name: "Adicionar à lista para ver mais tarde",
        });
        await user.click(button);

        await waitFor(() => expect(button).toBeDisabled());
        expect(mocks.addWatchlist).toHaveBeenCalledOnce();
    });
});
