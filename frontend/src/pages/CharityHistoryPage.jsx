/**
 * @file Histórico privado cancelável de uma associação.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
});

/**
 * Mostra histórico de distribuição para uma associação autorizada.
 *
 * @returns {JSX.Element} Página privada de histórico.
 */
export function CharityHistoryPage() {
    const { charityId } = useParams();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        charitiesApi
            .getCharityHistory(charityId, { signal: controller.signal })
            .then((response) => {
                if (active) setHistory(response);
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
    }, [charityId, reloadVersion]);

    return (
        <section className="page-section">
            <h1>Histórico da associação</h1>
            {loading ? <p role="status">A carregar histórico...</p> : null}
            {error ? (
                <EmptyState
                    title="Não foi possível carregar o histórico"
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
            {!loading && !error && !history ? (
                <EmptyState
                    title="Histórico indisponível"
                    description="Não existem dados autorizados para apresentar."
                />
            ) : null}
            {history && !error ? (
                <section>
                    <p>
                        Total recebido: {moneyFormatter.format(history.totalCents / 100)}
                    </p>
                    <a href={charitiesApi.historyCsvUrl(charityId)}>Exportar CSV</a>
                    {(history.rows ?? []).map((row) => (
                        <article key={row.month}>
                            <h2>{row.month}</h2>
                            <p>{moneyFormatter.format(row.amountCents / 100)}</p>
                            <p>Posição na rotação: {row.rotationPosition}</p>
                        </article>
                    ))}
                </section>
            ) : null}
        </section>
    );
}
