/**
 * @file Card reutilizável para listas de conteúdo e entidades públicas.
 */

import { Link } from "react-router-dom";

/**
 * Mostra um card com imagem opcional, badge, título, descrição, metadados e ação.
 *
 * @param {{ eyebrow?: string, title: string, description?: string, imageUrl?: string, imageAlt?: string, meta?: string, to?: string, actionLabel?: string }} props Propriedades do card.
 * @param {string} [props.eyebrow] Etiqueta curta apresentada antes do título.
 * @param {string} props.title Título principal visível no card.
 * @param {string} [props.description] Texto descritivo curto.
 * @param {string} [props.imageUrl] URL da imagem do card.
 * @param {string} [props.imageAlt] Texto alternativo da imagem.
 * @param {string} [props.meta] Informação complementar, como categoria, preço ou data.
 * @param {string} [props.to] Rota interna usada pela ação.
 * @param {string} [props.actionLabel="Ver detalhe"] Texto da ação.
 * @returns {JSX.Element} Card acessível e reutilizável.
 */
export function ContentCard({
  eyebrow,
  title,
  description,
  imageUrl,
  imageAlt = "",
  meta,
  to,
  actionLabel = "Ver detalhe",
}) {
  return (
    <article className="content-card">
      {imageUrl ? (
        // O alt fica contextual quando a imagem acrescenta informação; vazio quando for decorativa.
        <img className="content-card-image" src={imageUrl} alt={imageAlt} />
      ) : null}
      {eyebrow ? <span className="content-card-eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {meta ? <p className="content-card-meta">{meta}</p> : null}
      {to ? (
        // Link preserva o routing SPA e evita recarregar sessão, contexto e estado global.
        <Link className="button-link" to={to}>
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}