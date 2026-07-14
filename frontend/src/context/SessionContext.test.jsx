/**
 * @file Testes das transições autoritativas do contexto de sessão.
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { SessionProvider, useSession } from "./SessionContext.jsx";

const mocks = vi.hoisted(() => ({
    me: vi.fn(),
    logout: vi.fn(),
    clearCsrfToken: vi.fn(),
    setUnauthorizedHandler: vi.fn(),
    unauthorizedHandler: null,
}));

vi.mock("../services/api/authApi.js", () => ({
    authApi: {
        me: mocks.me,
        logout: mocks.logout,
    },
}));

vi.mock("../services/api/apiClient.js", () => ({
    clearCsrfToken: mocks.clearCsrfToken,
    setUnauthorizedHandler: mocks.setUnauthorizedHandler,
}));

/**
 * Expõe o contexto como UI observável sem testar detalhes internos do React.
 *
 * @returns {JSX.Element} Estado e ações mínimas para o teste.
 */
function SessionProbe() {
    const session = useSession();

    return (
        <section>
            <p data-testid="session-status">{session.status}</p>
            <p data-testid="session-user">{session.user?.email ?? "sem-user"}</p>
            <p data-testid="session-error">{session.error}</p>
            <button type="button" onClick={() => session.logout()}>
                Terminar sessão no teste
            </button>
        </section>
    );
}

describe("SessionProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.unauthorizedHandler = null;
        mocks.logout.mockResolvedValue(null);
        mocks.setUnauthorizedHandler.mockImplementation((handler) => {
            mocks.unauthorizedHandler = handler;
            return () => {
                if (mocks.unauthorizedHandler === handler) {
                    mocks.unauthorizedHandler = null;
                }
            };
        });
    });

    it("mantém loading até o backend confirmar a identidade", async () => {
        let resolveSession;
        mocks.me.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveSession = resolve;
            }),
        );

        render(
            <SessionProvider>
                <SessionProbe />
            </SessionProvider>,
        );

        expect(screen.getByTestId("session-status")).toHaveTextContent(
            "loading",
        );

        await act(async () => {
            resolveSession({
                user: { email: "user@faithflix.test", role: "user" },
            });
        });

        expect(screen.getByTestId("session-status")).toHaveTextContent(
            "authenticated",
        );
    });

    it("classifica falha operacional como unavailable, não anonymous", async () => {
        mocks.me.mockRejectedValueOnce(
            new ApiError({
                status: 503,
                code: "INTERNAL_ERROR",
                message: "Serviço temporariamente indisponível.",
            }),
        );

        render(
            <SessionProvider>
                <SessionProbe />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("session-status")).toHaveTextContent(
                "unavailable",
            );
        });
        expect(screen.getByTestId("session-error")).toHaveTextContent(
            "Serviço temporariamente indisponível.",
        );
    });

    it("classifica HTTP 401 como sessão anónima", async () => {
        mocks.me.mockRejectedValueOnce(
            new ApiError({
                status: 401,
                code: "SESSION_REQUIRED",
                message: "Sessão necessária.",
            }),
        );

        render(
            <SessionProvider>
                <SessionProbe />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("session-status")).toHaveTextContent(
                "anonymous",
            );
        });
        expect(screen.getByTestId("session-user")).toHaveTextContent(
            "sem-user",
        );
    });

    it("invalida imediatamente uma sessão autenticada após callback 401", async () => {
        mocks.me.mockResolvedValueOnce({
            user: { email: "user@faithflix.test", role: "user" },
        });

        render(
            <SessionProvider>
                <SessionProbe />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("session-status")).toHaveTextContent(
                "authenticated",
            );
        });

        act(() => {
            mocks.unauthorizedHandler(
                new ApiError({
                    status: 401,
                    code: "SESSION_EXPIRED",
                    message: "Sessão expirada.",
                }),
            );
        });

        expect(screen.getByTestId("session-status")).toHaveTextContent(
            "anonymous",
        );
        expect(screen.getByTestId("session-user")).toHaveTextContent(
            "sem-user",
        );
        expect(mocks.clearCsrfToken).toHaveBeenCalled();
    });

    it("faz logout remoto antes de limpar o utilizador local", async () => {
        const user = userEvent.setup();
        mocks.me.mockResolvedValueOnce({
            user: { email: "user@faithflix.test", role: "user" },
        });

        render(
            <SessionProvider>
                <SessionProbe />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("session-status")).toHaveTextContent(
                "authenticated",
            );
        });
        await user.click(
            screen.getByRole("button", { name: "Terminar sessão no teste" }),
        );

        await waitFor(() => {
            expect(mocks.logout).toHaveBeenCalledOnce();
            expect(screen.getByTestId("session-status")).toHaveTextContent(
                "anonymous",
            );
        });
    });
});
