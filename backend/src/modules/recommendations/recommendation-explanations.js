const EXPLANATIONS = {
    "themes-from-user-signals": {
        title: "Porque recomendamos",
        message:
            "Este grupo usa temas associados aos teus favoritos, historico, watchlist ou ratings positivos.",
        signals: ["temas", "atividade"],
        confidence: "baseline",
    },
    "activity-types": {
        title: "Porque recomendamos",
        message:
            "Este grupo usa tipos de conteudo que aparecem na tua atividade recente.",
        signals: ["tipo de conteudo", "atividade"],
        confidence: "baseline",
    },
    "popular-fallback": {
        title: "Porque recomendamos",
        message:
            "Este grupo completa as sugestoes com conteudos publicados bem avaliados.",
        signals: ["ratings agregados", "catalogo publicado"],
        confidence: "baseline",
    },
    "cold-start-popular": {
        title: "Porque recomendamos",
        message:
            "Como ainda ha poucos sinais teus, este grupo mostra conteudos populares do catalogo.",
        signals: ["ratings agregados", "catalogo publicado"],
        confidence: "cold-start",
    },
    "cold-start-recent": {
        title: "Porque recomendamos",
        message:
            "Como ainda ha poucos sinais teus, este grupo mostra conteudos adicionados recentemente.",
        signals: ["catalogo publicado"],
        confidence: "cold-start",
    },
    "cold-start-catalog": {
        title: "Porque recomendamos",
        message:
            "Como ainda ha poucos sinais teus, este grupo mostra uma selecao geral do catalogo.",
        signals: ["catalogo publicado"],
        confidence: "cold-start",
    },
};

/**
 * Converts a recommendation reason code into a safe user-facing explanation.
 *
 * @param {string} reasonCode - Internal recommendation reason code.
 * @returns {{ title: string, message: string, signals: string[], confidence: string }} Public explanation.
 */
export function buildRecommendationExplanation(reasonCode) {
    return (
        EXPLANATIONS[reasonCode] ?? {
            title: "Porque recomendamos",
            message:
                "Este grupo foi gerado por regras simples da recomendacao baseline.",
            signals: ["catalogo publicado"],
            confidence: "baseline",
        }
    );
}
