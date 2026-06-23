/**
 * @file Ficheiro `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js` da implementação real_dev.
 */

/**
 * Controllers HTTP do módulo de subscrições.
 *
 * Cada controller delega regras de negócio para o service e usa `req.user.id`
 * nos rotas privados para preservar pertença.
 */
import {
  cancelRenewal,
  getMySubscription,
  listPlans,
} from "./subscriptions.service.js";

/**
 * Devolve planos ativos públicos.
 *
 * @param {object} _req - Pedido Express não usado.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com planos.
 */
export async function getPlans(_req, res) {
  res.status(200).json(await listPlans());
}

/**
 * Devolve a subscrição do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com estado da subscrição.
 */
export async function getMySubscriptionController(req, res) {
  res.status(200).json(await getMySubscription(req.user.id));
}

/**
 * Cancela a renovação futura da subscrição do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a subscrição atualizada.
 */
export async function postCancelRenewal(req, res) {
  res.status(200).json(await cancelRenewal(req.user.id));
}
