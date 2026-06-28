/**
 * @file Ficheiro `real_dev/frontend/src/services/api/discoveryApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const discoveryApi = {
    /**
     * Documenta `home`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `home`.
     */
    home() {
        return apiClient.get("/api/discovery/home");
    },
    /**
     * Documenta `related`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `related`.
     * @returns {unknown} Resultado devolvido por `related`.
     */
    related(contentId) {
        return apiClient.get(
            `/api/discovery/related/${encodeURIComponent(contentId)}`,
        );
    },
};
