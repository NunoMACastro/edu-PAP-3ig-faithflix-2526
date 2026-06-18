// apps/backend/src/modules/integrations/integrations.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import { getIntegrations, patchIntegration } from "./integrations.controller.js";

export const integrationsRouter = Router();

integrationsRouter.use(requireRole(["admin"]));
integrationsRouter.get("/", asyncHandler(getIntegrations));
integrationsRouter.patch("/:key", asyncHandler(patchIntegration));