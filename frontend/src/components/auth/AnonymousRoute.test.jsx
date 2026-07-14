/**
 * @file Testes da guarda dos fluxos públicos de autenticação.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnonymousRoute } from "./AnonymousRoute.jsx";

const session = vi.hoisted(() => ({
    status: "anonymous",
    error: "",
    refreshSession: vi.fn(),
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => session,
}));

/** @returns {JSX.Element} Router mínimo da guarda. */
function TestApp() {
    return (
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route path="/" element={<p>Início</p>} />
                <Route
                    path="/login"
                    element={(
                        <AnonymousRoute>
                            <p>Autenticação</p>
                        </AnonymousRoute>
                    )}
                />
            </Routes>
        </MemoryRouter>
    );
}

describe("AnonymousRoute", () => {
    beforeEach(() => {
        session.status = "anonymous";
        session.error = "";
        session.refreshSession.mockReset();
    });

    it("mostra autenticação apenas a uma sessão anónima confirmada", () => {
        render(<TestApp />);
        expect(screen.getByText("Autenticação")).toBeInTheDocument();
    });

    it("redireciona uma sessão autenticada para o início", () => {
        session.status = "authenticated";
        render(<TestApp />);
        expect(screen.getByText("Início")).toBeInTheDocument();
    });

    it("não trata indisponibilidade como logout", () => {
        session.status = "unavailable";
        session.error = "API indisponível";
        render(<TestApp />);
        expect(screen.getByRole("alert")).toHaveTextContent("API indisponível");
        expect(screen.queryByText("Autenticação")).not.toBeInTheDocument();
    });
});
