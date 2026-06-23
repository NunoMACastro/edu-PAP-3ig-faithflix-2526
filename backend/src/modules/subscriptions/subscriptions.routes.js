/**
 * @file Ficheiro `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js` da implementação real_dev.
 */

/**
 * Rotas REST de subscrições.
 *
 * As rotas `/me` ficam protegidas porque expoem dados do utilizador
 * autenticado. A listagem de planos e pública.
 */
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMySubscriptionController,
  getPlans,
  postCancelRenewal,
} from "./subscriptions.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/plans", asyncHandler(getPlans));
// A ordem mantém `/plans` público e coloca pertença apenas nos rotas pessoais.
subscriptionsRouter.get("/me", requireAuth, asyncHandler(getMySubscriptionController));
subscriptionsRouter.post("/me/cancel-renewal", requireAuth, asyncHandler(postCancelRenewal));
