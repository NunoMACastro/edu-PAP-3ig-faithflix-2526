// apps/frontend/src/pages/AdminMetricsPage.jsx
import { useEffect, useState } from "react";
import { metricsApi } from "../services/api/metricsApi.js";

/**
 * Página admin com métricas agregadas de operação.
 *
 * @returns {JSX.Element} Painel de métricas.
 */
export function AdminMetricsPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        metricsApi
            .getAdminMetrics()
            .then((response) => setMetrics(response.metrics))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="page-section">
                <p>A carregar métricas...</p>
            </section>
        );
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Métricas</h1>
            {error ? <p role="alert">{error}</p> : null}
            {!error && metrics ? (
                <div className="metric-grid">
                    <article>
                        <h2>Utilizadores</h2>
                        <p>Total: {metrics.users.total}</p>
                        <p>Ativos: {metrics.users.active}</p>
                        <p>Bloqueados: {metrics.users.blocked}</p>
                    </article>
                    <article>
                        <h2>Conteúdos</h2>
                        <p>Publicados: {metrics.content.published}</p>
                    </article>
                    <article>
                        <h2>Subscrições</h2>
                        <p>Ativas: {metrics.subscriptions.active}</p>
                        <p>Trial: {metrics.subscriptions.trialing}</p>
                    </article>
                    <article>
                        <h2>Privacidade</h2>
                        <p>Eliminações: {metrics.privacy.deletionRequests}</p>
                        <p>Eventos de consentimento: {metrics.privacy.consentEvents}</p>
                    </article>
                    <article>
                        <h2>Associações</h2>
                        <p>Elegíveis: {metrics.charities.approvedInPool}</p>
                        <p>Total solidário: {(metrics.charities.solidarityCents / 100).toFixed(2)} EUR</p>
                    </article>
                </div>
            ) : null}
        </section>
    );
}