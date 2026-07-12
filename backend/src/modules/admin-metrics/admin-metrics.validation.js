/**
 * @file Validacao de filtros temporais do painel admin.
 */

import { HttpError } from "../../utils/http-error.js";

const MAX_RANGE_DAYS = 366;
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converte uma data opcional da query string.
 *
 * @param {unknown} value Valor recebido.
 * @param {string} field Nome do campo.
 * @returns {Date | null} Início UTC do dia validado.
 * @throws {HttpError} Quando a data e invalida.
 */
function optionalDate(value, field) {
    if (value === undefined || value === "") {
        return null;
    }

    if (typeof value !== "string") {
        throw new HttpError(400, `${field} deve ser uma data valida.`);
    }

    const match = ISO_DAY_PATTERN.exec(value);
    if (!match) throw new HttpError(400, `${field} deve usar YYYY-MM-DD.`);

    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new HttpError(400, `${field} deve ser uma data valida.`);
    }

    return date;
}

/**
 * Valida intervalo temporal de metricas admin.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string recebida.
 * @returns {{ fromInclusive: Date, toExclusive: Date }} Intervalo UTC semiaberto.
 */
export function assertMetricsRange(query = {}) {
    if (!query || typeof query !== "object" || Array.isArray(query)) {
        throw new HttpError(400, "Filtros temporais invalidos.");
    }

    const now = new Date();
    const todayUtc = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
    ));
    const toInclusive = optionalDate(query.to, "to") ?? todayUtc;
    const fromInclusive =
        optionalDate(query.from, "from") ??
        new Date(toInclusive.getTime() - 29 * DAY_MS);

    if (fromInclusive > toInclusive) {
        throw new HttpError(400, "from deve ser anterior ou igual a to.");
    }

    const rangeDays =
        (toInclusive.getTime() - fromInclusive.getTime()) / DAY_MS + 1;

    if (rangeDays > MAX_RANGE_DAYS) {
        throw new HttpError(400, "O intervalo maximo e de 366 dias.");
    }

    return {
        fromInclusive,
        toExclusive: new Date(toInclusive.getTime() + DAY_MS),
    };
}
