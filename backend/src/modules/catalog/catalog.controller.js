import {
  changeContentStatus,
  createContent,
  listAdminCatalog,
  listContentRevisions,
  listPublishedCatalog,
  revertContentRevision,
  updateContent,
} from "./catalog.service.js";
import { createTaxonomy, listTaxonomies } from "./taxonomy.service.js";

export async function getCatalog(req, res) {
  res.status(200).json({ items: await listPublishedCatalog() });
}

export async function getAdminCatalog(req, res) {
  res.status(200).json({ items: await listAdminCatalog() });
}

export async function postContent(req, res) {
  res.status(201).json({ content: await createContent(req.body, req.user.id) });
}

export async function patchContent(req, res) {
  res.status(200).json({ content: await updateContent(req.params.id, req.body, req.user.id) });
}

export async function patchContentStatus(req, res) {
  res.status(200).json({ content: await changeContentStatus(req.params.id, req.body.status, req.user.id) });
}

export async function getContentRevisions(req, res) {
  res.status(200).json({ items: await listContentRevisions(req.params.id) });
}

export async function postContentRevisionRevert(req, res) {
  res.status(200).json({
    content: await revertContentRevision(req.params.id, req.params.revisionId, req.user.id),
  });
}

export async function getTaxonomies(req, res) {
  res.status(200).json({ items: await listTaxonomies() });
}

export async function postTaxonomy(req, res) {
  res.status(201).json({ taxonomy: await createTaxonomy(req.body) });
}