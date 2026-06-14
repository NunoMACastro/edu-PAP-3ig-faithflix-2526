/**
 * Valida os valores aceites para planos e subscrições da MF4.
 *
 * Este ficheiro existe para impedir que cada aluno invente nomes diferentes
 * para ciclos e estados. Os services e controllers devem usar estes helpers
 * antes de persistir dados de subscrição.
 */
export const PLAN_INTERVALS = ["monthly", "yearly"];
export const SUBSCRIPTION_STATUS = ["active", "past_due", "expired", "canceled"];

/**
 * Cria um erro HTTP simples para validacoes de subscrição.
 *
 * @param {string} message - Mensagem segura para devolver ao frontend.
 * @param {number} statusCode - Código HTTP que o error handler deve usar.
 * @returns {Error} Erro com `statusCode` preenchido.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Confirma que o ciclo do plano e um dos ciclos aceites.
 *
 * @param {unknown} interval - Valor recebido do plano persistido ou de seed.
 * @returns {"monthly"|"yearly"} Ciclo normalizado.
 * @throws {Error} Quando o ciclo não pertence ao contrato da MF4.
 */
export function assertPlanInterval(interval) {
  const value = String(interval ?? "").trim();
  if (!PLAN_INTERVALS.includes(value)) {
    throw httpError("Ciclo de plano inválido.");
  }
  return value;
}

/**
 * Confirma que o estado de subscrição existe no contrato da MF4.
 *
 * @param {unknown} status - Estado recebido de input ou da base de dados.
 * @returns {string} Estado normalizado.
 * @throws {Error} Quando o estado não e reconhecido.
 */
export function assertSubscriptionStatus(status) {
  const value = String(status ?? "").trim();
  if (!SUBSCRIPTION_STATUS.includes(value)) {
    throw httpError("Estado de subscrição inválido.");
  }
  return value;
}

/**
 * Calcula a data final do ciclo de billing.
 *
 * @param {Date|string|number} date - Data inicial do ciclo.
 * @param {"monthly"|"yearly"} interval - Ciclo validado do plano.
 * @returns {Date} Data de fim do ciclo seguinte.
 * @throws {Error} Quando a data inicial e inválida.
 */
export function addBillingCycle(date, interval) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw httpError("Data de início inválida.");
  }

  const next = new Date(source);
  // Usamos métodos de Date para preservar meses/anos reais em vez de assumir sempre 30 dias.
  if (interval === "monthly") next.setMonth(next.getMonth() + 1);
  if (interval === "yearly") next.setFullYear(next.getFullYear() + 1);
  return next;
}

/**
 * Indica se um estado deve bloquear acesso premium.
 *
 * @param {string} status - Estado da subscrição.
 * @returns {boolean} `true` quando playback premium deve ser recusado.
 */
export function isBlockingStatus(status) {
  return ["past_due", "expired", "canceled"].includes(status);
}