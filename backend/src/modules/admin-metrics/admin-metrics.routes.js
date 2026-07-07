/**
 * @file Rotas de metricas administrativas.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import { getMetrics } from "./admin-metrics.controller.js";

export const adminMetricsRouter = Router();

adminMetricsRouter.get("/", requireRole(["admin"]), asyncHandler(getMetrics));
