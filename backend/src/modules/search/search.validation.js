export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertSearchQuery(value) {
  const query = String(value ?? "").replace(/\s+/g, " ").trim();

  if (query.length < 2 || query.length > 80) {
    const error = new Error("A pesquisa deve ter entre 2 e 80 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return query;
}

export function parsePagination(input) {
  const page = Number(input.page ?? 1);
  const limit = Number(input.limit ?? 12);

  if (!Number.isInteger(page) || page < 1) {
    const error = new Error("Pagina invalida.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 24) {
    const error = new Error("Limite invalido.");
    error.statusCode = 400;
    throw error;
  }

  return { page, limit };
}