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
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Lista de comentários devolvida pela API.
     */
    list(contentId, options) {
        return apiClient.get(
            `/api/comments/${encodeURIComponent(contentId)}`,
            options,
        );
    },
    /**
     * Cria um novo comentário no conteúdo indicado.
     *
     * O texto é enviado no corpo do pedido e a API associa o autor a partir da
     * sessão autenticada.
     *
     * @param {string} contentId Identificador do conteúdo comentado.
     * @param {string} body Texto escrito pelo utilizador.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Comentário criado devolvido pela API.
     */
    create(contentId, body, options) {
        return apiClient.post(
            `/api/comments/${encodeURIComponent(contentId)}`,
            { body },
            options,
        );
    },
    /**
     * Remove um comentário pelo seu identificador.
     *
     * A API valida se a sessão atual pode apagar o comentário antes de executar
     * a operação.
     *
     * @param {string} commentId Identificador do comentário.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Resultado da remoção devolvido pela API.
     */
    remove(commentId, options) {
        return apiClient.del(
            `/api/comments/${encodeURIComponent(commentId)}`,
            options,
        );
    },
    /**
     * Atualiza o estado de moderação de um comentário.
     *
     * O payload contém a decisão administrativa e a API aplica as regras de
     * autorização antes de alterar a visibilidade do comentário.
     *
     * @param {string} commentId Identificador do comentário moderado.
     * @param {Record<string, unknown>} input Decisão ou dados de moderação.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Comentário moderado devolvido pela API.
     */
    moderate(commentId, input, options) {
        return apiClient.patch(
            `/api/comments/${encodeURIComponent(commentId)}/moderation`,
            input,
            options,
        );
    },
};
