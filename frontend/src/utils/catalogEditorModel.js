/**
 * @file Modelo editorial puro partilhado pela criação e edição do catálogo.
 */

const EMPTY_FORM = Object.freeze({
    id: "",
    version: null,
    title: "",
    synopsis: "",
    type: "movie",
    seriesId: "",
    seasonNumber: "1",
    episodeNumber: "1",
    durationSeconds: "120",
    ageRating: "6",
    releaseYear: "",
    taxonomyIds: [],
    assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
    credits: { directors: [], creators: [], cast: [] },
});

/** @returns {Record<string, unknown>} Formulário editorial independente. */
export function emptyCatalogForm() {
    return {
        ...EMPTY_FORM,
        taxonomyIds: [],
        assets: { ...EMPTY_FORM.assets },
        credits: { directors: [], creators: [], cast: [] },
    };
}

/**
 * Converte o contrato administrativo no estado controlado do formulário.
 *
 * @param {Record<string, unknown>} content Conteúdo devolvido pela API.
 * @returns {Record<string, unknown>} Formulário editorial.
 */
export function contentToCatalogForm(content) {
    return {
        id: content.id,
        version: content.version,
        title: content.title ?? "",
        synopsis: content.synopsis ?? "",
        type: content.type ?? "movie",
        seriesId: content.seriesId ?? "",
        seasonNumber: String(content.seasonNumber ?? 1),
        episodeNumber: String(content.episodeNumber ?? 1),
        durationSeconds: String(content.durationSeconds ?? 120),
        ageRating: String(content.ageRating ?? 0),
        releaseYear: content.releaseYear ? String(content.releaseYear) : "",
        taxonomyIds: [...(content.taxonomyIds ?? [])],
        assets: {
            posterUrl: content.assets?.posterUrl ?? "",
            backdropUrl: content.assets?.backdropUrl ?? "",
            previewUrl: content.assets?.previewUrl ?? "",
        },
        credits: {
            directors: [...(content.credits?.directors ?? [])],
            creators: [...(content.credits?.creators ?? [])],
            cast: (content.credits?.cast ?? []).map((member) => ({
                name: member.name ?? "",
                role: member.role ?? "",
            })),
        },
    };
}

/**
 * Produz exclusivamente o payload permitido pelas mutações editoriais.
 *
 * @param {Record<string, unknown>} form Estado do formulário.
 * @returns {Record<string, unknown>} Payload sem fontes privadas de media.
 */
export function catalogFormToPayload(form) {
    return {
        title: form.title,
        synopsis: form.synopsis,
        type: form.type,
        durationSeconds: Number(form.durationSeconds),
        ageRating: Number(form.ageRating),
        releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        taxonomyIds: form.taxonomyIds,
        assets: { ...form.assets },
        credits: {
            directors: form.credits.directors.map((name) => name.trim()).filter(Boolean),
            creators: form.credits.creators.map((name) => name.trim()).filter(Boolean),
            cast: form.credits.cast
                .map((member) => ({
                    name: member.name.trim(),
                    role: member.role.trim(),
                }))
                .filter((member) => member.name),
        },
        ...(form.type === "episode"
            ? {
                  seriesId: form.seriesId,
                  seasonNumber: Number(form.seasonNumber),
                  episodeNumber: Number(form.episodeNumber),
              }
            : {}),
        ...(form.version ? { expectedVersion: form.version } : {}),
    };
}

/**
 * Cria uma representação determinística para detetar alterações editoriais.
 *
 * @param {Record<string, unknown>} form Formulário atual.
 * @returns {string} Snapshot comparável.
 */
export function catalogFormSnapshot(form) {
    return JSON.stringify(catalogFormToPayload(form));
}
