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