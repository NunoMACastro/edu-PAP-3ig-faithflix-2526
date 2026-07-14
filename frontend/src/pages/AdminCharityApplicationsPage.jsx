/**
 * @file Revisão administrativa detalhada de candidaturas de associações.
 */

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { charitiesApi } from "../services/api/charitiesApi.js";

const PAGE_LIMIT = 20;
const FILTERS = [
    ["pending", "Pendentes"],
    ["approved", "Aprovadas"],
    ["rejected", "Rejeitadas"],
    ["all", "Todas"],
];
const STATUS_LABELS = { pending: "Pendente", approved: "Aprovada", rejected: "Rejeitada" };

function formatDate(value) {
    return value ? new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

/** @returns {JSX.Element} Lista filtrável e diálogo de decisão auditável. */
export function AdminCharityApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("pending");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [selected, setSelected] = useState(null);
    const [decision, setDecision] = useState("");
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const mutationControllerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");

        charitiesApi.listApplications({ status: filter, page, limit: PAGE_LIMIT }, { signal: controller.signal })
            .then((response) => {
                const totalPages = Math.max(response.totalPages ?? 1, 1);
                if (page > totalPages) {
                    setPage(totalPages);
                    return;
                }
                setApplications(response.applications ?? []);
                setPagination({ page: response.page ?? page, total: response.total ?? 0, totalPages });
            })
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [filter, page, reloadVersion]);

    useEffect(() => () => mutationControllerRef.current?.abort(), []);

    function openReview(application) {
        setSelected({ ...application, status: application.status ?? "pending" });
        setDecision("");
        setReason(application.reviewReason ?? "");
        setError("");
        setStatus("");
    }

    function closeReview() {
        if (busy) return;
        setSelected(null);
        setDecision("");
        setReason("");
    }

    async function submitDecision() {
        if (!selected || !["approved", "rejected"].includes(decision)) {
            setError("Seleciona Aprovar ou Rejeitar antes de guardar.");
            return;
        }
        const normalizedReason = reason.trim();
        if (decision === "rejected" && (normalizedReason.length < 10 || normalizedReason.length > 500)) {
            setError("O motivo da rejeição deve ter entre 10 e 500 caracteres.");
            return;
        }

        const controller = new AbortController();
        mutationControllerRef.current = controller;
        setBusy(true);
        setError("");

        try {
            await charitiesApi.reviewApplication(selected.id, {
                decision,
                reason: decision === "rejected" ? normalizedReason : "",
            }, { signal: controller.signal });
            setStatus(decision === "approved" ? "Candidatura aprovada e associação criada." : "Candidatura rejeitada com motivo registado.");
            setSelected(null);
            setReloadVersion((value) => value + 1);
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
        } finally {
            if (mutationControllerRef.current === controller) mutationControllerRef.current = null;
            setBusy(false);
        }
    }

    return (
        <section className="page-section">
            <header className="admin-page-header">
                <div><p className="section-kicker">Solidariedade</p><h1>Candidaturas</h1><p>Revê toda a informação submetida antes de tomar uma decisão.</p></div>
            </header>

            <div className="admin-tabs" role="tablist" aria-label="Estado das candidaturas">
                {FILTERS.map(([value, label]) => (
                    <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? "is-active" : ""} onClick={() => { setFilter(value); setPage(1); }}>{label}</button>
                ))}
            </div>

            {loading ? <p role="status">A carregar candidaturas…</p> : null}
            {error && !selected ? <EmptyState title="Não foi possível concluir a operação" description={error} tone="error"><button type="button" onClick={() => setReloadVersion((value) => value + 1)}>Tentar novamente</button></EmptyState> : null}
            {status ? <p role="status">{status}</p> : null}
            {!loading && !error && applications.length === 0 ? <EmptyState title="Sem candidaturas" description={`Não existem candidaturas no filtro «${FILTERS.find(([value]) => value === filter)?.[1]}».`} /> : null}

            <div className="admin-application-list">
                {applications.map((application) => {
                    const applicationStatus = application.status ?? "pending";
                    return (
                    <article className="admin-application-card" key={application.id}>
                        <div><span className={`status-badge status-${applicationStatus}`}>{STATUS_LABELS[applicationStatus]}</span><h2>{application.name}</h2><p>{application.contactName ?? "Contacto não indicado"} · {application.email ?? "Email não indicado"}</p><small>Submetida em {formatDate(application.submittedAt)}</small></div>
                        <button type="button" onClick={() => openReview(application)}>{applicationStatus === "pending" ? "Rever candidatura" : "Consultar detalhe"}</button>
                    </article>
                    );
                })}
            </div>

            {pagination.totalPages > 1 ? <nav className="pagination" aria-label="Paginação de candidaturas"><button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>Página {pagination.page} de {pagination.totalPages} ({pagination.total})</span><button type="button" disabled={loading || page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Seguinte</button></nav> : null}

            <ConfirmDialog
                open={Boolean(selected)}
                title={selected?.status === "pending" ? "Rever candidatura" : "Detalhe da candidatura"}
                eyebrow="Revisão de candidatura"
                size="wide"
                confirmLabel={selected?.status !== "pending" ? "Fechar" : decision === "approved" ? "Aprovar e criar associação" : decision === "rejected" ? "Rejeitar candidatura" : "Guardar decisão"}
                showCancel={selected?.status === "pending"}
                danger={decision === "rejected"}
                busy={busy}
                onCancel={closeReview}
                onConfirm={selected?.status === "pending" ? submitDecision : closeReview}
            >
                {selected ? (
                    <div className="application-review-detail">
                        <dl className="detail-list">
                            <dt>Associação</dt><dd>{selected.name}</dd>
                            <dt>Contacto</dt><dd>{selected.contactName}</dd>
                            <dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd>
                            <dt>Telefone</dt><dd>{selected.phone || "Não indicado"}</dd>
                            <dt>Website</dt><dd>{selected.websiteUrl ? <a href={selected.websiteUrl} target="_blank" rel="noreferrer">{selected.websiteUrl}</a> : "Não indicado"}</dd>
                            <dt>Submissão</dt><dd>{formatDate(selected.submittedAt)}</dd>
                            <dt>Estado</dt><dd>{STATUS_LABELS[selected.status] ?? selected.status}</dd>
                        </dl>
                        <section><h3>Missão</h3><p>{selected.mission}</p></section>
                        {selected.status === "pending" ? (
                            <fieldset className="decision-fieldset">
                                <legend>Decisão</legend>
                                <div className="decision-toggle">
                                    <label className={`decision-option${decision === "approved" ? " is-selected" : ""}`}>
                                        <input className="visually-hidden" aria-label="Aprovar" type="radio" name="application-decision" value="approved" checked={decision === "approved"} disabled={busy} onChange={() => setDecision("approved")} />
                                        <span className="decision-option-icon" aria-hidden="true">✓</span>
                                        <span><strong>Aprovar</strong><small>Cria uma associação ativa</small></span>
                                    </label>
                                    <label className={`decision-option decision-option-reject${decision === "rejected" ? " is-selected" : ""}`}>
                                        <input className="visually-hidden" aria-label="Rejeitar" type="radio" name="application-decision" value="rejected" checked={decision === "rejected"} disabled={busy} onChange={() => setDecision("rejected")} />
                                        <span className="decision-option-icon" aria-hidden="true">×</span>
                                        <span><strong>Rejeitar</strong><small>Regista uma decisão fundamentada</small></span>
                                    </label>
                                </div>
                                {decision === "approved" ? <p className="decision-result-note">A aprovação cria imediatamente uma associação ativa a partir desta candidatura.</p> : null}
                                {decision === "rejected" ? <label className="decision-reason">Motivo da rejeição<textarea aria-label="Motivo da rejeição" value={reason} minLength={10} maxLength={500} required disabled={busy} onChange={(event) => setReason(event.target.value)} /><small>{reason.trim().length}/500 caracteres · mínimo 10</small></label> : null}
                            </fieldset>
                        ) : selected.reviewReason ? <p><strong>Motivo registado:</strong> {selected.reviewReason}</p> : null}
                        {error ? <p role="alert" className="form-error">{error}</p> : null}
                    </div>
                ) : null}
            </ConfirmDialog>
        </section>
    );
}
