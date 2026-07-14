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
  list(options = {}) {
    return apiClient.get("/api/notifications", options);
  },
  /**
   * Marca uma notificação como lida.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<object>} Notificação atualizada.
   */
  markAsRead(id, options = {}) {
    return apiClient.patch(
      `/api/notifications/${encodeURIComponent(id)}/read`,
      undefined,
      options,
    );
  },
  /**
   * Obtem preferências de notificação.
   *
   * @returns {Promise<{ preferences: object }>} Preferências atuais.
   */
  getPreferences(options = {}) {
    return apiClient.get("/api/notifications/preferences/me", options);
  },
  /**
   * Atualiza preferências de notificação no backend.
   *
   * @param {object} input Preferências escolhidas pelo utilizador.
   * @returns {Promise<{ preferences: object }>} Preferências guardadas.
   */
  updatePreferences(input, options = {}) {
    return apiClient.put("/api/notifications/preferences/me", input, options);
  },
};
