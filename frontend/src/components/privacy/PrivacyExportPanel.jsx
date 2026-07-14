/**
 * @file Painel de exportação de dados do utilizador.
 */

import { useEffect, useRef, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { privacyApi } from "../../services/api/privacyApi.js";

/**
 * Cria e descarrega um ficheiro JSON no browser.
 *
 * @param {Record<string, unknown>} data Dados a escrever.
 * @returns {void}
 */
function downloadJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `faithflix-dados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Renderiza o fluxo de exportação RGPD.
 *
 * @returns {JSX.Element} Painel de exportacao.
 */
export function PrivacyExportPanel() {
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const mountedRef = useRef(false);
    const loadingRef = useRef(false);
    const controllerRef = useRef(null);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            controllerRef.current?.abort();
        };
    }, []);

    /**
     * Pede a exportação ao backend e descarrega o JSON localmente.
     *
     * @returns {Promise<void>} Termina quando o pedido foi tratado.
     */
    async function handleExport() {
        if (loadingRef.current) return;

        const controller = new AbortController();
        loadingRef.current = true;
        controllerRef.current = controller;
        setLoading(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.exportMyData({
                signal: controller.signal,
            });

            if (!mountedRef.current || controllerRef.current !== controller) {
                return;
            }

            downloadJson(response.export);
            setStatus("Exportação preparada.");
        } catch (requestError) {
            if (
                mountedRef.current &&
                controllerRef.current === controller &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setError(toUserMessage(requestError));
            }
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                loadingRef.current = false;

                if (mountedRef.current) setLoading(false);
            }
        }
    }

    return (
        <section className="form-panel" aria-busy={loading}>
            <h2>Exportar dados</h2>
            <p>Obtém uma cópia dos dados associados à tua conta.</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button type="button" onClick={handleExport} disabled={loading}>
                {loading ? "A preparar..." : "Descarregar dados"}
            </button>
        </section>
    );
}
