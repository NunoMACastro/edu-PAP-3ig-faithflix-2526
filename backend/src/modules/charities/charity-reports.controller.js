/**
 * @file Controllers HTTP para relatórios da pool solidária.
 *
 * Aplica autorização de admin ou membership antes de expor histórico privado e
 * delega agregações, CSV e listagens públicas ao serviço.
 */

import {
  getCharityHistory,
  getMyCharityMembership,
  getMyCharitySummary,
  getPoolDashboard,
  historyToCsv,
  linkUserToCharity,
  lookupAdminCharities,
  listPublicCharities,
} from "./charity-reports.service.js";

/**
 * Confirma se o utilizador pode ler o histórico de uma associação.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {string} charityId Identificador da associação consultada.
 * @returns {Promise<void>}
 * @throws {Error} Quando o utilizador não tem permissão.
 */
async function assertCanReadCharity(req, charityId) {
  if (req.user.role === "admin") {
    return;
  }

  const membership = await getMyCharityMembership(req.user.id);

  if (String(membership.charityId) === String(charityId)) {
    return;
  }

  const error = new Error("Não tens permissão para consultar esta associação.");
  error.statusCode = 403;
  throw error;
}

/**
 * Devolve painel agregado da pool para administradores.
 *
 * @param {import("express").Request} _req Pedido autenticado como admin.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getPoolDashboardController(_req, res) {
  res.status(200).json(await getPoolDashboard());
}

/**
 * Devolve uma página mínima de associações para seletores administrativos.
 *
 * @param {import("express").Request} req Pedido com pesquisa e paginação.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getAdminCharityLookup(req, res) {
  res.status(200).json(await lookupAdminCharities(req.query));
}

/**
 * Liga um utilizador a uma associação por ação administrativa.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `body.userId` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postCharityMember(req, res) {
  res.status(201).json(
    await linkUserToCharity(req.params.id, req.body.userId, req.user.id, {
      requestId: req.id,
    }),
  );
}

/**
 * Devolve histórico privado de uma associação depois de validar permissão.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getCharityHistoryController(req, res) {
  await assertCanReadCharity(req, req.params.id);
  res.status(200).json(await getCharityHistory(req.params.id));
}

/**
 * Exporta histórico privado em CSV depois de validar permissão.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getCharityHistoryCsv(req, res) {
  await assertCanReadCharity(req, req.params.id);
  const history = await getCharityHistory(req.params.id);

  // O tipo de conteúdo explícito ajuda navegadors e ferramentas de defesa a reconhecer o ficheiro.
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.status(200).send(historyToCsv(history));
}

/**
 * Devolve associações públicas sem dados de contacto internos.
 *
 * @param {import("express").Request} _req Pedido público.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getPublicCharities(_req, res) {
  res.status(200).json(await listPublicCharities());
}

/**
 * Devolve apenas a associação ligada à sessão atual, quando existir.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyCharity(req, res) {
  res.status(200).json(await getMyCharitySummary(req.user.id));
}
