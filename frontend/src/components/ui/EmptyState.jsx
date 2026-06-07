import { useId } from "react";

/**
 * Reusable empty state for pages whose real features arrive in later BKs.
 *
 * @param {{ title: string, description: string, children?: React.ReactNode }} props - Empty state props.
 * @param {string} props.title - Empty state title.
 * @param {string} props.description - Explanation shown to the user.
 * @param {React.ReactNode} [props.children] - Optional action area.
 * @returns {JSX.Element} Accessible empty state section.
 */
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
