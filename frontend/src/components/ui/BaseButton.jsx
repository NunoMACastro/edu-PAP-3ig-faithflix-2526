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