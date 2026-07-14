/**
 * @file Testes comportamentais da lista e fila serial de comentários.
 */

import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommentsPanel } from "./CommentsPanel.jsx";

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
    sessionStatus: "authenticated",
}));

vi.mock("../../services/api/commentsApi.js", () => ({
    commentsApi: {
        list: mocks.list,
        create: mocks.create,
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
 * Cria um comentário visível previsível.
 *
 * @param {string} id Identificador.
 * @param {string} body Texto visível.
 * @returns {Record<string, unknown>} Comentário da API.
 */
function comment(id, body) {
    return {
        id,
        body,
        canDelete: true,
        createdAt: "2026-07-10T10:00:00.000Z",
    };
}

/**
 * Renderiza o painel no router exigido pelos links de autenticação.
 *
 * @param {string} contentId Conteúdo alvo.
 * @returns {import("@testing-library/react").RenderResult} Resultado do render.
 */
function renderComments(contentId) {
    return render(
        <MemoryRouter>
            <CommentsPanel contentId={contentId} />
        </MemoryRouter>,
    );
}

describe("CommentsPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.list.mockResolvedValue({ items: [] });
    });

    it("cancela o conteúdo anterior e nunca aplica a resposta stale", async () => {
        const oldList = deferred();
        mocks.list
            .mockReturnValueOnce(oldList.promise)
            .mockResolvedValueOnce({ items: [comment("new", "Comentário novo")] });
        const view = renderComments("content-old");
        await waitFor(() => expect(mocks.list).toHaveBeenCalledOnce());
        const oldSignal = mocks.list.mock.calls[0][1].signal;

        view.rerender(
            <MemoryRouter>
                <CommentsPanel contentId="content-new" />
            </MemoryRouter>,
        );

        expect(await screen.findByText("Comentário novo")).toBeInTheDocument();
        expect(oldSignal.aborted).toBe(true);
        await act(async () => {
            oldList.resolve({ items: [comment("old", "Comentário antigo")] });
            await Promise.resolve();
        });
        expect(screen.queryByText("Comentário antigo")).not.toBeInTheDocument();

        const currentSignal = mocks.list.mock.calls[1][1].signal;
        view.unmount();
        expect(currentSignal.aborted).toBe(true);
    });

    it("cancela e substitui a lista quando a sessão muda", async () => {
        const authenticatedList = deferred();
        mocks.list
            .mockReturnValueOnce(authenticatedList.promise)
            .mockResolvedValueOnce({ items: [comment("public", "Lista anónima")] });
        const view = renderComments("content-1");
        await waitFor(() => expect(mocks.list).toHaveBeenCalledOnce());
        const authenticatedSignal = mocks.list.mock.calls[0][1].signal;

        mocks.sessionStatus = "anonymous";
        view.rerender(
            <MemoryRouter>
                <CommentsPanel contentId="content-1" />
            </MemoryRouter>,
        );

        expect(await screen.findByText("Lista anónima")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Entrar para comentar" }))
            .toBeInTheDocument();
        expect(authenticatedSignal.aborted).toBe(true);
    });

    it("serializa remoções e mantém busy state por linha", async () => {
        const first = comment("comment-1", "Primeiro comentário");
        const second = comment("comment-2", "Segundo comentário");
        const firstRemoval = deferred();
        mocks.list
            .mockResolvedValueOnce({ items: [first, second] })
            .mockResolvedValueOnce({ items: [second] })
            .mockResolvedValueOnce({ items: [] });
        mocks.remove
            .mockReturnValueOnce(firstRemoval.promise)
            .mockResolvedValueOnce({ comment: { id: second.id } });
        const user = userEvent.setup();
        renderComments("content-1");

        const firstArticle = (await screen.findByText(first.body)).closest("article");
        const secondArticle = screen.getByText(second.body).closest("article");
        await user.click(within(firstArticle).getByRole("button", { name: "Remover" }));
        await user.click(within(secondArticle).getByRole("button", { name: "Remover" }));

        expect(within(firstArticle).getByRole("button", { name: "A remover..." }))
            .toBeDisabled();
        expect(within(secondArticle).getByRole("button", { name: "A remover..." }))
            .toBeDisabled();
        expect(mocks.remove).toHaveBeenCalledOnce();

        await act(async () => {
            firstRemoval.resolve({ comment: { id: first.id } });
            await Promise.resolve();
        });
        await waitFor(() => expect(mocks.remove).toHaveBeenCalledTimes(2));
        expect(mocks.remove.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
        expect(mocks.remove.mock.calls[1][1].signal).toBeInstanceOf(AbortSignal);
        expect(
            await screen.findByText("Ainda não existem comentários visíveis."),
        ).toBeInTheDocument();
    });

    it("cancela a mutação pendente quando a sessão muda", async () => {
        const visible = comment("comment-1", "Comentário autenticado");
        const removal = deferred();
        mocks.list
            .mockResolvedValueOnce({ items: [visible] })
            .mockResolvedValueOnce({
                items: [{ ...visible, body: "Comentário público", canDelete: false }],
            });
        mocks.remove.mockReturnValueOnce(removal.promise);
        const user = userEvent.setup();
        const view = renderComments("content-1");
        const article = (await screen.findByText(visible.body)).closest("article");

        await user.click(within(article).getByRole("button", { name: "Remover" }));
        const mutationSignal = mocks.remove.mock.calls[0][1].signal;
        mocks.sessionStatus = "anonymous";
        view.rerender(
            <MemoryRouter>
                <CommentsPanel contentId="content-1" />
            </MemoryRouter>,
        );

        expect(await screen.findByText("Comentário público")).toBeInTheDocument();
        expect(mutationSignal.aborted).toBe(true);
        await act(async () => {
            removal.resolve({ comment: { id: visible.id } });
            await Promise.resolve();
        });
        expect(screen.queryByText("Comentário removido."))
            .not.toBeInTheDocument();
    });

    it("nunca apresenta detalhes de uma falha inesperada", async () => {
        const visible = comment("comment-1", "Comentário removível");
        mocks.list.mockResolvedValueOnce({ items: [visible] });
        mocks.remove.mockRejectedValueOnce(
            new Error("mongodb://user:password@internal.example"),
        );
        const user = userEvent.setup();
        renderComments("content-1");

        const article = (await screen.findByText(visible.body)).closest("article");
        await user.click(within(article).getByRole("button", { name: "Remover" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ocorreu um erro inesperado. Tenta novamente.",
        );
        expect(screen.getByRole("alert")).not.toHaveTextContent("mongodb");
        expect(
            within(article).getByRole("button", { name: "Remover" }),
        ).toBeEnabled();
    });
});
