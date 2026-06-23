/**
 * @file Pagina de metricas administrativas agregadas da MF5.
 */

import { useEffect, useState } from "react";
import { metricsApi } from "../services/api/metricsApi.js";

/**
 * Formata cêntimos em euros pt-PT.
 *
 * @param {number} cents Valor em centimos.
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
 * Página admin com métricas agregadas sem dados pessoais individuais.
 *
 * @returns {JSX.Element} Página de métricas.
 */
export function AdminMetricsPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /**
     * Carrega métricas do backend.
     *
     * @param {{ from?: string, to?: string }} filters Filtros temporais.
     * @returns {Promise<void>} Termina depois de atualizar estado.
     */
    async function loadMetrics(filters = {}) {
        const response = await metricsApi.getAdminMetrics(filters);
        setMetrics(response.metrics);
    }

    useEffect(() => {
        loadMetrics()
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Aplica o intervalo temporal escolhido.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o backend responde.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            await loadMetrics({ from, to });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Métricas</h1>
            <form className="filter-bar" onSubmit={handleSubmit}>
                <label>
                    De
                    <input
                        type="date"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                    />
                </label>
                <label>
                    Até
                    <input
                        type="date"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                    />
                </label>
                <button type="submit">Atualizar</button>
            </form>
            {loading ? <p>A carregar métricas...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {metrics ? (
                <div className="metric-grid">
                    <MetricCard label="Utilizadores" value={metrics.users.total} />
                    <MetricCard label="Ativos" value={metrics.users.active} />
                    <MetricCard label="Bloqueados" value={metrics.users.blocked} />
                    <MetricCard label="Conteúdos publicados" value={metrics.catalog.published} />
                    <MetricCard label="Subscrições ativas" value={metrics.subscriptions.active} />
                    <MetricCard label="Trials" value={metrics.subscriptions.trialing} />
                    <MetricCard label="Notificações" value={metrics.notifications.created} />
                    <MetricCard label="Pedidos de eliminação" value={metrics.privacy.deletionRequests} />
                    <MetricCard label="Eventos de consentimento" value={metrics.privacy.consentEvents} />
                    <MetricCard label="Associações elegíveis" value={metrics.solidarity.approvedCharities} />
                    <MetricCard
                        label="Distribuído"
                        value={formatCents(metrics.solidarity.distributedCents)}
                    />
                </div>
            ) : null}
        </section>
    );
}
