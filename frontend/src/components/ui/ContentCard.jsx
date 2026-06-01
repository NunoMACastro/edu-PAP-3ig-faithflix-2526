/**
 * Small informational card used to show controlled placeholder content.
 *
 * @param {{ eyebrow?: string, title: string, description: string }} props - Card props.
 * @param {string} [props.eyebrow] - Optional short label shown above the title.
 * @param {string} props.title - Card title.
 * @param {string} props.description - Card body text.
 * @returns {JSX.Element} Informational content card.
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
