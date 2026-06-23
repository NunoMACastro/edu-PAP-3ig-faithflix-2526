/**
 * @file Ficheiro `real_dev/frontend/src/components/ui/ContentCard.jsx` da implementação real_dev.
 */

/**
 * Cartão informativo pequeno usado para conteúdo provisório controlado.
 *
 * @param {{ eyebrow?: string, title: string, description: string }} props - Propriedades do cartão.
 * @param {string} [props.eyebrow] - Etiqueta curta opcional apresentada acima do título.
 * @param {string} props.title - Título do cartão.
 * @param {string} props.description - Texto do corpo do cartão.
 * @returns {JSX.Element} Cartão informativo de conteúdo.
 */
export function ContentCard({ eyebrow, title, description }) {
    return (
        <article className="content-card">
            {eyebrow ? (
                <span className="content-card-eyebrow">{eyebrow}</span>
            ) : null}
            <h3>{title}</h3>
            <p>{description}</p>
        </article>
    );
}
