/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
    rateLimit,
    rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import {
    forgotPassword,
    login,
    register,
    resetPasswordController,
} from "./auth.controller.js";

export const authRouter = Router();

const MINUTE = 60_000;
const loginIpLimit = rateLimit({
    scope: "auth:login:ip",
    limit: 20,
    windowMs: 15 * MINUTE,
    key: rateLimitKeys.ip,
});
const registrationLimit = rateLimit({
    scope: "auth:register:ip",
    limit: 5,
    windowMs: 60 * MINUTE,
    key: rateLimitKeys.ip,
});
const forgotPasswordLimit = rateLimit({
    scope: "auth:forgot:email",
    limit: 3,
    windowMs: 60 * MINUTE,
    key: rateLimitKeys.email,
});
const forgotPasswordIpLimit = rateLimit({
    scope: "auth:forgot:ip",
    limit: 10,
    windowMs: 60 * MINUTE,
    key: rateLimitKeys.ip,
});
const resetPasswordLimit = rateLimit({
    scope: "auth:reset:token",
    limit: 5,
    windowMs: 15 * MINUTE,
    key: rateLimitKeys.token,
});
const resetPasswordIpLimit = rateLimit({
    scope: "auth:reset:ip",
    limit: 10,
    windowMs: 60 * MINUTE,
    key: rateLimitKeys.ip,
});

authRouter.post("/register", registrationLimit, asyncHandler(register));
authRouter.post("/login", loginIpLimit, asyncHandler(login));
authRouter.post(
    "/forgot-password",
    forgotPasswordIpLimit,
    forgotPasswordLimit,
    asyncHandler(forgotPassword),
);
authRouter.post(
    "/reset-password",
    resetPasswordIpLimit,
    resetPasswordLimit,
    asyncHandler(resetPasswordController),
);
