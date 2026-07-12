/**
 * @file Cliente dos eventos analíticos anónimos e consentidos.
 */

import { apiClient } from "./apiClient.js";

export const analyticsApi = Object.freeze({
    /**
     * Envia exclusivamente tipo e categoria ampla opcional.
     *
     * @param {"catalog_view"|"search_submit"|"playback_started"|"playback_completed"} type Tipo fechado.
     * @param {{ category?: "movie"|"series"|"episode"|"documentary"|"uncategorized", signal?: AbortSignal }} [options] Categoria e cancelamento.
     * @returns {Promise<null>} Resposta HTTP 204.
     */
    record(type, options = {}) {
        const { category, ...requestOptions } = options;
        return apiClient.post(
            "/api/analytics/events",
            {
                type,
                ...(category ? { category } : {}),
            },
            requestOptions,
        );
    },
});

/**
 * Regista telemetria de UX sem permitir que uma falha analítica interrompa a
 * ação principal do utilizador.
 *
 * @param {Parameters<typeof analyticsApi.record>[0]} type Tipo fechado.
 * @param {Parameters<typeof analyticsApi.record>[1]} [options] Categoria segura.
 * @returns {void}
 */
export function reportAnonymousMetric(type, options = {}) {
    analyticsApi.record(type, options).catch(() => {});
}
