/**
 * @file Regressão da limpeza de sessão após eliminação da própria conta.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    MemoryRouter,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrivacyDangerZone } from "./PrivacyDangerZone.jsx";

const mocks = vi.hoisted(() => ({
    deleteMyAccount: vi.fn(),
    clearSession: vi.fn(),
}));

vi.mock("../../services/api/privacyApi.js", () => ({
    privacyApi: { deleteMyAccount: mocks.deleteMyAccount },
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => ({ clearSession: mocks.clearSession }),
}));

/** @returns {JSX.Element} Confirma destino e estado do redirect. */
function LoginProbe() {
    const location = useLocation();
    return (
        <output data-testid="login-destination">
            {location.pathname}:{String(location.state?.accountDeleted)}
        </output>
    );
}

describe("PrivacyDangerZone", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.deleteMyAccount.mockResolvedValue({ deleted: true });
    });

    it("limpa a sessão e redireciona depois de eliminar a conta", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/conta"]}>
                <Routes>
                    <Route path="/conta" element={<PrivacyDangerZone />} />
                    <Route path="/login" element={<LoginProbe />} />
                </Routes>
            </MemoryRouter>,
        );

        await user.type(
            screen.getByRole("textbox", { name: /Escreve ELIMINAR CONTA/u }),
            "ELIMINAR CONTA",
        );
        await user.type(
            screen.getByLabelText("Password atual"),
            "password1234",
        );
        await user.click(
            screen.getByRole("button", { name: "Eliminar conta" }),
        );

        expect(mocks.deleteMyAccount).toHaveBeenCalledWith({
            confirmation: "ELIMINAR CONTA",
            password: "password1234",
        });
        expect(mocks.clearSession).toHaveBeenCalledOnce();
        expect(await screen.findByTestId("login-destination")).toHaveTextContent(
            "/login:true",
        );
    });
});
