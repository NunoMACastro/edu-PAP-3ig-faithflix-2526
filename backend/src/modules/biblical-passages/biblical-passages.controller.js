/**
 * @file Controllers HTTP do módulo de passagens bíblicas.
 */

import {
    changeBiblicalPassageStatus,
    createBiblicalPassage,
    getPublishedBiblicalPassage,
    linkBiblicalPassageToContent,
    listAdminBiblicalPassagesForContent,
    listAdminBiblicalPassages,
    listBiblicalPassagesForPublishedContent,
    listPublishedBiblicalPassages,
    unlinkBiblicalPassageFromContent,
    updateBiblicalPassage,
} from "./biblical-passages.service.js";

/**
 * Lista passagens bíblicas publicadas.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function getBiblicalPassages(req, res) {
    return res.status(200).json(await listPublishedBiblicalPassages(req.query));
}

/**
 * Obtém uma passagem bíblica publicada.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function getBiblicalPassage(req, res) {
    return res.status(200).json({
        passage: await getPublishedBiblicalPassage(req.params.id),
    });
}

/**
 * Lista passagens bíblicas para gestão editorial.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function getAdminBiblicalPassages(req, res) {
    return res.status(200).json(await listAdminBiblicalPassages(req.query));
}

/**
 * Cria uma passagem bíblica como rascunho.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function postBiblicalPassage(req, res) {
    return res.status(201).json({
        passage: await createBiblicalPassage(req.body, req.user.id, {
            requestId: req.id,
        }),
    });
}

/**
 * Atualiza uma passagem bíblica existente.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function patchBiblicalPassage(req, res) {
    return res.status(200).json({
        passage: await updateBiblicalPassage(
            req.params.id,
            req.body,
            req.user.id,
            { requestId: req.id },
        ),
    });
}

/**
 * Altera o estado editorial de uma passagem bíblica.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function patchBiblicalPassageStatus(req, res) {
    return res.status(200).json({
        passage: await changeBiblicalPassageStatus(
            req.params.id,
            req.body?.status,
            req.user.id,
            { requestId: req.id },
        ),
    });
}

/**
 * Lista passagens bíblicas publicadas associadas a um conteúdo publicado.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function getCatalogBiblicalPassages(req, res) {
    return res.status(200).json({
        items: await listBiblicalPassagesForPublishedContent(req.params.idOrSlug),
    });
}

/**
 * Lista associações bíblicas de um conteúdo para gestão editorial.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function getAdminCatalogBiblicalPassages(req, res) {
    return res.status(200).json({
        items: await listAdminBiblicalPassagesForContent(req.params.contentId),
    });
}

/**
 * Associa uma passagem bíblica a um conteúdo.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function postCatalogBiblicalPassage(req, res) {
    return res.status(200).json({
        passage: await linkBiblicalPassageToContent(
            req.params.contentId,
            req.body,
            req.user.id,
            { requestId: req.id },
        ),
    });
}

/**
 * Remove a associação entre passagem bíblica e conteúdo.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<unknown>} Resposta JSON.
 */
export async function deleteCatalogBiblicalPassage(req, res) {
    return res.status(200).json({
        association: await unlinkBiblicalPassageFromContent(
            req.params.contentId,
            req.params.passageId,
            req.user.id,
            { requestId: req.id },
        ),
    });
}
