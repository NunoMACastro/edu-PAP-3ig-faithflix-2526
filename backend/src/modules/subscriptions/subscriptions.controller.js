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
  acceptFamilyInvitation,
  cancelRenewal,
  declineFamilyInvitation,
  getFamilyOverview,
  getMySubscription,
  inviteFamilyMember,
  listPlans,
  leaveFamily,
  removeFamilyMember,
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

/**
 * Devolve o estado da partilha familiar do utilizador autenticado.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a familia.
 */
export async function getMyFamilyController(req, res) {
  res.status(200).json({ family: await getFamilyOverview(req.user.id) });
}

/**
 * Cria convite familiar para uma conta existente.
 *
 * @param {object} req - Pedido Express com `req.user.id` e `body.email`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `201` com o convite.
 */
export async function postFamilyInvitation(req, res) {
  // O userId vem da sessão para impedir leitura de famílias de outros utilizadores.
  res.status(201).json(await inviteFamilyMember(req.user.id, req.body));
}

/**
 * Aceita convite familiar pendente.
 *
 * @param {object} req - Pedido Express com `params.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a familia atualizada.
 */
export async function postAcceptFamilyInvitation(req, res) {
  res.status(200).json(await acceptFamilyInvitation(req.user.id, req.params.id));
}

/**
 * Recusa convite familiar pendente.
 *
 * @param {object} req - Pedido Express com `params.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a familia atualizada.
 */
export async function postDeclineFamilyInvitation(req, res) {
  res.status(200).json(await declineFamilyInvitation(req.user.id, req.params.id));
}

/**
 * Remove membro da familia do owner autenticado.
 *
 * @param {object} req - Pedido Express com `params.memberId`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a familia atualizada.
 */
export async function deleteFamilyMember(req, res) {
  res.status(200).json(await removeFamilyMember(req.user.id, req.params.memberId));
}

/**
 * Permite ao membro sair da familia ativa.
 *
 * @param {object} req - Pedido Express com `req.user.id`.
 * @param {object} res - Resposta Express.
 * @returns {Promise<void>} Envia `200` com a familia atualizada.
 */
export async function postLeaveFamily(req, res) {
  res.status(200).json(await leaveFamily(req.user.id));
}
