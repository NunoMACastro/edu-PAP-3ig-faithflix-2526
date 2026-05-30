import { useId } from "react";

export function EmptyState({ title, description, children }) {
    const headingId = useId();

    return (
        <section className="empty-state" aria-labelledby={headingId}>
            <h2 id={headingId}>{title}</h2>
            <p>{description}</p>
            {children ? (
                <div className="empty-state-actions">{children}</div>
            ) : null}
        </section>
    );
}