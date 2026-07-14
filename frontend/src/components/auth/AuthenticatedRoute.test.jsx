/**
 * @file Regressão fail-closed da guarda de rotas autenticadas.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedRoute } from "./AuthenticatedRoute.jsx";

const mocks = vi.hoisted(() => ({
    refreshSession: vi.fn(),
    session: null,
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => mocks.session,
}));

describe("AuthenticatedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.refreshSession.mockRejectedValue(new Error("indisponível"));
        mocks.session = {
            status: "unavailable",
            error: "Não foi possível confirmar a sessão.",
            refreshSession: mocks.refreshSession,
        };
    });

    it("não revela conteúdo privado quando o bootstrap está indisponível", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/conta"]}>
                <AuthenticatedRoute>
                    <p>Conteúdo privado</p>
                </AuthenticatedRoute>
            </MemoryRouter>,
        );

        expect(screen.queryByText("Conteúdo privado")).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível confirmar a sessão.",
        );

        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );
        expect(mocks.refreshSession).toHaveBeenCalledOnce();
    });
});
