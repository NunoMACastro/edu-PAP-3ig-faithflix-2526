/**
 * @file Cliente API para integracoes administrativas.
 */

import { apiClient } from "./apiClient.js";

export const integrationsApi = {
    /**
     * Lista integracoes configuraveis.
     *
     * @returns {Promise<unknown>} Lista de integracoes.
     */
    listIntegrations(options = {}) {
        return apiClient.get("/api/admin/integrations", options);
    },

    /**
     * Atualiza estado publico de uma integracao.
     *
     * @param {string} key Chave da integracao.
     * @param {{ enabled: boolean, mode: string, publicConfig?: Record<string, string> }} input Configuracao publica.
     * @returns {Promise<unknown>} Integracao atualizada.
     */
    updateIntegration(key, input, options = {}) {
        return apiClient.patch(
            `/api/admin/integrations/${encodeURIComponent(key)}`,
            input,
            options,
        );
    },
};
