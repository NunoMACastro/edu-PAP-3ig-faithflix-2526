/**
 * @file Teste da ação de logout visível no cabeçalho autenticado.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "./AppHeader.jsx";

const mocks = vi.hoisted(() => ({
    logout: vi.fn(),
    session: null,
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => mocks.session,
}));

/** @returns {JSX.Element} Path atual observável pelo teste. */
function LocationProbe() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname}</output>;
}

describe("AppHeader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.logout.mockResolvedValue(undefined);
        mocks.session = {
            status: "authenticated",
            hasRole: () => false,
            logout: mocks.logout,
        };
    });

    it("apresenta Sair e redireciona apenas depois do logout", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/conta"]}>
                <AppHeader />
                <LocationProbe />
            </MemoryRouter>,
        );

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(mocks.logout).toHaveBeenCalledOnce();
        expect(await screen.findByTestId("location")).toHaveTextContent(
            "/",
        );
    });

    it("expõe o estado do menu móvel e fecha-o com Escape devolvendo o foco", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/conta"]}>
                <AppHeader />
            </MemoryRouter>,
        );

        const menuButton = screen.getByRole("button", {
            name: "Abrir menu principal",
        });

        expect(menuButton).toHaveAttribute("aria-controls", "navegacao-principal");
        expect(menuButton).toHaveAttribute("aria-expanded", "false");

        await user.click(menuButton);

        expect(menuButton).toHaveAttribute("aria-expanded", "true");
        expect(menuButton).toHaveAccessibleName("Fechar menu principal");

        await user.keyboard("{Escape}");

        expect(menuButton).toHaveAttribute("aria-expanded", "false");
        expect(menuButton).toHaveFocus();
    });

    it("fecha o menu depois de navegar para outra rota", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/"]}>
                <AppHeader />
                <LocationProbe />
            </MemoryRouter>,
        );

        const menuButton = screen.getByRole("button", {
            name: "Abrir menu principal",
        });
        await user.click(menuButton);
        await user.click(screen.getByRole("link", { name: "Catálogo" }));

        expect(await screen.findByTestId("location")).toHaveTextContent("/catalogo");
        expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });

    it("troca Planos por Para si para clientes autenticados sem duplicar o link", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/"]}>
                <AppHeader />
            </MemoryRouter>,
        );

        const forYouLinks = screen.getAllByRole("link", { name: "Para si" });
        expect(forYouLinks).toHaveLength(1);
        expect(forYouLinks[0]).toHaveAttribute("href", "/para-si");
        expect(forYouLinks[0]).toHaveClass("nav-link-featured");
        expect(
            within(screen.getByRole("navigation", { name: "Navegação principal" }))
                .getAllByRole("link")[0],
        ).toBe(forYouLinks[0]);
        expect(screen.queryByRole("link", { name: "Planos" })).not.toBeInTheDocument();

        const accountSummary = screen.getByText("A minha conta");
        await user.click(accountSummary);
        expect(screen.getByRole("link", { name: "Biblioteca" })).toBeVisible();
        expect(screen.getAllByRole("link", { name: "Para si" })).toHaveLength(1);
    });

    it("mantém Planos para sessões anónimas", () => {
        mocks.session = {
            status: "anonymous",
            hasRole: () => false,
            logout: mocks.logout,
        };

        render(<MemoryRouter><AppHeader /></MemoryRouter>);

        expect(screen.getByRole("link", { name: "Planos" })).toHaveAttribute("href", "/planos");
        expect(screen.queryByRole("link", { name: "Para si" })).not.toBeInTheDocument();
    });

    it("fecha o menu da conta com Escape e restitui o foco", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><AppHeader /></MemoryRouter>);
        const accountSummary = screen.getByText("A minha conta");
        const accountMenu = accountSummary.closest("details");

        await user.click(accountSummary);
        expect(accountMenu).toHaveAttribute("open");
        await user.keyboard("{Escape}");

        expect(accountMenu).not.toHaveAttribute("open");
        expect(accountSummary).toHaveFocus();
    });

    it("mostra a staff apenas o regresso ao backoffice, sem links de consumidor", () => {
        mocks.session = {
            status: "authenticated",
            user: { role: "admin" },
            hasRole: () => true,
            logout: mocks.logout,
        };
        render(<MemoryRouter><AppHeader /></MemoryRouter>);
        expect(screen.getByRole("link", { name: "Voltar à administração" })).toHaveAttribute("href", "/admin");
        expect(screen.queryByRole("link", { name: "Para si" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Conta" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Gerir catálogo" })).not.toBeInTheDocument();
    });
});
