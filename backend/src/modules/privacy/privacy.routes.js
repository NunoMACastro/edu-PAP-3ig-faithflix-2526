/**
 * @file Rotas de privacidade da MF5.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
    rateLimit,
    rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    deleteAccount,
    getConsents,
    getPrivacyExport,
    putConsents,
} from "./privacy.controller.js";

export const privacyRouter = Router();

const deleteAccountUserLimit = rateLimit({
    scope: "privacy:delete-account:user",
    limit: 5,
    windowMs: 15 * 60_000,
    key: rateLimitKeys.user,
});
const deleteAccountIpLimit = rateLimit({
    scope: "privacy:delete-account:ip",
    limit: 20,
    windowMs: 60 * 60_000,
    key: rateLimitKeys.ip,
});

privacyRouter.get("/export", requireAuth, asyncHandler(getPrivacyExport));
privacyRouter.delete(
    "/account",
    requireAuth,
    deleteAccountUserLimit,
    deleteAccountIpLimit,
    asyncHandler(deleteAccount),
);
privacyRouter.get("/consents", requireAuth, asyncHandler(getConsents));
privacyRouter.put("/consents", requireAuth, asyncHandler(putConsents));
