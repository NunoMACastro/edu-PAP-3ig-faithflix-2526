/**
 * Módulo de controllers HTTP para a distribuição mensal da pool.
 *
 * Expõe comandos administrativos para executar e consultar distribuições,
 * mantendo cálculo e persistência concentrados no service.
 */
import {
  getDistributionByMonth,
  runMonthlyDistribution,
} from "./pool-distribution.service.js";

/**
 * Executa uma nova distribuição mensal por pedido admin.
 *
 * @param {import("express").Request} req Pedido com `body.month` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postMonthlyDistribution(req, res) {
  res.status(201).json(await runMonthlyDistribution(req.body.month, req.user.id));
}

/**
 * Devolve uma distribuição mensal existente.
 *
 * @param {import("express").Request} req Pedido com `params.month`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMonthlyDistribution(req, res) {
  res.status(200).json(await getDistributionByMonth(req.params.month));
}