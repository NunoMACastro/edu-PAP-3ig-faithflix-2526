import { env } from "../../config/env.js";

/**
 * Returns basic technical information about the FaithFlix API.
 *
 * @param {import("express").Request} _req - Unused HTTP request.
 * @param {import("express").Response} res - HTTP response used to return the API metadata.
 * @returns {import("express").Response} JSON response with service metadata.
 */
export function getApiInfo(_req, res) {
    return res.status(200).json({
        service: env.serviceName,
        name: "FaithFlix API",
        version: "0.1.0",
        status: "ok",
    });
}
