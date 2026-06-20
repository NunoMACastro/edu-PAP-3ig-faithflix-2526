/**
 * @file Rotas admin para configuracao de integracoes.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import {
    getIntegrations,
    patchIntegration,
} from "./integrations.controller.js";

export const integrationsRouter = Router();

integrationsRouter.get("/", requireRole(["admin"]), asyncHandler(getIntegrations));
integrationsRouter.patch(
    "/:key",
    requireRole(["admin"]),
    asyncHandler(patchIntegration),
);
