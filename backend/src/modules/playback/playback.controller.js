/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.controller.js` da implementação real_dev.
 */

import {
    getMediaPreferences,
    saveMediaPreferences,
} from "./media-preferences.service.js";
import {
    getPlayback,
    getPlaybackPreview,
    listContinueWatching,
    savePlaybackProgress,
} from "./playback.service.js";

/**
 * Devolve o estado de reprodução de um conteúdo para o utilizador autenticado.
 *
 * O controller lê o `contentId` da rota e o `user.id` da sessão para pedir ao
 * serviço o progresso e as preferências aplicáveis a esse conteúdo.
 *
 * @param {import("express").Request} req Pedido Express com `params.contentId` e `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o estado de reprodução.
 */
export async function getPlaybackByContent(req, res) {
    res.setHeader("Cache-Control", "private, no-store");
    const playback = await getPlayback(req.params.contentId, req.user.id);

    return res.status(200).json(playback);
}

/**
 * Devolve a fonte privada limitada a 1080p usada no hero do detalhe.
 *
 * @param {import("express").Request} req Pedido autenticado com `contentId`.
 * @param {import("express").Response} res Resposta privada não armazenável.
 * @returns {Promise<unknown>} DTO mínimo do preview.
 */
export async function getPlaybackPreviewByContent(req, res) {
    res.setHeader("Cache-Control", "private, no-store");
    const preview = await getPlaybackPreview(
        req.params.contentId,
        req.user.id,
    );

    return res.status(200).json(preview);
}

/**
 * Atualiza o progresso de reprodução de um conteúdo.
 *
 * A rota recebe a posição no corpo do pedido e delega no serviço a validação e a
 * persistência associadas à conta autenticada.
 *
 * @param {import("express").Request} req Pedido Express com conteúdo, utilizador e progresso.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o progresso guardado.
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
 * Lista conteúdos que o utilizador pode continuar a ver.
 *
 * O controller usa apenas a sessão autenticada e paginação limitada para obter
 * a lista pessoal calculada pelo serviço de playback.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com os itens para continuar a ver.
 */
export async function getContinueWatching(req, res) {
    return res
        .status(200)
        .json(await listContinueWatching(req.user.id, req.query));
}

/**
 * Devolve as preferências de reprodução do utilizador autenticado.
 *
 * A função separa a camada HTTP da leitura de preferências, mantendo a regra de
 * sessão concentrada no serviço.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com as preferências atuais.
 */
export async function getPlaybackPreferences(req, res) {
    return res
        .status(200)
        .json({ preferences: await getMediaPreferences(req.user.id) });
}

/**
 * Atualiza as preferências de reprodução do utilizador autenticado.
 *
 * O corpo do pedido transporta as opções escolhidas na UI e o serviço decide que
 * campos são válidos para persistência.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e preferências no body.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com as preferências guardadas.
 */
export async function putPlaybackPreferences(req, res) {
    return res.status(200).json({
        preferences: await saveMediaPreferences(req.user.id, req.body),
    });
}
