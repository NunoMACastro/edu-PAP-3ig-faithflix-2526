/**
 * @file Testes comportamentais da exportação RGPD cancelável.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../services/api/apiErrors.js";
import { PrivacyExportPanel } from "./PrivacyExportPanel.jsx";

const mocks = vi.hoisted(() => ({
    exportMyData: vi.fn(),
}));

vi.mock("../../services/api/privacyApi.js", () => ({
    privacyApi: mocks,
}));

describe("PrivacyExportPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            value: vi.fn(() => "blob:faithflix-export"),
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            value: vi.fn(),
        });
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    });

    it("serializa a exportação, propaga o sinal e cria o ficheiro local", async () => {
        let resolveExport;
        mocks.exportMyData.mockReturnValue(
            new Promise((resolve) => {
                resolveExport = resolve;
            }),
        );
        const user = userEvent.setup();

        render(<PrivacyExportPanel />);
        const button = screen.getByRole("button", { name: "Descarregar dados" });
        await user.click(button);

        expect(
            screen.getByRole("button", { name: "A preparar..." }),
        ).toBeDisabled();
        expect(mocks.exportMyData).toHaveBeenCalledOnce();
        expect(mocks.exportMyData).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal),
        });

        resolveExport({ export: { user: { id: "user-1" } } });

        expect(await screen.findByRole("status")).toHaveTextContent(
            "Exportação preparada.",
        );
        expect(URL.createObjectURL).toHaveBeenCalledOnce();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(
            "blob:faithflix-export",
        );
    });

    it("apresenta erro seguro e permite repetir a operação", async () => {
        mocks.exportMyData
            .mockRejectedValueOnce(
                new ApiError({
                    status: 503,
                    message: "Exportação temporariamente indisponível.",
                }),
            )
            .mockResolvedValueOnce({ export: { user: null } });
        const user = userEvent.setup();

        render(<PrivacyExportPanel />);
        await user.click(
            screen.getByRole("button", { name: "Descarregar dados" }),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Exportação temporariamente indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Descarregar dados" }),
        );

        await waitFor(() => {
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
        expect(await screen.findByRole("status")).toHaveTextContent(
            "Exportação preparada.",
        );
        expect(mocks.exportMyData).toHaveBeenCalledTimes(2);
    });

    it("aborta a exportação pendente ao desmontar", async () => {
        mocks.exportMyData.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        const view = render(<PrivacyExportPanel />);

        await user.click(
            screen.getByRole("button", { name: "Descarregar dados" }),
        );
        const signal = mocks.exportMyData.mock.calls[0][0].signal;

        view.unmount();
        expect(signal.aborted).toBe(true);
    });
});
