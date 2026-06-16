/**
 * @file Ficheiro `real_dev/frontend/src/services/api/commentsApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const commentsApi = {
    /**
     * Documenta `list`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `list`.
     * @returns {unknown} Resultado devolvido por `list`.
     */
    list(contentId) {
        return apiClient.get(`/api/comments/${encodeURIComponent(contentId)}`);
    },
    /**
     * Documenta `create`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `create`.
     * @param {unknown} body Valor recebido por `create`.
     * @returns {unknown} Resultado devolvido por `create`.
     */
    create(contentId, body) {
        return apiClient.post(
            `/api/comments/${encodeURIComponent(contentId)}`,
            { body },
        );
    },
    /**
     * Documenta `remove`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} commentId Valor recebido por `remove`.
     * @returns {unknown} Resultado devolvido por `remove`.
     */
    remove(commentId) {
        return apiClient.del(`/api/comments/${encodeURIComponent(commentId)}`);
    },
    /**
     * Documenta `moderate`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} commentId Valor recebido por `moderate`.
     * @param {unknown} input Valor recebido por `moderate`.
     * @returns {unknown} Resultado devolvido por `moderate`.
     */
    moderate(commentId, input) {
        return apiClient.patch(
            `/api/comments/${encodeURIComponent(commentId)}/moderation`,
            input,
        );
    },
};
