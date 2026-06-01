import { env } from "../../config/env.js";

/**
 * Builds the operational health payload for the current backend process.
 *
 * @returns {{ status: string, service: string, timestamp: string, uptimeSeconds: number, dependencies: { api: string, database: string, streaming: string, payments: string } }} Health status payload.
 */
export function getHealthStatus() {
    return {
        status: "ok",
        service: env.serviceName,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        dependencies: {
            api: "ok",
            // These dependencies are not configured in MF1, so the health-check says that honestly.
            database: "not_configured",
            streaming: "not_configured",
            payments: "not_configured",
        },
    };
}
