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
    return moneyFormatter.format(cents / 100);
}

function formatMonth(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(year, monthNumber - 1, 1)));
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

    return (
        <section className="page-section">
            <p className="section-kicker">Solidariedade</p>
            <h1>Histórico da pool</h1>
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
                <section className="admin-kpi-grid" aria-label="Resumo dos últimos 12 meses">
                    <article className="admin-kpi-card"><span>Meses apresentados</span><strong>{Math.min(months.length, 12)}</strong></article>
                    <article className="admin-kpi-card"><span>Total distribuído</span><strong>{formatMoney(months.slice(0, 12).reduce((sum, row) => sum + (row.totalPoolCents ?? 0), 0))}</strong></article>
                    <article className="admin-kpi-card"><span>Último estado</span><strong>{STATUS_LABELS[months[0]?.status] ?? "Indisponível"}</strong></article>
                </section>
            ) : null}
            {!error
                ? months.map((month) => (
                      <article key={month.month}>
                          <h2>{formatMonth(month.month)}</h2>
                          <p className="muted-text">Referência: {month.month}</p>
                          <p>Total: {formatMoney(month.totalPoolCents)}</p>
                          <p>Associações: {month.charitiesCount}</p>
                          <p>
                              Estado: {STATUS_LABELS[month.status] ?? "Indisponível"}
                          </p>
                      </article>
                  ))
                : null}
        </section>
    );
}
