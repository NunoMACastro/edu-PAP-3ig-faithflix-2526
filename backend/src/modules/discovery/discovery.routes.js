/**
 * @file Ficheiro `real_dev/backend/src/modules/discovery/discovery.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
    getDiscoveryHomeController,
    getRelatedContentController,
} from "./discovery.controller.js";

export const discoveryRouter = Router();

discoveryRouter.get("/home", asyncHandler(getDiscoveryHomeController));
discoveryRouter.get(
    "/related/:contentId",
    asyncHandler(getRelatedContentController),
);
