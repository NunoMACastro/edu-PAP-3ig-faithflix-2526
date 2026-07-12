/** @file Workspace list-first do catálogo administrativo. */

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { formatContentType } from "../utils/contentTypeLabels.js";

const STATUS = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };
const MEDIA = { pending: "Pendente", ready: "Pronta", failed: "Falhou" };
const EMPTY_FILTERS = { search: "", status: "", type: "", mediaStatus: "", sort: "updatedAt", direction: "desc" };

/** @param {URLSearchParams} params Query string atual. @returns {Record<string, string>} Filtros normalizados para o formulário. */
function filtersFromParams(params) {
    return {
        search: params.get("search") ?? "",
        status: params.get("status") ?? "",
        type: params.get("type") ?? "",
        mediaStatus: params.get("mediaStatus") ?? "",
        sort: params.get("sort") ?? "updatedAt",
        direction: params.get("direction") ?? "desc",
    };
}

/** @returns {JSX.Element} Pesquisa, filtros, tabela/cartões e paginação. */
export function AdminCatalogListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialFilters = useMemo(() => filtersFromParams(searchParams), []);
    const [form, setForm] = useState(initialFilters);
    const [filters, setFilters] = useState(initialFilters);
    const [page, setPage] = useState(() => Math.max(Number(searchParams.get("page")) || 1, 1));
    const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const nextParams = new URLSearchParams();
        for (const [field, value] of Object.entries(filters)) {
            if (value && value !== EMPTY_FILTERS[field]) nextParams.set(field, value);
        }
        if (page > 1) nextParams.set("page", String(page));
        setSearchParams(nextParams, { replace: true });
    }, [filters, page, setSearchParams]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError("");
        catalogApi.listAdmin({ ...filters, page, limit: 20 }, { signal: controller.signal })
            .then((response) => setData({ items: response.items ?? [], total: response.total ?? 0, totalPages: Math.max(response.totalPages ?? 1, 1), page: response.page ?? page }))
            .catch((requestError) => { if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError)); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [filters, page, reload]);

    function apply(event) { event.preventDefault(); setFilters({ ...form, search: form.search.trim() }); setPage(1); }
    function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
    function clear() { setForm(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setPage(1); }
    const activeFilters = [filters.search, filters.status, filters.type, filters.mediaStatus].filter(Boolean).length;

    return (
        <section className="page-section">
            <header className="admin-page-header"><div><p className="section-kicker">Conteúdo</p><h1>Catálogo</h1><p>{loading ? "A atualizar resultados…" : `${data.total} ${data.total === 1 ? "conteúdo" : "conteúdos"} encontrados.`}</p></div><div className="button-row"><Link className="button-link" to="/admin/catalogo/taxonomias">Taxonomias</Link><Link className="button-link primary-button-link" to="/admin/catalogo/novo">Novo conteúdo</Link></div></header>
            <form className="filter-bar catalog-filter-bar" onSubmit={apply}>
                <label>Pesquisa<input maxLength="80" value={form.search} onChange={(event) => update("search", event.target.value)} placeholder="Título" /></label>
                <label>Estado<select value={form.status} onChange={(event) => update("status", event.target.value)}><option value="">Todos</option>{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>Tipo<select value={form.type} onChange={(event) => update("type", event.target.value)}><option value="">Todos</option>{["movie", "documentary", "series", "episode"].map((value) => <option key={value} value={value}>{formatContentType(value)}</option>)}</select></label>
                <label>Media<select value={form.mediaStatus} onChange={(event) => update("mediaStatus", event.target.value)}><option value="">Todos</option>{Object.entries(MEDIA).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>Ordenar<select value={`${form.sort}:${form.direction}`} onChange={(event) => { const [sort, direction] = event.target.value.split(":"); setForm((current) => ({ ...current, sort, direction })); }}><option value="updatedAt:desc">Mais recentes</option><option value="updatedAt:asc">Mais antigos</option><option value="title:asc">Título A–Z</option><option value="title:desc">Título Z–A</option><option value="status:asc">Estado</option></select></label>
                <button type="submit" disabled={loading}>Aplicar</button>{activeFilters ? <button type="button" onClick={clear}>Limpar ({activeFilters})</button> : null}
            </form>
            {activeFilters ? <div className="active-filter-chips" aria-label="Filtros ativos">{filters.search ? <button type="button" onClick={() => { update("search", ""); setFilters((current) => ({ ...current, search: "" })); }}>Pesquisa: {filters.search} ×</button> : null}{filters.status ? <button type="button" onClick={() => { update("status", ""); setFilters((current) => ({ ...current, status: "" })); }}>Estado: {STATUS[filters.status]} ×</button> : null}{filters.type ? <button type="button" onClick={() => { update("type", ""); setFilters((current) => ({ ...current, type: "" })); }}>Tipo: {formatContentType(filters.type)} ×</button> : null}{filters.mediaStatus ? <button type="button" onClick={() => { update("mediaStatus", ""); setFilters((current) => ({ ...current, mediaStatus: "" })); }}>Media: {MEDIA[filters.mediaStatus]} ×</button> : null}</div> : null}
            {loading ? <p role="status">A carregar catálogo…</p> : null}
            {error ? <EmptyState title="Não foi possível carregar o catálogo" description={error} tone="error"><button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></EmptyState> : null}
            {!loading && !error && !data.items.length ? <EmptyState title="Sem conteúdos" description="Não existem conteúdos para os filtros aplicados." /> : null}
            {data.items.length ? <>
                <div className="table-wrap catalog-desktop-results"><table><thead><tr><th>Conteúdo</th><th>Tipo</th><th>Estado</th><th>Media</th><th>Atualização</th><th><span className="visually-hidden">Ações</span></th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td><div className="catalog-title-cell">{item.assets?.posterUrl ? <img src={item.assets.posterUrl} alt="" /> : <span className="catalog-poster-placeholder" aria-hidden="true" /> }<div><strong>{item.title}</strong>{item.type === "episode" ? <span>T{item.seasonNumber} E{item.episodeNumber}</span> : null}</div></div></td><td>{formatContentType(item.type)}</td><td><span className={`status-badge status-${item.status}`}>{STATUS[item.status] ?? item.status}</span></td><td><span className={`status-badge status-${item.mediaStatus}`}>{MEDIA[item.mediaStatus] ?? item.mediaStatus ?? "—"}</span></td><td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-PT") : "—"}</td><td><Link className="button-link" to={`/admin/catalogo/${item.id}/editar`}>Editar</Link></td></tr>)}</tbody></table></div>
                <ul className="catalog-mobile-results">{data.items.map((item) => <li key={item.id}>{item.assets?.posterUrl ? <img src={item.assets.posterUrl} alt="" /> : <span className="catalog-poster-placeholder" aria-hidden="true" />}<div className="catalog-mobile-summary"><strong>{item.title}</strong><span>{formatContentType(item.type)}{item.type === "episode" ? ` · T${item.seasonNumber} E${item.episodeNumber}` : ""}</span><div className="button-row"><span className={`status-badge status-${item.status}`}>{STATUS[item.status]}</span><span className={`status-badge status-${item.mediaStatus}`}>{MEDIA[item.mediaStatus]}</span></div></div><Link className="button-link" to={`/admin/catalogo/${item.id}/editar`}>Editar</Link></li>)}</ul>
            </> : null}
            {data.totalPages > 1 ? <nav className="pagination" aria-label="Paginação do catálogo"><button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>Página {data.page} de {data.totalPages} ({data.total})</span><button type="button" disabled={loading || page >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Seguinte</button></nav> : null}
        </section>
    );
}
