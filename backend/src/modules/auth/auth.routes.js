import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { forgotPassword, login, register, resetPasswordController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/forgot-password", asyncHandler(forgotPassword));
authRouter.post("/reset-password", asyncHandler(resetPasswordController));