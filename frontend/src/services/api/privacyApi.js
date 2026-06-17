// real_dev/frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData() {
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
};