import { apiClient } from "./apiClient.js";


export const charitiesApi= {
  /**
   * Envia decisão administrativa para uma candidatura.
   *
   * @param {string} id Identificador da candidatura.
   * @param {object} input Decisão e motivo opcional.
   * @returns {Promise<object>} Resultado da revisão.
   */
  reviewApplication(id, input) {
    return apiClient.patch(`/api/charities/applications/${encodeURIComponent(id)}/review`, input);
  },

  /**
   * Executa a distribuição mensal no backend.
   *
   * @param {string} month Mês no formato `YYYY-MM`.
   * @returns {Promise<{ distribution: object }>} Distribuição criada.
   */
  runDistribution(month) {
    return apiClient.post("/api/charities/pool/distributions", { month });
  },
  /**
   * Consulta uma distribuição mensal já criada.
   *
   * @param {string} month Mês no formato `YYYY-MM`.
   * @returns {Promise<{ distribution: object }>} Distribuição existente.
   */
  getDistribution(month) {
    return apiClient.get(`/api/charities/pool/distributions/${encodeURIComponent(month)}`);
  },
    /**
   * Lista associações elegíveis para página pública.
   *
   * @returns {Promise<{ charities: object[] }>} Associações públicas.
   */
  listPublicCharities() {
    return apiClient.get("/api/charities/public");
  },
  /**
   * Obtem totais mensais agregados da pool.
   *
   * @returns {Promise<{ months: object[] }>} Meses recentes.
   */
  getPoolDashboard() {
    return apiClient.get("/api/charities/pool/dashboard");
  },
  /**
   * Obtem histórico privado de uma associação.
   *
   * @param {string} charityId Identificador da associação.
   * @returns {Promise<object>} Histórico com linhas mensais.
   */
  getCharityHistory(charityId) {
    return apiClient.get(`/api/charities/${encodeURIComponent(charityId)}/history`);
  },
  /**
   * Liga um utilizador a uma associação.
   *
   * @param {string} charityId Identificador da associação.
   * @param {string} userId Identificador do utilizador.
   * @returns {Promise<{ membership: object }>} Ligacao criada.
   */
  linkUserToCharity(charityId, userId) {
    return apiClient.post(`/api/charities/${encodeURIComponent(charityId)}/members`, { userId });
  }
}