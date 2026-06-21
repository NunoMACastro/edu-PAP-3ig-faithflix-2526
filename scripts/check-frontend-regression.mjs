// frontend/scripts/check-frontend-regression.mjs
/**
 * @file Verificação de regressão frontend da MF6.
 *
 * Confirma rotas, páginas e contrato do cliente API sem instalar dependências
 * novas nem exigir browser automatizado.
 */

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

const rootDir = cwd();

const requiredFiles = [
  "src/routes/AppRoutes.jsx",
  "src/services/api/apiClient.js",
  "src/pages/CatalogPage.jsx",
  "src/pages/ContentDetailPage.jsx",
  "src/pages/PlaybackPage.jsx",
  "src/pages/LoginPage.jsx",
  "src/pages/AccountPage.jsx",
  "src/pages/SubscriptionPage.jsx",
  "src/pages/PublicCharitiesPage.jsx",
  "src/pages/AdminUsersPage.jsx",
  "src/pages/AdminMetricsPage.jsx",
  "src/pages/AdminIntegrationsPage.jsx",
];

const requiredRoutes = [
  'path="/"',
  'path="/catalogo"',
  'path="/catalogo/:idOrSlug"',
  'path="/ver/:contentId"',
  // A rota de login entra na regressão porque RNF29 inclui autenticação.
  'path="/login"',
  'path="/conta"',
  'path="/biblioteca"',
  'path="/planos"',
  'path="/associacoes"',
  'path="/pesquisa"',
  'path="/admin/utilizadores"',
  'path="/admin/metricas"',
  'path="/admin/integracoes"',
];

/**
 * Lê um ficheiro do frontend a partir da raiz do package.
 *
 * @param {string} relativePath Caminho relativo ao package frontend.
 * @returns {Promise<string>} Conteúdo textual do ficheiro.
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
  // A regressão falha cedo quando alguém remove uma página ainda usada pelas rotas.
  await assertFileExists(filePath);
}

const routesSource = await readProjectFile("src/routes/AppRoutes.jsx");
for (const route of requiredRoutes) {
  assert.ok(routesSource.includes(route), `Rota em falta: ${route}`);
}

const apiClientSource = await readProjectFile("src/services/api/apiClient.js");
assert.ok(
  apiClientSource.includes('credentials: "include"'),
  "O apiClient deve enviar cookies de sessão em pedidos autenticados.",
);

console.log("Regressão frontend MF6: PASS");