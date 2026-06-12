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
- `last_updated`: `2026-06-12`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais implementar recomendacao baseline personalizada (`RF26`) e fallback de cold start (`RF27`) sem usar modelos avancados.

No fim, deves conseguir explicar que recomendacao e uma sugestao, nao uma acao automatica; que sinais entram no calculo; e porque utilizadores novos recebem conteudos populares ou recentes em vez de uma personalizacao falsa.

### Importancia funcional

Recomendacao ajuda o utilizador a descobrir conteudos relevantes sem depender apenas de pesquisa. No MVP, a solucao deve ser honesta, simples e auditavel: historico, favoritos, watchlist, ratings e temas associados aos conteudos.

### Scope-in

- Criar endpoint autenticado `GET /api/recommendations/me`.
- Usar sinais de `playback_progress`, `user_content_lists` e `content_ratings`.
- Respeitar apenas conteudos `published`.
- Implementar cold start para utilizadores sem sinais.
- Devolver grupos de recomendacao com `reasonCode`.
- Criar cliente frontend `recommendationsApi`.
- Criar pagina `/para-si`.

### Scope-out

- Embeddings.
- Modelos generativos.
- Perfilacao opaca.
- Partilha de dados com terceiros.
- Ajustes manuais por admin, que ficam para hardening/operacao posterior.

### Glossario rapido

- `Recomendacao baseline`: sugestao criada por regras simples.
- `Sinal`: dado permitido que ajuda a ordenar sugestoes.
- `Cold start`: caso em que o utilizador ainda nao tem historico suficiente.
- `Fallback`: resposta alternativa honesta quando faltam dados.
- `reasonCode`: codigo tecnico que explica a origem da sugestao.

### Conceitos essenciais

- `CANONICO`: `RF26` cobre recomendacoes personalizadas.
- `CANONICO`: `RF27` cobre cold start.
- `CANONICO`: os sinais permitidos nesta fase sao historico, favoritos, watchlist e ratings.
- `CANONICO`: `RNF37` limita o uso destes dados ao fim de recomendacao.
- `DERIVADO`: recomendacao baseline usa taxonomias e tipos mais frequentes nos sinais do utilizador.
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

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF3-01` concluido com `content_ratings`.
- `BK-MF2-07` concluido com `user_content_lists` e historico via `playback_progress`.
- `contents` e `taxonomies` existem.
- `requireAuth` esta disponivel.
- Frontend tem router e `apiClient`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/recommendations/me` |
| Autenticacao | obrigatoria |
| Sinais | historico, favoritos, watchlist, ratings |
| Cold start | recentes e melhor avaliados publicados |
| Resposta | `groups`, `coldStart`, `signalsUsed` |
| Grupos | `because-your-themes`, `because-your-activity`, `popular-start` |
| Frontend | `recommendationsApi`, `ForYouPage` |
| Handoff | `BK-MF3-06` transforma `reasonCode` em explicacao visivel |

### Formato de resposta

```js
{
  coldStart,
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

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar service de recomendacao

1. Objetivo do passo.

Calcular grupos de recomendacao com regras simples e sinais permitidos.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/recommendations/recommendations.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/recommendations/` e adiciona o service.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

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

async function loadUserSignals(db, userObjectId) {
  const [lists, history, ratings] = await Promise.all([
    db.collection("user_content_lists").find({ userId: userObjectId }).toArray(),
    db.collection("playback_progress").find({ userId: userObjectId }).toArray(),
    db.collection("content_ratings").find({ userId: userObjectId, value: { $gte: 4 } }).toArray(),
  ]);

  const contentIds = [
    ...new Set(
      [...lists, ...history, ...ratings].map((row) => String(row.contentId)),
    ),
  ];

  if (contentIds.length === 0) {
    return { contentIds: [], taxonomyIds: [], types: [], signalsUsed: [] };
  }

  const contents = await db.collection("contents").find({
    _id: { $in: contentIds.map((id) => ObjectId.createFromHexString(id)) },
    status: "published",
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

  return {
    contentIds,
    taxonomyIds: topKeys(taxonomyCounts),
    types: topKeys(typeCounts),
    signalsUsed,
  };
}

async function listByThemes(db, taxonomyIds, excludedIds) {
  if (taxonomyIds.length === 0) return [];

  return db.collection("contents").find({
    _id: { $nin: excludedIds.map((id) => ObjectId.createFromHexString(id)) },
    status: "published",
    taxonomyIds: { $in: taxonomyIds.map((id) => ObjectId.createFromHexString(id)) },
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listByActivityTypes(db, types, excludedIds) {
  if (types.length === 0) return [];

  return db.collection("contents").find({
    _id: { $nin: excludedIds.map((id) => ObjectId.createFromHexString(id)) },
    status: "published",
    type: { $in: types },
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listPopularStart(db, excludedIds = []) {
  return db.collection("contents").aggregate([
    {
      $match: {
        _id: { $nin: excludedIds.map((id) => ObjectId.createFromHexString(id)) },
        status: "published",
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

async function listRecentStart(db) {
  return db.collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listCatalogStart(db) {
  return db.collection("contents")
    .find({ status: "published" })
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

export async function getMyRecommendations(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const signals = await loadUserSignals(db, userObjectId);
  const coldStart = signals.signalsUsed.length === 0;

  if (coldStart) {
    const [popular, recent, catalog] = await Promise.all([
      listPopularStart(db),
      listRecentStart(db),
      listCatalogStart(db),
    ]);

    return {
      coldStart: true,
      signalsUsed: [],
      groups: [
        group("popular-start", "Populares para comecar", "cold-start-popular", popular),
        group("recent-start", "Adicionados recentemente", "cold-start-recent", recent),
        group("catalog-start", "Sugestoes do catalogo", "cold-start-catalog", catalog),
      ],
    };
  }

  const byThemes = await listByThemes(db, signals.taxonomyIds, signals.contentIds);
  const byTypes = await listByActivityTypes(db, signals.types, signals.contentIds);
  const popular = await listPopularStart(db, signals.contentIds);

  return {
    coldStart: false,
    signalsUsed: signals.signalsUsed,
    groups: [
      group("because-your-themes", "Com base nos teus temas", "themes-from-user-signals", byThemes),
      group("because-your-activity", "Com base na tua atividade", "activity-types", byTypes),
      group("popular-start", "Tambem podes gostar", "popular-fallback", popular),
    ],
  };
}
```

5. Explicacao do codigo ou da decisao.

O service usa apenas dados internos permitidos: listas pessoais, historico e ratings. Conteudos ja usados como sinal ficam excluidos dos grupos personalizados para evitar sugerir aquilo que ja serviu de base.

6. Validacao do passo.

```bash
node -e "import('./src/modules/recommendations/recommendations.service.js').then(({ getMyRecommendations }) => console.log(typeof getMyRecommendations))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

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
import { getMyRecommendations } from "./recommendations.service.js";

export async function getRecommendationsForMe(req, res) {
  res.status(200).json(await getMyRecommendations(req.user.id));
}
```

`backend/src/modules/recommendations/recommendations.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getRecommendationsForMe } from "./recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/me", requireAuth, asyncHandler(getRecommendationsForMe));
```

5. Explicacao do codigo ou da decisao.

O frontend nao envia `userId`. A sessao decide o utilizador e protege privacidade.

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
    - LOCALIZACAO: imports e montagem de rotas

3. Instrucoes concretas.

Monta `recommendationsRouter` em `/api/recommendations`.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { recommendationsRouter } from "./modules/recommendations/recommendations.routes.js";

app.use("/api/recommendations", recommendationsRouter);
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
  getMine() {
    return apiClient.get("/api/recommendations/me");
  },
};
```

`frontend/src/pages/ForYouPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { recommendationsApi } from "../services/api/recommendationsApi.js";

function RecommendationGroup({ group }) {
  if (group.items.length === 0) return null;

  return (
    <section className="recommendation-group" aria-label={group.title}>
      <h2>{group.title}</h2>
      <ul className="content-grid">
        {group.items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {item.posterUrl && <img src={item.posterUrl} alt="" />}
              <h3>{item.title}</h3>
              <p>{item.type}</p>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
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

  useEffect(() => {
    recommendationsApi.getMine()
      .then((response) => {
        setData(response);
        setStatus("success");
      })
      .catch(() => {
        setError("Entra na tua conta para veres recomendacoes.");
        setStatus("error");
      });
  }, []);

  return (
    <main className="for-you-page">
      <h1>Para si</h1>
      {status === "loading" && <p>A carregar recomendacoes...</p>}
      {error && <p role="alert">{error}</p>}
      {data?.coldStart && <p>Como ainda ha poucos sinais, mostramos sugestoes gerais do catalogo.</p>}
      {data?.groups.map((group) => (
        <RecommendationGroup key={group.id} group={group} />
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
import { ForYouPage } from "../pages/ForYouPage.jsx";

<Route path="/para-si" element={<ForYouPage />} />
```

5. Explicacao do codigo ou da decisao.

A pagina nao tenta calcular recomendacoes no browser. O frontend apenas apresenta a resposta do backend, porque o backend tem acesso seguro aos sinais do utilizador.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Calcular recomendacao no frontend exigiria expor sinais pessoais e quebraria o principio de privacidade.

## Criterios de aceite (mensuraveis)

- `GET /api/recommendations/me` sem sessao devolve `401`.
- Utilizador sem sinais recebe `coldStart: true`.
- Utilizador com historico, favoritos, watchlist ou ratings recebe `coldStart: false`.
- A resposta contem ate 3 grupos principais.
- Todos os items devolvidos sao conteudos `published`.
- O frontend `/para-si` mostra loading, erro, cold start e grupos.
- A resposta inclui `signalsUsed` sem expor detalhes sensiveis.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i http://localhost:3000/api/recommendations/me
```

Resultado esperado: build e testes passam; o `curl` sem sessao devolve `401`.

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `recommendations`.
- `proof`: resposta autenticada com `groups`.
- `proof`: resposta de utilizador novo com `coldStart: true`.
- `proof`: captura da pagina `/para-si`.
- `neg`: `401` sem sessao, lista vazia quando nao ha conteudos publicados, exclusao de conteudos nao publicados.

## Handoff

O `BK-MF3-06` deve usar `reasonCode`, `signalsUsed` e `coldStart` para apresentar explicacoes simples. Nao deve criar outro algoritmo; deve explicar o algoritmo baseline criado aqui.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 4. O ponto central deste BK e:

```js
return {
  coldStart: false,
  signalsUsed: signals.signalsUsed,
  groups: [
    group("because-your-themes", "Com base nos teus temas", "themes-from-user-signals", byThemes),
    group("because-your-activity", "Com base na tua atividade", "activity-types", byTypes),
    group("popular-start", "Tambem podes gostar", "popular-fallback", popular),
  ],
};
```

Este trecho separa os grupos e deixa a explicacao preparada para o BK seguinte.

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com recomendacao baseline, cold start, backend, frontend, privacidade e evidence.
