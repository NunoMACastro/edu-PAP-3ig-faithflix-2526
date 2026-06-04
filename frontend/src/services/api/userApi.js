import { apiClient } from "./apiClient.js";

export const userApi = {
  getMe() {
    return apiClient.get("/api/users/me");
  },
  updateMe(input) {
    return apiClient.patch("/api/users/me", input);
  },
  listUsers() {
    return apiClient.get("/api/users");
  },
  updateRole(userId, role) {
    return apiClient.patch(`/api/users/${encodeURIComponent(userId)}/role`, { role });
  },
};