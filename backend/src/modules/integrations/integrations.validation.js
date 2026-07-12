/**
 * @file Contrato fechado das integrações locais configuráveis.
 *
 * As integrações desta baseline são controlos operacionais, não cofres de
 * segredos nem adaptadores genéricos. Cada chave tem modos e configuração
 * pública próprios para impedir combinações ambíguas ou dados legacy livres.
 */

import { HttpError } from "../../utils/http-error.js";

export const INTEGRATION_DEFINITIONS = Object.freeze({
    internal_notifications: Object.freeze({
        label: "Notificações na aplicação",
        envVars: Object.freeze([]),
        defaultMode: "internal",
        allowedModes: Object.freeze(["internal", "disabled"]),
        defaultPublicConfig: Object.freeze({ channel: "in_app" }),
    }),
    simulated_payments: Object.freeze({
        label: "Pagamentos",
        envVars: Object.freeze(["PAYMENT_SIMULATION_MODE"]),
        defaultMode: "simulation",
        allowedModes: Object.freeze(["simulation", "disabled"]),
        defaultPublicConfig: Object.freeze({}),
    }),
    aggregate_analytics_export: Object.freeze({
        label: "Exportação de métricas",
        envVars: Object.freeze(["ANALYTICS_EXPORT_PATH"]),
        defaultMode: "manual",
        allowedModes: Object.freeze(["manual", "disabled"]),
        defaultPublicConfig: Object.freeze({}),
    }),
});

export const INTEGRATION_KEYS = Object.freeze(
    Object.keys(INTEGRATION_DEFINITIONS),
);

const UPDATE_FIELDS = new Set(["enabled", "mode", "publicConfig"]);
const PERSISTED_FIELDS = new Set([
    "_id",
    "key",
    "enabled",
    "mode",
    "publicConfig",
    "updatedBy",
    "updatedAt",
    "createdAt",
]);

/**
 * Confirma que um valor é um objeto simples de dados.
 *
 * @param {unknown} value Valor recebido.
 * @returns {value is Record<string, unknown>} Verdadeiro para objeto simples.
 */
function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

/**
 * Recusa campos fora de uma allowlist fechada.
 *
 * @param {Record<string, unknown>} input Objeto a verificar.
 * @param {Set<string>} allowed Campos permitidos.
 * @param {string} message Mensagem pública.
 * @returns {void}
 * @throws {HttpError} Quando existe um campo inesperado.
 */
function assertOnlyFields(input, allowed, message) {
    if (Object.keys(input).some((field) => !allowed.has(field))) {
        throw new HttpError(
            400,
            message,
            undefined,
            "INTEGRATION_PAYLOAD_INVALID",
        );
    }
}

/**
 * Valida a chave de integração recebida por parâmetro.
 *
 * @param {unknown} key Chave recebida.
 * @returns {keyof typeof INTEGRATION_DEFINITIONS} Chave validada.
 * @throws {HttpError} Quando a integração não existe.
 */
export function assertIntegrationKey(key) {
    if (typeof key !== "string") {
        throw new HttpError(
            400,
            "Chave de integracao invalida.",
            undefined,
            "INTEGRATION_KEY_INVALID",
        );
    }

    const value = typeof key === "string" ? key.trim() : "";

    if (!Object.hasOwn(INTEGRATION_DEFINITIONS, value)) {
        throw new HttpError(
            404,
            "Integracao nao encontrada.",
            undefined,
            "INTEGRATION_NOT_FOUND",
        );
    }

    return value;
}

/**
 * Valida a configuração pública específica de uma integração.
 *
 * `internal_notifications` expõe apenas o canal fixo `in_app`. As restantes
 * integrações não aceitam quaisquer campos de configuração pública.
 *
 * @param {keyof typeof INTEGRATION_DEFINITIONS} key Chave validada.
 * @param {unknown} value Configuração recebida.
 * @returns {Record<string, string>} Configuração canónica.
 * @throws {HttpError} Quando a configuração não pertence ao contrato.
 */
function assertPublicConfig(key, value) {
    if (value === undefined) {
        value = {};
    }

    if (!isPlainObject(value)) {
        throw new HttpError(
            400,
            "Configuração pública inválida.",
            undefined,
            "INTEGRATION_PUBLIC_CONFIG_INVALID",
        );
    }

    if (key === "internal_notifications") {
        assertOnlyFields(
            value,
            new Set(["channel"]),
            "Configuração pública inválida.",
        );
        if (value.channel !== undefined && value.channel !== "in_app") {
            throw new HttpError(
                400,
                "O canal de notificações internas tem de ser in_app.",
                undefined,
                "INTEGRATION_PUBLIC_CONFIG_INVALID",
            );
        }

        return { channel: "in_app" };
    }

    if (Object.keys(value).length > 0) {
        throw new HttpError(
            400,
            "Esta integração não aceita configuração pública.",
            undefined,
            "INTEGRATION_PUBLIC_CONFIG_INVALID",
        );
    }

    return {};
}

/**
 * Valida uma atualização administrativa para a chave selecionada.
 *
 * @param {unknown} keyInput Chave da integração.
 * @param {unknown} input Corpo recebido.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Atualização segura.
 * @throws {HttpError} Quando o corpo, modo ou configuração são inválidos.
 */
export function assertIntegrationUpdate(keyInput, input) {
    const key = assertIntegrationKey(keyInput);
    if (!isPlainObject(input)) {
        throw new HttpError(
            400,
            "Atualização de integração inválida.",
            undefined,
            "INTEGRATION_PAYLOAD_INVALID",
        );
    }

    assertOnlyFields(
        input,
        UPDATE_FIELDS,
        "Atualização de integração contém campos desconhecidos.",
    );

    if (typeof input.enabled !== "boolean") {
        throw new HttpError(
            400,
            "enabled deve ser verdadeiro ou falso.",
            undefined,
            "INTEGRATION_PAYLOAD_INVALID",
        );
    }

    const mode = typeof input.mode === "string" ? input.mode.trim() : "";
    if (!INTEGRATION_DEFINITIONS[key].allowedModes.includes(mode)) {
        throw new HttpError(
            400,
            "Modo de integração inválido.",
            undefined,
            "INTEGRATION_MODE_INVALID",
        );
    }

    return {
        enabled: input.enabled,
        mode,
        publicConfig: assertPublicConfig(key, input.publicConfig),
    };
}

/**
 * Revalida um documento persistido antes de este influenciar a aplicação.
 *
 * Metadados MongoDB conhecidos são aceites, mas qualquer campo de domínio
 * inesperado faz a configuração legacy falhar fechada no service.
 *
 * @param {unknown} keyInput Chave esperada.
 * @param {unknown} document Documento de `integration_settings`.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Estado validado.
 * @throws {HttpError} Quando o documento não respeita o contrato atual.
 */
export function assertPersistedIntegration(keyInput, document) {
    const key = assertIntegrationKey(keyInput);
    if (!isPlainObject(document) || document.key !== key) {
        throw new HttpError(
            500,
            "Configuração de integração inválida.",
            undefined,
            "INTEGRATION_CONFIGURATION_INVALID",
        );
    }

    try {
        assertOnlyFields(
            document,
            PERSISTED_FIELDS,
            "Configuração de integração inválida.",
        );
        return assertIntegrationUpdate(key, {
            enabled: document.enabled,
            mode: document.mode,
            publicConfig: document.publicConfig,
        });
    } catch (error) {
        if (error instanceof HttpError) {
            throw new HttpError(
                500,
                "Configuração de integração inválida.",
                undefined,
                "INTEGRATION_CONFIGURATION_INVALID",
            );
        }
        throw error;
    }
}
