/**
 * @file Ficheiro `real_dev/backend/src/modules/subscriptions/subscription-access.middleware.js` da implementação real_dev.
 */

/**
 * Middleware de autorização premium por subscrição.
 *
 * Deve correr depois de `requireAuth`, porque precisa de `req.user.id`.
 * Se a subscrição estiver vencida, cancelada ou inexistente, devolve `403`.
 */
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { markPrivateResponse } from "../auth/auth.middleware.js";
import { hasActiveSubscriptionAccess } from "./subscriptions.service.js";

/**
 * Bloqueia playback premium sem subscrição ativa.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express marcada como privada.
 * @param {Function} next - Callback Express.
 * @returns {Promise<void>} Continua ou encaminha erro `403`.
 */
async function requireActiveSubscriptionHandler(req, res, next) {
  markPrivateResponse(res);
  const hasAccess = await hasActiveSubscriptionAccess(req.user.id);

  if (!hasAccess) {
    return next(
      new HttpError(
        403,
        "Subscrição ativa obrigatória para reproduzir este conteúdo.",
        undefined,
        "SUBSCRIPTION_REQUIRED",
      ),
    );
  }

  return next();
}

/**
 * Middleware Express 4 que encaminha rejeições assíncronas para o error handler.
 */
export const requireActiveSubscription = asyncHandler(
  requireActiveSubscriptionHandler,
);
