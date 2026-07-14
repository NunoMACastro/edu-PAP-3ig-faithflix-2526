/**
 * @file Testes dos efeitos de título, scroll e foco em navegação SPA.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouteLifecycle } from "./RouteLifecycle.jsx";
import { resolveRouteTitle } from "./routeMetadata.js";

describe("RouteLifecycle", () => {
    const initialTitle = document.title;

    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        document.title = initialTitle;
        vi.restoreAllMocks();
    });

    it("atualiza título e devolve scroll e foco ao main quando muda o pathname", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/"]}>
                <RouteLifecycle />
                <main id="conteudo-principal" tabIndex={-1}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Link to="/catalogo/conteudo-1">
                                    Abrir detalhe
                                </Link>
                            }
                        />
                        <Route
                            path="/catalogo/:idOrSlug"
                            element={<h1>Detalhe carregado</h1>}
                        />
                    </Routes>
                </main>
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(document.title).toBe("Início | FaithFlix");
            expect(screen.getByRole("main")).toHaveFocus();
        });
        expect(window.scrollTo).toHaveBeenLastCalledWith({
            top: 0,
            left: 0,
            behavior: "auto",
        });

        window.scrollTo.mockClear();
        await user.click(screen.getByRole("link", { name: "Abrir detalhe" }));

        expect(await screen.findByText("Detalhe carregado")).toBeInTheDocument();
        await waitFor(() => {
            expect(document.title).toBe("Detalhe do conteúdo | FaithFlix");
            expect(screen.getByRole("main")).toHaveFocus();
        });
        expect(window.scrollTo).toHaveBeenCalledOnce();
    });

    it("usa um título fechado para paths desconhecidos", () => {
        expect(resolveRouteTitle("/path-nao-registado")).toBe(
            "Página não encontrada | FaithFlix",
        );
    });
});
