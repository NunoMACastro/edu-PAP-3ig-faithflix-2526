/**
 * @file Dashboard cancelável da pool solidária com estados em PT-PT.
 */

import { useEffect, useState } from "react";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
});

const STATUS_LABELS = {
    completed: "Concluída",
    // Alias apenas de apresentação para registos anteriores ao estado canónico.
    distributed: "Concluída",
    deferred_no_eligible_charities: "Encerrada sem associações elegíveis",
};

/**
 * Formata valores monetários persistidos em cêntimos.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor formatado em euros.
 */
function formatMoney(cents) {
    return moneyFormatter.format((cents ?? 0) / 100);
}

/**
 * Converte a referência financeira `YYYY-MM` num mês legível em PT-PT.
 *
 * @param {string} month Referência mensal persistida.
 * @returns {string} Mês e ano formatados para apresentação.
 */
function formatMonth(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

/**
 * Associa o estado financeiro a um tom visual já existente no backoffice.
 * Estados desconhecidos ou sem distribuição mantêm o badge neutro por omissão.
 *
 * @param {string} status Estado persistido da distribuição.
 * @returns {string} Classe visual adicional do badge.
 */
function statusBadgeClass(status) {
    return ["completed", "distributed"].includes(status) ? "status-approved" : "";
}

/**
 * Mostra totais mensais agregados da pool.
 *
 * @returns {JSX.Element} Dashboard administrativo.
 */
export function AdminPoolDashboardPage() {
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        charitiesApi
            .getPoolDashboard({ signal: controller.signal })
            .then((response) => {
                if (active) setMonths(response.months ?? []);
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
    }, [reloadVersion]);

    const displayedMonths = months.slice(0, 12);
    const totalDistributedCents = displayedMonths.reduce(
        (sum, month) => sum + (month.totalPoolCents ?? 0),
        0,
    );
    const averageMonthlyCents = displayedMonths.length
        ? Math.round(totalDistributedCents / displayedMonths.length)
        : 0;
    const latestMonth = displayedMonths[0];

    return (
        <section className="page-section">
            <header className="admin-page-header">
                <div>
                    <p className="section-kicker">Solidariedade</p>
                    <h1>Histórico da pool</h1>
                    <p>Acompanha os últimos fechos mensais e os montantes distribuídos.</p>
                </div>
            </header>
            {loading ? <p role="status">A carregar histórico...</p> : null}
            {error ? (
                <EmptyState
                    title="Não foi possível carregar a pool"
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
            {!loading && !error && months.length === 0 ? (
                <EmptyState
                    title="Sem distribuições"
                    description="Ainda não existem meses financeiros fechados."
                />
            ) : null}
            {!loading && !error && months.length ? (
                <section className="admin-kpi-grid pool-kpi-grid" aria-label="Resumo do histórico apresentado">
                    <article className="admin-kpi-card">
                        <span>Total distribuído</span>
                        <strong>{formatMoney(totalDistributedCents)}</strong>
                        <small>
                            {displayedMonths.length === 1
                                ? "No mês apresentado"
                                : `Nos ${displayedMonths.length} meses apresentados`}
                        </small>
                    </article>
                    <article className="admin-kpi-card">
                        <span>Média mensal</span>
                        <strong>{formatMoney(averageMonthlyCents)}</strong>
                        <small>Por mês financeiro fechado</small>
                    </article>
                    <article className="admin-kpi-card">
                        <span>Último fecho</span>
                        <strong>{formatMonth(latestMonth.month)}</strong>
                        <div className="pool-kpi-status">
                            <span className={`status-badge ${statusBadgeClass(latestMonth.status)}`}>
                                {STATUS_LABELS[latestMonth.status] ?? "Indisponível"}
                            </span>
                        </div>
                    </article>
                </section>
            ) : null}
            {!loading && !error && displayedMonths.length ? (
                <section className="admin-panel pool-history-panel" aria-labelledby="pool-history-title">
                    <div className="pool-history-heading">
                        <div>
                            <h2 id="pool-history-title">Distribuições mensais</h2>
                            <p className="muted-text">
                                {displayedMonths.length} {displayedMonths.length === 1
                                    ? "mês financeiro mais recente."
                                    : "meses financeiros mais recentes."}
                            </p>
                        </div>
                    </div>

                    <div className="table-wrap pool-history-desktop">
                        <table aria-label="Distribuições mensais da pool solidária">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Total distribuído</th>
                                    <th>Associações</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedMonths.map((month) => (
                                    <tr key={month.month}>
                                        <td>
                                            <div className="pool-month-cell">
                                                <strong>{formatMonth(month.month)}</strong>
                                                <small>{month.month}</small>
                                            </div>
                                        </td>
                                        <td><strong>{formatMoney(month.totalPoolCents)}</strong></td>
                                        <td>{month.charitiesCount}</td>
                                        <td>
                                            <span className={`status-badge ${statusBadgeClass(month.status)}`}>
                                                {STATUS_LABELS[month.status] ?? "Indisponível"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <ul className="pool-history-mobile" aria-label="Distribuições mensais da pool solidária">
                        {displayedMonths.map((month) => (
                            <li key={month.month}>
                                <div className="pool-mobile-heading">
                                    <div>
                                        <strong>{formatMonth(month.month)}</strong>
                                        <small>{month.month}</small>
                                    </div>
                                    <span className={`status-badge ${statusBadgeClass(month.status)}`}>
                                        {STATUS_LABELS[month.status] ?? "Indisponível"}
                                    </span>
                                </div>
                                <div className="pool-mobile-summary">
                                    <strong>{formatMoney(month.totalPoolCents)}</strong>
                                    <span>{month.charitiesCount} {month.charitiesCount === 1 ? "associação" : "associações"}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </section>
    );
}
