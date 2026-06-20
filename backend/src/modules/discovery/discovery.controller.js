/**
 * @file Ficheiro `real_dev/backend/src/modules/discovery/discovery.controller.js` da implementação real_dev.
 */

import {
    getDiscoveryHome,
    getRelatedContent,
} from "./discovery.service.js";

/**
 * Documenta `getDiscoveryHomeController`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} _req Valor recebido por `getDiscoveryHomeController`.
 * @param {unknown} res Valor recebido por `getDiscoveryHomeController`.
 * @returns {Promise<unknown>} Resultado devolvido por `getDiscoveryHomeController`.
 */
export async function getDiscoveryHomeController(_req, res) {
    return res.status(200).json(await getDiscoveryHome());
}

/**
 * Documenta `getRelatedContentController`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getRelatedContentController`.
 * @param {unknown} res Valor recebido por `getRelatedContentController`.
 * @returns {Promise<unknown>} Resultado devolvido por `getRelatedContentController`.
 */
export async function getRelatedContentController(req, res) {
    return res.status(200).json(await getRelatedContent(req.params.contentId));
}
