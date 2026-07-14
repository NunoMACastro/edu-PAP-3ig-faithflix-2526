/**
 * @file Validação estrita da consulta à caixa de email local.
 */

import { HttpError } from "../../utils/http-error.js";
import { assertValidEmail } from "../auth/auth.validation.js";

/**
 * Valida o corpo fechado `{ email }`.
 *
 * @param {unknown} input Corpo recebido.
 * @returns {{ email: string }} Email normalizado.
 * @throws {HttpError} Quando o corpo contém campos livres ou email inválido.
 */
export function assertDemoMailboxQuery(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Consulta da caixa de email inválida.");
    }

    const fields = Object.keys(input);
    if (fields.length !== 1 || fields[0] !== "email") {
        throw new HttpError(400, "Consulta da caixa de email inválida.");
    }

    return { email: assertValidEmail(input.email) };
}
