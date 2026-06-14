/**
 * Métodos e resultados aceites pelo checkout de demonstração.
 * A lista fechada impede que a UI ou a API sugiram recolha de dados financeiros reais.
 */
export const PAYMENT_METHODS = ["card_test", "mbway_test", "transfer_test"];
export const SIMULATED_OUTCOMES = ["approved", "failed"];

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
 * Valida e normaliza o pedido de checkout simulado.
 *
 * @param {object} input Corpo recebido no endpoint de checkout.
 * @param {string} input.planCode Código do plano escolhido.
 * @param {string} input.paymentMethod Método de pagamento de teste.
 * @param {string} [input.simulateOutcome="approved"] Resultado controlado para a demo.
 * @returns {{ planCode: string, paymentMethod: string, simulateOutcome: string }} Payload seguro.
 * @throws {Error} Quando o plano, método ou resultado não respeitam o contrato.
 */
export function assertCheckoutPayload(input) {
  const planCode = String(input.planCode ?? "").trim();
  const paymentMethod = String(input.paymentMethod ?? "").trim();
  const simulateOutcome = String(input.simulateOutcome ?? "approved").trim();

  // O backend aceita apenas identificadores de teste; nunca recebe número de cartão ou token financeiro.
  if (!planCode) throw httpError("Plano obrigatório.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw httpError("Método de pagamento inválido.");
  if (!SIMULATED_OUTCOMES.includes(simulateOutcome)) throw httpError("Resultado simulado inválido.");

  return { planCode, paymentMethod, simulateOutcome };
}