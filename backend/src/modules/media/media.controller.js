/**
 * @file Controllers HTTP para ingestão administrativa e entrega privada de MP4.
 */

import { pipeline } from "node:stream/promises";
import { markPrivateResponse } from "../auth/auth.middleware.js";
import {
    abortMediaUpload,
    activateMediaUpload,
    createMediaUpload,
    getMediaDeliveryContext,
    listMediaAssets,
    receiveMediaUpload,
} from "./media-assets.service.js";
import { resolveMediaByteRange } from "./media-http.js";
import { openMediaStorageFile } from "./media-storage.service.js";
import { HttpError } from "../../utils/http-error.js";

/**
 * Cria uma sessão de upload para um conteúdo.
 *
 * @param {import("express").Request} req Pedido administrativo JSON.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<unknown>} Asset pendente.
 */
export async function postMediaUpload(req, res) {
    return res.status(201).json({
        asset: await createMediaUpload(
            req.params.contentId,
            req.body,
            req.user.id,
        ),
    });
}

/**
 * Recebe o corpo binário do MP4 diretamente do request stream.
 *
 * @param {import("express").Request} req Pedido `video/mp4` não processado por JSON.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<unknown>} Asset validado, ainda não ativo.
 */
export async function putMediaUpload(req, res) {
    return res.status(200).json({
        asset: await receiveMediaUpload(
            req.params.contentId,
            req.params.uploadId,
            req,
            req.headers,
        ),
    });
}

/**
 * Ativa um ficheiro ingerido com a versão editorial observada pelo cliente.
 *
 * @param {import("express").Request} req Pedido administrativo.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<unknown>} Asset ativo e nova versão do conteúdo.
 */
export async function postActivateMediaUpload(req, res) {
    return res.status(200).json(
        await activateMediaUpload(
            req.params.contentId,
            req.params.uploadId,
            req.body,
            req.user.id,
            { requestId: req.id },
        ),
    );
}

/**
 * Aborta uma ingestão não ativa e remove resíduos locais.
 *
 * @param {import("express").Request} req Pedido administrativo.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<unknown>} Resposta vazia 204.
 */
export async function deleteMediaUpload(req, res) {
    await abortMediaUpload(req.params.contentId, req.params.uploadId);
    return res.status(204).end();
}

/**
 * Lista metadata de media de um conteúdo sem revelar storage keys.
 *
 * @param {import("express").Request} req Pedido administrativo.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<unknown>} Lista segura de assets.
 */
export async function getContentMediaAssets(req, res) {
    return res.status(200).json({
        items: await listMediaAssets(req.params.contentId),
    });
}

/**
 * Identifica erros de transporte provocados pelo cliente abandonar o player.
 *
 * @param {unknown} error Falha de pipeline.
 * @returns {boolean} Verdadeiro para desconexões esperadas.
 */
function isClientDisconnect(error) {
    return [
        "ABORT_ERR",
        "ECONNRESET",
        "EPIPE",
        "ERR_STREAM_PREMATURE_CLOSE",
    ].includes(error?.code);
}

/**
 * Entrega um asset com autenticação, entitlement, parentalidade e qualidade
 * revalidados em cada GET/HEAD.
 *
 * @param {import("express").Request} req Pedido de media autenticado.
 * @param {import("express").Response} res Resposta Express/stream.
 * @returns {Promise<unknown>} Stream parcial/completo ou resposta HEAD.
 */
export async function deliverMediaAsset(req, res) {
    markPrivateResponse(res);
    const context = await getMediaDeliveryContext(
        req.params.assetId,
        req.user.id,
    );
    const opened = await openMediaStorageFile(context.storageKey);

    if (opened.sizeBytes !== context.sizeBytes) {
        await opened.handle.close();
        throw new HttpError(
            409,
            "Asset de media indisponivel.",
            undefined,
            "MEDIA_ASSET_NOT_READY",
        );
    }

    // Mesmo um intervalo inválido deve anunciar que o recurso suporta bytes;
    // o error handler conserva este header juntamente com Content-Range.
    res.setHeader("Accept-Ranges", "bytes");
    let range;
    try {
        range = resolveMediaByteRange(req.headers.range, opened.sizeBytes);
    } catch (error) {
        await opened.handle.close();
        if (error?.contentRange) {
            res.setHeader("Content-Range", error.contentRange);
        }
        throw error;
    }

    res.setHeader("Content-Type", context.mimeType);
    res.setHeader("Content-Length", String(range.length));
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (range.contentRange) {
        res.setHeader("Content-Range", range.contentRange);
    }

    if (req.method === "HEAD") {
        await opened.handle.close();
        return res.status(range.statusCode).end();
    }

    res.status(range.statusCode);
    const stream = opened.handle.createReadStream({
        start: range.start,
        end: range.end,
        autoClose: true,
    });

    try {
        await pipeline(stream, res);
    } catch (error) {
        if (isClientDisconnect(error)) {
            return undefined;
        }

        if (res.headersSent) {
            res.destroy(error);
            return undefined;
        }
        throw error;
    }

    return undefined;
}
