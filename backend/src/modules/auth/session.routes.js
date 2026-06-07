import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getCurrentSession, logout } from "./session.controller.js";

export const sessionRouter = Router();

sessionRouter.get("/me", getCurrentSession);
sessionRouter.post("/logout", asyncHandler(logout));
