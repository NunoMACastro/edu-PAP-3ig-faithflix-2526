/**
 * @file Ficheiro `real_dev/frontend/src/components/ui/EmptyState.jsx` da implementação real_dev.
 */

import { useId } from "react";

/**
 * Estado vazio reutilizável para páginas cujas funcionalidades chegam em BKs posteriores.
 *
 * @param {{ title: string, description: string, children?: React.ReactNode }} props - Propriedades do estado vazio.
 * @param {string} props.title - Título do estado vazio.
 * @param {string} props.description - Explicação apresentada ao utilizador.
 * @param {React.ReactNode} [props.children] - Área opcional de ação.
 * @returns {JSX.Element} Secção acessível de estado vazio.
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
