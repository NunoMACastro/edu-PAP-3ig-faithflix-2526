/**
 * @file Ficheiro `real_dev/backend/src/modules/library/library.validation.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const LIST_TYPES = ["favorite", "watchlist"];

/**
 * Converte uma string de id em ObjectId.
 *
 * @param {string} id - Id bruto.
 * @param {string} label - Domain label for errors.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
export function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Valida um tipo de lista da biblioteca pessoal.
 *
 * @param {string} type - Tipo bruto de lista.
 * @returns {string} Tipo de lista seguro.
 */
export function assertListType(type) {
    if (!LIST_TYPES.includes(type)) {
        throw new HttpError(400, "Tipo de lista invalido.");
    }

    return type;
}
