/**
 * @file Página de subscrição, trial e pagamento simulado.
 */

import { useEffect, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
});

/**
 * Formata uma data para padrão europeu.
 *
 * @param {string | Date} value Valor de data.
 * @returns {string} Data formatada em português de Portugal.
 */
function formatDate(value) {
    return new Date(value).toLocaleDateString("pt-PT");
}

/**
 * Formata preço em cêntimos.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor monetário em euros.
 */
function formatPrice(cents) {
    return moneyFormatter.format(cents / 100);
}

/**
 * Mostra planos, subscrição atual, trial e checkout simulado.
 *
 * @returns {JSX.Element} Página de subscrição.
 */
export function SubscriptionPage() {
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega planos públicos e subscrição autenticada.
     *
     * @returns {Promise<void>} Termina depois de atualizar a página.
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
     * Executa checkout aprovado com método de teste documentado.
     *
     * @param {string} planCode Código do plano escolhido.
     * @returns {Promise<void>} Termina quando o checkout simulado responder.
     */
    async function handleSimulatedCheckout(planCode) {
        setStatus("");
        setError("");
        setSubmitting(true);

        try {
            // O pagamento é simulado; não recolhe cartão nem chama gateway externo.
            const response = await paymentsApi.simulatedCheckout({
                planCode,
                paymentMethod: "card_test",
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
     * Inicia trial gratuito.
     *
     * @returns {Promise<void>} Termina quando o backend confirmar o trial.
     */
    async function handleStartTrial() {
        setStatus("");
        setError("");
        setSubmitting(true);

        try {
            const response = await paymentsApi.startTrial();
            setSubscription(response.subscription);
            setStatus(`Trial ativo até ${formatDate(response.trial.endsAt)}.`);
        } catch (apiError) {
            setError(toUserMessage(apiError));
        } finally {
            setSubmitting(false);
        }
    }

    /**
     * Cancela apenas a renovação futura da subscrição.
     *
     * @returns {Promise<void>} Termina quando a subscrição for atualizada.
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

    if (loading) {
        return (
            <section className="page-section">
                <p role="status">A carregar subscrição...</p>
            </section>
        );
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Planos</p>
            <h1>Subscrição</h1>
            {error ? <EmptyState title="Não foi possível atualizar a subscrição" description={error} tone="error" /> : null}
            {status ? <EmptyState title="Operação concluída" description={status} tone="success" /> : null}

            <section>
                <h2>Estado atual</h2>
                <p>{subscription?.status === "none" ? "Sem subscrição ativa." : subscription?.status}</p>
                {subscription?.currentPeriodEnd ? <p>Fim do ciclo: {formatDate(subscription.currentPeriodEnd)}</p> : null}
                {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd ? (
                    <button type="button" disabled={submitting} onClick={handleCancelRenewal}>
                        Cancelar renovação
                    </button>
                ) : null}
            </section>

            <section>
                <h2>Trial</h2>
                <p>Experimenta o FaithFlix durante 14 dias sem dados de cartão.</p>
                <button type="button" disabled={submitting} onClick={handleStartTrial}>
                    Iniciar trial
                </button>
            </section>

            <section>
                <h2>Planos</h2>
                {plans.length === 0 ? (
                    <EmptyState title="Sem planos ativos" description="Volta a esta página depois de a equipa publicar novos planos." />
                ) : null}
                <div className="content-grid">
                    {plans.map((plan) => (
                        <article className="content-card" key={plan.code}>
                            <span className="content-card-eyebrow">{plan.interval}</span>
                            <h3>{plan.name}</h3>
                            <p className="content-card-meta">{formatPrice(plan.priceCents)}</p>
                            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
                            <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
                                Pagar com método simulado
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}
