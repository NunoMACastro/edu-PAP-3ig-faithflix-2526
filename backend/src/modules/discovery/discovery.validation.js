/**
 * @file Ficheiro `real_dev/backend/src/modules/discovery/discovery.validation.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

/**
 * Converte um id público num ObjectId MongoDB.
 *
 * @param {string} id - Id bruto recebido dos parâmetros da rota.
 * @param {string} label - Portuguese domain label used in errors.
 * @returns {import("mongodb").ObjectId} ObjectId seguro.
 */
export function asObjectId(id, label) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}
