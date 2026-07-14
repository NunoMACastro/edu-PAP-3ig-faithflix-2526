/** @file Formulário editorial partilhado, organizado por tarefas e secções. */

import { AssetPreviewField } from "./AssetPreviewField.jsx";
import { CatalogTaxonomyPicker } from "./CatalogTaxonomyPicker.jsx";

const TYPES = [
    ["movie", "Filme"],
    ["documentary", "Documentário"],
    ["series", "Série"],
    ["episode", "Episódio"],
];

/**
 * Editor compacto para listas simples de créditos.
 *
 * @param {{legend: string, singular: string, values: string[], limit: number, onChange: (values: string[]) => void}} props Propriedades do grupo.
 * @returns {JSX.Element} Grupo repetível de nomes.
 */
function CreditNames({ legend, singular, values, limit, onChange }) {
    return (
        <fieldset className="credit-editor-group">
            <legend>{legend}</legend>
            <div className="credit-editor-list">
                {values.map((value, index) => (
                    <div className="credit-editor-row" key={`${singular}-${index}`}>
                        <label>
                            {singular} {index + 1}
                            <input
                                maxLength={120}
                                value={value}
                                onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                            />
                        </label>
                        <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>
                    </div>
                ))}
            </div>
            <button type="button" disabled={values.length >= limit} onClick={() => onChange([...values, ""])}>
                Adicionar {singular.toLocaleLowerCase("pt-PT")}
            </button>
        </fieldset>
    );
}

/**
 * @param {{form: Record<string, any>, onChange: (form: Record<string, any>) => void, taxonomies: Array, seriesOptions: Array, section?: "all" | "general" | "presentation", editing?: boolean}} props Propriedades editoriais.
 * @returns {JSX.Element} Campos editoriais agrupados.
 */
export function CatalogEditorForm({
    form,
    onChange,
    taxonomies,
    seriesOptions,
    section = "all",
    editing = false,
}) {
    const showGeneral = section === "all" || section === "general";
    const showPresentation = section === "all" || section === "presentation";
    const setField = (field, value) => onChange({ ...form, [field]: value });
    const setAsset = (field, value) => onChange({
        ...form,
        assets: { ...form.assets, [field]: value },
    });
    const setCredits = (field, value) => onChange({
        ...form,
        credits: { ...form.credits, [field]: value },
    });

    return (
        <div className="catalog-editor-sections">
            {showGeneral ? (
                <>
                    <fieldset className="catalog-form-section">
                        <legend>Informação essencial</legend>
                        <p className="form-help">Identifica o conteúdo e resume o que o público pode esperar.</p>
                        <label>
                            Título
                            <input required minLength={2} maxLength={160} value={form.title} onChange={(event) => setField("title", event.target.value)} />
                        </label>
                        <label>
                            Sinopse
                            <textarea required minLength={20} maxLength={1000} value={form.synopsis} onChange={(event) => setField("synopsis", event.target.value)} />
                        </label>
                        <label>
                            Tipo
                            <select disabled={editing} value={form.type} onChange={(event) => setField("type", event.target.value)}>
                                {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </label>
                    </fieldset>

                    <fieldset className="catalog-form-section">
                        <legend>Detalhes</legend>
                        <div className="catalog-compact-grid">
                            <label>Duração em segundos<input required min="1" type="number" value={form.durationSeconds} onChange={(event) => setField("durationSeconds", event.target.value)} /></label>
                            <label>Classificação etária<input required min="0" max="18" type="number" value={form.ageRating} onChange={(event) => setField("ageRating", event.target.value)} /></label>
                            <label>Ano de lançamento<input min="1888" max={new Date().getFullYear() + 1} type="number" value={form.releaseYear} onChange={(event) => setField("releaseYear", event.target.value)} /></label>
                        </div>
                    </fieldset>

                    {form.type === "episode" ? (
                        <fieldset className="catalog-form-section">
                            <legend>Série e ordenação</legend>
                            <label>
                                Série
                                <select required value={form.seriesId} onChange={(event) => setField("seriesId", event.target.value)}>
                                    <option value="">Seleciona uma série</option>
                                    {seriesOptions.map((series) => <option key={series.id} value={series.id}>{series.title}</option>)}
                                </select>
                            </label>
                            <div className="catalog-compact-grid">
                                <label>Temporada<input required min="1" type="number" value={form.seasonNumber} onChange={(event) => setField("seasonNumber", event.target.value)} /></label>
                                <label>Episódio<input required min="1" type="number" value={form.episodeNumber} onChange={(event) => setField("episodeNumber", event.target.value)} /></label>
                            </div>
                        </fieldset>
                    ) : null}

                    <fieldset className="catalog-form-section">
                        <legend>Classificação</legend>
                        <CatalogTaxonomyPicker
                            items={taxonomies}
                            selectedIds={form.taxonomyIds}
                            onChange={(ids) => setField("taxonomyIds", ids)}
                        />
                    </fieldset>
                </>
            ) : null}

            {showPresentation ? (
                <>
                    <fieldset className="catalog-form-section">
                        <legend>Apresentação visual</legend>
                        <p className="form-help">Confirma as imagens antes de guardar; os URLs continuam a ser validados pelo backend.</p>
                        <div className="catalog-assets-grid">
                            <AssetPreviewField label="URL do cartaz editorial" value={form.assets.posterUrl} onChange={(value) => setAsset("posterUrl", value)} />
                            <AssetPreviewField kind="backdrop" label="URL da imagem de fundo" value={form.assets.backdropUrl} onChange={(value) => setAsset("backdropUrl", value)} />
                        </div>
                        <AssetPreviewField kind="preview" label="URL do preview promocional" value={form.assets.previewUrl} onChange={(value) => setAsset("previewUrl", value)} />
                    </fieldset>

                    <fieldset className="catalog-form-section">
                        <legend>Créditos</legend>
                        <CreditNames legend="Realização" singular="Realizador" values={form.credits.directors} limit={5} onChange={(values) => setCredits("directors", values)} />
                        <CreditNames legend="Criação" singular="Criador" values={form.credits.creators} limit={5} onChange={(values) => setCredits("creators", values)} />
                        <fieldset className="credit-editor-group">
                            <legend>Elenco</legend>
                            <div className="credit-editor-list">
                                {form.credits.cast.map((member, index) => (
                                    <div className="credit-editor-row credit-editor-cast-row" key={`cast-${index}`}>
                                        <label>Nome<input maxLength={120} value={member.name} onChange={(event) => setCredits("cast", form.credits.cast.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label>
                                        <label>Papel ou personagem<input maxLength={120} value={member.role} onChange={(event) => setCredits("cast", form.credits.cast.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item))} /></label>
                                        <button type="button" onClick={() => setCredits("cast", form.credits.cast.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" disabled={form.credits.cast.length >= 20} onClick={() => setCredits("cast", [...form.credits.cast, { name: "", role: "" }])}>Adicionar ao elenco</button>
                        </fieldset>
                    </fieldset>
                </>
            ) : null}
        </div>
    );
}
