/**
 * @file Teste comportamental do carregamento lazy das páginas do router.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { AppRoutes } from "./AppRoutes.jsx";

const mocks = vi.hoisted(() => {
    let releasePage;
    const pageGate = new Promise((resolve) => {
        releasePage = resolve;
    });

    return {
        pageGate,
        releasePage,
        session: {
            status: "anonymous",
            hasRole: () => false,
            logout: vi.fn(),
        },
    };
});

vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => mocks.session,
}));

vi.mock("../pages/pages.jsx", async () => {
    await mocks.pageGate;

    return {
        NotFoundPage: () => <h1>Página lazy carregada</h1>,
    };
});

beforeEach(() => {
    window.scrollTo = vi.fn();
});

it("apresenta Suspense acessível até o chunk da rota ficar disponível", async () => {
    render(
        <MemoryRouter initialEntries={["/rota-inexistente"]}>
            <AppRoutes />
        </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
        "A carregar página...",
    );
    expect(document.title).toBe("Página não encontrada | FaithFlix");

    mocks.releasePage();

    expect(await screen.findByText("Página lazy carregada")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
