/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    getMyRecommendations,
    postRecommendationEvents,
    postRecommendationFeedback,
} from "./recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get(
    "/me",
    requireAuth,
    asyncHandler(getMyRecommendations),
);

recommendationsRouter.post(
    "/feedback",
    requireAuth,
    asyncHandler(postRecommendationFeedback),
);

recommendationsRouter.post(
    "/events",
    requireAuth,
    asyncHandler(postRecommendationEvents),
);
