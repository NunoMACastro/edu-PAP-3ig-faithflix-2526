/**
 * @file Testes comportamentais da caixa de email local.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoMailboxPage } from "./DemoMailboxPage.jsx";

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    sessionStatus: "anonymous",
}));

vi.mock("../services/api/demoMailboxApi.js", () => ({
    demoMailboxApi: mocks,
}));
vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => ({ status: mocks.sessionStatus }),
}));

describe("DemoMailboxPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "anonymous";
        mocks.list.mockResolvedValue({
            messages: [
                {
                    id: "reset:1",
                    kind: "password_reset",
                    subject: "Recuperação de password",
                    message: "Utiliza o código.",
                    resetToken: "token-demo",
                    createdAt: "2026-07-11T10:00:00.000Z",
                },
            ],
        });
    });

    it("consulta por email e mostra o token apenas devolvido pela API demo", async () => {
        const user = userEvent.setup();
        render(<DemoMailboxPage />);

        expect(screen.getByRole("heading", { name: "Caixa de email" })).toBeVisible();
        expect(screen.queryByText(/simulad|demonstração|PAP/iu)).not.toBeInTheDocument();
        await user.type(
            screen.getByRole("textbox", { name: "Email da conta" }),
            "aluno@example.test",
        );
        await user.click(screen.getByRole("button", { name: "Consultar caixa" }));

        expect(mocks.list).toHaveBeenCalledWith(
            "aluno@example.test",
            expect.objectContaining({ signal: expect.any(AbortSignal) }),
        );
        expect(await screen.findByText("token-demo")).toBeInTheDocument();
    });

    it("mantém CSRF quando a caixa é consultada com sessão autenticada", async () => {
        mocks.sessionStatus = "authenticated";
        const user = userEvent.setup();
        render(<DemoMailboxPage />);

        await user.type(
            screen.getByRole("textbox", { name: "Email da conta" }),
            "aluno@example.test",
        );
        await user.click(
            screen.getByRole("button", { name: "Consultar caixa" }),
        );

        expect(mocks.list).toHaveBeenCalledWith(
            "aluno@example.test",
            expect.objectContaining({ csrf: true }),
        );
    });
});
