/**
 * Módulo cliente para a API de pagamentos simulados.
 *
 * Isola chamadas HTTP do frontend e reutiliza `apiClient`, mantendo cookies de
 * sessão incluídas sem expor tokens ou dados financeiros no browser.
 */
import { apiClient } from "./apiClient.js";

export const paymentsApi = {
  /**
   * Pede ao backend para executar um checkout com método de teste.
   *
   * @param {object} input Plano, método de teste e resultado simulado.
   * @returns {Promise<object>} Resultado devolvido pela API.
   */
  simulatedCheckout(input) {
    return apiClient.post("/api/payments/simulated-checkout", input);
  },
  /**
   * Inicia trial gratuito do utilizador autenticado.
   *
   * @returns {Promise<object>} Trial e subscrição temporária.
   */
  startTrial() {
    return apiClient.post("/api/payments/trial");
  },
};