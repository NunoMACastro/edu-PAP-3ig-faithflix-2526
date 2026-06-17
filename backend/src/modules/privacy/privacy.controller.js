import { buildUserDataExport } from "./privacy.service.js";
import { deleteMyAccount } from "./privacy.service.js";
import { getMyConsents, updateMyConsents } from "./privacy.service.js";



/**
 * Devolve a exportação de dados do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta JSON com a exportação.
 */
export async function getMyDataExport(req, res) {
    const dataExport = await buildUserDataExport(req.user.id);

    return res.status(200).json({ export: dataExport });
}

/**
 * Elimina a conta do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resumo seguro da eliminação.
 */
export async function deleteMyAccountController(req, res) {
    const result = await deleteMyAccount(req.user.id, req.body);

    return res.status(200).json(result);
}

/**
 * Devolve os consentimentos atuais do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Consentimentos atuais.
 */
export async function getMyConsentsController(req, res) {
    return res.status(200).json({
        consentState: await getMyConsents(req.user.id),
    });
}

/**
 * Atualiza os consentimentos do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Consentimentos atualizados.
 */
export async function putMyConsentsController(req, res) {
    return res.status(200).json({
        consentState: await updateMyConsents(req.user.id, req.body),
    });
}