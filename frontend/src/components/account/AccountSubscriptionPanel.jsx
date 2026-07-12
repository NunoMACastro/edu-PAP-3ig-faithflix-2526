/**
 * @file Resumo e ações seguras da subscrição na área pessoal.
 */

import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState.jsx";

const TIER_LABELS = {
    none: "Sem plano",
    pro: "FaithFlix Pro",
    family: "FaithFlix Família",
};

const STATUS_LABELS = {
    active: "Ativa",
    trialing: "Período experimental",
    cancelled: "Cancelada",
    expired: "Expirada",
    none: "Sem subscrição",
};

/**
 * Formata uma data ISO apenas quando a API devolve um instante válido.
 *
 * @param {unknown} value Data recebida da API.
 * @returns {string} Data longa em PT-PT ou texto vazio.
 */
function formatSubscriptionDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(date);
}

/**
 * Traduz a qualidade técnica para uma designação curta de produto.
 *
 * @param {unknown} value Qualidade máxima do entitlement.
 * @returns {string} Qualidade apresentada na conta.
 */
function formatQuality(value) {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized === "2160p") return "4K";
    if (normalized === "1080p") return "Full HD";
    if (normalized === "720p") return "HD";
    return value ? String(value) : "—";
}

/**
 * Apresenta plano atual, benefícios essenciais e ações de gestão já suportadas.
 * A mudança de plano reutiliza o checkout existente; o cancelamento afeta
 * apenas a renovação e preserva o acesso até ao fim do ciclo.
 *
 * @param {{ subscription: Record<string, unknown> | null, access: Record<string, unknown> | null, loading: boolean, error: string, status: string, busy: boolean, onRetry: () => void, onRequestCancellation: () => void }} props Estado e ações da subscrição.
 * @returns {JSX.Element} Painel de gestão da subscrição.
 */
export function AccountSubscriptionPanel({
    subscription,
    access,
    loading,
    error,
    status,
    busy,
    onRetry,
    onRequestCancellation,
}) {
    const effectiveAccess = access ?? subscription;
    const entitlements = effectiveAccess?.entitlements ?? {};
    const tier = entitlements.tier ?? effectiveAccess?.plan?.tier ?? "none";
    const planName = effectiveAccess?.plan?.name ?? TIER_LABELS[tier] ?? "Plano FaithFlix";
    const hasPremiumAccess = Boolean(effectiveAccess?.hasPremiumAccess);
    const ownsSubscription = effectiveAccess?.accessSource === "own";
    const periodEnd = formatSubscriptionDate(
        effectiveAccess?.currentPeriodEnd ?? subscription?.currentPeriodEnd,
    );
    const cancellationScheduled = Boolean(
        ownsSubscription && subscription?.cancelAtPeriodEnd && hasPremiumAccess,
    );
    const canCancel = Boolean(
        ownsSubscription &&
        subscription?.status === "active" &&
        subscription?.hasPremiumAccess &&
        !subscription?.cancelAtPeriodEnd,
    );
    const changePlanLabel = hasPremiumAccess
        ? ownsSubscription
            ? "Alterar plano"
            : "Escolher plano próprio"
        : "Escolher plano";

    return (
        <section className="account-subscription-card" aria-labelledby="account-subscription-title">
            <header className="account-card-heading">
                <div>
                    <p className="section-kicker">Subscrição</p>
                    <h2 id="account-subscription-title">O teu plano</h2>
                </div>
                {!loading && !error ? (
                    <span className={`status-badge status-${subscription?.status ?? "none"}`}>
                        {STATUS_LABELS[subscription?.status] ?? (hasPremiumAccess ? "Ativa" : "Sem subscrição")}
                    </span>
                ) : null}
            </header>

            {loading ? <p role="status">A carregar o teu plano...</p> : null}
            {error ? (
                <EmptyState title="Não foi possível carregar o plano" description={error} tone="error">
                    <button type="button" onClick={onRetry}>Tentar novamente</button>
                </EmptyState>
            ) : null}

            {!loading && !error ? (
                <>
                    <div className="account-plan-summary">
                        <div>
                            <span>{ownsSubscription ? "Plano contratado" : hasPremiumAccess ? "Acesso partilhado" : "Começa quando quiseres"}</span>
                            <h3>{hasPremiumAccess ? planName : "Ainda sem plano"}</h3>
                            <p>
                                {hasPremiumAccess
                                    ? ownsSubscription
                                        ? "Gere a renovação ou compara outros planos sem sair da tua conta."
                                        : "Tens acesso através de uma subscrição familiar."
                                    : "Escolhe a opção que melhor acompanha a forma como vês a FaithFlix."}
                            </p>
                        </div>
                        <dl className="account-plan-facts">
                            <div><dt>Qualidade</dt><dd>{formatQuality(entitlements.maxQuality)}</dd></div>
                            <div><dt>Partilha familiar</dt><dd>{entitlements.familySharing ? `Até ${entitlements.maxFamilyMembers ?? "—"}` : "Não incluída"}</dd></div>
                            {periodEnd ? (
                                <div>
                                    <dt>{cancellationScheduled ? "Acesso até" : "Próxima renovação"}</dt>
                                    <dd>{periodEnd}</dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>

                    {status ? <p className="status-message status-message-success" role="status">{status}</p> : null}
                    {cancellationScheduled ? (
                        <p className="account-renewal-note">
                            A renovação está cancelada. Manténs o acesso até {periodEnd || "ao fim do ciclo atual"}.
                        </p>
                    ) : null}

                    <div className="account-plan-actions">
                        <Link className="button-link" to="/planos#comparar-planos">{changePlanLabel}</Link>
                        {canCancel ? (
                            <button
                                type="button"
                                className="account-secondary-action"
                                disabled={busy}
                                onClick={onRequestCancellation}
                            >
                                Cancelar renovação
                            </button>
                        ) : null}
                    </div>
                </>
            ) : null}
        </section>
    );
}
