/**
 * @file Ficheiro `real_dev/backend/src/modules/charities/pool-distribution.controller.js` da implementação real_dev.
 */

/**
 * Módulo de controllers HTTP para a distribuição mensal da pool.
 *
 * Expõe comandos administrativos para executar e consultar distribuições,
 * mantendo cálculo e persistência concentrados no service.
 */
import {
  getDistributionByMonth,
  previewMonthlyDistribution,
  runMonthlyDistribution,
} from "./pool-distribution.service.js";
import { assertDistributionPreviewToken } from "./pool-distribution.validation.js";

/**
 * Executa uma nova distribuição mensal por pedido admin.
 *
 * @param {import("express").Request} req Pedido com `body.month` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postMonthlyDistribution(req, res) {
  const previewToken = assertDistributionPreviewToken(req.body.previewToken);
  res.status(201).json(
    await runMonthlyDistribution(req.body.month, req.user.id, {
      trigger: "admin",
      requestId: req.id,
      expectedPreviewToken: previewToken,
    }),
  );
}

/**
 * Calcula uma preview sem escrever distribuição ou audit log.
 *
 * @param {import("express").Request} req Pedido com `params.month`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMonthlyDistributionPreview(req, res) {
  res.status(200).json(await previewMonthlyDistribution(req.params.month));
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
