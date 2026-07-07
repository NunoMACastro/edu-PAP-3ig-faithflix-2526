/**
 * @file Ficheiro `real_dev/frontend/src/services/api/discoveryApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const discoveryApi = {
    /**
     * Obtém os blocos de descoberta da página inicial.
     *
     * A API agrega secções como destaques, categorias e recomendações públicas
     * para a home sem a página conhecer a origem de cada bloco.
     *
     * @returns {Promise<unknown>} Conteúdo de descoberta devolvido pela API.
     */
    home() {
        return apiClient.get("/api/discovery/home");
    },
    /**
     * Lista conteúdos relacionados com um item do catálogo.
     *
     * O identificador do conteúdo base é codificado no URL para o backend
     * calcular sugestões relacionadas.
     *
     * @param {string} contentId Identificador do conteúdo base.
     * @returns {Promise<unknown>} Lista de conteúdos relacionados devolvida pela API.
     */
    related(contentId) {
        return apiClient.get(
            `/api/discovery/related/${encodeURIComponent(contentId)}`,
        );
    },
};
