import { isProduction } from "./env.js";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Base session configuration shared by the session middleware and controllers.
 *
 * @type {{ cookieName: string, cookieMaxAgeMs: number }}
 */
export const sessionConfig = {
    cookieName: process.env.SESSION_COOKIE_NAME ?? "faithflix_session",
    cookieMaxAgeMs: ONE_DAY_IN_MS,
};

/**
 * Builds secure cookie options for the FaithFlix session cookie.
 *
 * @param {Partial<import("express").CookieOptions>} [overrides={}] - Options that intentionally override the defaults.
 * @returns {import("express").CookieOptions} Cookie options used when setting or clearing the session cookie.
 */
export function getSessionCookieOptions(overrides = {}) {
    return {
        // HttpOnly is the core requirement: frontend JavaScript cannot read it.
        httpOnly: true,
        // Secure is enabled in production, where HTTPS is expected.
        secure: isProduction,
        // Lax is a conservative default for this foundation stage.
        sameSite: "lax",
        path: "/",
        maxAge: sessionConfig.cookieMaxAgeMs,
        ...overrides,
    };
}
