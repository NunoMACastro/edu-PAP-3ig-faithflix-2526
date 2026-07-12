/** @file Gestão list-first de taxonomias editoriais. */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const EMPTY_DRAFT = { name: "", slug: "", description: "" };

/** @returns {JSX.Element} Pesquisa, criação, edição, arquivo e reativação. */
export function AdminTaxonomiesPage() {
    const nameInputRef = useRef(null);
    const [searchDraft, setSearchDraft] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("active");
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [editor, setEditor] = useState(null);
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [statusTarget, setStatusTarget] = useState(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError("");
        catalogApi.listAdminTaxonomies({ search, status, page, limit: 20 }, { signal: controller.signal })
            .then((response) => setData({ items: response.items ?? [], total: response.total ?? 0, totalPages: Math.max(response.totalPages ?? 1, 1), page: response.page ?? page }))
            .catch((requestError) => { if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError)); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, reload, search, status]);

    function openCreate() { setEditor({ mode: "create" }); setDraft(EMPTY_DRAFT); setError(""); }
    function openEdit(item) { setEditor({ mode: "edit", item }); setDraft({ name: item.name, slug: item.slug, description: item.description ?? "" }); setError(""); }

    async function save() {
        if (draft.name.trim().length < 2) return setError("O nome deve ter pelo menos 2 caracteres.");
        setBusy(true); setError("");
        try {
            if (editor.mode === "create") await catalogApi.createTaxonomy(draft);
            else await catalogApi.updateTaxonomy(editor.item.id, { ...draft, expectedVersion: editor.item.version });
            setEditor(null); setReload((value) => value + 1);
        } catch (requestError) { setError(toUserMessage(requestError)); }
        finally { setBusy(false); }
    }

    async function changeStatus() {
        setBusy(true); setError("");
        const nextStatus = statusTarget.status === "archived" ? "active" : "archived";
        try {
            await catalogApi.updateTaxonomyStatus(statusTarget.id, nextStatus, statusTarget.version);
            setStatusTarget(null); setReload((value) => value + 1);
        } catch (requestError) { setError(toUserMessage(requestError)); }
        finally { setBusy(false); }
    }

    return (
        <section className="page-section">
            <header className="admin-page-header"><div><p className="section-kicker">Conteúdo</p><h1>Taxonomias</h1><p>Organiza a classificação editorial sem remover ligações existentes.</p></div><div className="button-row"><Link className="button-link" to="/admin/catalogo">Voltar ao catálogo</Link><button type="button" onClick={openCreate}>Nova taxonomia</button></div></header>
            <div className="catalog-subtabs" role="group" aria-label="Estado das taxonomias"><button type="button" aria-pressed={status === "active"} onClick={() => { setStatus("active"); setPage(1); }}>Ativas</button><button type="button" aria-pressed={status === "archived"} onClick={() => { setStatus("archived"); setPage(1); }}>Arquivadas</button></div>
            <form className="filter-bar taxonomy-filter-bar" onSubmit={(event) => { event.preventDefault(); setSearch(searchDraft.trim()); setPage(1); }}><label>Pesquisar<input maxLength={80} value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Nome da taxonomia" /></label><button type="submit" disabled={loading}>Pesquisar</button>{search ? <button type="button" onClick={() => { setSearchDraft(""); setSearch(""); setPage(1); }}>Limpar</button> : null}</form>
            {!loading ? <p className="results-summary">{data.total} {data.total === 1 ? "taxonomia" : "taxonomias"}</p> : null}
            {loading ? <p role="status">A carregar taxonomias…</p> : null}
            {error && !editor && !statusTarget ? <EmptyState title="Não foi possível carregar as taxonomias" description={error} tone="error"><button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></EmptyState> : null}
            {!loading && !error && !data.items.length ? <EmptyState title={status === "active" ? "Sem taxonomias ativas" : "Sem taxonomias arquivadas"} description="Não existem taxonomias para os filtros aplicados." /> : null}
            {data.items.length ? <>
                <div className="table-wrap catalog-desktop-results"><table><thead><tr><th>Nome</th><th>Slug</th><th>Descrição</th><th>Utilizações</th><th>Atualização</th><th><span className="visually-hidden">Ações</span></th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td><code>{item.slug}</code></td><td>{item.description || "—"}</td><td>{item.usageCount}</td><td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-PT") : "—"}</td><td><div className="button-row"><button type="button" onClick={() => openEdit(item)}>Editar</button><button type="button" onClick={() => setStatusTarget(item)}>{item.status === "archived" ? "Reativar" : "Arquivar"}</button></div></td></tr>)}</tbody></table></div>
                <ul className="catalog-mobile-results taxonomy-mobile-list">{data.items.map((item) => <li key={item.id}><div><strong>{item.name}</strong><code>{item.slug}</code><span>{item.usageCount} utilizações</span></div><div className="button-row"><button type="button" onClick={() => openEdit(item)}>Editar</button><button type="button" onClick={() => setStatusTarget(item)}>{item.status === "archived" ? "Reativar" : "Arquivar"}</button></div></li>)}</ul>
            </> : null}
            {data.totalPages > 1 ? <nav className="pagination" aria-label="Paginação das taxonomias"><button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>Página {data.page} de {data.totalPages}</span><button type="button" disabled={loading || page >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Seguinte</button></nav> : null}

            <ConfirmDialog open={Boolean(editor)} title={editor?.mode === "create" ? "Nova taxonomia" : "Editar taxonomia"} confirmLabel={editor?.mode === "create" ? "Criar taxonomia" : "Guardar alterações"} busy={busy} initialFocusRef={nameInputRef} onCancel={() => { if (!busy) { setEditor(null); setError(""); } }} onConfirm={save}><div className="dialog-form"><label>Nome<input ref={nameInputRef} required minLength={2} maxLength={80} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label><label>Slug opcional<input maxLength={100} value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} /></label><label>Descrição<textarea maxLength={500} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}</div></ConfirmDialog>
            <ConfirmDialog open={Boolean(statusTarget)} title={statusTarget?.status === "archived" ? "Reativar taxonomia" : "Arquivar taxonomia"} confirmLabel={statusTarget?.status === "archived" ? "Reativar" : "Arquivar"} danger={statusTarget?.status !== "archived"} busy={busy} onCancel={() => { if (!busy) { setStatusTarget(null); setError(""); } }} onConfirm={changeStatus}><p>{statusTarget?.status === "archived" ? "A taxonomia voltará a estar disponível para novas classificações." : `Esta taxonomia está associada a ${statusTarget?.usageCount ?? 0} conteúdos. Deixará de estar disponível para novas seleções, mas as ligações atuais serão preservadas.`}</p>{error ? <p className="form-error" role="alert">{error}</p> : null}</ConfirmDialog>
        </section>
    );
}
