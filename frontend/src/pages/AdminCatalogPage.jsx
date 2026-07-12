/**
 * @file Gestão editorial de filmes, documentários, séries e episódios.
 */

import { useEffect, useMemo, useState } from "react";
import { catalogApi } from "../services/api/catalogApi.js";
import { CONTENT_TYPE_OPTIONS, formatContentType } from "../utils/contentTypeLabels.js";

const PLAYABLE_DEFAULTS = {
    durationSeconds: 120,
    media: { playbackUrl: "/media/piloto.mp4" },
    tracks: {
        subtitles: [],
        audio: [{ language: "pt", label: "Português", src: "/media/piloto.mp4" }],
    },
    qualityOptions: [
        { label: "720p", value: "720p", playbackUrl: "/media/piloto.mp4" },
    ],
};

/**
 * Cria um formulário editorial limpo sem partilhar referências mutáveis.
 *
 * @returns {Record<string, unknown>} Estado inicial do formulário.
 */
function emptyForm() {
    return {
        editingId: null,
        title: "",
        synopsis: "",
        type: "movie",
        ageRating: 6,
        taxonomyIds: [],
        assets: { posterUrl: "", backdropUrl: "" },
        seriesId: "",
        seasonNumber: 1,
        episodeNumber: 1,
        ...structuredClone(PLAYABLE_DEFAULTS),
    };
}

/**
 * Constrói o payload condicional aceite pelo backend.
 *
 * @param {Record<string, unknown>} form Estado atual.
 * @returns {Record<string, unknown>} Payload editorial.
 */
function buildPayload(form) {
    const common = {
        title: form.title,
        slug: form.slug,
        synopsis: form.synopsis,
        type: form.type,
        ageRating: Number(form.ageRating),
        taxonomyIds: form.taxonomyIds ?? [],
        assets: form.assets ?? { posterUrl: "", backdropUrl: "" },
    };

    if (form.type === "series") return common;

    const playable = {
        ...common,
        durationSeconds: Number(form.durationSeconds),
        media: form.media,
        tracks: form.tracks,
        qualityOptions: form.qualityOptions,
    };

    return form.type === "episode"
        ? {
              ...playable,
              seriesId: form.seriesId,
              seasonNumber: Number(form.seasonNumber),
              episodeNumber: Number(form.episodeNumber),
          }
        : playable;
}

/**
 * Página administrativa de catálogo com hierarquia explícita.
 *
 * @returns {JSX.Element} Gestão editorial.
 */
export function AdminCatalogPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [revisionsByContent, setRevisionsByContent] = useState({});
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    async function loadItems() {
        const response = await catalogApi.listAdmin();
        setItems(response.items ?? []);
    }

    useEffect(() => {
        loadItems().catch((requestError) => setError(requestError.message));
    }, []);

    const series = useMemo(
        () => items.filter((content) => content.type === "series"),
        [items],
    );
    const episodesBySeries = useMemo(() => {
        const grouped = new Map();
        for (const episode of items.filter((content) => content.type === "episode")) {
            const group = grouped.get(episode.seriesId) ?? [];
            group.push(episode);
            grouped.set(episode.seriesId, group);
        }
        for (const episodes of grouped.values()) {
            episodes.sort(
                (left, right) =>
                    left.seasonNumber - right.seasonNumber ||
                    left.episodeNumber - right.episodeNumber,
            );
        }
        return grouped;
    }, [items]);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function startEditing(content) {
        setError("");
        setStatus("");
        setForm({
            ...emptyForm(),
            ...content,
            editingId: content.id,
            seriesId: content.seriesId ?? "",
            media: content.media ?? PLAYABLE_DEFAULTS.media,
            tracks: content.tracks ?? PLAYABLE_DEFAULTS.tracks,
            qualityOptions: content.qualityOptions ?? PLAYABLE_DEFAULTS.qualityOptions,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setStatus("");

        try {
            const payload = buildPayload(form);
            if (form.editingId) {
                await catalogApi.updateContent(form.editingId, payload);
                setStatus("Conteúdo atualizado.");
            } else {
                await catalogApi.createContent(payload);
                setStatus("Conteúdo criado como rascunho.");
            }
            setForm(emptyForm());
            await loadItems();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function changeStatus(contentId, nextStatus) {
        setError("");
        setStatus("");
        try {
            await catalogApi.updateStatus(contentId, nextStatus);
            setStatus("Estado atualizado.");
            await loadItems();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function loadRevisions(contentId) {
        try {
            const response = await catalogApi.listRevisions(contentId);
            setRevisionsByContent((current) => ({ ...current, [contentId]: response.items }));
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function revertRevision(contentId, revisionId) {
        setError("");
        try {
            await catalogApi.revertRevision(contentId, revisionId);
            setStatus("Revisão reposta.");
            await Promise.all([loadItems(), loadRevisions(contentId)]);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    function renderContentActions(content) {
        return (
            <>
                <div className="button-row">
                    <button type="button" onClick={() => startEditing(content)}>Editar</button>
                    <button type="button" onClick={() => changeStatus(content.id, "published")}>Publicar</button>
                    <button type="button" onClick={() => changeStatus(content.id, "archived")}>Arquivar</button>
                    <button type="button" onClick={() => loadRevisions(content.id)}>Ver revisões</button>
                </div>
                <ul>
                    {(revisionsByContent[content.id] ?? []).map((revision) => (
                        <li key={revision.id}>
                            <span>{revision.action} — {new Date(revision.createdAt).toLocaleString("pt-PT")}</span>{" "}
                            <button type="button" onClick={() => revertRevision(content.id, revision.id)}>Reverter</button>
                        </li>
                    ))}
                </ul>
            </>
        );
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Gestão de catálogo</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="form-panel" onSubmit={handleSubmit}>
                <h2>{form.editingId ? "Editar conteúdo" : "Criar conteúdo"}</h2>
                <label>Título<input value={form.title} onChange={(event) => updateField("title", event.target.value)} /></label>
                <label>Sinopse<textarea value={form.synopsis} onChange={(event) => updateField("synopsis", event.target.value)} /></label>
                <label>
                    Tipo
                    <select disabled={Boolean(form.editingId)} value={form.type} onChange={(event) => updateField("type", event.target.value)}>
                        {CONTENT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </label>
                <label>Classificação etária<input min="0" max="18" type="number" value={form.ageRating} onChange={(event) => updateField("ageRating", event.target.value)} /></label>
                {form.type === "episode" ? (
                    <>
                        <label>
                            Série
                            <select required value={form.seriesId} onChange={(event) => updateField("seriesId", event.target.value)}>
                                <option value="">Selecionar série</option>
                                {series.map((content) => <option key={content.id} value={content.id}>{content.title} ({content.status})</option>)}
                            </select>
                        </label>
                        <label>Temporada<input min="1" type="number" value={form.seasonNumber} onChange={(event) => updateField("seasonNumber", event.target.value)} /></label>
                        <label>Episódio<input min="1" type="number" value={form.episodeNumber} onChange={(event) => updateField("episodeNumber", event.target.value)} /></label>
                    </>
                ) : null}
                {form.type !== "series" ? (
                    <>
                        <label>Duração em segundos<input min="1" type="number" value={form.durationSeconds} onChange={(event) => updateField("durationSeconds", event.target.value)} /></label>
                        <label>URL de reprodução<input value={form.media?.playbackUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, media: { playbackUrl: event.target.value } }))} /></label>
                    </>
                ) : null}
                <div className="button-row">
                    <button type="submit">{form.editingId ? "Guardar alterações" : "Criar conteúdo"}</button>
                    {form.editingId ? <button type="button" onClick={() => setForm(emptyForm())}>Cancelar</button> : null}
                </div>
            </form>

            <section aria-label="Séries em gestão">
                <h2>Séries e episódios</h2>
                {series.map((content) => (
                    <article className="content-tile" key={content.id}>
                        <h3>{content.title}</h3>
                        <p>{content.status} · Série</p>
                        {renderContentActions(content)}
                        <div className="content-grid">
                            {(episodesBySeries.get(content.id) ?? []).map((episode) => (
                                <article className="content-card" key={episode.id}>
                                    <p className="content-card-eyebrow">T{episode.seasonNumber} E{episode.episodeNumber}</p>
                                    <h4>{episode.title}</h4>
                                    <p>{episode.status}</p>
                                    {renderContentActions(episode)}
                                </article>
                            ))}
                        </div>
                    </article>
                ))}
            </section>

            <section className="content-grid" aria-label="Outros conteúdos em gestão">
                {items.filter((content) => !["series", "episode"].includes(content.type)).map((content) => (
                    <article className="content-tile" key={content.id}>
                        <h3>{content.title}</h3>
                        <p>{content.status} · {formatContentType(content.type)}</p>
                        {renderContentActions(content)}
                    </article>
                ))}
            </section>
        </section>
    );
}
