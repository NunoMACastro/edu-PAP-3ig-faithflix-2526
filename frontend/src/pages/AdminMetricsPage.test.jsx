/**
 * @file Testes dos filtros e pedidos canceláveis das métricas.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMetricsPage } from "./AdminMetricsPage.jsx";

const mocks = vi.hoisted(() => ({
    getAdminMetrics: vi.fn(),
    exportCsv: vi.fn(),
}));

vi.mock("../services/api/metricsApi.js", () => ({ metricsApi: mocks }));

const metrics = {
    generatedAt: "2026-07-12T08:00:00.000Z",
    range: { from: "2026-07-01", to: "2026-07-12" },
    users: { total: 2, active: 1, blocked: 1, deleted: 0 },
    catalog: { published: 3, draft: 1, archived: 0, mediaPending: 1, mediaFailed: 0 },
    subscriptions: { active: 1, trialing: 1, familyMembers: 2, familyInvitationsPending: 1 },
    notifications: { created: 4 },
    privacy: { deletionRequests: 0, consentEvents: 2 },
    solidarity: { approvedCharities: 1, pendingApplications: 2, distributedCents: 1234 },
    integrations: { total: 3, enabled: 2, disabled: 1, invalid: 0 },
    anonymousMetrics: { total: 4, byType: { catalog_view: 1, search_submit: 1, playback_started: 1, playback_completed: 1 } },
};

describe("AdminMetricsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getAdminMetrics.mockResolvedValue({ metrics });
        mocks.exportCsv.mockResolvedValue({
            blob: new Blob(["metric,value"]),
            filename: "faithflix-metricas-2026-07-11.csv",
        });
        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            value: vi.fn(() => "blob:faithflix-metrics"),
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            value: vi.fn(),
        });
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    });

    it("descarrega CSV por Blob com o intervalo aplicado", async () => {
        const user = userEvent.setup();
        render(<AdminMetricsPage />);
        await screen.findByText("Períodos experimentais");

        fireEvent.change(screen.getByLabelText("De"), {
            target: { value: "2026-07-01" },
        });
        fireEvent.change(screen.getByLabelText("Até"), {
            target: { value: "2026-07-10" },
        });
        await user.click(screen.getByRole("button", { name: "Atualizar" }));
        await user.click(screen.getByRole("button", { name: "Exportar CSV" }));

        expect(mocks.exportCsv).toHaveBeenCalledWith(
            { from: "2026-07-01", to: "2026-07-10" },
            { signal: expect.any(AbortSignal) },
        );
        expect(await screen.findByText("Exportação CSV preparada."))
            .toBeInTheDocument();
        expect(URL.createObjectURL).toHaveBeenCalledOnce();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(
            "blob:faithflix-metrics",
        );
    });

    it("oculta exportação quando a capability está desativada", async () => {
        mocks.getAdminMetrics.mockResolvedValue({
            metrics,
            capabilities: { csvExport: false },
        });

        render(<AdminMetricsPage />);

        await screen.findByText("Períodos experimentais");
        expect(screen.queryByRole("button", { name: "Exportar CSV" }))
            .not.toBeInTheDocument();
    });

    it("carrega as métricas através de um pedido cancelável", async () => {
        render(<AdminMetricsPage />);

        expect(await screen.findByText("Períodos experimentais"))
            .toBeInTheDocument();
        expect(mocks.getAdminMetrics).toHaveBeenCalledWith(
            { from: "", to: "" },
            { signal: expect.any(AbortSignal) },
        );
    });

    it("recusa um intervalo invertido sem pedir novos dados", async () => {
        render(<AdminMetricsPage />);
        await screen.findByText("Períodos experimentais");
        fireEvent.change(screen.getByLabelText("De"), {
            target: { value: "2026-07-10" },
        });
        fireEvent.change(screen.getByLabelText("Até"), {
            target: { value: "2026-07-01" },
        });

        fireEvent.submit(screen.getByRole("button", { name: "Atualizar" }).closest("form"));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "A data inicial não pode ser posterior à data final.",
        );
        expect(mocks.getAdminMetrics).toHaveBeenCalledOnce();
    });

    it("cancela a leitura pendente ao desmontar", () => {
        mocks.getAdminMetrics.mockReturnValue(new Promise(() => {}));
        const view = render(<AdminMetricsPage />);
        const signal = mocks.getAdminMetrics.mock.calls[0][1].signal;

        view.unmount();

        expect(signal.aborted).toBe(true);
    });
});
