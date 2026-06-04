import { apiClient } from "./apiClient.js";

export const authApi = {
  register(data) {
    return apiClient.post("/api/auth/register", data);
  },
  login(data) {
    return apiClient.post("/api/auth/login", data);
  },
  forgotPassword(data) {
    return apiClient.post("/api/auth/forgot-password", data);
  },
  resetPassword(data) {
    return apiClient.post("/api/auth/reset-password", data);
  },
  me() {
    return apiClient.get("/api/session/me");
  },
  logout() {
    return apiClient.post("/api/session/logout");
  },
};