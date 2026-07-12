/**
 * @file Benchmark local informativo para o volume PAP de recomendações.
 *
 * Não é um gate temporal: hardware e carga variam. O budget determinístico de
 * operações é a prova estável; o tempo serve apenas para observação local.
 */

import { performance } from "node:perf_hooks";
import {
    PAP_RECOMMENDATION_VOLUME,
    estimateRecommendationWorkload,
} from "../src/modules/recommendations/recommendation-workload.js";

const { publicCandidates, dimensions } = PAP_RECOMMENDATION_VOLUME;
const profile = Array.from({ length: dimensions }, (_, index) =>
    (index % 7) / 7,
);
const candidates = Array.from({ length: publicCandidates }, (_, candidate) =>
    Array.from({ length: dimensions }, (_, index) =>
        ((candidate + 1) * (index + 3) % 17) / 17,
    ),
);
const startedAt = performance.now();
let checksum = 0;
for (const vector of candidates) {
    for (let index = 0; index < dimensions; index += 1) {
        checksum += profile[index] * vector[index];
    }
}
const elapsedMs = performance.now() - startedAt;

console.log(
    JSON.stringify({
        benchmark: "recommendations-pap-linear",
        volume: PAP_RECOMMENDATION_VOLUME,
        budget: estimateRecommendationWorkload(PAP_RECOMMENDATION_VOLUME),
        observedMs: Number(elapsedMs.toFixed(3)),
        checksum: Number(checksum.toFixed(6)),
        timingIsInformational: true,
    }),
);
