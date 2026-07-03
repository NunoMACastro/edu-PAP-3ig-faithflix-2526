/**
 * @file Painel de exportação de dados do utilizador.
 */

import { useState } from "react";
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

    /**
     * Pede a exportação ao backend e descarrega o JSON localmente.
     *
     * @returns {Promise<void>} Termina quando o pedido foi tratado.
     */
    async function handleExport() {
        setLoading(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.exportMyData();
            downloadJson(response.export);
            setStatus("Exportação preparada.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-panel">
            <h2>Exportar dados</h2>
            <p>Descarrega um ficheiro JSON com os dados associados à tua conta.</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button type="button" onClick={handleExport} disabled={loading}>
                {loading ? "A preparar..." : "Descarregar JSON"}
            </button>
        </section>
    );
}
