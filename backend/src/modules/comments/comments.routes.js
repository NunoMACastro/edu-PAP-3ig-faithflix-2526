import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
    deleteCommentController,
    getComments,
    patchCommentModeration,
    postComment,
} from "./comments.controller.js";

export const commentsRouter = Router();

const canModerateComments = requireRole(["admin", "moderator"]);

commentsRouter.get("/:contentId", asyncHandler(getComments));
commentsRouter.post("/:contentId", requireAuth, asyncHandler(postComment));
commentsRouter.delete(
    "/:commentId",
    requireAuth,
    asyncHandler(deleteCommentController),
);
commentsRouter.patch(
    "/:commentId/moderation",
    canModerateComments,
    asyncHandler(patchCommentModeration),
);
