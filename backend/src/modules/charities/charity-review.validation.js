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
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("Revisão inválida.");
  }

  const decision = typeof input?.decision === "string"
    ? input.decision.trim()
    : "";
  const reason = input?.reason === undefined
    ? ""
    : typeof input.reason === "string"
      ? input.reason.trim()
      : null;

  if (!REVIEW_DECISIONS.includes(decision)) {
    throw httpError("Decisão inválida.");
  }

  if (reason === null) {
    throw httpError("Motivo inválido.");
  }

  if (decision === "rejected" && reason.length < 10) {
    throw httpError("Motivo de rejeição obrigatório.");
  }

  if (reason.length > 500) {
    throw httpError("O motivo não pode exceder 500 caracteres.");
  }

  return { decision, reason };
}
