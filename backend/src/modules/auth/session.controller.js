/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/session.controller.js` da implementação real_dev.
 */

import { clearSessionCookie } from "../../utils/cookies.js";
import { deleteSession } from "./session.service.js";

/**
 * Devolve a sessão atualmente autenticada, quando existe.
 *
 * @param {import("express").Request & { user?: unknown, session?: { user: unknown, isAuthenticated: boolean } }} req - Pedido HTTP atual.
 * @param {import("express").Response} res - Resposta HTTP usada para devolver dados da sessão.
 * @returns {import("express").Response} Resposta JSON que descreve o estado da sessão.
 */
export function getCurrentSession(req, res) {
    return res.status(200).json({ user: req.user ?? null });
}

/**
 * Limpa o cookie de sessão e devolve resposta de logout com sucesso.
 *
 * @param {import("express").Request & { session?: { token?: string } }} req - Pedido HTTP atual.
 * @param {import("express").Response} res - Resposta HTTP onde o cookie expirado é escrito.
 * @returns {Promise<import("express").Response>} Resposta vazia que confirma logout.
 */
export async function logout(req, res) {
    await deleteSession(req.session?.token);
    clearSessionCookie(res);
    return res.status(204).send();
}
