/**
 * @file Cliente API frontend para operacoes de recommendationsApi.
 */

import { apiClient } from "./apiClient.js";

export const recommendationsApi = {
        /**
     * Obtém recomendações do utilizador autenticado através do cliente API central.
     *
     * @returns {Promise<unknown>} Dados devolvidos pelo backend.
     */
mine() {
        return apiClient.get("/api/recommendations/me");
    },
};
