/**
 * @file Ficheiro `real_dev/backend/src/modules/ratings/ratings.validation.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

/**
 * Converte um id público num ObjectId MongoDB.
 *
 * @param {string} id - Id bruto recebido dos parâmetros da rota ou da sessão.
 * @param {string} label - Portuguese domain label used in validation errors.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB seguro.
 */
export function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Valida a escala canónica de classificação FaithFlix.
 *
 * @param {unknown} value - Valor bruto recebido no corpo do pedido.
 * @returns {number} Classificação inteira entre 1 e 5.
 */
export function assertRatingValue(value) {
    const rating = Number(value);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new HttpError(400, "O rating deve ser um inteiro entre 1 e 5.");
    }

    return rating;
}
