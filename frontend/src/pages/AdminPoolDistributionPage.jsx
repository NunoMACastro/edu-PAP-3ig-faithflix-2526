/**
 * @file Preview e commit consistente da distribuição mensal solidária.
 */

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", { currency: "EUR", style: "currency" });
function formatMoney(cents = 0) { return moneyFormatter.format(cents / 100); }
export function formatLocalMonth(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function formatMonth(month) {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}
function previousLocalMonth() { const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - 1); return formatLocalMonth(date); }

function DistributionResult({ distribution }) {
    if (!distribution) return null;
    return <section className="admin-panel"><h2>{formatMonth(distribution.month)}</h2><p className="muted-text">Referência: {distribution.month}</p><p><strong>Total: {formatMoney(distribution.totalPoolCents)}</strong></p><div className="distribution-items">{(distribution.items ?? []).map((item) => <article key={item.charityId}><h3>{item.charityName}</h3><p>{formatMoney(item.amountCents)}</p></article>)}</div></section>;
}

/** @returns {JSX.Element} Fluxo em duas fases preview/commit. */
export function AdminPoolDistributionPage() {
    const [month, setMonth] = useState(previousLocalMonth);
    const [preview, setPreview] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState("");
    const controllerRef = useRef(null);

    useEffect(() => () => controllerRef.current?.abort(), []);

    async function loadPreview(event) {
        event?.preventDefault();
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoadingPreview(true);
        setError("");
        setPreview(null);
        setDistribution(null);
        try {
            const response = await charitiesApi.previewDistribution(month, { signal: controller.signal });
            if (response.preview.alreadyDistributed) {
                setDistribution(response.preview.distribution);
            } else {
                setPreview(response.preview);
            }
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
        } finally {
            if (controllerRef.current === controller) controllerRef.current = null;
            if (!controller.signal.aborted) setLoadingPreview(false);
        }
    }

    async function commitDistribution() {
        if (!preview?.previewToken || submitting) return;
        const controller = new AbortController();
        controllerRef.current = controller;
        setSubmitting(true);
        setError("");
        try {
            const response = await charitiesApi.runDistribution(month, preview.previewToken, { signal: controller.signal });
            setDistribution(response.distribution);
            setPreview(null);
            setConfirmOpen(false);
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") {
                setError(requestError?.code === "POOL_PREVIEW_STALE" ? "Os dados financeiros mudaram. Gera uma nova pré-visualização antes de distribuir." : toUserMessage(requestError));
                if (requestError?.code === "POOL_PREVIEW_STALE") { setPreview(null); setConfirmOpen(false); }
            }
        } finally {
            controllerRef.current = null;
            setSubmitting(false);
        }
    }

    return (
        <section className="page-section">
            <header className="admin-page-header"><div><p className="section-kicker">Solidariedade</p><h1>Distribuição mensal</h1><p>Pré-visualiza os valores antes do fecho irreversível.</p></div></header>
            <form className="filter-bar" onSubmit={loadPreview}><label>Mês<input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPreview(null); setDistribution(null); }} required /></label><button type="submit" disabled={loadingPreview || submitting}>{loadingPreview ? "A calcular…" : "Gerar pré-visualização"}</button></form>
            {error ? <EmptyState title="Não foi possível concluir a distribuição" description={error} tone="error" /> : null}
            {distribution ? <><p role="status">Este mês já está distribuído. É apresentado o resultado persistido.</p><DistributionResult distribution={distribution} /></> : null}
            {preview ? <section className="admin-panel"><div className="admin-page-header"><div><h2>Pré-visualização de {formatMonth(preview.month)}</h2><p className="muted-text">Referência: {preview.month}</p></div><button type="button" onClick={() => setConfirmOpen(true)}>Confirmar distribuição</button></div><dl className="detail-list"><dt>Receita aprovada</dt><dd>{formatMoney(preview.financialSnapshot.approvedRevenueCents)}</dd><dt>Pagamentos considerados</dt><dd>{preview.financialSnapshot.paymentCount}</dd><dt>Pool a distribuir</dt><dd>{formatMoney(preview.totalPoolCents)}</dd><dt>Associações elegíveis</dt><dd>{preview.financialSnapshot.eligibleCharityCount}</dd><dt>Estado previsto</dt><dd>{preview.status === "completed" ? "Concluída" : "Sem associações elegíveis"}</dd></dl><div className="distribution-items">{preview.items.map((item) => <article key={item.charityId}><h3>{item.charityName}</h3><p>{formatMoney(item.amountCents)}</p></article>)}</div></section> : null}
            <ConfirmDialog open={confirmOpen} title={`Distribuir a pool de ${preview ? formatMonth(preview.month) : "mês selecionado"}`} confirmLabel="Distribuir agora" danger busy={submitting} onCancel={() => !submitting && setConfirmOpen(false)} onConfirm={commitDistribution}><p>Serão distribuídos <strong>{formatMoney(preview?.totalPoolCents)}</strong> por <strong>{preview?.items?.length ?? 0}</strong> associação(ões).</p><p>Esta operação cria registos financeiros e não pode ser anulada. Se os dados tiverem mudado, o commit será recusado.</p>{error ? <p className="form-error" role="alert">{error}</p> : null}</ConfirmDialog>
        </section>
    );
}
