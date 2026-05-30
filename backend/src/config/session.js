import { isProduction } from "./env.js";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const sessionConfig = {
    cookieName: process.env.SESSION_COOKIE_NAME ?? "faithflix_session",
    cookieMaxAgeMs: ONE_DAY_IN_MS,
};

export function getSessionCookieOptions(overrides = {}) {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: sessionConfig.cookieMaxAgeMs,
        ...overrides,
    };
}