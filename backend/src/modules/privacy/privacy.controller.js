/**
 * @file Controllers HTTP do modulo de privacidade.
 */

import { clearSessionCookie } from "../../utils/cookies.js";
import {
    buildUserDataExport,
    deleteMyAccount,
    getMyConsents,
    updateMyConsents,
} from "./privacy.service.js";

/**
 * Devolve a exportacao de dados do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} JSON de exportacao.
 */
export async function getPrivacyExport(req, res) {
    return res
        .status(200)
        .json({ export: await buildUserDataExport(req.user.id) });
}

/**
 * Elimina a propria conta e limpa o cookie de sessao.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resultado da eliminacao.
 */
export async function deleteAccount(req, res) {
    const result = await deleteMyAccount(req.user.id, req.body);
    clearSessionCookie(res);

    return res.status(200).json(result);
}

/**
 * Devolve consentimentos atuais do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Estado de consentimentos.
 */
export async function getConsents(req, res) {
    return res
        .status(200)
        .json({ consentState: await getMyConsents(req.user.id) });
}

/**
 * Atualiza consentimentos do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Estado atualizado.
 */
export async function putConsents(req, res) {
    return res.status(200).json({
        consentState: await updateMyConsents(req.user.id, req.body),
    });
}
