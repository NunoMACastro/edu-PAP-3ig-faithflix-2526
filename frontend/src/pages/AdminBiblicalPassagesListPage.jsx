/**
 * @file Entrada list-first das passagens bíblicas administrativas.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const STATUS = { draft: "Rascunho", published: "Publicada", archived: "Arquivada" };

/** @returns {JSX.Element} Lista pesquisável e paginada de passagens. */
export function AdminBiblicalPassagesListPage() {
    const [form, setForm] = useState({ search: "", status: "" });
    const [filters, setFilters] = useState(form);
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => { const controller = new AbortController(); setLoading(true); setError(""); biblicalPassagesApi.listAdmin({ ...filters, page, limit: 20 }, { signal: controller.signal }).then((response) => setData({ items: response.items ?? [], total: response.total ?? 0, totalPages: Math.max(response.totalPages ?? 1, 1), page: response.page ?? page })).catch((requestError) => { if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [filters, page, reload]);

    function apply(event) { event.preventDefault(); setFilters({ ...form, search: form.search.trim() }); setPage(1); }
    return <section className="page-section"><header className="admin-page-header"><div><p className="section-kicker">Conteúdo</p><h1>Passagens bíblicas</h1><p>Pesquisa por livro, tradução ou tema.</p></div><div className="button-row"><Link className="button-link" to="/admin/passagens-biblicas/associacoes">Associações</Link><Link className="button-link" to="/admin/passagens-biblicas/novo">Nova passagem</Link></div></header><form className="filter-bar" onSubmit={apply}><label>Pesquisa<input maxLength="80" value={form.search} onChange={(event) => setForm((current) => ({ ...current, search: event.target.value }))} placeholder="Livro, tradução ou tema" /></label><label>Estado<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="">Todos</option>{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="submit" disabled={loading}>Filtrar</button></form>{loading ? <p role="status">A carregar passagens…</p> : null}{error ? <EmptyState title="Não foi possível carregar as passagens" description={error} tone="error"><button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></EmptyState> : null}{!loading && !error && !data.items.length ? <EmptyState title="Sem passagens" description="Não existem passagens para os filtros aplicados." /> : null}{data.items.length ? <div className="table-wrap"><table><thead><tr><th>Referência</th><th>Tradução</th><th>Tema</th><th>Estado</th><th><span className="visually-hidden">Ações</span></th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td>{item.book} {item.chapterStart}:{item.verseStart}</td><td>{item.translation}</td><td>{item.theme || "—"}</td><td><span className={`status-badge status-${item.status}`}>{STATUS[item.status] ?? item.status}</span></td><td><Link className="button-link" to={`/admin/passagens-biblicas/${item.id}/editar`}>Editar</Link></td></tr>)}</tbody></table></div> : null}{data.totalPages > 1 ? <nav className="pagination" aria-label="Paginação de passagens"><button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>Página {data.page} de {data.totalPages} ({data.total})</span><button type="button" disabled={loading || page >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Seguinte</button></nav> : null}</section>;
}
