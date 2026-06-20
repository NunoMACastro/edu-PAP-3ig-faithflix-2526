# BK-MF6-04 - Otimização de performance crítica

## Header

- `doc_id`: `GUIA-BK-MF6-04`
- `bk_id`: `BK-MF6-04`
- `macro`: `MF6`
- `owner`: `Davi`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF6-02`
- `rf_rnf`: `RNF09, RNF10, RNF11, RNF12`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-05`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais fechar a otimização de performance crítica do FaithFlix sem trocar a stack, sem remover validações e sem contornar autenticação. O foco é tornar mensuráveis os pontos de performance ligados a `RNF09`, `RNF10`, `RNF11` e `RNF12`: catálogo, pesquisa, recomendações baseline e capacidade local mínima da API.

O resultado final é a correção do limite no catálogo público, um medidor local em `backend/scripts/measure-performance-baseline.mjs`, uma evidence segura em `docs/evidence/MF6/BK-MF6-04-performance.md` e uma validação frontend com `npm run build`.

#### Importância

Uma aplicação pode estar funcional e mesmo assim parecer partida se as páginas demorarem demasiado a responder. No FaithFlix, catálogo e pesquisa são caminhos de descoberta; recomendações ajudam o utilizador a encontrar conteúdo; a API precisa responder de forma previsível para o frontend não acumular estados de loading.

Performance deve ser medida antes de ser otimizada. Sem medição, a equipa pode trocar código legível por código mais complexo sem provar ganho real. Neste BK também vais aprender uma regra importante: melhorar tempo de resposta nunca justifica remover validação, autenticação, autorização, ownership ou auditoria.

#### Scope-in

- Fechar paginação e limite no endpoint público de catálogo.
- Medir `/health`, catálogo, pesquisa e recomendações baseline com `fetch` nativo do Node.js.
- Medir recomendações com cookie de sessão real, sem escrever o valor do cookie em logs ou evidence.
- Executar uma rajada concorrente local para observar degradação controlada.
- Registar `before/after` com tempos reais, estado real e comando usado.
- Executar build frontend depois de alterações visíveis.

#### Scope-out

- Comprar infraestrutura ou serviços externos.
- Provar 100 utilizadores reais em produção.
- Alterar regras de recomendação baseline.
- Remover validações, guards ou auditoria para ganhar velocidade.
- Criar cache distribuída.
- Reescrever o frontend de catálogo, pesquisa ou recomendações.

#### Estado antes e depois

Antes deste BK, existem requisitos de performance nos RNF, a pesquisa já tem paginação e as recomendações já existem em endpoint autenticado. Falta fechar o limite do catálogo público e falta medir recomendações de forma explícita.

Depois deste BK, o catálogo passa a responder com `page`, `limit`, `total` e `items`; o medidor local cobre todos os RNF do BK; a evidence deixa de ter valores fictícios; e o `BK-MF6-05` recebe resultados reais para confirmar que acessibilidade e UX não degradam páginas críticas.

#### Pre-requisitos

- `BK-MF3-03` criou pesquisa unificada com paginação.
- `BK-MF3-05` criou recomendação baseline em `GET /api/recommendations/me`.
- `BK-MF3-06` criou explicabilidade de recomendações.
- `BK-MF5-05` criou métricas admin, mas não métricas técnicas de latência.
- `BK-MF6-02` validou rotas e build frontend.
- `BK-MF6-03` confirmou que hardening não deve ser removido em nome de performance.

#### Glossário

- Latência: tempo entre enviar um pedido e receber a resposta completa.
- Threshold: limite máximo aceitável definido antes da medição.
- Concorrência: vários pedidos em simultâneo.
- Percentil 95: valor abaixo do qual ficaram 95% das medições.
- Baseline: primeira medição usada para comparar melhorias.
- Cookie de sessão: valor HttpOnly criado pelo login e enviado pelo browser para provar identidade.
- Evidence: prova técnica com comando, resultado e negativos executados.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF09` exige listagens de catálogo e resultados de pesquisa abaixo de 2 segundos, usando paginação ou carregamento incremental.
- `CANONICO`: `RNF10` pede suporte a pelo menos 100 utilizadores simultâneos sem degradação significativa.
- `CANONICO`: `RNF11` pede recomendações abaixo de 3 segundos na página "Para si".
- `CANONICO`: `RNF12` pede arquitetura preparada para escalar horizontalmente sem alterações profundas.
- `DERIVADO`: no contexto PAP local, a rajada concorrente com 20 pedidos é uma aproximação técnica para detetar degradação evidente; não é prova de produção para 100 utilizadores.
- Paginação protege performance porque impede respostas gigantes em listagens públicas.
- Medir recomendações exige autenticação porque o endpoint usa sinais do utilizador autenticado. O cookie deve ser usado apenas no ambiente local e nunca deve entrar na evidence.
- Percentis ajudam a evitar conclusões erradas quando uma medição isolada fica anormalmente rápida ou lenta.
- Arquitetura escalável, nesta fase, significa manter módulos separados, endpoints previsíveis, validação centralizada e código que não dependa de estado global frágil.

#### Arquitetura do BK

| Camada | Decisão |
| --- | --- |
| Backend | Fechar paginação em `catalog.validation.js`, `catalog.controller.js` e `catalog.service.js` |
| Script | `backend/scripts/measure-performance-baseline.mjs` |
| API base | `FAITHFLIX_API_BASE_URL` ou `http://127.0.0.1:3000` |
| Sessão | `FAITHFLIX_SESSION_COOKIE` com `faithflix_session=...` apenas no terminal local |
| Endpoints medidos | `/health`, `/api/catalog?limit=12`, `/api/search?q=fe&limit=12`, `/api/recommendations/me` |
| Build frontend | `npm run build` em `frontend` |
| Evidence | `docs/evidence/MF6/BK-MF6-04-performance.md` |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/catalog/catalog.validation.js`
- EDITAR: `backend/src/modules/catalog/catalog.controller.js`
- EDITAR: `backend/src/modules/catalog/catalog.service.js`
- CRIAR: `backend/scripts/measure-performance-baseline.mjs`
- CRIAR: `docs/evidence/MF6/BK-MF6-04-performance.md`
- REVER: `backend/src/modules/search/search.service.js`
- REVER: `backend/src/modules/recommendations/recommendations.routes.js`
- REVER: `frontend/src/pages/CatalogPage.jsx`
- REVER: `frontend/src/pages/SearchPage.jsx`
- REVER: `frontend/src/pages/ForYouPage.jsx`

#### Tutorial técnico linear

### Passo 1 - Fechar limite do catálogo público

1. Objetivo funcional do passo no contexto da app.

Garantir que `GET /api/catalog?limit=12` devolve um payload limitado e mensurável para `RNF09`.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/catalog/catalog.validation.js`
    - EDITAR: `backend/src/modules/catalog/catalog.controller.js`
    - EDITAR: `backend/src/modules/catalog/catalog.service.js`
    - LOCALIZAÇÃO: função nova `parseCatalogPagination`, função completa `getCatalog` e função completa `listPublishedCatalog`

3. Instruções do que fazer.

Adiciona a validação de paginação ao módulo de catálogo, liga o controller aos query params e altera o service para usar `skip`, `limit` e `countDocuments`. Mantém o nome `items` na resposta para o frontend atual continuar a funcionar.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/catalog/catalog.validation.js
/**
 * Valida parâmetros públicos de paginação do catálogo.
 *
 * @param {Record<string, unknown>} input - Parâmetros brutos de query.
 * @returns {{ page: number, limit: number }} Página e limite seguros.
 */
export function parseCatalogPagination(input = {}) {
    const page = Number(input.page ?? 1);
    const limit = Number(input.limit ?? 12);

    // A página nunca pode ser zero ou negativa, porque isso criaria offsets inválidos na query MongoDB.
    if (!Number.isInteger(page) || page < 1) {
        throw new HttpError(400, "Pagina invalida.");
    }

    // O limite máximo protege RNF09 ao impedir que um pedido público descarregue o catálogo inteiro.
    if (!Number.isInteger(limit) || limit < 1 || limit > 24) {
        throw new HttpError(400, "Limite invalido.");
    }

    return { page, limit };
}
```

```js
// backend/src/modules/catalog/catalog.controller.js
/**
 * Devolve conteúdo publicado com paginação pública.
 *
 * @param {import("express").Request} req Pedido HTTP com query params de paginação.
 * @param {import("express").Response} res Resposta HTTP enviada ao frontend.
 * @returns {Promise<unknown>} Resposta com `items`, `page`, `limit` e `total`.
 */
export async function getCatalog(req, res) {
    // A query fica no controller, mas a validação continua no service para proteger a API mesmo sem frontend.
    return res.status(200).json(await listPublishedCatalog(req.query));
}
```

```js
// backend/src/modules/catalog/catalog.service.js
import {
    assertCatalogPayload,
    assertStatus,
    parseCatalogPagination,
} from "./catalog.validation.js";
```

```js
// backend/src/modules/catalog/catalog.service.js
/**
 * Lista conteúdo público publicado com paginação segura.
 *
 * @param {Record<string, unknown>} [queryParams={}] Query params recebidos pela rota pública.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Página pública do catálogo.
 */
export async function listPublishedCatalog(queryParams = {}) {
    const { page, limit } = parseCatalogPagination(queryParams);
    const db = await getDb();
    // O catálogo público nunca deve incluir rascunhos ou conteúdos arquivados.
    const filter = { status: "published" };

    const [contents, total] = await Promise.all([
        db
            .collection("contents")
            .find(filter)
            .sort({ publishedAt: -1, title: 1 })
            // A paginação é feita no MongoDB para evitar carregar o catálogo inteiro em memória.
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        // O total é contado em paralelo para manter a resposta útil sem duplicar a query de listagem.
        db.collection("contents").countDocuments(filter),
    ]);

    return {
        page,
        limit,
        total,
        items: contents.map(publicContent),
    };
}
```

5. Explicação do código.

`parseCatalogPagination` aplica a mesma ideia que já existe na pesquisa: `page` começa em `1`, `limit` começa em `12` e o limite máximo fica em `24`. Isto protege `RNF09`, porque impede que um pedido público devolva todo o catálogo quando só precisa de uma página.

`getCatalog` deixa de ignorar `req.query` e passa esses parâmetros ao service. O service usa `skip` e `limit` diretamente na query MongoDB, por isso a base de dados devolve apenas a página pedida. `countDocuments` permite ao frontend ou à evidence saber quantos itens publicados existem no total sem descarregar todos.

O formato mantém `items`, por isso `CatalogPage.jsx`, que já faz `setItems(response.items)`, continua compatível. A parte que o aluno pode adaptar com segurança é o limite máximo `24`, desde que o valor continue documentado. O aluno não deve remover o filtro `status: "published"`, porque isso quebraria o contrato de catálogo público criado em `BK-MF2-03`.

6. Validação do passo.

```bash
curl "http://127.0.0.1:3000/api/catalog?limit=12"
```

Resultado esperado: HTTP `200` com `items`, `page`, `limit` e `total`; `items.length` não deve passar de `12`.

7. Cenário negativo/erro esperado.

```bash
curl "http://127.0.0.1:3000/api/catalog?limit=100"
```

Resultado esperado: HTTP `400` com mensagem de limite inválido.

### Passo 2 - Criar medidor local de performance

1. Objetivo funcional do passo no contexto da app.

Medir endpoints críticos com thresholds explícitos, incluindo recomendações autenticadas para fechar `RNF11`.

2. Ficheiros envolvidos:
    - CRIAR: `backend/scripts/measure-performance-baseline.mjs`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `backend/scripts/` se ainda não existir e adiciona o ficheiro abaixo. Antes de executar, arranca o backend em outro terminal. Depois faz login no frontend local e copia apenas o par `faithflix_session=...` do cabeçalho `Cookie` para a variável `FAITHFLIX_SESSION_COOKIE`. Não coloques o valor do cookie na evidence.

4. Código completo, correto e integrado com a app final.

```js
// backend/scripts/measure-performance-baseline.mjs
/**
 * @file Medição local de performance para a MF6.
 *
 * Mede catálogo, pesquisa, recomendações autenticadas e uma rajada concorrente
 * curta sem adicionar dependências ao backend FaithFlix.
 */

import { performance } from "node:perf_hooks";

const baseUrl = process.env.FAITHFLIX_API_BASE_URL ?? "http://127.0.0.1:3000";
const sessionCookie = process.env.FAITHFLIX_SESSION_COOKIE ?? "";

const publicCases = [
    { name: "health", path: "/health", thresholdMs: 500 },
    { name: "catalog", path: "/api/catalog?limit=12", thresholdMs: 2000 },
    { name: "search", path: "/api/search?q=fe&limit=12", thresholdMs: 2000 },
];

const authenticatedCases = [
    {
        name: "recommendations",
        path: "/api/recommendations/me",
        thresholdMs: 3000,
    },
];

/**
 * Mede uma chamada HTTP GET lendo a resposta completa.
 *
 * @param {{ name: string, path: string, thresholdMs: number }} testCase Caso a medir.
 * @param {Record<string, string>} [headers={}] Headers seguros do pedido.
 * @returns {Promise<{ name: string, status: number, durationMs: number, thresholdMs: number }>} Resultado da medição.
 */
async function measure(testCase, headers = {}) {
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}${testCase.path}`, { headers });
    await response.arrayBuffer();

    return {
        name: testCase.name,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
        thresholdMs: testCase.thresholdMs,
    };
}

/**
 * Calcula um percentil simples para uma lista curta de durações.
 *
 * @param {number[]} values Valores em milissegundos.
 * @param {number} ratio Percentil em formato decimal, por exemplo `0.95`.
 * @returns {number} Valor do percentil.
 */
function percentile(values, ratio) {
    const sorted = [...values].sort((left, right) => left - right);
    const index = Math.ceil(sorted.length * ratio) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
}

/**
 * Falha cedo quando a medição autenticada não tem cookie de sessão.
 *
 * @returns {void}
 */
function assertSessionCookie() {
    if (!sessionCookie) {
        throw new Error(
            "Define FAITHFLIX_SESSION_COOKIE=faithflix_session=... para medir recomendacoes autenticadas.",
        );
    }
}

assertSessionCookie();

const results = [];

for (const testCase of publicCases) {
    // A primeira chamada aquece o processo local; a segunda fica registada como medição.
    await measure(testCase);
    results.push(await measure(testCase));
}

for (const testCase of authenticatedCases) {
    // O cookie só é enviado para o endpoint autenticado e nunca é escrito no output.
    await measure(testCase, { Cookie: sessionCookie });
    results.push(await measure(testCase, { Cookie: sessionCookie }));
}

const concurrentResults = await Promise.all(
    Array.from({ length: 20 }, () =>
        measure({ name: "health_concorrente", path: "/health", thresholdMs: 500 }),
    ),
);
const concurrentP95 = percentile(
    concurrentResults.map((result) => result.durationMs),
    0.95,
);

results.push({
    name: "health_concorrente_20_p95",
    status: 200,
    durationMs: concurrentP95,
    thresholdMs: 2000,
});

const unauthenticatedRecommendations = await fetch(
    `${baseUrl}/api/recommendations/me`,
);

if (unauthenticatedRecommendations.status !== 401) {
    results.push({
        name: "recommendations_sem_sessao",
        status: unauthenticatedRecommendations.status,
        durationMs: 3001,
        thresholdMs: 3000,
    });
}

console.table(results);

const failures = results.filter(
    (result) => result.status >= 400 || result.durationMs > result.thresholdMs,
);

if (failures.length > 0) {
    console.error("Performance MF6: FAIL");
    for (const failure of failures) {
        console.error(
            `${failure.name}: ${failure.durationMs}ms acima do limite ${failure.thresholdMs}ms`,
        );
    }
    process.exitCode = 1;
} else {
    console.log("Performance MF6: PASS");
}
```

5. Explicação do código.

O script mede três endpoints públicos e um endpoint autenticado. `catalog` e `search` fecham `RNF09`; `recommendations` fecha `RNF11`; a rajada de 20 pedidos a `/health` dá um sinal local para `RNF10`; e o uso de módulos separados, sem estado global novo, preserva `RNF12`.

`measure` lê a resposta completa com `arrayBuffer()`, porque medir apenas o início da resposta podia esconder payloads lentos. `percentile` calcula o P95 da rajada concorrente, evitando que a decisão dependa só do pedido mais rápido. `assertSessionCookie` impede uma falsa medição de recomendações sem sessão real. O cookie entra apenas no header do pedido autenticado e não aparece em `console.table`, `console.error` ou evidence.

O negativo sem sessão confirma que `/api/recommendations/me` continua protegido por autenticação. Se esse pedido devolver algo diferente de `401`, o script transforma o caso em falha para evitar uma otimização que exponha recomendações de outro utilizador.

6. Validação do passo.

```bash
cd backend
FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE="faithflix_session=VALOR_LOCAL" node scripts/measure-performance-baseline.mjs
```

Resultado esperado: tabela de tempos e `Performance MF6: PASS`, sem imprimir o valor do cookie.

7. Cenário negativo/erro esperado.

Executa o script sem `FAITHFLIX_SESSION_COOKIE`. Resultado esperado: falha controlada a pedir cookie de sessão para medir recomendações autenticadas.

### Passo 3 - Validar limites e negativos de API

1. Objetivo funcional do passo no contexto da app.

Confirmar que os endpoints medidos falham de forma controlada quando recebem pedidos inválidos.

2. Ficheiros envolvidos:
    - REVER: `backend/src/modules/catalog/catalog.validation.js`
    - REVER: `backend/src/modules/search/search.validation.js`
    - REVER: `backend/src/modules/recommendations/recommendations.routes.js`
    - LOCALIZAÇÃO: validators e route guard dos endpoints medidos

3. Instruções do que fazer.

Executa os pedidos negativos abaixo com o backend ativo. Não removas validações para reduzir latência; se um negativo deixar de falhar, a otimização quebrou contrato.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo valida contratos que ficaram implementados nos passos anteriores e em BKs anteriores.

5. Explicação do código.

O objetivo aqui é provar que performance não transformou a API num caminho permissivo. Catálogo deve rejeitar limites demasiado altos, pesquisa deve rejeitar queries demasiado curtas e recomendações devem exigir sessão.

6. Validação do passo.

```bash
curl "http://127.0.0.1:3000/api/catalog?limit=100"
curl "http://127.0.0.1:3000/api/search?q=f&limit=12"
curl "http://127.0.0.1:3000/api/recommendations/me"
```

Resultados esperados:

- Catálogo com `limit=100`: HTTP `400`.
- Pesquisa com `q=f`: HTTP `400`.
- Recomendações sem cookie: HTTP `401`.

7. Cenário negativo/erro esperado.

Se algum dos três pedidos devolver HTTP `200`, o BK não está pronto para evidence: existe uma validação ou autenticação a rever antes de fechar performance.

### Passo 4 - Criar evidence sem sucesso antecipado

1. Objetivo funcional do passo no contexto da app.

Registar resultados reais sem deixar valores fictícios que pareçam prova executada.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF6/BK-MF6-04-performance.md`
    - LOCALIZAÇÃO: ficheiro completo de evidence

3. Instruções do que fazer.

Cria o ficheiro abaixo e substitui cada `PREENCHER_COM_*` apenas depois de executar os comandos. Nunca escrevas o valor do cookie de sessão na evidence.

4. Código completo, correto e integrado com a app final.

```md
# Evidence BK-MF6-04 - Performance crítica

- Owner: Davi
- Apoio: Mateus
- Data: PREENCHER_COM_DATA_REAL
- Requisitos: RNF09, RNF10, RNF11, RNF12
- Ambiente: PREENCHER_COM_AMBIENTE_LOCAL

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE=*** node scripts/measure-performance-baseline.mjs` | PREENCHER_COM_PASS_OU_FAIL |
| `npm run build` em `frontend` | PREENCHER_COM_PASS_OU_FAIL |

## Baseline local

| Cenário | Limite | Before | After | Estado real |
| --- | --- | ---: | ---: | --- |
| `/health` | 500ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| `/api/catalog?limit=12` | 2000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| `/api/search?q=fe&limit=12` | 2000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| `/api/recommendations/me` | 3000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| 20 pedidos concorrentes a `/health` - P95 | 2000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |

## Negativos

| Cenário | Resultado esperado | Resultado real |
| --- | --- | --- |
| API desligada | Script falha | PREENCHER_COM_RESULTADO_REAL |
| Pesquisa com uma letra | HTTP 400 | PREENCHER_COM_RESULTADO_REAL |
| Limite de catálogo inválido | HTTP 400 | PREENCHER_COM_RESULTADO_REAL |
| Recomendações sem sessão | HTTP 401 | PREENCHER_COM_RESULTADO_REAL |

## Observações

- O cookie de sessão foi usado apenas como variável de ambiente local.
- O valor do cookie não foi registado neste ficheiro.
- A rajada concorrente local apoia RNF10, mas não substitui teste de carga de produção.
```

5. Explicação do código.

Este ficheiro é Markdown, mas continua a ser um artefacto técnico. Os placeholders impedem sucesso antecipado: o aluno só pode escrever `PASS` depois de ter o output real. A linha de recomendações fecha `RNF11`, que estava ausente antes. A nota sobre o cookie protege privacidade e evita que uma prova técnica se transforme em fuga de sessão.

6. Validação do passo.

Confirma que não existem `0ms` ou `PASS` fictícios no ficheiro antes da execução real.

7. Cenário negativo/erro esperado.

Se a evidence contiver `faithflix_session=` com valor real, apaga esse valor antes de partilhar o PR ou a defesa.

### Passo 5 - Validar build frontend após performance

1. Objetivo funcional do passo no contexto da app.

Confirmar que alterações de performance não quebram páginas visíveis.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/CatalogPage.jsx`
    - REVER: `frontend/src/pages/SearchPage.jsx`
    - REVER: `frontend/src/pages/ForYouPage.jsx`
    - LOCALIZAÇÃO: comandos na raiz `frontend`

3. Instruções do que fazer.

Depois de alterar o contrato de catálogo e de medir recomendações, executa o build do frontend. O frontend atual continua a consumir `response.items`, por isso a resposta paginada do catálogo mantém compatibilidade.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação usa Vite, já existente no frontend.

5. Explicação do código.

Otimização frontend pode quebrar imports, estado React ou JSX. O build é a prova mínima antes de abrir o gate de acessibilidade. Este passo também confirma que a resposta de catálogo com `items`, `page`, `limit` e `total` continua a encaixar no consumo atual.

6. Validação do passo.

```bash
cd frontend
npm run build
```

Resultado esperado: build sem erro.

7. Cenário negativo/erro esperado.

Se o build falhar por import removido ou por alteração de shape da resposta, corrige a ligação antes de fechar este BK.

#### Critérios de aceite

- `GET /api/catalog?limit=12` devolve no máximo 12 itens publicados.
- `GET /api/catalog?limit=100` devolve HTTP `400`.
- `GET /api/search?q=fe&limit=12` devolve resultados paginados abaixo do limite local.
- `GET /api/search?q=f&limit=12` devolve HTTP `400`.
- `GET /api/recommendations/me` é medido com cookie de sessão real e fica abaixo de 3000ms.
- `GET /api/recommendations/me` sem cookie devolve HTTP `401`.
- A rajada local de 20 pedidos a `/health` regista P95 abaixo de 2000ms.
- A evidence tem valores reais ou placeholders `PREENCHER_COM_*`, nunca `0ms`/`PASS` fictícios.
- Nenhuma validação, guard, ownership ou auditoria foi removida para melhorar tempo.
- `npm run build` em `frontend` termina sem erro.

#### Validação final

```bash
cd backend
FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE="faithflix_session=VALOR_LOCAL" node scripts/measure-performance-baseline.mjs

cd ../frontend
npm run build
```

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com paginação, medidor e evidence.
- `proof`: tabela de tempos reais para `/health`, catálogo, pesquisa, recomendações e P95 concorrente.
- `neg`: API desligada, pesquisa curta, limite inválido e recomendações sem sessão.
- `fonte`: `RNF09`, `RNF10`, `RNF11`, `RNF12`, `BK-MF6-02`, `BK-MF6-03`.

#### Handoff

`BK-MF6-05` deve usar os resultados reais de performance para confirmar que melhorias visuais, foco por teclado, responsividade e estados de UX não tornam catálogo, pesquisa ou recomendações mais lentos. `BK-MF6-06` deve marcar performance como `PASS` apenas quando a evidence deste BK tiver comandos reais e negativos executados.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com medidor local, tabela before/after e critérios de performance seguros.
- `2026-06-20`: guia corrigido para fechar `RNF11`, remover evidence pré-preenchida, ensinar paginação real do catálogo e reforçar comentários didáticos do medidor.
- `2026-06-20`: comentários didáticos internos reforçados nos blocos de paginação do catálogo.
