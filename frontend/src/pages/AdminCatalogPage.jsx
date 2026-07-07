/**
 * @file Ficheiro `real_dev/frontend/src/pages/AdminCatalogPage.jsx` da implementação real_dev.
 */

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
        audio: [{ language: "pt", label: "Português", src: "/media/piloto.mp4" }],
    },
    qualityOptions: [
        { label: "720p", value: "720p", playbackUrl: "/media/piloto.mp4" },
    ],
};

/**
 * Página mínima de administração do catálogo.
 *
 * @returns {JSX.Element} Página administrativa de catálogo.
 */
export function AdminCatalogPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [revisionsByContent, setRevisionsByContent] = useState({});
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega a listagem administrativa do catálogo.
     *
     * A resposta da API substitui o estado local usado pela tabela de gestão.
     *
     * @returns {Promise<void>} Termina depois de atualizar `items`.
     */
    async function loadItems() {
        const response = await catalogApi.listAdmin();
        setItems(response.items);
    }

    useEffect(() => {
        loadItems().catch((requestError) => setError(requestError.message));
    }, []);

    /**
     * Atualiza um campo simples do formulário de criação.
     *
     * A função preserva os restantes campos para evitar perder dados já escritos
     * pelo administrador.
     *
     * @param {string} field Nome do campo de topo a alterar.
     * @param {unknown} value Novo valor vindo do controlo de formulário.
     * @returns {void} Não devolve valor; atualiza o estado do formulário.
     */
    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    /**
     * Submete o formulário de criação de conteúdo.
     *
     * Converte campos numéricos, cria o conteúdo como rascunho e recarrega a
     * listagem administrativa para refletir o novo item.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento de submissão do formulário.
     * @returns {Promise<void>} Termina depois de criar ou apresentar erro.
     */
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
            setStatus("Conteúdo criado como rascunho.");
            await loadItems();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Altera o estado editorial de um item do catálogo.
     *
     * Depois da chamada à API, recarrega a lista para mostrar o estado final
     * calculado pelo backend.
     *
     * @param {string} contentId Identificador do conteúdo a alterar.
     * @param {string} nextStatus Novo estado editorial escolhido.
     * @returns {Promise<void>} Termina depois de atualizar ou apresentar erro.
     */
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

    /**
     * Carrega revisões históricas de um conteúdo.
     *
     * As revisões ficam guardadas por conteúdo para a página poder expandir
     * detalhes sem misturar históricos de itens diferentes.
     *
     * @param {string} contentId Identificador do conteúdo consultado.
     * @returns {Promise<void>} Termina depois de atualizar o mapa de revisões.
     */
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

    /**
     * Repõe uma revisão anterior de um conteúdo.
     *
     * Após a reversão, recarrega a listagem e o histórico para mostrar o estado
     * atualizado criado pelo backend.
     *
     * @param {string} contentId Identificador do conteúdo restaurado.
     * @param {string} revisionId Identificador da revisão escolhida.
     * @returns {Promise<void>} Termina depois de restaurar ou apresentar erro.
     */
    async function revertRevision(contentId, revisionId) {
        setError("");
        setStatus("");

        try {
            await catalogApi.revertRevision(contentId, revisionId);
            setStatus("Revisão reposta.");
            await loadItems();
            await loadRevisions(contentId);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Gestão de catálogo</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="form-panel" onSubmit={handleSubmit}>
                <label>
                    Título
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
                    Duração em segundos
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
                    Classificação etária
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
                <button type="submit">Criar conteúdo</button>
            </form>
            <section className="content-grid" aria-label="Conteúdos em gestão">
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
                                Ver revisões
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
