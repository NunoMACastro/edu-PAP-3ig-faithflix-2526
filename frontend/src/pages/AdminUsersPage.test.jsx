/**
 * @file Testes da gestão administrativa paginada de utilizadores.
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUsersPage } from "./AdminUsersPage.jsx";

const mocks = vi.hoisted(() => ({
    listUsers: vi.fn(),
    updateUserAdmin: vi.fn(),
}));

vi.mock("../services/api/userApi.js", () => ({ userApi: mocks }));

const testUser = {
    id: "user-1",
    name: "Ana Teste",
    email: "ana@faithflix.test",
    role: "user",
    accountStatus: "active",
};

function usersResponse(overrides = {}) {
    return {
        users: [testUser],
        page: 1,
        limit: 20,
        total: 21,
        totalPages: 2,
        ...overrides,
    };
}

describe("AdminUsersPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.listUsers.mockResolvedValue(usersResponse());
        mocks.updateUserAdmin.mockResolvedValue({ user: testUser });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("carrega uma página limitada com pedido cancelável", async () => {
        render(<AdminUsersPage />);

        expect(await screen.findByText("Ana Teste")).toBeInTheDocument();
        expect(mocks.listUsers).toHaveBeenCalledWith(
            { search: "", status: "", page: 1, limit: 20 },
            { signal: expect.any(AbortSignal) },
        );
        expect(screen.getByRole("button", { name: "Gerir" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Eliminada" }))
            .toBeInTheDocument();
    });

    it("mostra contas eliminadas como linhas apenas de leitura", async () => {
        mocks.listUsers.mockResolvedValue(
            usersResponse({
                users: [
                    {
                        ...testUser,
                        id: "deleted-user",
                        name: "Conta Eliminada",
                        accountStatus: "deleted",
                    },
                ],
                total: 1,
                totalPages: 1,
            }),
        );

        render(<AdminUsersPage />);

        expect(await screen.findByText("Conta Eliminada")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Só leitura" })).toBeDisabled();
        expect(mocks.updateUserAdmin).not.toHaveBeenCalled();
    });

    it("confirma a mutação e bloqueia apenas a linha enquanto aguarda", async () => {
        mocks.updateUserAdmin.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        render(<AdminUsersPage />);
        await screen.findByText("Ana Teste");
        await user.click(screen.getByRole("button", { name: "Gerir" }));
        const dialog = screen.getByRole("dialog");
        const roleSelect = within(dialog).getByLabelText("Papel");
        await user.selectOptions(roleSelect, "moderator");
        await user.click(within(dialog).getByRole("button", { name: "Guardar alterações" }));
        expect(mocks.updateUserAdmin).toHaveBeenCalledWith(
            "user-1",
            { role: "moderator" },
            { signal: expect.any(AbortSignal) },
        );
        expect(roleSelect).toBeDisabled();
        expect(within(dialog).getByLabelText("Estado")).toBeDisabled();
    });

    it("não altera a conta quando a confirmação é recusada", async () => {
        const user = userEvent.setup();
        render(<AdminUsersPage />);
        await screen.findByText("Ana Teste");
        await user.click(screen.getByRole("button", { name: "Gerir" }));
        const dialog = screen.getByRole("dialog");
        await user.selectOptions(within(dialog).getByLabelText("Estado"), "blocked");
        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
        expect(mocks.updateUserAdmin).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("navega para a página seguinte e cancela a leitura anterior", async () => {
        const user = userEvent.setup();
        render(<AdminUsersPage />);
        await screen.findByText("Ana Teste");
        const firstSignal = mocks.listUsers.mock.calls[0][1].signal;
        mocks.listUsers.mockResolvedValueOnce(
            usersResponse({ users: [], page: 2 }),
        );

        await user.click(screen.getByRole("button", { name: "Seguinte" }));

        await waitFor(() => {
            expect(mocks.listUsers).toHaveBeenLastCalledWith(
                { search: "", status: "", page: 2, limit: 20 },
                { signal: expect.any(AbortSignal) },
            );
        });
        expect(firstSignal.aborted).toBe(true);
    });
});
