import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import { readCookie } from "../utils/cookies.js";

/**
 * Attaches the current session state to the Express request.
 *
 * @param {import("express").Request & { user?: unknown, session?: { token?: string, user: unknown, isAuthenticated: boolean } }} req - Current HTTP request.
 * @param {import("express").Response} _res - Unused response object.
 * @param {import("express").NextFunction} next - Express callback used to continue or forward errors.
 * @returns {Promise<void>} Resolves after the session state is attached.
 */
export async function attachSession(req, _res, next) {
    try {
        const token = readCookie(req, sessionConfig.cookieName);
        const resolvedSession = await resolveSession(token);

        // The shape is stable even when there is no authenticated user.
        req.session = {
            token,
            user: resolvedSession?.user ?? null,
            isAuthenticated: Boolean(resolvedSession?.user),
        };
        req.user = req.session.user;

        next();
    } catch (error) {
        next(error);
    }
}
