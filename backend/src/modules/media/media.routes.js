/**
 * @file Routers prontos a montar para uploads administrativos e media privada.
 *
 * `catalogMediaRouter` deve ser montado em `/api/catalog` e `mediaRouter` em
 * `/api/media`. O `PUT` usa o request stream bruto, sem middleware multipart.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
    deleteMediaUpload,
    deliverMediaAsset,
    getContentMediaAssets,
    postActivateMediaUpload,
    postMediaUpload,
    putMediaUpload,
} from "./media.controller.js";

export const catalogMediaRouter = Router();
export const mediaRouter = Router();

const canManageCatalogMedia = requireRole(["admin", "moderator"]);

catalogMediaRouter.post(
    "/:contentId/media-uploads",
    canManageCatalogMedia,
    asyncHandler(postMediaUpload),
);
catalogMediaRouter.put(
    "/:contentId/media-uploads/:uploadId",
    canManageCatalogMedia,
    asyncHandler(putMediaUpload),
);
catalogMediaRouter.post(
    "/:contentId/media-uploads/:uploadId/activate",
    canManageCatalogMedia,
    asyncHandler(postActivateMediaUpload),
);
catalogMediaRouter.delete(
    "/:contentId/media-uploads/:uploadId",
    canManageCatalogMedia,
    asyncHandler(deleteMediaUpload),
);
catalogMediaRouter.get(
    "/:contentId/media-assets",
    canManageCatalogMedia,
    asyncHandler(getContentMediaAssets),
);

mediaRouter.use(requireAuth);
mediaRouter
    .route("/:assetId")
    .get(asyncHandler(deliverMediaAsset))
    .head(asyncHandler(deliverMediaAsset));
