/**
 * @file Ficheiro `real_dev/backend/src/modules/system/health.service.js` da implementação real_dev.
 */

import { env } from "../../config/env.js";

/**
 * Constrói o dados de saúde operacional do processo backend atual.
 *
 * @returns {{ status: string, service: string, timestamp: string, uptimeSeconds: number, dependencies: { api: string, database: string, streaming: string, payments: string } }} Dados de estado de saúde.
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
