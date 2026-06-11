import { apiClient } from "./apiClient.js";

export const searchApi = {
  search({ q, page = 1, limit = 12 }) {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
    });

    return apiClient.get(`/api/search?${params.toString()}`);
  },
};