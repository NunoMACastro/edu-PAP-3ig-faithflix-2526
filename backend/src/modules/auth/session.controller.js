import { clearSessionCookie } from "../../utils/cookies.js";
import { deleteSession } from "./session.service.js";

/**
 * Returns the currently authenticated session, when one exists.
 *
 * @param {import("express").Request & { user?: unknown, session?: { user: unknown, isAuthenticated: boolean } }} req - Current HTTP request.
 * @param {import("express").Response} res - HTTP response used to return session data.
 * @returns {import("express").Response} JSON response describing the session state.
 */
export function getCurrentSession(req, res) {
    return res.status(200).json({ user: req.user ?? null });
}

/**
 * Clears the session cookie and returns a successful logout response.
 *
 * @param {import("express").Request & { session?: { token?: string } }} req - Current HTTP request.
 * @param {import("express").Response} res - HTTP response where the expired cookie is written.
 * @returns {Promise<import("express").Response>} Empty response confirming logout.
 */
export async function logout(req, res) {
    await deleteSession(req.session?.token);
    clearSessionCookie(res);
    return res.status(204).send();
}
