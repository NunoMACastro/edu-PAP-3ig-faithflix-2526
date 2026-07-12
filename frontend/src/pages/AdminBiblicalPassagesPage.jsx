/**
 * @file Página administrativa de passagens bíblicas.
 */

import { useEffect, useRef, useState } from "react";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { catalogApi } from "../services/api/catalogApi.js";
import { useAdminConfirmation } from "../components/admin/useAdminConfirmation.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

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
const CONTENT_LIMIT = 50;
const STATUS_LABELS = {
    draft: "Rascunho",
    published: "Publicada",
    archived: "Arquivada",
    missing: "Removida",
};

/**
 * Traduz um estado editorial fechado para PT-PT.
 *
 * @param {unknown} status Estado devolvido pela API.
 * @returns {string} Rótulo legível, sem expor coerções técnicas.
 */
function statusLabel(status) {
    return STATUS_LABELS[status] ?? "Estado desconhecido";
}

/**
 * Desenha os símbolos vetoriais das ações editoriais sem dependências externas.
 * O SVG é decorativo porque o nome acessível pertence sempre ao botão.
 *
 * @param {{ type: "edit" | "visibility" | "archive", active?: boolean }} props Configuração do símbolo.
 * @returns {JSX.Element} Ícone SVG que herda a cor do controlo.
 */
function PassageActionIcon({ type, active = false }) {
    if (type === "edit") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
                <path d="m13.5 6.5 4 4" />
            </svg>
        );
    }

    if (type === "visibility") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
                {!active ? <path d="m4 4 16 16" /> : null}
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                className={active ? "icon-fill" : ""}
            />
            <path d="M3 4h18v4H3zM9 12h6" />
            {active ? <path className="icon-check" d="m8.5 16 2.2 2.2 4.8-5" /> : null}
        </svg>
    );
}

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
export function AdminBiblicalPassagesPage({ initialPassageId = "" }) {
    const { requestConfirmation, confirmationDialog } = useAdminConfirmation();
    const [passages, setPassages] = useState([]);
    const [passagePage, setPassagePage] = useState(1);
    const [passageTotal, setPassageTotal] = useState(0);
    const [contents, setContents] = useState([]);
    const [contentAssociations, setContentAssociations] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [association, setAssociation] = useState(EMPTY_ASSOCIATION);
    const [editingId, setEditingId] = useState("");
    const [dataError, setDataError] = useState("");
    const [associationError, setAssociationError] = useState("");
    const [actionError, setActionError] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [associationsLoading, setAssociationsLoading] = useState(false);
    const [reloadVersion, setReloadVersion] = useState(0);
    const [associationReloadVersion, setAssociationReloadVersion] = useState(0);
    const [busyActions, setBusyActions] = useState(() => new Set());
    const activeActionsRef = useRef(new Set());
    const mutationControllersRef = useRef(new Set());
    const mountedRef = useRef(true);
    const selectedContentIdRef = useRef(association.contentId);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setDataError("");

        Promise.all([
            biblicalPassagesApi.listAdmin(
                { page: passagePage, limit: PASSAGE_LIMIT },
                { signal: controller.signal },
            ),
            catalogApi.listAdmin(
                { page: 1, limit: CONTENT_LIMIT },
                { signal: controller.signal },
            ),
        ])
            .then(([passageResponse, catalogResponse]) => {
                if (!active) return;
                const nextPassages = passageResponse.items ?? [];
                setPassages(nextPassages);
                const initialPassage = initialPassageId
                    ? nextPassages.find((passage) => passage.id === initialPassageId)
                    : null;
                if (initialPassage) {
                    setEditingId(initialPassage.id);
                    setForm({
                        book: initialPassage.book,
                        chapterStart: initialPassage.chapterStart,
                        verseStart: initialPassage.verseStart,
                        chapterEnd: initialPassage.chapterEnd,
                        verseEnd: initialPassage.verseEnd,
                        translation: initialPassage.translation,
                        text: initialPassage.text,
                        theme: initialPassage.theme,
                        reflection: initialPassage.reflection,
                    });
                }
                setPassageTotal(passageResponse.total ?? 0);
                setContents(catalogResponse.items ?? []);
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setDataError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [initialPassageId, passagePage, reloadVersion]);

    useEffect(() => {
        const contentId = association.contentId;

        if (!contentId) {
            setContentAssociations([]);
            setAssociationError("");
            setAssociationsLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        let active = true;
        setAssociationsLoading(true);
        setAssociationError("");

        biblicalPassagesApi
            .listAdminForContent(contentId, { signal: controller.signal })
            .then((response) => {
                if (active) setContentAssociations(response.items ?? []);
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setAssociationError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setAssociationsLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [association.contentId, associationReloadVersion]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            for (const controller of mutationControllersRef.current) {
                controller.abort();
            }
            mutationControllersRef.current.clear();
            activeActionsRef.current.clear();
        };
    }, []);

    /**
     * Reserva uma ação antes do render seguinte para bloquear duplos cliques.
     *
     * @param {string} key Chave estável da ação.
     * @returns {boolean} `true` quando a ação ficou reservada.
     */
    function startAction(key) {
        if (activeActionsRef.current.has(key)) return false;
        activeActionsRef.current.add(key);
        setBusyActions(new Set(activeActionsRef.current));
        return true;
    }

    /**
     * Liberta uma ação depois da resposta ou falha.
     *
     * @param {string} key Chave estável da ação.
     * @returns {void}
     */
    function finishAction(key) {
        activeActionsRef.current.delete(key);
        if (mountedRef.current) {
            setBusyActions(new Set(activeActionsRef.current));
        }
    }

    /**
     * Cria um controller acompanhado até terminar ou a página desmontar.
     *
     * @returns {AbortController} Controller registado.
     */
    function trackedController() {
        const controller = new AbortController();
        mutationControllersRef.current.add(controller);
        return controller;
    }

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
        if (field === "contentId") {
            selectedContentIdRef.current = value;
        }
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
        if (
            editingId &&
            activeActionsRef.current.has(`passage:${editingId}`)
        ) {
            return;
        }

        const actionKey = "passage-form";
        if (!startAction(actionKey)) return;

        const controller = trackedController();
        setActionError("");
        setStatus("");

        try {
            if (editingId) {
                await biblicalPassagesApi.update(
                    editingId,
                    passagePayload(form),
                    { signal: controller.signal },
                );
                if (mountedRef.current) setStatus("Passagem atualizada.");
            } else {
                await biblicalPassagesApi.create(passagePayload(form), {
                    signal: controller.signal,
                });
                if (mountedRef.current) {
                    setStatus("Passagem criada como rascunho.");
                }
            }

            if (mountedRef.current) {
                resetForm();
                setReloadVersion((value) => value + 1);
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setActionError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            finishAction(actionKey);
        }
    }

    /**
     * Atualiza o estado editorial de uma passagem.
     *
     * @param {{ id: string, reference: string, status: string }} passage Passagem selecionada.
     * @param {string} nextStatus Estado pretendido.
     * @returns {Promise<void>} Termina depois da atualização.
     */
    async function changeStatus(passage, nextStatus) {
        if (passage.status === nextStatus) return;
        if (
            editingId === passage.id &&
            activeActionsRef.current.has("passage-form")
        ) {
            return;
        }

        const restoringArchivedPassage =
            passage.status === "archived" && nextStatus === "draft";
        const confirmation = restoringArchivedPassage
            ? `Restaurar «${passage.reference}» como rascunho? A passagem continuará indisponível ao público até ser publicada.`
            : ({
            published: `Publicar «${passage.reference}»? A passagem ficará visível nos conteúdos associados.`,
            draft: `Mover «${passage.reference}» para rascunho? A passagem deixará de estar disponível ao público.`,
            archived: `Arquivar «${passage.reference}»? A passagem deixará de estar disponível ao público.`,
        }[nextStatus]);

        if (!(await requestConfirmation({
            title: "Alterar estado editorial",
            message: confirmation,
            confirmLabel: restoringArchivedPassage
                ? "Restaurar"
                : nextStatus === "published"
                  ? "Publicar"
                  : nextStatus === "archived"
                    ? "Arquivar"
                    : "Passar a rascunho",
            danger: !restoringArchivedPassage && nextStatus !== "published",
        }))) return;

        const actionKey = `passage:${passage.id}`;
        if (!startAction(actionKey)) return;

        const controller = trackedController();
        setActionError("");
        setStatus("");

        try {
            const response = await biblicalPassagesApi.updateStatus(
                passage.id,
                nextStatus,
                { signal: controller.signal },
            );
            if (mountedRef.current) {
                setPassages((current) =>
                    current.map((item) =>
                        item.id === passage.id ? response.passage : item,
                    ),
                );
                setStatus(
                    `Estado alterado para ${statusLabel(nextStatus).toLowerCase()}.`,
                );
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setActionError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            finishAction(actionKey);
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
        const selectedActionKey = `association:${association.contentId}:${association.passageId}`;
        if (activeActionsRef.current.has(selectedActionKey)) return;

        const actionKey = "association-form";
        if (!startAction(actionKey)) return;

        const controller = trackedController();
        setActionError("");
        setStatus("");

        try {
            const selectedContentId = association.contentId;
            await biblicalPassagesApi.linkToContent(
                association.contentId,
                {
                    passageId: association.passageId,
                    note: association.note,
                    sortOrder: Number(association.sortOrder),
                },
                { signal: controller.signal },
            );
            if (mountedRef.current) {
                setAssociation({
                    ...EMPTY_ASSOCIATION,
                    contentId: selectedContentId,
                });
                setStatus("Passagem associada ao conteúdo.");
                setAssociationReloadVersion((value) => value + 1);
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setActionError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            finishAction(actionKey);
        }
    }

    /**
     * Remove uma associação entre conteúdo e passagem.
     *
     * @param {{ contentId: string, passageId: string, reference: string }} item Associação selecionada.
     * @returns {Promise<void>} Termina depois da remoção.
     */
    async function removeAssociation(item) {
        if (!(await requestConfirmation({
            title: "Remover associação",
            message: `Remover a associação de «${item.reference}» deste conteúdo?`,
            confirmLabel: "Remover associação",
            danger: true,
        }))) {
            return;
        }

        if (activeActionsRef.current.has("association-form")) return;

        const actionKey = `association:${item.contentId}:${item.passageId}`;
        if (!startAction(actionKey)) return;

        const controller = trackedController();
        setActionError("");
        setStatus("");

        try {
            await biblicalPassagesApi.unlinkFromContent(
                item.contentId,
                item.passageId,
                { signal: controller.signal },
            );
            if (mountedRef.current) {
                if (selectedContentIdRef.current === item.contentId) {
                    setContentAssociations((current) =>
                        current.filter(
                            (associationItem) =>
                                associationItem.passageId !== item.passageId,
                        ),
                    );
                }
                setStatus("Associação removida.");
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setActionError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            finishAction(actionKey);
        }
    }

    const totalPages = Math.max(1, Math.ceil(passageTotal / PASSAGE_LIMIT));
    const error = actionError || associationError || dataError;
    const passageFormBusy =
        busyActions.has("passage-form") ||
        (editingId ? busyActions.has(`passage:${editingId}`) : false);
    const associationFormBusy = busyActions.has("association-form");
    const selectedAssociationContent = contents.find(
        (content) => content.id === association.contentId,
    );

    return (
        <section className="page-section" data-testid="admin-biblical-passages">
            <p className="section-kicker">Administração</p>
            <h1>Passagens bíblicas</h1>
            {loading ? <p role="status">A carregar passagens...</p> : null}
            {error ? (
                <div role="alert">
                    <p>{error}</p>
                    {dataError || associationError ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (dataError) {
                                    setReloadVersion((value) => value + 1);
                                }
                                if (associationError) {
                                    setAssociationReloadVersion(
                                        (value) => value + 1,
                                    );
                                }
                            }}
                        >
                            Tentar novamente
                        </button>
                    ) : null}
                </div>
            ) : null}
            {status ? <p role="status">{status}</p> : null}

            <form
                className="form-panel app-form app-form--editorial biblical-passage-form"
                onSubmit={handlePassageSubmit}
                aria-busy={passageFormBusy}
            >
                <h2>{editingId ? "Editar passagem" : "Criar passagem"}</h2>
                <p className="form-intro">
                    Define a referência e o texto editorial. A passagem é criada em
                    rascunho e pode ser publicada depois da revisão.
                </p>
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
                    <button type="submit" disabled={passageFormBusy}>
                        {passageFormBusy
                            ? "A guardar..."
                            : editingId
                              ? "Guardar alterações"
                              : "Criar rascunho"}
                    </button>
                    {editingId ? (
                        <button
                            type="button"
                            disabled={passageFormBusy}
                            onClick={resetForm}
                        >
                            Cancelar edição
                        </button>
                    ) : null}
                </div>
            </form>

            <form
                className="form-panel app-form app-form--standard biblical-association-form"
                onSubmit={handleAssociationSubmit}
                aria-busy={associationFormBusy}
            >
                <h2>Associar a conteúdo</h2>
                <p className="form-intro">
                    Liga uma passagem existente a um conteúdo e controla a sua ordem
                    de apresentação.
                </p>
                <label>
                    Conteúdo
                    <select
                        value={association.contentId}
                        disabled={associationFormBusy}
                        onChange={(event) =>
                            updateAssociation("contentId", event.target.value)
                        }
                    >
                        <option value="">Selecionar conteúdo</option>
                        {contents.map((content) => (
                            <option key={content.id} value={content.id}>
                                {content.title} ({statusLabel(content.status)})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Passagem
                    <select
                        value={association.passageId}
                        disabled={associationFormBusy}
                        onChange={(event) =>
                            updateAssociation("passageId", event.target.value)
                        }
                    >
                        <option value="">Selecionar passagem</option>
                        {passages.map((passage) => (
                            <option key={passage.id} value={passage.id}>
                                {passage.reference} ({statusLabel(passage.status)})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Nota da associação
                    <input
                        value={association.note}
                        disabled={associationFormBusy}
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
                        disabled={associationFormBusy}
                        onChange={(event) =>
                            updateAssociation("sortOrder", event.target.value)
                        }
                    />
                </label>
                <button
                    type="submit"
                    disabled={
                        associationFormBusy ||
                        !association.contentId ||
                        !association.passageId
                    }
                >
                    {associationFormBusy
                        ? "A associar..."
                        : "Associar passagem"}
                </button>
            </form>

            <section
                className="passage-associations-panel"
                aria-label="Associações do conteúdo selecionado"
            >
                <header className="passage-section-heading">
                    <div>
                        <p className="section-kicker">Contexto editorial</p>
                        <h2>Passagens associadas</h2>
                        <p>
                            {selectedAssociationContent
                                ? `Conteúdo selecionado: ${selectedAssociationContent.title}`
                                : "Seleciona um conteúdo no formulário acima para consultar as ligações existentes."}
                        </p>
                    </div>
                    {selectedAssociationContent ? (
                        <span className={`status-badge status-${selectedAssociationContent.status}`}>
                            {statusLabel(selectedAssociationContent.status)}
                        </span>
                    ) : null}
                </header>
                {associationsLoading ? (
                    <p role="status">A carregar associações...</p>
                ) : null}
                {!association.contentId ? <EmptyState title="Nenhum conteúdo selecionado" description="Escolhe um conteúdo para veres e gerires as passagens associadas." /> : null}
                {association.contentId &&
                !associationsLoading &&
                !associationError &&
                contentAssociations.length === 0 ? (
                    <EmptyState title="Sem passagens associadas" description="Este conteúdo ainda não tem contexto bíblico associado." />
                ) : null}
                {contentAssociations.length > 0 ? (
                    <ul className="passage-association-list">
                        {contentAssociations.map((item) => {
                            const actionKey = `association:${item.contentId}:${item.passageId}`;
                            const busy =
                                associationFormBusy ||
                                busyActions.has(actionKey);

                            return (
                                <li
                                    key={item.passageId}
                                    aria-busy={busy}
                                >
                                    <div>
                                        <div className="passage-card-meta">
                                            <strong>{item.reference}</strong>
                                            <span className={`status-badge status-${item.status}`}>{statusLabel(item.status)}</span>
                                        </div>
                                        <p>{item.theme || "Sem tema definido"}</p>
                                        {item.note ? <small>{item.note}</small> : null}
                                    </div>
                                    <button
                                        type="button"
                                        className="danger-secondary-button"
                                        disabled={busy}
                                        onClick={() => removeAssociation(item)}
                                    >
                                        {busy
                                            ? "A remover..."
                                            : "Remover associação"}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </section>

            <section className="biblical-passage-grid" aria-label="Passagens em gestão">
                {!loading && !dataError && passages.length === 0 ? (
                    <p>Não existem passagens em gestão.</p>
                ) : null}
                {passages.map((passage) => {
                    const busy =
                        busyActions.has(`passage:${passage.id}`) ||
                        (editingId === passage.id &&
                            busyActions.has("passage-form"));
                    const archived = passage.status === "archived";
                    const published = passage.status === "published";
                    const publicationLabel = archived
                        ? `Publicação indisponível enquanto ${passage.reference} está arquivada`
                        : published
                          ? `Passar ${passage.reference} a rascunho`
                          : `Publicar ${passage.reference}`;
                    const archiveLabel = archived
                        ? `Restaurar ${passage.reference} como rascunho`
                        : `Arquivar ${passage.reference}`;

                    return (
                        <article
                            className={`biblical-passage-card${editingId === passage.id ? " is-editing" : ""}`}
                            key={passage.id}
                            aria-busy={busy}
                        >
                            <header>
                                <div className="passage-card-meta">
                                    <span className={`status-badge status-${passage.status}`}>{statusLabel(passage.status)}</span>
                                    <span>{passage.translation || "Tradução não indicada"}</span>
                                </div>
                                <h2>{passage.reference}</h2>
                                <p className="passage-theme">{passage.theme || "Sem tema definido"}</p>
                            </header>
                            <blockquote>{passage.text || "Texto ainda não preenchido."}</blockquote>
                            {passage.reflection ? <p className="passage-reflection">{passage.reflection}</p> : null}
                            <footer className="passage-card-actions" aria-label={`Ações de ${passage.reference}`}>
                                <button
                                    type="button"
                                    className="passage-icon-button"
                                    aria-label={`Editar ${passage.reference}`}
                                    title={`Editar ${passage.reference}`}
                                    disabled={busy}
                                    onClick={() => editPassage(passage)}
                                >
                                    <PassageActionIcon type="edit" />
                                </button>
                                <button
                                    type="button"
                                    className={`passage-icon-button${published ? " is-active" : ""}`}
                                    aria-label={publicationLabel}
                                    aria-pressed={published}
                                    title={publicationLabel}
                                    disabled={busy || archived}
                                    onClick={() => void changeStatus(passage, published ? "draft" : "published")}
                                >
                                    <PassageActionIcon type="visibility" active={published} />
                                </button>
                                <button
                                    type="button"
                                    className={`passage-icon-button passage-archive-toggle${archived ? " is-active" : ""}`}
                                    aria-label={archiveLabel}
                                    aria-pressed={archived}
                                    title={archiveLabel}
                                    disabled={busy}
                                    onClick={() => void changeStatus(passage, archived ? "draft" : "archived")}
                                >
                                    <PassageActionIcon type="archive" active={archived} />
                                </button>
                            </footer>
                            {busy ? (
                                <p role="status">A atualizar passagem...</p>
                            ) : null}
                        </article>
                    );
                })}
            </section>
            <div className="button-row" aria-label="Paginação de passagens">
                <button
                    type="button"
                    disabled={loading || passagePage <= 1}
                    onClick={() => setPassagePage((current) => current - 1)}
                >
                    Anterior
                </button>
                <p>
                    Página {passagePage} de {totalPages}
                </p>
                <button
                    type="button"
                    disabled={loading || passagePage >= totalPages}
                    onClick={() => setPassagePage((current) => current + 1)}
                >
                    Seguinte
                </button>
            </div>
            {confirmationDialog}
        </section>
    );
}
