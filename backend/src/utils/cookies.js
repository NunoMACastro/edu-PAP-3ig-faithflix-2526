import { getSessionCookieOptions, sessionConfig } from "../config/session.js";

/**
 * Parses an HTTP Cookie header into a plain object.
 *
 * @param {string} [cookieHeader=""] - Raw `Cookie` header received by Express.
 * @returns {Record<string, string>} Cookie names and decoded values.
 */
export function parseCookies(cookieHeader = "") {
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((cookies, part) => {
            const separatorIndex = part.indexOf("=");

            // Invalid cookie fragments are ignored instead of breaking the API.
            if (separatorIndex === -1) {
                return cookies;
            }

            const key = part.slice(0, separatorIndex);
            const value = part.slice(separatorIndex + 1);

            try {
                cookies[key] = decodeURIComponent(value);
            } catch {
                // A badly encoded cookie must not crash the request pipeline.
                cookies[key] = value;
            }

            return cookies;
        }, {});
}

/**
 * Reads one cookie value from an Express request.
 *
 * @param {import("express").Request} req - Current HTTP request.
 * @param {string} name - Cookie name to read.
 * @returns {string | undefined} Cookie value when present.
 */
export function readCookie(req, name) {
    return parseCookies(req.headers.cookie)[name];
}

/**
 * Clears the configured session cookie in the HTTP response.
 *
 * @param {import("express").Response} res - HTTP response where the expired cookie is written.
 * @returns {void}
 */
export function clearSessionCookie(res) {
    res.cookie(
        sessionConfig.cookieName,
        "",
        getSessionCookieOptions({ maxAge: 0 }),
    );
}
