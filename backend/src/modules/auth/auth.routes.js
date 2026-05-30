import { Router } from "express";
import { getCurrentSession, logout } from "./session.controller.js";

export const authRouter = Router();

authRouter.get("/me", getCurrentSession);
authRouter.post("/logout", logout);