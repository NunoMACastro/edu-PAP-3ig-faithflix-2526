import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRecommendationsForMe } from "./recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/me", requireAuth, asyncHandler(getRecommendationsForMe));