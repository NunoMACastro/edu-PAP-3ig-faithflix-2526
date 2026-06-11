import { apiClient } from "./apiClient.js";

export const discoveryApi = {
  getHome() {
    return apiClient.get("/api/discovery/home");
  },
  getRelated(contentId) {
    return apiClient.get(`/api/discovery/related/${encodeURIComponent(contentId)}`);
  },
};