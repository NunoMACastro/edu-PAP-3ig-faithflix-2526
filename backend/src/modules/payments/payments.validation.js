/**
 * @file Ficheiro `real_dev/backend/src/modules/payments/payments.validation.js` da implementação real_dev.
 */

/**
 * Métodos e resultados aceites pelo checkout de demonstração.
 * A lista fechada impede que a UI ou a API sugiram recolha de dados financeiros reais.
 */
export const PAYMENT_METHODS = ["card_test", "mbway_test", "transfer_test"];
export const SIMULATED_OUTCOMES = ["approved", "failed"];
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]+$/;

/**
 * Cria um erro HTTP previsivel para o middleware global de erros.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Código HTTP associado a erros de validação.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Valida a chave que torna checkout e trial repetíveis sem duplicar efeitos.
 *
 * A chave fica limitada a ASCII seguro e 128 caracteres para impedir valores
 * ambíguos, control characters e crescimento ilimitado dos índices MongoDB.
 *
 * @param {unknown} value Valor do header HTTP `Idempotency-Key`.
 * @returns {string} Chave normalizada.
 * @throws {Error} Quando o header falta ou não respeita o contrato.
 */
export function assertIdempotencyKey(value) {
  const key = typeof value === "string" ? value.trim() : "";

  if (!key) {
    const error = httpError("Idempotency-Key obrigatório.", 400);
    error.code = "IDEMPOTENCY_KEY_REQUIRED";
    throw error;
  }

  if (key.length > 128 || !IDEMPOTENCY_KEY_PATTERN.test(key)) {
    const error = httpError("Idempotency-Key inválido.", 400);
    error.code = "IDEMPOTENCY_KEY_INVALID";
    throw error;
  }

  if (key.toLowerCase().startsWith("renewal:")) {
    const error = httpError(
      "Idempotency-Key usa um namespace interno reservado.",
      400,
    );
    error.code = "IDEMPOTENCY_KEY_RESERVED";
    throw error;
  }

  return key;
}

/**
 * Valida e normaliza o pedido de checkout simulado.
 *
 * @param {object} input Corpo recebido no endpoint de checkout.
 * @param {string} input.planCode Código do plano escolhido.
 * @param {string} input.paymentMethod Método de pagamento de teste.
 * @param {string} [input.simulateOutcome="approved"] Resultado controlado para a demo.
 * @returns {{ planCode: string, paymentMethod: string, simulateOutcome: string }} Dados seguros.
 * @throws {Error} Quando o plano, método ou resultado não respeitam o contrato.
 */
export function assertCheckoutPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("Pedido de checkout inválido.");
  }

  const planCode = typeof input.planCode === "string" ? input.planCode.trim() : "";
  const paymentMethod = typeof input.paymentMethod === "string"
    ? input.paymentMethod.trim()
    : "";
  const simulateOutcome = input.simulateOutcome === undefined
    ? "approved"
    : typeof input.simulateOutcome === "string"
      ? input.simulateOutcome.trim()
      : "";

  // O backend aceita apenas identificadores de teste; nunca recebe número de cartão ou token financeiro.
  if (!planCode) throw httpError("Plano obrigatório.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw httpError("Método de pagamento inválido.");
  if (!SIMULATED_OUTCOMES.includes(simulateOutcome)) {
    throw httpError("Não foi possível processar o pagamento.");
  }

  return { planCode, paymentMethod, simulateOutcome };
}
