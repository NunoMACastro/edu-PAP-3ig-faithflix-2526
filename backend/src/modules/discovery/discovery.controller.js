/**
 * @file Ficheiro `real_dev/backend/src/modules/discovery/discovery.controller.js` da implementação real_dev.
 */

import {
    getDiscoveryHome,
    getRelatedContent,
} from "./discovery.service.js";

/**
 * Devolve a composição da página inicial de descoberta.
 *
 * O pedido não precisa de parâmetros: o serviço agrega os blocos públicos que a
 * home deve renderizar.
 *
 * @param {import("express").Request} _req Pedido Express não usado por esta rota.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com os blocos de descoberta.
 */
export async function getDiscoveryHomeController(_req, res) {
    return res.status(200).json(await getDiscoveryHome());
}

/**
 * Devolve conteúdos relacionados com um item do catálogo.
 *
 * O identificador recebido na rota define o conteúdo de referência usado pelo
 * serviço para calcular relações editoriais ou taxonómicas.
 *
 * @param {import("express").Request} req Pedido Express com `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com conteúdos relacionados.
 */
export async function getRelatedContentController(req, res) {
    return res.status(200).json(await getRelatedContent(req.params.contentId));
}
