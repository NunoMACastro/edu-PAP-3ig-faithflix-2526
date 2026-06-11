import { apiClient } from "./apiClient.js";

export const searchApi = {
  search({ q, page = 1, limit = 12, type = "", taxonomyId = "", sort = "title" }) {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
      sort,
    });

    if (type) params.set("type", type);
    if (taxonomyId) params.set("taxonomyId", taxonomyId);

    return apiClient.get(`/api/search?${params.toString()}`);
  },
  listTaxonomiesForFilters() {
    return apiClient.get("/api/catalog/taxonomies");
  },
};