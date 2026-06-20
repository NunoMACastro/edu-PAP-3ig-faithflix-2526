/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.controller.js` da implementação real_dev.
 */

import {
    getMediaPreferences,
    saveMediaPreferences,
} from "./media-preferences.service.js";
import {
    getPlayback,
    listContinueWatching,
    savePlaybackProgress,
} from "./playback.service.js";

/**
 * Documenta `getPlaybackByContent`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getPlaybackByContent`.
 * @param {unknown} res Valor recebido por `getPlaybackByContent`.
 * @returns {Promise<unknown>} Resultado devolvido por `getPlaybackByContent`.
 */
export async function getPlaybackByContent(req, res) {
    return res
        .status(200)
        .json(await getPlayback(req.params.contentId, req.user.id));
}

/**
 * Documenta `putPlaybackProgress`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `putPlaybackProgress`.
 * @param {unknown} res Valor recebido por `putPlaybackProgress`.
 * @returns {Promise<unknown>} Resultado devolvido por `putPlaybackProgress`.
 */
export async function putPlaybackProgress(req, res) {
    return res.status(200).json({
        progress: await savePlaybackProgress(
            req.params.contentId,
            req.user.id,
            req.body,
        ),
    });
}

/**
 * Documenta `getContinueWatching`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getContinueWatching`.
 * @param {unknown} res Valor recebido por `getContinueWatching`.
 * @returns {Promise<unknown>} Resultado devolvido por `getContinueWatching`.
 */
export async function getContinueWatching(req, res) {
    return res
        .status(200)
        .json({ items: await listContinueWatching(req.user.id) });
}

/**
 * Documenta `getPlaybackPreferences`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getPlaybackPreferences`.
 * @param {unknown} res Valor recebido por `getPlaybackPreferences`.
 * @returns {Promise<unknown>} Resultado devolvido por `getPlaybackPreferences`.
 */
export async function getPlaybackPreferences(req, res) {
    return res
        .status(200)
        .json({ preferences: await getMediaPreferences(req.user.id) });
}

/**
 * Documenta `putPlaybackPreferences`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `putPlaybackPreferences`.
 * @param {unknown} res Valor recebido por `putPlaybackPreferences`.
 * @returns {Promise<unknown>} Resultado devolvido por `putPlaybackPreferences`.
 */
export async function putPlaybackPreferences(req, res) {
    return res.status(200).json({
        preferences: await saveMediaPreferences(req.user.id, req.body),
    });
}
