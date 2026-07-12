# BK-MF3-05 - Recomendacao baseline + cold start

## Header

- `doc_id`: `GUIA-BK-MF3-05`
- `bk_id`: `BK-MF3-05`
- `macro`: `MF3`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `L`
- `dependencias`: `BK-MF3-01,BK-MF2-07`
- `rf_rnf`: `RF26, RF27`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-06`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar recomendacao baseline personalizada (`RF26`) e fallback de cold start (`RF27`) sem usar modelos avancados.

No fim, deves conseguir explicar que recomendacao e uma sugestao, nao uma acao automatica; que sinais entram no calculo; e porque utilizadores novos recebem conteudos populares ou recentes em vez de uma personalizacao falsa.

#### Importância

Recomendacao ajuda o utilizador a descobrir conteudos relevantes sem depender apenas de pesquisa. No MVP, a solucao deve ser honesta, simples e auditavel: historico, favoritos, watchlist, ratings e temas associados aos conteudos.

#### Scope-in

- Criar endpoint autenticado `GET /api/recommendations/me`.
- Usar sinais de `playback_progress`, `user_content_lists`, `content_ratings` e feedback explícito apenas com consentimento de personalização ativo.
- Respeitar apenas conteudos `published`.
- Implementar cold start para utilizadores sem sinais.
- Devolver grupos de recomendacao com `reasonCode`.
- Guardar feedback autenticado em `POST /api/recommendations/feedback`.
- Criar cliente frontend `recommendationsApi`.
- Criar pagina `/para-si`.

#### Scope-out

- Vector database dedicado.
- Embeddings persistentes por utilizador.
- Provider externo ativo por defeito.
- Modelos generativos.
- Perfilacao opaca.
- Telemetria de recomendações e embeddings, que não são necessários para
  demonstrar `RF26`/`RF27` nesta baseline.
- Partilha de dados com terceiros.
- Ajustes manuais por admin, que ficam para hardening/operacao posterior.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF3-01` concluido com `content_ratings`.
- `BK-MF2-07` concluido com `user_content_lists` e historico via `playback_progress`.
- `contents` e `taxonomies` existem.
- `requireAuth` esta disponivel.
- Frontend tem router e `apiClient`.

#### Glossário

- `Recomendacao baseline`: sugestao criada por regras simples.
- `Sinal`: dado permitido que ajuda a ordenar sugestoes.
- `Cold start`: caso em que o utilizador ainda nao tem historico suficiente.
- `Fallback`: resposta alternativa honesta quando faltam dados.
- `reasonCode`: codigo tecnico que explica a origem da sugestao.
- `Scoring ponderado`: soma de pesos simples para ordenar candidatos sem modelo opaco.
- `Feedback explicito`: sinal dado pelo utilizador, como pedir mais conteúdos semelhantes ou esconder uma sugestao.
- `Embedding de conteudo`: vector calculado a partir de titulo, sinopse, tipo e taxonomias de um conteudo publicado.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF26` cobre recomendacoes personalizadas.
- `CANONICO`: `RF27` cobre cold start.
- `CANONICO`: os sinais permitidos nesta fase sao historico, favoritos, watchlist, ratings e feedback explicito autenticado.
- `CANONICO`: `RNF37` limita o uso destes dados ao fim de recomendacao.
- `CANONICO`: sem consentimento explícito, sinais pessoais não são lidos para personalização.
- `CANONICO`: o limite parental aplica-se a todos os candidatos, incluindo cold start.
- `DERIVADO`: recomendacao baseline usa scoring ponderado com taxonomias, tipos, ratings, recencia e feedback, mantendo explicabilidade.
- `DERIVADO`: a resposta tem grupos, porque os criterios de aceitacao pedem pelo menos 3 grupos relevantes.

### Tempo estimado

- Rever sinais da `MF2` e ratings: 25 min.
- Backend de recomendacao: 95 min.
- Frontend `/para-si`: 55 min.
- Validacao e evidence: 40 min.

### Erros comuns

- Prometer personalizacao sem dados.
- Incluir conteudos `draft`.
- Usar `userId` vindo do frontend.
- Recomendar o mesmo conteudo em varios grupos.
- Misturar recomendacao com reproducao automatica.

### Check de compreensao

- [ ] Sei listar os sinais usados.
- [ ] Sei explicar cold start.
- [ ] Sei provar que o frontend nao envia `userId`.
- [ ] Sei testar utilizador sem historico.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/recommendations/me` |
| Autenticacao | obrigatoria |
| Rate limit | `60/utilizador/min`, aplicado depois de `requireAuth`; pedido 61 devolve `429 RATE_LIMITED` |
| Sinais | historico, favoritos, watchlist, ratings, feedback |
| Consentimento | `personalizedRecommendations === true` antes de carregar sinais pessoais |
| Parental | todas as queries usam `ageRating <= parentalMaxAgeRating` |
| Cold start | recentes e melhor avaliados publicados |
| Resposta | `groups`, `coldStart`, `personalizationEnabled`, `signalsUsed` |
| Grupos | `because-your-themes`, `because-your-activity`, `popular-start` |
| Feedback | `POST /api/recommendations/feedback` com `contentId` e `action: "not_interested"` |
| Frontend | `recommendationsApi`, `ForYouPage` |
| Handoff | `BK-MF3-06` transforma `reasonCode` em explicacao visivel |

### Contrato atual da referência docente (Fase 2 - 2026-07-09)

- O service carrega primeiro o utilizador e `user_consents`.
- Se `personalizedRecommendations` não for exatamente `true`, não consulta
  histórico, listas ou ratings para personalização; devolve cold start geral com
  `personalizationEnabled: false`.
- Com consentimento ativo, os sinais pessoais podem ser usados e a resposta indica
  `personalizationEnabled: true`.
- `parentalMaxAgeRating` é aplicado em todas as queries de candidatos, também em
  populares, recentes e catálogo. Filtrar apenas no frontend é falha.
- Alterar ou retirar consentimento tem efeito na chamada seguinte; não existe
  cache de sinais pessoais que contorne a escolha atual.

### Formato de resposta

Schema conceptual da resposta. Os identificadores representam nomes de campos;
este bloco não é JavaScript copiável nem output de uma execução.

```text
// O contrato declara os sinais usados sem expor histórico ou dados pessoais brutos.
{
  coldStart,
  personalizationEnabled,
  signalsUsed,
  groups: [
    {
      id,
      title,
      reasonCode,
      items: [{ id, title, slug, posterUrl, type }]
    }
  ]
}
```

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/recommendations/recommendations.service.js`
- CRIAR: `backend/src/modules/recommendations/recommendations.validation.js`
- CRIAR: `backend/src/modules/recommendations/recommendations.controller.js`
- CRIAR: `backend/src/modules/recommendations/recommendations.routes.js`
- EDITAR: `backend/src/app.js`
- CRIAR: `frontend/src/services/api/recommendationsApi.js`
- CRIAR: `frontend/src/pages/ForYouPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`

#### Tutorial técnico linear

### Passo 1 - Criar service de recomendacao

1. Objetivo do passo.

Calcular grupos de recomendacao com regras simples e sinais permitidos.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/recommendations/recommendations.validation.js`
    - CRIAR: `backend/src/modules/recommendations/recommendations.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/recommendations/`, o validator de feedback e
o service.

4. Codigo completo.

`backend/src/modules/recommendations/recommendations.validation.js`

```js
import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export function assertRecommendationFeedback(input) {
  // O body é validado antes de qualquer acesso a propriedades.
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(
      400,
      "O feedback tem de ser um objeto JSON.",
      undefined,
      "INVALID_RECOMMENDATION_FEEDBACK",
    );
  }

  if (typeof input.contentId !== "string" || !ObjectId.isValid(input.contentId)) {
    throw new HttpError(
      400,
      "Conteúdo inválido.",
      undefined,
      "INVALID_RECOMMENDATION_FEEDBACK",
    );
  }

  // A baseline só implementa a exclusão explícita estabelecida neste BK.
  if (input.action !== "not_interested") {
    throw new HttpError(
      400,
      "A ação de feedback é inválida.",
      undefined,
      "INVALID_RECOMMENDATION_FEEDBACK",
    );
  }

  return { contentId: input.contentId, action: input.action };
}
```

`backend/src/modules/recommendations/recommendations.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { assertRecommendationFeedback } from "./recommendations.validation.js";

function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function publicCard(content) {
  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    type: content.type,
    posterUrl: content.assets?.posterUrl ?? "",
  };
}

function addCount(map, key) {
  if (!key) return;
  map.set(String(key), (map.get(String(key)) ?? 0) + 1);
}

function topKeys(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function objectIdsFromStrings(ids) {
  return [...ids]
    .filter((id) => ObjectId.isValid(String(id)))
    .map((id) => ObjectId.createFromHexString(String(id)));
}

async function loadUserSignals(db, userObjectId, maxAgeRating) {
  // O chamador só entra aqui depois de confirmar consentimento explícito para personalização.
  const [lists, history, ratings, feedback] = await Promise.all([
    db.collection("user_content_lists").find({ userId: userObjectId }).toArray(),
    db.collection("playback_progress").find({ userId: userObjectId }).toArray(),
    db.collection("content_ratings").find({ userId: userObjectId, value: { $gte: 4 } }).toArray(),
    db.collection("recommendation_feedback").find({
      userId: userObjectId,
      action: "not_interested",
    }).toArray(),
  ]);

  const contentIds = [
    ...new Set(
      [...lists, ...history, ...ratings].map((row) => String(row.contentId)),
    ),
  ];
  const notInterestedIds = feedback
    .map((row) => String(row.contentId))
    .filter((id) => ObjectId.isValid(id));
  const excludedIds = [...new Set([...contentIds, ...notInterestedIds])];

  if (contentIds.length === 0) {
    return {
      contentIds: [],
      excludedIds,
      taxonomyIds: [],
      types: [],
      signalsUsed: feedback.length > 0 ? ["feedback"] : [],
    };
  }

  // O limite parental condiciona também os sinais usados para construir candidatos.
  const contents = await db.collection("contents").find({
    _id: { $in: objectIdsFromStrings(contentIds) },
    status: "published",
    ageRating: { $lte: maxAgeRating },
  }).toArray();

  const taxonomyCounts = new Map();
  const typeCounts = new Map();

  for (const content of contents) {
    addCount(typeCounts, content.type);
    for (const taxonomyId of content.taxonomyIds ?? []) {
      addCount(taxonomyCounts, taxonomyId);
    }
  }

  const signalsUsed = [];
  if (history.length > 0) signalsUsed.push("history");
  if (lists.some((item) => item.type === "favorite")) signalsUsed.push("favorites");
  if (lists.some((item) => item.type === "watchlist")) signalsUsed.push("watchlist");
  if (ratings.length > 0) signalsUsed.push("ratings");
  if (feedback.length > 0) signalsUsed.push("feedback");

  return {
    contentIds,
    excludedIds,
    taxonomyIds: topKeys(taxonomyCounts),
    types: topKeys(typeCounts),
    signalsUsed,
  };
}

async function listByThemes(db, taxonomyIds, excludedIds, maxAgeRating) {
  if (taxonomyIds.length === 0) return [];

  return db.collection("contents").find({
    _id: { $nin: objectIdsFromStrings(excludedIds) },
    status: "published",
    ageRating: { $lte: maxAgeRating },
    taxonomyIds: { $in: objectIdsFromStrings(taxonomyIds) },
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listByActivityTypes(db, types, excludedIds, maxAgeRating) {
  if (types.length === 0) return [];

  return db.collection("contents").find({
    _id: { $nin: objectIdsFromStrings(excludedIds) },
    status: "published",
    ageRating: { $lte: maxAgeRating },
    type: { $in: types },
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listPopularStart(db, excludedIds = [], maxAgeRating = 18) {
  return db.collection("contents").aggregate([
    {
      $match: {
        _id: { $nin: objectIdsFromStrings(excludedIds) },
        status: "published",
        ageRating: { $lte: maxAgeRating },
      },
    },
    {
      $lookup: {
        from: "content_ratings",
        localField: "_id",
        foreignField: "contentId",
        as: "ratings",
      },
    },
    { $addFields: { ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] } } },
    { $sort: { ratingAverage: -1, publishedAt: -1, title: 1 } },
    { $limit: 8 },
  ]).toArray();
}

async function listRecentStart(db, excludedIds = [], maxAgeRating = 18) {
  return db.collection("contents")
    .find({
      _id: { $nin: objectIdsFromStrings(excludedIds) },
      status: "published",
      ageRating: { $lte: maxAgeRating },
    })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listCatalogStart(db, excludedIds = [], maxAgeRating = 18) {
  return db.collection("contents")
    .find({
      _id: { $nin: objectIdsFromStrings(excludedIds) },
      status: "published",
      ageRating: { $lte: maxAgeRating },
    })
    .sort({ title: 1 })
    .limit(8)
    .toArray();
}

function group(id, title, reasonCode, items) {
  return {
    id,
    title,
    reasonCode,
    items: items.map(publicCard),
  };
}

function dedupeGroups(groupDefinitions) {
  const seenContentIds = new Set();

  // A ordem dos grupos e dos candidatos é vinculativa: ganha a primeira
  // ocorrência e grupos posteriores nunca repetem o mesmo conteúdo.
  return groupDefinitions.map((definition) => ({
    ...definition,
    items: definition.items.filter((item) => {
      const id = String(item.id);
      if (seenContentIds.has(id)) return false;
      seenContentIds.add(id);
      return true;
    }),
  }));
}

async function buildColdStart(db, excludedIds, maxAgeRating) {
  const excluded = [...excludedIds];
  const [popular, recent, catalog] = await Promise.all([
    listPopularStart(db, excluded, maxAgeRating),
    listRecentStart(db, excluded, maxAgeRating),
    listCatalogStart(db, excluded, maxAgeRating),
  ]);

  return {
    coldStart: true,
    signalsUsed: [],
    groups: dedupeGroups([
      group("popular-start", "Populares para comecar", "cold-start-popular", popular),
      group("recent-start", "Adicionados recentemente", "cold-start-recent", recent),
      group("catalog-start", "Sugestoes do catalogo", "cold-start-catalog", catalog),
    ]),
  };
}

export async function ensureRecommendationIndexes() {
  const db = await getDb();
  await db.collection("recommendation_feedback").createIndex(
    { userId: 1, contentId: 1 },
    { unique: true, name: "recommendation_feedback_user_content_unique" },
  );
}

export async function saveRecommendationFeedback(userId, input) {
  const payload = assertRecommendationFeedback(input);
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const contentObjectId = asObjectId(payload.contentId, "Conteúdo");
  const [user, consentDocument] = await Promise.all([
    db.collection("users").findOne({ _id: userObjectId }),
    db.collection("user_consents").findOne({ userId: userObjectId }),
  ]);

  if (!user) {
    throw new HttpError(404, "Utilizador não encontrado.");
  }

  if (consentDocument?.consents?.personalizedRecommendations !== true) {
    throw new HttpError(
      409,
      "Ativa a personalização antes de guardar feedback.",
      undefined,
      "PERSONALIZATION_CONSENT_REQUIRED",
    );
  }

  const maxAgeRating = Number.isInteger(user.parentalMaxAgeRating)
    ? user.parentalMaxAgeRating
    : 18;
  const content = await db.collection("contents").findOne({
    _id: contentObjectId,
    status: "published",
    ageRating: { $lte: maxAgeRating },
  });

  if (!content) {
    throw new HttpError(404, "Conteúdo publicado não encontrado.");
  }

  const now = new Date();
  await db.collection("recommendation_feedback").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { action: payload.action, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  return {
    feedback: {
      contentId: payload.contentId,
      action: payload.action,
      updatedAt: now.toISOString(),
    },
  };
}

export async function getMyRecommendations(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const [user, consentDocument] = await Promise.all([
    db.collection("users").findOne({ _id: userObjectId }),
    db.collection("user_consents").findOne({ userId: userObjectId }),
  ]);
  const maxAgeRating = Number.isInteger(user?.parentalMaxAgeRating)
    ? user.parentalMaxAgeRating
    : 18;
  const personalizationEnabled =
    consentDocument?.consents?.personalizedRecommendations === true;

  if (!personalizationEnabled) {
    return {
      ...(await buildColdStart(db, new Set(), maxAgeRating)),
      personalizationEnabled: false,
    };
  }

  const signals = await loadUserSignals(db, userObjectId, maxAgeRating);
  const coldStart = signals.contentIds.length === 0;

  if (coldStart) {
    const response = await buildColdStart(
      db,
      new Set(signals.excludedIds),
      maxAgeRating,
    );
    return {
      ...response,
      signalsUsed: signals.signalsUsed,
      personalizationEnabled: true,
    };
  }

  const byThemes = await listByThemes(
    db,
    signals.taxonomyIds,
    signals.excludedIds,
    maxAgeRating,
  );
  const byTypes = await listByActivityTypes(
    db,
    signals.types,
    signals.excludedIds,
    maxAgeRating,
  );
  const popular = await listPopularStart(
    db,
    signals.excludedIds,
    maxAgeRating,
  );

  return {
    coldStart: false,
    signalsUsed: signals.signalsUsed,
    personalizationEnabled: true,
    groups: dedupeGroups([
      group("because-your-themes", "Com base nos teus temas", "themes-from-user-signals", byThemes),
      group("because-your-activity", "Com base na tua atividade", "activity-types", byTypes),
      group("popular-start", "Tambem podes gostar", "popular-fallback", popular),
    ]),
  };
}
```

5. Explicacao do codigo ou da decisao.

O service só usa listas pessoais, histórico, ratings e feedback depois de
confirmar consentimento explícito. Sem consentimento, segue diretamente para
cold start sem carregar esses sinais. `not_interested` entra na exclusão de
todas as queries seguintes. `dedupeGroups` percorre a ordem declarada e mantém
deterministicamente apenas a primeira ocorrência de cada `item.id`, tanto em
cold start como na resposta personalizada. Conteúdos já usados como sinal ficam
excluídos e todas as queries aplicam o limite parental.

6. Validacao do passo.

```bash
node -e "import('./src/modules/recommendations/recommendations.service.js').then(({ ensureRecommendationIndexes, getMyRecommendations, saveRecommendationFeedback }) => console.log(typeof ensureRecommendationIndexes, typeof getMyRecommendations, typeof saveRecommendationFeedback))"
```

Resultado esperado: `function function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Executar queries em paralelo sem dedupe final pode repetir um conteúdo em dois
grupos. Ler feedback sem consentimento viola privacidade; ignorá-lo depois de
consentimento ativo volta a recomendar algo que o utilizador recusou.

Sem cold start, um utilizador novo receberia uma lista vazia e a app pareceria partida.

### Passo 2 - Criar controller e rotas

1. Objetivo do passo.

Expor recomendacoes apenas para o utilizador autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/recommendations/recommendations.controller.js`
    - CRIAR: `backend/src/modules/recommendations/recommendations.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e router com `requireAuth`.

4. Codigo completo.

`backend/src/modules/recommendations/recommendations.controller.js`

```js
import {
  getMyRecommendations,
  saveRecommendationFeedback,
} from "./recommendations.service.js";

export async function getRecommendationsForMe(req, res) {
  res.status(200).json(await getMyRecommendations(req.user.id));
}

export async function postRecommendationFeedback(req, res) {
  // A identidade vem exclusivamente da sessão autenticada.
  res.status(200).json(
    await saveRecommendationFeedback(req.user.id, req.body),
  );
}
```

`backend/src/modules/recommendations/recommendations.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  rateLimit,
  rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import {
  getRecommendationsForMe,
  postRecommendationFeedback,
} from "./recommendations.controller.js";

export const recommendationsRouter = Router();

// A identidade só existe depois de `requireAuth`; por isso este limiter vem depois.
const recommendationsByUserLimit = rateLimit({
  scope: "recommendations:user",
  limit: 60,
  windowMs: 60_000,
  key: rateLimitKeys.user,
});

// O pedido 61 é recusado antes de executar queries e scoring do controller.
recommendationsRouter.get(
  "/me",
  requireAuth,
  recommendationsByUserLimit,
  asyncHandler(getRecommendationsForMe),
);
recommendationsRouter.post(
  "/feedback",
  requireAuth,
  recommendationsByUserLimit,
  asyncHandler(postRecommendationFeedback),
);
```

5. Explicacao do codigo ou da decisao.

O frontend nao envia `userId`. A sessao decide o utilizador e protege
privacidade. O limiter corre depois de `requireAuth`, por isso a chave HMAC usa
o utilizador autenticado, e antes do controller, evitando calcular
recomendações que já ultrapassaram a janela. O incremento atómico reutilizado
da MF2 aceita 60 pedidos e recusa o 61 com `Retry-After`. O feedback aceita
apenas `not_interested`, exige consentimento atual e passa a excluir o conteúdo
de todos os grupos na chamada seguinte.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/recommendations/me
```

Resultado esperado sem cookie: `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a rota aceitasse `?userId=...`, um utilizador poderia pedir recomendacoes de outra pessoa.

### Passo 3 - Montar router

1. Objetivo do passo.

Ligar o modulo de recomendacao ao backend.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: imports e montagem de rotas

3. Instrucoes concretas.

Monta `recommendationsRouter` em `/api/recommendations`.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { recommendationsRouter } from "./modules/recommendations/recommendations.routes.js";

app.use("/api/recommendations", recommendationsRouter);
```

Antes de `listen()` no arranque cumulativo:

```js
import { ensureRecommendationIndexes } from "./modules/recommendations/recommendations.service.js";

await ensureRecommendationIndexes();
```

5. Explicacao do codigo ou da decisao.

O dominio `recommendations` fica separado de `discovery`: discovery e publica; recomendacao usa dados pessoais e exige sessao.

6. Validacao do passo.

```bash
npm --prefix backend run dev
```

Resultado esperado: servidor inicia sem erro de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Montar o router sem `requireAuth` quebraria o contrato de privacidade.

### Passo 4 - Criar cliente e pagina frontend

1. Objetivo do passo.

Mostrar recomendacoes ao utilizador autenticado com fallback honesto.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/recommendationsApi.js`
    - CRIAR: `frontend/src/pages/ForYouPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: novos ficheiros completos; adicionar rota `/para-si`

3. Instrucoes concretas.

Cria o cliente e pagina. A pagina deve mostrar loading, erro, cold start e grupos.

4. Codigo completo.

`frontend/src/services/api/recommendationsApi.js`

```js
import { apiClient } from "./apiClient.js";

export const recommendationsApi = {
  getMine(options = {}) {
    // O AbortSignal atravessa o cliente central para cancelar leituras stale.
    return apiClient.get("/api/recommendations/me", options);
  },
  markNotInterested(contentId, options = {}) {
    return apiClient.post(
      "/api/recommendations/feedback",
      { contentId, action: "not_interested" },
      options,
    );
  },
};
```

`frontend/src/pages/ForYouPage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toUserMessage } from "../services/api/apiErrors.js";
import { recommendationsApi } from "../services/api/recommendationsApi.js";

function RecommendationGroup({
  group,
  busyContentId,
  feedbackEnabled,
  onNotInterested,
}) {
  // Grupos sem candidatos não criam secções vazias na navegação assistida.
  if (group.items.length === 0) return null;

  return (
    <section className="recommendation-group" aria-label={group.title}>
      <h2>{group.title}</h2>
      <ul className="content-grid">
        {group.items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {item.posterUrl && <img src={item.posterUrl} alt="" loading="lazy" />}
              <h3>{item.title}</h3>
              <p>{item.type}</p>
              <Link to={`/catalogo/${encodeURIComponent(item.slug)}`}>Ver detalhe</Link>
              {feedbackEnabled && (
                <button
                  type="button"
                  disabled={busyContentId !== null}
                  onClick={() => onNotInterested(item.id)}
                >
                  {busyContentId === item.id ? "A guardar..." : "Não me interessa"}
                </button>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ForYouPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [busyContentId, setBusyContentId] = useState(null);
  const loadEpochRef = useRef(0);
  const feedbackReservedRef = useRef(false);
  const feedbackControllerRef = useRef(null);

  useEffect(() => {
    const epoch = ++loadEpochRef.current;
    const controller = new AbortController();
    // O backend decide cold start e consentimento; o frontend apenas representa o contrato.
    feedbackControllerRef.current?.abort();
    feedbackControllerRef.current = null;
    feedbackReservedRef.current = false;
    setBusyContentId(null);
    setData(null);
    setStatus("loading");
    setError("");
    setMessage("");
    recommendationsApi.getMine({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || epoch !== loadEpochRef.current) return;
        setData(response);
        setStatus("success");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
        if (epoch !== loadEpochRef.current) return;
        setError(
          requestError?.status === 401
            ? "Entra na tua conta para veres recomendações."
            : toUserMessage(requestError),
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadVersion]);

  useEffect(() => () => {
    loadEpochRef.current += 1;
    feedbackControllerRef.current?.abort();
    feedbackControllerRef.current = null;
    feedbackReservedRef.current = false;
  }, []);

  async function markNotInterested(contentId) {
    if (feedbackReservedRef.current) return;
    const epoch = loadEpochRef.current;
    const controller = new AbortController();
    feedbackReservedRef.current = true;
    feedbackControllerRef.current = controller;
    setBusyContentId(contentId);
    setError("");
    setMessage("");

    try {
      await recommendationsApi.markNotInterested(contentId, {
        signal: controller.signal,
      });
      if (controller.signal.aborted || epoch !== loadEpochRef.current) return;
      // O mesmo id é removido de todos os grupos, reforçando o dedupe local.
      setData((current) => ({
        ...current,
        groups: current.groups.map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== contentId),
        })),
      }));
      setMessage("A sugestão foi removida.");
    } catch (requestError) {
      if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
      if (epoch !== loadEpochRef.current) return;
      setError(toUserMessage(requestError));
    } finally {
      if (feedbackControllerRef.current === controller) {
        feedbackControllerRef.current = null;
        feedbackReservedRef.current = false;
        setBusyContentId(null);
      }
    }
  }

  return (
    <main className="for-you-page">
      <h1>Para si</h1>
      {status === "loading" && <p>A carregar recomendacoes...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "error" && (
        <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      )}
      {message && <p role="status">{message}</p>}
      {data?.coldStart && <p>Como ainda ha poucos sinais, mostramos sugestoes gerais do catalogo.</p>}
      {data?.groups.map((group) => (
        <RecommendationGroup
          key={group.id}
          group={group}
          busyContentId={busyContentId}
          feedbackEnabled={data.personalizationEnabled}
          onNotInterested={markNotInterested}
        />
      ))}
      {data?.groups.every((group) => group.items.length === 0) && (
        <p>Ainda nao existem conteudos publicados suficientes para recomendar.</p>
      )}
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const ForYouPage = lazyNamedPage(() => import("../pages/ForYouPage.jsx"), "ForYouPage");

<Route path="/para-si" element={<ForYouPage />} />
```

5. Explicacao do codigo ou da decisao.

A pagina nao tenta calcular recomendacoes no browser. O frontend apenas apresenta
a resposta do backend, porque o backend tem acesso seguro aos sinais do
utilizador. A leitura usa `AbortController`, epoch anti-stale e retry. Só um
`401` apresenta a indicação de login; timeout, rede e `5xx` mantêm a sessão e
mostram o erro seguro do cliente API. Feedback `not_interested` tem reserva
síncrona, cancelamento no cleanup e remove o item de todos os grupos após
sucesso. O router acrescenta a página uma única vez por `lazyNamedPage`, sem
importar eager nem reconstruir a tabela anterior.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Calcular recomendacao no frontend exigiria expor sinais pessoais e quebraria o
principio de privacidade. Tratar qualquer falha como logout esconderia outages e
apagaria sessão válida; apenas HTTP `401` tem essa semântica.

#### Critérios de aceite

- `GET /api/recommendations/me` sem sessao devolve `401`.
- Utilizador sem sinais recebe `coldStart: true`.
- Utilizador sem consentimento recebe `coldStart: true`, `personalizationEnabled: false` e nenhum sinal pessoal é consultado.
- Utilizador com consentimento e historico, favoritos, watchlist ou ratings recebe `personalizationEnabled: true` e pode receber `coldStart: false`.
- A resposta contem ate 3 grupos principais.
- Todos os items devolvidos sao conteudos `published`.
- Conteudos repetidos entre grupos nao aparecem.
- Feedback `not_interested` exclui o conteudo das proximas recomendacoes.
- Limite parental do utilizador e respeitado antes de devolver candidatos.
- O frontend `/para-si` mostra loading, erro, cold start e grupos.
- A página cancela/ignora leituras antigas, permite retry e não trata
  timeout/rede/`5xx` como logout; apenas `401` pede autenticação.
- A resposta inclui `signalsUsed` sem expor detalhes sensiveis.
- O endpoint de feedback sem sessao devolve `401`; body inválido ou ação
  diferente de `not_interested` devolve `400 INVALID_RECOMMENDATION_FEEDBACK`.
- O pedido 61 de recomendações do mesmo utilizador na mesma janela de 60
  segundos devolve `429 RATE_LIMITED` com `Retry-After`; utilizadores diferentes
  têm contadores independentes e o identificador fica pseudonimizado por HMAC.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i http://localhost:3000/api/recommendations/me
```

Resultado esperado: build e testes passam; o `curl` sem sessao devolve `401`.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `recommendations`.
- `proof`: resposta autenticada com `groups`.
- `proof`: resposta de utilizador novo com `coldStart: true`.
- `proof`: feedback guardado e conteudo removido das recomendacoes seguintes.
- `proof`: captura da pagina `/para-si`.
- `neg`: `401` sem sessao, `429` no pedido 61 do mesmo utilizador, feedback
  invalido, consentimento desligado sem leitura de sinais, lista vazia quando
  nao ha conteudos publicados, exclusao de conteudos nao publicados e conteudos
  acima do limite parental também no cold start.

#### Handoff

O `BK-MF3-06` deve usar `reasonCode`, `signalsUsed` e `coldStart` para apresentar explicacoes simples. Nao deve criar outro algoritmo; deve explicar o algoritmo baseline criado aqui.

## Snippet tecnico aplicavel

O código aplicável está nos passos 1 a 4. O recorte seguinte mostra apenas a
forma do `return` dentro do service já criado; não é um módulo autónomo nem deve
ser copiado isoladamente:

```text
// Os grupos transportam descritores editoriais, nunca fontes de reprodução.
return {
  coldStart: false,
  personalizationEnabled: true,
  signalsUsed: signals.signalsUsed,
  groups: [
    group("because-your-themes", "Com base nos teus temas", "themes-from-user-signals", byThemes),
    group("because-your-activity", "Com base na tua atividade", "activity-types", byTypes),
    group("popular-start", "Tambem podes gostar", "popular-fallback", popular),
  ],
};
```

Este trecho separa os grupos e deixa a explicacao preparada para o BK seguinte.

#### Changelog

- `2026-07-10`: montado o limite distribuído `60/utilizador/min` depois de
  autenticação e antes do controller, com o pedido 61 recusado.
- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com recomendacao baseline, cold start, backend, frontend, privacidade e evidence.
