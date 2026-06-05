import { apiClient } from "./apiClient.js";

export const libraryApi = {
  listFavorites() {
    return apiClient.get("/api/me/favorites");
  },
  addFavorite(contentId) {
    return apiClient.put(`/api/me/favorites/${encodeURIComponent(contentId)}`);
  },
  removeFavorite(contentId) {
    return apiClient.del(`/api/me/favorites/${encodeURIComponent(contentId)}`);
  },
  listWatchlist() {
    return apiClient.get("/api/me/watchlist");
  },
  addWatchlist(contentId) {
    return apiClient.put(`/api/me/watchlist/${encodeURIComponent(contentId)}`);
  },
  removeWatchlist(contentId) {
    return apiClient.del(`/api/me/watchlist/${encodeURIComponent(contentId)}`);
  },
  listHistory() {
    return apiClient.get("/api/me/history");
  },
};