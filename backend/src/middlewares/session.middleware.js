/**
 * @file Ficheiro `real_dev/backend/src/middlewares/session.middleware.js` da implementação real_dev.
 */

import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import { readCookie } from "../utils/cookies.js";

/**
 * Associa o estado atual da sessão ao pedido Express.
 *
 * @param {import("express").Request & { user?: unknown, session?: { token?: string, user: unknown, isAuthenticated: boolean } }} req - Pedido HTTP atual.
 * @param {import("express").Response} _res - Objeto de resposta não usado.
 * @param {import("express").NextFunction} next - Callback Express usado para continuar ou encaminhar erros.
 * @returns {Promise<void>} Termina depois de associar o estado da sessão.
 */
export async function attachSession(req, _res, next) {
    try {
        const token = readCookie(req, sessionConfig.cookieName);
        const resolvedSession = await resolveSession(token);

        // A estrutura mantém-se estável mesmo quando não há utilizador autenticado.
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
