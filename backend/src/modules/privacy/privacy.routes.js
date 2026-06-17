import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getMyDataExport } from "./privacy.controller.js";
import { deleteMyAccountController } from "./privacy.controller.js";

export const privacyRouter = Router();

privacyRouter.get("/export", requireAuth, asyncHandler(getMyDataExport));
privacyRouter.delete("/account", requireAuth, asyncHandler(deleteMyAccountController),);