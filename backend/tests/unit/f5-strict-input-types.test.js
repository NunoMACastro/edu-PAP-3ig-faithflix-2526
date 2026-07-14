/**
 * @file Negativos F5 para tipos JSON reais e scalars HTTP sem coercoes.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { assertMetricsRange } from "../../src/modules/admin-metrics/admin-metrics.validation.js";
import {
    assertValidName,
} from "../../src/modules/auth/auth.validation.js";
import { resetPassword } from "../../src/modules/auth/auth.service.js";
import { isOpaqueToken } from "../../src/modules/auth/token.js";
import {
    assertBiblicalPassageAssociationPayload,
    assertBiblicalPassagePayload,
    assertBiblicalPassageStatus,
} from "../../src/modules/biblical-passages/biblical-passages.validation.js";
import { listBiblicalPassagesForPublishedContent } from "../../src/modules/biblical-passages/biblical-passages.service.js";
import {
    assertCatalogPayload,
    assertMediaOptions,
    assertStatus,
    assertTaxonomyPayload,
    parseCatalogFilters,
} from "../../src/modules/catalog/catalog.validation.js";
import { getPublishedContentDetail } from "../../src/modules/catalog/catalog.service.js";
import {
    assertCharityApplicationPayload,
} from "../../src/modules/charities/charity-applications.validation.js";
import { assertReviewPayload } from "../../src/modules/charities/charity-review.validation.js";
import { assertDistributionMonth } from "../../src/modules/charities/pool-distribution.validation.js";
import { linkUserToCharity } from "../../src/modules/charities/charity-reports.service.js";
import {
    asObjectId as commentObjectId,
    assertCommentBody,
} from "../../src/modules/comments/comments.validation.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
} from "../../src/modules/integrations/integrations.validation.js";
import {
    assertNotificationContent,
} from "../../src/modules/notifications/notifications.validation.js";
import { assertCheckoutPayload } from "../../src/modules/payments/payments.validation.js";
import { assertProgressPayload } from "../../src/modules/playback/playback.validation.js";
import { assertConsentPayload } from "../../src/modules/privacy/privacy.validation.js";
import { assertRatingValue } from "../../src/modules/ratings/ratings.validation.js";
import {
    assertSearchQuery,
    parseSearchFilters,
} from "../../src/modules/search/search.validation.js";
import {
    assertFamilyMembershipStatus,
    assertPlanInterval,
    assertSubscriptionStatus,
} from "../../src/modules/subscriptions/subscriptions.validation.js";
import { assertProfileUpdate } from "../../src/modules/users/user.validation.js";

const VALID_CONTENT = Object.freeze({
    title: "Conteudo estritamente tipado",
    synopsis: "Sinopse suficientemente longa para o contrato editorial.",
    type: "movie",
    durationSeconds: 120,
    ageRating: 6,
});

const VALID_APPLICATION = Object.freeze({
    name: "Associacao local",
    contactName: "Pessoa responsavel",
    email: "contacto@example.com",
    phone: "+351 210 000 000",
    mission: "Apoiar familias e comunidades locais de forma continuada.",
    websiteUrl: "https://example.com",
});

/**
 * Confirma que input mal tipado termina num erro HTTP controlado e nunca num
 * `TypeError` acidental provocado por `.trim()` ou outra coerção implícita.
 *
 * @param {() => unknown} callback Operacao invalida.
 * @param {number} [statusCode=400] Estado HTTP esperado.
 * @returns {void}
 */
function assertControlledError(callback, statusCode = 400) {
    assert.throws(callback, (error) => {
        assert.equal(error instanceof TypeError, false);
        return error?.statusCode === statusCode;
    });
}

/**
 * Versao assíncrona de `assertControlledError` para services que devem falhar
 * antes de obter uma ligação à base de dados.
 *
 * @param {() => Promise<unknown>} callback Operacao invalida.
 * @param {number} [statusCode=400] Estado HTTP esperado.
 * @returns {Promise<void>} Termina depois de confirmar a rejeição.
 */
async function assertControlledRejection(callback, statusCode = 400) {
    await assert.rejects(callback, (error) => {
        assert.equal(error instanceof TypeError, false);
        return error?.statusCode === statusCode;
    });
}

test("F5 query e path aceitam strings escalares mas recusam valores multiplos", () => {
    const id = String(new ObjectId());

    assert.deepEqual(parseCatalogFilters({ type: "movie" }), { type: "movie" });
    assert.equal(parseSearchFilters({ sort: "recent" }).sort, "recent");
    assert.equal(assertSearchQuery("  fe  "), "fe");
    assert.equal(String(commentObjectId(id, "Comentario")), id);
    assert.equal(assertIntegrationKey("simulated_payments"), "simulated_payments");
    assert.equal(assertDistributionMonth("2026-06"), "2026-06");
    assert.ok(
        assertMetricsRange({ from: "2026-01-01", to: "2026-01-02" })
            .fromInclusive,
    );

    assertControlledError(() => parseCatalogFilters({ type: ["movie"] }));
    assertControlledError(() => parseSearchFilters({ sort: ["title"] }));
    assertControlledError(() => assertSearchQuery(["fe"]));
    assertControlledError(() => commentObjectId([id], "Comentario"));
    assertControlledError(() => assertIntegrationKey(["simulated_payments"]));
    assertControlledError(() => assertDistributionMonth(["2026-06"]));
    assertControlledError(() => assertMetricsRange({ from: ["2026-01-01"] }));
});

test("F5 catalogo exige strings e numeros JSON reais", () => {
    assert.equal(assertCatalogPayload(VALID_CONTENT).durationSeconds, 120);
    assert.equal(assertStatus("published"), "published");

    assertControlledError(() =>
        assertCatalogPayload({ ...VALID_CONTENT, title: [VALID_CONTENT.title] }),
    );
    assertControlledError(() =>
        assertCatalogPayload({ ...VALID_CONTENT, type: ["movie"] }),
    );
    assertControlledError(() =>
        assertCatalogPayload({ ...VALID_CONTENT, durationSeconds: "120" }),
    );
    assertControlledError(() =>
        assertCatalogPayload({ ...VALID_CONTENT, ageRating: "6" }),
    );
    assertControlledError(() =>
        assertCatalogPayload({ ...VALID_CONTENT, taxonomyIds: "taxonomy" }),
    );
    assertControlledError(() =>
        assertCatalogPayload({ ...VALID_CONTENT, assets: [] }),
    );
    assertControlledError(() => assertStatus(["published"]));
    assertControlledError(() => assertMediaOptions({ qualityOptions: "720p" }));
});

test("F5 limites editoriais falham em vez de truncar silenciosamente", () => {
    assertControlledError(() =>
        assertCatalogPayload({
            ...VALID_CONTENT,
            assets: { posterUrl: "x".repeat(501) },
        }),
    );
    assertControlledError(() =>
        assertTaxonomyPayload({
            name: "Esperanca",
            description: "x".repeat(501),
        }),
    );
    assertControlledError(() =>
        assertBiblicalPassagePayload({
            book: "Joao",
            chapterStart: 3,
            verseStart: 16,
            text: "Texto suficientemente longo para a passagem.",
            theme: "x".repeat(121),
        }),
    );
    assertControlledError(() =>
        assertBiblicalPassageAssociationPayload({
            passageId: String(new ObjectId()),
            note: "x".repeat(501),
            sortOrder: 0,
        }),
    );
});

test("F5 passagens, rating e progresso recusam numeros serializados como texto", () => {
    const passage = {
        book: "Joao",
        chapterStart: 3,
        verseStart: 16,
        text: "Texto suficientemente longo para a passagem.",
    };

    assert.equal(assertBiblicalPassagePayload(passage).chapterStart, 3);
    assert.equal(assertRatingValue(5), 5);
    assert.equal(
        assertProgressPayload({ currentTimeSeconds: 10 }, 120).currentTimeSeconds,
        10,
    );

    assertControlledError(() =>
        assertBiblicalPassagePayload({ ...passage, chapterStart: "3" }),
    );
    assertControlledError(() =>
        assertBiblicalPassageAssociationPayload({
            passageId: String(new ObjectId()),
            sortOrder: "0",
        }),
    );
    assertControlledError(() => assertBiblicalPassageStatus(["published"]));
    assertControlledError(() => assertRatingValue("5"));
    assertControlledError(() =>
        assertProgressPayload({ currentTimeSeconds: "10" }, 120),
    );
    assertControlledError(() =>
        assertProgressPayload({ currentTimeSeconds: 10 }, "120"),
    );
});

test("F5 restantes bodies rejeitam arrays e objetos em campos escalares", () => {
    assertControlledError(() => assertValidName(["Pessoa"]));
    assertControlledError(() => assertProfileUpdate({ name: { value: "Pessoa" } }));
    assertControlledError(() => assertCommentBody(["Comentario valido"]));
    assertControlledError(() =>
        assertCharityApplicationPayload({
            ...VALID_APPLICATION,
            websiteUrl: [VALID_APPLICATION.websiteUrl],
        }),
    );
    assertControlledError(() =>
        assertReviewPayload({ decision: "rejected", reason: ["Motivo valido"] }),
    );
    assertControlledError(() =>
        assertCheckoutPayload({
            planCode: ["monthly"],
            paymentMethod: "card_test",
        }),
    );
    assertControlledError(() =>
        assertIntegrationUpdate("simulated_payments", {
            enabled: true,
            mode: ["simulation"],
            publicConfig: {},
        }),
    );
    assertControlledError(() =>
        assertNotificationContent({ title: ["Aviso"], message: "Mensagem valida" }),
    );
    assertControlledError(() => assertConsentPayload([]));
    assertControlledError(() => assertPlanInterval(["monthly"]));
    assertControlledError(() => assertSubscriptionStatus(["active"]));
    assertControlledError(() => assertFamilyMembershipStatus(["pending"]));
});

test("F5 token, ids de body e params falham antes de consultar persistencia", async () => {
    const id = String(new ObjectId());
    const token = "a".repeat(64);

    assert.equal(isOpaqueToken(token), true);
    assert.equal(isOpaqueToken([token]), false);

    await assertControlledRejection(() =>
        resetPassword({
            token: [token],
            password: "password-segura",
        }),
    );
    await assertControlledRejection(() => linkUserToCharity(id, 12, id));
    await assertControlledRejection(() => getPublishedContentDetail([id]));
    await assertControlledRejection(() =>
        listBiblicalPassagesForPublishedContent([id]),
    );
});
