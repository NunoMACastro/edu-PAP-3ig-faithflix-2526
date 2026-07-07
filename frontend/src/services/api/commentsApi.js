/**
 * @file Ficheiro `real_dev/frontend/src/services/api/commentsApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const commentsApi = {
    /**
     * Lista comentários visíveis de um conteúdo.
     *
     * O identificador do conteúdo segue no URL para a API devolver apenas a
     * conversa associada a esse item do catálogo.
     *
     * @param {string} contentId Identificador do conteúdo comentado.
     * @returns {Promise<unknown>} Lista de comentários devolvida pela API.
     */
    list(contentId) {
        return apiClient.get(`/api/comments/${encodeURIComponent(contentId)}`);
    },
    /**
     * Cria um novo comentário no conteúdo indicado.
     *
     * O texto é enviado no corpo do pedido e a API associa o autor a partir da
     * sessão autenticada.
     *
     * @param {string} contentId Identificador do conteúdo comentado.
     * @param {string} body Texto escrito pelo utilizador.
     * @returns {Promise<unknown>} Comentário criado devolvido pela API.
     */
    create(contentId, body) {
        return apiClient.post(
            `/api/comments/${encodeURIComponent(contentId)}`,
            { body },
        );
    },
    /**
     * Remove um comentário pelo seu identificador.
     *
     * A API valida se a sessão atual pode apagar o comentário antes de executar
     * a operação.
     *
     * @param {string} commentId Identificador do comentário.
     * @returns {Promise<unknown>} Resultado da remoção devolvido pela API.
     */
    remove(commentId) {
        return apiClient.del(`/api/comments/${encodeURIComponent(commentId)}`);
    },
    /**
     * Atualiza o estado de moderação de um comentário.
     *
     * O payload contém a decisão administrativa e a API aplica as regras de
     * autorização antes de alterar a visibilidade do comentário.
     *
     * @param {string} commentId Identificador do comentário moderado.
     * @param {Record<string, unknown>} input Decisão ou dados de moderação.
     * @returns {Promise<unknown>} Comentário moderado devolvido pela API.
     */
    moderate(commentId, input) {
        return apiClient.patch(
            `/api/comments/${encodeURIComponent(commentId)}/moderation`,
            input,
        );
    },
};
