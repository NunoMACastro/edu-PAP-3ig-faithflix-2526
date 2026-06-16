/**
 * @file Ficheiro `real_dev/backend/src/config/session.js` da implementação real_dev.
 */

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
 * Constrói opções seguras para o cookie de sessão FaithFlix.
 *
 * @param {Partial<import("express").CookieOptions>} [overrides={}] - Options that intentionally override the defaults.
 * @returns {import("express").CookieOptions} Opções de cookie usadas ao definir ou limpar o cookie de sessão.
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
