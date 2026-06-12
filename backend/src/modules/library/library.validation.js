import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const LIST_TYPES = ["favorite", "watchlist"];

/**
 * Converts a string id into ObjectId.
 *
 * @param {string} id - Raw id.
 * @param {string} label - Domain label for errors.
 * @returns {import("mongodb").ObjectId} MongoDB ObjectId.
 */
export function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Validates a personal-library list type.
 *
 * @param {string} type - Raw list type.
 * @returns {string} Safe list type.
 */
export function assertListType(type) {
    if (!LIST_TYPES.includes(type)) {
        throw new HttpError(400, "Tipo de lista invalido.");
    }

    return type;
}
