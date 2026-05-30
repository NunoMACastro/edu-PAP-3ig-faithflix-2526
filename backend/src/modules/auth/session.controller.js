import { clearSessionCookie } from "../../utils/cookies.js";

export function getCurrentSession(req, res) {
    if (!req.session?.isAuthenticated) {
        return res.status(401).json({ message: "Sessao nao autenticada." });
    }

    return res.status(200).json({ user: req.session.user });
}

export function logout(_req, res) {
    clearSessionCookie(res);
    return res.status(200).json({ message: "Sessao terminada." });
}