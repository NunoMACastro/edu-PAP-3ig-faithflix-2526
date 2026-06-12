import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

/**
 * Converts a public id into a MongoDB ObjectId.
 *
 * @param {string} id - Raw id received from route params or session.
 * @param {string} label - Portuguese domain label used in validation errors.
 * @returns {import("mongodb").ObjectId} Safe MongoDB ObjectId.
 */
export function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Validates the canonical FaithFlix rating scale.
 *
 * @param {unknown} value - Raw value received from the request body.
 * @returns {number} Integer rating between 1 and 5.
 */
export function assertRatingValue(value) {
    const rating = Number(value);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new HttpError(400, "O rating deve ser um inteiro entre 1 e 5.");
    }

    return rating;
}
