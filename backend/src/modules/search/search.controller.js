/**
 * @file Ficheiro `real_dev/backend/src/modules/search/search.controller.js` da implementação real_dev.
 */

import { searchContents } from "./search.service.js";

/**
 * Executa a pesquisa de conteúdos a partir dos parâmetros de query.
 *
 * O controller mantém a camada HTTP simples: recebe filtros da URL e deixa o
 * serviço aplicar paginação, ordenação e critérios de pesquisa.
 *
 * @param {import("express").Request} req Pedido Express com filtros em `query`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com resultados de pesquisa.
 */
export async function getSearch(req, res) {
    return res.status(200).json(await searchContents(req.query));
}
