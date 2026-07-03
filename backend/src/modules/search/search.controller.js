/**
 * @file Ficheiro `real_dev/backend/src/modules/search/search.controller.js` da implementação real_dev.
 */

import { searchContents } from "./search.service.js";

/**
 * Documenta `getSearch`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getSearch`.
 * @param {unknown} res Valor recebido por `getSearch`.
 * @returns {Promise<unknown>} Resultado devolvido por `getSearch`.
 */
export async function getSearch(req, res) {
    return res.status(200).json(await searchContents(req.query));
}
