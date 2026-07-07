/**
 * @file Validação do módulo editorial de passagens bíblicas.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

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
    const text = String(value ?? "").trim();

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
function optionalText(value, max) {
    const text = String(value ?? "").trim();
    return text.length > max ? text.slice(0, max) : text;
}

/**
 * Valida inteiros positivos usados em capítulos e versículos.
 *
 * @param {unknown} value Valor bruto.
 * @param {string} field Nome do campo.
 * @returns {number} Inteiro positivo.
 */
function positiveInteger(value, field) {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw new HttpError(400, `${field} deve ser um inteiro positivo.`);
    }

    return number;
}

/**
 * Converte um id público em ObjectId com erro de domínio.
 *
 * @param {unknown} value Valor bruto.
 * @param {string} field Nome de domínio.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
export function asObjectId(value, field) {
    const id = String(value ?? "").trim();

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
    const normalized = String(status ?? "").trim();

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
    const chapterStart = positiveInteger(input.chapterStart, "chapterStart");
    const verseStart = positiveInteger(input.verseStart, "verseStart");
    const chapterEnd =
        input.chapterEnd === undefined || input.chapterEnd === null || input.chapterEnd === ""
            ? chapterStart
            : positiveInteger(input.chapterEnd, "chapterEnd");
    const verseEnd =
        input.verseEnd === undefined || input.verseEnd === null || input.verseEnd === ""
            ? verseStart
            : positiveInteger(input.verseEnd, "verseEnd");

    const payload = {
        book: requiredText(input.book, "book", 2, 80),
        chapterStart,
        verseStart,
        chapterEnd,
        verseEnd,
        translation: requiredText(input.translation ?? "ARA", "translation", 2, 24),
        text: requiredText(input.text, "text", 10, 2500),
        theme: optionalText(input.theme, 120),
        reflection: optionalText(input.reflection, 1000),
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
    const sortOrder = Number(input.sortOrder ?? 0);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw new HttpError(400, "sortOrder deve ser um inteiro nao negativo.");
    }

    return {
        passageId: asObjectId(input.passageId, "Passagem biblica"),
        note: optionalText(input.note, 500),
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
    const page = Number(input.page ?? 1);
    const limit = Number(input.limit ?? 50);

    if (!Number.isInteger(page) || page < 1) {
        throw new HttpError(400, "Pagina invalida.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        throw new HttpError(400, "Limite invalido.");
    }

    return { page, limit };
}
