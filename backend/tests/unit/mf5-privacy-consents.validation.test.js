// apps/backend/tests/unit/mf5-privacy-consents.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertConsentPayload } from "../../src/modules/privacy/privacy.validation.js";

test("MF5 valida consentimentos booleanos", () => {
    // O caso positivo prova que só booleanos reais entram no contrato persistido.
    assert.deepEqual(
        assertConsentPayload({
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        }),
        {
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        },
    );

    // O cenário negativo impede que texto de formulário seja aceite como consentimento.
    assert.throws(
        () =>
            assertConsentPayload({
                personalizedRecommendations: "sim",
                operationalNotifications: true,
                anonymousMetrics: false,
            }),
        /verdadeiro ou falso/,
    );
});