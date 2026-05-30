import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import { readCookie } from "../utils/cookies.js";

export async function attachSession(req, _res, next) {
    try {
        const token = readCookie(req, sessionConfig.cookieName);
        const user = await resolveSession(token);

        req.session = {
            token,
            user,
            isAuthenticated: Boolean(user),
        };

        next();
    } catch (error) {
        next(error);
    }
}