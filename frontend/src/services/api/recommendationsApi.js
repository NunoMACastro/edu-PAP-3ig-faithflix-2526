import { apiClient } from "./apiClient.js";

export const recommendationsApi = {
  getMine() {
    return apiClient.get("/api/recommendations/me");
  },
};