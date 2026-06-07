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
 * @param {import("express").Response} res - HTTP response.
 * @param {string} token - Opaque session token.
 * @returns {void}
 */
function setSessionCookie(res, token) {
    res.cookie(sessionConfig.cookieName, token, getSessionCookieOptions());
}

/**
 * Registers a user and starts a session.
 *
 * @param {import("express").Request} req - Request with register payload.
 * @param {import("express").Response} res - Response used to set the cookie.
 * @returns {Promise<import("express").Response>} Created user response.
 */
export async function register(req, res) {
    const result = await registerUser(req.body);
    setSessionCookie(res, result.token);
    return res.status(201).json({ user: result.user });
}

/**
 * Authenticates a user and starts a session.
 *
 * @param {import("express").Request} req - Request with login payload.
 * @param {import("express").Response} res - Response used to set the cookie.
 * @returns {Promise<import("express").Response>} Authenticated user response.
 */
export async function login(req, res) {
    const result = await loginUser(req.body);
    setSessionCookie(res, result.token);
    return res.status(200).json({ user: result.user });
}

/**
 * Creates a password reset request.
 *
 * @param {import("express").Request} req - Request with email payload.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} Generic reset response.
 */
export async function forgotPassword(req, res) {
    return res.status(200).json(await requestPasswordReset(req.body));
}

/**
 * Resets a password using a valid reset token.
 *
 * @param {import("express").Request} req - Request with token and password.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} Success response.
 */
export async function resetPasswordController(req, res) {
    return res.status(200).json(await resetPassword(req.body));
}
