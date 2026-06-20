/**
 * @file Cliente da API de autenticação.
 *
 * Concentra chamadas de registo, login, recuperação de password e sessão atual
 * para que os componentes não repitam caminhos HTTP.
 */

import { apiClient } from "./apiClient.js";

export const authApi = {
  /**
   * Regista um utilizador e inicia sessão.
   *
   * @param {Record<string, unknown>} data Dados de registo.
   * @returns {Promise<unknown>} Utilizador público e estado de sessão.
   */
  register(data) {
    return apiClient.post("/api/auth/register", data);
  },

  /**
   * Autentica um utilizador existente.
   *
   * @param {Record<string, unknown>} data Dados de login.
   * @returns {Promise<unknown>} Utilizador público e estado de sessão.
   */
  login(data) {
    return apiClient.post("/api/auth/login", data);
  },

  /**
   * Pede criação de token de recuperação de password.
   *
   * @param {Record<string, unknown>} data Dados com email.
   * @returns {Promise<unknown>} Mensagem pública genérica.
   */
  forgotPassword(data) {
    return apiClient.post("/api/auth/forgot-password", data);
  },

  /**
   * Substitui password usando um token válido.
   *
   * @param {Record<string, unknown>} data Dados com token e nova password.
   * @returns {Promise<unknown>} Mensagem de sucesso.
   */
  resetPassword(data) {
    return apiClient.post("/api/auth/reset-password", data);
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
  logout() {
    return apiClient.post("/api/session/logout");
  },
};
