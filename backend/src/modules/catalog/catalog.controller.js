/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.controller.js` da implementação real_dev.
 */

import {
    changeContentStatus,
    createContent,
    getPublishedContentDetail,
    listAdminCatalog,
    listContentRevisions,
    listPublishedCatalog,
    revertContentRevision,
    updateContent,
} from "./catalog.service.js";
import { createTaxonomy, listTaxonomies } from "./taxonomy.service.js";

/**
 * Documenta `getCatalog`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} _req Valor recebido por `getCatalog`.
 * @param {unknown} res Valor recebido por `getCatalog`.
 * @returns {Promise<unknown>} Resultado devolvido por `getCatalog`.
 */
export async function getCatalog(_req, res) {
    return res.status(200).json({ items: await listPublishedCatalog() });
}

/**
 * Documenta `getAdminCatalog`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} _req Valor recebido por `getAdminCatalog`.
 * @param {unknown} res Valor recebido por `getAdminCatalog`.
 * @returns {Promise<unknown>} Resultado devolvido por `getAdminCatalog`.
 */
export async function getAdminCatalog(_req, res) {
    return res.status(200).json({ items: await listAdminCatalog() });
}

/**
 * Documenta `postContent`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `postContent`.
 * @param {unknown} res Valor recebido por `postContent`.
 * @returns {Promise<unknown>} Resultado devolvido por `postContent`.
 */
export async function postContent(req, res) {
    return res
        .status(201)
        .json({ content: await createContent(req.body, req.user.id) });
}

/**
 * Documenta `patchContent`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `patchContent`.
 * @param {unknown} res Valor recebido por `patchContent`.
 * @returns {Promise<unknown>} Resultado devolvido por `patchContent`.
 */
export async function patchContent(req, res) {
    return res.status(200).json({
        content: await updateContent(req.params.id, req.body, req.user.id),
    });
}

/**
 * Documenta `patchContentStatus`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `patchContentStatus`.
 * @param {unknown} res Valor recebido por `patchContentStatus`.
 * @returns {Promise<unknown>} Resultado devolvido por `patchContentStatus`.
 */
export async function patchContentStatus(req, res) {
    return res.status(200).json({
        content: await changeContentStatus(
            req.params.id,
            req.body?.status,
            req.user.id,
        ),
    });
}

/**
 * Documenta `getContentRevisions`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getContentRevisions`.
 * @param {unknown} res Valor recebido por `getContentRevisions`.
 * @returns {Promise<unknown>} Resultado devolvido por `getContentRevisions`.
 */
export async function getContentRevisions(req, res) {
    return res
        .status(200)
        .json({ items: await listContentRevisions(req.params.id) });
}

/**
 * Documenta `postContentRevisionRevert`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `postContentRevisionRevert`.
 * @param {unknown} res Valor recebido por `postContentRevisionRevert`.
 * @returns {Promise<unknown>} Resultado devolvido por `postContentRevisionRevert`.
 */
export async function postContentRevisionRevert(req, res) {
    return res.status(200).json({
        content: await revertContentRevision(
            req.params.id,
            req.params.revisionId,
            req.user.id,
        ),
    });
}

/**
 * Documenta `getTaxonomies`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} _req Valor recebido por `getTaxonomies`.
 * @param {unknown} res Valor recebido por `getTaxonomies`.
 * @returns {Promise<unknown>} Resultado devolvido por `getTaxonomies`.
 */
export async function getTaxonomies(_req, res) {
    return res.status(200).json({ items: await listTaxonomies() });
}

/**
 * Documenta `postTaxonomy`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `postTaxonomy`.
 * @param {unknown} res Valor recebido por `postTaxonomy`.
 * @returns {Promise<unknown>} Resultado devolvido por `postTaxonomy`.
 */
export async function postTaxonomy(req, res) {
    return res.status(201).json({ taxonomy: await createTaxonomy(req.body) });
}

/**
 * Documenta `getCatalogDetail`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getCatalogDetail`.
 * @param {unknown} res Valor recebido por `getCatalogDetail`.
 * @returns {Promise<unknown>} Resultado devolvido por `getCatalogDetail`.
 */
export async function getCatalogDetail(req, res) {
    return res.status(200).json({
        content: await getPublishedContentDetail(req.params.idOrSlug),
    });
}
