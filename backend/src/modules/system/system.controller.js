import { env } from "../../config/env.js";

export function getApiInfo(_req, res) {
    return res.status(200).json({
        service: env.serviceName,
        name: "FaithFlix API",
        version: "0.1.0",
        status: "ok",
    });
}