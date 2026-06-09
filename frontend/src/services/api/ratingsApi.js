import { apiClient } from "./apiClient.js";

export const ratingsApi = {
  getSummary(contentId) {
    return apiClient.get(`/api/ratings/${encodeURIComponent(contentId)}/summary`);
  },
  getMine(contentId) {
    return apiClient.get(`/api/ratings/${encodeURIComponent(contentId)}/me`);
  },
  save(contentId, value) {
    return apiClient.put(`/api/ratings/${encodeURIComponent(contentId)}`, { value });
  },
  remove(contentId) {
    return apiClient.del(`/api/ratings/${encodeURIComponent(contentId)}`);
  },
};