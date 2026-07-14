/**
 * @file Contratos de acessibilidade e localização do carrossel de descoberta.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DiscoveryCarousel } from "./DiscoveryCarousel.jsx";

describe("DiscoveryCarousel", () => {
    it("contextualiza ações repetidas e apresenta texto em PT-PT", () => {
        render(
            <MemoryRouter>
                <DiscoveryCarousel
                    title="Relacionados"
                    items={[
                        {
                            id: "content-1",
                            slug: "a-parabola/edicao",
                            title: "A Parábola",
                            type: "movie",
                            posterUrl: "/poster-local.jpg",
                            ratingAverage: 4.5,
                        },
                    ]}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText("Classificação média: 4.5")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Ver detalhe: A Parábola" }),
        ).toHaveAttribute("href", "/catalogo/a-parabola%2Fedicao");
        expect(document.querySelector("img")).toHaveAttribute("loading", "lazy");
    });
});
