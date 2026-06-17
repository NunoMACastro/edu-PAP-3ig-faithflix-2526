// apps/frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData() {
        // O apiClient centraliza cookies de sessão e tratamento de erro para evitar fetch solto.
        return apiClient.get("/api/privacy/export");
    },

    /**
     * Pede a eliminação da própria conta.
     *
     * @param {{ confirmation: string }} input Confirmação textual.
     * @returns {Promise<{ deleted: boolean }>} Resultado da eliminação.
     */
    deleteMyAccount(input) {
        return apiClient.del("/api/privacy/account", { body: input });
    },

    /**
     * Lê os consentimentos atuais do utilizador autenticado.
     *
     * @returns {Promise<{ consentState: Record<string, unknown> }>} Estado atual de consentimento.
     */
    getMyConsents() {
        return apiClient.get("/api/privacy/consents");
    },

    /**
     * Atualiza consentimentos opcionais do utilizador autenticado.
     *
     * @param {{ personalizedRecommendations: boolean, operationalNotifications: boolean, anonymousMetrics: boolean }} input Consentimentos escolhidos.
     * @returns {Promise<{ consentState: Record<string, unknown> }>} Estado persistido.
     */
    updateMyConsents(input) {
        // O frontend envia apenas booleanos de consentimento; o userId continua a vir da sessão.
        return apiClient.put("/api/privacy/consents", input);
    },
};