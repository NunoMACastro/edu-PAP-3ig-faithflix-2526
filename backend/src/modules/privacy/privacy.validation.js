/**
 * @file Validadores do modulo de privacidade da MF5.
 */

import { HttpError } from "../../utils/http-error.js";

export const DELETE_ACCOUNT_CONFIRMATION = "ELIMINAR CONTA";
export const CONSENT_VERSION = "faithflix-privacy-v1";

export const DEFAULT_CONSENTS = {
    personalizedRecommendations: false,
    operationalNotifications: true,
    anonymousMetrics: false,
};

/**
 * Valida o pedido destrutivo de eliminacao da propria conta.
 *
 * @param {{ confirmation?: unknown }} input Dados recebidos do frontend.
 * @returns {{ confirmation: string }} Dados normalizados.
 * @throws {HttpError} Quando a confirmacao nao corresponde ao contrato.
 */
export function assertDeleteAccountPayload(input = {}) {
    const confirmation = String(input.confirmation ?? "").trim();

    if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
        throw new HttpError(
            400,
            "Escreve ELIMINAR CONTA para confirmar a eliminacao.",
        );
    }

    return { confirmation };
}

/**
 * Valida que uma categoria de consentimento chegou como booleano real.
 *
 * @param {Record<string, unknown>} input Dados recebidos.
 * @param {keyof typeof DEFAULT_CONSENTS} key Categoria esperada.
 * @returns {boolean} Valor validado.
 * @throws {HttpError} Quando o valor nao e booleano.
 */
function assertConsentBoolean(input, key) {
    if (typeof input?.[key] !== "boolean") {
        throw new HttpError(400, `${key} deve ser verdadeiro ou falso.`);
    }

    return input[key];
}

/**
 * Valida as escolhas opcionais de consentimento do utilizador autenticado.
 *
 * @param {Record<string, unknown>} input Dados recebidos do frontend.
 * @returns {typeof DEFAULT_CONSENTS} Consentimentos persistiveis.
 */
export function assertConsentPayload(input = {}) {
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
