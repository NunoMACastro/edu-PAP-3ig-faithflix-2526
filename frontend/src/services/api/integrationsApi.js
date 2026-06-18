// apps/frontend/src/services/api/integrationsApi.js
import { apiClient } from "./apiClient.js";

export const integrationsApi = {
    /**
     * Lista integrações configuráveis pelo admin.
     *
     * @returns {Promise<{ integrations: Record<string, unknown>[] }>} Lista de integrações.
     */
    listIntegrations() {
        return apiClient.get("/api/admin/integrations");
    },

    /**
     * Atualiza uma integração.
     *
     * @param {string} key Chave da integração.
     * @param {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} input Dados públicos.
     * @returns {Promise<{ integration: Record<string, unknown> }>} Integração atualizada.
     */
    updateIntegration(key, input) {
        return apiClient.patch(
            `/api/admin/integrations/${encodeURIComponent(key)}`,
            input,
        );
    },
};