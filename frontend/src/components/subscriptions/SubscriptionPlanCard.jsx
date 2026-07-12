/**
 * @file Card comercial exclusivo para um plano de subscrição FaithFlix.
 */

import { Link } from "react-router-dom";

const intervalLabels = {
    monthly: "Mensal",
    yearly: "Anual",
};

/**
 * Formata cêntimos na moeda pública do plano.
 *
 * @param {number} cents Valor em cêntimos.
 * @param {string} currency Código ISO da moeda.
 * @returns {string} Preço localizado em português de Portugal.
 */
export function formatPlanPrice(cents, currency = "EUR") {
    return new Intl.NumberFormat("pt-PT", {
        currency: currency || "EUR",
        style: "currency",
    }).format(Number(cents ?? 0) / 100);
}

/**
 * Remove apenas o sufixo comercial correspondente ao ciclo de faturação.
 *
 * @param {string} name Nome público do plano.
 * @returns {string} Nome sem duplicar Mensal/Anual no card.
 */
export function compactPlanName(name) {
    return String(name ?? "Plano FaithFlix")
        .replace(/\s+(Mensal|Anual)$/iu, "")
        .trim();
}

/**
 * Converte a qualidade técnica numa designação editorial curta.
 *
 * @param {string} quality Qualidade devolvida pela API.
 * @returns {string} Qualidade legível.
 */
function qualityLabel(quality) {
    if (["2160p", "4k"].includes(String(quality).toLowerCase())) {
        return "2160p";
    }
    if (quality === "1080p") return "Full HD";
    return quality || "Automática";
}

/**
 * Apresenta um plano e a ação segura adequada ao estado da sessão.
 *
 * @param {object} props Propriedades do card.
 * @param {object} props.plan Plano do período selecionado.
 * @param {object|null} props.monthlyPlan Plano mensal do mesmo tier.
 * @param {string} props.sessionStatus Estado autoritativo da sessão.
 * @param {string} props.loginPath Destino de login com retorno.
 * @param {boolean} props.isCurrentPlan Indica subscrição própria atual.
 * @param {boolean} props.selectionBlocked Impede uma segunda subscrição paga ativa.
 * @param {boolean} props.submitting Bloqueia ações concorrentes.
 * @param {(plan: object, trigger: HTMLElement) => void} props.onChoose Abre a confirmação.
 * @returns {JSX.Element} Card comercial acessível.
 */
export function SubscriptionPlanCard({
    plan,
    monthlyPlan,
    sessionStatus,
    loginPath,
    isCurrentPlan,
    selectionBlocked,
    submitting,
    onChoose,
}) {
    const isYearly = plan.interval === "yearly";
    const yearlyBaseline = isYearly && monthlyPlan
        ? Number(monthlyPlan.priceCents) * 12
        : 0;
    const yearlySaving = Math.max(0, yearlyBaseline - Number(plan.priceCents));
    const equivalentMonthly = isYearly ? Number(plan.priceCents) / 12 : 0;
    const tierClass = plan.tier === "family" ? "is-family" : "is-pro";

    return (
        <article
            className={`subscription-plan-card ${tierClass}`}
            aria-labelledby={`subscription-plan-${plan.code}`}
        >
            <div className="subscription-plan-heading">
                <p className="subscription-plan-tier">
                    {plan.familySharing ? "Para a família" : "Para ti"}
                </p>
                <h3 id={`subscription-plan-${plan.code}`}>
                    {compactPlanName(plan.name)}
                </h3>
                <p className="subscription-plan-audience">
                    {plan.familySharing
                        ? `Partilha com até ${plan.maxFamilyMembers} utilizadores.`
                        : "Acesso premium individual."}
                </p>
            </div>

            <div className="subscription-plan-price-block">
                <p className="subscription-plan-price">
                    <strong>{formatPlanPrice(plan.priceCents, plan.currency)}</strong>
                    <span>/{isYearly ? "ano" : "mês"}</span>
                </p>
                {isYearly ? (
                    <p className="subscription-plan-equivalent">
                        Equivale a {formatPlanPrice(equivalentMonthly, plan.currency)}/mês
                    </p>
                ) : null}
                {yearlySaving > 0 ? (
                    <p className="subscription-plan-saving">
                        Poupa {formatPlanPrice(yearlySaving, plan.currency)} por ano
                    </p>
                ) : null}
            </div>

            <dl className="subscription-plan-facts">
                <div>
                    <dt>Qualidade</dt>
                    <dd>{qualityLabel(plan.maxQuality)}</dd>
                </div>
                <div>
                    <dt>Utilizadores</dt>
                    <dd>{plan.familySharing ? plan.maxFamilyMembers : 1}</dd>
                </div>
                <div>
                    <dt>Impacto</dt>
                    <dd>{plan.solidaritySharePercent}%</dd>
                </div>
            </dl>

            {plan.features?.length ? (
                <ul className="subscription-plan-features">
                    {plan.features.map((feature) => (
                        <li key={feature}>
                            <span aria-hidden="true">✓</span> {feature}
                        </li>
                    ))}
                </ul>
            ) : null}

            <div className="subscription-plan-action">
                {sessionStatus === "authenticated" && isCurrentPlan ? (
                    <button type="button" disabled aria-current="true">
                        Plano atual
                    </button>
                ) : null}
                {sessionStatus === "authenticated" && !isCurrentPlan && selectionBlocked ? (
                    <button type="button" disabled>
                        Disponível no fim do ciclo atual
                    </button>
                ) : null}
                {sessionStatus === "authenticated" && !isCurrentPlan && !selectionBlocked ? (
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={(event) => onChoose(plan, event.currentTarget)}
                    >
                        Escolher {plan.tier === "family" ? "Família" : "Pro"}
                    </button>
                ) : null}
                {sessionStatus === "anonymous" ? (
                    <Link className="button-link" to={loginPath}>
                        Entrar para escolher
                    </Link>
                ) : null}
                {sessionStatus === "loading" ? (
                    <button type="button" disabled>A confirmar sessão...</button>
                ) : null}
                {sessionStatus === "unavailable" ? (
                    <button type="button" disabled>Sessão indisponível</button>
                ) : null}
            </div>
            <span className="subscription-plan-period">
                {intervalLabels[plan.interval] ?? plan.interval}
            </span>
        </article>
    );
}
