import { apiClient } from "./apiClient.js";

export const catalogApi = {
    listPublished() {
        return apiClient.get("/api/catalog");
    },
    getDetail(idOrSlug) {
        return apiClient.get(`/api/catalog/${encodeURIComponent(idOrSlug)}`);
    },
    listAdmin() {
        return apiClient.get("/api/catalog/admin");
    },
    createContent(input) {
        return apiClient.post("/api/catalog", input);
    },
    updateContent(contentId, input) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}`,
            input,
        );
    },
    updateStatus(contentId, status) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}/status`,
            { status },
        );
    },
    listRevisions(contentId) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions`,
        );
    },
    revertRevision(contentId, revisionId) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions/${encodeURIComponent(revisionId)}/revert`,
        );
    },
    listTaxonomies() {
        return apiClient.get("/api/catalog/taxonomies");
    },
    createTaxonomy(input) {
        return apiClient.post("/api/catalog/taxonomies", input);
    },
};
