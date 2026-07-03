/**
 * @file Ficheiro `real_dev/frontend/src/services/api/ratingsApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const ratingsApi = {
    /**
     * Documenta `getSummary`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `getSummary`.
     * @returns {unknown} Resultado devolvido por `getSummary`.
     */
    getSummary(contentId) {
        return apiClient.get(
            `/api/ratings/${encodeURIComponent(contentId)}/summary`,
        );
    },
    /**
     * Documenta `getMine`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `getMine`.
     * @returns {unknown} Resultado devolvido por `getMine`.
     */
    getMine(contentId) {
        return apiClient.get(
            `/api/ratings/${encodeURIComponent(contentId)}/me`,
        );
    },
    /**
     * Documenta `save`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `save`.
     * @param {unknown} value Valor recebido por `save`.
     * @returns {unknown} Resultado devolvido por `save`.
     */
    save(contentId, value) {
        return apiClient.put(`/api/ratings/${encodeURIComponent(contentId)}`, {
            value,
        });
    },
    /**
     * Documenta `remove`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `remove`.
     * @returns {unknown} Resultado devolvido por `remove`.
     */
    remove(contentId) {
        return apiClient.del(`/api/ratings/${encodeURIComponent(contentId)}`);
    },
};
