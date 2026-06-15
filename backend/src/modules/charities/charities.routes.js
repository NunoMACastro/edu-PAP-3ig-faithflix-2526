// A rota fica protegida por role admin porque altera estado operacional e entrada na pool.
charitiesRouter.patch(
  "/applications/:id/review",
  requireRole(["admin"]),
  asyncHandler(patchCharityApplicationReview),
);