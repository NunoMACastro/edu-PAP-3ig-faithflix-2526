import { Router } from "express";
import { getHealth } from "./health.controller.js";

export const healthRouter = Router();

// Mounted at /health by app.js, therefore this handler answers GET /health.
healthRouter.get("/", getHealth);
