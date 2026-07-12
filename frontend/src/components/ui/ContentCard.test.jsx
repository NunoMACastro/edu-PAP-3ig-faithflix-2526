/**
 * @file Contratos acessíveis do card reutilizável de conteúdo.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ContentCard } from "./ContentCard.jsx";

describe("ContentCard", () => {
    it("distingue a ação pelo título e adia imagens de grelha", () => {
        render(
            <MemoryRouter>
                <ContentCard
                    title="A Parábola"
                    imageUrl="/imagem-local.jpg"
                    imageAlt="Capa de A Parábola"
                    to="/conteudos/a-parabola"
                />
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("link", { name: "Ver detalhe: A Parábola" }),
        ).toHaveAttribute("href", "/conteudos/a-parabola");
        expect(screen.getByRole("img", { name: "Capa de A Parábola" })).toHaveAttribute(
            "loading",
            "lazy",
        );
    });
});
