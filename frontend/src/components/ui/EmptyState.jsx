/**
 * @file Estado vazio reutilizável para listas, erros, sucessos e permissões.
 */

import { useId } from "react";

/**
 * Mostra uma mensagem clara quando a página não tem dados úteis para listar.
 *
 * @param {{ title: string, description: string, children?: React.ReactNode, tone?: "neutral" | "error" | "success" }} props Propriedades do estado.
 * @param {string} props.title Título curto do estado.
 * @param {string} props.description Explicação orientada para o utilizador.
 * @param {React.ReactNode} [props.children] Ações opcionais, como links ou botões.
 * @param {"neutral" | "error" | "success"} [props.tone="neutral"] Tom visual do estado.
 * @returns {JSX.Element} Secção acessível de estado.
 */
export function EmptyState({ title, description, children, tone = "neutral" }) {
    const headingId = useId();
    const semanticRole = tone === "error" ? "alert" : tone === "success" ? "status" : undefined;

    return (
        // O ID liga o título à secção para leitores de ecrã identificarem o estado.
        <section
            className={`empty-state empty-state-${tone}`}
            aria-labelledby={headingId}
            role={semanticRole}
        >
            <h2 id={headingId}>{title}</h2>
            <p>{description}</p>
            {children ? <div className="empty-state-actions">{children}</div> : null}
        </section>
    );
}
