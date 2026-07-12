/**
 * @file Cliente da API de autenticação.
 *
 * Concentra chamadas de registo, login, recuperação de password e sessão atual
 * para que os componentes não repitam caminhos HTTP.
 */

import { apiClient, clearCsrfToken } from "./apiClient.js";

export const authApi = {
  /**
   * Regista um utilizador e inicia sessão.
   *
   * @param {Record<string, unknown>} data Dados de registo.
   * @param {RequestInit} [options={}] Opções do pedido, incluindo cancelamento.
   * @returns {Promise<unknown>} Utilizador público e estado de sessão.
   */
  async register(data, options = {}) {
    const response = await apiClient.post("/api/auth/register", data, {
      ...options,
      csrf: false,
    });
    // O backend pode rodar a sessão no registo; nunca reutilizar o token anterior.
    clearCsrfToken();
    return response;
  },

  /**
   * Autentica um utilizador existente.
   *
   * @param {Record<string, unknown>} data Dados de login.
   * @param {RequestInit} [options={}] Opções do pedido, incluindo cancelamento.
   * @returns {Promise<unknown>} Utilizador público e estado de sessão.
   */
  async login(data, options = {}) {
    const response = await apiClient.post("/api/auth/login", data, {
      ...options,
      csrf: false,
    });
    // O token CSRF pertence à sessão anónima usada antes do login.
    clearCsrfToken();
    return response;
  },

  /**
   * Pede criação de token de recuperação de password.
   *
   * @param {Record<string, unknown>} data Dados com email.
   * @param {RequestInit} [options={}] Opções do pedido, incluindo cancelamento.
   * @returns {Promise<unknown>} Mensagem pública genérica.
   */
  forgotPassword(data, options = {}) {
    return apiClient.post("/api/auth/forgot-password", data, {
      ...options,
      csrf: false,
    });
  },

  /**
   * Substitui password usando um token válido.
   *
   * @param {Record<string, unknown>} data Dados com token e nova password.
   * @param {RequestInit} [options={}] Opções do pedido, incluindo cancelamento.
   * @returns {Promise<unknown>} Mensagem de sucesso.
   */
  resetPassword(data, options = {}) {
    return apiClient.post("/api/auth/reset-password", data, {
      ...options,
      csrf: false,
    });
  },

  /**
   * Obtém a sessão atual.
   *
   * @returns {Promise<unknown>} Utilizador autenticado ou `null`.
   */
  me() {
    return apiClient.get("/api/session/me");
  },

  /**
   * Termina a sessão atual.
   *
   * @returns {Promise<unknown>} Resposta vazia de logout.
   */
  async logout() {
    const response = await apiClient.post("/api/session/logout");
    clearCsrfToken();
    return response;
  },
};
