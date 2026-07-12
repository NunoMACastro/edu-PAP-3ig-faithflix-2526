/**
 * @file Ficheiro `real_dev/backend/src/modules/charities/pool-distribution.validation.js` da implementação real_dev.
 */

/**
 * Cria um erro HTTP previsivel para validação do mês de distribuição.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Código HTTP associado.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Valida o mês operacional da distribuição no formato `YYYY-MM`.
 *
 * @param {string} month Valor recebido da API ou da UI.
 * @returns {string} Mês normalizado.
 * @throws {Error} Quando o formato ou o número do mês e inválido.
 */
export function assertDistributionMonth(month) {
  const value = typeof month === "string" ? month.trim() : "";
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw httpError("Mês de distribuição inválido. Usa YYYY-MM.");
  }

  const monthNumber = Number.parseInt(value.slice(5, 7), 10);
  if (monthNumber < 1 || monthNumber > 12) {
    throw httpError("Mês de distribuição inválido.");
  }

  return value;
}

/**
 * Valida o token hexadecimal emitido pela pré-visualização financeira.
 *
 * @param {unknown} token Valor recebido no POST administrativo.
 * @returns {string} SHA-256 hexadecimal normalizado.
 */
export function assertDistributionPreviewToken(token) {
  const value = typeof token === "string" ? token.trim().toLowerCase() : "";
  if (!/^[a-f0-9]{64}$/.test(value)) {
    const error = httpError("Pré-visualização da distribuição obrigatória.", 428);
    error.code = "POOL_PREVIEW_REQUIRED";
    throw error;
  }
  return value;
}
