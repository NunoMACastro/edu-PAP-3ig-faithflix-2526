import { clearSessionCookie } from "../../utils/cookies.js";

/**
 * Returns the currently authenticated session, when one exists.
 *
 * @param {import("express").Request & { session?: { user: unknown, isAuthenticated: boolean } }} req - Current HTTP request.
 * @param {import("express").Response} res - HTTP response used to return session data or 401.
 * @returns {import("express").Response} JSON response describing the session state.
 */
export function getCurrentSession(req, res) {
    if (!req.session?.isAuthenticated) {
        return res.status(401).json({ message: "Sessao nao autenticada." });
    }

    return res.status(200).json({ user: req.session.user });
}

/**
 * Clears the session cookie and returns a successful logout response.
 *
 * @param {import("express").Request} _req - Unused HTTP request.
 * @param {import("express").Response} res - HTTP response where the expired cookie is written.
 * @returns {import("express").Response} JSON response confirming logout.
 */
export function logout(_req, res) {
    clearSessionCookie(res);
    return res.status(200).json({ message: "Sessao terminada." });
}
