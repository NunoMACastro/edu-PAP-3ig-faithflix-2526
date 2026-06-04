export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticacao obrigatoria." });
  }

  return next();
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Autenticacao obrigatoria." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permissao insuficiente." });
    }

    return next();
  };
}