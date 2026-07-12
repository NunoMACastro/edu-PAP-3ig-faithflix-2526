/**
 * @file Controladores HTTP de liveness e readiness.
 */

import {
    getLivenessStatus,
    getReadinessStatus,
} from "./health.service.js";

/**
 * Impede caches intermédios de reutilizarem um estado operacional antigo.
 *
 * @param {import("express").Response} res Resposta Express.
 * @returns {void}
 */
function disableHealthCaching(res) {
    res.setHeader("Cache-Control", "no-store");
}

/**
 * Devolve liveness sem consultar a sessão ou dependências externas.
 *
 * @param {import("express").Request} _req Pedido HTTP não usado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {import("express").Response} Resposta 200 enquanto o processo responde.
 */
export function getLiveness(_req, res) {
    disableHealthCaching(res);
    return res.status(200).json(getLivenessStatus());
}

/**
 * Devolve readiness depois de um ping MongoDB com deadline total curto.
 *
 * @param {import("express").Request} _req Pedido HTTP não usado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} 200 quando MongoDB responde ou 503 seguro caso contrário.
 */
export async function getReadiness(_req, res) {
    disableHealthCaching(res);
    const status = await getReadinessStatus();
    return res.status(status.ready ? 200 : 503).json(status);
}
