/**
 * @file Testes da composição editorial da página pública de identidade.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage.jsx";

vi.mock("../components/auth/AuthForms.jsx", () => ({
    AuthForms: ({ redirectTo }) => (
        <div data-testid="auth-form" data-redirect-to={redirectTo ?? ""} />
    ),
}));

/**
 * Renderiza a página com uma entrada de router específica.
 *
 * @param {string | { pathname: string, search?: string, state?: object }} entry Entrada inicial.
 * @returns {import("@testing-library/react").RenderResult} Resultado do render.
 */
function renderLoginPage(entry) {
    return render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("LoginPage", () => {
    it("apresenta a identidade editorial e preserva um next interno seguro", () => {
        renderLoginPage("/login?next=%2Fplanos%3Finterval%3Dyearly");

        expect(
            screen.getByRole("heading", { name: "A tua próxima história começa aqui." }),
        ).toBeVisible();
        expect(screen.getByRole("link", { name: /Explorar o catálogo/u })).toHaveAttribute(
            "href",
            "/catalogo",
        );
        expect(screen.getByTestId("auth-form")).toHaveAttribute(
            "data-redirect-to",
            "/planos?interval=yearly",
        );
    });

    it("descarta destinos externos e anuncia uma conta eliminada", () => {
        renderLoginPage({
            pathname: "/login",
            search: "?next=https%3A%2F%2Fexample.test",
            state: { accountDeleted: true },
        });

        expect(screen.getByTestId("auth-form")).toHaveAttribute("data-redirect-to", "");
        expect(screen.getByRole("status")).toHaveTextContent(
            "Conta eliminada e sessão terminada.",
        );
    });
});
