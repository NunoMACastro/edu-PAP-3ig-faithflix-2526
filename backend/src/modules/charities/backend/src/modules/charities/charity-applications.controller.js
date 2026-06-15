import { reviewCharityApplication } from "./charity-review.service.js";

/**
 * Aplica decisão administrativa sobre uma candidatura pendente.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `user.id` e corpo de decisão.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchCharityApplicationReview(req, res) {
  res.status(200).json(await reviewCharityApplication(req.params.id, req.user.id, req.body)); 
}

// A rota fica protegida por role admin porque altera estado operacional e entrada na pool.
charitiesRouter.patch(
  "/applications/:id/review",
  requireRole(["admin"]),
  asyncHandler(patchCharityApplicationReview),
);
