/**
 * @file Ficheiro `real_dev/backend/src/modules/subscriptions/subscriptions.validation.js` da implementação real_dev.
 */

/**
 * Valida os valores aceites para planos e subscrições da MF4.
 *
 * Este ficheiro existe para impedir que cada aluno invente nomes diferentes
 * para ciclos e estados. Os services e controllers devem usar estes helpers
 * antes de persistir dados de subscrição.
 */
export const PLAN_INTERVALS = ["monthly", "yearly"];
export const SUBSCRIPTION_STATUS = ["active", "trialing", "past_due", "expired", "canceled"];
export const FAMILY_MEMBERSHIP_STATUS = ["pending", "active", "declined", "removed", "left"];

/**
 * Cria um erro HTTP simples para validacoes de subscrição.
 *
 * @param {string} message - Mensagem segura para devolver ao frontend.
 * @param {number} statusCode - Código HTTP que o middleware de erro deve usar.
 * @returns {Error} Erro com `statusCode` definido.
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
  const value = typeof interval === "string" ? interval.trim() : "";
  if (!PLAN_INTERVALS.includes(value)) {
    throw httpError("Ciclo de plano inválido.");
  }
  return value;
}

/**
 * Confirma que o estado de subscrição existe no contrato da MF4.
 *
 * @param {unknown} estado - Estado recebido de input ou da base de dados.
 * @returns {string} Estado normalizado.
 * @throws {Error} Quando o estado não e reconhecido.
 */
export function assertSubscriptionStatus(status) {
  const value = typeof status === "string" ? status.trim() : "";
  if (!SUBSCRIPTION_STATUS.includes(value)) {
    throw httpError("Estado de subscrição inválido.");
  }
  return value;
}

/**
 * Confirma que o estado de uma membership familiar pertence ao contrato MF9.
 *
 * @param {unknown} status - Estado recebido de input ou persistencia.
 * @returns {string} Estado normalizado.
 * @throws {Error} Quando o estado não e reconhecido.
 */
export function assertFamilyMembershipStatus(status) {
  const value = typeof status === "string" ? status.trim() : "";
  if (!FAMILY_MEMBERSHIP_STATUS.includes(value)) {
    throw httpError("Estado de partilha familiar inválido.");
  }
  return value;
}

/**
 * Calcula a data final do ciclo de billing.
 *
 * @param {Date|string|number} date - Data inicial do ciclo.
 * @param {"monthly"|"yearly"} interval - Ciclo validado do plano.
 * @param {{ anchorDay?: number, anchorEndOfMonth?: boolean }} [options] Âncora persistida do primeiro ciclo.
 * @returns {Date} Data de fim do ciclo seguinte.
 * @throws {Error} Quando a data inicial e inválida.
 */
export function addBillingCycle(date, interval, options = {}) {
  const source = new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw httpError("Data de início inválida.");
  }

  const normalizedInterval = assertPlanInterval(interval);
  const sourceLastDay = new Date(
    Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const anchorDay = Number.isInteger(options.anchorDay)
    ? options.anchorDay
    : source.getUTCDate();
  if (anchorDay < 1 || anchorDay > 31) {
    throw httpError("Dia âncora de billing inválido.");
  }
  const anchorEndOfMonth = options.anchorEndOfMonth === undefined
    ? source.getUTCDate() === sourceLastDay
    : options.anchorEndOfMonth === true;
  const next = new Date(source);

  // Mudar primeiro para o dia 1 evita o overflow nativo de 31 de janeiro para
  // março. No fim, o dia é limitado ao último dia UTC do mês de destino.
  next.setUTCDate(1);
  if (normalizedInterval === "monthly") {
    next.setUTCMonth(next.getUTCMonth() + 1);
  } else {
    next.setUTCFullYear(next.getUTCFullYear() + 1);
  }

  const lastDayOfTargetMonth = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate();
  next.setUTCDate(
    anchorEndOfMonth
      ? lastDayOfTargetMonth
      : Math.min(anchorDay, lastDayOfTargetMonth),
  );
  return next;
}

/**
 * Indica se um estado deve bloquear acesso premium.
 *
 * @param {string} estado - Estado da subscrição.
 * @returns {boolean} `true` quando a reprodução premium deve ser recusada.
 */
export function isBlockingStatus(status) {
  return !["active", "trialing"].includes(status);
}
