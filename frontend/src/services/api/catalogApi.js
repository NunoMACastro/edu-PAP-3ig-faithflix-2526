/**
 * @file Ficheiro `real_dev/frontend/src/services/api/catalogApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const catalogApi = {
    /**
     * Documenta `listPublished`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listPublished`.
     */
    listPublished() {
        return apiClient.get("/api/catalog");
    },
    /**
     * Documenta `getDetail`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} idOrSlug Valor recebido por `getDetail`.
     * @returns {unknown} Resultado devolvido por `getDetail`.
     */
    getDetail(idOrSlug) {
        return apiClient.get(`/api/catalog/${encodeURIComponent(idOrSlug)}`);
    },
    /**
     * Documenta `listAdmin`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listAdmin`.
     */
    listAdmin() {
        return apiClient.get("/api/catalog/admin");
    },
    /**
     * Documenta `createContent`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} input Valor recebido por `createContent`.
     * @returns {unknown} Resultado devolvido por `createContent`.
     */
    createContent(input) {
        return apiClient.post("/api/catalog", input);
    },
    /**
     * Documenta `updateContent`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `updateContent`.
     * @param {unknown} input Valor recebido por `updateContent`.
     * @returns {unknown} Resultado devolvido por `updateContent`.
     */
    updateContent(contentId, input) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}`,
            input,
        );
    },
    /**
     * Documenta `updateStatus`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `updateStatus`.
     * @param {unknown} status Valor recebido por `updateStatus`.
     * @returns {unknown} Resultado devolvido por `updateStatus`.
     */
    updateStatus(contentId, status) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}/status`,
            { status },
        );
    },
    /**
     * Documenta `listRevisions`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `listRevisions`.
     * @returns {unknown} Resultado devolvido por `listRevisions`.
     */
    listRevisions(contentId) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions`,
        );
    },
    /**
     * Documenta `revertRevision`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `revertRevision`.
     * @param {unknown} revisionId Valor recebido por `revertRevision`.
     * @returns {unknown} Resultado devolvido por `revertRevision`.
     */
    revertRevision(contentId, revisionId) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions/${encodeURIComponent(revisionId)}/revert`,
        );
    },
    /**
     * Documenta `listTaxonomies`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listTaxonomies`.
     */
    listTaxonomies() {
        return apiClient.get("/api/catalog/taxonomies");
    },
    /**
     * Documenta `createTaxonomy`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} input Valor recebido por `createTaxonomy`.
     * @returns {unknown} Resultado devolvido por `createTaxonomy`.
     */
    createTaxonomy(input) {
        return apiClient.post("/api/catalog/taxonomies", input);
    },
};
