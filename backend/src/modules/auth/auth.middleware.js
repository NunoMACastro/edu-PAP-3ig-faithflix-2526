/**
 * Requires a valid authenticated user on the current request.
 *
 * @param {import("express").Request & { user?: unknown }} req - Current request.
 * @param {import("express").Response} res - HTTP response.
 * @param {import("express").NextFunction} next - Next middleware callback.
 * @returns {import("express").Response | void} Continues or returns 401.
 */
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "Autenticacao obrigatoria." });
    }

    return next();
}

/**
 * Requires the authenticated user to have one of the allowed roles.
 *
 * @param {string[]} allowedRoles - Roles accepted by the protected route.
 * @returns {import("express").RequestHandler} Express middleware.
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
