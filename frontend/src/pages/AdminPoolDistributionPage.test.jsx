/**
 * @file Testes do mês financeiro local da distribuição administrativa.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    AdminPoolDistributionPage,
    formatLocalMonth,
} from "./AdminPoolDistributionPage.jsx";

const mocks = vi.hoisted(() => ({ runDistribution: vi.fn(), previewDistribution: vi.fn() }));

vi.mock("../services/api/charitiesApi.js", () => ({ charitiesApi: mocks }));

describe("formatLocalMonth", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("usa ano e mês locais em vez de serializar a data para UTC", () => {
        const localDate = {
            getFullYear: () => 2026,
            getMonth: () => 0,
        };

        expect(formatLocalMonth(localDate)).toBe("2026-01");
    });

    it("não executa o fecho financeiro sem confirmação explícita", async () => {
        mocks.previewDistribution.mockResolvedValue({ preview: { month: "2026-06", previewToken: "a".repeat(64), alreadyDistributed: false, status: "completed", totalPoolCents: 100, financialSnapshot: { approvedRevenueCents: 500, paymentCount: 1, eligibleCharityCount: 1 }, items: [{ charityId: "charity-1", charityName: "Esperança", amountCents: 100 }] } });
        const user = userEvent.setup();
        render(<AdminPoolDistributionPage />);
        await user.click(screen.getByRole("button", { name: "Gerar pré-visualização" }));
        await user.click(await screen.findByRole("button", { name: "Confirmar distribuição" }));
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(mocks.runDistribution).not.toHaveBeenCalled();
    });
});
