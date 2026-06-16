// A rota pública vem antes de `/:id/...` para evitar ambiguidades de routing.
charitiesRouter.get("/public", asyncHandler(getPublicCharities));
charitiesRouter.get("/pool/dashboard", requireRole(["admin"]), asyncHandler(getPoolDashboardController));
charitiesRouter.post("/:id/members", requireRole(["admin"]), asyncHandler(postCharityMember));
charitiesRouter.get("/:id/history", requireAuth, asyncHandler(getCharityHistoryController));
charitiesRouter.get("/:id/history.csv", requireAuth, asyncHandler(getCharityHistoryCsv));

// A rota fica protegida por role admin porque altera estado operacional e entrada na pool.
charitiesRouter.patch(
  "/applications/:id/review",
  requireRole(["admin"]),
  asyncHandler(patchCharityApplicationReview),
);

// Executar distribuicoes altera registos financeiros, por isso fica reservado a administradores.
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

