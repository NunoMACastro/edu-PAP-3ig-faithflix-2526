/**
 * @file Rotas de privacidade da MF5.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    deleteAccount,
    getConsents,
    getPrivacyExport,
    putConsents,
} from "./privacy.controller.js";

export const privacyRouter = Router();

privacyRouter.get("/export", requireAuth, asyncHandler(getPrivacyExport));
privacyRouter.delete("/account", requireAuth, asyncHandler(deleteAccount));
privacyRouter.get("/consents", requireAuth, asyncHandler(getConsents));
privacyRouter.put("/consents", requireAuth, asyncHandler(putConsents));
