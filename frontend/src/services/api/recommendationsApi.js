import { apiClient } from "./apiClient.js";

export const recommendationsApi = {
    mine() {
        return apiClient.get("/api/recommendations/me");
    },
};
