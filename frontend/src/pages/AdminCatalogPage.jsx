import { useEffect, useState } from "react";
import { catalogApi } from "../services/api/catalogApi.js";

const EMPTY_FORM = {
    title: "",
    synopsis: "",
    type: "movie",
    durationSeconds: 120,
    ageRating: 6,
    assets: { posterUrl: "", backdropUrl: "" },
    media: { playbackUrl: "/media/piloto.mp4" },
    tracks: {
        subtitles: [],
        audio: [{ language: "pt", label: "Portugues", src: "/media/piloto.mp4" }],
    },
    qualityOptions: [
        { label: "720p", value: "720p", playbackUrl: "/media/piloto.mp4" },
    ],
};

/**
 * Minimal catalog administration page.
 *
 * @returns {JSX.Element} Admin catalog page.
 */
export function AdminCatalogPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [revisionsByContent, setRevisionsByContent] = useState({});
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    async function loadItems() {
        const response = await catalogApi.listAdmin();
        setItems(response.items);
    }

    useEffect(() => {
        loadItems().catch((requestError) => setError(requestError.message));
    }, []);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setStatus("");

        try {
            await catalogApi.createContent({
                ...form,
                durationSeconds: Number(form.durationSeconds),
                ageRating: Number(form.ageRating),
            });
            setForm(EMPTY_FORM);
            setStatus("Conteudo criado como rascunho.");
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
        setError("");

        try {
            const response = await catalogApi.listRevisions(contentId);
            setRevisionsByContent((current) => ({
                ...current,
                [contentId]: response.items,
            }));
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function revertRevision(contentId, revisionId) {
        setError("");
        setStatus("");

        try {
            await catalogApi.revertRevision(contentId, revisionId);
            setStatus("Revisao reposta.");
            await loadItems();
            await loadRevisions(contentId);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Gestao de catalogo</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="form-panel" onSubmit={handleSubmit}>
                <label>
                    Titulo
                    <input
                        value={form.title}
                        onChange={(event) =>
                            updateField("title", event.target.value)
                        }
                    />
                </label>
                <label>
                    Sinopse
                    <textarea
                        value={form.synopsis}
                        onChange={(event) =>
                            updateField("synopsis", event.target.value)
                        }
                    />
                </label>
                <label>
                    Tipo
                    <select
                        value={form.type}
                        onChange={(event) =>
                            updateField("type", event.target.value)
                        }
                    >
                        <option value="movie">movie</option>
                        <option value="series">series</option>
                        <option value="episode">episode</option>
                        <option value="documentary">documentary</option>
                    </select>
                </label>
                <label>
                    Duracao em segundos
                    <input
                        min="1"
                        type="number"
                        value={form.durationSeconds}
                        onChange={(event) =>
                            updateField("durationSeconds", event.target.value)
                        }
                    />
                </label>
                <label>
                    Classificacao etaria
                    <input
                        min="0"
                        max="18"
                        type="number"
                        value={form.ageRating}
                        onChange={(event) =>
                            updateField("ageRating", event.target.value)
                        }
                    />
                </label>
                <button type="submit">Criar conteudo</button>
            </form>
            <section className="content-grid" aria-label="Conteudos em gestao">
                {items.map((content) => (
                    <article className="content-tile" key={content.id}>
                        <h2>{content.title}</h2>
                        <p>{content.status}</p>
                        <div className="button-row">
                            <button
                                type="button"
                                onClick={() =>
                                    changeStatus(content.id, "published")
                                }
                            >
                                Publicar
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    changeStatus(content.id, "archived")
                                }
                            >
                                Arquivar
                            </button>
                            <button
                                type="button"
                                onClick={() => loadRevisions(content.id)}
                            >
                                Ver revisoes
                            </button>
                        </div>
                        <ul>
                            {(revisionsByContent[content.id] ?? []).map(
                                (revision) => (
                                    <li key={revision.id}>
                                        <span>
                                            {revision.action} -{" "}
                                            {new Date(
                                                revision.createdAt,
                                            ).toLocaleString("pt-PT")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                revertRevision(
                                                    content.id,
                                                    revision.id,
                                                )
                                            }
                                        >
                                            Reverter
                                        </button>
                                    </li>
                                ),
                            )}
                        </ul>
                    </article>
                ))}
            </section>
        </section>
    );
}
