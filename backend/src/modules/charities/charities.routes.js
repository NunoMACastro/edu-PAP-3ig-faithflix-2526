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