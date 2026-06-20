/**
 * @file Ficheiro `real_dev/frontend/src/services/api/libraryApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const libraryApi = {
    /**
     * Documenta `listFavorites`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listFavorites`.
     */
    listFavorites() {
        return apiClient.get("/api/me/favorites");
    },
    /**
     * Documenta `addFavorite`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `addFavorite`.
     * @returns {unknown} Resultado devolvido por `addFavorite`.
     */
    addFavorite(contentId) {
        return apiClient.put(
            `/api/me/favorites/${encodeURIComponent(contentId)}`,
        );
    },
    /**
     * Documenta `removeFavorite`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `removeFavorite`.
     * @returns {unknown} Resultado devolvido por `removeFavorite`.
     */
    removeFavorite(contentId) {
        return apiClient.del(
            `/api/me/favorites/${encodeURIComponent(contentId)}`,
        );
    },
    /**
     * Documenta `listWatchlist`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listWatchlist`.
     */
    listWatchlist() {
        return apiClient.get("/api/me/watchlist");
    },
    /**
     * Documenta `addWatchlist`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `addWatchlist`.
     * @returns {unknown} Resultado devolvido por `addWatchlist`.
     */
    addWatchlist(contentId) {
        return apiClient.put(
            `/api/me/watchlist/${encodeURIComponent(contentId)}`,
        );
    },
    /**
     * Documenta `removeWatchlist`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `removeWatchlist`.
     * @returns {unknown} Resultado devolvido por `removeWatchlist`.
     */
    removeWatchlist(contentId) {
        return apiClient.del(
            `/api/me/watchlist/${encodeURIComponent(contentId)}`,
        );
    },
    /**
     * Documenta `listHistory`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listHistory`.
     */
    listHistory() {
        return apiClient.get("/api/me/history");
    },
};
