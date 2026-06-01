import { Router } from "express";
import { getCurrentSession, logout } from "./session.controller.js";

export const authRouter = Router();

// Session routes stay intentionally small in MF1: no login, no register, no users.
authRouter.get("/me", getCurrentSession);
authRouter.post("/logout", logout);
