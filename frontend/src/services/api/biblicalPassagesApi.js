/**
 * @file Cliente API para passagens bíblicas.
 */

import { apiClient } from "./apiClient.js";

/**
 * Constrói query string simples para paginação.
 *
 * @param {Record<string, unknown>} params Parâmetros.
 * @returns {string} Query string com prefixo.
 */
function queryString(params = {}) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
        }
    }

    const text = searchParams.toString();
    return text ? `?${text}` : "";
}

export const biblicalPassagesApi = {
    /**
     * Lista passagens bíblicas publicadas para as páginas públicas.
     *
     * Os filtros são convertidos para query string antes da chamada HTTP, para o
     * backend aplicar paginação sem o frontend conhecer a implementação MongoDB.
     *
     * @param {{ page?: number, limit?: number }} params Filtros opcionais de
     * paginação enviados como query string.
     * @returns {Promise<unknown>} Página de passagens devolvida pela API.
     */
    listPublished(params = {}) {
        return apiClient.get(`/api/biblical-passages${queryString(params)}`);
    },

    /**
     * Lista passagens associadas a um conteúdo público.
     *
     * @param {string} idOrSlug Id ou slug do conteúdo.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento do pedido.
     * @returns {Promise<unknown>} Resposta da API.
     */
    listForContent(idOrSlug, options = {}) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(idOrSlug)}/biblical-passages`,
            options,
        );
    },

    /**
     * Lista passagens bíblicas para administração editorial.
     *
     * Esta chamada usa a rota protegida de administração e permite consultar
     * passagens publicadas, rascunhos e conteúdos em revisão.
     *
     * @param {{ page?: number, limit?: number }} params Filtros opcionais de
     * paginação enviados como query string.
     * @returns {Promise<unknown>} Página administrativa devolvida pela API.
     */
    listAdmin(params = {}, options = {}) {
        return apiClient.get(
            `/api/biblical-passages/admin${queryString(params)}`,
            options,
        );
    },

    /**
     * Lista associações de passagens de um conteúdo para administração.
     *
     * @param {string} contentId Id do conteúdo.
     * @returns {Promise<unknown>} Resposta da API.
     */
    listAdminForContent(contentId, options = {}) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(contentId)}/biblical-passages/admin`,
            options,
        );
    },

    /**
     * Cria uma passagem como rascunho.
     *
     * @param {Record<string, unknown>} input Dados da passagem.
     * @returns {Promise<unknown>} Resposta da API.
     */
    create(input, options = {}) {
        return apiClient.post("/api/biblical-passages", input, options);
    },

    /**
     * Atualiza uma passagem existente.
     *
     * @param {string} passageId Id da passagem.
     * @param {Record<string, unknown>} input Dados da passagem.
     * @returns {Promise<unknown>} Resposta da API.
     */
    update(passageId, input, options = {}) {
        return apiClient.patch(
            `/api/biblical-passages/${encodeURIComponent(passageId)}`,
            input,
            options,
        );
    },

    /**
     * Altera o estado editorial de uma passagem.
     *
     * @param {string} passageId Id da passagem.
     * @param {string} status Novo estado.
     * @returns {Promise<unknown>} Resposta da API.
     */
    updateStatus(passageId, status, options = {}) {
        return apiClient.patch(
            `/api/biblical-passages/${encodeURIComponent(passageId)}/status`,
            { status },
            options,
        );
    },

    /**
     * Associa uma passagem a um conteúdo.
     *
     * @param {string} contentId Id do conteúdo.
     * @param {Record<string, unknown>} input Associação.
     * @returns {Promise<unknown>} Resposta da API.
     */
    linkToContent(contentId, input, options = {}) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/biblical-passages`,
            input,
            options,
        );
    },

    /**
     * Remove uma associação entre conteúdo e passagem.
     *
     * @param {string} contentId Id do conteúdo.
     * @param {string} passageId Id da passagem.
     * @returns {Promise<unknown>} Resposta da API.
     */
    unlinkFromContent(contentId, passageId, options = {}) {
        return apiClient.del(
            `/api/catalog/${encodeURIComponent(contentId)}/biblical-passages/${encodeURIComponent(passageId)}`,
            options,
        );
    },
};
