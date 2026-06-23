/**
 * @file Validação de candidaturas públicas de associações.
 *
 * Mantém a fronteira de entrada da MF4 explícita: o frontend pode enviar apenas
 * campos públicos da candidatura e o backend decide sempre o estado inicial.
 */

/**
 * Expressão regular simples para rejeitar emails obviamente inválidos.
 * A validação final de existência do domínio fica fora do âmbito do MVP.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Cria um erro HTTP controlado para validações da candidatura.
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
 * Valida texto obrigatório com limites de tamanho.
 *
 * @param {unknown} value Valor recebido no corpo do pedido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho mínimo.
 * @param {number} max Tamanho máximo.
 * @returns {string} Texto normalizado.
 */
function requiredText(value, field, min, max) {
  const text = String(value ?? "").trim();

  if (text.length < min || text.length > max) {
    throw httpError(`${field} inválido.`);
  }

  return text;
}

/**
 * Normaliza website público opcional.
 *
 * @param {unknown} value URL recebida no formulário.
 * @returns {string} URL normalizada ou string vazia.
 * @throws {Error} Quando o protocolo não é `http` nem `https`.
 */
function optionalPublicUrl(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  let url;

  try {
    url = new URL(text);
  } catch {
    throw httpError("Website inválido.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw httpError("Website deve começar por http:// ou https://.");
  }

  return url.toString();
}

/**
 * Valida e filtra os campos aceites numa candidatura pública.
 *
 * @param {Record<string, unknown>} input Corpo recebido em `POST /api/charities/applications`.
 * @returns {{ name: string, contactName: string, email: string, phone: string, mission: string, websiteUrl: string }} Dados seguros para persistir.
 * @throws {Error} Quando algum campo obrigatório é inválido.
 */
export function assertCharityApplicationPayload(input) {
  const name = requiredText(input.name, "Nome", 3, 120);
  const contactName = requiredText(input.contactName, "Contacto", 3, 120);
  const email = String(input.email ?? "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw httpError("Email inválido.");
  }

  // O retorno inclui apenas campos permitidos; estado e revisão são definidos pelo backend.
  return {
    name,
    contactName,
    email,
    phone: String(input.phone ?? "").trim(),
    mission: requiredText(input.mission, "Missão", 30, 1200),
    websiteUrl: optionalPublicUrl(input.websiteUrl),
  };
}
