/**
 * @file Testes comportamentais do carregamento e mutações race-safe de ratings.
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RatingBox } from "./RatingBox.jsx";

const mocks = vi.hoisted(() => ({
    getSummary: vi.fn(),
    getMine: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    sessionStatus: "authenticated",
}));

vi.mock("../../services/api/ratingsApi.js", () => ({
    ratingsApi: {
        getSummary: mocks.getSummary,
        getMine: mocks.getMine,
        save: mocks.save,
        remove: mocks.remove,
    },
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => ({ status: mocks.sessionStatus }),
}));

/**
 * Cria uma promessa controlada pelo teste.
 *
 * @returns {{ promise: Promise<unknown>, resolve: (value: unknown) => void }} Deferred simples.
 */
function deferred() {
    let resolve;
    const promise = new Promise((promiseResolve) => {
        resolve = promiseResolve;
    });
    return { promise, resolve };
}

/**
 * Cria um resumo autoritativo com valores previsíveis.
 *
 * @param {number} average Média apresentada.
 * @param {number} total Total apresentado.
 * @returns {{ summary: { average: number, total: number } }} Resposta API.
 */
function summary(average, total) {
    return { summary: { average, total } };
}

/**
 * Renderiza o controlo no router exigido pelos links de autenticação.
 *
 * @param {string} contentId Conteúdo alvo.
 * @returns {import("@testing-library/react").RenderResult} Resultado do render.
 */
function renderRating(contentId) {
    return render(
        <MemoryRouter>
            <RatingBox contentId={contentId} />
        </MemoryRouter>,
    );
}

describe("RatingBox", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.getSummary.mockResolvedValue(summary(4, 2));
        mocks.getMine.mockResolvedValue({ rating: { value: null } });
    });

    it("cancela o conteúdo anterior e nunca aplica a resposta stale", async () => {
        const oldSummary = deferred();
        const oldMine = deferred();
        mocks.getSummary
            .mockReturnValueOnce(oldSummary.promise)
            .mockResolvedValueOnce(summary(5, 8));
        mocks.getMine
            .mockReturnValueOnce(oldMine.promise)
            .mockResolvedValueOnce({ rating: { value: 5 } });

        const view = renderRating("content-old");
        await waitFor(() => expect(mocks.getMine).toHaveBeenCalledOnce());
        const oldSummarySignal = mocks.getSummary.mock.calls[0][1].signal;
        const oldMineSignal = mocks.getMine.mock.calls[0][1].signal;

        view.rerender(
            <MemoryRouter>
                <RatingBox contentId="content-new" />
            </MemoryRouter>,
        );

        expect(await screen.findByText(/Média 5 em 5, com 8/)).toBeInTheDocument();
        expect(oldSummarySignal.aborted).toBe(true);
        expect(oldMineSignal.aborted).toBe(true);

        await act(async () => {
            oldSummary.resolve(summary(1, 99));
            oldMine.resolve({ rating: { value: 1 } });
            await Promise.resolve();
        });
        expect(screen.queryByText(/Média 1 em 5/)).not.toBeInTheDocument();

        const currentSignal = mocks.getSummary.mock.calls[1][1].signal;
        view.unmount();
        expect(currentSignal.aborted).toBe(true);
    });

    it("cancela a leitura pessoal quando a sessão muda", async () => {
        const oldMine = deferred();
        mocks.getMine.mockReturnValueOnce(oldMine.promise);
        const view = renderRating("content-1");
        await waitFor(() => expect(mocks.getMine).toHaveBeenCalledOnce());
        const oldSignal = mocks.getMine.mock.calls[0][1].signal;

        mocks.sessionStatus = "anonymous";
        view.rerender(
            <MemoryRouter>
                <RatingBox contentId="content-1" />
            </MemoryRouter>,
        );

        expect(await screen.findByText(/Média 4 em 5, com 2/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Entrar para classificar" }))
            .toBeInTheDocument();
        expect(oldSignal.aborted).toBe(true);
        expect(mocks.getMine).toHaveBeenCalledOnce();
    });

    it("impede mutações sobrepostas e faz reload autoritativo", async () => {
        const save = deferred();
        mocks.save.mockReturnValueOnce(save.promise);
        const user = userEvent.setup();
        renderRating("content-1");
        await screen.findByText(/Média 4 em 5, com 2/);

        await user.click(screen.getByRole("button", { name: "3" }));
        expect(
            screen.getByRole("button", { name: "3 - A guardar..." }),
        ).toBeDisabled();
        expect(screen.getByRole("button", { name: "4" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "4" }));
        expect(mocks.save).toHaveBeenCalledOnce();

        await act(async () => {
            save.resolve({ rating: { value: 3 } });
            await Promise.resolve();
        });

        expect(
            await screen.findByRole("status", {
                name: "",
            }),
        ).toHaveTextContent("Classificação guardada.");
        expect(mocks.getSummary).toHaveBeenCalledTimes(2);
        expect(mocks.getMine).toHaveBeenCalledTimes(2);
        expect(mocks.save).toHaveBeenCalledWith(
            "content-1",
            3,
            { signal: expect.any(AbortSignal) },
        );
    });

    it("cancela uma escrita pendente quando muda o conteúdo", async () => {
        const save = deferred();
        mocks.save.mockReturnValueOnce(save.promise);
        const user = userEvent.setup();
        const view = renderRating("content-old");
        await screen.findByText(/Média 4 em 5, com 2/);

        await user.click(screen.getByRole("button", { name: "3" }));
        const mutationSignal = mocks.save.mock.calls[0][2].signal;
        view.rerender(
            <MemoryRouter>
                <RatingBox contentId="content-new" />
            </MemoryRouter>,
        );

        expect(mutationSignal.aborted).toBe(true);
        await act(async () => {
            save.resolve({ rating: { value: 3 } });
            await Promise.resolve();
        });
        expect(screen.queryByText("Classificação guardada."))
            .not.toBeInTheDocument();
        expect(mocks.getSummary).toHaveBeenLastCalledWith(
            "content-new",
            { signal: expect.any(AbortSignal) },
        );
    });

    it("nunca apresenta detalhes de uma falha inesperada", async () => {
        mocks.save.mockRejectedValueOnce(
            new Error("mongodb://user:password@internal.example"),
        );
        const user = userEvent.setup();
        renderRating("content-1");
        await screen.findByText(/Média 4 em 5, com 2/);

        await user.click(screen.getByRole("button", { name: "2" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ocorreu um erro inesperado. Tenta novamente.",
        );
        expect(screen.getByRole("alert")).not.toHaveTextContent("mongodb");
        expect(screen.getByRole("button", { name: "2" })).toBeEnabled();
    });
});
