/**
 * @file Diálogo nativo para confirmação de mutações administrativas críticas.
 */

import { useEffect, useId, useRef } from "react";

/**
 * Mantém Escape, foco inicial em Cancelar e restituição de foco sem dependências.
 *
 * @param {{ open: boolean, title: string, eyebrow?: string, confirmLabel?: string, cancelLabel?: string, showCancel?: boolean, size?: "compact" | "standard" | "wide", busy?: boolean, danger?: boolean, initialFocusRef?: React.RefObject<HTMLElement>, onCancel: () => void, onConfirm: () => void, children: React.ReactNode }} props Propriedades do diálogo.
 * @returns {JSX.Element} Confirmação modal acessível.
 */
export function ConfirmDialog({
    open,
    title,
    eyebrow,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    showCancel = true,
    size = "standard",
    busy = false,
    danger = false,
    initialFocusRef,
    onCancel,
    onConfirm,
    children,
}) {
    const titleId = useId();
    const bodyId = useId();
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);
    const confirmRef = useRef(null);
    const restoreFocusRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            restoreFocusRef.current = document.activeElement;
            if (typeof dialog.showModal === "function") {
                dialog.showModal();
            } else {
                dialog.setAttribute("open", "");
            }
            requestAnimationFrame(() =>
                (
                    initialFocusRef?.current ??
                    (showCancel ? cancelRef.current : confirmRef.current)
                )?.focus(),
            );
        } else if (!open && dialog.open) {
            if (typeof dialog.close === "function") {
                dialog.close();
            } else {
                dialog.removeAttribute("open");
                restoreFocus();
            }
        }
    }, [initialFocusRef, open, showCancel]);

    function restoreFocus() {
        if (restoreFocusRef.current instanceof HTMLElement) {
            restoreFocusRef.current.focus();
        }
        restoreFocusRef.current = null;
    }

    return (
        <dialog
            ref={dialogRef}
            className={`app-dialog confirm-dialog confirm-dialog-${size}${danger ? " confirm-dialog-danger" : ""}`}
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            onCancel={(event) => {
                event.preventDefault();
                if (!busy) onCancel();
            }}
            onClose={restoreFocus}
        >
            <div className="confirm-dialog-content" aria-busy={busy}>
                <header className="confirm-dialog-header">
                    <span className="confirm-dialog-symbol" aria-hidden="true">
                        {danger ? "!" : "✓"}
                    </span>
                    <div>
                        <p className="confirm-dialog-eyebrow">
                            {eyebrow ?? (danger ? "Ação sensível" : "Confirmação")}
                        </p>
                        <h2 id={titleId}>{title}</h2>
                    </div>
                </header>
                <div className="confirm-dialog-body" id={bodyId}>{children}</div>
                <div className="button-row confirm-dialog-actions">
                    {showCancel ? (
                        <button
                            ref={cancelRef}
                            className="confirm-dialog-cancel"
                            type="button"
                            disabled={busy}
                            onClick={onCancel}
                        >
                            {cancelLabel}
                        </button>
                    ) : null}
                    <button
                        ref={confirmRef}
                        className={danger ? "danger-button" : ""}
                        type="button"
                        disabled={busy}
                        onClick={onConfirm}
                    >
                        {busy ? "A processar…" : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
