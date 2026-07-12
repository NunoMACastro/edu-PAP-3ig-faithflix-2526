/**
 * @file Testes comportamentais do conteúdo relacionado race-safe.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../services/api/apiErrors.js";
import { RelatedContent } from "./RelatedContent.jsx";

const mocks = vi.hoisted(() => ({
    related: vi.fn(),
}));

vi.mock("../../services/api/discoveryApi.js", () => ({
    discoveryApi: mocks,
}));

/**
 * Renderiza conteúdo relacionado dentro do router usado pelos links.
 *
 * @param {string} contentId Conteúdo base.
 * @returns {import("@testing-library/react").RenderResult} Resultado RTL.
 */
function renderRelated(contentId) {
    return render(
        <MemoryRouter>
            <RelatedContent contentId={contentId} />
        </MemoryRouter>,
    );
}

/**
 * Cria um item público mínimo.
 *
 * @param {string} id Identificador do item.
 * @param {string} title Título visível.
 * @returns {Record<string, unknown>} Item de discovery.
 */
function item(id, title) {
    return {
        id,
        slug: id,
        title,
        type: "movie",
        posterUrl: `/${id}.jpg`,
        durationSeconds: 5400,
        ageRating: 12,
        ratingAverage: 4.67,
    };
}

describe("RelatedContent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("aborta o pedido anterior e ignora a resposta stale ao mudar de conteúdo", async () => {
        let resolveOld;
        mocks.related
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveOld = resolve;
                }),
            )
            .mockResolvedValueOnce({ items: [item("novo", "Conteúdo novo")] });

        const view = renderRelated("content-old");
        const firstSignal = mocks.related.mock.calls[0][1].signal;

        view.rerender(
            <MemoryRouter>
                <RelatedContent contentId="content-new" />
            </MemoryRouter>,
        );

        expect(await screen.findByText("Conteúdo novo")).toBeInTheDocument();
        expect(firstSignal.aborted).toBe(true);
        resolveOld({ items: [item("antigo", "Conteúdo antigo")] });

        await waitFor(() => {
            expect(screen.queryByText("Conteúdo antigo")).not.toBeInTheDocument();
        });
        expect(document.querySelector('img[src="/novo.jpg"]')).toHaveAttribute(
            "loading",
            "lazy",
        );
        expect(document.querySelector('img[src="/novo.jpg"]')).toHaveAttribute(
            "decoding",
            "async",
        );
        expect(
            screen.getByRole("link", { name: "Ver detalhe: Conteúdo novo" }),
        ).toHaveAttribute("href", "/catalogo/novo");
    });

    it("apresenta erro seguro e repete a leitura a pedido", async () => {
        mocks.related
            .mockRejectedValueOnce(
                new ApiError({
                    status: 503,
                    message: "Relacionados temporariamente indisponíveis.",
                }),
            )
            .mockResolvedValueOnce({ items: [item("retry", "Resultado repetido")] });
        const user = userEvent.setup();

        renderRelated("content-1");

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Relacionados temporariamente indisponíveis.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(await screen.findByText("Resultado repetido")).toBeInTheDocument();
        expect(mocks.related).toHaveBeenCalledTimes(2);
        expect(mocks.related).toHaveBeenLastCalledWith(
            "content-1",
            { signal: expect.any(AbortSignal) },
        );
    });

    it("mantém link integral e fallback visual quando não existe imagem", async () => {
        mocks.related.mockResolvedValue({
            items: [{ ...item("sem-imagem", "Título sem imagem"), posterUrl: "" }],
        });

        renderRelated("content-1");

        const link = await screen.findByRole("link", {
            name: "Ver detalhe: Título sem imagem",
        });
        expect(link).toHaveAttribute("href", "/catalogo/sem-imagem");
        expect(link).toHaveTextContent("Título sem imagem");
        expect(link).toHaveTextContent("90 min");
        expect(link.querySelector("img")).toBeNull();
    });
});
