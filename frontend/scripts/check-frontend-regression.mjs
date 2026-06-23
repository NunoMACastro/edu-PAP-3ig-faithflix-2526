/**
 * @file Verificacao de regressao frontend da MF6.
 *
 * Confirma rotas, paginas, estados essenciais de UI e contrato do cliente API
 * sem instalar dependencias novas nem exigir browser automatizado.
 */

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

const rootDir = cwd();

const requiredFiles = [
    "src/components/a11y/SkipLink.jsx",
    "src/routes/AppRoutes.jsx",
    "src/services/api/apiClient.js",
    "src/pages/CatalogPage.jsx",
    "src/pages/ContentDetailPage.jsx",
    "src/pages/PlaybackPage.jsx",
    "src/pages/LoginPage.jsx",
    "src/pages/AccountPage.jsx",
    "src/pages/MyLibraryPage.jsx",
    "src/pages/SubscriptionPage.jsx",
    "src/pages/PublicCharitiesPage.jsx",
    "src/pages/SearchPage.jsx",
    "src/pages/ForYouPage.jsx",
    "src/pages/AdminUsersPage.jsx",
    "src/pages/AdminMetricsPage.jsx",
    "src/pages/AdminIntegrationsPage.jsx",
];

const requiredRoutes = [
    'path="/"',
    'path="/catalogo"',
    'path="/catalogo/:idOrSlug"',
    'path="/ver/:contentId"',
    'path="/login"',
    'path="/conta"',
    'path="/biblioteca"',
    'path="/planos"',
    'path="/associacoes"',
    'path="/pesquisa"',
    'path="/para-si"',
    'path="/admin/utilizadores"',
    'path="/admin/metricas"',
    'path="/admin/integracoes"',
];

const requiredPageStates = [
    {
        path: "src/pages/CatalogPage.jsx",
        markers: ["loading", 'role="alert"', "items.length === 0"],
    },
    {
        path: "src/pages/SearchPage.jsx",
        markers: ["loading", 'role=\"alert\"', "items.length === 0"],
    },
    {
        path: "src/pages/ForYouPage.jsx",
        markers: ["loading", 'role=\"alert\"', "EmptyState"],
    },
    {
        path: "src/pages/AccountPage.jsx",
        markers: ["loading", 'role=\"alert\"', "EmptyState"],
    },
];

const requiredAccessibilityContracts = [
    {
        path: "src/components/a11y/SkipLink.jsx",
        markers: [
            "skip-link",
            "Saltar para o conteúdo principal",
            "conteudo-principal",
        ],
    },
    {
        path: "src/layouts/AppLayout.jsx",
        markers: ["SkipLink", 'id="conteudo-principal"', "tabIndex={-1}"],
    },
    {
        path: "src/components/layout/AppHeader.jsx",
        markers: ["Navegação principal", "Catálogo", "Associações"],
    },
    {
        path: "src/pages/PlaybackPage.jsx",
        markers: [
            "Opções de média",
            'role="group"',
            "Player de vídeo",
            "Áudio",
            "Automática",
            'data-testid="faithflix-player"',
        ],
    },
    {
        path: "src/styles/global.css",
        markers: [".skip-link", ".skip-link:focus-visible", "translateY(-150%)"],
    },
];

/**
 * Le um ficheiro do frontend a partir da raiz do package.
 *
 * @param {string} relativePath Caminho relativo ao package frontend.
 * @returns {Promise<string>} Conteudo textual do ficheiro.
 */
async function readProjectFile(relativePath) {
    return readFile(join(rootDir, relativePath), "utf8");
}

/**
 * Confirma que um ficheiro existe.
 *
 * @param {string} relativePath Caminho relativo ao package frontend.
 * @returns {Promise<void>}
 */
async function assertFileExists(relativePath) {
    await access(join(rootDir, relativePath));
}

for (const filePath of requiredFiles) {
    // A regressao falha cedo quando alguem remove uma pagina ainda usada pelas rotas.
    await assertFileExists(filePath);
}

const routesSource = await readProjectFile("src/routes/AppRoutes.jsx");
for (const route of requiredRoutes) {
    assert.ok(routesSource.includes(route), `Rota em falta: ${route}`);
}

const apiClientSource = await readProjectFile("src/services/api/apiClient.js");
assert.ok(
    apiClientSource.includes('credentials: "include"'),
    "O apiClient deve enviar cookies de sessao em pedidos autenticados.",
);

for (const page of requiredPageStates) {
    const source = await readProjectFile(page.path);

    for (const marker of page.markers) {
        assert.ok(
            source.includes(marker),
            `Estado UI em falta em ${page.path}: ${marker}`,
        );
    }
}

for (const contract of requiredAccessibilityContracts) {
    const source = await readProjectFile(contract.path);

    for (const marker of contract.markers) {
        assert.ok(
            source.includes(marker),
            `Contrato de acessibilidade em falta em ${contract.path}: ${marker}`,
        );
    }
}

console.log("Regressao frontend MF6: PASS");
