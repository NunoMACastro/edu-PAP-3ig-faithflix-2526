import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { logout, me } from "./auth.controller.js";

export const sessionRouter = Router();

sessionRouter.get("/me", asyncHandler(me));
sessionRouter.post("/logout", asyncHandler(logout));