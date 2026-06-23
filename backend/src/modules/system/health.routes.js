/**
 * @file Ficheiro `real_dev/backend/src/modules/system/health.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { getHealth } from "./health.controller.js";

export const healthRouter = Router();

// Montado em /health por app.js, por isso este controlador responde a GET /health.
healthRouter.get("/", getHealth);
