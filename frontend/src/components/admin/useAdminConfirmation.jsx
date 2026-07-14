/**
 * @file Promise de confirmação suportada por diálogo nativo acessível.
 */

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog.jsx";

/**
 * Permite migrar handlers assíncronos sem voltar a usar `window.confirm`.
 *
 * @returns {{ requestConfirmation: (options: { title: string, message: string, confirmLabel?: string, danger?: boolean }) => Promise<boolean>, confirmationDialog: JSX.Element }} API do diálogo.
 */
export function useAdminConfirmation() {
    const [request, setRequest] = useState(null);
    const resolverRef = useRef(null);

    useEffect(() => () => resolverRef.current?.(false), []);

    function settle(result) {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setRequest(null);
    }

    function requestConfirmation(options) {
        resolverRef.current?.(false);
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setRequest(options);
        });
    }

    return {
        requestConfirmation,
        confirmationDialog: (
            <ConfirmDialog
                open={Boolean(request)}
                title={request?.title ?? "Confirmar ação"}
                confirmLabel={request?.confirmLabel ?? "Confirmar"}
                danger={request?.danger === true}
                onCancel={() => settle(false)}
                onConfirm={() => settle(true)}
            >
                <p>{request?.message}</p>
            </ConfirmDialog>
        ),
    };
}
