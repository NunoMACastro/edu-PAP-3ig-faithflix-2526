/**
 * @file Ficheiro `real_dev/frontend/src/pages/SubscriptionPage.jsx` da implementação real_dev.
 */

/**
 * Módulo da página de subscrição com checkout simulado e trial.
 *
 * Combina planos, subscrição atual, tentativa de pagamento e trial numa única
 * interface, mantendo o pertença no backend através da sessão autenticada.
 */
import { useEffect, useState } from "react";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de subscrição com checkout simulado, trial e cancelamento de renovação.
 *
 * @returns {JSX.Element} Interface de gestão da subscrição do utilizador.
 */
export function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Carrega planos ativos e subscrição atual em paralelo.
   *
   * @returns {Promise<void>}
   */
  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionsApi.listPlans(),
        subscriptionsApi.getMine(),
      ]);
      setPlans(plansResponse.plans);
      setSubscription(subscriptionResponse.subscription);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Executa pagamento aprovado usando apenas dados de teste.
   *
   * @param {string} planCode Código do plano escolhido pelo utilizador.
   * @returns {Promise<void>}
   */
  async function handleSimulatedCheckout(planCode) {
    setStatus("");
    setError("");
    setSubmitting(true);
    try {
      const response = await paymentsApi.simulatedCheckout({
        planCode,
        paymentMethod: "card_test",
        // A versão final da demo usa o caminho positivo; o caminho negativo e testado separadamente.
        simulateOutcome: "approved",
      });
      setSubscription(response.subscription);
      setStatus("Pagamento simulado aprovado.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Inicia o trial e mostra a data de fim ao utilizador.
   *
   * @returns {Promise<void>}
   */
  async function handleStartTrial() {
    setStatus("");
    setError("");
    setSubmitting(true);
    try {
      const response = await paymentsApi.startTrial();
      setSubscription(response.subscription);
      setStatus(`Trial ativo até ${new Date(response.trial.endsAt).toLocaleDateString("pt-PT")}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Cancela apenas a renovação futura, preservando acesso até ao fim do ciclo.
   *
   * @returns {Promise<void>}
   */
  async function handleCancelRenewal() {
    setStatus("");
    setError("");
    setSubmitting(true);
    try {
      const response = await subscriptionsApi.cancelRenewal();
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <section className="page-section"><p>A carregar subscrição...</p></section>;

  return (
    <section className="page-section">
      <h1>Subscrição</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}

      <section>
        <h2>Estado atual</h2>
        <p>{subscription?.status === "none" ? "Sem subscrição ativa." : subscription?.status}</p>
        {subscription?.currentPeriodEnd && <p>Fim do ciclo: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}</p>}
        {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd && (
          <button type="button" disabled={submitting} onClick={handleCancelRenewal}>Cancelar renovação</button>
        )}
      </section>

      <section>
        <h2>Trial</h2>
        <p>Experimenta o FaithFlix durante 14 dias sem dados de cartão.</p>
        <button type="button" disabled={submitting} onClick={handleStartTrial}>Iniciar trial</button>
      </section>

      <section>
        <h2>Planos</h2>
        {plans.length === 0 && <p>Não existem planos ativos.</p>}
        {plans.map((plan) => (
          <article key={plan.code}>
            <h3>{plan.name}</h3>
            <p>{(plan.priceCents / 100).toFixed(2)} {plan.currency}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
            <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
              Pagar com método simulado
            </button>
          </article>
        ))}
      </section>
    </section>
  );
}
