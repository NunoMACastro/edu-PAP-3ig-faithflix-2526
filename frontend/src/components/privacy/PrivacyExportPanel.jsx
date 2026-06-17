// real_dev/frontend/src/components/privacy/PrivacyExportPanel.jsx
import { useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

/**
 * Painel de exportação de dados pessoais da conta autenticada.
 *
 * @returns {JSX.Element} Interface de pedido de exportação.
 */
export function PrivacyExportPanel() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Pede a exportação e cria um ficheiro JSON no browser.
     *
     * @returns {Promise<void>} Termina quando o ficheiro é preparado.
     */
    async function handleExport() {
        setLoading(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.exportMyData();
            const json = JSON.stringify(response.export, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `faithflix-export-${response.export.generatedAt}.json`;
            link.click();
            URL.revokeObjectURL(url);

            setStatus("Exportação preparada com sucesso.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-panel" aria-labelledby="privacy-export-title">
            <h2 id="privacy-export-title">Exportar dados</h2>
            <p>
                Descarrega um ficheiro JSON com os dados associados à tua conta
                FaithFlix.
            </p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button type="button" onClick={handleExport} disabled={loading}>
                {loading ? "A preparar exportação..." : "Exportar dados"}
            </button>
        </section>
    );
}