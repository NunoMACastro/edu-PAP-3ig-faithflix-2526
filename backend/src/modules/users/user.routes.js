import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getMe, getUsers, patchMe, patchUserRole } from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.patch("/me", requireAuth, asyncHandler(patchMe));
userRouter.get("/", requireRole(["admin"]), asyncHandler(getUsers));
userRouter.patch("/:id/role", requireRole(["admin"]), asyncHandler(patchUserRole));