/**
 * @file Labels PT-PT para os tipos técnicos de conteúdo do catálogo.
 */

export const CONTENT_TYPE_LABELS = Object.freeze({
    movie: "Filme",
    series: "Série",
    episode: "Episódio",
    documentary: "Documentário",
});

export const CONTENT_TYPE_OPTIONS = Object.freeze(
    Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
    })),
);

export const PUBLIC_CONTENT_TYPE_OPTIONS = Object.freeze(
    CONTENT_TYPE_OPTIONS.filter((option) => option.value !== "episode"),
);

/**
 * Converte o tipo técnico do backend numa label visível ao utilizador.
 *
 * Os valores `movie`, `series`, `episode` e `documentary` continuam a ser o
 * contrato interno da API; esta função limita a tradução à camada de UI.
 *
 * @param {string | null | undefined} type Tipo técnico recebido do backend.
 * @returns {string} Label PT-PT, ou o valor original quando o tipo é desconhecido.
 */
export function formatContentType(type) {
    const normalizedType = String(type ?? "").trim().toLowerCase();

    return CONTENT_TYPE_LABELS[normalizedType] ?? String(type ?? "").trim();
}
