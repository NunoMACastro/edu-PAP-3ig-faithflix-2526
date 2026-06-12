import { apiClient } from "./apiClient.js";

/**
 * Fetches the technical status exposed by `GET /api`.
 *
 * @returns {Promise<unknown>} API status payload returned by the backend.
 */
export function getApiStatus() {
    return apiClient.get("/api");
}
