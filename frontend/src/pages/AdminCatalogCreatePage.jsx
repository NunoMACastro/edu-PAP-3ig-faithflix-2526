/** @file Página focada exclusivamente na criação editorial de conteúdo. */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CatalogEditorForm } from "../components/admin/catalog/CatalogEditorForm.jsx";
import { StickyFormActions } from "../components/admin/catalog/StickyFormActions.jsx";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import {
    catalogFormSnapshot,
    catalogFormToPayload,
    emptyCatalogForm,
} from "../utils/catalogEditorModel.js";

const INITIAL_FORM = emptyCatalogForm();
const INITIAL_SNAPSHOT = catalogFormSnapshot(INITIAL_FORM);

/** @returns {JSX.Element} Fluxo editorial de criação sem listagens secundárias. */
export function AdminCatalogCreatePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState(() => emptyCatalogForm());
    const [taxonomies, setTaxonomies] = useState([]);
    const [seriesOptions, setSeriesOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reload, setReload] = useState(0);
    const dirty = useMemo(() => catalogFormSnapshot(form) !== INITIAL_SNAPSHOT, [form]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        Promise.all([
            catalogApi.listTaxonomies({ signal: controller.signal }),
            catalogApi.getAdminEditorOptions({ signal: controller.signal }),
        ])
            .then(([taxonomyResponse, optionsResponse]) => {
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
    }, [reload]);

    useEffect(() => {
        function warnBeforeUnload(event) {
            if (!dirty) return;
            event.preventDefault();
            event.returnValue = "";
        }
        window.addEventListener("beforeunload", warnBeforeUnload);
        return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [dirty]);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            const response = await catalogApi.createContent(catalogFormToPayload(form));
            navigate(`/admin/catalogo/${response.content.id}/editar`, { replace: true });
        } catch (requestError) {
            setError(toUserMessage(requestError));
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="page-section catalog-editor-page">
            <header className="admin-page-header">
                <div>
                    <p className="section-kicker">Conteúdo</p>
                    <h1>Novo conteúdo</h1>
                    <p>Cria os metadados editoriais. O conteúdo ficará em rascunho.</p>
                </div>
                <Link className="button-link" to="/admin/catalogo">Voltar ao catálogo</Link>
            </header>

            {loading ? <p role="status">A preparar o editor…</p> : null}
            {!loading && error && !taxonomies.length ? (
                <EmptyState title="Não foi possível preparar o editor" description={error} tone="error">
                    <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button>
                </EmptyState>
            ) : null}
            {!loading && (taxonomies.length || !error) ? (
                <form className="catalog-editor-form app-form app-form--editorial" aria-busy={busy} onSubmit={submit}>
                    {error ? <p className="form-error" role="alert">{error}</p> : null}
                    <CatalogEditorForm form={form} onChange={setForm} taxonomies={taxonomies} seriesOptions={seriesOptions} />
                    <StickyFormActions busy={busy} dirty={dirty} submitLabel="Criar como rascunho" onCancel={() => dirty ? setCancelOpen(true) : navigate("/admin/catalogo")} />
                </form>
            ) : null}

            <ConfirmDialog open={cancelOpen} title="Descartar alterações?" confirmLabel="Descartar" danger onCancel={() => setCancelOpen(false)} onConfirm={() => navigate("/admin/catalogo")}>
                <p>Os dados introduzidos ainda não foram guardados.</p>
            </ConfirmDialog>
        </section>
    );
}
