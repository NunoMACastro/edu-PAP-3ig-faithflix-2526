# BK-MF6-02 - Suite de regressão frontend

## Header

- `doc_id`: `GUIA-BK-MF6-02`
- `bk_id`: `BK-MF6-02`
- `macro`: `MF6`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-06`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-03`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suite-de-regressao-frontend.md`
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais criar uma verificação de regressão frontend para confirmar que as rotas principais, o cliente API e os ficheiros visuais essenciais continuam presentes antes do hardening de segurança e privacidade.

O resultado final é um script sem dependências novas em `frontend/scripts/check-frontend-regression.mjs`, executado em conjunto com `npm run build`.

#### Importância

O frontend é a porta de entrada dos utilizadores. Depois das MFs anteriores, a aplicação já tem catálogo, player, biblioteca, recomendações, subscrições, associações, privacidade e administração. Uma remoção acidental de rota, página ou configuração do cliente API pode deixar o backend correto mas o produto inutilizável.

Esta regressão protege o fluxo de navegação e prepara `BK-MF6-03`, porque hardening de segurança só faz sentido depois de sabermos que os caminhos principais continuam ligados.

#### Scope-in

- Criar um script estático de regressão frontend.
- Verificar rotas públicas, login, área de conta, player, planos, associações e rotas admin.
- Confirmar que o `apiClient` envia cookies de sessão com `credentials: "include"`.
- Executar build Vite.
- Registar evidence com proof e negativos.

#### Scope-out

- Adicionar Playwright ou outro motor de browser.
- Reescrever páginas React.
- Alterar identidade visual.
- Criar novas funcionalidades de produto.
- Testar pixel-perfect contra o mockup.

#### Estado antes e depois

Antes deste BK, o frontend tem `npm run build`, mas não existe uma verificação simples que diga se as rotas e ficheiros principais continuam presentes.

Depois deste BK, a equipa tem uma regressão frontend rápida: primeiro valida a estrutura crítica por script Node.js, depois valida a compilação real com Vite.

#### Pre-requisitos

- `BK-MF1-02` criou a base React + Vite.
- `BK-MF1-03` criou `apiClient` com tratamento de erro.
- `BK-MF2` criou catálogo, detalhe, player e biblioteca.
- `BK-MF3` criou descoberta, pesquisa e recomendação baseline.
- `BK-MF4` criou planos, associações, pool e notificações.
- `BK-MF5` criou conta, privacidade, métricas, utilizadores e integrações admin.
- `BK-MF6-01` validou regressão backend.

#### Glossário

- Regressão frontend: quebra visual, de rota ou de integração causada por alteração posterior.
- Rota: endereço renderizado pelo React Router.
- Cliente API: módulo central que envia pedidos HTTP para o backend.
- Build: compilação Vite que confirma imports, JSX e módulos.
- Estado vazio: UI apresentada quando não há dados, sem quebrar a página.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF29` exige testes automatizados; em `BK-MF6-02` a cobertura é complementar e focada no frontend.
- `CANONICO`: a stack estabilizada usa React 18, Vite 5, React Router DOM e `fetch/apiClient`.
- `DERIVADO`: o script usa leitura estática de ficheiros porque não existe E2E browser configurado nesta fase.
- Um build verde não prova que todos os fluxos funcionam, mas apanha imports partidos, JSX inválido e ficheiros removidos.
- Uma regressão de rota é crítica porque impede o utilizador de chegar a funcionalidades que o backend ainda suporta.
- Cookies de sessão exigem que o cliente API envie credenciais; sem isso, páginas autenticadas parecem quebradas mesmo com backend correto.

#### Arquitetura do BK

| Camada | Decisão |
| --- | --- |
| Frontend | `frontend` |
| Script novo | `scripts/check-frontend-regression.mjs` |
| Build | `npm run build` |
| Rotas verificadas | catálogo, detalhe, player, login, conta, biblioteca, planos, associações, pesquisa, admin |
| Handoff | `BK-MF6-03` usa estes caminhos para hardening de segurança e privacidade |

#### Ficheiros a criar/editar/rever

- CRIAR: `frontend/scripts/check-frontend-regression.mjs`
- REVER: `frontend/src/routes/AppRoutes.jsx`
- REVER: `frontend/src/pages/LoginPage.jsx`
- REVER: `frontend/src/services/api/apiClient.js`
- REVER: `frontend/package.json`

#### Tutorial técnico linear

### Passo 1 - Criar o script de regressão frontend

1. Objetivo funcional do passo no contexto da app.

Verificar automaticamente se as rotas, páginas e o cliente API essenciais continuam alinhados.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/scripts/check-frontend-regression.mjs`
    - REVER: `frontend/src/routes/AppRoutes.jsx`
    - REVER: `frontend/src/pages/LoginPage.jsx`
    - REVER: `frontend/src/services/api/apiClient.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `frontend/scripts/` se ainda não existir. Depois cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
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
```

5. Explicação do código.

O script usa `access` para confirmar que páginas e módulos continuam no projeto. Depois lê `AppRoutes.jsx` e procura as rotas que representam os fluxos principais do FaithFlix, incluindo `/login`, porque `RNF29` inclui autenticação entre as áreas mínimas a testar. Por fim confirma `credentials: "include"` no `apiClient`, porque a autenticação por cookie depende dessa opção.

Este script não substitui testes de interação, mas evita uma falha comum em projetos React: apagar uma página ou mudar uma rota sem atualizar a navegação e só descobrir no browser.

6. Validação do passo.

```bash
cd frontend
node scripts/check-frontend-regression.mjs
```

Resultado esperado: `Regressão frontend MF6: PASS`.

7. Cenário negativo/erro esperado.

Remove temporariamente a rota `/login` de `frontend/src/routes/AppRoutes.jsx` ou altera temporariamente a expectativa no script para `path="/login-inexistente"`. Não removas a entrada do array `requiredRoutes`, porque isso apenas deixaria o script de verificar essa rota. A verificação deve falhar com uma mensagem sobre a rota em falta. Reverte a alteração antes de fechar o BK.

### Passo 2 - Executar build Vite

1. Objetivo funcional do passo no contexto da app.

Confirmar que JSX, imports, CSS e dependências frontend compilam no pacote real.

2. Ficheiros envolvidos:
    - REVER: `frontend/package.json`
    - REVER: `frontend/vite.config.js`
    - LOCALIZAÇÃO: comandos executados na raiz `frontend`

3. Instruções do que fazer.

Executa o script de regressão e o build no mesmo terminal, para garantir que a prova de estrutura e a prova de compilação pertencem à mesma versão do código.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação usa `node` e o script `build` já definido no frontend.

5. Explicação do código.

O Vite valida imports e JSX de forma mais realista do que uma leitura estática. Por isso, a suite fica em duas camadas: script rápido para contratos de rota e build para compilação.

6. Validação do passo.

```bash
cd frontend
node scripts/check-frontend-regression.mjs
npm run build
```

Resultado esperado: o script imprime `PASS` e o build termina sem erro.

7. Cenário negativo/erro esperado.

Escreve temporariamente um import inexistente numa cópia local de uma página e executa `npm run build`. O build deve falhar. Reverte a alteração antes de fechar o BK.

### Passo 3 - Confirmar páginas de erro, vazio e carregamento

1. Objetivo funcional do passo no contexto da app.

Garantir que as páginas principais têm UI mínima para falha, ausência de dados e carregamento.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/CatalogPage.jsx`
    - REVER: `frontend/src/pages/SearchPage.jsx`
    - REVER: `frontend/src/pages/ForYouPage.jsx`
    - REVER: `frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: componentes de página completos

3. Instruções do que fazer.

Revê cada página e confirma que pedidos à API distinguem pelo menos três estados: carregamento, erro e ausência de dados. Usa componentes já existentes como `EmptyState` e mensagens em português de Portugal.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O BK valida a presença de estados já introduzidos nas MFs anteriores e só pede correção se algum fluxo estiver incompleto.

5. Explicação do código.

Estados de UI são parte da regressão frontend porque uma chamada API pode falhar sem quebrar o build. O utilizador precisa de feedback claro, alinhado com `RNF05`, mesmo que este BK esteja formalmente mapeado a `RNF29`.

6. Validação do passo.

Abre as páginas principais em ambiente local, força uma falha desligando temporariamente o backend e confirma que surge mensagem clara em vez de página vazia.

7. Cenário negativo/erro esperado.

Com o backend desligado, o frontend deve mostrar erro controlado. Se a página ficar branca, regista a falha e corrige no BK responsável antes de fechar.

### Passo 4 - Registar evidence frontend

1. Objetivo funcional do passo no contexto da app.

Documentar proof e negativos para o gate S12.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md`
    - LOCALIZAÇÃO: ficheiro completo de evidence do BK

3. Instruções do que fazer.

Regista a referência da entrega, os comandos executados, o output real do build e os negativos executados. Não escrevas `PASS` antes de colar o resultado real do terminal.

4. Código completo, correto e integrado com a app final.

```md
# Evidence BK-MF6-02 - Regressão frontend

- Owner: Kaue
- Apoio: Mateus
- Data: PREENCHER_COM_DATA_DA_EXECUCAO
- Requisito: RNF29
- PR/entrega: PREENCHER_COM_REFERENCIA_DO_PR_OU_ENTREGA_LOCAL

## Proof

| Comando | Resultado |
| --- | --- |
| `node scripts/check-frontend-regression.mjs` | PREENCHER_COM_OUTPUT_REAL_DO_SCRIPT |
| `npm run build` | PREENCHER_COM_OUTPUT_REAL_DO_BUILD |

## Negativos

| Cenário | Como executar | Resultado esperado | Resultado obtido |
| --- | --- | --- | --- |
| Rota de login removida de `AppRoutes.jsx` | Remover temporariamente a rota real `/login` | Falha com nome da rota em falta | PREENCHER_COM_RESULTADO_REAL |
| Import inexistente numa página | Escrever temporariamente um import inválido numa cópia local | Build falha | PREENCHER_COM_RESULTADO_REAL |
| Backend desligado em página com API | Abrir página que chama API com backend parado | Mensagem de erro controlada | PREENCHER_COM_RESULTADO_REAL |

## Observações

A regressão protege rotas e cliente API sem adicionar dependências ao frontend.
```

5. Explicação do código.

O ficheiro liga a entrega, o proof técnico e os negativos a `RNF29`. O campo `PR/entrega` identifica onde a alteração foi revista. A tabela de `Proof` guarda o output real dos comandos, e a tabela de `Negativos` mostra que a equipa validou falhas previsíveis, não apenas o caminho feliz.

Os placeholders `PREENCHER_COM_*` existem para impedir que a evidence seja fechada com sucesso antecipado. Só deves substituí-los depois de executar cada comando ou cenário negativo.

6. Validação do passo.

Confirma que todos os campos `PREENCHER_COM_*` foram substituídos por evidência real da execução atual. O output do build deve corresponder à mesma versão do script executada. Não reutilizes outputs de commits anteriores.

7. Cenário negativo/erro esperado.

Se a evidence tiver `PASS` sem output real ou sem `PR/entrega`, o gate deve rejeitar a prova por falta de rastreabilidade.

#### Critérios de aceite

- `scripts/check-frontend-regression.mjs` existe e imprime `PASS`.
- O script verifica rotas, páginas principais, rota de login e `credentials: "include"`.
- `npm run build` termina sem erro.
- Existem pelo menos 3 negativos por prioridade `P0`.
- A evidence inclui `pr`, `proof` e `neg`.

#### Validação final

```bash
cd frontend
node scripts/check-frontend-regression.mjs
npm run build
```

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com o script de regressão.
- `proof`: output do script e do build.
- `neg`: rota de login removida, import inválido e backend indisponível.

#### Handoff

`BK-MF6-03` deve usar a lista de rotas e cliente API protegidos neste BK para validar autorização, privacidade, logs e ausência de exposição indevida de dados.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com regressão frontend sem dependências novas, build Vite e evidence de gate S12.
- `2026-06-19`: evidence corrigida para incluir `PR/entrega`, placeholders de output real e negativo de rota executável contra `AppRoutes.jsx`.
- `2026-06-19`: regressão frontend alinhada com a cobertura prometida, incluindo `LoginPage.jsx` e `path="/login"` no script.
