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

    /**
     * Guarda feedback explícito sobre um conteúdo recomendado.
     *
     * @param {{ contentId: string, action: string }} input Feedback do utilizador.
     * @returns {Promise<unknown>} Feedback guardado.
     */
    feedback(input) {
        return apiClient.post("/api/recommendations/feedback", input);
    },

    /**
     * Regista eventos agregados de visualização ou clique em recomendações.
     *
     * @param {{ events: Array<{ eventType: string, contentId: string, groupId: string, reasonCode: string }> }} input Eventos agregados.
     * @returns {Promise<unknown>} Resultado do registo.
     */
    events(input) {
        return apiClient.post("/api/recommendations/events", input);
    },
};
