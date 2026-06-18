// apps/backend/src/modules/admin-metrics/admin-metrics.validation.js
import { HttpError } from "../../utils/http-error.js";

const MAX_RANGE_DAYS = 366;

/**
 * Converte uma data opcional de query string.
 *
 * @param {unknown} value Valor recebido.
 * @param {string} field Nome do campo.
 * @returns {Date | null} Data validada ou null.
 * @throws {HttpError} Quando a data é inválida.
 */
function optionalDate(value, field) {
    if (!value) return null;

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        throw new HttpError(400, `${field} deve ser uma data válida.`);
    }

    return date;
}

/**
 * Valida filtros temporais do painel admin.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string recebida.
 * @returns {{ from: Date, to: Date }} Intervalo validado.
 */
export function assertMetricsRange(query = {}) {
    const now = new Date();
    const to = optionalDate(query.to, "to") ?? now;
    const from =
        optionalDate(query.from, "from") ??
        new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (from > to) {
        throw new HttpError(400, "from deve ser anterior ou igual a to.");
    }

    const rangeDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);

    if (rangeDays > MAX_RANGE_DAYS) {
        throw new HttpError(400, "O intervalo máximo é de 366 dias.");
    }

    return { from, to };
}