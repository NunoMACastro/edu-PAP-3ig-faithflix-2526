/**
 * @file Ficheiro `real_dev/backend/src/modules/system/health.controller.js` da implementação real_dev.
 */

import { getHealthStatus } from "./health.service.js";

/**
 * Devolve o estado operacional atual.
 *
 * @param {import("express").Request} _req - Pedido HTTP não usado.
 * @param {import("express").Response} res - Resposta HTTP usada para devolver os dados de saúde.
 * @returns {import("express").Response} Resposta JSON com informação de saúde.
 */
export function getHealth(_req, res) {
    return res.status(200).json(getHealthStatus());
}
