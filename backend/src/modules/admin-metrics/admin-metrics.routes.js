/**
 * @file Rotas de metricas administrativas.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import {
    exportMetricsCsv,
    getMetrics,
} from "./admin-metrics.controller.js";

export const adminMetricsRouter = Router();

adminMetricsRouter.get("/", requireRole(["admin"]), asyncHandler(getMetrics));
adminMetricsRouter.get(
    "/export.csv",
    requireRole(["admin"]),
    asyncHandler(exportMetricsCsv),
);
