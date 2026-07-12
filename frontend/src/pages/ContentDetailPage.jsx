/**
 * @file Detalhe público de conteúdos e navegação contextual de episódios.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CommentsPanel } from "../components/comments/CommentsPanel.jsx";
import { RelatedContent } from "../components/discovery/RelatedContent.jsx";
import { LibraryActions } from "../components/library/LibraryActions.jsx";
import { RatingBox } from "../components/ratings/RatingBox.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { catalogApi } from "../services/api/catalogApi.js";
import { formatContentType } from "../utils/contentTypeLabels.js";

/**
 * Converte duração em segundos para minutos legíveis.
 *
 * @param {number | string | undefined} seconds Duração técnica.
 * @returns {string} Duração curta ou texto vazio.
 */
function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
}

/**
 * Apresenta referências bíblicas do conteúdo indicado.
 *
 * @param {{ idOrSlug: string }} props Propriedades do conteúdo.
 * @returns {JSX.Element} Secção editorial de passagens.
 */
function BiblicalPassagesSection({ idOrSlug }) {
    const [passages, setPassages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");
        setPassages([]);
        biblicalPassagesApi
            .listForContent(idOrSlug)
            .then((response) => {
                if (active) setPassages(response.items ?? []);
            })
            .catch((requestError) => {
                if (active) setError(requestError.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [idOrSlug]);

    return (
        <section aria-labelledby="biblical-passages-heading" data-testid="biblical-passages-section">
            <h2 id="biblical-passages-heading">Passagens bíblicas</h2>
            {loading ? <p role="status">A carregar passagens bíblicas...</p> : null}
            {error ? (
                <EmptyState title="Não foi possível carregar as passagens" description={error} tone="error" />
            ) : null}
            {!loading && !error && passages.length === 0 ? (
                <EmptyState
                    title="Sem passagens bíblicas associadas"
                    description="Este conteúdo ainda não tem referências bíblicas publicadas pela equipa editorial."
                />
            ) : null}
            {!error && passages.length > 0 ? (
                <div className="content-grid">
                    {passages.map((passage) => (
                        <article className="content-card" key={passage.id}>
                            <p className="content-card-eyebrow">
                                {passage.reference} · {passage.translation}
                            </p>
                            <h3>{passage.theme || "Reflexão bíblica"}</h3>
                            <p>{passage.text}</p>
                            {passage.reflection ? <p>{passage.reflection}</p> : null}
                            {passage.note ? <p>{passage.note}</p> : null}
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

/**
 * Mostra a ficha comum de filme ou documentário.
 *
 * @param {{ content: Record<string, unknown> }} props Conteúdo público.
 * @returns {JSX.Element} Detalhe reproduzível autónomo.
 */
function StandaloneContentDetail({ content }) {
    return (
        <section className="page-section" data-testid="content-detail">
            {content.assets?.backdropUrl || content.assets?.posterUrl ? (
                <img className="detail-media" src={content.assets.backdropUrl || content.assets.posterUrl} alt="" />
            ) : null}
            <p className="section-kicker">{formatContentType(content.type)}</p>
            <h1>{content.title}</h1>
            <p>{content.synopsis}</p>
            <dl className="meta-list">
                <dt>Duração</dt>
                <dd>{formatDuration(content.durationSeconds)}</dd>
                <dt>Classificação</dt>
                <dd>{content.ageRating}+</dd>
            </dl>
            <div className="button-row">
                <Link className="button-link" to={`/ver/${content.id}`}>Reproduzir</Link>
            </div>
            <LibraryActions contentId={content.id} />
            <RatingBox contentId={content.id} />
            <BiblicalPassagesSection idOrSlug={content.id} />
            <CommentsPanel contentId={content.id} />
            <RelatedContent contentId={content.id} />
        </section>
    );
}

/**
 * Mostra uma série como agregado e permite escolher temporada e episódio.
 *
 * @param {{ content: Record<string, unknown>, seasons: Record<string, unknown>[] }} props Resposta de série.
 * @returns {JSX.Element} Página pública da série.
 */
function SeriesDetail({ content, seasons }) {
    const [seasonNumber, setSeasonNumber] = useState(seasons[0]?.seasonNumber ?? null);
    const selectedSeason =
        seasons.find((season) => season.seasonNumber === seasonNumber) ?? seasons[0];
    const firstEpisode = seasons[0]?.episodes?.[0];

    return (
        <section className="page-section" data-testid="series-detail">
            {content.assets?.backdropUrl || content.assets?.posterUrl ? (
                <img className="detail-media" src={content.assets.backdropUrl || content.assets.posterUrl} alt="" />
            ) : null}
            <p className="section-kicker">Série</p>
            <h1>{content.title}</h1>
            <p>{content.synopsis}</p>
            <dl className="meta-list">
                <dt>Temporadas</dt>
                <dd>{content.seasonCount}</dd>
                <dt>Episódios</dt>
                <dd>{content.episodeCount}</dd>
                <dt>Duração total</dt>
                <dd>{formatDuration(content.totalDurationSeconds) || "Em breve"}</dd>
                <dt>Classificação</dt>
                <dd>{content.ageRating}+</dd>
            </dl>
            {firstEpisode ? (
                <div className="button-row">
                    <Link className="button-link" to={`/ver/${firstEpisode.id}`}>Começar série</Link>
                </div>
            ) : (
                <EmptyState
                    title="Em breve"
                    description="Esta série está publicada, mas ainda não tem episódios disponíveis."
                />
            )}
            <LibraryActions contentId={content.id} />
            <RatingBox contentId={content.id} />
            {seasons.length > 0 ? (
                <section aria-labelledby="series-episodes-heading">
                    <div className="catalog-section-header">
                        <h2 id="series-episodes-heading">Episódios</h2>
                        <label>
                            Temporada
                            <select
                                value={selectedSeason?.seasonNumber ?? ""}
                                onChange={(event) => setSeasonNumber(Number(event.target.value))}
                            >
                                {seasons.map((season) => (
                                    <option key={season.seasonNumber} value={season.seasonNumber}>
                                        Temporada {season.seasonNumber}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="content-grid">
                        {(selectedSeason?.episodes ?? []).map((episode) => (
                            <article className="content-card" key={episode.id}>
                                <p className="content-card-eyebrow">
                                    T{episode.seasonNumber} E{episode.episodeNumber}
                                </p>
                                <h3>{episode.title}</h3>
                                <p>{episode.synopsis}</p>
                                <p>{formatDuration(episode.durationSeconds)} · {episode.ageRating}+</p>
                                <div className="button-row">
                                    <Link
                                        className="button-link"
                                        to={`/catalogo/${encodeURIComponent(content.slug)}/episodios/${encodeURIComponent(episode.slug)}`}
                                    >
                                        Ver episódio
                                    </Link>
                                    <Link className="secondary-button" to={`/ver/${episode.id}`}>Reproduzir</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}
            <BiblicalPassagesSection idOrSlug={content.id} />
            <CommentsPanel contentId={content.id} />
            <RelatedContent contentId={content.id} />
        </section>
    );
}

/**
 * Resolve a página genérica e canonicaliza links antigos de episódios.
 *
 * @returns {JSX.Element} Detalhe ou redirecionamento contextual.
 */
export function ContentDetailPage() {
    const { idOrSlug } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        catalogApi
            .getDetail(idOrSlug)
            .then((response) => {
                if (active) setDetail(response);
            })
            .catch((requestError) => {
                if (active) setError(requestError.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [idOrSlug]);

    if (loading) return <section className="page-section"><p role="status">A carregar conteúdo...</p></section>;
    if (error || !detail?.content) {
        return <section className="page-section"><h1>Conteúdo indisponível</h1><p>{error || "Conteúdo não encontrado."}</p></section>;
    }
    if (detail.content.type === "episode") {
        return <Navigate replace to={detail.canonicalPath} />;
    }
    if (detail.content.type === "series") {
        return <SeriesDetail content={detail.content} seasons={detail.seasons ?? []} />;
    }

    return <StandaloneContentDetail content={detail.content} />;
}

/**
 * Mostra um episódio apenas dentro da série indicada no URL.
 *
 * @returns {JSX.Element} Detalhe contextual do episódio.
 */
export function EpisodeContextPage() {
    const { seriesSlug, episodeSlug } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        catalogApi
            .getDetail(seriesSlug)
            .then((response) => {
                if (active) setDetail(response);
            })
            .catch((requestError) => {
                if (active) setError(requestError.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [seriesSlug]);

    const episodes = useMemo(
        () => (detail?.seasons ?? []).flatMap((season) => season.episodes ?? []),
        [detail],
    );
    const episode = episodes.find((item) => item.slug === episodeSlug);

    if (loading) return <section className="page-section"><p role="status">A carregar episódio...</p></section>;
    if (error || !detail?.content || !episode) {
        return <section className="page-section"><h1>Episódio indisponível</h1><p>{error || "O episódio não pertence a esta série ou não está publicado."}</p></section>;
    }

    const series = detail.content;
    return (
        <section className="page-section" data-testid="episode-context-detail">
            <nav aria-label="Contexto do episódio">
                <Link to={`/catalogo/${encodeURIComponent(series.slug)}`}>{series.title}</Link>
                <span> · Temporada {episode.seasonNumber} · Episódio {episode.episodeNumber}</span>
            </nav>
            <p className="section-kicker">T{episode.seasonNumber} E{episode.episodeNumber}</p>
            <h1>{episode.title}</h1>
            <p>{episode.synopsis}</p>
            <dl className="meta-list">
                <dt>Duração</dt><dd>{formatDuration(episode.durationSeconds)}</dd>
                <dt>Classificação</dt><dd>{episode.ageRating}+</dd>
            </dl>
            <div className="button-row">
                <Link className="button-link" to={`/ver/${episode.id}`}>Reproduzir episódio</Link>
                <Link className="secondary-button" to={`/catalogo/${encodeURIComponent(series.slug)}`}>Voltar à série</Link>
            </div>
            <BiblicalPassagesSection idOrSlug={episode.id} />
            <RelatedContent contentId={series.id} />
        </section>
    );
}
