import { apiClient } from "./apiClient.js";

export function getApiStatus() {
    return apiClient.get("/api");
}