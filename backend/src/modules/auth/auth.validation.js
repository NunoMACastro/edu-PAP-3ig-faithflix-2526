const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function assertValidName(name) {
  const value = String(name ?? "").trim();
  if (value.length < 2 || value.length > 80) {
    throw httpError("O nome deve ter entre 2 e 80 caracteres.");
  }
  return value;
}

export function assertValidEmail(email) {
  const value = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(value)) {
    throw httpError("Email invalido.");
  }
  return value;
}

export function assertValidPassword(password) {
  const value = String(password ?? "");
  if (value.length < 10) {
    throw httpError("A password deve ter pelo menos 10 caracteres.");
  }
  return value;
}