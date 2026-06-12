import { apiClient } from "./apiClient.js";

export const discoveryApi = {
    home() {
        return apiClient.get("/api/discovery/home");
    },
    related(contentId) {
        return apiClient.get(
            `/api/discovery/related/${encodeURIComponent(contentId)}`,
        );
    },
};
