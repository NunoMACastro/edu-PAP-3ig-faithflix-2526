import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getMyRecommendations } from "./recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get(
    "/me",
    requireAuth,
    asyncHandler(getMyRecommendations),
);
