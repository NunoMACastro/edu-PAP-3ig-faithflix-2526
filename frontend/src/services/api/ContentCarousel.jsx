import { Link } from "react-router-dom";

export function ContentCarousel({ title, items }) {
  if (items.length === 0) return null;

  return (
    <section className="content-carousel" aria-label={title}>
      <h2>{title}</h2>
      <ul className="carousel-row">
        {items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {item.posterUrl && <img src={item.posterUrl} alt="" />}
              <h3>{item.title}</h3>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}