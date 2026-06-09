import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteMyContentRating,
  getContentRatingSummary,
  getMyContentRating,
  putMyContentRating,
} from "./ratings.controller.js";

export const ratingsRouter = Router();

ratingsRouter.get("/:contentId/summary", asyncHandler(getContentRatingSummary));
ratingsRouter.get("/:contentId/me", requireAuth, asyncHandler(getMyContentRating));
ratingsRouter.put("/:contentId", requireAuth, asyncHandler(putMyContentRating));
ratingsRouter.delete("/:contentId", requireAuth, asyncHandler(deleteMyContentRating));