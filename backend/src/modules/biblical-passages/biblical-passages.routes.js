/**
 * @file Rotas HTTP de passagens bíblicas.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import {
    getAdminBiblicalPassages,
    getBiblicalPassage,
    getBiblicalPassages,
    patchBiblicalPassage,
    patchBiblicalPassageStatus,
    postBiblicalPassage,
} from "./biblical-passages.controller.js";

export const biblicalPassagesRouter = Router();

const canManageBiblicalPassages = requireRole(["admin", "moderator"]);

biblicalPassagesRouter.get("/", asyncHandler(getBiblicalPassages));
biblicalPassagesRouter.get(
    "/admin",
    canManageBiblicalPassages,
    asyncHandler(getAdminBiblicalPassages),
);
biblicalPassagesRouter.post(
    "/",
    canManageBiblicalPassages,
    asyncHandler(postBiblicalPassage),
);
biblicalPassagesRouter.patch(
    "/:id",
    canManageBiblicalPassages,
    asyncHandler(patchBiblicalPassage),
);
biblicalPassagesRouter.patch(
    "/:id/status",
    canManageBiblicalPassages,
    asyncHandler(patchBiblicalPassageStatus),
);
biblicalPassagesRouter.get("/:id", asyncHandler(getBiblicalPassage));
