import { getHealthStatus } from "./health.service.js";

/**
 * Returns the current operational health status.
 *
 * @param {import("express").Request} _req - Unused HTTP request.
 * @param {import("express").Response} res - HTTP response used to return the health payload.
 * @returns {import("express").Response} JSON response with health information.
 */
export function getHealth(_req, res) {
    return res.status(200).json(getHealthStatus());
}
