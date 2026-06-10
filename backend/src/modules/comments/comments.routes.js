import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteComment,
  getCommentsByContent,
  patchCommentModeration,
  postCommentByContent,
} from "./comments.controller.js";

export const commentsRouter = Router();

commentsRouter.get("/:contentId", asyncHandler(getCommentsByContent));
commentsRouter.post("/:contentId", requireAuth, asyncHandler(postCommentByContent));
commentsRouter.delete("/:commentId", requireAuth, asyncHandler(deleteComment));
commentsRouter.patch(
  "/:commentId/moderation",
  requireAuth,
  requireRole(["admin", "moderator"]),
  asyncHandler(patchCommentModeration),
);