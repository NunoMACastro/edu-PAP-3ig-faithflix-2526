/**
 * @file Testes dos fluxos públicos de identidade e do destino pós-login.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../services/api/apiErrors.js";
import { AuthForms } from "./AuthForms.jsx";

const mocks = vi.hoisted(() => ({
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    refreshSession: vi.fn(),
}));

vi.mock("../../services/api/authApi.js", () => ({
    authApi: {
        login: mocks.login,
        register: mocks.register,
        forgotPassword: mocks.forgotPassword,
        resetPassword: mocks.resetPassword,
    },
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => ({ refreshSession: mocks.refreshSession }),
}));

/** @returns {JSX.Element} Localização atual para observar o redirect. */
function LocationProbe() {
    const location = useLocation();
    return (
        <output data-testid="auth-location">
            {location.pathname}{location.search}{location.hash}
        </output>
    );
}

/**
 * Renderiza o formulário no router de memória usado pelos testes.
 *
 * @param {{ redirectTo?: string | null }} [props] Propriedades do formulário.
 * @returns {import("@testing-library/react").RenderResult} Resultado do render.
 */
function renderAuthForms(props = {}) {
    return render(
        <MemoryRouter initialEntries={["/login"]}>
            <AuthForms {...props} />
            <LocationProbe />
        </MemoryRouter>,
    );
}

/**
 * Preenche as credenciais comuns dos cenários de login.
 *
 * @param {ReturnType<typeof userEvent.setup>} user Controlador do utilizador.
 * @returns {Promise<void>}
 */
async function fillLogin(user) {
    await user.type(screen.getByLabelText("Email"), "user@faithflix.test");
    await user.type(screen.getByLabelText("Palavra-passe"), "password-segura");
}

describe("AuthForms", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.login.mockResolvedValue({ user: { id: "user-1" } });
        mocks.register.mockResolvedValue({ user: { id: "user-1" } });
        mocks.forgotPassword.mockResolvedValue({
            message: "Se o email existir, foi criado um pedido de recuperacao.",
        });
        mocks.resetPassword.mockResolvedValue({ ok: true });
        mocks.refreshSession.mockResolvedValue({ id: "user-1" });
    });

    it.each([
        [null, "/"],
        ["/\\example.test", "/"],
        ["/catalogo?page=2#resultado", "/catalogo?page=2#resultado"],
    ])(
        "redireciona um login com destino %s para %s",
        async (redirectTo, expectedLocation) => {
            const user = userEvent.setup();
            renderAuthForms({ redirectTo });

            await fillLogin(user);
            await user.click(screen.getByTestId("login-submit"));

            expect(mocks.login).toHaveBeenCalledWith(
                {
                    email: "user@faithflix.test",
                    password: "password-segura",
                },
                { signal: expect.any(AbortSignal) },
            );
            expect(await screen.findByTestId("auth-location")).toHaveTextContent(
                expectedLocation,
            );
        },
    );

    it.each([
        ["admin", "/admin"],
        ["moderator", "/admin/catalogo"],
    ])("usa a landing de %s quando não existe next", async (role, destination) => {
        mocks.refreshSession.mockResolvedValueOnce({ id: "staff-1", role });
        const user = userEvent.setup();
        renderAuthForms();
        await fillLogin(user);
        await user.click(screen.getByTestId("login-submit"));
        expect(await screen.findByTestId("auth-location")).toHaveTextContent(destination);
    });

    it("mantém apenas os modos principais visíveis e limpa dados sensíveis ao trocar", async () => {
        const user = userEvent.setup();
        renderAuthForms();

        const emailInput = screen.getByLabelText("Email");
        const passwordInput = screen.getByLabelText("Palavra-passe");
        expect(emailInput).toHaveAttribute("maxlength", "254");
        expect(passwordInput).toHaveAttribute("minlength", "10");
        expect(passwordInput).toHaveAttribute("autocomplete", "current-password");

        await user.type(emailInput, "user@faithflix.test");
        await user.type(passwordInput, "password-segura");
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(screen.getByRole("heading", { name: "Criar a minha conta" })).toBeVisible();
        expect(screen.getByLabelText("Email")).toHaveValue("user@faithflix.test");
        expect(screen.getByLabelText("Palavra-passe")).toHaveValue("");
        expect(screen.getByLabelText("Palavra-passe")).toHaveAttribute(
            "autocomplete",
            "new-password",
        );
        expect(screen.getByLabelText("Nome")).toHaveAttribute("minlength", "2");
        expect(screen.queryByRole("button", { name: "Repor" })).not.toBeInTheDocument();
    });

    it("regista a conta, renova a sessão e respeita o destino interno", async () => {
        const user = userEvent.setup();
        renderAuthForms({ redirectTo: "/catalogo" });

        await user.click(screen.getByRole("button", { name: "Criar conta" }));
        await user.type(screen.getByLabelText("Nome"), "Utilizador Novo");
        await user.type(screen.getByLabelText("Email"), "novo@faithflix.test");
        await user.type(screen.getByLabelText("Palavra-passe"), "password-segura");
        await user.click(screen.getByTestId("register-submit"));

        expect(mocks.register).toHaveBeenCalledWith(
            {
                name: "Utilizador Novo",
                email: "novo@faithflix.test",
                password: "password-segura",
            },
            { signal: expect.any(AbortSignal) },
        );
        expect(mocks.refreshSession).toHaveBeenCalledOnce();
        expect(await screen.findByTestId("auth-location")).toHaveTextContent(
            "/catalogo",
        );
    });

    it("mostra e volta a ocultar a palavra-passe através de um controlo acessível", async () => {
        const user = userEvent.setup();
        renderAuthForms();

        const passwordInput = screen.getByLabelText("Palavra-passe");
        const toggle = screen.getByRole("button", { name: "Mostrar palavra-passe" });
        expect(passwordInput).toHaveAttribute("type", "password");
        expect(toggle).toHaveAttribute("aria-pressed", "false");

        await user.click(toggle);
        expect(passwordInput).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: "Ocultar palavra-passe" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("executa recuperação progressiva e regressa ao login depois do reset", async () => {
        const user = userEvent.setup();
        renderAuthForms();

        await user.type(screen.getByLabelText("Email"), "user@faithflix.test");
        await user.click(
            screen.getByRole("button", { name: "Esqueceste-te da palavra-passe?" }),
        );
        expect(screen.getByRole("heading", { name: "Esqueceste-te da palavra-passe?" })).toBeVisible();
        expect(screen.getByLabelText("Email")).toHaveFocus();

        await user.click(screen.getByTestId("forgot-submit"));
        expect(mocks.forgotPassword).toHaveBeenCalledWith(
            { email: "user@faithflix.test" },
            { signal: expect.any(AbortSignal) },
        );
        expect(
            await screen.findByText(/Se o email existir/u),
        ).toHaveAttribute("role", "status");

        await user.click(screen.getByRole("button", { name: "Já tenho um código" }));
        const tokenInput = screen.getByLabelText("Código de recuperação");
        expect(tokenInput).toHaveFocus();
        expect(tokenInput).toHaveAttribute("pattern", "[A-Fa-f0-9]{64}");
        expect(tokenInput).toHaveAttribute("maxlength", "64");

        const token = "a".repeat(64);
        await user.type(tokenInput, token);
        await user.type(screen.getByLabelText("Palavra-passe"), "nova-password-segura");
        await user.click(screen.getByTestId("reset-submit"));

        expect(mocks.resetPassword).toHaveBeenCalledWith(
            { token, password: "nova-password-segura" },
            { signal: expect.any(AbortSignal) },
        );
        expect(await screen.findByRole("heading", { name: "Entrar na FaithFlix" })).toBeVisible();
        expect(
            screen.getByText("Palavra-passe atualizada. Já podes iniciar sessão."),
        ).toHaveAttribute("role", "status");
        expect(screen.getByLabelText("Email")).toHaveValue("user@faithflix.test");
        expect(screen.getByLabelText("Palavra-passe")).toHaveValue("");
    });

    it("preserva os dados do passo atual quando a API devolve erro", async () => {
        const user = userEvent.setup();
        mocks.login.mockRejectedValue(
            new ApiError({ status: 400, message: "Credenciais inválidas." }),
        );
        renderAuthForms();

        await fillLogin(user);
        await user.click(screen.getByTestId("login-submit"));

        expect(await screen.findByRole("alert")).toHaveTextContent("Credenciais inválidas.");
        expect(screen.getByLabelText("Email")).toHaveValue("user@faithflix.test");
        expect(screen.getByLabelText("Palavra-passe")).toHaveValue("password-segura");
    });

    it("impede submissões concorrentes e aborta o pedido ao desmontar", async () => {
        const user = userEvent.setup();
        let receivedSignal;
        mocks.login.mockImplementation((_payload, options) => {
            receivedSignal = options.signal;
            return new Promise(() => {});
        });
        const view = renderAuthForms();

        await fillLogin(user);
        const form = screen.getByTestId("login-submit").closest("form");
        fireEvent.submit(form);
        fireEvent.submit(form);

        expect(mocks.login).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("login-submit")).toBeDisabled();
        view.unmount();

        await waitFor(() => expect(receivedSignal.aborted).toBe(true));
    });
});
