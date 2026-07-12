/**
 * @file Ficheiro `real_dev/frontend/src/services/api/searchApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

/**
 * Constrói os parâmetros de query para a pesquisa de conteúdos.
 *
 * A função centraliza os defaults de paginação e ordenação para a UI não montar
 * URLs manualmente em cada chamada de pesquisa.
 *
 * @param {{ query: string, page?: number, limit?: number, sort?: string, type?: string, taxonomyId?: string }} input Filtros escolhidos pelo utilizador.
 * @returns {URLSearchParams} Parâmetros serializáveis para a rota de pesquisa.
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
     * Executa uma pesquisa no catálogo.
     *
     * Os filtros recebidos da interface são convertidos por `buildSearchParams`
     * antes de chamar a API.
     *
     * @param {{ query: string, page?: number, limit?: number, sort?: string, type?: string, taxonomyId?: string }} input Filtros de pesquisa.
     * @param {{ signal?: AbortSignal }} [options] Cancelamento do pedido atual.
     * @returns {Promise<unknown>} Resultados paginados devolvidos pela API.
     */
    search(input, options = {}) {
        return apiClient.get(
            `/api/search?${buildSearchParams(input)}`,
            { signal: options.signal },
        );
    },
};
