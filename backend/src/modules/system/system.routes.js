/**
 * @file Ficheiro `real_dev/backend/src/modules/system/system.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { getApiInfo } from "./system.controller.js";

export const systemRouter = Router();

// Montado em /api por app.js, por isso este controlador responde a GET /api.
systemRouter.get("/", getApiInfo);
