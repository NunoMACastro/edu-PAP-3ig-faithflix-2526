/**
 * @file Ficheiro `real_dev/backend/src/modules/charities/charity-review.validation.js` da implementação real_dev.
 */

/**
 * Decisões aceites no processo de revisão de candidaturas.
 * Qualquer outro estado e controlado por outros fluxos do módulo.
 */
export const REVIEW_DECISIONS = ["approved", "rejected"];

/**
 * Cria um erro HTTP previsivel para validação de revisão.
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
 * Valida a decisão administrativa sobre uma candidatura.
 *
 * @param {object} input Corpo recebido na rota de revisão.
 * @param {string} input.decision Decisão pretendida.
 * @param {string} [input.reason] Motivo, obrigatório em rejeicoes.
 * @returns {{ decision: string, reason: string }} Decisão normalizada.
 * @throws {Error} Quando a decisão e inválida ou a rejeição não tem motivo suficiente.
 */
export function assertReviewPayload(input) {
  const decision = String(input.decision ?? "").trim();
  const reason = String(input.reason ?? "").trim();

  if (!REVIEW_DECISIONS.includes(decision)) {
    throw httpError("Decisão inválida.");
  }

  if (decision === "rejected" && reason.length < 10) {
    throw httpError("Motivo de rejeição obrigatório.");
  }

  return { decision, reason };
}