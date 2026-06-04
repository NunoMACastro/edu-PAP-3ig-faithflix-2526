import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getAdminCatalog,
  getCatalog,
  getContentRevisions,
  getTaxonomies,
  patchContent,
  patchContentStatus,
  postContentRevisionRevert,
  postContent,
  postTaxonomy,
} from "./catalog.controller.js";

export const catalogRouter = Router();

const canManageCatalog = requireRole(["admin", "moderator"]);

catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.get("/:id/revisions", canManageCatalog, asyncHandler(getContentRevisions));
catalogRouter.post("/:id/revisions/:revisionId/revert", canManageCatalog, asyncHandler(postContentRevisionRevert));
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.patch("/:id/status", canManageCatalog, asyncHandler(patchContentStatus));