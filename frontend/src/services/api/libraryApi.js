/**
 * @file Ficheiro `real_dev/frontend/src/services/api/libraryApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

/**
 * Constrói a query de uma lista pessoal sem aceitar limites ilimitados.
 *
 * @param {{ page?: number, limit?: number }} pagination Paginação pedida pela UI.
 * @returns {string} Query string, incluindo `?` quando necessário.
 */
function buildPagination(pagination = {}) {
    const params = new URLSearchParams();

    if (pagination.page) params.set("page", String(pagination.page));
    if (pagination.limit) params.set("limit", String(pagination.limit));

    const query = params.toString();
    return query ? `?${query}` : "";
}

export const libraryApi = {
    /**
     * Lista os favoritos da conta autenticada.
     *
     * A função não recebe argumentos porque o backend identifica o utilizador a
     * partir da sessão enviada pelo `apiClient`.
     *
     * @returns {Promise<unknown>} Lista de conteúdos favoritos devolvida pela API.
     */
    listFavorites(pagination = {}, options = {}) {
        return apiClient.get(
            `/api/me/favorites${buildPagination(pagination)}`,
            options,
        );
    },
    /**
     * Adiciona um conteúdo à lista de favoritos do utilizador.
     *
     * O identificador segue no URL para a API associar o conteúdo à biblioteca da
     * sessão atual.
     *
     * @param {string} contentId Identificador do conteúdo a marcar como favorito.
     * @returns {Promise<unknown>} Favorito criado ou estado atualizado devolvido pela API.
     */
    addFavorite(contentId, options = {}) {
        return apiClient.put(
            `/api/me/favorites/${encodeURIComponent(contentId)}`,
            undefined,
            options,
        );
    },
    /**
     * Remove um conteúdo da lista de favoritos do utilizador.
     *
     * A remoção é feita por identificador de conteúdo, mantendo a decisão de
     * autorização no backend.
     *
     * @param {string} contentId Identificador do conteúdo a remover dos favoritos.
     * @returns {Promise<unknown>} Resultado da remoção devolvido pela API.
     */
    removeFavorite(contentId, options = {}) {
        return apiClient.del(
            `/api/me/favorites/${encodeURIComponent(contentId)}`,
            options,
        );
    },
    /**
     * Lista os conteúdos guardados para ver mais tarde.
     *
     * A rota devolve a watchlist da sessão atual sem o frontend precisar de
     * transportar o identificador do utilizador.
     *
     * @returns {Promise<unknown>} Lista de watchlist devolvida pela API.
     */
    listWatchlist(pagination = {}, options = {}) {
        return apiClient.get(
            `/api/me/watchlist${buildPagination(pagination)}`,
            options,
        );
    },
    /**
     * Adiciona um conteúdo à watchlist do utilizador.
     *
     * O frontend envia apenas o identificador do conteúdo; a API decide se cria
     * ou mantém a associação existente.
     *
     * @param {string} contentId Identificador do conteúdo a guardar para mais tarde.
     * @returns {Promise<unknown>} Entrada de watchlist criada ou atualizada pela API.
     */
    addWatchlist(contentId, options = {}) {
        return apiClient.put(
            `/api/me/watchlist/${encodeURIComponent(contentId)}`,
            undefined,
            options,
        );
    },
    /**
     * Remove um conteúdo da watchlist do utilizador.
     *
     * A função aponta a associação pelo conteúdo e deixa a API validar se a
     * watchlist pertence à sessão atual.
     *
     * @param {string} contentId Identificador do conteúdo a remover da watchlist.
     * @returns {Promise<unknown>} Resultado da remoção devolvido pela API.
     */
    removeWatchlist(contentId, options = {}) {
        return apiClient.del(
            `/api/me/watchlist/${encodeURIComponent(contentId)}`,
            options,
        );
    },
    /**
     * Lista o histórico de reprodução do utilizador autenticado.
     *
     * A chamada alimenta páginas de biblioteca e progresso sem expor dados de
     * outros utilizadores no frontend.
     *
     * @returns {Promise<unknown>} Histórico pessoal devolvido pela API.
     */
    listHistory(pagination = {}, options = {}) {
        return apiClient.get(
            `/api/me/history${buildPagination(pagination)}`,
            options,
        );
    },
};
