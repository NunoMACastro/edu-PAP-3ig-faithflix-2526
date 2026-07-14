/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    rateLimit,
    rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import { getMyRecommendations } from "./recommendations.controller.js";

export const recommendationsRouter = Router();
const recommendationsLimit = rateLimit({
    scope: "recommendations:user",
    limit: 60,
    windowMs: 60_000,
    key: rateLimitKeys.user,
});

recommendationsRouter.get(
    "/me",
    requireAuth,
    recommendationsLimit,
    asyncHandler(getMyRecommendations),
);
