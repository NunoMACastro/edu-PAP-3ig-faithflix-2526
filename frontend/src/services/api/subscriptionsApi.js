/**
 * @file Ficheiro `real_dev/frontend/src/services/api/subscriptionsApi.js` da implementação real_dev.
 */

/**
 * Cliente frontend para rotas de subscrições.
 *
 * Usa o `apiClient` da MF1 para herdar `credentials: "include"` e enviar
 * cookies HttpOnly sem expor tokens no navegador.
 */
import { apiClient } from "./apiClient.js";

export const subscriptionsApi = {
  /** @returns {Promise<object>} Planos ativos públicos. */
  listPlans() {
    return apiClient.get("/api/subscriptions/plans");
  },
  /** @returns {Promise<object>} Subscrição do utilizador autenticado. */
  getMine() {
    return apiClient.get("/api/subscriptions/me");
  },
  /** @returns {Promise<object>} Subscrição com renovação cancelada. */
  cancelRenewal() {
    return apiClient.post("/api/subscriptions/me/cancel-renewal");
  },
};
