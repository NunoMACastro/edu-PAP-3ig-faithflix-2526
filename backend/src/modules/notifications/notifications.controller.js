/**
 * Módulo de controllers HTTP para notificações internas.
 *
 * Recebe pedidos autenticados e delega no service a validação de ownership,
 * leitura, marcação como lida e atualização de preferências.
 */
import {
  getPreferences,
  listMyNotifications,
  markNotificationAsRead,
  updatePreferences,
} from "./notifications.service.js";

/**
 * Lista notificações do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyNotifications(req, res) {
  res.status(200).json(await listMyNotifications(req.user.id));
}

/**
 * Marca uma notificação do proprio utilizador como lida.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchReadNotification(req, res) {
  res.status(200).json(await markNotificationAsRead(req.user.id, req.params.id));
}

/**
 * Devolve preferências atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyPreferences(req, res) {
  res.status(200).json(await getPreferences(req.user.id));
}

/**
 * Atualiza preferências atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido com corpo de preferências.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function putMyPreferences(req, res) {
  res.status(200).json(await updatePreferences(req.user.id, req.body));
}