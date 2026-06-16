/**
 * @file Ficheiro `real_dev/backend/src/modules/payments/payments.controller.js` da implementação real_dev.
 */

/**
 * Módulo de controllers HTTP para pagamentos simulados.
 *
 * Traduz pedidos Express autenticados em chamadas ao service e escolhe códigos
 * HTTP observáveis para sucesso, trial criado e pagamento recusado.
 */
import { createSimulatedCheckout, startTrial } from "./payments.service.js";

/**
 * Executa checkout simulado para o utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido com `req.user.id` e corpo validavel.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postSimulatedCheckout(req, res) {
  const result = await createSimulatedCheckout(req.user.id, req.body);
  // `402` comunica recusa de pagamento no domínio, não falha tecnica do servidor.
  res.status(result.status === "approved" ? 201 : 402).json(result);
}

/**
 * Inicia o trial gratuito para o utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postTrial(req, res) {
  res.status(201).json(await startTrial(req.user.id));
}