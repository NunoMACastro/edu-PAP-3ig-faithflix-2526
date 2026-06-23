/**
 * @file Ficheiro `real_dev/frontend/src/services/api/searchApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

/**
 * Documenta `buildSearchParams`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} input Valor recebido por `buildSearchParams`.
 * @returns {unknown} Resultado devolvido por `buildSearchParams`.
 */
function buildSearchParams(input) {
    const params = new URLSearchParams();

    params.set("q", input.query);
    params.set("page", String(input.page ?? 1));
    params.set("limit", String(input.limit ?? 12));
    params.set("sort", input.sort ?? "title");

    if (input.type) {
        params.set("type", input.type);
    }

    if (input.taxonomyId) {
        params.set("taxonomyId", input.taxonomyId);
    }

    return params;
}

export const searchApi = {
    /**
     * Documenta `search`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} input Valor recebido por `search`.
     * @returns {unknown} Resultado devolvido por `search`.
     */
    search(input) {
        return apiClient.get(`/api/search?${buildSearchParams(input)}`);
    },
};
