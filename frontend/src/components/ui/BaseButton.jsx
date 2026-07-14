/**
 * @file Ficheiro `real_dev/frontend/src/components/ui/BaseButton.jsx` da implementação real_dev.
 */

/**
 * Botão genérico usado em ações consistentes da aplicação.
 *
 * @param {{ children: React.ReactNode, type?: "button" | "submit" | "reset", variant?: string, disabled?: boolean, onClick?: React.MouseEventHandler<HTMLButtonElement> }} props - Propriedades do botão.
 * @param {React.ReactNode} props.children - Conteúdo visível do botão.
 * @param {"button" | "submit" | "reset"} [props.type="button"] - Tipo nativo do botão.
 * @param {string} [props.variant="primary"] - Sufixo de variante visual usado no CSS.
 * @param {boolean} [props.disabled=false] - Indica se o botão está desativado.
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick] - Gestor opcional de clique.
 * @returns {JSX.Element} Elemento de botão estilizado.
 */
export function BaseButton({
    children,
    type = "button",
    variant = "primary",
    disabled = false,
    onClick,
}) {
    return (
        <button
            className={`base-button base-button-${variant}`}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
}
