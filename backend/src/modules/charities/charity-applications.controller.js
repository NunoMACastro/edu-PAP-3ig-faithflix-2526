/**
 * @file Controllers HTTP para candidaturas e revisão de associações.
 *
 * A camada HTTP fica curta de propósito: validação, persistência e regras de
 * decisão vivem nos serviços, enquanto os controllers escolhem estado codes e
 * ligam parâmetros Express aos casos de uso.
 */

import {
  listCharityApplications,
  submitCharityApplication,
} from "./charity-applications.service.js";
import { reviewCharityApplication } from "./charity-review.service.js";

/**
 * Recebe uma candidatura pública de associação.
 *
 * @param {import("express").Request} req Pedido com corpo da candidatura.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postCharityApplication(req, res) {
  res.status(201).json(await submitCharityApplication(req.body));
}

/**
 * Lista candidaturas para administradores.
 *
 * @param {import("express").Request} req Pedido com filtro opcional `estado`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getCharityApplications(req, res) {
  res.status(200).json(await listCharityApplications(req.query));
}

/**
 * Aplica uma decisão administrativa a uma candidatura pendente.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `body` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchCharityApplicationReview(req, res) {
  res
    .status(200)
    .json(
      await reviewCharityApplication(req.params.id, req.user.id, req.body, {
        requestId: req.id,
      }),
    );
}
