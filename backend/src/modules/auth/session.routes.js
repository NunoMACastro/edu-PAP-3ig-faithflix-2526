/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/session.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "./auth.middleware.js";
import { getCsrfToken, getCurrentSession, logout } from "./session.controller.js";

export const sessionRouter = Router();

sessionRouter.get("/me", getCurrentSession);
sessionRouter.get("/csrf-token", requireAuth, asyncHandler(getCsrfToken));
sessionRouter.post("/logout", asyncHandler(logout));
