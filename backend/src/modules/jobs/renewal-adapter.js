/**
 * @file Adapter determinístico do pagamento simulado de renovações.
 *
 * Não contacta gateways nem usa aleatoriedade. O resultado é controlado por
 * configuração explícita da subscrição/plano e existe apenas para a baseline
 * local; nunca deve ser apresentado como integração financeira real.
 */

const ALLOWED_OUTCOMES = new Set(["approved", "failed"]);

/**
 * Resolve o resultado local de uma renovação simulada.
 *
 * A subscrição pode substituir o valor do plano para permitir cenários de
 * teste/apoio. Sem configuração explícita, a baseline aprova deterministicamente.
 *
 * @param {{ subscription: Record<string, unknown>, plan: Record<string, unknown> }} input Contexto persistido.
 * @returns {{ status: "approved" | "failed", provider: "faithflix-simulated", failureReason: string | null }} Decisão local.
 */
export function decideSimulatedRenewal(input) {
  const configuredOutcome = String(
    input.subscription?.simulatedRenewalOutcome ??
      input.plan?.simulatedRenewalOutcome ??
      "approved",
  ).trim();

  if (!ALLOWED_OUTCOMES.has(configuredOutcome)) {
    const error = new Error("Resultado de renovação inválido.");
    error.code = "RENEWAL_SIMULATION_INVALID";
    throw error;
  }

  return {
    status: configuredOutcome,
    provider: "faithflix-simulated",
    failureReason:
      configuredOutcome === "failed"
        ? "Renovação recusada."
        : null,
  };
}
