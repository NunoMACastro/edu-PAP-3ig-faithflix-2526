import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

/**
 * Converts a public id into a MongoDB ObjectId.
 *
 * @param {string} id - Raw id from route params.
 * @param {string} label - Portuguese domain label used in errors.
 * @returns {import("mongodb").ObjectId} Safe ObjectId.
 */
export function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}
