/**
 * @file Página de subscrição, trial, pagamento simulado e família.
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

const intervalLabels = {
    monthly: "Mensal",
    yearly: "Anual",
};

const tierLabels = {
    pro: "Pro",
    family: "Família",
    trial: "Trial",
    none: "Sem plano",
};

const accessSourceLabels = {
    own: "Subscrição própria",
    family: "Partilha familiar",
    none: "Sem acesso premium",
};

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
 * Formata a qualidade máxima para UI.
 *
 * @param {string} quality Qualidade técnica.
 * @returns {string} Qualidade legível.
 */
function formatQuality(quality) {
    if (quality === "2160p") return "4K";
    return quality || "Automática";
}

/**
 * Mostra o nome seguro de um utilizador familiar.
 *
 * @param {object|null} user Utilizador reduzido.
 * @returns {string} Nome ou email.
 */
function familyUserLabel(user) {
    return user?.name || user?.email || "Utilizador";
}

/**
 * Mostra planos, subscrição atual, trial e gestão familiar.
 *
 * @returns {JSX.Element} Página de subscrição.
 */
export function SubscriptionPage() {
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [family, setFamily] = useState(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega planos públicos, subscrição autenticada e estado familiar.
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
            setFamily(subscriptionResponse.family);
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
     * Executa uma operação e recarrega o estado canónico do backend.
     *
     * @param {() => Promise<object>} operation Operação assíncrona.
     * @param {string} successMessage Mensagem de sucesso.
     * @returns {Promise<boolean>} `true` quando a operação foi concluída.
     */
    async function runOperation(operation, successMessage) {
        setStatus("");
        setError("");
        setSubmitting(true);

        try {
            await operation();
            setStatus(successMessage);
            await loadData();
            return true;
        } catch (apiError) {
            setError(toUserMessage(apiError));
            return false;
        } finally {
            setSubmitting(false);
        }
    }

    /**
     * Executa checkout aprovado com método de teste documentado.
     *
     * @param {string} planCode Código do plano escolhido.
     * @returns {Promise<void>} Termina quando o checkout simulado responder.
     */
    async function handleSimulatedCheckout(planCode) {
        await runOperation(
            () =>
                paymentsApi.simulatedCheckout({
                    planCode,
                    paymentMethod: "card_test",
                    simulateOutcome: "approved",
                }),
            "Pagamento simulado aprovado.",
        );
    }

    /**
     * Inicia trial gratuito.
     *
     * @returns {Promise<void>} Termina quando o backend confirmar o trial.
     */
    async function handleStartTrial() {
        await runOperation(
            () => paymentsApi.startTrial(),
            "Trial iniciado.",
        );
    }

    /**
     * Cancela apenas a renovação futura da subscrição.
     *
     * @returns {Promise<void>} Termina quando a subscrição for atualizada.
     */
    async function handleCancelRenewal() {
        await runOperation(
            () => subscriptionsApi.cancelRenewal(),
            "Renovação cancelada no fim do ciclo atual.",
        );
    }

    /**
     * Envia convite familiar a uma conta existente.
     *
     * @param {SubmitEvent} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o convite for criado.
     */
    async function handleInvite(event) {
        event.preventDefault();

        const created = await runOperation(
            () => subscriptionsApi.inviteFamilyMember({ email: inviteEmail }),
            "Convite familiar criado.",
        );

        if (created) {
            setInviteEmail("");
        }
    }

    if (loading) {
        return (
            <section className="page-section">
                <p role="status">A carregar subscrição...</p>
            </section>
        );
    }

    const entitlements = subscription?.entitlements ?? {};
    const ownedFamily = family?.ownedFamily;
    const pendingInvitations = family?.pendingInvitations ?? [];
    const activeMembership = family?.activeMembership;

    return (
        <section className="page-section">
            <p className="section-kicker">Planos</p>
            <h1>Subscrição</h1>
            {error ? <EmptyState title="Não foi possível atualizar a subscrição" description={error} tone="error" /> : null}
            {status ? <EmptyState title="Operação concluída" description={status} tone="success" /> : null}

            <section>
                <h2>Estado atual</h2>
                <p>{accessSourceLabels[subscription?.accessSource] ?? subscription?.status ?? "Sem subscrição ativa."}</p>
                <p>Plano: {tierLabels[entitlements.tier] ?? entitlements.tier ?? "Sem plano"}</p>
                <p>Qualidade máxima: {formatQuality(entitlements.maxQuality)}</p>
                {subscription?.currentPeriodEnd ? <p>Fim do ciclo: {formatDate(subscription.currentPeriodEnd)}</p> : null}
                {activeMembership?.owner ? <p>Owner familiar: {familyUserLabel(activeMembership.owner)}</p> : null}
                {subscription?.hasPremiumAccess && subscription?.accessSource === "own" && !subscription.cancelAtPeriodEnd ? (
                    <button type="button" disabled={submitting} onClick={handleCancelRenewal}>
                        Cancelar renovação
                    </button>
                ) : null}
            </section>

            <section>
                <h2>Trial</h2>
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
                            <span className="content-card-eyebrow">{intervalLabels[plan.interval] ?? plan.interval}</span>
                            <h3>{plan.name}</h3>
                            <p className="content-card-meta">{formatPrice(plan.priceCents)}</p>
                            <p>Qualidade até {formatQuality(plan.maxQuality)}.</p>
                            <p>{plan.familySharing ? `${plan.maxFamilyMembers} utilizadores incluídos.` : "Acesso individual."}</p>
                            <p>{plan.solidaritySharePercent}% para a pool solidária.</p>
                            {plan.features?.length ? (
                                <ul>
                                    {plan.features.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                            ) : null}
                            <button type="button" disabled={submitting} onClick={() => handleSimulatedCheckout(plan.code)}>
                                Pagar com método simulado
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            <section>
                <h2>Família</h2>
                {ownedFamily ? (
                    <>
                        <p>{ownedFamily.seatsUsed}/{ownedFamily.maxFamilyMembers} lugares usados.</p>
                        <form onSubmit={handleInvite}>
                            <label>
                                Email da conta
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(event) => setInviteEmail(event.target.value)}
                                    required
                                    placeholder="nome@example.com"
                                />
                            </label>
                            <button type="submit" disabled={submitting || ownedFamily.seatsAvailable <= 0}>
                                Convidar
                            </button>
                        </form>
                        {ownedFamily.members.length ? (
                            <div className="content-grid">
                                {ownedFamily.members.map((member) => (
                                    <article className="content-card" key={member.id}>
                                        <span className="content-card-eyebrow">{member.status}</span>
                                        <h3>{familyUserLabel(member.member)}</h3>
                                        <p>{member.invitedEmail}</p>
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={() => runOperation(
                                                () => subscriptionsApi.removeFamilyMember(member.memberUserId),
                                                "Membro familiar removido.",
                                            )}
                                        >
                                            Remover
                                        </button>
                                    </article>
                                ))}
                            </div>
                        ) : null}
                    </>
                ) : (
                    <EmptyState title="Sem plano Família ativo" description="A gestão familiar fica disponível quando o plano Família estiver ativo." />
                )}

                {pendingInvitations.length ? (
                    <div className="content-grid">
                        {pendingInvitations.map((invitation) => (
                            <article className="content-card" key={invitation.id}>
                                <span className="content-card-eyebrow">Convite pendente</span>
                                <h3>{familyUserLabel(invitation.owner)}</h3>
                                <p>{invitation.owner?.email}</p>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => runOperation(
                                        () => subscriptionsApi.acceptFamilyInvitation(invitation.id),
                                        "Convite familiar aceite.",
                                    )}
                                >
                                    Aceitar
                                </button>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => runOperation(
                                        () => subscriptionsApi.declineFamilyInvitation(invitation.id),
                                        "Convite familiar recusado.",
                                    )}
                                >
                                    Recusar
                                </button>
                            </article>
                        ))}
                    </div>
                ) : null}

                {activeMembership ? (
                    <article className="content-card">
                        <span className="content-card-eyebrow">Membro ativo</span>
                        <h3>{familyUserLabel(activeMembership.owner)}</h3>
                        <p>{activeMembership.owner?.email}</p>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => runOperation(
                                () => subscriptionsApi.leaveFamily(),
                                "Saíste da partilha familiar.",
                            )}
                        >
                            Sair da família
                        </button>
                    </article>
                ) : null}
            </section>
        </section>
    );
}
