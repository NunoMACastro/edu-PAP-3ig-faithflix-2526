/**
 * @file Validadores de configuracao de integracoes admin.
 */

import { HttpError } from "../../utils/http-error.js";

export const INTEGRATION_DEFINITIONS = {
    internal_notifications: {
        label: "Notificacoes internas",
        envVars: [],
        defaultMode: "internal",
    },
    simulated_payments: {
        label: "Pagamentos simulados",
        envVars: ["PAYMENT_SIMULATION_MODE"],
        defaultMode: "simulation",
    },
    aggregate_analytics_export: {
        label: "Exportacao analitica agregada",
        envVars: ["ANALYTICS_EXPORT_PATH"],
        defaultMode: "manual",
    },
};

export const INTEGRATION_MODES = [
    "internal",
    "simulation",
    "manual",
    "disabled",
];

const SENSITIVE_PUBLIC_CONFIG_KEY_PATTERN =
    /(?:api[_-]?key|secret|token|password|credential|private[_-]?key)/i;
const SENSITIVE_PUBLIC_CONFIG_VALUE_PATTERN =
    /(?:bearer\s+|mongodb(?:\+srv)?:\/\/|sk_(?:live|test)_)/i;
const PUBLIC_CONFIG_KEY_PATTERN = /^[a-z][a-z0-9_.-]{0,59}$/i;
const MAX_PUBLIC_CONFIG_KEYS = 20;
const MAX_PUBLIC_CONFIG_VALUE_LENGTH = 500;

/**
 * Valida a chave de integracao recebida por parametro.
 *
 * @param {unknown} key Chave recebida.
 * @returns {keyof typeof INTEGRATION_DEFINITIONS} Chave validada.
 * @throws {HttpError} Quando a integracao nao existe.
 */
export function assertIntegrationKey(key) {
    const value = String(key ?? "").trim();

    if (!Object.hasOwn(INTEGRATION_DEFINITIONS, value)) {
        throw new HttpError(404, "Integracao nao encontrada.");
    }

    return value;
}

/**
 * Valida configuracao publica sem permitir objetos livres perigosos.
 *
 * @param {unknown} value Valor recebido.
 * @returns {Record<string, string>} Configuracao publica normalizada.
 * @throws {HttpError} Quando a configuracao nao e objeto simples.
 */
function assertPublicConfig(value) {
    if (value === undefined) {
        return {};
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new HttpError(400, "Configuracao publica invalida.");
    }

    const entries = Object.entries(value);

    if (entries.length > MAX_PUBLIC_CONFIG_KEYS) {
        throw new HttpError(400, "Configuracao publica demasiado extensa.");
    }

    return Object.fromEntries(
        entries.map(([key, raw]) => {
            const normalizedKey = String(key).trim();

            if (!PUBLIC_CONFIG_KEY_PATTERN.test(normalizedKey)) {
                throw new HttpError(400, "Chave de configuracao publica invalida.");
            }

            if (typeof raw !== "string") {
                throw new HttpError(400, "Valor de configuracao publica invalido.");
            }

            const normalizedValue = raw.trim();

            if (normalizedValue.length > MAX_PUBLIC_CONFIG_VALUE_LENGTH) {
                throw new HttpError(400, "Valor de configuracao publica demasiado longo.");
            }

            if (
                SENSITIVE_PUBLIC_CONFIG_KEY_PATTERN.test(normalizedKey) ||
                SENSITIVE_PUBLIC_CONFIG_VALUE_PATTERN.test(normalizedValue)
            ) {
                throw new HttpError(
                    400,
                    "Configuracao publica nao pode guardar segredos.",
                );
            }

            return [normalizedKey, normalizedValue];
        }),
    );
}

/**
 * Valida atualizacao administrativa de uma integracao.
 *
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Atualizacao segura.
 */
export function assertIntegrationUpdate(input = {}) {
    if (typeof input.enabled !== "boolean") {
        throw new HttpError(400, "enabled deve ser verdadeiro ou falso.");
    }

    const mode = String(input.mode ?? "").trim();

    if (!INTEGRATION_MODES.includes(mode)) {
        throw new HttpError(400, "Modo de integracao invalido.");
    }

    return {
        enabled: input.enabled,
        mode,
        publicConfig: assertPublicConfig(input.publicConfig),
    };
}
