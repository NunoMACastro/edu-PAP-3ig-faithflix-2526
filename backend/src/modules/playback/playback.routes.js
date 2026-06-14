import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireActiveSubscription } from "../subscriptions/subscription-access.middleware.js";
import {
    getContinueWatching,
    getPlaybackByContent,
    getPlaybackPreferences,
    putPlaybackPreferences,
    putPlaybackProgress,
} from "./playback.controller.js";

export const playbackRouter = Router();

playbackRouter.use(requireAuth);
playbackRouter.get("/preferences", asyncHandler(getPlaybackPreferences));
playbackRouter.put("/preferences", asyncHandler(putPlaybackPreferences));
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", requireActiveSubscription, asyncHandler(getPlaybackByContent));
playbackRouter.put("/:contentId/progress", requireActiveSubscription, asyncHandler(putPlaybackProgress));
