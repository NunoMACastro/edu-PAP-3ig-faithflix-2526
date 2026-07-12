/**
 * @file Ficheiro `real_dev/frontend/src/pages/ContentDetailPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CommentsPanel } from "../components/comments/CommentsPanel.jsx";
import { ContentDetailHero } from "../components/catalog/ContentDetailHero.jsx";
import { RelatedContent } from "../components/discovery/RelatedContent.jsx";
import { LibraryActions } from "../components/library/LibraryActions.jsx";
import { RatingBox } from "../components/ratings/RatingBox.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { catalogApi } from "../services/api/catalogApi.js";
import { buildLoginRedirectPath } from "../utils/authRedirect.js";

/**
 * Converte duração em segundos para texto curto de minutos.
 *
 * A página recebe duração técnica do backend, mas mostra uma leitura simples para
 * o utilizador na ficha do conteúdo.
 *
 * @param {number | string} seconds Duração total do conteúdo em segundos.
 * @returns {string} Duração arredondada no formato `<minutos> min`.
 */
function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
}

/**
 * Formata uma classificação etária sem converter vazio em zero.
 *
 * @param {number | string | null | undefined} value Classificação pública.
 * @returns {string} Classificação legível ou vazio.
 */
function formatAgeRating(value) {
    const normalizedValue = String(value ?? "").trim();
    const ageRating = Number(normalizedValue);

    return normalizedValue !== "" &&
        Number.isInteger(ageRating) &&
        ageRating >= 0 &&
        ageRating <= 18
        ? `${ageRating}+`
        : "";
}

/**
 * Apresenta temporadas e episódios sem transformar episódios em cartões
 * autónomos do catálogo.
 *
 * @param {{content: Record<string, unknown>, seasons: Record<string, unknown>[], sessionStatus: string}} props Dados públicos da série.
 * @returns {JSX.Element} Lista ordenada ou estado «Em breve».
 */
function SeriesEpisodesSection({ content, seasons, sessionStatus }) {
    if (seasons.length === 0) {
        return (
            <section aria-labelledby="series-episodes-heading">
                <p className="section-kicker">Episódios</p>
                <h2 id="series-episodes-heading">Em breve</h2>
                <p>
                    Esta série está publicada, mas ainda não tem episódios
                    disponíveis.
                </p>
            </section>
        );
    }

    return (
        <section aria-labelledby="series-episodes-heading">
            <div className="content-detail-section-heading">
                <p className="section-kicker">Temporadas</p>
                <h2 id="series-episodes-heading">Episódios</h2>
            </div>
            {seasons.map((season) => (
                <section
                    aria-labelledby={`season-${season.seasonNumber}-heading`}
                    key={season.seasonNumber}
                >
                    <h3 id={`season-${season.seasonNumber}-heading`}>
                        Temporada {season.seasonNumber}
                    </h3>
                    <div className="content-grid">
                        {(season.episodes ?? []).map((episode) => {
                            const playbackPath = `/ver/${encodeURIComponent(episode.id)}`;
                            return (
                                <article className="content-card" key={episode.id}>
                                    <p className="content-card-eyebrow">
                                        T{episode.seasonNumber} E{episode.episodeNumber}
                                    </p>
                                    <h4>{episode.title}</h4>
                                    <p>{episode.synopsis}</p>
                                    <p>{formatDuration(episode.durationSeconds)}</p>
                                    <div className="button-row">
                                        <Link
                                            className="secondary-button"
                                            to={episode.canonicalPath}
                                        >
                                            Ver episódio
                                        </Link>
                                        {episode.isPlayable ? (
                                            <Link
                                                className="button-link"
                                                to={
                                                    sessionStatus === "authenticated"
                                                        ? playbackPath
                                                        : buildLoginRedirectPath(playbackPath)
                                                }
                                            >
                                                Reproduzir
                                            </Link>
                                        ) : (
                                            <button type="button" disabled>
                                                Vídeo em preparação
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ))}
            <p className="muted-text">
                {content.episodeCount} episódio
                {content.episodeCount === 1 ? "" : "s"} em {content.seasonCount}{" "}
                temporada{content.seasonCount === 1 ? "" : "s"}.
            </p>
        </section>
    );
}

/**
 * Página pública de detalhe de conteúdo.
 *
 * @returns {JSX.Element} Página de detalhe de conteúdo.
 */
export function ContentDetailPage() {
    const { idOrSlug } = useParams();
    const {
        status: sessionStatus,
        refreshSession,
    } = useSession();
    const [content, setContent] = useState(null);
    const [detail, setDetail] = useState(null);
    const [contentLoadedFor, setContentLoadedFor] = useState("");
    const [passages, setPassages] = useState([]);
    const [passagesLoadedFor, setPassagesLoadedFor] = useState("");
    const [passageLoading, setPassageLoading] = useState(false);
    const [passageError, setPassageError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errorStatus, setErrorStatus] = useState(null);
    const [contentReloadVersion, setContentReloadVersion] = useState(0);
    const [passageReloadVersion, setPassageReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setLoading(true);
        setError("");
        setErrorStatus(null);

        catalogApi
            .getDetail(idOrSlug, { signal: controller.signal })
            .then((response) => {
                if (active) {
                    setDetail(response);
                    setContent(response.content);
                    setContentLoadedFor(idOrSlug);
                    setErrorStatus(null);
                }
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setContent(null);
                    setDetail(null);
                    setContentLoadedFor(idOrSlug);
                    setError(toUserMessage(requestError));
                    setErrorStatus(Number(requestError?.status) || null);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [contentReloadVersion, idOrSlug]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setPassageError("");
        setPassageLoading(true);

        biblicalPassagesApi
            .listForContent(idOrSlug, { signal: controller.signal })
            .then((response) => {
                if (active) {
                    setPassages(response.items ?? []);
                    setPassagesLoadedFor(idOrSlug);
                }
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setPassages([]);
                    setPassagesLoadedFor(idOrSlug);
                    setPassageError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) {
                    setPassageLoading(false);
                }
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [idOrSlug, passageReloadVersion]);

    if (loading || contentLoadedFor !== idOrSlug) {
        return (
            <section className="page-section">
                <p role="status">A carregar conteúdo...</p>
            </section>
        );
    }

    if (error || !content) {
        if (errorStatus === 404) {
            return (
                <section className="page-section">
                    <EmptyState
                        title="Conteúdo não encontrado"
                        description="Este conteúdo não existe ou já não está publicado."
                        headingLevel={1}
                    >
                        <Link className="button-link" to="/catalogo">
                            Voltar ao catálogo
                        </Link>
                    </EmptyState>
                </section>
            );
        }

        return (
            <section className="page-section">
                <EmptyState
                    title="Conteúdo indisponível"
                    description={error || "Conteúdo não encontrado."}
                    headingLevel={1}
                    tone="error"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setContentReloadVersion((value) => value + 1)
                        }
                    >
                        Tentar novamente
                    </button>
                </EmptyState>
            </section>
        );
    }

    if (content.type === "episode" && detail?.canonicalPath) {
        return <Navigate replace to={detail.canonicalPath} />;
    }

    const playbackPath = `/ver/${encodeURIComponent(content.id)}`;
    const canUsePrivateActions = sessionStatus === "authenticated";
    const passagesAreLoading =
        passageLoading || passagesLoadedFor !== idOrSlug;
    const durationLabel = formatDuration(content.durationSeconds);
    const ageRatingLabel = formatAgeRating(content.ageRating);
    const credits = content.credits ?? {
        directors: [],
        creators: [],
        cast: [],
    };
    const hasCredits =
        credits.directors.length > 0 ||
        credits.creators.length > 0 ||
        credits.cast.length > 0;

    const firstEpisode = detail?.seasons?.[0]?.episodes?.[0] ?? null;
    const primaryAction = content.type === "series" ? (
        firstEpisode ? (
            <Link
                className="button-link content-detail-play-button"
                to={firstEpisode.canonicalPath}
            >
                Começar série
            </Link>
        ) : (
            <button className="content-detail-play-button" type="button" disabled>
                Em breve
            </button>
        )
    ) : !content.isPlayable ? (
        <button className="content-detail-play-button" type="button" disabled>
            Vídeo ainda não disponível
        </button>
    ) : sessionStatus === "loading" ? (
        <button className="content-detail-play-button" type="button" disabled>
            A confirmar sessão...
        </button>
    ) : sessionStatus === "unavailable" ? (
        <>
            <button className="content-detail-play-button" type="button" disabled>
                Sessão temporariamente indisponível
            </button>
            <button
                className="content-detail-session-retry"
                type="button"
                onClick={() => refreshSession?.().catch(() => {})}
            >
                Tentar confirmar sessão
            </button>
        </>
    ) : (
        <Link
            className="button-link content-detail-play-button"
            to={
                canUsePrivateActions
                    ? playbackPath
                    : buildLoginRedirectPath(playbackPath)
            }
        >
            {canUsePrivateActions ? "Reproduzir" : "Entrar para reproduzir"}
        </Link>
    );

    return (
        <article className="content-detail-page" data-testid="content-detail">
            <ContentDetailHero
                content={content}
                durationLabel={durationLabel}
                ageRatingLabel={ageRatingLabel}
                primaryAction={primaryAction}
            >
                <LibraryActions contentId={content.id} variant="hero" />
            </ContentDetailHero>

            <div className="content-detail-body">
                <section className="content-detail-about" aria-labelledby="content-about-heading">
                    <div className="content-detail-about-copy">
                        <p className="section-kicker">Sobre</p>
                        <h2 id="content-about-heading">Sobre este título</h2>
                        <p className="content-detail-full-synopsis">{content.synopsis}</p>
                    </div>
                    <aside className="content-detail-facts" aria-label="Ficha do título">
                        <dl>
                            {content.releaseYear ? (
                                <><dt>Ano</dt><dd>{content.releaseYear}</dd></>
                            ) : null}
                            {durationLabel ? (
                                <><dt>Duração</dt><dd>{durationLabel}</dd></>
                            ) : null}
                            {ageRatingLabel ? (
                                <><dt>Classificação</dt><dd>{ageRatingLabel}</dd></>
                            ) : null}
                            {(content.taxonomies ?? []).length > 0 ? (
                                <>
                                    <dt>Temas</dt>
                                    <dd>{content.taxonomies.map((taxonomy) => taxonomy.name).join(", ")}</dd>
                                </>
                            ) : null}
                            {credits.directors.length > 0 ? (
                                <><dt>Realização</dt><dd>{credits.directors.join(", ")}</dd></>
                            ) : null}
                            {credits.creators.length > 0 ? (
                                <><dt>Criação</dt><dd>{credits.creators.join(", ")}</dd></>
                            ) : null}
                        </dl>
                        {hasCredits && credits.cast.length > 0 ? (
                            <div className="content-detail-cast">
                                <h3>Elenco</h3>
                                <ul>
                                    {credits.cast.map((member, index) => (
                                        <li key={`${member.name}-${index}`}>
                                            <strong>{member.name}</strong>
                                            {member.role ? <span>{member.role}</span> : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </aside>
                </section>

                <RelatedContent contentId={content.id} />

                {content.type === "series" ? (
                    <SeriesEpisodesSection
                        content={content}
                        seasons={detail?.seasons ?? []}
                        sessionStatus={sessionStatus}
                    />
                ) : null}

                <section
                    className="content-detail-passages"
                    aria-labelledby="biblical-passages-heading"
                    data-testid="biblical-passages-section"
                >
                    <div className="content-detail-section-heading">
                        <p className="section-kicker">Reflexão</p>
                        <h2 id="biblical-passages-heading">Passagens bíblicas</h2>
                    </div>
                    {passagesAreLoading ? (
                        <p role="status">A carregar passagens bíblicas...</p>
                    ) : null}
                    {passageError ? (
                        <EmptyState
                            title="Não foi possível carregar as passagens"
                            description={passageError}
                            tone="error"
                        >
                            <button
                                type="button"
                                onClick={() => setPassageReloadVersion((value) => value + 1)}
                            >
                                Tentar novamente
                            </button>
                        </EmptyState>
                    ) : null}
                    {!passagesAreLoading && !passageError && passages.length === 0 ? (
                        <EmptyState
                            title="Sem passagens bíblicas associadas"
                            description="Este conteúdo ainda não tem referências bíblicas publicadas pela equipa editorial."
                        />
                    ) : null}
                    {!passagesAreLoading && !passageError && passages.length > 0 ? (
                        <div className="content-detail-passage-grid">
                            {passages.map((passage) => (
                                <article className="content-detail-passage" key={passage.id}>
                                    <p className="content-card-eyebrow">
                                        {passage.reference} · {passage.translation}
                                    </p>
                                    <h3>{passage.theme || "Reflexão bíblica"}</h3>
                                    <blockquote>{passage.text}</blockquote>
                                    {passage.reflection ? <p>{passage.reflection}</p> : null}
                                    {passage.note ? <p>{passage.note}</p> : null}
                                </article>
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="content-detail-community" aria-labelledby="content-community-heading">
                    <div className="content-detail-section-heading">
                        <p className="section-kicker">Comunidade</p>
                        <h2 id="content-community-heading">Opiniões da comunidade</h2>
                    </div>
                    <div className="content-detail-community-grid">
                        <RatingBox contentId={content.id} />
                        <CommentsPanel contentId={content.id} />
                    </div>
                </section>
            </div>
        </article>
    );
}

/**
 * Página canónica de um episódio dentro da respetiva série.
 *
 * Favoritos, watchlist, ratings e comentários ficam deliberadamente fora desta
 * página, porque pertencem ao agregador série.
 *
 * @returns {JSX.Element} Detalhe contextual e navegação anterior/seguinte.
 */
export function EpisodeContextPage() {
    const { seriesSlug, episodeSlug } = useParams();
    const { status: sessionStatus } = useSession();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errorStatus, setErrorStatus] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");
        setErrorStatus(null);
        setDetail(null);

        catalogApi
            .getDetail(episodeSlug, { signal: controller.signal })
            .then((response) => {
                if (!active) return;
                if (response?.content?.type !== "episode" || !response.series) {
                    setError("O episódio não está disponível neste contexto.");
                    return;
                }
                setDetail(response);
                setErrorStatus(null);
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                    setErrorStatus(Number(requestError?.status) || null);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [episodeSlug]);

    if (loading) {
        return <section className="page-section"><p role="status">A carregar episódio...</p></section>;
    }
    if (error || !detail?.content) {
        return (
            <section className="page-section">
                <EmptyState
                    title={errorStatus === 404 ? "Episódio não encontrado" : "Episódio indisponível"}
                    description={
                        errorStatus === 404
                            ? "Este episódio não existe ou já não está publicado."
                            : error || "Episódio não encontrado."
                    }
                    headingLevel={1}
                    tone={errorStatus === 404 ? "neutral" : "error"}
                >
                    <Link
                        className="button-link"
                        to={`/catalogo/${encodeURIComponent(seriesSlug)}`}
                    >
                        Voltar à série
                    </Link>
                </EmptyState>
            </section>
        );
    }

    if (detail.series.slug !== seriesSlug) {
        return <Navigate replace to={detail.canonicalPath} />;
    }

    const episode = detail.content;
    const playbackPath = `/ver/${encodeURIComponent(episode.id)}`;
    const seriesPath = `/catalogo/${encodeURIComponent(detail.series.slug)}`;

    return (
        <article className="page-section" data-testid="episode-context-detail">
            <nav aria-label="Contexto do episódio">
                <Link to={seriesPath}>{detail.series.title}</Link>
                <span>
                    {" "}· Temporada {episode.seasonNumber} · Episódio {episode.episodeNumber}
                </span>
            </nav>
            <p className="section-kicker">
                T{episode.seasonNumber} E{episode.episodeNumber}
            </p>
            <h1>{episode.title}</h1>
            <p>{episode.synopsis}</p>
            <dl className="meta-list">
                <dt>Duração</dt>
                <dd>{formatDuration(episode.durationSeconds)}</dd>
                <dt>Classificação</dt>
                <dd>{formatAgeRating(episode.ageRating)}</dd>
            </dl>
            <div className="button-row">
                {episode.isPlayable ? (
                    <Link
                        className="button-link"
                        to={
                            sessionStatus === "authenticated"
                                ? playbackPath
                                : buildLoginRedirectPath(playbackPath)
                        }
                    >
                        Reproduzir episódio
                    </Link>
                ) : (
                    <button type="button" disabled>Vídeo em preparação</button>
                )}
                <Link className="secondary-button" to={seriesPath}>
                    Voltar à série
                </Link>
            </div>
            <nav className="button-row" aria-label="Navegação entre episódios">
                {detail.previousEpisode ? (
                    <Link to={detail.previousEpisode.canonicalPath}>
                        Episódio anterior
                    </Link>
                ) : <span />}
                {detail.nextEpisode ? (
                    <Link to={detail.nextEpisode.canonicalPath}>
                        Episódio seguinte
                    </Link>
                ) : null}
            </nav>
            <RelatedContent contentId={detail.series.id} />
        </article>
    );
}
