/**
 * @file Testes da hierarquia semântica configurável do estado vazio.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState.jsx";

describe("EmptyState", () => {
    it("usa h2 por defeito em estados embebidos numa página", () => {
        render(
            <EmptyState
                title="Sem resultados"
                description="Não existem dados para apresentar."
            />,
        );

        expect(
            screen.getByRole("heading", { level: 2, name: "Sem resultados" }),
        ).toBeInTheDocument();
    });

    it("permite h1 quando o estado substitui a página inteira", () => {
        render(
            <EmptyState
                title="Página não encontrada"
                description="Confirma o endereço."
                headingLevel={1}
            />,
        );

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Página não encontrada",
            }),
        ).toBeInTheDocument();
    });
});
