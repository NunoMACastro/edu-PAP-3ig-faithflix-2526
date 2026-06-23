/**
 * @file Ficheiro `real_dev/frontend/src/components/discovery/DiscoveryCarousel.jsx` da implementação real_dev.
 */

import { Link } from "react-router-dom";

/**
 * Displays one horizontal discovery group.
 *
 * @param {{ title: string, items: Record<string, unknown>[] }} props - Carousel props.
 * @returns {JSX.Element} Discovery carousel.
 */
export function DiscoveryCarousel({ title, items }) {
    return (
        <section className="discovery-carousel" aria-label={title}>
            <h2>{title}</h2>
            {items.length === 0 ? (
                <p>Sem conteudos publicados para este grupo.</p>
            ) : null}
            <div className="content-row">
                {items.map((content) => (
                    <article className="content-tile" key={content.id}>
                        {content.posterUrl ? (
                            <img src={content.posterUrl} alt="" />
                        ) : null}
                        <p className="content-card-eyebrow">{content.type}</p>
                        <h3>{content.title}</h3>
                        {content.ratingAverage ? (
                            <p>Rating medio: {content.ratingAverage}</p>
                        ) : null}
                        <Link
                            className="button-link"
                            to={`/catalogo/${content.slug}`}
                        >
                            Ver detalhe
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
