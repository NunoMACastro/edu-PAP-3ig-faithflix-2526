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
 * Documenta `getFavorites`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getFavorites`.
 * @param {unknown} res Valor recebido por `getFavorites`.
 * @returns {Promise<unknown>} Resultado devolvido por `getFavorites`.
 */
export async function getFavorites(req, res) {
    return res
        .status(200)
        .json({ items: await listSavedContent(req.user.id, "favorite") });
}

/**
 * Documenta `putFavorite`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `putFavorite`.
 * @param {unknown} res Valor recebido por `putFavorite`.
 * @returns {Promise<unknown>} Resultado devolvido por `putFavorite`.
 */
export async function putFavorite(req, res) {
    return res
        .status(200)
        .json(await addToList(req.user.id, req.params.contentId, "favorite"));
}

/**
 * Documenta `deleteFavorite`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `deleteFavorite`.
 * @param {unknown} res Valor recebido por `deleteFavorite`.
 * @returns {Promise<unknown>} Resultado devolvido por `deleteFavorite`.
 */
export async function deleteFavorite(req, res) {
    return res.status(200).json(
        await removeFromList(req.user.id, req.params.contentId, "favorite"),
    );
}

/**
 * Documenta `getWatchlist`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getWatchlist`.
 * @param {unknown} res Valor recebido por `getWatchlist`.
 * @returns {Promise<unknown>} Resultado devolvido por `getWatchlist`.
 */
export async function getWatchlist(req, res) {
    return res
        .status(200)
        .json({ items: await listSavedContent(req.user.id, "watchlist") });
}

/**
 * Documenta `putWatchlist`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `putWatchlist`.
 * @param {unknown} res Valor recebido por `putWatchlist`.
 * @returns {Promise<unknown>} Resultado devolvido por `putWatchlist`.
 */
export async function putWatchlist(req, res) {
    return res
        .status(200)
        .json(await addToList(req.user.id, req.params.contentId, "watchlist"));
}

/**
 * Documenta `deleteWatchlist`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `deleteWatchlist`.
 * @param {unknown} res Valor recebido por `deleteWatchlist`.
 * @returns {Promise<unknown>} Resultado devolvido por `deleteWatchlist`.
 */
export async function deleteWatchlist(req, res) {
    return res.status(200).json(
        await removeFromList(req.user.id, req.params.contentId, "watchlist"),
    );
}

/**
 * Documenta `getHistory`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getHistory`.
 * @param {unknown} res Valor recebido por `getHistory`.
 * @returns {Promise<unknown>} Resultado devolvido por `getHistory`.
 */
export async function getHistory(req, res) {
    return res.status(200).json({ items: await listHistory(req.user.id) });
}
