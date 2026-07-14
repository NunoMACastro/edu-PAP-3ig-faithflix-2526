/**
 * @file Rotas operacionais públicas de liveness e readiness.
 */

import { Router } from "express";
import {
    getLiveness,
    getReadiness,
} from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/live", getLiveness);
healthRouter.get("/ready", getReadiness);
// Alias compatível: GET /health representa readiness, não apenas processo vivo.
healthRouter.get("/", getReadiness);
