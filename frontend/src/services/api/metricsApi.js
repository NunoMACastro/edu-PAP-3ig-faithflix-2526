/**
 * @file Cliente API para metricas administrativas agregadas.
 */

import { apiClient } from "./apiClient.js";

/**
 * Constrói query string ignorando filtros vazios.
 *
 * @param {{ from?: string, to?: string }} filters Filtros da UI.
 * @returns {string} Query string pronta para anexar ao endpoint.
 */
function buildMetricsQuery(filters = {}) {
    const params = new URLSearchParams();

    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    const query = params.toString();
    return query ? `?${query}` : "";
}

export const metricsApi = {
    /**
     * Lê metricas admin agregadas.
     *
     * @param {{ from?: string, to?: string }} filters Filtros opcionais.
     * @returns {Promise<unknown>} Metricas agregadas.
     */
    getAdminMetrics(filters = {}) {
        return apiClient.get(`/api/admin/metrics${buildMetricsQuery(filters)}`);
    },
};
