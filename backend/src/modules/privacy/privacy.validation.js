// apps/backend/src/modules/privacy/privacy.validation.js
import { HttpError } from "../../utils/http-error.js";

export const DELETE_ACCOUNT_CONFIRMATION = "ELIMINAR CONTA";

/**
 * Valida o pedido de eliminação da própria conta.
 *
 * @param {{ confirmation?: unknown }} input Dados recebidos do frontend.
 * @returns {{ confirmation: string }} Dados normalizados para o service.
 * @throws {HttpError} Quando a confirmação não corresponde ao contrato.
 */
export function assertDeleteAccountPayload(input) {
    const confirmation = String(input?.confirmation ?? "").trim();

    if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
        throw new HttpError(
            400,
            "Escreve ELIMINAR CONTA para confirmar a eliminação.",
        );
    }

    return { confirmation };
}

export const CONSENT_VERSION = "faithflix-privacy-v1";

export const DEFAULT_CONSENTS = {
    personalizedRecommendations: false,
    operationalNotifications: true,
    anonymousMetrics: false,
};

/**
 * Valida uma opção booleana de consentimento.
 *
 * @param {Record<string, unknown>} input Dados recebidos.
 * @param {string} key Nome da categoria.
 * @returns {boolean} Valor booleano validado.
 * @throws {HttpError} Quando o valor não é booleano.
 */
function assertConsentBoolean(input, key) {
    if (typeof input?.[key] !== "boolean") {
        throw new HttpError(400, `${key} deve ser verdadeiro ou falso.`);
    }

    return input[key];
}

/**
 * Valida as escolhas opcionais de consentimento.
 *
 * @param {Record<string, unknown>} input Dados recebidos do frontend.
 * @returns {{ personalizedRecommendations: boolean, operationalNotifications: boolean, anonymousMetrics: boolean }} Consentimentos persistíveis.
 */
export function assertConsentPayload(input) {
    return {
        personalizedRecommendations: assertConsentBoolean(
            input,
            "personalizedRecommendations",
        ),
        operationalNotifications: assertConsentBoolean(
            input,
            "operationalNotifications",
        ),
        anonymousMetrics: assertConsentBoolean(input, "anonymousMetrics"),
    };
}