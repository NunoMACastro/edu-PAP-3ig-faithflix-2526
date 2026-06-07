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

export async function getCatalog(_req, res) {
    return res.status(200).json({ items: await listPublishedCatalog() });
}

export async function getAdminCatalog(_req, res) {
    return res.status(200).json({ items: await listAdminCatalog() });
}

export async function postContent(req, res) {
    return res
        .status(201)
        .json({ content: await createContent(req.body, req.user.id) });
}

export async function patchContent(req, res) {
    return res.status(200).json({
        content: await updateContent(req.params.id, req.body, req.user.id),
    });
}

export async function patchContentStatus(req, res) {
    return res.status(200).json({
        content: await changeContentStatus(
            req.params.id,
            req.body?.status,
            req.user.id,
        ),
    });
}

export async function getContentRevisions(req, res) {
    return res
        .status(200)
        .json({ items: await listContentRevisions(req.params.id) });
}

export async function postContentRevisionRevert(req, res) {
    return res.status(200).json({
        content: await revertContentRevision(
            req.params.id,
            req.params.revisionId,
            req.user.id,
        ),
    });
}

export async function getTaxonomies(_req, res) {
    return res.status(200).json({ items: await listTaxonomies() });
}

export async function postTaxonomy(req, res) {
    return res.status(201).json({ taxonomy: await createTaxonomy(req.body) });
}

export async function getCatalogDetail(req, res) {
    return res.status(200).json({
        content: await getPublishedContentDetail(req.params.idOrSlug),
    });
}
