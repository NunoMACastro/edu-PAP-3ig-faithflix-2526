/**
 * @file Dashboard operacional da área administrativa FaithFlix.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { metricsApi } from "../services/api/metricsApi.js";

function formatCents(cents) {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" })
        .format((cents ?? 0) / 100);
}

function formatDateTime(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" })
        .format(new Date(value));
}

function DashboardMetric({ label, value, detail }) {
    return (
        <article className="admin-kpi-card">
            <span>{label}</span>
            <strong>{value}</strong>
            {detail ? <small>{detail}</small> : null}
        </article>
    );
}

/** @returns {JSX.Element} KPIs, alertas e atalhos administrativos. */
export function AdminDashboardPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");

        metricsApi.getAdminMetrics({}, { signal: controller.signal })
            .then((response) => setMetrics(response.metrics))
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [reloadVersion]);

    const attentionItems = metrics ? [
        { label: "Candidaturas pendentes", count: metrics.solidarity.pendingApplications, to: "/admin/charity-applications?status=pending" },
        { label: "Media por processar", count: metrics.catalog.mediaPending, to: "/admin/catalogo?mediaStatus=pending" },
        { label: "Media com falha", count: metrics.catalog.mediaFailed, to: "/admin/catalogo?mediaStatus=failed" },
        { label: "Contas bloqueadas", count: metrics.users.blocked, to: "/admin/utilizadores?status=blocked" },
        { label: "Integrações inválidas", count: metrics.integrations.invalid, to: "/admin/integracoes" },
    ].filter((item) => item.count > 0) : [];

    return (
        <section className="admin-page">
            <header className="admin-page-header">
                <div>
                    <p className="section-kicker">Visão geral</p>
                    <h1>Dashboard</h1>
                    <p>Acompanhamento operacional sem carregar listagens completas.</p>
                </div>
            </header>

            {loading ? <p role="status">A carregar dashboard…</p> : null}
            {error ? (
                <EmptyState title="Não foi possível carregar o dashboard" description={error} tone="error">
                    <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>Tentar novamente</button>
                </EmptyState>
            ) : null}

            {!loading && !error && metrics ? (
                <>
                    <div className="admin-kpi-grid">
                        <DashboardMetric label="Utilizadores ativos" value={metrics.users.active} detail={`${metrics.users.total} contas no total`} />
                        <DashboardMetric label="Conteúdos publicados" value={metrics.catalog.published} detail={`${metrics.catalog.draft} rascunhos`} />
                        <DashboardMetric label="Subscrições ativas" value={metrics.subscriptions.active} detail={`${metrics.subscriptions.trialing} em período experimental`} />
                        <DashboardMetric label="Membros familiares" value={metrics.subscriptions.familyMembers} detail={`${metrics.subscriptions.familyInvitationsPending} convites pendentes`} />
                        <DashboardMetric label="Associações elegíveis" value={metrics.solidarity.approvedCharities} />
                        <DashboardMetric label="Distribuído no período" value={formatCents(metrics.solidarity.distributedCents)} />
                        <DashboardMetric label="Integrações ativas" value={`${metrics.integrations.enabled}/${metrics.integrations.total}`} />
                        <DashboardMetric label="Eventos anónimos" value={metrics.anonymousMetrics.total} />
                    </div>

                    <div className="admin-dashboard-columns">
                        <section className="admin-panel" aria-labelledby="attention-title">
                            <h2 id="attention-title">Requer atenção</h2>
                            {attentionItems.length ? (
                                <ul className="admin-attention-list">
                                    {attentionItems.map((item) => (
                                        <li key={item.label}><Link to={item.to}><span>{item.label}</span><strong>{item.count}</strong></Link></li>
                                    ))}
                                </ul>
                            ) : <p>Nenhuma situação crítica neste momento.</p>}
                        </section>

                        <section className="admin-panel" aria-labelledby="shortcuts-title">
                            <h2 id="shortcuts-title">Atalhos</h2>
                            <div className="admin-shortcuts">
                                <Link className="button-link" to="/admin/catalogo/novo">Novo conteúdo</Link>
                                <Link className="button-link" to="/admin/utilizadores">Gerir utilizadores</Link>
                                <Link className="button-link" to="/admin/charity-applications">Rever candidaturas</Link>
                                <Link className="button-link" to="/admin/pool/distribution">Distribuição mensal</Link>
                            </div>
                        </section>
                    </div>

                    <p className="admin-data-freshness">
                        Período: <strong>{metrics.range.from}</strong> a <strong>{metrics.range.to}</strong>. Gerado em {formatDateTime(metrics.generatedAt)}.
                    </p>
                </>
            ) : null}
        </section>
    );
}
