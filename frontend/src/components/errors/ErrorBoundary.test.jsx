/**
 * @file Testes comportamentais do fallback seguro de renderização.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary.jsx";

describe("ErrorBoundary", () => {
    let consoleError;

    /**
     * Impede o JSDOM de imprimir as exceções deliberadas deste teste.
     *
     * @param {ErrorEvent} event Evento global do erro esperado.
     * @returns {void}
     */
    function preventExpectedErrorOutput(event) {
        event.preventDefault();
    }

    beforeEach(() => {
        // O React escreve a exceção capturada em stderr mesmo quando existe boundary.
        consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        window.addEventListener("error", preventExpectedErrorOutput);
    });

    afterEach(() => {
        window.removeEventListener("error", preventExpectedErrorOutput);
        consoleError.mockRestore();
    });

    it("oculta detalhes internos e recupera por ação explícita", async () => {
        const user = userEvent.setup();
        let shouldFail = true;

        /** @returns {JSX.Element} Filho controlado para simular uma falha transitória. */
        function FlakyPage() {
            if (shouldFail) {
                throw new Error("token-interno-que-nao-pode-aparecer");
            }

            return <p>Página recuperada</p>;
        }

        render(
            <ErrorBoundary
                onRetry={() => {
                    shouldFail = false;
                }}
            >
                <FlakyPage />
            </ErrorBoundary>,
        );

        const fallback = screen.getByRole("alert");
        expect(fallback).toHaveTextContent(
            "Não foi possível apresentar esta página",
        );
        expect(fallback).not.toHaveTextContent(
            "token-interno-que-nao-pode-aparecer",
        );

        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(screen.getByText("Página recuperada")).toBeInTheDocument();
    });

    it("mantém o fallback quando a própria recuperação falha", async () => {
        const user = userEvent.setup();

        /** @returns {never} Falha permanente usada pelo teste. */
        function BrokenPage() {
            throw new Error("falha permanente");
        }

        render(
            <ErrorBoundary
                onRetry={() => {
                    throw new Error("falha no retry");
                }}
            >
                <BrokenPage />
            </ErrorBoundary>,
        );

        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível apresentar esta página",
        );
    });
});
