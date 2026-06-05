import { apiClient } from "./apiClient.js";

export const playbackApi = {
  getPlayback(contentId) {
    return apiClient.get(`/api/playback/${encodeURIComponent(contentId)}`);
  },
  saveProgress(contentId, currentTimeSeconds) {
    return apiClient.put(`/api/playback/${encodeURIComponent(contentId)}/progress`, { currentTimeSeconds });
  },
  listContinueWatching() {
    return apiClient.get("/api/playback/me/continue-watching");
  },
};