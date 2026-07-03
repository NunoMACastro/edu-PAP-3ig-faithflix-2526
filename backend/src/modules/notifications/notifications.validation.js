/**
 * @file Validações de entrada do módulo de notificações.
 *
 * Define tipos aceites, conteúdo mínimo e preferências para impedir dadoss
 * ambíguos antes de qualquer escrita nas coleções da MF4.
 */

/**
 * Tipos de notificação gerados pelo backend.
 * A lista fechada evita grafias diferentes para o mesmo evento de negócio.
 */
export const NOTIFICATION_TYPES = [
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "continue_watching",
  "family_invitation",
  "family_invitation_accepted",
  "family_member_removed",
];

/**
 * Cria um erro HTTP previsível para falhas de validação.
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
 * Valida e normaliza o tipo de notificação.
 *
 * @param {unknown} type Tipo recebido do service.
 * @returns {string} Tipo canónico.
 * @throws {Error} Quando o tipo não pertence ao contrato fechado.
 */
export function assertNotificationType(type) {
  const value = String(type ?? "").trim();

  if (!NOTIFICATION_TYPES.includes(value)) {
    throw httpError("Tipo de notificação inválido.");
  }

  return value;
}

/**
 * Valida texto obrigatório de notificação.
 *
 * @param {unknown} value Valor recebido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho mínimo.
 * @param {number} max Tamanho máximo.
 * @returns {string} Texto normalizado.
 */
function requiredNotificationText(value, field, min, max) {
  const text = String(value ?? "").trim();

  if (text.length < min || text.length > max) {
    throw httpError(`${field} deve ter entre ${min} e ${max} caracteres.`);
  }

  return text;
}

/**
 * Valida título e mensagem de uma notificação.
 *
 * @param {Record<string, unknown>} input Dados de entrada.
 * @returns {{ title: string, message: string }} Conteúdo seguro para persistir.
 */
export function assertNotificationContent(input) {
  return {
    title: requiredNotificationText(input.title, "Titulo", 3, 120),
    message: requiredNotificationText(input.message, "Mensagem", 3, 240),
  };
}

/**
 * Valida preferências de notificação com valores por defeito.
 *
 * @param {Record<string, unknown>} input Dados de entrada.
 * @returns {{ inApp: boolean, email: boolean, continueWatching: boolean }} Preferências normalizadas.
 */
export function assertPreferencePayload(input) {
  return {
    inApp: Boolean(input.inApp ?? true),
    email: Boolean(input.email ?? false),
    continueWatching: Boolean(input.continueWatching ?? true),
  };
}
