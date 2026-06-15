/**
 * Tipos de notificação gerados pelo backend.
 * A lista fechada evita grafias diferentes para o mesmo evento de negócio.
 */
export const NOTIFICATION_TYPES = [
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "continue_watching",
];

/**
 * Cria um erro HTTP previsivel para validação de notificações.
 *
 * @param {string} message Mensagem segura para o cliente.
 * @param {number} [statusCode=400] Código HTTP de validação.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Garante que o tipo recebido pertence ao contrato público do módulo.
 *
 * @param {string} type Tipo recebido no evento.
 * @returns {string} Tipo normalizado.
 * @throws {Error} Quando o tipo não existe na lista fechada.
 */
export function assertNotificationType(type) {
  const value = String(type ?? "").trim();
  if (!NOTIFICATION_TYPES.includes(value)) {
    throw httpError("Tipo de notificação inválido.");
  }
  return value;
}

/**
 * Valida texto obrigatório usado em titulo e mensagem.
 *
 * @param {string} value Valor recebido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho mínimo.
 * @param {number} max Tamanho maximo.
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
 * Valida o conteúdo visível de uma notificação.
 *
 * @param {object} input Dados recebidos pelo service.
 * @returns {{ title: string, message: string }} Conteúdo seguro para persistir.
 */
export function assertNotificationContent(input) {
  return {
    title: requiredNotificationText(input.title, "Titulo", 3, 120),
    message: requiredNotificationText(input.message, "Mensagem", 3, 240),
  };
}

/**
 * Normaliza preferências de notificação guardadas por utilizador.
 *
 * @param {object} input Preferências recebidas da UI.
 * @returns {{ inApp: boolean, email: boolean, continueWatching: boolean }} Preferências persistiveis.
 */
export function assertPreferencePayload(input) {
  return {
    inApp: Boolean(input.inApp ?? true),
    email: Boolean(input.email ?? false),
    continueWatching: Boolean(input.continueWatching ?? true),
  };
}