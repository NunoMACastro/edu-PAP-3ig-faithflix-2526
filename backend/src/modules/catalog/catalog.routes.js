/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import {
    deleteCatalogBiblicalPassage,
    getAdminCatalogBiblicalPassages,
    getCatalogBiblicalPassages,
    postCatalogBiblicalPassage,
} from "../biblical-passages/biblical-passages.controller.js";
import {
    getAdminCatalog,
    getCatalog,
    getCatalogDetail,
    getContentRevisions,
    getTaxonomies,
    patchContent,
    patchContentStatus,
    postContent,
    postContentRevisionRevert,
    postTaxonomy,
} from "./catalog.controller.js";

export const catalogRouter = Router();

const canManageCatalog = requireRole(["admin", "moderator"]);

catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.get(
    "/:id/revisions",
    canManageCatalog,
    asyncHandler(getContentRevisions),
);
catalogRouter.post(
    "/:id/revisions/:revisionId/revert",
    canManageCatalog,
    asyncHandler(postContentRevisionRevert),
);
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.patch(
    "/:id/status",
    canManageCatalog,
    asyncHandler(patchContentStatus),
);
catalogRouter.get(
    "/:contentId/biblical-passages/admin",
    canManageCatalog,
    asyncHandler(getAdminCatalogBiblicalPassages),
);
catalogRouter.get(
    "/:idOrSlug/biblical-passages",
    asyncHandler(getCatalogBiblicalPassages),
);
catalogRouter.post(
    "/:contentId/biblical-passages",
    canManageCatalog,
    asyncHandler(postCatalogBiblicalPassage),
);
catalogRouter.delete(
    "/:contentId/biblical-passages/:passageId",
    canManageCatalog,
    asyncHandler(deleteCatalogBiblicalPassage),
);
catalogRouter.get("/:idOrSlug", asyncHandler(getCatalogDetail));
