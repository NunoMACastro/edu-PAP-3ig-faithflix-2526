/**
 * Generic button used by MF1 pages and future forms.
 *
 * @param {{ children: React.ReactNode, type?: "button" | "submit" | "reset", variant?: string, disabled?: boolean, onClick?: React.MouseEventHandler<HTMLButtonElement> }} props - Button props.
 * @param {React.ReactNode} props.children - Visible button content.
 * @param {"button" | "submit" | "reset"} [props.type="button"] - Native button type.
 * @param {string} [props.variant="primary"] - Visual variant suffix used in CSS.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick] - Optional click handler.
 * @returns {JSX.Element} Styled button element.
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
