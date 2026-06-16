/**
 * @file Ficheiro `real_dev/backend/src/modules/users/user.controller.js` da implementação real_dev.
 */

import {
    getMyProfile,
    listUsers,
    updateMyProfile,
    updateParentalSettings,
    updateUserRole,
} from "./user.service.js";

/**
 * Devolve o perfil do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req - Pedido atual.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com perfil.
 */
export async function getMe(req, res) {
    return res.status(200).json({ user: await getMyProfile(req.user.id) });
}

/**
 * Atualiza campos editáveis do perfil do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req - Pedido atual.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com perfil atualizado.
 */
export async function patchMe(req, res) {
    return res
        .status(200)
        .json({ user: await updateMyProfile(req.user.id, req.body) });
}

/**
 * Atualiza definições parentais do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req - Pedido atual.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com perfil atualizado.
 */
export async function patchMyParentalSettings(req, res) {
    return res.status(200).json({
        user: await updateParentalSettings(req.user.id, req.body),
    });
}

/**
 * Lista utilizadores para administradores.
 *
 * @param {import("express").Request} _req - Pedido atual.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com lista de utilizadores.
 */
export async function getUsers(_req, res) {
    return res.status(200).json({ users: await listUsers() });
}

/**
 * Atualiza a role de um utilizador para administradores.
 *
 * @param {import("express").Request} req - Pedido atual com id do utilizador alvo.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com utilizador atualizado.
 */
export async function patchUserRole(req, res) {
    return res.status(200).json({
        user: await updateUserRole(req.params.id, req.body),
    });
}
