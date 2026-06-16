/**
 * @file Ficheiro `real_dev/backend/src/modules/users/user.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
    getMe,
    getUsers,
    patchMe,
    patchMyParentalSettings,
    patchUserRole,
} from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.patch("/me", requireAuth, asyncHandler(patchMe));
userRouter.patch(
    "/me/parental",
    requireAuth,
    asyncHandler(patchMyParentalSettings),
);
userRouter.get("/", requireRole(["admin"]), asyncHandler(getUsers));
userRouter.patch(
    "/:id/role",
    requireRole(["admin"]),
    asyncHandler(patchUserRole),
);
