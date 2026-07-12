/**
 * @file Contratos visuais, de sessão e segurança da página pública de associações.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { PublicCharitiesPage } from "./PublicCharitiesPage.jsx";

const mocks = vi.hoisted(() => ({
    listPublicCharities: vi.fn(),
    getMine: vi.fn(),
    session: { status: "anonymous", isAdmin: false },
}));

vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => mocks.session,
}));

vi.mock("../services/api/charitiesApi.js", () => ({
    charitiesApi: {
        listPublicCharities: mocks.listPublicCharities,
        getMine: mocks.getMine,
    },
}));

const charity = {
    id: "charity/um?seguro=sim",
    name: "Associação Vida Nova",
    mission: "Apoio comunitário e acompanhamento de famílias locais.",
    websiteUrl: "https://example.test/vida",
    approvedAt: "2025-06-01T00:00:00.000Z",
};

/** @returns {JSX.Element} Página com routing SPA disponível. */
function view() {
    return (
        <MemoryRouter>
            <PublicCharitiesPage />
        </MemoryRouter>
    );
}

describe("PublicCharitiesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.session.status = "anonymous";
        mocks.session.isAdmin = false;
        mocks.getMine.mockResolvedValue({ charity: null });
        mocks.listPublicCharities.mockResolvedValue({
            charities: [charity],
            impact: {
                eligibleCharities: 1,
                totalDistributedCents: 12345,
                completedMonths: 3,
                currency: "EUR",
            },
        });
    });

    it("apresenta hero, impacto real e website externo seguro", async () => {
        render(view());

        expect(await screen.findByRole("heading", {
            name: "Ver histórias. Apoiar vidas.",
            level: 1,
        })).toBeInTheDocument();
        expect(screen.getByText("1", { selector: "dd" })).toBeInTheDocument();
        expect(screen.getByText(/123/u, { selector: "dd" })).toBeInTheDocument();
        expect(screen.getByText("3", { selector: "dd" })).toBeInTheDocument();
        expect(screen.getByText("Na pool desde 2025")).toBeInTheDocument();

        const website = screen.getByRole("link", {
            name: "Visitar website: Associação Vida Nova",
        });
        expect(website).toHaveAttribute("href", "https://example.test/vida");
        expect(website).toHaveAttribute("target", "_blank");
        expect(website).toHaveAttribute("rel", "noopener noreferrer");
        expect(mocks.getMine).not.toHaveBeenCalled();
    });

    it("mostra apenas a área pertencente ao membro e codifica o identificador", async () => {
        mocks.session.status = "authenticated";
        mocks.getMine.mockResolvedValue({
            charity: { id: charity.id, name: charity.name },
        });
        render(view());

        expect(await screen.findByRole("link", { name: "Área da associação" }))
            .toHaveAttribute(
                "href",
                "/associacoes/charity%2Fum%3Fseguro%3Dsim/historico",
            );
        expect(mocks.getMine).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
        });
        expect(screen.queryByRole("link", { name: /Consultar histórico/u }))
            .not.toBeInTheDocument();
    });

    it("mantém histórico administrativo sem consultar membership", async () => {
        mocks.session.status = "authenticated";
        mocks.session.isAdmin = true;
        render(view());

        expect(await screen.findByRole("link", {
            name: "Consultar histórico: Associação Vida Nova",
        })).toHaveAttribute(
            "href",
            "/associacoes/charity%2Fum%3Fseguro%3Dsim/historico",
        );
        expect(mocks.getMine).not.toHaveBeenCalled();
    });

    it("não transforma URL insegura num link", async () => {
        mocks.listPublicCharities.mockResolvedValue({
            charities: [{ ...charity, websiteUrl: "javascript:alert(1)" }],
        });
        render(view());

        await screen.findByText(charity.name);
        expect(screen.queryByRole("link", { name: /Visitar website/u }))
            .not.toBeInTheDocument();
    });

    it("repete a listagem depois de um erro sem bloquear o hero", async () => {
        mocks.listPublicCharities
            .mockRejectedValueOnce(new ApiError({ status: 503, message: "Indisponível." }))
            .mockResolvedValueOnce({ charities: [charity] });
        const user = userEvent.setup();
        render(view());

        expect(await screen.findByRole("alert")).toHaveTextContent("Indisponível.");
        expect(screen.getByRole("heading", { name: "Ver histórias. Apoiar vidas." }))
            .toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(await screen.findByText(charity.name)).toBeInTheDocument();
    });

    it("cancela listagem e associação própria no unmount", () => {
        mocks.session.status = "authenticated";
        mocks.listPublicCharities.mockReturnValue(new Promise(() => {}));
        mocks.getMine.mockReturnValue(new Promise(() => {}));
        const rendered = render(view());
        const publicSignal = mocks.listPublicCharities.mock.calls[0][0].signal;
        const mineSignal = mocks.getMine.mock.calls[0][0].signal;

        rendered.unmount();

        expect(publicSignal.aborted).toBe(true);
        expect(mineSignal.aborted).toBe(true);
    });
});
