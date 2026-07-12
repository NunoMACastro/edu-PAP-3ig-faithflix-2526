/**
 * @file Testes do formulário de conta e do limite parental.
 */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { AccountPage } from "./AccountPage.jsx";

const mocks = vi.hoisted(() => ({
    getMe: vi.fn(),
    updateMe: vi.fn(),
    updateParental: vi.fn(),
    getSubscription: vi.fn(),
    cancelRenewal: vi.fn(),
}));

vi.mock("../services/api/userApi.js", () => ({ userApi: mocks }));
vi.mock("../services/api/subscriptionsApi.js", () => ({
    subscriptionsApi: {
        getMine: mocks.getSubscription,
        cancelRenewal: mocks.cancelRenewal,
    },
}));

vi.mock("../components/privacy/PrivacyConsentsPanel.jsx", () => ({
    PrivacyConsentsPanel: () => null,
}));
vi.mock("../components/privacy/PrivacyDangerZone.jsx", () => ({
    PrivacyDangerZone: () => null,
}));
vi.mock("../components/privacy/PrivacyExportPanel.jsx", () => ({
    PrivacyExportPanel: () => null,
}));

const account = {
    id: "user-1",
    name: "Utilizador Teste",
    email: "user@faithflix.test",
    role: "user",
    parentalMaxAgeRating: 12,
};

const activeSubscription = {
    status: "active",
    planCode: "faithflix-monthly",
    currentPeriodEnd: "2026-08-12T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    hasPremiumAccess: true,
    accessSource: "own",
    plan: { code: "faithflix-monthly", name: "FaithFlix Pro", tier: "pro" },
    entitlements: {
        tier: "pro",
        maxQuality: "1080p",
        familySharing: false,
        maxFamilyMembers: 1,
    },
};

/** @returns {ReturnType<typeof render>} Página com o router exigido pelos links internos. */
function renderAccount() {
    return render(
        <MemoryRouter>
            <AccountPage />
        </MemoryRouter>,
    );
}

describe("AccountPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getMe.mockResolvedValue({ user: account });
        mocks.updateMe.mockResolvedValue({ user: account });
        mocks.updateParental.mockResolvedValue({ user: account });
        mocks.getSubscription.mockResolvedValue({
            subscription: activeSubscription,
            access: activeSubscription,
        });
        mocks.cancelRenewal.mockResolvedValue({
            subscription: { ...activeSubscription, cancelAtPeriodEnd: true },
        });
    });

    it("carrega a conta através de um pedido cancelável", async () => {
        renderAccount();

        expect(await screen.findByDisplayValue("Utilizador Teste"))
            .toBeInTheDocument();
        expect(mocks.getMe).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
        });
    });

    it("permite repetir a leitura quando a conta está temporariamente indisponível", async () => {
        mocks.getMe
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Serviço indisponível." }),
            )
            .mockResolvedValueOnce({ user: account });
        const user = userEvent.setup();
        renderAccount();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Serviço indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(await screen.findByDisplayValue("Utilizador Teste"))
            .toBeInTheDocument();
        expect(mocks.getMe).toHaveBeenCalledTimes(2);
    });

    it("recusa o limite parental vazio sem o converter para zero", async () => {
        const user = userEvent.setup();
        renderAccount();
        const input = await screen.findByLabelText("Idade máxima permitida");
        await user.clear(input);

        fireEvent.submit(input.closest("form"));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Seleciona um limite parental inteiro entre 0 e 18.",
        );
        expect(mocks.updateParental).not.toHaveBeenCalled();
    });

    it("envia um inteiro válido e usa a resposta autoritativa", async () => {
        mocks.updateParental.mockResolvedValue({
            user: { ...account, parentalMaxAgeRating: 16 },
        });
        const user = userEvent.setup();
        renderAccount();
        const input = await screen.findByLabelText("Idade máxima permitida");
        await user.clear(input);
        await user.type(input, "16");
        await user.click(
            screen.getByRole("button", { name: "Guardar limite" }),
        );

        await waitFor(() => {
            expect(mocks.updateParental).toHaveBeenCalledWith(
                16,
                { signal: expect.any(AbortSignal) },
            );
            expect(input).toHaveValue(16);
        });
    });

    it("aborta uma mutação pendente quando a página desmonta", async () => {
        mocks.updateMe.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        const view = renderAccount();

        const nameInput = await screen.findByDisplayValue("Utilizador Teste");
        await user.clear(nameInput);
        await user.type(nameInput, "Utilizador Revisto");
        await user.click(
            screen.getByRole("button", { name: "Guardar perfil" }),
        );
        const signal = mocks.updateMe.mock.calls[0][1].signal;

        view.unmount();

        expect(signal.aborted).toBe(true);
    });

    it("mostra o plano atual e encaminha a alteração para o checkout existente", async () => {
        renderAccount();

        expect(await screen.findByRole("heading", { name: "FaithFlix Pro" }))
            .toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Alterar plano" }))
            .toHaveAttribute("href", "/planos#comparar-planos");
        expect(mocks.getSubscription).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
        });
    });

    it("cancela apenas a renovação depois de confirmação acessível", async () => {
        const user = userEvent.setup();
        renderAccount();
        await screen.findByRole("heading", { name: "FaithFlix Pro" });

        await user.click(screen.getByRole("button", { name: "Cancelar renovação" }));
        const dialog = screen.getByRole("dialog", { name: "Cancelar renovação" });
        expect(dialog).toHaveTextContent("Manténs o acesso até");
        await user.click(within(dialog).getByRole("button", { name: "Cancelar renovação" }));

        await waitFor(() => {
            expect(mocks.cancelRenewal).toHaveBeenCalledWith({
                signal: expect.any(AbortSignal),
            });
        });
        expect(await screen.findByText(/A renovação está cancelada/u))
            .toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Cancelar renovação" }))
            .not.toBeInTheDocument();
    });
});
