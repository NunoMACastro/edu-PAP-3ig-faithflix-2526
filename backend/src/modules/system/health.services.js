import { env } from "../../config/env.js";

export function getHealthStatus() {
    return {
        status: "ok",
        service: env.serviceName,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        dependencies: {
            api: "ok",
            database: "not_configured",
            streaming: "not_configured",
            payments: "not_configured",
        },
    };
}