import { getSessionCookieOptions, sessionConfig } from "../config/session.js";

export function parseCookies(cookieHeader = "") {
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((cookies, part) => {
            const separatorIndex = part.indexOf("=");

            if (separatorIndex === -1) {
                return cookies;
            }

            const key = part.slice(0, separatorIndex);
            const value = part.slice(separatorIndex + 1);

            try {
                cookies[key] = decodeURIComponent(value);
            } catch {
                cookies[key] = value;
            }

            return cookies;
        }, {});
}

export function readCookie(req, name) {
    return parseCookies(req.headers.cookie)[name];
}

export function clearSessionCookie(res) {
    res.cookie(
        sessionConfig.cookieName,
        "",
        getSessionCookieOptions({ maxAge: 0 }),
    );
}