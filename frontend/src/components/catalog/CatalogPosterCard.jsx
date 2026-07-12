/**
 * @file Card cinematográfico exclusivo da grelha pública de catálogo.
 */

import { Link } from "react-router-dom";

/**
 * Apresenta um cartaz integralmente clicável, com metadados curtos e uma ação
 * visual que também fica disponível através do foco por teclado.
 *
 * @param {{ title: string, eyebrow?: string, imageUrl?: string, imageAlt?: string, meta?: string, description?: string, to: string }} props Propriedades públicas do card.
 * @param {string} props.title Título público do conteúdo.
 * @param {string} [props.eyebrow] Tipo de conteúdo apresentado sobre o cartaz.
 * @param {string} [props.imageUrl] URL pública do cartaz.
 * @param {string} [props.imageAlt] Alternativa textual da imagem.
 * @param {string} [props.meta] Linha curta de metadados.
 * @param {string} [props.description] Descrição curta opcional para contextos de pesquisa.
 * @param {string} props.to Rota interna do detalhe.
 * @returns {JSX.Element} Card de catálogo acessível.
 */
export function CatalogPosterCard({
    title,
    eyebrow,
    imageUrl,
    imageAlt = "",
    meta,
    description,
    to,
}) {
    return (
        <article className="catalog-poster-card">
            <Link
                className="catalog-poster-link"
                to={to}
                aria-label={`Ver detalhe: ${title}`}
            >
                <span className="catalog-poster-frame">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={imageAlt}
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <span className="catalog-poster-fallback" aria-hidden="true">
                            {title}
                        </span>
                    )}
                    <span className="catalog-poster-shade" aria-hidden="true" />
                    {eyebrow ? (
                        <span className="catalog-poster-eyebrow">{eyebrow}</span>
                    ) : null}
                    <span className="catalog-poster-action" aria-hidden="true">
                        Ver detalhe
                    </span>
                </span>
                <span className="catalog-poster-copy">
                    <strong>{title}</strong>
                    {meta ? (
                        <span className="catalog-poster-meta">{meta}</span>
                    ) : null}
                    {description ? (
                        <span className="catalog-poster-description">
                            {description}
                        </span>
                    ) : null}
                </span>
            </Link>
        </article>
    );
}
