const DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

/**
 * Parses a comma-separated origin list from an environment variable.
 *
 * @param {string | undefined} value - Raw value from `process.env.FRONTEND_ORIGIN`.
 * @returns {string[]} List of allowed browser origins.
 */
function parseAllowedOrigins(value) {
    if (!value) {
        return DEFAULT_ALLOWED_ORIGINS;
    }

    return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

/**
 * CORS configuration for browser-based frontend requests.
 *
 * @type {{ allowedOrigins: string[] }}
 */
export const corsConfig = {
    allowedOrigins: parseAllowedOrigins(process.env.FRONTEND_ORIGIN),
};
