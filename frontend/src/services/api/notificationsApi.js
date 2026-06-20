/**
 * @file Ficheiro `real_dev/frontend/src/services/api/notificationsApi.js` da implementação real_dev.
 */

/**
 * Módulo cliente para a API de notificações.
 *
 * Agrupa chamadas HTTP de leitura, marcação como lida e preferências, usando o
 * `apiClient` para preservar cookies HttpOnly sem expor tokens no frontend.
 */
import { apiClient } from "./apiClient.js";

export const notificationsApi = {
  /**
   * Lista notificações do utilizador autenticado.
   *
   * @returns {Promise<{ notifications: object[] }>} Notificações recentes.
   */
  list() {
    return apiClient.get("/api/notifications");
  },
  /**
   * Marca uma notificação como lida.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<object>} Notificação atualizada.
   */
  markAsRead(id) {
    return apiClient.patch(`/api/notifications/${encodeURIComponent(id)}/read`);
  },
  /**
   * Obtem preferências de notificação.
   *
   * @returns {Promise<{ preferences: object }>} Preferências atuais.
   */
  getPreferences() {
    return apiClient.get("/api/notifications/preferences/me");
  },
  /**
   * Atualiza preferências de notificação no backend.
   *
   * @param {object} input Preferências escolhidas pelo utilizador.
   * @returns {Promise<{ preferences: object }>} Preferências guardadas.
   */
  updatePreferences(input) {
    return apiClient.put("/api/notifications/preferences/me", input);
  },
};