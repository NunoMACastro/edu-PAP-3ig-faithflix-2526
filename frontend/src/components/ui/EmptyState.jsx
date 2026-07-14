/**
 * @file Estado vazio reutilizável para listas, erros, sucessos e permissões.
 */

import { useId } from "react";

/**
 * Mostra uma mensagem clara quando a página não tem dados úteis para listar.
 *
 * @param {{ title: string, description: string, children?: React.ReactNode, tone?: "neutral" | "error" | "success", headingLevel?: 1 | 2 }} props Propriedades do estado.
 * @param {string} props.title Título curto do estado.
 * @param {string} props.description Explicação orientada para o utilizador.
 * @param {React.ReactNode} [props.children] Ações opcionais, como links ou botões.
 * @param {"neutral" | "error" | "success"} [props.tone="neutral"] Tom visual do estado.
 * @param {1 | 2} [props.headingLevel=2] Nível do título; `1` é reservado a estados que substituem a página inteira.
 * @returns {JSX.Element} Secção acessível de estado.
 */
export function EmptyState({
    title,
    description,
    children,
    tone = "neutral",
    headingLevel = 2,
}) {
    const headingId = useId();
    const semanticRole = tone === "error" ? "alert" : tone === "success" ? "status" : undefined;
    const Heading = headingLevel === 1 ? "h1" : "h2";

    return (
        // O ID liga o título à secção para leitores de ecrã identificarem o estado.
        <section
            className={`empty-state empty-state-${tone}`}
            aria-labelledby={headingId}
            role={semanticRole}
        >
            <Heading id={headingId}>{title}</Heading>
            <p>{description}</p>
            {children ? <div className="empty-state-actions">{children}</div> : null}
        </section>
    );
}
