/**
 * @file Ficheiro `real_dev/frontend/src/services/api/paymentsApi.js` da implementação real_dev.
 */

/**
 * Módulo cliente para a API de pagamentos simulados.
 *
 * Isola chamadas HTTP do frontend e reutiliza `apiClient`, mantendo cookies de
 * sessão incluídas sem expor tokens ou dados financeiros no navegador.
 */
import { apiClient } from "./apiClient.js";

/**
 * Acrescenta a chave idempotente sem a expor no corpo financeiro.
 *
 * @param {{ idempotencyKey?: string, headers?: HeadersInit } & RequestInit} options Opções do pedido.
 * @returns {RequestInit} Opções HTTP com o header fechado.
 */
function idempotentOptions({ idempotencyKey, headers, ...options } = {}) {
  const requestHeaders = new Headers(headers);
  if (idempotencyKey) requestHeaders.set("Idempotency-Key", idempotencyKey);
  return { ...options, headers: requestHeaders };
}

export const paymentsApi = {
  /**
   * Pede ao backend para executar um checkout com método de teste.
   *
   * @param {object} input Plano, método de teste e resultado simulado.
   * @returns {Promise<object>} Resultado devolvido pela API.
   */
  simulatedCheckout(input, options = {}) {
    return apiClient.post(
      "/api/payments/simulated-checkout",
      input,
      idempotentOptions(options),
    );
  },
  /**
   * Inicia trial gratuito do utilizador autenticado.
   *
   * @returns {Promise<object>} Trial e subscrição temporária.
   */
  startTrial(options = {}) {
    return apiClient.post(
      "/api/payments/trial",
      undefined,
      idempotentOptions(options),
    );
  },
};
