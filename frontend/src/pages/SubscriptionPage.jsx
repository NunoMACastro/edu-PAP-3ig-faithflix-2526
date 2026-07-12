/**
 * @file Página pública de planos e gestão privada de subscrição FaithFlix.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FamilyManagementPanel, familyUserLabel } from "../components/subscriptions/FamilyManagementPanel.jsx";
import { SubscriptionCheckoutDialog } from "../components/subscriptions/SubscriptionCheckoutDialog.jsx";
import { SubscriptionPlanCard } from "../components/subscriptions/SubscriptionPlanCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { paymentsApi } from "../services/api/paymentsApi.js";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { buildLoginRedirectPath } from "../utils/authRedirect.js";

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
 * Formata uma data para padrão europeu sem expor datas inválidas.
 *
 * @param {string|Date} value Valor de data.
 * @returns {string} Data localizada ou string vazia.
 */
function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-PT");
}

/**
 * Formata a qualidade máxima para UI.
 *
 * @param {string} quality Qualidade técnica.
 * @returns {string} Qualidade legível.
 */
function formatQuality(quality) {
    if (["2160p", "4k"].includes(String(quality).toLowerCase())) {
        return "2160p";
    }
    if (quality === "1080p") return "Full HD";
    return quality || "Automática";
}

/**
 * Ordena ciclos conhecidos sem inventar uma ordem para valores futuros.
 *
 * @param {string[]} intervals Ciclos encontrados nos planos.
 * @returns {string[]} Ciclos únicos e ordenados.
 */
function orderedIntervals(intervals) {
    const unique = [...new Set(intervals.filter(Boolean))];
    return ["monthly", "yearly", ...unique.filter((item) => !["monthly", "yearly"].includes(item))]
        .filter((item) => unique.includes(item));
}

/**
 * Página comercial dos planos e gestão autenticada da subscrição.
 *
 * @returns {JSX.Element} Página responsiva de planos FaithFlix.
 */
export function SubscriptionPage() {
    const {
        status: sessionStatus,
        error: sessionError,
        refreshSession,
    } = useSession();
    const location = useLocation();
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState("");
    const [plansReloadVersion, setPlansReloadVersion] = useState(0);
    const [subscription, setSubscription] = useState(null);
    const [access, setAccess] = useState(null);
    const [trialEligibility, setTrialEligibility] = useState(null);
    const [family, setFamily] = useState(null);
    const [privateLoading, setPrivateLoading] = useState(false);
    const [privateError, setPrivateError] = useState("");
    const [privateReloadVersion, setPrivateReloadVersion] = useState(0);
    const [selectedInterval, setSelectedInterval] = useState("monthly");
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState("");
    const [status, setStatus] = useState("");
    const mountedRef = useRef(true);
    const submittingRef = useRef(false);
    const checkoutDialogRef = useRef(null);
    const checkoutTriggerRef = useRef(null);
    const mutationControllersRef = useRef(new Set());
    const idempotencyKeysRef = useRef(new Map());

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setPlansLoading(true);
        setPlansError("");
        setPlans([]);

        subscriptionsApi.listPlans({ signal: controller.signal })
            .then((response) => {
                if (active) setPlans(Array.isArray(response?.plans) ? response.plans : []);
            })
            .catch((apiError) => {
                if (active && apiError?.code !== "REQUEST_ABORTED") {
                    setPlansError(toUserMessage(apiError));
                }
            })
            .finally(() => {
                if (active) setPlansLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [plansReloadVersion]);

    useEffect(() => {
        if (sessionStatus !== "authenticated") {
            setSubscription(null);
            setAccess(null);
            setTrialEligibility(null);
            setFamily(null);
            setPrivateError("");
            setPrivateLoading(false);
            setInviteEmail("");
            return undefined;
        }

        const controller = new AbortController();
        let active = true;
        setPrivateLoading(true);
        setPrivateError("");

        subscriptionsApi.getMine({ signal: controller.signal })
            .then((response) => {
                if (!active) return;
                const ownSubscription = response?.subscription ?? null;
                setSubscription(ownSubscription);
                setAccess(response?.access ?? ownSubscription);
                setTrialEligibility(
                    response?.trialEligibility ??
                    (ownSubscription?.hasPremiumAccess
                        ? "premium_active"
                        : "available"),
                );
                setFamily(response?.family ?? null);
            })
            .catch((apiError) => {
                if (active && apiError?.code !== "REQUEST_ABORTED") {
                    setPrivateError(toUserMessage(apiError));
                }
            })
            .finally(() => {
                if (active) setPrivateLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [privateReloadVersion, sessionStatus]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            for (const controller of mutationControllersRef.current) controller.abort();
            mutationControllersRef.current.clear();
        };
    }, []);

    const intervals = useMemo(
        () => orderedIntervals(plans.map((plan) => plan.interval)),
        [plans],
    );

    useEffect(() => {
        if (!intervals.length) return;
        if (!intervals.includes(selectedInterval)) {
            setSelectedInterval(intervals.includes("monthly") ? "monthly" : intervals[0]);
        }
    }, [intervals, selectedInterval]);

    const plansByTier = useMemo(() => {
        const result = new Map();
        for (const plan of plans) {
            if (!["pro", "family"].includes(plan.tier)) continue;
            if (!result.has(plan.tier)) result.set(plan.tier, new Map());
            result.get(plan.tier).set(plan.interval, plan);
        }
        return result;
    }, [plans]);

    const visiblePlans = ["pro", "family"]
        .map((tier) => plansByTier.get(tier)?.get(selectedInterval))
        .filter(Boolean);
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const loginPath = buildLoginRedirectPath(returnTo);
    const entitlements = access?.entitlements ?? {};
    const ownedFamily = family?.ownedFamily ?? null;
    const pendingInvitations = family?.pendingInvitations ?? [];
    const activeMembership = family?.activeMembership ?? null;
    const hasFamilyContext = Boolean(
        ownedFamily || pendingInvitations.length || activeMembership,
    );
    const currentPlanCode = subscription?.hasPremiumAccess
        ? subscription?.plan?.code ?? subscription?.planCode
        : null;
    const hasActiveOwnPaidSubscription = Boolean(
        subscription?.hasPremiumAccess &&
        subscription?.status === "active" &&
        subscription?.planCode !== "trial",
    );
    const commonSolidarityShare = plans.length && plans.every(
        (plan) => plan.solidaritySharePercent === plans[0].solidaritySharePercent,
    ) ? plans[0].solidaritySharePercent : null;
    const highestQualityPlan = plans.reduce(
        (highest, plan) => Number(plan.qualityRank ?? 0) > Number(highest?.qualityRank ?? 0)
            ? plan
            : highest,
        null,
    );
    const maxFamilyMembers = plans.reduce(
        (maximum, plan) => Math.max(maximum, Number(plan.maxFamilyMembers ?? 0)),
        0,
    );

    /**
     * Mantém uma chave por intenção até existir resposta conclusiva.
     *
     * @param {string} operationKey Intenção funcional estável.
     * @returns {string} UUID idempotente.
     */
    function getIdempotencyKey(operationKey) {
        const existing = idempotencyKeysRef.current.get(operationKey);
        if (existing) return existing;
        const key = globalThis.crypto.randomUUID();
        idempotencyKeysRef.current.set(operationKey, key);
        return key;
    }

    /**
     * Executa uma mutação autenticada e recarrega o estado privado.
     */
    async function runOperation(operation, successMessage, options = {}) {
        setStatus("");
        setActionError("");

        if (sessionStatus !== "authenticated") {
            setActionError("Inicia sessão para gerir a subscrição.");
            return false;
        }
        if (options.confirmation && !globalThis.confirm(options.confirmation)) return false;
        if (submittingRef.current) return false;

        submittingRef.current = true;
        setSubmitting(true);
        const controller = new AbortController();
        mutationControllersRef.current.add(controller);

        try {
            await operation(controller.signal);
            if (!mountedRef.current) return false;
            setStatus(successMessage);
            setPrivateReloadVersion((value) => value + 1);
            return true;
        } catch (apiError) {
            if (mountedRef.current && apiError?.code !== "REQUEST_ABORTED") {
                setActionError(toUserMessage(apiError));
            }
            return false;
        } finally {
            mutationControllersRef.current.delete(controller);
            submittingRef.current = false;
            if (mountedRef.current) setSubmitting(false);
        }
    }

    /** Abre a confirmação de checkout e preserva o elemento de origem. */
    function openCheckoutDialog(plan, trigger) {
        setSelectedPlan(plan);
        setActionError("");
        checkoutTriggerRef.current = trigger;
        globalThis.requestAnimationFrame(() => {
            const dialog = checkoutDialogRef.current;
            if (!dialog) return;
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
            dialog.querySelector("[data-checkout-confirm]")?.focus();
        });
    }

    /** Repõe o foco na ação que abriu o diálogo. */
    function handleCheckoutDialogClose() {
        setSelectedPlan(null);
        checkoutTriggerRef.current?.focus();
    }

    /** Fecha o diálogo também em ambientes sem a API nativa completa. */
    function closeCheckoutDialog() {
        const dialog = checkoutDialogRef.current;
        if (!dialog) return;
        if (typeof dialog.close === "function") dialog.close();
        else {
            dialog.removeAttribute("open");
            handleCheckoutDialogClose();
        }
    }

    /** Confirma o plano selecionado através do checkout existente. */
    async function handleSimulatedCheckout() {
        if (!selectedPlan) return;
        const operationKey = `checkout:${selectedPlan.code}`;
        const completed = await runOperation(
            (signal) => paymentsApi.simulatedCheckout({
                planCode: selectedPlan.code,
                paymentMethod: "card_test",
                simulateOutcome: "approved",
            }, {
                idempotencyKey: getIdempotencyKey(operationKey),
                signal,
            }),
            "Subscrição ativada.",
        );

        if (completed) {
            idempotencyKeysRef.current.delete(operationKey);
            closeCheckoutDialog();
        }
    }

    /** Inicia o trial único preservando idempotência em retries ambíguos. */
    async function handleStartTrial() {
        const operationKey = "trial";
        const completed = await runOperation(
            (signal) => paymentsApi.startTrial({
                idempotencyKey: getIdempotencyKey(operationKey),
                signal,
            }),
            "Trial iniciado.",
        );
        if (completed) idempotencyKeysRef.current.delete(operationKey);
    }

    /** Cancela apenas a renovação futura após confirmação explícita. */
    async function handleCancelRenewal() {
        await runOperation(
            (signal) => subscriptionsApi.cancelRenewal({ signal }),
            "Renovação cancelada no fim do ciclo atual.",
            { confirmation: "Confirmas o cancelamento da renovação no fim do ciclo atual?" },
        );
    }

    /** Envia um convite familiar e limpa o email depois de sucesso. */
    async function handleInvite(event) {
        event.preventDefault();
        const created = await runOperation(
            (signal) => subscriptionsApi.inviteFamilyMember(
                { email: inviteEmail },
                { signal },
            ),
            "Convite familiar criado.",
        );
        if (created) setInviteEmail("");
    }

    return (
        <div className="subscription-page" data-testid="subscription-page">
            <section className="subscription-hero" aria-labelledby="subscription-title">
                <div className="subscription-hero-inner">
                    <div className="subscription-hero-copy">
                        <p className="section-kicker">Planos FaithFlix</p>
                        <h1 id="subscription-title">Escolhe como queres viver a FaithFlix.</h1>
                        <p>
                            Conteúdos para ti e para a família, com uma parte de
                            cada pagamento destinada à pool solidária.
                        </p>
                        <div className="subscription-hero-actions">
                            <a className="button-link" href="#comparar-planos">Ver planos</a>
                            {sessionStatus === "anonymous" ? (
                                <Link className="subscription-hero-login" to={loginPath}>Já tenho conta</Link>
                            ) : null}
                        </div>
                    </div>
                    {plans.length ? (
                        <dl className="subscription-hero-facts" aria-label="Benefícios máximos disponíveis">
                            {highestQualityPlan ? (
                                <div><dt>Qualidade</dt><dd>Até {formatQuality(highestQualityPlan.maxQuality)}</dd></div>
                            ) : null}
                            {maxFamilyMembers > 1 ? (
                                <div><dt>Família</dt><dd>Até {maxFamilyMembers} utilizadores</dd></div>
                            ) : null}
                            {commonSolidarityShare !== null ? (
                                <div><dt>Impacto</dt><dd>{commonSolidarityShare}% para a pool</dd></div>
                            ) : null}
                        </dl>
                    ) : null}
                </div>
            </section>

            <div className="subscription-content">
                {status ? <p className="status-message status-message-success" role="status">{status}</p> : null}
                {actionError && !selectedPlan ? (
                    <p className="status-message status-message-error" role="alert">{actionError}</p>
                ) : null}

                <section className="subscription-plans-section" id="comparar-planos" aria-labelledby="subscription-plans-title">
                    <div className="subscription-section-heading">
                        <div>
                            <p className="section-kicker">Comparar</p>
                            <h2 id="subscription-plans-title">Encontra o plano certo</h2>
                        </div>
                        {intervals.length > 1 ? (
                            <div className="subscription-interval-switch" role="group" aria-label="Período de faturação">
                                {intervals.map((interval) => (
                                    <button
                                        type="button"
                                        key={interval}
                                        aria-pressed={selectedInterval === interval}
                                        onClick={() => setSelectedInterval(interval)}
                                    >
                                        {intervalLabels[interval] ?? interval}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {plansLoading ? <p role="status">A carregar planos...</p> : null}
                    {plansError ? (
                        <EmptyState title="Não foi possível carregar os planos" description={plansError} tone="error">
                            <button type="button" onClick={() => setPlansReloadVersion((value) => value + 1)}>
                                Tentar novamente
                            </button>
                        </EmptyState>
                    ) : null}
                    {!plansLoading && !plansError && plans.length === 0 ? (
                        <EmptyState title="Sem planos ativos" description="Volta a esta página depois de a equipa publicar novos planos." />
                    ) : null}
                    {visiblePlans.length ? (
                        <div className="subscription-plan-grid">
                            {visiblePlans.map((plan) => (
                                <SubscriptionPlanCard
                                    key={plan.code}
                                    plan={plan}
                                    monthlyPlan={plansByTier.get(plan.tier)?.get("monthly") ?? null}
                                    sessionStatus={sessionStatus}
                                    loginPath={loginPath}
                                    isCurrentPlan={currentPlanCode === plan.code}
                                    selectionBlocked={hasActiveOwnPaidSubscription && currentPlanCode !== plan.code}
                                    submitting={submitting}
                                    onChoose={openCheckoutDialog}
                                />
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="subscription-trial-strip" aria-labelledby="subscription-trial-title">
                    <div>
                        <p className="section-kicker">Experimentar</p>
                        <h2 id="subscription-trial-title">Descobre a FaithFlix antes de escolher.</h2>
                        <p>A elegibilidade do trial é confirmada com segurança pela tua conta.</p>
                    </div>
                    {sessionStatus === "authenticated" && !privateLoading && !privateError && trialEligibility === "available" ? (
                        <button type="button" disabled={submitting} onClick={handleStartTrial}>Iniciar trial</button>
                    ) : null}
                    {sessionStatus === "authenticated" && !privateLoading && !privateError && trialEligibility === "already_used" ? (
                        <p>O trial desta conta já foi utilizado.</p>
                    ) : null}
                    {sessionStatus === "anonymous" ? (
                        <Link className="button-link" to={loginPath}>Entrar para iniciar trial</Link>
                    ) : null}
                    {sessionStatus === "loading" || privateLoading ? (
                        <button type="button" disabled>A confirmar sessão...</button>
                    ) : null}
                    {sessionStatus === "unavailable" ? (
                        <button type="button" disabled>Sessão temporariamente indisponível</button>
                    ) : null}
                </section>

                <section className="subscription-impact-strip" aria-labelledby="subscription-impact-title">
                    <div>
                        <p className="section-kicker">Impacto</p>
                        <h2 id="subscription-impact-title">A tua subscrição também apoia.</h2>
                        <p>
                            {commonSolidarityShare !== null
                                ? `${commonSolidarityShare}% de cada pagamento aprovado segue para a pool solidária.`
                                : "Cada plano apresenta a percentagem destinada à pool solidária."}
                        </p>
                    </div>
                    <Link to="/associacoes">Conhecer associações <span aria-hidden="true">→</span></Link>
                </section>

                {sessionStatus === "unavailable" ? (
                    <EmptyState
                        title="Não foi possível confirmar a sessão"
                        description={sessionError || "Confirma a ligação e tenta novamente antes de gerir a subscrição."}
                        tone="error"
                    >
                        <button type="button" onClick={() => refreshSession?.().catch(() => {})}>
                            Tentar confirmar sessão
                        </button>
                    </EmptyState>
                ) : null}

                {sessionStatus === "authenticated" ? (
                    <section className="subscription-account-section" aria-labelledby="subscription-account-title">
                        <div className="subscription-section-heading">
                            <div>
                                <p className="section-kicker">A tua conta</p>
                                <h2 id="subscription-account-title">A tua subscrição</h2>
                            </div>
                        </div>
                        {privateLoading ? <p role="status">A carregar a tua subscrição...</p> : null}
                        {privateError ? (
                            <EmptyState title="Não foi possível carregar a tua subscrição" description={privateError} tone="error">
                                <button type="button" onClick={() => setPrivateReloadVersion((value) => value + 1)}>
                                    Tentar novamente
                                </button>
                            </EmptyState>
                        ) : null}
                        {!privateLoading && !privateError && subscription && access ? (
                            <div className="subscription-account-card">
                                <div className="subscription-account-summary">
                                    <span>{accessSourceLabels[access?.accessSource] ?? "Sem acesso premium"}</span>
                                    <h3>{tierLabels[entitlements.tier] ?? entitlements.tier ?? "Sem plano"}</h3>
                                    {!access?.hasPremiumAccess ? <p>Ainda não tens acesso premium ativo.</p> : null}
                                </div>
                                <dl className="subscription-account-facts">
                                    <div><dt>Plano</dt><dd>{tierLabels[entitlements.tier] ?? entitlements.tier ?? "Sem plano"}</dd></div>
                                    <div><dt>Qualidade máxima</dt><dd>{formatQuality(entitlements.maxQuality)}</dd></div>
                                    {access?.currentPeriodEnd && formatDate(access.currentPeriodEnd) ? (
                                        <div><dt>Fim do ciclo</dt><dd>{formatDate(access.currentPeriodEnd)}</dd></div>
                                    ) : null}
                                    {activeMembership?.owner ? (
                                        <div><dt>Owner familiar</dt><dd>{familyUserLabel(activeMembership.owner)}</dd></div>
                                    ) : null}
                                </dl>
                                {access?.accessSource === "own" && subscription?.cancelAtPeriodEnd && subscription?.hasPremiumAccess ? (
                                    <p className="subscription-renewal-note">
                                        A renovação está cancelada. O acesso mantém-se até ao fim do ciclo atual.
                                    </p>
                                ) : null}
                                {subscription?.hasPremiumAccess && !subscription.cancelAtPeriodEnd ? (
                                    <button type="button" className="button-secondary" disabled={submitting} onClick={handleCancelRenewal}>
                                        Cancelar renovação
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </section>
                ) : null}

                {sessionStatus === "authenticated" && !privateLoading && !privateError && hasFamilyContext ? (
                    <FamilyManagementPanel
                        ownedFamily={ownedFamily}
                        pendingInvitations={pendingInvitations}
                        activeMembership={activeMembership}
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                        submitting={submitting}
                        onInvite={handleInvite}
                        onRemove={(member) => runOperation(
                            (signal) => subscriptionsApi.removeFamilyMember(member.memberUserId, { signal }),
                            "Membro familiar removido.",
                            { confirmation: `Confirmas a remoção de ${familyUserLabel(member.member)} da família?` },
                        )}
                        onAccept={(invitation) => runOperation(
                            (signal) => subscriptionsApi.acceptFamilyInvitation(invitation.id, { signal }),
                            "Convite familiar aceite.",
                        )}
                        onDecline={(invitation) => runOperation(
                            (signal) => subscriptionsApi.declineFamilyInvitation(invitation.id, { signal }),
                            "Convite familiar recusado.",
                            { confirmation: "Confirmas que pretendes recusar este convite familiar?" },
                        )}
                        onLeave={() => runOperation(
                            (signal) => subscriptionsApi.leaveFamily({ signal }),
                            "Saíste da partilha familiar.",
                            { confirmation: "Confirmas que pretendes sair desta família?" },
                        )}
                    />
                ) : null}

                <section className="subscription-notes" aria-labelledby="subscription-notes-title">
                    <p className="section-kicker">Transparência</p>
                    <h2 id="subscription-notes-title">O que precisas de saber</h2>
                    <div>
                        <p><strong>Ativação imediata.</strong> O plano fica disponível assim que a subscrição for confirmada.</p>
                        <p><strong>Renovação controlada.</strong> Cancelar a renovação mantém o acesso até ao fim do ciclo contratado.</p>
                        <p><strong>Impacto registado.</strong> A contribuição solidária é calculada apenas sobre pagamentos aprovados.</p>
                    </div>
                </section>
            </div>

            <SubscriptionCheckoutDialog
                ref={checkoutDialogRef}
                plan={selectedPlan}
                submitting={submitting}
                error={selectedPlan ? actionError : ""}
                onConfirm={handleSimulatedCheckout}
                onClose={handleCheckoutDialogClose}
                onRequestClose={closeCheckoutDialog}
            />
        </div>
    );
}
