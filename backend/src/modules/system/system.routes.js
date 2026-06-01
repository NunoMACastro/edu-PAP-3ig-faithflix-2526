import { Router } from "express";
import { getApiInfo } from "./system.controller.js";

export const systemRouter = Router();

// Mounted at /api by app.js, therefore this handler answers GET /api.
systemRouter.get("/", getApiInfo);
