/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.controller.js` da implementação real_dev.
 */

import { getSessionCookieOptions, sessionConfig } from "../../config/session.js";
import {
    loginUser,
    registerUser,
    requestPasswordReset,
    resetPassword,
} from "./auth.service.js";

/**
 * Writes the session cookie using the secure defaults from MF1.
 *
 * @param {import("express").Response} res - Resposta HTTP.
 * @param {string} token - Token opaco de sessão.
 * @returns {void}
 */
function setSessionCookie(res, token) {
    res.cookie(sessionConfig.cookieName, token, getSessionCookieOptions());
}

/**
 * Regista um utilizador e inicia uma sessão.
 *
 * @param {import("express").Request} req - Pedido com dados de registo.
 * @param {import("express").Response} res - Resposta usada para definir o cookie.
 * @returns {Promise<import("express").Response>} Resposta de utilizador criado.
 */
export async function register(req, res) {
    const result = await registerUser(req.body);
    setSessionCookie(res, result.token);
    return res.status(201).json({ user: result.user });
}

/**
 * Autentica um utilizador e inicia uma sessão.
 *
 * @param {import("express").Request} req - Pedido com dados de login.
 * @param {import("express").Response} res - Resposta usada para definir o cookie.
 * @returns {Promise<import("express").Response>} Resposta de utilizador autenticado.
 */
export async function login(req, res) {
    const result = await loginUser(req.body);
    setSessionCookie(res, result.token);
    return res.status(200).json({ user: result.user });
}

/**
 * Cria um pedido de recuperação de password.
 *
 * @param {import("express").Request} req - Pedido com dados de email.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta genérica de recuperação.
 */
export async function forgotPassword(req, res) {
    return res.status(200).json(await requestPasswordReset(req.body));
}

/**
 * Resets a password using a valid reset token.
 *
 * @param {import("express").Request} req - Pedido com token e password.
 * @param {import("express").Response} res - Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta de sucesso.
 */
export async function resetPasswordController(req, res) {
    return res.status(200).json(await resetPassword(req.body));
}
