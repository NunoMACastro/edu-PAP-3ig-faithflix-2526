export const VALID_ROLES = ["user", "moderator", "admin"];

export function assertProfileUpdate(input) {
  const name = String(input.name ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    const error = new Error("O nome deve ter entre 2 e 80 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return { name };
}

export function assertRoleUpdate(input) {
  const role = String(input.role ?? "").trim();

  if (!VALID_ROLES.includes(role)) {
    const error = new Error("Role invalida.");
    error.statusCode = 400;
    throw error;
  }

  return { role };
}

export function assertParentalSettings(input) {
  const parentalMaxAgeRating = Number(input.parentalMaxAgeRating);

  if (!Number.isInteger(parentalMaxAgeRating) || parentalMaxAgeRating < 0 || parentalMaxAgeRating > 18) {
    const error = new Error("Limite parental invalido.");
    error.statusCode = 400;
    throw error;
  }

  return { parentalMaxAgeRating };
}