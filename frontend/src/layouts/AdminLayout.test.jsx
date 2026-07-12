/**
 * @file Contratos de navegação e drawer do shell administrativo.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLayout } from "./AdminLayout.jsx";

const session = vi.hoisted(() => ({
    user: { name: "Admin Teste", role: "admin" },
    logout: vi.fn(),
}));

vi.mock("../context/SessionContext.jsx", () => ({ useSession: () => session }));

function renderLayout() {
    return render(
        <MemoryRouter initialEntries={["/admin"]}>
            <Routes>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<h1>Dashboard teste</h1>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

describe("AdminLayout", () => {
    beforeEach(() => {
        session.user = { name: "Admin Teste", role: "admin" };
        session.logout.mockResolvedValue(undefined);
    });

    it("fecha o drawer por cancel e restitui o foco ao botão de menu", async () => {
        const user = userEvent.setup();
        renderLayout();
        const openButton = screen.getByRole("button", { name: "Abrir navegação administrativa" });
        await user.click(openButton);
        const dialog = screen.getByRole("dialog", { name: "Navegação administrativa" });
        expect(dialog).toHaveAttribute("open");
        fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
        await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
        expect(openButton).toHaveFocus();
    });

    it("limita um moderador ao grupo de conteúdo", () => {
        session.user = { name: "Moderador Teste", role: "moderator" };
        renderLayout();
        expect(screen.getAllByRole("link", { name: "Catálogo" }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("link", { name: "Passagens bíblicas" }).length).toBeGreaterThan(0);
        expect(screen.queryByRole("link", { name: "Contas e permissões" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Métricas" })).not.toBeInTheDocument();
    });
});
