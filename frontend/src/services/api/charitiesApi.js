/**
 * Envia decisão administrativa para uma candidatura.
 *
 * @param {string} id Identificador da candidatura.
 * @param {object} input Decisão e motivo opcional.
 * @returns {Promise<object>} Resultado da revisão.
 */
reviewApplication(id, input) {
  return apiClient.patch(`/api/charities/applications/${encodeURIComponent(id)}/review`, input);
}

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
}