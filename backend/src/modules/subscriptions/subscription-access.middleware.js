/**
 * @file Ficheiro `real_dev/backend/src/modules/subscriptions/subscription-access.middleware.js` da implementação real_dev.
 */

/**
 * Middleware de autorização premium por subscrição.
 *
 * Deve correr depois de `requireAuth`, porque precisa de `req.user.id`.
 * Se a subscrição estiver vencida, cancelada ou inexistente, devolve `403`.
 */
import { hasActiveSubscriptionAccess } from "./subscriptions.service.js";

/**
 * Bloqueia playback premium sem subscrição ativa.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} _res - Resposta Express não usada.
 * @param {Function} next - Callback Express.
 * @returns {Promise<void>} Continua ou encaminha erro `403`.
 */
export async function requireActiveSubscription(req, _res, next) {
  const hasAccess = await hasActiveSubscriptionAccess(req.user.id);

  if (!hasAccess) {
    const error = new Error("Subscrição ativa obrigatória para reproduzir este conteúdo.");
    error.statusCode = 403;
    return next(error);
  }

  return next();
}