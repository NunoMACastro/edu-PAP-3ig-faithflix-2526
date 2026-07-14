/**
 * @file Testes das páginas partilhadas e do fallback público.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import { NotFoundPage } from "./pages.jsx";

it("apresenta a página 404 com um título principal e regresso ao início", () => {
    render(
        <MemoryRouter>
            <NotFoundPage />
        </MemoryRouter>,
    );

    expect(
        screen.getByRole("heading", {
            level: 1,
            name: "Página não encontrada",
        }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao início" }))
        .toHaveAttribute("href", "/");
});
