/**
 * @file Ficheiro `real_dev/frontend/src/services/api/catalogApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const catalogApi = {
    /**
     * Lista conteúdos publicados disponíveis para o público.
     *
     * Esta chamada alimenta páginas de catálogo sem expor rascunhos ou metadados
     * administrativos.
     *
     * @returns {Promise<unknown>} Catálogo público devolvido pela API.
     */
    listPublished() {
        return apiClient.get("/api/catalog");
    },
    /**
     * Obtém o detalhe público de um conteúdo.
     *
     * Aceita tanto identificador como slug para permitir navegação por URLs
     * legíveis sem duplicar lógica no frontend.
     *
     * @param {string} idOrSlug Identificador técnico ou slug público do conteúdo.
     * @returns {Promise<unknown>} Detalhe público devolvido pela API.
     */
    getDetail(idOrSlug) {
        return apiClient.get(`/api/catalog/${encodeURIComponent(idOrSlug)}`);
    },
    /**
     * Lista conteúdos para gestão administrativa.
     *
     * A rota administrativa pode incluir rascunhos, itens arquivados e metadados
     * que não pertencem ao catálogo público.
     *
     * @returns {Promise<unknown>} Catálogo administrativo devolvido pela API.
     */
    listAdmin() {
        return apiClient.get("/api/catalog/admin");
    },
    /**
     * Cria um novo conteúdo no catálogo.
     *
     * O payload vem dos formulários administrativos e é validado no backend antes
     * de ser persistido.
     *
     * @param {Record<string, unknown>} input Dados editoriais do novo conteúdo.
     * @returns {Promise<unknown>} Conteúdo criado devolvido pela API.
     */
    createContent(input) {
        return apiClient.post("/api/catalog", input);
    },
    /**
     * Atualiza campos editoriais de um conteúdo existente.
     *
     * O identificador vai no URL e o corpo transporta apenas os campos que a
     * interface administrativa pretende alterar.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {Record<string, unknown>} input Campos editoriais atualizados.
     * @returns {Promise<unknown>} Conteúdo atualizado devolvido pela API.
     */
    updateContent(contentId, input) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}`,
            input,
        );
    },
    /**
     * Altera o estado editorial de um conteúdo.
     *
     * A função envia apenas o novo estado, deixando a API validar transições como
     * publicação, arquivo ou regresso a rascunho.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} status Novo estado editorial.
     * @returns {Promise<unknown>} Conteúdo com estado atualizado.
     */
    updateStatus(contentId, status) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}/status`,
            { status },
        );
    },
    /**
     * Lista revisões guardadas de um conteúdo.
     *
     * A chamada permite à administração comparar versões anteriores antes de
     * decidir reverter uma alteração.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @returns {Promise<unknown>} Histórico de revisões devolvido pela API.
     */
    listRevisions(contentId) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions`,
        );
    },
    /**
     * Reverte um conteúdo para uma revisão anterior.
     *
     * O URL identifica simultaneamente o conteúdo atual e a revisão escolhida,
     * evitando que o frontend envie estado editorial reconstruído manualmente.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} revisionId Identificador da revisão a restaurar.
     * @returns {Promise<unknown>} Conteúdo restaurado devolvido pela API.
     */
    revertRevision(contentId, revisionId) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions/${encodeURIComponent(revisionId)}/revert`,
        );
    },
    /**
     * Lista taxonomias disponíveis para classificar conteúdos.
     *
     * A UI usa esta lista para preencher filtros e formulários editoriais sem
     * duplicar categorias em código frontend.
     *
     * @returns {Promise<unknown>} Lista de taxonomias devolvida pela API.
     */
    listTaxonomies() {
        return apiClient.get("/api/catalog/taxonomies");
    },
    /**
     * Cria uma nova taxonomia editorial.
     *
     * O payload contém nome, slug e descrição opcional, sendo normalizado e
     * validado pela API antes de ficar disponível no catálogo.
     *
     * @param {Record<string, unknown>} input Dados da nova taxonomia.
     * @returns {Promise<unknown>} Taxonomia criada devolvida pela API.
     */
    createTaxonomy(input) {
        return apiClient.post("/api/catalog/taxonomies", input);
    },
};
