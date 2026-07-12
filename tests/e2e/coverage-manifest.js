/**
 * @file Inventário canónico de cobertura do harness E2E.
 *
 * `configured` significa apenas que existe um cenário descobrível. Este
 * inventário não contém estados `passed` e nunca substitui o resultado de uma
 * execução contra uma DB `_e2e` dedicada.
 */

export const E2E_COVERAGE = Object.freeze({
    auth: {
        level: "functional-e2e",
        specs: ["tests/e2e/mf2-flow.spec.js", "tests/e2e/f7-critical-read-only.spec.js"],
    },
    rbac: {
        level: "functional-e2e",
        specs: ["tests/e2e/f7-critical-read-only.spec.js"],
    },
    privacy: {
        level: "functional-e2e-domain-read-only",
        specs: ["tests/e2e/f7-critical-read-only.spec.js"],
        limitation: "A mutação válida fica nos testes locais; o sweep browser prova leitura e rejeição CSRF.",
    },
    family: {
        level: "functional-e2e-chromium",
        specs: ["tests/e2e/mf9-family-subscription.spec.js"],
        limitation: "Firefox/WebKit exigem reseed por engine antes de repetir este fluxo mutável.",
    },
    jobs: {
        level: "local-integration-only",
        specs: [
            "real_dev/backend/tests/unit/billing-jobs.test.js",
            "real_dev/backend/tests/unit/scheduled-jobs.test.js",
        ],
        limitation: "O worker não expõe UI/HTTP; não existe ainda prova browser nem replica set real.",
    },
    search: {
        level: "functional-e2e-domain-read-only",
        specs: ["tests/e2e/f7-critical-read-only.spec.js"],
    },
    adminCatalog: {
        level: "functional-e2e-domain-read-only",
        specs: ["tests/e2e/f7-critical-read-only.spec.js"],
        limitation: "Criação/edição concorrente permanece coberta localmente e não é repetida cross-browser.",
    },
    csrf: {
        level: "functional-e2e-negative",
        specs: ["tests/e2e/f7-critical-read-only.spec.js"],
    },
    media: {
        level: "synthetic-preview-only",
        specs: ["tests/e2e/media-fixtures.spec.js"],
        config: "playwright.media.config.js",
        limitation: "Não prova vídeo real, 4K, CDN, ABR, DRM, carga ou streaming de produção.",
    },
    health: {
        level: "functional-e2e-domain-read-only",
        specs: ["tests/e2e/f7-critical-read-only.spec.js"],
    },
});

export const REQUIRED_E2E_AREAS = Object.freeze([
    "auth",
    "rbac",
    "privacy",
    "family",
    "jobs",
    "search",
    "adminCatalog",
    "csrf",
    "media",
    "health",
]);
