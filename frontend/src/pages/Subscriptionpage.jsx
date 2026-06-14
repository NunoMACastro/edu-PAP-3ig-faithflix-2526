/**
 * Módulo da página de gestão de subscrição do FaithFlix.
 *
 * Integra o cliente de API de subscrições com estado local, carregamento, erro
 * e ações do utilizador autenticado. O ficheiro não envia `userId`, porque o
 * backend aplica ownership através da sessão HttpOnly.
 */
import { useEffect, useState } from "react";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de gestão de subscrição do utilizador autenticado.
 *
 * Mostra planos, estado atual, mensagens de erro e acao de cancelamento.
 * O componente nunca envia `userId`; o backend associa tudo pela sessão.
 *
 * @returns {JSX.Element} Interface de subscrição.
 */
export function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      // Carregamos planos e subscrição em paralelo porque sao leituras independentes.
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

  async function handleActivate(planCode) {
    setStatus("");
    setError("");
    try {
      // Apenas o plano sai da UI; o ownership fica protegido no backend.
      const response = await subscriptionsApi.activate(planCode);
      setSubscription(response.subscription);
      setStatus("Subscrição ativa.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  async function handleCancelRenewal() {
    setStatus("");
    setError("");
    try {
      // Cancelar renovação não apaga o ciclo atual, apenas muda a regra futura.
      const response = await subscriptionsApi.cancelRenewal();
      setSubscription(response.subscription);
      setStatus("Renovação cancelada no fim do ciclo atual.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  if (loading) return <main><p>A carregar subscrição...</p></main>;

  return (
    <main>
      <h1>Subscrição</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <section>
        <h2>Estado atual</h2>
        <p>{subscription?.status === "none" ? "Sem subscrição ativa." : subscription?.status}</p>
        {subscription?.currentPeriodEnd && <p>Fim do ciclo: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}</p>}
        {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd && (
          <button type="button" onClick={handleCancelRenewal}>Cancelar renovação</button>
        )}
      </section>
      <section>
        <h2>Planos</h2>
        {plans.map((plan) => (
          <article key={plan.code}>
            <h3>{plan.name}</h3>
            <p>{(plan.priceCents / 100).toFixed(2)} {plan.currency}</p>
            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
            <button type="button" onClick={() => handleActivate(plan.code)}>Escolher plano</button>
          </article>
        ))}
      </section>
    </main>
  );
}