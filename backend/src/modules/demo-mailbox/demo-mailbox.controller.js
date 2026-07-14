/**
 * @file Controller da caixa de email exclusivamente local da demo.
 */

import { listDemoMailbox } from "./demo-mailbox.service.js";

/**
 * Lê mensagens locais por email sem permitir cache do token de reset.
 *
 * @param {import("express").Request} req Pedido HTTP local.
 * @param {import("express").Response} res Resposta JSON.
 * @returns {Promise<import("express").Response>} Caixa demo atual.
 */
export async function postDemoMailbox(req, res) {
    const mailbox = await listDemoMailbox(req.body, {
        remoteAddress: req.socket?.remoteAddress,
    });
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).json(mailbox);
}
