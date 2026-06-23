/**
 * @file Ficheiro `real_dev/backend/src/modules/payments/payments.routes.js` da implementação real_dev.
 */

/**
 * Módulo de rotas dos pagamentos simulados.
 *
 * Liga os rotas `/api/payments` ao middleware de autenticação para garantir
 * que tentativas de pagamento e trials pertencem sempre ao utilizador da sessão.
 */
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { postSimulatedCheckout, postTrial } from "./payments.controller.js";

/**
 * Router de pagamentos simulados.
 * Todas as rotas exigem login para associar tentativas, trials e subscrições ao dono correto.
 */
export const paymentsRouter = Router();

paymentsRouter.post("/simulated-checkout", requireAuth, asyncHandler(postSimulatedCheckout));
paymentsRouter.post("/trial", requireAuth, asyncHandler(postTrial));