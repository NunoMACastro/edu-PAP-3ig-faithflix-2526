/**
 * @file Rotas HTTP do módulo de associações.
 *
 * Junta candidaturas, revisão administrativa, distribuição da pool e relatórios
 * públicos/privados num único router montado em `/api/charities`.
 */

import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getCharityApplications,
  patchCharityApplicationReview,
  postCharityApplication,
} from "./charity-applications.controller.js";
import {
  getCharityHistoryController,
  getCharityHistoryCsv,
  getPoolDashboardController,
  getPublicCharities,
  postCharityMember,
} from "./charity-reports.controller.js";
import {
  getMonthlyDistribution,
  postMonthlyDistribution,
} from "./pool-distribution.controller.js";

/**
 * Router de associações.
 *
 * A submissão de candidatura e a listagem pública são anónimas; os restantes
 * rotas dependem de autenticação ou role `admin`.
 */
export const charitiesRouter = Router();

charitiesRouter.post("/applications", asyncHandler(postCharityApplication));
charitiesRouter.get(
  "/applications",
  requireRole(["admin"]),
  asyncHandler(getCharityApplications),
);
charitiesRouter.patch(
  "/applications/:id/review",
  requireRole(["admin"]),
  asyncHandler(patchCharityApplicationReview),
);

charitiesRouter.get("/public", asyncHandler(getPublicCharities));
charitiesRouter.get(
  "/pool/dashboard",
  requireRole(["admin"]),
  asyncHandler(getPoolDashboardController),
);
charitiesRouter.post(
  "/pool/distributions",
  requireRole(["admin"]),
  asyncHandler(postMonthlyDistribution),
);
charitiesRouter.get(
  "/pool/distributions/:month",
  requireRole(["admin"]),
  asyncHandler(getMonthlyDistribution),
);

charitiesRouter.post(
  "/:id/members",
  requireRole(["admin"]),
  asyncHandler(postCharityMember),
);
charitiesRouter.get(
  "/:id/history",
  requireAuth,
  asyncHandler(getCharityHistoryController),
);
charitiesRouter.get(
  "/:id/history.csv",
  requireAuth,
  asyncHandler(getCharityHistoryCsv),
);
