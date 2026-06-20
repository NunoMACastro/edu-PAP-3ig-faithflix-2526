/**
 * @file Ficheiro `real_dev/backend/src/modules/system/system.controller.js` da implementação real_dev.
 */

import { env } from "../../config/env.js";

/**
 * Devolve informação técnica básica sobre a API FaithFlix.
 *
 * @param {import("express").Request} _req - Pedido HTTP não usado.
 * @param {import("express").Response} res - Resposta HTTP usada para devolver os metadados da API.
 * @returns {import("express").Response} Resposta JSON com metadados do serviço.
 */
export function getApiInfo(_req, res) {
    return res.status(200).json({
        service: env.serviceName,
        name: "FaithFlix API",
        version: "0.1.0",
        status: "ok",
    });
}
