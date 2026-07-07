/**
 * @file Cliente HTTP para a API de associações.
 *
 * Agrupa chamadas usadas pelos ecrãs públicos e administrativos, mantendo
 * autenticação, autorização e validação final no backend.
 */

import { env } from "../../config/env.js";
import { apiClient } from "./apiClient.js";

/**
 * Constrói URL absoluta para downloads servidos diretamente pelo backend.
 *
 * @param {string} path Caminho HTTP da API.
 * @returns {string} URL absoluta.
 */
function apiUrl(path) {
  return `${env.apiBaseUrl}${path}`;
}

export const charitiesApi = {
  /**
   * Submete uma candidatura pública.
   *
   * @param {object} input Campos do formulário.
   * @returns {Promise<{ application: object }>} Candidatura criada.
   */
  submitApplication(input) {
    return apiClient.post("/api/charities/applications", input);
  },

  /**
   * Lista candidaturas para ecrãs de administração.
   *
   * @param {string} [status="pending"] Estado a consultar.
   * @returns {Promise<{ applications: object[] }>} Lista devolvida pela API.
   */
  listApplications(status = "pending") {
    return apiClient.get(
      `/api/charities/applications?status=${encodeURIComponent(status)}`,
    );
  },

  /**
   * Revê uma candidatura pendente.
   *
   * @param {string} id Identificador da candidatura.
   * @param {{ decision: "approved" | "rejected", reason?: string }} input Decisão administrativa.
   * @returns {Promise<object>} Resultado da revisão.
   */
  reviewApplication(id, input) {
    return apiClient.patch(`/api/charities/applications/${id}/review`, input);
  },

  /**
   * Executa a distribuição mensal da pool solidária.
   *
   * @param {string} month Mês no formato `YYYY-MM`.
   * @returns {Promise<{ distribution: object }>} Distribuição persistida.
   */
  runDistribution(month) {
    return apiClient.post("/api/charities/pool/distributions", { month });
  },

  /**
   * Consulta uma distribuição mensal já criada.
   *
   * @param {string} month Mês no formato `YYYY-MM`.
   * @returns {Promise<{ distribution: object }>} Distribuição persistida.
   */
  getDistribution(month) {
    return apiClient.get(
      `/api/charities/pool/distributions/${encodeURIComponent(month)}`,
    );
  },

  /**
   * Lista associações públicas elegíveis.
   *
   * @returns {Promise<{ charities: object[] }>} Associações públicas.
   */
  listPublicCharities() {
    return apiClient.get("/api/charities/public");
  },

  /**
   * Alias curto usado por páginas antigas do frontend.
   *
   * @returns {Promise<{ charities: object[] }>} Associações públicas.
   */
  listPublic() {
    return this.listPublicCharities();
  },

  /**
   * Obtém o dashboard administrativo da pool.
   *
   * @returns {Promise<{ months: object[] }>} Meses agregados.
   */
  getPoolDashboard() {
    return apiClient.get("/api/charities/pool/dashboard");
  },

  /**
   * Obtém histórico privado de uma associação.
   *
   * @param {string} charityId Identificador da associação.
   * @returns {Promise<{ charityId: string, totalCents: number, rows: object[] }>} Histórico de distribuição.
   */
  getCharityHistory(charityId) {
    return apiClient.get(`/api/charities/${charityId}/history`);
  },

  /**
   * Constrói URL para download CSV do histórico.
   *
   * @param {string} charityId Identificador da associação.
   * @returns {string} URL absoluta do CSV.
   */
  historyCsvUrl(charityId) {
    return apiUrl(`/api/charities/${charityId}/history.csv`);
  },

  /**
   * Liga um utilizador a uma associação.
   *
   * @param {string} charityId Identificador da associação.
   * @param {string} userId Identificador do utilizador.
   * @returns {Promise<{ membership: object }>} Ligação criada ou atualizada.
   */
  linkUserToCharity(charityId, userId) {
    return apiClient.post(`/api/charities/${charityId}/members`, { userId });
  },
};
