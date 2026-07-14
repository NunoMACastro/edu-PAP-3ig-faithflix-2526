/**
 * @file Testes dos estados seguros do painel da pool.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { AdminPoolDashboardPage } from "./AdminPoolDashboardPage.jsx";

const mocks = vi.hoisted(() => ({ getPoolDashboard: vi.fn() }));

vi.mock("../services/api/charitiesApi.js", () => ({ charitiesApi: mocks }));

describe("AdminPoolDashboardPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getPoolDashboard.mockResolvedValue({ months: [] });
    });

    it("apresenta o fecho sem elegíveis como terminal e usa um pedido cancelável", async () => {
        mocks.getPoolDashboard.mockResolvedValue({
            months: [
                {
                    month: "2026-06",
                    totalPoolCents: 0,
                    charitiesCount: 0,
                    status: "deferred_no_eligible_charities",
                },
            ],
        });
        render(<AdminPoolDashboardPage />);

        expect((await screen.findAllByText(/Encerrada sem associações elegíveis/u)).length)
            .toBeGreaterThan(0);
        expect(mocks.getPoolDashboard).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
        });
    });

    it.each(["completed", "distributed"])(
        "reconhece %s como distribuição concluída",
        async (status) => {
            mocks.getPoolDashboard.mockResolvedValue({
                months: [
                    {
                        month: "2026-06",
                        totalPoolCents: 1000,
                        charitiesCount: 1,
                        status,
                    },
                ],
            });

            render(<AdminPoolDashboardPage />);

            expect((await screen.findAllByText("Concluída")).length)
                .toBeGreaterThan(0);
        },
    );

    it("apresenta KPI úteis e um histórico tabular acessível", async () => {
        mocks.getPoolDashboard.mockResolvedValue({
            months: [
                {
                    month: "2026-06",
                    totalPoolCents: 840,
                    charitiesCount: 6,
                    status: "completed",
                },
                {
                    month: "2026-05",
                    totalPoolCents: 420,
                    charitiesCount: 3,
                    status: "completed",
                },
            ],
        });

        render(<AdminPoolDashboardPage />);

        expect(await screen.findByRole("table", {
            name: "Distribuições mensais da pool solidária",
        })).toBeInTheDocument();
        expect(screen.getAllByText("Total distribuído")).toHaveLength(2);
        expect(screen.getByText("Média mensal")).toBeInTheDocument();
        expect(screen.getByText("Último fecho")).toBeInTheDocument();
        expect(screen.queryByText("Meses apresentados")).not.toBeInTheDocument();
    });

    it("mostra erro seguro e repete apenas por ação explícita", async () => {
        mocks.getPoolDashboard
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Serviço indisponível." }),
            )
            .mockResolvedValueOnce({ months: [] });
        const user = userEvent.setup();
        render(<AdminPoolDashboardPage />);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Serviço indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(await screen.findByText("Sem distribuições"))
            .toBeInTheDocument();
        expect(mocks.getPoolDashboard).toHaveBeenCalledTimes(2);
    });
});
