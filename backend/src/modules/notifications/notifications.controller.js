/**
 * @file Controladores HTTP do módulo de notificações.
 *
 * Recebe pedidos autenticados e delega no service a validação de pertença,
 * leitura, marcação como lida e atualização de preferências.
 */

import {
  getPreferences,
  listMyNotifications,
  markNotificationAsRead,
  updatePreferences,
} from "./notifications.service.js";

/**
 * Devolve notificações do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido Express com `req.user.id`.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<void>}
 */
export async function getMyNotifications(req, res) {
  res.status(200).json(await listMyNotifications(req.user.id, req.query));
}

/**
 * Marca uma notificação do utilizador autenticado como lida.
 *
 * @param {import("express").Request} req Pedido Express com `req.params.id`.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<void>}
 */
export async function patchReadNotification(req, res) {
  res.status(200).json(await markNotificationAsRead(req.user.id, req.params.id));
}

/**
 * Devolve preferências de notificação do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido Express com `req.user.id`.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<void>}
 */
export async function getMyPreferences(req, res) {
  res.status(200).json(await getPreferences(req.user.id));
}

/**
 * Atualiza preferências de notificação do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido Express com `req.user.id` e corpo JSON.
 * @param {import("express").Response} res Resposta Express.
 * @returns {Promise<void>}
 */
export async function putMyPreferences(req, res) {
  res.status(200).json(await updatePreferences(req.user.id, req.body));
}
