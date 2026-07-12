/**
 * @file Ficheiro `real_dev/frontend/src/services/api/ratingsApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const ratingsApi = {
    /**
     * Obtém o resumo público de avaliações de um conteúdo.
     *
     * O identificador é codificado no URL para pedir ao backend a média, total e
     * distribuição agregada sem expor avaliações individuais.
     *
     * @param {string} contentId Identificador do conteúdo avaliado.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Resumo de avaliações devolvido pela API.
     */
    getSummary(contentId, options) {
        return apiClient.get(
            `/api/ratings/${encodeURIComponent(contentId)}/summary`,
            options,
        );
    },
    /**
     * Obtém a avaliação do utilizador autenticado para um conteúdo.
     *
     * A sessão é enviada por cookie HttpOnly pelo `apiClient`, por isso a função
     * só precisa do identificador do conteúdo.
     *
     * @param {string} contentId Identificador do conteúdo avaliado.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Avaliação pessoal devolvida pela API.
     */
    getMine(contentId, options) {
        return apiClient.get(
            `/api/ratings/${encodeURIComponent(contentId)}/me`,
            options,
        );
    },
    /**
     * Guarda ou atualiza a avaliação do utilizador autenticado.
     *
     * O valor é enviado no corpo do pedido, enquanto o conteúdo avaliado segue no
     * URL para o backend aplicar autorização e validação de domínio.
     *
     * @param {string} contentId Identificador do conteúdo avaliado.
     * @param {number} value Valor da avaliação escolhido na interface.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Avaliação persistida devolvida pela API.
     */
    save(contentId, value, options) {
        return apiClient.put(
            `/api/ratings/${encodeURIComponent(contentId)}`,
            { value },
            options,
        );
    },
    /**
     * Remove a avaliação do utilizador autenticado para um conteúdo.
     *
     * A função apenas indica o conteúdo alvo; o backend usa a sessão para saber
     * qual avaliação pessoal deve ser removida.
     *
     * @param {string} contentId Identificador do conteúdo avaliado.
     * @param {RequestInit} [options] Opções de transporte, incluindo cancelamento.
     * @returns {Promise<unknown>} Resultado da remoção devolvido pela API.
     */
    remove(contentId, options) {
        return apiClient.del(
            `/api/ratings/${encodeURIComponent(contentId)}`,
            options,
        );
    },
};
