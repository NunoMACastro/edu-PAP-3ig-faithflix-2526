/**
 * @file Projeção determinística do custo linear das recomendações locais.
 */

import { CONTENT_EMBEDDING_DIMENSIONS } from "./content-embeddings.service.js";

export const PAP_RECOMMENDATION_VOLUME = Object.freeze({
    signalsPerUser: 100,
    publicCandidates: 250,
    dimensions: CONTENT_EMBEDDING_DIMENSIONS,
});

/**
 * Estima operações escalares sem depender da velocidade da máquina.
 *
 * @param {{signalsPerUser: number, publicCandidates: number, dimensions: number}} volume Volume fechado.
 * @returns {{signalOperations: number, similarityOperations: number, totalOperations: number, complexity: "O(signals + candidates * dimensions)"}} Budget determinístico.
 */
export function estimateRecommendationWorkload(volume) {
    for (const value of Object.values(volume)) {
        if (!Number.isSafeInteger(value) || value < 0) {
            throw new TypeError("Volume de benchmark invalido.");
        }
    }
    const signalOperations = volume.signalsPerUser;
    const similarityOperations =
        volume.publicCandidates * volume.dimensions;
    return {
        signalOperations,
        similarityOperations,
        totalOperations: signalOperations + similarityOperations,
        complexity: "O(signals + candidates * dimensions)",
    };
}
