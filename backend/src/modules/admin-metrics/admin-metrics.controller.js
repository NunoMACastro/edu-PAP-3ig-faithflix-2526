/**
 * @file Controller do painel de metricas admin.
 */

import {
    exportAdminMetricsCsv,
    getAdminMetrics,
} from "./admin-metrics.service.js";
import {
    assertIntegrationEnabled,
    getIntegrationSetting,
} from "../integrations/integrations.service.js";

/**
 * Devolve metricas administrativas agregadas.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com metricas.
 */
export async function getMetrics(req, res) {
    const [metrics, exportSetting] = await Promise.all([
        getAdminMetrics(req.query),
        getIntegrationSetting("aggregate_analytics_export"),
    ]);

    return res.status(200).json({
        metrics,
        capabilities: { csvExport: exportSetting.enabled },
    });
}

/**
 * Descarrega apenas os totais agregados num ficheiro CSV privado.
 *
 * @param {import("express").Request} req Pedido admin autenticado.
 * @param {import("express").Response} res Resposta de ficheiro.
 * @returns {Promise<import("express").Response>} CSV com headers seguros.
 */
export async function exportMetricsCsv(req, res) {
    await assertIntegrationEnabled("aggregate_analytics_export");
    const csv = await exportAdminMetricsCsv(req.query);
    const day = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="faithflix-metricas-${day}.csv"`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(csv);
}
