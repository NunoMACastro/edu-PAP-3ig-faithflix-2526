/** @file Histórico editorial carregado apenas quando a secção é aberta. */

import { useEffect, useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog.jsx";
import { EmptyState } from "../../ui/EmptyState.jsx";
import { catalogApi } from "../../../services/api/catalogApi.js";
import { toUserMessage } from "../../../services/api/apiErrors.js";

const ACTIONS = {
    create: "Conteúdo criado",
    update: "Conteúdo editado",
    published: "Conteúdo publicado",
    draft: "Movido para rascunho",
    archived: "Conteúdo arquivado",
    revert: "Revisão reposta",
};

/**
 * @param {{content: Record<string, any>, onChanged: () => Promise<void> | void}} props Propriedades do painel.
 * @returns {JSX.Element} Lista paginada inicial de revisões.
 */
export function CatalogRevisionPanel({ content, onChanged }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [busy, setBusy] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        catalogApi.listRevisions(content.id, { page: 1, limit: 50 }, { signal: controller.signal })
            .then((response) => setItems(response.items ?? []))
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [content.id, reload]);

    async function revert() {
        setBusy(true);
        setError("");
        try {
            await catalogApi.revertRevision(content.id, selected.id, content.version);
            setSelected(null);
            await onChanged();
            setReload((value) => value + 1);
        } catch (requestError) {
            setError(toUserMessage(requestError));
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="catalog-tool-panel" aria-labelledby="revision-panel-title">
            <div className="catalog-tool-header">
                <div><p className="section-kicker">Histórico</p><h2 id="revision-panel-title">Revisões</h2></div>
                <button type="button" disabled={loading} onClick={() => setReload((value) => value + 1)}>Atualizar</button>
            </div>
            {loading ? <p role="status">A carregar revisões…</p> : null}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {!loading && !error && !items.length ? <EmptyState title="Sem revisões" description="Ainda não existe histórico editorial para este conteúdo." /> : null}
            {items.length ? <ol className="revision-timeline">{items.map((revision) => (
                <li key={revision.id}>
                    <div><strong>{ACTIONS[revision.action] ?? "Alteração editorial"}</strong><span>{new Date(revision.createdAt).toLocaleString("pt-PT")}</span></div>
                    <button type="button" onClick={() => setSelected(revision)}>Reverter</button>
                </li>
            ))}</ol> : null}
            <ConfirmDialog open={Boolean(selected)} title="Reverter revisão" confirmLabel="Reverter" danger busy={busy} onCancel={() => !busy && setSelected(null)} onConfirm={revert}>
                <p>As alterações editoriais posteriores serão substituídas. A versão atual continuará registada no histórico.</p>
                {error ? <p className="form-error" role="alert">{error}</p> : null}
            </ConfirmDialog>
        </section>
    );
}
