/**
 * @file Testes comportamentais dos consentimentos canceláveis e reversíveis.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../services/api/apiErrors.js";
import { PrivacyConsentsPanel } from "./PrivacyConsentsPanel.jsx";

const mocks = vi.hoisted(() => ({
    getMyConsents: vi.fn(),
    updateMyConsents: vi.fn(),
}));

vi.mock("../../services/api/privacyApi.js", () => ({
    privacyApi: mocks,
}));

const confirmedState = {
    personalizedRecommendations: false,
    operationalNotifications: true,
    anonymousMetrics: false,
};

/**
 * Cria a resposta autoritativa usada pelos testes.
 *
 * @param {Record<string, boolean>} consents Consentimentos confirmados.
 * @returns {Record<string, unknown>} Envelope da API.
 */
function consentResponse(consents = confirmedState) {
    return {
        consentState: {
            consents,
            updatedAt: "2026-07-10T01:00:00.000Z",
        },
    };
}

describe("PrivacyConsentsPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getMyConsents.mockResolvedValue(consentResponse());
        mocks.updateMyConsents.mockResolvedValue(consentResponse());
    });

    it("carrega com sinal cancelável e aborta a leitura ao desmontar", async () => {
        mocks.getMyConsents.mockReturnValue(new Promise(() => {}));

        const view = render(<PrivacyConsentsPanel />);
        const signal = mocks.getMyConsents.mock.calls[0][0].signal;

        expect(signal).toBeInstanceOf(AbortSignal);
        view.unmount();
        expect(signal.aborted).toBe(true);
    });

    it("permite repetir uma leitura falhada com mensagem segura", async () => {
        mocks.getMyConsents
            .mockRejectedValueOnce(
                new ApiError({
                    status: 503,
                    message: "Consentimentos temporariamente indisponíveis.",
                }),
            )
            .mockResolvedValueOnce(consentResponse());
        const user = userEvent.setup();

        render(<PrivacyConsentsPanel />);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Consentimentos temporariamente indisponíveis.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(
            await screen.findByLabelText("Recomendações personalizadas"),
        ).not.toBeChecked();
        expect(mocks.getMyConsents).toHaveBeenCalledTimes(2);
    });

    it("reverte para o último estado confirmado quando a escrita falha", async () => {
        let rejectUpdate;
        mocks.updateMyConsents.mockReturnValue(
            new Promise((resolve, reject) => {
                rejectUpdate = reject;
            }),
        );
        const user = userEvent.setup();

        render(<PrivacyConsentsPanel />);

        const checkbox = await screen.findByLabelText(
            "Recomendações personalizadas",
        );
        await user.click(checkbox);
        expect(checkbox).toBeChecked();

        const submit = screen.getByRole("button", {
            name: "Guardar consentimentos",
        });
        await user.click(submit);

        expect(
            screen.getByRole("button", { name: "A guardar..." }),
        ).toBeDisabled();
        expect(mocks.updateMyConsents).toHaveBeenCalledOnce();
        expect(mocks.updateMyConsents).toHaveBeenCalledWith(
            {
                ...confirmedState,
                personalizedRecommendations: true,
            },
            { signal: expect.any(AbortSignal) },
        );

        rejectUpdate(
            new ApiError({
                status: 503,
                message: "Não foi possível guardar os consentimentos.",
            }),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Não foi possível guardar os consentimentos.",
        );
        await waitFor(() => expect(checkbox).not.toBeChecked());
    });

    it("aborta a escrita pendente ao desmontar", async () => {
        mocks.updateMyConsents.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        const view = render(<PrivacyConsentsPanel />);

        await user.click(
            await screen.findByLabelText("Partilha de utilização anónima"),
        );
        await user.click(
            screen.getByRole("button", { name: "Guardar consentimentos" }),
        );
        const signal = mocks.updateMyConsents.mock.calls[0][1].signal;

        view.unmount();
        expect(signal.aborted).toBe(true);
    });
});
