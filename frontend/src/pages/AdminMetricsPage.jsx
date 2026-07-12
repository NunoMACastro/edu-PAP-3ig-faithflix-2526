/**
 * @file Métricas administrativas canceláveis e sem dados pessoais individuais.
 */

import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { metricsApi } from "../services/api/metricsApi.js";

/**
 * Formata cêntimos em euros segundo as convenções portuguesas.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor formatado.
 */
function formatCents(cents) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format((cents ?? 0) / 100);
}

/**
 * Renderiza um cartão simples de métrica.
 *
 * @param {{ label: string, value: string | number }} props Dados do cartão.
 * @returns {JSX.Element} Cartão de métrica.
 */
function MetricCard({ label, value }) {
    return (
        <article className="metric-card">
            <span>{label}</span>
            <strong>{value}</strong>
        </article>
    );
}

/**
 * Entrega ao navegador o Blob devolvido pela API autenticada.
 *
 * @param {{ blob: Blob, filename?: string }} file Ficheiro preparado.
 * @returns {void}
 */
function downloadCsv(file) {
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename || "faithflix-metricas.csv";
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Página administrativa de métricas agregadas.
 *
 * @returns {JSX.Element} Filtros temporais e métricas.
 */
export function AdminMetricsPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [filters, setFilters] = useState({ from: "", to: "" });
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [exportEnabled, setExportEnabled] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState("");
    const [exportStatus, setExportStatus] = useState("");
    const exportControllerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        metricsApi
            .getAdminMetrics(filters, { signal: controller.signal })
            .then((response) => {
                if (active) {
                    setMetrics(response.metrics);
                    setExportEnabled(
                        response?.capabilities?.csvExport !== false,
                    );
                }
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [filters, reloadVersion]);

    useEffect(() => () => exportControllerRef.current?.abort(), []);

    /**
     * Valida e aplica o intervalo temporal escolhido.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {void}
     */
    function handleSubmit(event) {
        event.preventDefault();

        if (from && to && from > to) {
            setError("A data inicial não pode ser posterior à data final.");
            return;
        }

        setError("");
        setFilters({ from, to });
        setReloadVersion((value) => value + 1);
    }

    /**
     * Pede o CSV com a sessão atual e cria o download apenas após sucesso.
     *
     * @returns {Promise<void>} Termina quando o pedido foi tratado.
     */
    async function handleExport() {
        if (exporting || !exportEnabled) return;

        const controller = new AbortController();
        exportControllerRef.current = controller;
        setExporting(true);
        setExportError("");
        setExportStatus("");

        try {
            const file = await metricsApi.exportCsv(filters, {
                signal: controller.signal,
            });
            if (exportControllerRef.current !== controller) return;
            downloadCsv(file);
            setExportStatus("Exportação CSV preparada.");
        } catch (requestError) {
            if (
                exportControllerRef.current === controller &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setExportError(toUserMessage(requestError));
            }
        } finally {
            if (exportControllerRef.current === controller) {
                exportControllerRef.current = null;
                setExporting(false);
            }
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Administração</p>
            <h1>Métricas</h1>
            <form className="filter-bar" onSubmit={handleSubmit}>
                <label>
                    De
                    <input
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(event) => setFrom(event.target.value)}
                    />
                </label>
                <label>
                    Até
                    <input
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(event) => setTo(event.target.value)}
                    />
                </label>
                <button type="submit" disabled={loading}>
                    Atualizar
                </button>
                {exportEnabled ? (
                    <button
                        type="button"
                        disabled={loading || exporting}
                        onClick={handleExport}
                    >
                        {exporting ? "A exportar..." : "Exportar CSV"}
                    </button>
                ) : null}
            </form>
            {loading ? <p role="status">A carregar métricas...</p> : null}
            {exportError ? <p role="alert">{exportError}</p> : null}
            {exportStatus ? <p role="status">{exportStatus}</p> : null}
            {error ? (
                <EmptyState
                    title="Não foi possível carregar as métricas"
                    description={error}
                    tone="error"
                >
                    <button
                        type="button"
                        onClick={() => setReloadVersion((value) => value + 1)}
                    >
                        Tentar novamente
                    </button>
                </EmptyState>
            ) : null}
            {!error && metrics ? (
                <div className="admin-metrics-groups">
                    <p className="admin-data-freshness">Período aplicado: <strong>{metrics.range.from}</strong> a <strong>{metrics.range.to}</strong>. Gerado em {new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(metrics.generatedAt))}.</p>
                    <section><h2>Utilizadores e subscrições</h2><div className="metric-grid"><MetricCard label="Utilizadores" value={metrics.users.total} /><MetricCard label="Ativos" value={metrics.users.active} /><MetricCard label="Bloqueados" value={metrics.users.blocked} /><MetricCard label="Eliminados" value={metrics.users.deleted} /><MetricCard label="Subscrições ativas" value={metrics.subscriptions.active} /><MetricCard label="Períodos experimentais" value={metrics.subscriptions.trialing} /><MetricCard label="Membros familiares" value={metrics.subscriptions.familyMembers} /><MetricCard label="Convites familiares pendentes" value={metrics.subscriptions.familyInvitationsPending} /></div></section>
                    <section><h2>Conteúdo</h2><div className="metric-grid"><MetricCard label="Publicados" value={metrics.catalog.published} /><MetricCard label="Rascunhos" value={metrics.catalog.draft} /><MetricCard label="Arquivados" value={metrics.catalog.archived} /><MetricCard label="Media pendente" value={metrics.catalog.mediaPending} /><MetricCard label="Media falhada" value={metrics.catalog.mediaFailed} /></div></section>
                    <section><h2>Solidariedade e integrações</h2><div className="metric-grid"><MetricCard label="Associações elegíveis" value={metrics.solidarity.approvedCharities} /><MetricCard label="Candidaturas pendentes" value={metrics.solidarity.pendingApplications} /><MetricCard label="Distribuído" value={formatCents(metrics.solidarity.distributedCents)} /><MetricCard label="Integrações ativas" value={metrics.integrations.enabled} /><MetricCard label="Integrações desativadas" value={metrics.integrations.disabled} /><MetricCard label="Integrações inválidas" value={metrics.integrations.invalid} /></div></section>
                    <section><h2>Privacidade e atividade</h2><div className="metric-grid"><MetricCard label="Notificações" value={metrics.notifications.created} /><MetricCard label="Pedidos de eliminação" value={metrics.privacy.deletionRequests} /><MetricCard label="Eventos de consentimento" value={metrics.privacy.consentEvents} /><MetricCard label="Eventos anónimos" value={metrics.anonymousMetrics?.total ?? 0} /><MetricCard label="Visualizações de catálogo" value={metrics.anonymousMetrics?.byType?.catalog_view ?? 0} /><MetricCard label="Pesquisas" value={metrics.anonymousMetrics?.byType?.search_submit ?? 0} /><MetricCard label="Reproduções iniciadas" value={metrics.anonymousMetrics?.byType?.playback_started ?? 0} /><MetricCard label="Reproduções concluídas" value={metrics.anonymousMetrics?.byType?.playback_completed ?? 0} /></div></section>
                </div>
            ) : null}
        </section>
    );
}
