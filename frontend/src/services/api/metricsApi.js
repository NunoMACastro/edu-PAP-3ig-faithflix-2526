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
    getAdminMetrics(filters = {}, options = {}) {
        return apiClient.get(
            `/api/admin/metrics${buildMetricsQuery(filters)}`,
            options,
        );
    },

    /**
     * Descarrega o CSV privado usando cookies HttpOnly através do cliente comum.
     *
     * @param {{ from?: string, to?: string }} filters Intervalo civil UTC.
     * @param {RequestInit} options Opções canceláveis.
     * @returns {Promise<{ blob: Blob, filename: string }>} Ficheiro e nome do backend.
     */
    exportCsv(filters = {}, options = {}) {
        return apiClient.download(
            `/api/admin/metrics/export.csv${buildMetricsQuery(filters)}`,
            options,
        );
    },
};
