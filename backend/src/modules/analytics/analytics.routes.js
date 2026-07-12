/**
 * @file Rotas autenticadas de métricas anónimas.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { postAnonymousMetric } from "./analytics.controller.js";

export const analyticsRouter = Router();

// O middleware CSRF global protege este POST; a sessão serve apenas para ler
// consentimento e não é copiada para o evento persistido.
analyticsRouter.post("/events", requireAuth, asyncHandler(postAnonymousMetric));
