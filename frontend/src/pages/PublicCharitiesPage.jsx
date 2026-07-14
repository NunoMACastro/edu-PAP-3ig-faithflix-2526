/**
 * @file Página pública editorial das associações apoiadas pela FaithFlix.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    charityMonogram,
    PublicCharityCard,
} from "../components/charities/PublicCharityCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    style: "currency",
});

/**
 * Página pública de impacto, associações elegíveis e entrada privada segura.
 *
 * @returns {JSX.Element} Experiência pública das associações FaithFlix.
 */
export function PublicCharitiesPage() {
    const { status: sessionStatus, isAdmin } = useSession();
    const [charities, setCharities] = useState([]);
    const [impact, setImpact] = useState(null);
    const [ownCharity, setOwnCharity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        charitiesApi.listPublicCharities({ signal: controller.signal })
            .then((response) => {
                if (!active) return;
                const nextCharities = Array.isArray(response?.charities)
                    ? response.charities
                    : [];
                setCharities(nextCharities);
                setImpact(response?.impact ?? {
                    eligibleCharities: nextCharities.length,
                    totalDistributedCents: 0,
                    completedMonths: 0,
                    currency: "EUR",
                });
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

    useEffect(() => {
        if (sessionStatus !== "authenticated" || isAdmin) {
            setOwnCharity(null);
            return undefined;
        }

        const controller = new AbortController();
        let active = true;
        setOwnCharity(null);

        charitiesApi.getMine({ signal: controller.signal })
            .then((response) => {
                if (active) setOwnCharity(response?.charity ?? null);
            })
            // Esta leitura é secundária: uma falha nunca bloqueia conteúdo público.
            .catch(() => {});

        return () => {
            active = false;
            controller.abort();
        };
    }, [isAdmin, sessionStatus]);

    const heroCharities = useMemo(() => charities.slice(0, 5), [charities]);
    const metrics = impact ? [
        {
            label: "associações elegíveis",
            value: String(impact.eligibleCharities ?? charities.length),
        },
        {
            label: "distribuídos",
            value: moneyFormatter.format(
                Math.max(0, Number(impact.totalDistributedCents ?? 0)) / 100,
            ),
        },
        {
            label: "meses concluídos",
            value: String(Math.max(0, Number(impact.completedMonths ?? 0))),
        },
    ] : [];

    return (
        <div className="charities-page" data-testid="public-charities-page">
            <section className="charities-hero" aria-labelledby="charities-title">
                <div className="charities-hero-inner">
                    <div className="charities-hero-copy">
                        <p className="section-kicker">Impacto FaithFlix</p>
                        <h1 id="charities-title">Ver histórias. Apoiar vidas.</h1>
                        <p>
                            Uma parte de cada pagamento aprovado alimenta uma pool
                            solidária, distribuída mensalmente pelas associações
                            elegíveis.
                        </p>
                        <div className="charities-hero-actions">
                            <a className="button-link" href="#associacoes-publicas">
                                Conhecer associações
                            </a>
                            <Link className="button-link button-link-secondary" to="/associacoes/candidatura">
                                Candidatar uma associação
                            </Link>
                            {ownCharity ? (
                                <Link
                                    className="charities-private-link"
                                    to={`/associacoes/${encodeURIComponent(ownCharity.id)}/historico`}
                                >
                                    Área da associação
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <div className="charities-constellation" aria-hidden="true">
                        <span className="charities-constellation-ring" />
                        {heroCharities.map((charity, index) => (
                            <span
                                className={`charities-constellation-item charities-constellation-item-${index + 1}`}
                                key={charity.id}
                            >
                                {charityMonogram(charity.name)}
                            </span>
                        ))}
                        {heroCharities.length === 0 ? (
                            <span className="charities-constellation-item charities-constellation-item-empty">FF</span>
                        ) : null}
                    </div>
                </div>
                {metrics.length > 0 ? (
                    <dl className="charities-impact-strip" aria-label="Impacto agregado da pool solidária">
                        {metrics.map((metric) => (
                            <div key={metric.label}>
                                <dt>{metric.label}</dt>
                                <dd>{metric.value}</dd>
                            </div>
                        ))}
                    </dl>
                ) : null}
            </section>

            <div className="charities-content">
                <section className="charities-process" aria-labelledby="charities-process-title">
                    <div className="charities-section-heading">
                        <p className="section-kicker">Transparência</p>
                        <h2 id="charities-process-title">Como funciona a pool solidária</h2>
                    </div>
                    <ol className="charities-process-list">
                        <li>
                            <span aria-hidden="true">01</span>
                            <h3>A subscrição contribui</h3>
                            <p>Uma percentagem registada de cada pagamento aprovado segue para a pool.</p>
                        </li>
                        <li>
                            <span aria-hidden="true">02</span>
                            <h3>O mês é fechado</h3>
                            <p>O sistema considera apenas meses terminados e associações elegíveis nesse fecho.</p>
                        </li>
                        <li>
                            <span aria-hidden="true">03</span>
                            <h3>O impacto é repartido</h3>
                            <p>A rotação mensal mantém a distribuição equilibrada e cada resultado fica registado.</p>
                        </li>
                    </ol>
                </section>

                <section
                    className="charities-directory"
                    id="associacoes-publicas"
                    aria-labelledby="charities-directory-title"
                >
                    <div className="charities-section-heading charities-directory-heading">
                        <div>
                            <p className="section-kicker">Comunidade</p>
                            <h2 id="charities-directory-title">Associações que fazem parte desta missão</h2>
                        </div>
                        <p>Organizações aprovadas e atualmente elegíveis para a pool solidária.</p>
                    </div>

                    {loading ? <p role="status">A carregar associações...</p> : null}
                    {error ? (
                        <EmptyState title="Não foi possível carregar associações" description={error} tone="error">
                            <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
                                Tentar novamente
                            </button>
                        </EmptyState>
                    ) : null}
                    {!loading && !error && charities.length === 0 ? (
                        <EmptyState
                            title="Ainda não existem associações públicas"
                            description="Quando existirem associações aprovadas e elegíveis, serão apresentadas aqui."
                        >
                            <Link className="button-link" to="/associacoes/candidatura">
                                Candidatar uma associação
                            </Link>
                        </EmptyState>
                    ) : null}
                    {charities.length > 0 ? (
                        <div className="public-charities-grid" aria-label="Associações públicas">
                            {charities.map((charity) => (
                                <PublicCharityCard
                                    key={charity.id}
                                    charity={charity}
                                    historyTo={isAdmin
                                        ? `/associacoes/${encodeURIComponent(charity.id)}/historico`
                                        : undefined}
                                />
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="charities-application-cta" aria-labelledby="charities-application-title">
                    <div>
                        <p className="section-kicker">Fazer parte</p>
                        <h2 id="charities-application-title">A tua associação partilha esta missão?</h2>
                        <p>Apresenta o trabalho da organização para revisão da equipa FaithFlix.</p>
                    </div>
                    <Link className="button-link" to="/associacoes/candidatura">
                        Iniciar candidatura
                    </Link>
                </section>
            </div>
        </div>
    );
}
