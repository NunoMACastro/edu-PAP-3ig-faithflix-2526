/**
 * @file Ficheiro `real_dev/frontend/src/components/ui/TextField.jsx` da implementação real_dev.
 */

/**
 * Campo de texto reutilizável com associação explícita entre label e input.
 *
 * @param {{ id: string, label: string, type?: string, value?: string, placeholder?: string, disabled?: boolean }} props - Propriedades do campo de texto.
 * @param {string} props.id - Id HTML usado para ligar etiqueta e input.
 * @param {string} props.label - Etiqueta visível do campo.
 * @param {string} [props.type="text"] - Tipo nativo do input.
 * @param {string} [props.value=""] - Valor atual do campo.
 * @param {string} [props.placeholder=""] - Placeholder apresentado quando o valor está vazio.
 * @param {boolean} [props.disabled=false] - Indica se o input está desativado.
 * @returns {JSX.Element} Par etiqueta/input.
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
