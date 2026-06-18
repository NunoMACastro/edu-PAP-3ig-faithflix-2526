// apps/backend/src/modules/integrations/integrations.validation.js
import { HttpError } from "../../utils/http-error.js";

export const INTEGRATION_DEFINITIONS = {
    internal_notifications: {
        label: "Notificações internas",
        envVars: [],
        defaultMode: "internal",
    },
    simulated_payments: {
        label: "Pagamentos simulados",
        envVars: ["PAYMENT_SIMULATION_MODE"],
        defaultMode: "simulation",
    },
    aggregate_analytics_export: {
        label: "Exportação analítica agregada",
        envVars: ["ANALYTICS_EXPORT_PATH"],
        defaultMode: "manual",
    },
};

export const INTEGRATION_MODES = ["internal", "simulation", "manual", "disabled"];

/**
 * Valida a chave de integração recebida por parâmetro.
 *
 * @param {string} key Chave da integração.
 * @returns {keyof typeof INTEGRATION_DEFINITIONS} Chave validada.
 * @throws {HttpError} Quando a chave não existe.
 */
export function assertIntegrationKey(key) {
    const value = String(key ?? "").trim();

    if (!Object.hasOwn(INTEGRATION_DEFINITIONS, value)) {
        throw new HttpError(404, "Integração não encontrada.");
    }

    return value;
}

/**
 * Valida configuração pública de uma integração.
 *
 * @param {unknown} value Valor recebido.
 * @returns {Record<string, string>} Configuração pública validada.
 */
function assertPublicConfig(value) {
    if (value === undefined) return {};

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new HttpError(400, "Configuração pública inválida.");
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, raw]) => [
            String(key).trim(),
            String(raw ?? "").trim(),
        ]),
    );
}

/**
 * Valida atualização administrativa de uma integração.
 *
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Atualização segura.
 */
export function assertIntegrationUpdate(input) {
    if (typeof input?.enabled !== "boolean") {
        throw new HttpError(400, "enabled deve ser verdadeiro ou falso.");
    }

    const mode = String(input?.mode ?? "").trim();

    if (!INTEGRATION_MODES.includes(mode)) {
        throw new HttpError(400, "Modo de integração inválido.");
    }

    return {
        enabled: input.enabled,
        mode,
        publicConfig: assertPublicConfig(input.publicConfig),
    };
}