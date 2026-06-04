import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import { readCookie } from "../utils/cookies.js";

export async function attachSession(req, _res, next) {
  try {
    const token = readCookie(req, sessionConfig.cookieName);
    const resolvedSession = await resolveSession(token);

    req.session = {
      token,
      user: resolvedSession?.user ?? null,
      isAuthenticated: Boolean(resolvedSession?.user),
    };

    // Os BKs seguintes usam req.user para aplicar ownership e roles no backend.
    req.user = req.session.user;

    next();
  } catch (error) {
    next(error);
  }
}