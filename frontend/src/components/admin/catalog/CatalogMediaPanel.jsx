/** @file Gestão isolada de ficheiros MP4 privados do conteúdo selecionado. */

import { useEffect, useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog.jsx";
import { EmptyState } from "../../ui/EmptyState.jsx";
import { catalogApi } from "../../../services/api/catalogApi.js";
import { toUserMessage } from "../../../services/api/apiErrors.js";

const MAX_BYTES = 512 * 1024 * 1024;
const QUALITY = ["480p", "720p", "1080p", "2160p"];
const STATUS = { pending: "A aguardar envio", uploading: "A receber", uploaded: "Pronto para ativar", ready: "Ativo", failed: "Falhou", aborted: "Descartado", superseded: "Substituído" };

/** @param {unknown} value Tamanho em bytes. @returns {string} Valor legível. */
function sizeLabel(value) {
    return Number.isSafeInteger(value) && value > 0
        ? `${(value / (1024 * 1024)).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} MiB`
        : "tamanho pendente";
}

/** @param {File | null} file Ficheiro local. @returns {string} Erro local ou vazio. */
function validateFile(file) {
    if (!file) return "Seleciona um ficheiro MP4.";
    if (file.type && file.type !== "video/mp4") return "O ficheiro selecionado tem de ser MP4.";
    if (!file.type && !file.name.toLowerCase().endsWith(".mp4")) return "O ficheiro tem de usar a extensão .mp4.";
    if (!Number.isSafeInteger(file.size) || file.size < 1) return "O ficheiro MP4 está vazio ou é inválido.";
    if (file.size > MAX_BYTES) return "O ficheiro MP4 não pode exceder 512 MiB.";
    return "";
}

/**
 * @param {{content: Record<string, any>, onChanged: () => Promise<void> | void}} props Propriedades do painel.
 * @returns {JSX.Element} Fluxo de upload, ativação e descarte.
 */
export function CatalogMediaPanel({ content, onChanged }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [quality, setQuality] = useState("1080p");
    const [file, setFile] = useState(null);
    const [discard, setDiscard] = useState(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        catalogApi.listMediaAssets(content.id, { signal: controller.signal })
            .then((response) => setItems(response.items ?? []))
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [content.id, reload]);

    async function refresh() {
        await onChanged();
        setReload((value) => value + 1);
    }

    async function upload(event) {
        event.preventDefault();
        const formElement = event.currentTarget;
        const validationError = validateFile(file);
        if (validationError) return setError(validationError);
        setBusy(true);
        setError("");
        let uploadId = "";
        let uploaded = false;
        try {
            const created = await catalogApi.createMediaUpload(content.id, { quality, mimeType: "video/mp4", expectedSizeBytes: file.size });
            uploadId = created?.asset?.id;
            if (!uploadId) throw new Error("Resposta de media inválida.");
            await catalogApi.uploadMediaFile(content.id, uploadId, file);
            uploaded = true;
            await catalogApi.activateMediaUpload(content.id, uploadId, content.version);
            setFile(null);
            formElement.reset();
            await refresh();
        } catch (requestError) {
            if (uploadId && !uploaded) await catalogApi.abortMediaUpload(content.id, uploadId).catch(() => undefined);
            setError(requestError?.code === "CONTENT_VERSION_CONFLICT" ? "O ficheiro ficou pronto, mas o conteúdo mudou. Recarrega antes de o ativar." : toUserMessage(requestError));
            setReload((value) => value + 1);
        } finally {
            setBusy(false);
        }
    }

    async function activate(asset) {
        setBusy(true); setError("");
        try { await catalogApi.activateMediaUpload(content.id, asset.id, content.version); await refresh(); }
        catch (requestError) { setError(toUserMessage(requestError)); }
        finally { setBusy(false); }
    }

    async function discardAsset() {
        setBusy(true); setError("");
        try { await catalogApi.abortMediaUpload(content.id, discard.id); setDiscard(null); await refresh(); }
        catch (requestError) { setError(toUserMessage(requestError)); }
        finally { setBusy(false); }
    }

    return (
        <section className="catalog-tool-panel" aria-labelledby="media-panel-title">
            <div className="catalog-tool-header"><div><p className="section-kicker">Ficheiros privados</p><h2 id="media-panel-title">Media</h2></div><button type="button" disabled={loading || busy} onClick={() => setReload((value) => value + 1)}>Atualizar</button></div>
            <form className="catalog-media-upload app-form app-form--contained" onSubmit={upload}>
                <fieldset disabled={busy}><legend>Novo ficheiro MP4</legend><div className="catalog-compact-grid"><label>Qualidade declarada<select value={quality} onChange={(event) => setQuality(event.target.value)}>{QUALITY.map((value) => <option key={value}>{value}</option>)}</select></label><label>Ficheiro MP4<input required accept="video/mp4,.mp4" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label></div><button type="submit">{busy ? "A processar…" : "Enviar e ativar"}</button></fieldset>
            </form>
            {loading ? <p role="status">A carregar ficheiros…</p> : null}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {!loading && !items.length ? <EmptyState title="Sem ficheiros" description="Ainda não existem assets de media para este conteúdo." /> : null}
            {items.length ? <ul className="media-asset-list">{items.map((asset) => <li key={asset.id}><div><strong>{asset.quality}</strong><span>{STATUS[asset.status] ?? asset.status} · {sizeLabel(asset.sizeBytes)}</span></div><div className="button-row">{asset.status === "uploaded" ? <button type="button" disabled={busy} onClick={() => activate(asset)}>Ativar</button> : null}{["pending", "uploading", "uploaded", "failed"].includes(asset.status) ? <button type="button" disabled={busy} onClick={() => setDiscard(asset)}>Descartar</button> : null}</div></li>)}</ul> : null}
            <ConfirmDialog open={Boolean(discard)} title="Descartar ficheiro MP4" confirmLabel="Descartar" danger busy={busy} onCancel={() => !busy && setDiscard(null)} onConfirm={discardAsset}><p>O ficheiro {discard?.quality} será removido. Esta ação não altera os metadados editoriais.</p></ConfirmDialog>
        </section>
    );
}
