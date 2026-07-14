/**
 * @file Contrato do shell claro e do modo imersivo da rota de reprodução.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout.jsx";

vi.mock("../components/layout/AppHeader.jsx", () => ({
    AppHeader: () => <header data-testid="global-header">Cabeçalho</header>,
}));
vi.mock("../components/layout/AppFooter.jsx", () => ({
    AppFooter: () => <footer data-testid="global-footer">Rodapé</footer>,
}));

/**
 * Monta o layout numa localização explícita.
 *
 * @param {string} pathname Localização inicial.
 * @returns {ReturnType<typeof render>} Render observável.
 */
function renderLayout(pathname) {
    return render(
        <MemoryRouter initialEntries={[pathname]}>
            <AppLayout>
                <p>Conteúdo da rota</p>
            </AppLayout>
        </MemoryRouter>,
    );
}

describe("AppLayout", () => {
    it("remove header e footer apenas na reprodução e preserva o skip link", () => {
        const view = renderLayout("/ver/content-1");

        expect(screen.queryByTestId("global-header")).not.toBeInTheDocument();
        expect(screen.queryByTestId("global-footer")).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: /saltar/iu })).toBeInTheDocument();
        expect(document.querySelector(".app-shell-playback")).not.toBeNull();

        view.unmount();
        renderLayout("/catalogo/filme-de-teste");
        expect(screen.getByTestId("global-header")).toBeInTheDocument();
        expect(screen.getByTestId("global-footer")).toBeInTheDocument();
        expect(document.querySelector(".app-shell-playback")).toBeNull();
    });
});
