// apps/frontend/src/services/api/metricsApi.js
import { apiClient } from "./apiClient.js";

export const metricsApi = {
    /**
     * Carrega métricas administrativas agregadas.
     *
     * @param {{ from?: string, to?: string }} filters Filtros temporais.
     * @returns {Promise<{ metrics: Record<string, unknown> }>} Métricas agregadas.
     */
    getAdminMetrics(filters = {}) {
        const params = new URLSearchParams();

        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);

        const query = params.toString();
        return apiClient.get(`/api/admin/metrics${query ? `?${query}` : ""}`);
    },
};