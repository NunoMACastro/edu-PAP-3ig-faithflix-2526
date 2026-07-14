/** @file Ações editoriais persistentes no limite inferior da página. */

/**
 * @param {{busy: boolean, dirty?: boolean, submitLabel: string, onCancel: () => void}} props Propriedades das ações.
 * @returns {JSX.Element} Barra de ações do formulário.
 */
export function StickyFormActions({ busy, dirty = false, submitLabel, onCancel }) {
    return (
        <div className="catalog-sticky-actions">
            <p role="status">{dirty ? "Alterações por guardar" : "Sem alterações pendentes"}</p>
            <div className="button-row">
                <button type="button" disabled={busy} onClick={onCancel}>Cancelar</button>
                <button type="submit" disabled={busy || !dirty}>
                    {busy ? "A guardar…" : submitLabel}
                </button>
            </div>
        </div>
    );
}
