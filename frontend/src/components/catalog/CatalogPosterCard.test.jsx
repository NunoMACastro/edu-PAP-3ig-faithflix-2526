/**
 * @file Contratos do card cinematográfico da grelha de catálogo.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CatalogPosterCard } from "./CatalogPosterCard.jsx";

/**
 * Renderiza o card dentro do router usado pela aplicação.
 *
 * @param {Partial<React.ComponentProps<typeof CatalogPosterCard>>} props Propriedades a substituir.
 * @returns {ReturnType<typeof render>} Resultado do render.
 */
function renderCard(props = {}) {
    return render(
        <MemoryRouter>
            <CatalogPosterCard
                title="A Parábola"
                eyebrow="Filme"
                imageUrl="/poster.webp"
                imageAlt="Cartaz de A Parábola"
                meta="90 min · 12+"
                to="/catalogo/a-parabola"
                {...props}
            />
        </MemoryRouter>,
    );
}

describe("CatalogPosterCard", () => {
    it("torna o card integralmente clicável e adia o cartaz", () => {
        renderCard();

        expect(
            screen.getByRole("link", { name: "Ver detalhe: A Parábola" }),
        ).toHaveAttribute("href", "/catalogo/a-parabola");
        expect(
            screen.getByRole("img", { name: "Cartaz de A Parábola" }),
        ).toHaveAttribute("loading", "lazy");
        expect(
            screen.getByRole("img", { name: "Cartaz de A Parábola" }),
        ).toHaveAttribute("decoding", "async");
    });

    it("mantém título e ação quando não existe cartaz", () => {
        renderCard({ imageUrl: "" });

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(screen.getAllByText("A Parábola").length).toBeGreaterThan(0);
        expect(
            screen.getByRole("link", { name: "Ver detalhe: A Parábola" }),
        ).toBeInTheDocument();
    });

    it("apresenta uma descrição opcional sem alterar o link integral", () => {
        renderCard({ description: "Uma descrição curta para a pesquisa." });

        expect(
            screen.getByText("Uma descrição curta para a pesquisa."),
        ).toHaveClass("catalog-poster-description");
        expect(
            screen.getByRole("link", { name: "Ver detalhe: A Parábola" }),
        ).toBeInTheDocument();
    });
});
