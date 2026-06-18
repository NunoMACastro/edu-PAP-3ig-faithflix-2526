// apps/backend/src/modules/integrations/integrations.controller.js
import {
    listIntegrationSettings,
    updateIntegrationSetting,
} from "./integrations.service.js";

/**
 * Lista configurações de integração para administração.
 *
 * @param {import("express").Request} _req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Lista de integrações.
 */
export async function getIntegrations(_req, res) {
    return res.status(200).json({
        integrations: await listIntegrationSettings(),
    });
}

/**
 * Atualiza configuração de uma integração.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Integração atualizada.
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