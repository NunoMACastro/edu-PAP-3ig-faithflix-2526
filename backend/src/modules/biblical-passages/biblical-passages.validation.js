/**
 * @file Validação do módulo editorial de passagens bíblicas.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";
import { parsePagination } from "../../utils/pagination.js";

export const BIBLICAL_PASSAGE_STATUS = ["draft", "published", "archived"];

/**
 * Normaliza texto obrigatório com limites explícitos.
 *
 * @param {unknown} value Valor bruto.
 * @param {string} field Nome do campo para mensagens de erro.
 * @param {number} min Tamanho mínimo.
 * @param {number} max Tamanho máximo.
 * @returns {string} Texto seguro.
 */
function requiredText(value, field, min, max) {
    const text = typeof value === "string" ? value.trim() : "";

    if (text.length < min || text.length > max) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return text;
}

/**
 * Normaliza texto opcional sem guardar strings gigantes.
 *
 * @param {unknown} value Valor bruto.
 * @param {number} max Tamanho máximo.
 * @returns {string} Texto normalizado.
 */
function optionalText(value, max, field) {
    if (value === undefined) {
        return "";
    }

    if (typeof value !== "string") {
        throw new HttpError(400, `${field} invalido.`);
    }

    const text = value.trim();

    if (text.length > max) {
        throw new HttpError(400, `${field} nao pode exceder ${max} caracteres.`);
    }

    return text;
}

/**
 * Valida inteiros positivos usados em capítulos e versículos.
 *
 * @param {unknown} value Valor bruto.
 * @param {string} field Nome do campo.
 * @returns {number} Inteiro positivo.
 */
function positiveInteger(value, field) {
    if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value <= 0
    ) {
        throw new HttpError(400, `${field} deve ser um inteiro positivo.`);
    }

    return value;
}

/**
 * Converte um id público em ObjectId com erro de domínio.
 *
 * @param {unknown} value Valor bruto.
 * @param {string} field Nome de domínio.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
export function asObjectId(value, field) {
    const id = typeof value === "string" ? value.trim() : "";

    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Valida o estado editorial fechado de uma passagem.
 *
 * @param {unknown} status Estado bruto.
 * @returns {"draft" | "published" | "archived"} Estado seguro.
 */
export function assertBiblicalPassageStatus(status) {
    const normalized = typeof status === "string" ? status.trim() : "";

    if (!BIBLICAL_PASSAGE_STATUS.includes(normalized)) {
        throw new HttpError(400, "Estado de passagem biblica invalido.");
    }

    return normalized;
}

/**
 * Valida o intervalo bíblico para impedir referências invertidas.
 *
 * @param {{ chapterStart: number, verseStart: number, chapterEnd: number, verseEnd: number }} range Intervalo normalizado.
 * @returns {void}
 */
function assertReferenceRange(range) {
    if (range.chapterEnd < range.chapterStart) {
        throw new HttpError(400, "Intervalo final nao pode ser anterior ao inicial.");
    }

    if (
        range.chapterEnd === range.chapterStart &&
        range.verseEnd < range.verseStart
    ) {
        throw new HttpError(400, "Intervalo final nao pode ser anterior ao inicial.");
    }
}

/**
 * Valida payload de criação/atualização de passagens bíblicas.
 *
 * @param {Record<string, unknown>} input Dados recebidos.
 * @returns {Record<string, unknown>} Payload seguro para persistência.
 */
export function assertBiblicalPassagePayload(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Payload de passagem biblica invalido.");
    }

    const chapterStart = positiveInteger(input.chapterStart, "chapterStart");
    const verseStart = positiveInteger(input.verseStart, "verseStart");
    const chapterEnd =
        input.chapterEnd === undefined
            ? chapterStart
            : positiveInteger(input.chapterEnd, "chapterEnd");
    const verseEnd =
        input.verseEnd === undefined
            ? verseStart
            : positiveInteger(input.verseEnd, "verseEnd");

    const payload = {
        book: requiredText(input.book, "book", 2, 80),
        chapterStart,
        verseStart,
        chapterEnd,
        verseEnd,
        translation: requiredText(
            input.translation === undefined ? "ARA" : input.translation,
            "translation",
            2,
            24,
        ),
        text: requiredText(input.text, "text", 10, 2500),
        theme: optionalText(input.theme, 120, "theme"),
        reflection: optionalText(input.reflection, 1000, "reflection"),
    };

    assertReferenceRange(payload);
    return payload;
}

/**
 * Valida payload de associação entre conteúdo e passagem.
 *
 * @param {Record<string, unknown>} input Dados recebidos.
 * @returns {{ passageId: import("mongodb").ObjectId, note: string, sortOrder: number }} Payload seguro.
 */
export function assertBiblicalPassageAssociationPayload(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Associacao biblica invalida.");
    }

    const sortOrder = input.sortOrder === undefined ? 0 : input.sortOrder;

    if (
        typeof sortOrder !== "number" ||
        !Number.isSafeInteger(sortOrder) ||
        sortOrder < 0
    ) {
        throw new HttpError(400, "sortOrder deve ser um inteiro nao negativo.");
    }

    return {
        passageId: asObjectId(input.passageId, "Passagem biblica"),
        note: optionalText(input.note, 500, "note"),
        sortOrder,
    };
}

/**
 * Valida paginação das listas de passagens.
 *
 * @param {Record<string, unknown>} input Query params recebidos.
 * @returns {{ page: number, limit: number }} Paginação segura.
 */
export function parseBiblicalPassagePagination(input = {}) {
    return parsePagination(input, { defaultLimit: 50, maxLimit: 50 });
}

/**
 * Valida filtros administrativos de passagens bíblicas.
 *
 * @param {Record<string, unknown>} input Query params recebidos.
 * @returns {{ search: string, status: string }} Filtros seguros.
 */
export function parseAdminBiblicalPassageFilters(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Filtros de passagens bíblicas inválidos.");
    }

    if (input.search !== undefined && typeof input.search !== "string") {
        throw new HttpError(400, "Pesquisa de passagens bíblicas inválida.");
    }
    if (input.status !== undefined && typeof input.status !== "string") {
        throw new HttpError(400, "Estado de passagem bíblica inválido.");
    }

    const search = input.search?.trim() ?? "";
    const status = input.status?.trim() ?? "";
    if (search.length > 80) {
        throw new HttpError(400, "A pesquisa não pode exceder 80 caracteres.");
    }
    if (status && !BIBLICAL_PASSAGE_STATUS.includes(status)) {
        throw new HttpError(400, "Estado de passagem bíblica inválido.");
    }

    return { search, status };
}
