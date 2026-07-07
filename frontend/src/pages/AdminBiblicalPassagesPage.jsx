/**
 * @file Página administrativa de passagens bíblicas.
 */

import { useEffect, useState } from "react";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { catalogApi } from "../services/api/catalogApi.js";

const EMPTY_FORM = {
    book: "",
    chapterStart: 1,
    verseStart: 1,
    chapterEnd: 1,
    verseEnd: 1,
    translation: "Parafraseado",
    text: "",
    theme: "",
    reflection: "",
};

const EMPTY_ASSOCIATION = {
    contentId: "",
    passageId: "",
    note: "",
    sortOrder: 0,
};
const PASSAGE_LIMIT = 50;

/**
 * Converte campos numéricos do formulário para números.
 *
 * @param {Record<string, unknown>} form Dados do formulário.
 * @returns {Record<string, unknown>} Payload da API.
 */
function passagePayload(form) {
    return {
        ...form,
        chapterStart: Number(form.chapterStart),
        verseStart: Number(form.verseStart),
        chapterEnd: Number(form.chapterEnd),
        verseEnd: Number(form.verseEnd),
    };
}

/**
 * Página de gestão editorial de passagens bíblicas.
 *
 * @returns {JSX.Element} Página admin.
 */
export function AdminBiblicalPassagesPage() {
    const [passages, setPassages] = useState([]);
    const [passagePage, setPassagePage] = useState(1);
    const [passageTotal, setPassageTotal] = useState(0);
    const [contents, setContents] = useState([]);
    const [contentAssociations, setContentAssociations] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [association, setAssociation] = useState(EMPTY_ASSOCIATION);
    const [editingId, setEditingId] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Recarrega passagens e conteúdos administrativos.
     *
     * @returns {Promise<void>} Termina depois de atualizar estado.
     */
    async function loadData() {
        const [passageResponse, catalogResponse] = await Promise.all([
            biblicalPassagesApi.listAdmin({
                page: passagePage,
                limit: PASSAGE_LIMIT,
            }),
            catalogApi.listAdmin(),
        ]);

        setPassages(passageResponse.items ?? []);
        setPassageTotal(passageResponse.total ?? 0);
        setContents(catalogResponse.items ?? []);
    }

    useEffect(() => {
        loadData().catch((requestError) => setError(requestError.message));
    }, [passagePage]);

    /**
     * Carrega associações administrativas do conteúdo selecionado.
     *
     * @param {string} contentId Id do conteúdo.
     * @returns {Promise<void>} Termina depois de atualizar estado.
     */
    async function loadAssociationsForContent(contentId) {
        if (!contentId) {
            setContentAssociations([]);
            return;
        }

        const response = await biblicalPassagesApi.listAdminForContent(contentId);
        setContentAssociations(response.items ?? []);
    }

    useEffect(() => {
        loadAssociationsForContent(association.contentId).catch((requestError) =>
            setError(requestError.message),
        );
    }, [association.contentId]);

    /**
     * Atualiza um campo da passagem em edição.
     *
     * @param {string} field Campo.
     * @param {unknown} value Valor.
     * @returns {void}
     */
    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    /**
     * Atualiza um campo da associação.
     *
     * @param {string} field Campo.
     * @param {unknown} value Valor.
     * @returns {void}
     */
    function updateAssociation(field, value) {
        setAssociation((current) => ({ ...current, [field]: value }));
    }

    /**
     * Limpa o formulário de passagem.
     *
     * @returns {void}
     */
    function resetForm() {
        setForm(EMPTY_FORM);
        setEditingId("");
    }

    /**
     * Coloca uma passagem existente em modo edição.
     *
     * @param {Record<string, unknown>} passage Passagem selecionada.
     * @returns {void}
     */
    function editPassage(passage) {
        setEditingId(passage.id);
        setForm({
            book: passage.book,
            chapterStart: passage.chapterStart,
            verseStart: passage.verseStart,
            chapterEnd: passage.chapterEnd,
            verseEnd: passage.verseEnd,
            translation: passage.translation,
            text: passage.text,
            theme: passage.theme,
            reflection: passage.reflection,
        });
    }

    /**
     * Cria ou atualiza uma passagem bíblica.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento submit.
     * @returns {Promise<void>} Termina depois da gravação.
     */
    async function handlePassageSubmit(event) {
        event.preventDefault();
        setError("");
        setStatus("");

        try {
            if (editingId) {
                await biblicalPassagesApi.update(editingId, passagePayload(form));
                setStatus("Passagem atualizada.");
            } else {
                await biblicalPassagesApi.create(passagePayload(form));
                setStatus("Passagem criada como rascunho.");
            }

            resetForm();
            await loadData();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Atualiza o estado editorial de uma passagem.
     *
     * @param {string} passageId Id da passagem.
     * @param {string} nextStatus Estado pretendido.
     * @returns {Promise<void>} Termina depois da atualização.
     */
    async function changeStatus(passageId, nextStatus) {
        setError("");
        setStatus("");

        try {
            await biblicalPassagesApi.updateStatus(passageId, nextStatus);
            setStatus("Estado da passagem atualizado.");
            await loadData();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Associa a passagem selecionada ao conteúdo selecionado.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento submit.
     * @returns {Promise<void>} Termina depois da associação.
     */
    async function handleAssociationSubmit(event) {
        event.preventDefault();
        setError("");
        setStatus("");

        try {
            const selectedContentId = association.contentId;
            await biblicalPassagesApi.linkToContent(association.contentId, {
                passageId: association.passageId,
                note: association.note,
                sortOrder: Number(association.sortOrder),
            });
            setAssociation({ ...EMPTY_ASSOCIATION, contentId: selectedContentId });
            setStatus("Passagem associada ao conteúdo.");
            await loadAssociationsForContent(selectedContentId);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Remove uma associação entre conteúdo e passagem.
     *
     * @param {string} contentId Id do conteúdo.
     * @param {string} passageId Id da passagem.
     * @returns {Promise<void>} Termina depois da remoção.
     */
    async function removeAssociation(contentId, passageId) {
        setError("");
        setStatus("");

        try {
            await biblicalPassagesApi.unlinkFromContent(contentId, passageId);
            setStatus("Associação removida.");
            await loadAssociationsForContent(contentId);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    const totalPages = Math.max(1, Math.ceil(passageTotal / PASSAGE_LIMIT));

    return (
        <section className="page-section" data-testid="admin-biblical-passages">
            <p className="section-kicker">Admin</p>
            <h1>Passagens bíblicas</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}

            <form className="form-panel" onSubmit={handlePassageSubmit}>
                <h2>{editingId ? "Editar passagem" : "Criar passagem"}</h2>
                <label>
                    Livro
                    <input
                        value={form.book}
                        onChange={(event) => updateField("book", event.target.value)}
                    />
                </label>
                <div className="content-grid">
                    <label>
                        Capítulo inicial
                        <input
                            min="1"
                            type="number"
                            value={form.chapterStart}
                            onChange={(event) =>
                                updateField("chapterStart", event.target.value)
                            }
                        />
                    </label>
                    <label>
                        Versículo inicial
                        <input
                            min="1"
                            type="number"
                            value={form.verseStart}
                            onChange={(event) =>
                                updateField("verseStart", event.target.value)
                            }
                        />
                    </label>
                    <label>
                        Capítulo final
                        <input
                            min="1"
                            type="number"
                            value={form.chapterEnd}
                            onChange={(event) =>
                                updateField("chapterEnd", event.target.value)
                            }
                        />
                    </label>
                    <label>
                        Versículo final
                        <input
                            min="1"
                            type="number"
                            value={form.verseEnd}
                            onChange={(event) =>
                                updateField("verseEnd", event.target.value)
                            }
                        />
                    </label>
                </div>
                <label>
                    Tradução
                    <input
                        value={form.translation}
                        onChange={(event) =>
                            updateField("translation", event.target.value)
                        }
                    />
                </label>
                <label>
                    Tema
                    <input
                        value={form.theme}
                        onChange={(event) => updateField("theme", event.target.value)}
                    />
                </label>
                <label>
                    Texto
                    <textarea
                        value={form.text}
                        onChange={(event) => updateField("text", event.target.value)}
                    />
                </label>
                <label>
                    Reflexão
                    <textarea
                        value={form.reflection}
                        onChange={(event) =>
                            updateField("reflection", event.target.value)
                        }
                    />
                </label>
                <div className="button-row">
                    <button type="submit">
                        {editingId ? "Guardar alterações" : "Criar rascunho"}
                    </button>
                    {editingId ? (
                        <button type="button" onClick={resetForm}>
                            Cancelar edição
                        </button>
                    ) : null}
                </div>
            </form>

            <form className="form-panel" onSubmit={handleAssociationSubmit}>
                <h2>Associar a conteúdo</h2>
                <label>
                    Conteúdo
                    <select
                        value={association.contentId}
                        onChange={(event) =>
                            updateAssociation("contentId", event.target.value)
                        }
                    >
                        <option value="">Selecionar conteúdo</option>
                        {contents.map((content) => (
                            <option key={content.id} value={content.id}>
                                {content.title} ({content.status})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Passagem
                    <select
                        value={association.passageId}
                        onChange={(event) =>
                            updateAssociation("passageId", event.target.value)
                        }
                    >
                        <option value="">Selecionar passagem</option>
                        {passages.map((passage) => (
                            <option key={passage.id} value={passage.id}>
                                {passage.reference} ({passage.status})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Nota da associação
                    <input
                        value={association.note}
                        onChange={(event) =>
                            updateAssociation("note", event.target.value)
                        }
                    />
                </label>
                <label>
                    Ordem
                    <input
                        min="0"
                        type="number"
                        value={association.sortOrder}
                        onChange={(event) =>
                            updateAssociation("sortOrder", event.target.value)
                        }
                    />
                </label>
                <button
                    type="submit"
                    disabled={!association.contentId || !association.passageId}
                >
                    Associar passagem
                </button>
            </form>

            <section
                className="page-section"
                aria-label="Associações do conteúdo selecionado"
            >
                <h2>Associações do conteúdo selecionado</h2>
                {!association.contentId ? (
                    <p>Selecione um conteúdo para ver as passagens associadas.</p>
                ) : null}
                {association.contentId && contentAssociations.length === 0 ? (
                    <p>Este conteúdo não tem passagens associadas.</p>
                ) : null}
                {contentAssociations.length > 0 ? (
                    <div className="content-grid">
                        {contentAssociations.map((item) => (
                            <article className="content-card" key={item.passageId}>
                                <p className="content-card-eyebrow">
                                    {item.reference} · {item.status}
                                </p>
                                <h3>{item.theme || "Sem tema definido"}</h3>
                                {item.note ? <p>{item.note}</p> : null}
                                <button
                                    type="button"
                                    onClick={() =>
                                        removeAssociation(
                                            item.contentId,
                                            item.passageId,
                                        )
                                    }
                                >
                                    Remover associação
                                </button>
                            </article>
                        ))}
                    </div>
                ) : null}
            </section>

            <section className="content-grid" aria-label="Passagens em gestão">
                {passages.map((passage) => (
                    <article className="content-tile" key={passage.id}>
                        <h2>{passage.reference}</h2>
                        <p>{passage.status}</p>
                        <p>{passage.theme || "Sem tema definido"}</p>
                        <div className="button-row">
                            <button
                                type="button"
                                onClick={() => editPassage(passage)}
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={() => changeStatus(passage.id, "published")}
                            >
                                Publicar
                            </button>
                            <button
                                type="button"
                                onClick={() => changeStatus(passage.id, "draft")}
                            >
                                Rascunho
                            </button>
                            <button
                                type="button"
                                onClick={() => changeStatus(passage.id, "archived")}
                            >
                                Arquivar
                            </button>
                        </div>
                    </article>
                ))}
            </section>
            <div className="button-row" aria-label="Paginação de passagens">
                <button
                    type="button"
                    disabled={passagePage <= 1}
                    onClick={() => setPassagePage((current) => current - 1)}
                >
                    Anterior
                </button>
                <p>
                    Página {passagePage} de {totalPages}
                </p>
                <button
                    type="button"
                    disabled={passagePage >= totalPages}
                    onClick={() => setPassagePage((current) => current + 1)}
                >
                    Seguinte
                </button>
            </div>
        </section>
    );
}
