/**
 * @file Cliente API para operacoes de privacidade MF5.
 */

import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede a exportacao JSON dos dados do utilizador autenticado.
     *
     * @returns {Promise<unknown>} Exportacao devolvida pelo backend.
     */
    exportMyData() {
        return apiClient.get("/api/privacy/export");
    },

    /**
     * Elimina a propria conta com confirmacao textual forte.
     *
     * @param {{ confirmation: string }} input Confirmacao recebida da UI.
     * @returns {Promise<unknown>} Resultado da eliminacao.
     */
    deleteMyAccount(input) {
        return apiClient.del("/api/privacy/account", { body: input });
    },

    /**
     * Lê consentimentos atuais do utilizador autenticado.
     *
     * @returns {Promise<unknown>} Estado de consentimentos.
     */
    getMyConsents() {
        return apiClient.get("/api/privacy/consents");
    },

    /**
     * Atualiza consentimentos opcionais.
     *
     * @param {Record<string, boolean>} input Escolhas de consentimento.
     * @returns {Promise<unknown>} Estado atualizado.
     */
    updateMyConsents(input) {
        return apiClient.put("/api/privacy/consents", input);
    },
};
