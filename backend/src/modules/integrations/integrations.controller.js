/**
 * @file Controller de integracoes administrativas.
 */

import {
    listIntegrationSettings,
    updateIntegrationSetting,
} from "./integrations.service.js";

/**
 * Lista integracoes configuraveis.
 *
 * @param {import("express").Request} _req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Lista de integracoes.
 */
export async function getIntegrations(_req, res) {
    return res
        .status(200)
        .json({ integrations: await listIntegrationSettings() });
}

/**
 * Atualiza uma integracao por chave.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Integracao atualizada.
 */
export async function patchIntegration(req, res) {
    return res.status(200).json({
        integration: await updateIntegrationSetting(
            req.user.id,
            req.params.key,
            req.body,
        ),
    });
}
