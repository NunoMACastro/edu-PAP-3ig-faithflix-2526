/**
 * @file Página pública de associações apoiadas.
 *
 * Mostra apenas dados públicos das associações elegíveis para a pool solidária.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Lista associações públicas e dá acesso ao formulário de candidatura.
 *
 * @returns {JSX.Element} Página pública de associações.
 */
export function PublicCharitiesPage() {
    const { status } = useSession();
    const [charities, setCharities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        /**
         * Carrega apenas associações públicas elegíveis.
         *
         * @returns {Promise<void>} Termina depois de atualizar a lista.
         */
        async function loadCharities() {
            try {
                const response = await charitiesApi.listPublicCharities();

                if (active) {
                    setCharities(response.charities);
                }
            } catch (requestError) {
                if (active) {
                    setError(toUserMessage(requestError));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCharities();

        return () => {
            active = false;
        };
    }, []);

    const canOpenPrivateHistory = status === "authenticated";

    return (
        <section className="page-section">
            <p className="section-kicker">Pool solidária</p>
            <h1>Associações apoiadas</h1>
            <div className="button-row">
                <Link className="button-link" to="/associacoes/candidatura">
                    Candidatar associação
                </Link>
            </div>

            {loading ? <p role="status">A carregar associações...</p> : null}
            {error ? <EmptyState title="Não foi possível carregar associações" description={error} tone="error" /> : null}
            {!loading && !error && charities.length === 0 ? (
                <EmptyState
                    title="Ainda não existem associações públicas"
                    description="Quando existirem associações aprovadas e públicas, aparecem nesta lista."
                />
            ) : null}

            <section className="content-grid" aria-label="Associações públicas">
                {charities.map((charity) => (
                    <ContentCard
                        key={charity.id}
                        eyebrow="Associação"
                        title={charity.name}
                        description={charity.mission}
                        meta={charity.websiteUrl}
                        to={canOpenPrivateHistory ? `/associacoes/${charity.id}/historico` : undefined}
                        actionLabel="Ver histórico"
                    />
                ))}
            </section>

            {!canOpenPrivateHistory ? (
                <p className="muted-text">
                    O histórico privado de uma associação exige sessão autenticada e autorização no backend.
                </p>
            ) : null}
        </section>
    );
}
