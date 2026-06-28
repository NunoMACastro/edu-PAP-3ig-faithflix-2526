/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.middleware.js` da implementação real_dev.
 */

/**
 * Exige um utilizador autenticado válido no pedido atual.
 *
 * @param {import("express").Request & { user?: unknown }} req - Pedido atual.
 * @param {import("express").Response} res - Resposta HTTP.
 * @param {import("express").NextFunction} next - Next middleware callback.
 * @returns {import("express").Response | void} Continua ou devolve 401.
 */
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "Autenticacao obrigatoria." });
    }

    return next();
}

/**
 * Exige que o utilizador autenticado tenha uma das roles permitidas.
 *
 * @param {string[]} allowedRoles - Roles aceites pela rota protegida.
 * @returns {import("express").RequestGestor} Middleware Express.
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ message: "Autenticacao obrigatoria." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Permissao insuficiente." });
        }

        return next();
    };
}
