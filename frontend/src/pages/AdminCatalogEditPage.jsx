/** @file Editor administrativo focado num único conteúdo obtido diretamente por ID. */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CatalogEditorForm } from "../components/admin/catalog/CatalogEditorForm.jsx";
import { CatalogMediaPanel } from "../components/admin/catalog/CatalogMediaPanel.jsx";
import { CatalogRevisionPanel } from "../components/admin/catalog/CatalogRevisionPanel.jsx";
import { StickyFormActions } from "../components/admin/catalog/StickyFormActions.jsx";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { formatContentType } from "../utils/contentTypeLabels.js";
import {
    catalogFormSnapshot,
    catalogFormToPayload,
    contentToCatalogForm,
    emptyCatalogForm,
} from "../utils/catalogEditorModel.js";

const STATUS = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };
const MEDIA = { pending: "Pendente", ready: "Pronta", failed: "Falhou" };
const SECTIONS = [
    ["general", "Visão geral"],
    ["presentation", "Imagens e créditos"],
    ["media", "Media"],
    ["revisions", "Revisões"],
];

/** @returns {JSX.Element} Edição editorial, media e revisões sem listagem do catálogo. */
export function AdminCatalogEditPage() {
    const { contentId = "" } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedSection = searchParams.get("secao") ?? "general";
    const section = SECTIONS.some(([value]) => value === requestedSection) ? requestedSection : "general";
    const [content, setContent] = useState(null);
    const [form, setForm] = useState(() => emptyCatalogForm());
    const [baseline, setBaseline] = useState("");
    const [taxonomies, setTaxonomies] = useState([]);
    const [seriesOptions, setSeriesOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [reload, setReload] = useState(0);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [nextStatus, setNextStatus] = useState("");
    const dirty = useMemo(() => Boolean(baseline) && catalogFormSnapshot(form) !== baseline, [baseline, form]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        Promise.all([
            catalogApi.getAdminContent(contentId, { signal: controller.signal }),
            catalogApi.listTaxonomies({ signal: controller.signal }),
            catalogApi.getAdminEditorOptions({ signal: controller.signal }),
        ])
            .then(([contentResponse, taxonomyResponse, optionsResponse]) => {
                const nextContent = contentResponse.content;
                const nextForm = contentToCatalogForm(nextContent);
                setContent(nextContent);
                setForm(nextForm);
                setBaseline(catalogFormSnapshot(nextForm));
                setTaxonomies(taxonomyResponse.items ?? []);
                setSeriesOptions(optionsResponse.seriesOptions ?? []);
            })
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [contentId, reload]);

    useEffect(() => {
        function warnBeforeUnload(event) {
            if (!dirty) return;
            event.preventDefault();
            event.returnValue = "";
        }
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [dirty]);

    function selectSection(value) {
        if (dirty && ["media", "revisions"].includes(value)) return;
        setSearchParams(value === "general" ? {} : { secao: value }, { replace: true });
    }

    async function save(event) {
        event.preventDefault();
        setBusy(true); setError(""); setStatusMessage("");
        try {
            const response = await catalogApi.updateContent(content.id, catalogFormToPayload(form));
            const nextContent = response.content;
            const nextForm = contentToCatalogForm(nextContent);
            setContent(nextContent);
            setForm(nextForm);
            setBaseline(catalogFormSnapshot(nextForm));
            setStatusMessage("Alterações editoriais guardadas.");
        } catch (requestError) {
            setError(requestError?.code === "CONTENT_VERSION_CONFLICT" ? "Este conteúdo foi alterado por outro editor. Recarrega os dados antes de continuar." : toUserMessage(requestError));
        } finally { setBusy(false); }
    }

    async function changeStatus() {
        setBusy(true); setError(""); setStatusMessage("");
        try {
            await catalogApi.updateStatus(content.id, nextStatus, content.version);
            setNextStatus("");
            setStatusMessage(`Estado atualizado para ${STATUS[nextStatus].toLocaleLowerCase("pt-PT")}.`);
            setReload((value) => value + 1);
        } catch (requestError) { setError(toUserMessage(requestError)); }
        finally { setBusy(false); }
    }

    if (loading) return <section className="page-section"><p role="status">A carregar conteúdo…</p></section>;
    if (!content) return <section className="page-section"><EmptyState title="Não foi possível abrir o conteúdo" description={error || "Conteúdo inexistente."} tone="error"><button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button><Link className="button-link" to="/admin/catalogo">Voltar ao catálogo</Link></EmptyState></section>;

    return (
        <section className="page-section catalog-editor-page">
            <header className="catalog-editor-header">
                <div>
                    <Link to="/admin/catalogo" onClick={(event) => { if (dirty) { event.preventDefault(); setCancelOpen(true); } }}>← Voltar ao catálogo</Link>
                    <p className="section-kicker">{formatContentType(content.type)}</p>
                    <h1>{content.title}</h1>
                    <div className="catalog-editor-meta"><span className={`status-badge status-${content.status}`}>{STATUS[content.status] ?? content.status}</span><span className={`status-badge status-${content.mediaStatus}`}>Media {MEDIA[content.mediaStatus] ?? content.mediaStatus}</span><span>Versão {content.version}</span>{content.updatedAt ? <span>Atualizado {new Date(content.updatedAt).toLocaleString("pt-PT")}</span> : null}</div>
                </div>
                <div className="button-row">
                    {content.status === "published" && content.slug ? <a className="button-link" href={`/catalogo/${content.slug}`} target="_blank" rel="noreferrer">Ver no site</a> : null}
                    {content.status !== "published" ? <button type="button" disabled={busy || dirty} onClick={() => setNextStatus("published")}>Publicar</button> : <button type="button" disabled={busy || dirty} onClick={() => setNextStatus("draft")}>Mover para rascunho</button>}
                    {content.status !== "archived" ? <button type="button" className="danger-button" disabled={busy || dirty} onClick={() => setNextStatus("archived")}>Arquivar</button> : null}
                </div>
            </header>

            {statusMessage ? <p role="status" className="form-success">{statusMessage}</p> : null}
            {error ? <p role="alert" className="form-error">{error}</p> : null}

            <nav className="catalog-editor-tabs" aria-label="Secções do editor">
                {SECTIONS.map(([value, label]) => <button key={value} type="button" aria-current={section === value ? "page" : undefined} disabled={dirty && ["media", "revisions"].includes(value)} title={dirty && ["media", "revisions"].includes(value) ? "Guarda as alterações antes de abrir esta secção." : undefined} onClick={() => selectSection(value)}>{label}</button>)}
            </nav>

            {["general", "presentation"].includes(section) ? (
                <div className="catalog-editor-layout">
                    <form className="catalog-editor-form app-form app-form--editorial" aria-busy={busy} onSubmit={save}>
                        <CatalogEditorForm editing form={form} onChange={setForm} taxonomies={taxonomies} seriesOptions={seriesOptions} section={section} />
                        <StickyFormActions busy={busy} dirty={dirty} submitLabel="Guardar alterações" onCancel={() => dirty ? setCancelOpen(true) : navigate("/admin/catalogo")} />
                    </form>
                    <aside className="catalog-status-panel" aria-label="Resumo editorial"><h2>Estado</h2><dl><div><dt>Editorial</dt><dd>{STATUS[content.status]}</dd></div><div><dt>Media</dt><dd>{MEDIA[content.mediaStatus]}</dd></div><div><dt>Versão</dt><dd>{content.version}</dd></div></dl>{dirty ? <p className="attention-note">Guarda as alterações antes de publicar, arquivar ou gerir media.</p> : null}</aside>
                </div>
            ) : null}
            {section === "media" ? <CatalogMediaPanel content={content} onChanged={() => setReload((value) => value + 1)} /> : null}
            {section === "revisions" ? <CatalogRevisionPanel content={content} onChanged={() => setReload((value) => value + 1)} /> : null}

            <ConfirmDialog open={cancelOpen} title="Descartar alterações?" confirmLabel="Descartar" danger onCancel={() => setCancelOpen(false)} onConfirm={() => navigate("/admin/catalogo")}><p>As alterações editoriais ainda não foram guardadas.</p></ConfirmDialog>
            <ConfirmDialog open={Boolean(nextStatus)} title={`${nextStatus === "archived" ? "Arquivar" : nextStatus === "published" ? "Publicar" : "Mover para rascunho"} conteúdo`} confirmLabel={nextStatus === "archived" ? "Arquivar" : nextStatus === "published" ? "Publicar" : "Confirmar"} danger={nextStatus === "archived"} busy={busy} onCancel={() => !busy && setNextStatus("")} onConfirm={changeStatus}><p>{nextStatus === "archived" ? "O conteúdo deixará de estar disponível no catálogo público." : nextStatus === "published" ? "O conteúdo ficará disponível ao público se cumprir os requisitos editoriais e de media." : "O conteúdo deixará de estar disponível ao público."}</p></ConfirmDialog>
        </section>
    );
}
