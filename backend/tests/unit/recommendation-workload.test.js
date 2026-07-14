import assert from "node:assert/strict";
import test from "node:test";
import {
    PAP_RECOMMENDATION_VOLUME,
    estimateRecommendationWorkload,
} from "../../src/modules/recommendations/recommendation-workload.js";

test("budget PAP documenta custo linear sem gate temporal instável", () => {
    assert.deepEqual(estimateRecommendationWorkload(PAP_RECOMMENDATION_VOLUME), {
        signalOperations: 100,
        similarityOperations: 16_000,
        totalOperations: 16_100,
        complexity: "O(signals + candidates * dimensions)",
    });
});
