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