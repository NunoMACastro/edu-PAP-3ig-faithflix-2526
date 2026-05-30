export function TextField({
    id,
    label,
    type = "text",
    value = "",
    placeholder = "",
    disabled = false,
}) {
    return (
        <label className="text-field" htmlFor={id}>
            <span>{label}</span>
            <input
                disabled={disabled}
                id={id}
                placeholder={placeholder}
                type={type}
                value={value}
                readOnly
            />
        </label>
    );
}