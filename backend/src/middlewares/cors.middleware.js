import { corsConfig } from "../config/cors.js";

const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type,X-Request-Id";

/**
 * Adds CORS headers for configured frontend origins.
 *
 * @param {import("express").Request} req - Current HTTP request.
 * @param {import("express").Response} res - HTTP response where CORS headers may be set.
 * @param {import("express").NextFunction} next - Express callback used to continue the pipeline.
 * @returns {void | import("express").Response} Ends preflight requests or continues normal requests.
 */
export function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;

    if (typeof origin === "string" && corsConfig.allowedOrigins.includes(origin)) {
        // Credentials require an explicit origin; wildcard is not safe here.
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        return res.status(204).send();
    }

    next();
}
