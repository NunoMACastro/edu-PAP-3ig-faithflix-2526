/**
 * Read-only text field preview used before real forms exist in MF2.
 *
 * @param {{ id: string, label: string, type?: string, value?: string, placeholder?: string, disabled?: boolean }} props - Text field props.
 * @param {string} props.id - HTML id used to connect label and input.
 * @param {string} props.label - Visible field label.
 * @param {string} [props.type="text"] - Native input type.
 * @param {string} [props.value=""] - Current field value.
 * @param {string} [props.placeholder=""] - Placeholder shown when the value is empty.
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @returns {JSX.Element} Label and input pair.
 */
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
