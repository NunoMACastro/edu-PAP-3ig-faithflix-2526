/**
 * @file Testes da comparação pública e gestão privada de planos FaithFlix.
 */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { SubscriptionPage } from "./SubscriptionPage.jsx";

const mocks = vi.hoisted(() => ({
    sessionStatus: "authenticated",
    listPlans: vi.fn(),
    getMine: vi.fn(),
    cancelRenewal: vi.fn(),
    inviteFamilyMember: vi.fn(),
    acceptFamilyInvitation: vi.fn(),
    declineFamilyInvitation: vi.fn(),
    removeFamilyMember: vi.fn(),
    leaveFamily: vi.fn(),
    simulatedCheckout: vi.fn(),
    startTrial: vi.fn(),
    refreshSession: vi.fn(),
}));

vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => ({
        status: mocks.sessionStatus,
        error: mocks.sessionStatus === "unavailable"
            ? "Serviço de sessão indisponível."
            : "",
        refreshSession: mocks.refreshSession,
    }),
}));

vi.mock("../services/api/subscriptionsApi.js", () => ({
    subscriptionsApi: {
        listPlans: mocks.listPlans,
        getMine: mocks.getMine,
        cancelRenewal: mocks.cancelRenewal,
        inviteFamilyMember: mocks.inviteFamilyMember,
        acceptFamilyInvitation: mocks.acceptFamilyInvitation,
        declineFamilyInvitation: mocks.declineFamilyInvitation,
        removeFamilyMember: mocks.removeFamilyMember,
        leaveFamily: mocks.leaveFamily,
    },
}));

vi.mock("../services/api/paymentsApi.js", () => ({
    paymentsApi: {
        simulatedCheckout: mocks.simulatedCheckout,
        startTrial: mocks.startTrial,
    },
}));

const proMonthly = {
    code: "faithflix-monthly",
    name: "FaithFlix Pro Mensal",
    interval: "monthly",
    priceCents: 799,
    currency: "EUR",
    tier: "pro",
    qualityRank: 1080,
    maxQuality: "1080p",
    familySharing: false,
    maxFamilyMembers: 1,
    solidaritySharePercent: 20,
    features: ["Streaming até Full HD", "Acesso premium individual"],
};

const proYearly = {
    ...proMonthly,
    code: "faithflix-yearly",
    name: "FaithFlix Pro Anual",
    interval: "yearly",
    priceCents: 7990,
};

const familyMonthly = {
    code: "faithflix-family-monthly",
    name: "FaithFlix Família Mensal",
    interval: "monthly",
    priceCents: 1299,
    currency: "EUR",
    tier: "family",
    qualityRank: 2160,
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    solidaritySharePercent: 20,
    features: ["Perfil 2160p", "Partilha com até 5 utilizadores"],
};

const familyYearly = {
    ...familyMonthly,
    code: "faithflix-family-yearly",
    name: "FaithFlix Família Anual",
    interval: "yearly",
    priceCents: 12990,
};

const plans = [proMonthly, familyMonthly, proYearly, familyYearly];

function mineResponse(overrides = {}, familyOverrides = {}) {
    const baseState = {
        hasPremiumAccess: false,
        accessSource: "none",
        status: "none",
        entitlements: { tier: "none", maxQuality: "720p" },
        ...overrides,
    };

    return {
        subscription: { ...baseState },
        access: { ...baseState },
        trialEligibility: baseState.hasPremiumAccess
            ? "premium_active"
            : "available",
        family: {
            ownedFamily: null,
            pendingInvitations: [],
            activeMembership: null,
            ...familyOverrides,
        },
    };
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/planos"]}>
            <SubscriptionPage />
        </MemoryRouter>,
    );
}

describe("SubscriptionPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.listPlans.mockResolvedValue({ plans });
        mocks.getMine.mockResolvedValue(mineResponse());
        mocks.simulatedCheckout.mockResolvedValue({ replayed: false });
        mocks.startTrial.mockResolvedValue({ replayed: false });
        mocks.cancelRenewal.mockResolvedValue({});
        mocks.inviteFamilyMember.mockResolvedValue({});
        mocks.acceptFamilyInvitation.mockResolvedValue({});
        mocks.declineFamilyInvitation.mockResolvedValue({});
        mocks.removeFamilyMember.mockResolvedValue({});
        mocks.leaveFamily.mockResolvedValue({});
        mocks.refreshSession.mockResolvedValue(null);
        vi.stubGlobal("confirm", vi.fn(() => true));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("prioriza a comparação mensal e separa leituras pública e privada", async () => {
        renderPage();

        expect(await screen.findByRole("heading", { name: "FaithFlix Pro" })).toBeVisible();
        expect(screen.getByRole("heading", { name: "FaithFlix Família" })).toBeVisible();
        expect(screen.queryByText("79,90 €")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Mensal" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByText(/simulad|demonstração|PAP/iu)).not.toBeInTheDocument();

        const publicSignal = mocks.listPlans.mock.calls[0][0].signal;
        const privateSignal = mocks.getMine.mock.calls[0][0].signal;
        expect(publicSignal).toBeInstanceOf(AbortSignal);
        expect(privateSignal).toBeInstanceOf(AbortSignal);
        expect(privateSignal).not.toBe(publicSignal);
    });

    it("mostra preços anuais, equivalente mensal e poupança real", async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByRole("heading", { name: "FaithFlix Pro" });

        await user.click(screen.getByRole("button", { name: "Anual" }));

        expect(screen.getByText(/79,90/u)).toBeVisible();
        expect(screen.getByText(/Equivale a 6,66/u)).toBeVisible();
        expect(screen.getByText(/Poupa 15,98/u)).toBeVisible();
        expect(screen.getByText(/129,90/u)).toBeVisible();
    });

    it("usa o primeiro período disponível quando não existe mensal", async () => {
        mocks.listPlans.mockResolvedValue({ plans: [proYearly] });
        renderPage();

        expect(await screen.findByText(/79,90/u)).toBeVisible();
        expect(screen.queryByRole("group", { name: "Período de faturação" }))
            .not.toBeInTheDocument();
    });

    it("mantém os planos públicos quando a leitura privada falha", async () => {
        mocks.getMine.mockRejectedValue(new ApiError({ status: 503, message: "Conta indisponível." }));
        renderPage();

        expect(await screen.findByRole("heading", { name: "FaithFlix Pro" })).toBeVisible();
        expect(await screen.findByRole("alert")).toHaveTextContent("Conta indisponível.");
        expect(screen.queryByRole("button", { name: "Iniciar trial" })).not.toBeInTheDocument();
    });

    it("confirma o checkout em diálogo e recarrega o estado canónico", async () => {
        const user = userEvent.setup();
        renderPage();
        const chooseButton = await screen.findByRole("button", { name: "Escolher Família" });

        await user.click(chooseButton);
        const dialog = await screen.findByRole("dialog", { name: "FaithFlix Família" });
        expect(within(dialog).queryByText(/simulad|demonstração|PAP/iu))
            .not.toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: "Confirmar subscrição" }));

        expect(mocks.simulatedCheckout).toHaveBeenCalledWith(
            {
                planCode: "faithflix-family-monthly",
                paymentMethod: "card_test",
                simulateOutcome: "approved",
            },
            {
                idempotencyKey: expect.any(String),
                signal: expect.any(AbortSignal),
            },
        );
        await waitFor(() => expect(mocks.getMine).toHaveBeenCalledTimes(2));
        expect(await screen.findByRole("status")).toHaveTextContent("Subscrição ativada.");
    });

    it("reutiliza a chave depois de falha ambígua e bloqueia duplo clique", async () => {
        let resolveCheckout;
        mocks.simulatedCheckout
            .mockRejectedValueOnce(new ApiError({ status: 0, message: "Falha de rede." }))
            .mockImplementationOnce(() => new Promise((resolve) => {
                resolveCheckout = resolve;
            }));
        const user = userEvent.setup();
        renderPage();
        await user.click(await screen.findByRole("button", { name: "Escolher Família" }));
        const dialog = await screen.findByRole("dialog", { name: "FaithFlix Família" });
        const confirmButton = within(dialog).getByRole("button", { name: "Confirmar subscrição" });

        await user.click(confirmButton);
        expect(await screen.findByRole("alert")).toHaveTextContent("Falha de rede.");
        await user.dblClick(confirmButton);

        expect(mocks.simulatedCheckout).toHaveBeenCalledTimes(2);
        expect(mocks.simulatedCheckout.mock.calls[1][1].idempotencyKey)
            .toBe(mocks.simulatedCheckout.mock.calls[0][1].idempotencyKey);
        resolveCheckout({ replayed: true });
    });

    it("fecha a confirmação sem mutação e devolve o foco à escolha", async () => {
        const user = userEvent.setup();
        renderPage();
        const chooseButton = await screen.findByRole("button", { name: "Escolher Pro" });
        await user.click(chooseButton);
        const dialog = await screen.findByRole("dialog", { name: "FaithFlix Pro" });
        await user.click(within(dialog).getByRole("button", { name: "Voltar" }));

        expect(mocks.simulatedCheckout).not.toHaveBeenCalled();
        expect(chooseButton).toHaveFocus();
    });

    it("restaura o foco quando o diálogo fecha pelo comportamento nativo", async () => {
        const user = userEvent.setup();
        renderPage();
        const chooseButton = await screen.findByRole("button", { name: "Escolher Pro" });
        await user.click(chooseButton);
        const dialog = await screen.findByRole("dialog", { name: "FaithFlix Pro" });

        dialog.removeAttribute("open");
        fireEvent(dialog, new Event("close", { bubbles: true }));

        await waitFor(() => expect(chooseButton).toHaveFocus());
        expect(mocks.simulatedCheckout).not.toHaveBeenCalled();
    });

    it("identifica o plano atual, oculta trial e informa renovação cancelada", async () => {
        mocks.getMine.mockResolvedValue(mineResponse({
            hasPremiumAccess: true,
            accessSource: "own",
            status: "active",
            planCode: familyMonthly.code,
            plan: familyMonthly,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: "2026-08-01T00:00:00.000Z",
            entitlements: { tier: "family", maxQuality: "2160p" },
        }));
        renderPage();

        expect(await screen.findByRole("button", { name: "Plano atual" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Disponível no fim do ciclo atual" }))
            .toBeDisabled();
        expect(screen.queryByRole("button", { name: "Iniciar trial" })).not.toBeInTheDocument();
        expect(screen.getByText(/A renovação está cancelada/u)).toBeVisible();
        expect(screen.queryByRole("button", { name: "Cancelar renovação" })).not.toBeInTheDocument();
    });

    it("não mostra o CTA quando o trial da conta já foi utilizado", async () => {
        mocks.getMine.mockResolvedValue({
            ...mineResponse(),
            trialEligibility: "already_used",
        });

        renderPage();

        expect(await screen.findByText("O trial desta conta já foi utilizado."))
            .toBeVisible();
        expect(screen.queryByRole("button", { name: "Iniciar trial" }))
            .not.toBeInTheDocument();
    });

    it("usa access familiar para tier e ciclo sem tratar a subscrição do membro como faturável", async () => {
        mocks.getMine.mockResolvedValue({
            subscription: {
                status: "none",
                hasPremiumAccess: false,
                accessSource: "none",
                entitlements: { tier: "none", maxQuality: "720p" },
            },
            access: {
                status: "active",
                hasPremiumAccess: true,
                accessSource: "family",
                currentPeriodEnd: "2026-08-15T00:00:00.000Z",
                entitlements: { tier: "family", maxQuality: "2160p" },
            },
            trialEligibility: "premium_active",
            family: {
                ownedFamily: null,
                pendingInvitations: [],
                activeMembership: {
                    owner: { name: "Owner Familiar", email: "owner@example.test" },
                },
            },
        });

        renderPage();

        expect(await screen.findByText("Partilha familiar")).toBeVisible();
        expect(screen.getAllByText("Família").length).toBeGreaterThan(0);
        expect(screen.getAllByText("2160p").length).toBeGreaterThan(0);
        expect(screen.getByText("15/08/2026")).toBeVisible();
        expect(screen.queryByRole("button", { name: "Cancelar renovação" }))
            .not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Iniciar trial" }))
            .not.toBeInTheDocument();
    });

    it("preserva cancelamento de renovação com confirmação explícita", async () => {
        mocks.getMine.mockResolvedValue(mineResponse({
            hasPremiumAccess: true,
            accessSource: "own",
            status: "active",
            cancelAtPeriodEnd: false,
            entitlements: { tier: "pro", maxQuality: "1080p" },
        }));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole("button", { name: "Cancelar renovação" }));
        expect(mocks.cancelRenewal).toHaveBeenCalledWith({ signal: expect.any(AbortSignal) });
    });

    it("não carrega gestão privada nem repete blocos de login para visitantes", async () => {
        mocks.sessionStatus = "anonymous";
        renderPage();

        expect(await screen.findAllByRole("link", { name: "Entrar para escolher" })).toHaveLength(2);
        expect(mocks.getMine).not.toHaveBeenCalled();
        expect(screen.queryByRole("heading", { name: "A tua subscrição" })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "A tua família FaithFlix" })).not.toBeInTheDocument();
    });

    it("mantém sessão indisponível distinta de visitante", async () => {
        mocks.sessionStatus = "unavailable";
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByRole("alert", { name: "Não foi possível confirmar a sessão" }))
            .toHaveTextContent("Serviço de sessão indisponível.");
        expect(screen.queryByRole("link", { name: /Entrar para/u })).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Tentar confirmar sessão" }));
        expect(mocks.refreshSession).toHaveBeenCalledTimes(1);
    });

    it("mostra e opera a gestão familiar apenas quando existe contexto", async () => {
        mocks.getMine.mockResolvedValue(mineResponse({
            hasPremiumAccess: true,
            accessSource: "own",
            entitlements: { tier: "family", maxQuality: "2160p" },
        }, {
            ownedFamily: {
                seatsUsed: 2,
                maxFamilyMembers: 5,
                seatsAvailable: 3,
                members: [{
                    id: "membership-1",
                    memberUserId: "user-1",
                    status: "active",
                    invitedEmail: "membro@example.com",
                    member: { name: "Membro Um", email: "membro@example.com" },
                }],
            },
        }));
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText("2/5 lugares usados.")).toBeVisible();
        const member = screen.getByText("membro@example.com").closest("article");
        await user.click(within(member).getByRole("button", { name: "Remover" }));
        expect(mocks.removeFamilyMember).toHaveBeenCalledWith("user-1", {
            signal: expect.any(AbortSignal),
        });
    });

    it("aborta independentemente as leituras e mutações ao desmontar", async () => {
        mocks.listPlans.mockReturnValue(new Promise(() => {}));
        mocks.getMine.mockReturnValue(new Promise(() => {}));
        const view = renderPage();
        const publicSignal = mocks.listPlans.mock.calls[0][0].signal;
        const privateSignal = mocks.getMine.mock.calls[0][0].signal;

        view.unmount();

        expect(publicSignal.aborted).toBe(true);
        expect(privateSignal.aborted).toBe(true);
    });
});
