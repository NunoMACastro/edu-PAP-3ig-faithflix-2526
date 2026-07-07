/**
 * @file Ficheiro `real_dev/backend/src/modules/library/library.controller.js` da implementação real_dev.
 */

import {
    addToList,
    listHistory,
    listSavedContent,
    removeFromList,
} from "./library.service.js";

/**
 * Lista favoritos guardados pelo utilizador autenticado.
 *
 * O controller fixa o tipo de lista como `favorite` e usa a sessão para impedir
 * acesso a bibliotecas de outros utilizadores.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com favoritos.
 */
export async function getFavorites(req, res) {
    return res
        .status(200)
        .json({ items: await listSavedContent(req.user.id, "favorite") });
}

/**
 * Adiciona um conteúdo aos favoritos do utilizador.
 *
 * A rota recebe o conteúdo no URL e o serviço cria a associação com a conta da
 * sessão atual.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o favorito guardado.
 */
export async function putFavorite(req, res) {
    return res
        .status(200)
        .json(await addToList(req.user.id, req.params.contentId, "favorite"));
}

/**
 * Remove um conteúdo dos favoritos do utilizador.
 *
 * O tipo de lista fica fixo no controller e o serviço remove apenas a associação
 * pertencente à sessão atual.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o resultado da remoção.
 */
export async function deleteFavorite(req, res) {
    return res.status(200).json(
        await removeFromList(req.user.id, req.params.contentId, "favorite"),
    );
}

/**
 * Lista conteúdos guardados na watchlist do utilizador.
 *
 * A função consulta a biblioteca pessoal com o tipo `watchlist`, mantendo o
 * detalhe de armazenamento escondido no serviço.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com a watchlist.
 */
export async function getWatchlist(req, res) {
    return res
        .status(200)
        .json({ items: await listSavedContent(req.user.id, "watchlist") });
}

/**
 * Adiciona um conteúdo à watchlist do utilizador.
 *
 * O controller recebe o conteúdo no URL e delega no serviço a criação idempotente
 * da entrada de biblioteca.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com a entrada guardada.
 */
export async function putWatchlist(req, res) {
    return res
        .status(200)
        .json(await addToList(req.user.id, req.params.contentId, "watchlist"));
}

/**
 * Remove um conteúdo da watchlist do utilizador.
 *
 * A função passa ao serviço o utilizador, o conteúdo e o tipo de lista para
 * apagar apenas a associação correta.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o resultado da remoção.
 */
export async function deleteWatchlist(req, res) {
    return res.status(200).json(
        await removeFromList(req.user.id, req.params.contentId, "watchlist"),
    );
}

/**
 * Lista o histórico de visualização do utilizador autenticado.
 *
 * O controller devolve a coleção calculada pelo serviço para alimentar a área
 * pessoal sem aceitar identificadores de utilizador vindos do cliente.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com histórico de visualização.
 */
export async function getHistory(req, res) {
    return res.status(200).json({ items: await listHistory(req.user.id) });
}
