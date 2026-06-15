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
  const value = String(month ?? "").trim();
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw httpError("Mês de distribuição inválido. Usa YYYY-MM.");
  }

  const monthNumber = Number(value.slice(5, 7));
  if (monthNumber < 1 || monthNumber > 12) {
    throw httpError("Mês de distribuição inválido.");
  }

  return value;
}