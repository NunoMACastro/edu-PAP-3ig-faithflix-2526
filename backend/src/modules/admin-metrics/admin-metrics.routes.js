// apps/backend/src/modules/admin-metrics/admin-metrics.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import { getAdminMetricsController } from "./admin-metrics.controller.js";

export const adminMetricsRouter = Router();

adminMetricsRouter.get(
    "/",
    requireRole(["admin"]),
    asyncHandler(getAdminMetricsController),
);