import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    deleteRating,
    getRatingMe,
    getRatingSummaryController,
    putRating,
} from "./ratings.controller.js";

export const ratingsRouter = Router();

ratingsRouter.get(
    "/:contentId/summary",
    asyncHandler(getRatingSummaryController),
);
ratingsRouter.get("/:contentId/me", requireAuth, asyncHandler(getRatingMe));
ratingsRouter.put("/:contentId", requireAuth, asyncHandler(putRating));
ratingsRouter.delete("/:contentId", requireAuth, asyncHandler(deleteRating));
