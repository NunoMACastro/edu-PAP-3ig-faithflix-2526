# BK-MF3-04 - Filtros, carrosseis e relacionados

## Header

- `doc_id`: `GUIA-BK-MF3-04`
- `bk_id`: `BK-MF3-04`
- `macro`: `MF3`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF3-03`
- `rf_rnf`: `RF23, RF24, RF25`
- `fase_documental`: `Fase 2`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-05`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-04-filtros-carrosseis-e-relacionados.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais melhorar descoberta com filtros e ordenacao (`RF23`), carrosseis editoriais (`RF24`) e conteudos relacionados (`RF25`).

No fim, deves conseguir explicar a diferenca entre pesquisa, filtro, carrossel e relacionado. Tambem deves conseguir justificar porque estes fluxos continuam a respeitar apenas conteudos publicados.

#### Importância

Pesquisa resolve a pergunta "onde esta X?". Filtros, carrosseis e relacionados resolvem a pergunta "o que posso ver agora?". Isto torna a experiencia mais proxima de uma plataforma de streaming real, mas ainda com regras simples e auditaveis.

#### Scope-in

- Alargar `GET /api/search` com `type`, `taxonomyId` e `sort`.
- Criar `GET /api/discovery/home` para carrosseis e atalhos por formato.
- Criar `GET /api/discovery/related/:contentId` para relacionados.
- Reutilizar `contents`, `taxonomies` e `content_ratings`.
- Criar cliente `discoveryApi`.
- Criar componentes de carrossel e relacionados.
- Acrescentar controlos de filtro a `/pesquisa`.

#### Scope-out

- Personalizacao de recomendacoes.
- Carrosseis configuraveis por painel admin.
- Algoritmos opacos.
- Conteudo nao publicado.
- Alteracao do fluxo de ratings.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF3-03` concluido.
- `content_ratings` existe a partir de `BK-MF3-01`.
- Catalogo contem taxonomias e conteudos publicados.
- A pagina `/pesquisa` existe.

#### Glossário

- `Filtro`: criterio que reduz resultados, como tipo ou tema.
- `Ordenacao`: criterio que muda a ordem, como recentes ou melhor avaliados.
- `Carrossel editorial`: grupo curado por regra simples para a pagina de descoberta.
- `Relacionado`: conteudo com tipo ou taxonomia semelhante ao conteudo atual.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF23` cobre filtros e ordenacao.
- `CANONICO`: `RF24` cobre carrosseis editoriais.
- `CANONICO`: `RF25` cobre relacionados.
- `DERIVADO`: discovery usa regras simples: mais vistos com progresso real, recentes e atalhos por formato.
- `DERIVADO`: relacionados priorizam taxonomias iguais e depois o mesmo tipo.
- `DERIVADO`: filtros/sort vivem no URL, novos filtros repõem `page=1` e todas
  as ordenações terminam em `_id`.
- `DERIVADO`: pesquisa, taxonomias, home e relacionados propagam `AbortSignal`;
  uma versão de pedido impede respostas tardias após retry, unmount ou mudança
  de conteúdo.
- `DERIVADO`: falhas de temas/home/relacionados têm retry independente e nunca
  apagam filtros; imagens abaixo da dobra usam lazy loading e não existe CTA
  direto para media pendente.

### Tempo estimado

- Atualizar pesquisa: 35 min.
- Backend de discovery: 60 min.
- Frontend de descoberta e relacionados: 60 min.
- Validacao e evidence: 35 min.

### Erros comuns

- Criar outro endpoint para pesquisa textual.
- Mostrar conteudo `draft` em carrosseis ou atalhos por formato.
- Deixar `/api/discovery/related/:contentId` incluir o proprio conteudo.
- Ordenar por rating sem tratar conteudos sem rating.

### Check de compreensao

- [ ] Sei explicar porque filtros usam `/api/search`.
- [ ] Sei explicar porque carrosseis nao sao recomendacao personalizada.
- [ ] Sei testar relacionado por taxonomia e por tipo.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Pesquisa com filtros | `GET /api/search?q=fe&type=movie&taxonomyId=...&sort=recent` |
| Sort permitido | `title`, `recent`, `rating` |
| Estado da pesquisa | URL-driven; `page` reinicia em 1 para novos filtros |
| Ordem | desempate final por `_id` em todos os sorts |
| Discovery home | `GET /api/discovery/home` |
| Catalogo filtrado | `GET /api/catalog?type=movie&page=1&limit=12` |
| Relacionados | `GET /api/discovery/related/:contentId` |
| Carrosseis | `most-watched`, `recent` |
| Cartao publico discovery | `id`, `title`, `slug`, `synopsis`, `type`, `posterUrl`, `backdropUrl`, `durationSeconds`, `ageRating`, `ratingAverage` |
| Formatos destacados | `movie`, `series`, `documentary`; `episode` continua suportado mas nao e entrada principal da home |
| CTAs da home | anonimo: `Ver detalhe`, `Entrar para reproduzir`, `Ver planos`; autenticado: `Ver detalhe`, `Reproduzir`; sessao em loading: CTA seguro sem reproduzir diretamente |
| Frontend | `SearchFilters`, `discoveryApi`, `DiscoveryHomePage`, `RelatedContent` |
| Robustez frontend | abort/anti-stale, retry independente de pesquisa/temas/discovery, erro seguro e imagens lazy |
| Handoff | `BK-MF3-05` usa ratings, historico e listas para recomendacao |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/search/search.validation.js`
- EDITAR: `backend/src/modules/search/search.service.js`
- CRIAR: `backend/src/modules/discovery/discovery.service.js`
- CRIAR: `backend/src/modules/discovery/discovery.controller.js`
- CRIAR: `backend/src/modules/discovery/discovery.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `frontend/src/services/api/searchApi.js`
- CRIAR: `frontend/src/services/api/discoveryApi.js`
- CRIAR: `frontend/src/components/search/SearchFilters.jsx`
- CRIAR: `frontend/src/components/discovery/ContentCarousel.jsx`
- CRIAR: `frontend/src/pages/DiscoveryHomePage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- EDITAR: `frontend/src/pages/ContentDetailPage.jsx`
- CRIAR: `frontend/src/components/discovery/RelatedContent.jsx`

#### Tutorial técnico linear

### Passo 1 - Alargar validacao de pesquisa

1. Objetivo do passo.

Adicionar filtros e ordenacao ao endpoint de pesquisa existente.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/search/search.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Substitui o ficheiro pela versao completa abaixo.

4. Codigo completo.

```js
export const SEARCH_SORTS = ["title", "recent", "rating"];
export const SEARCH_TYPES = ["movie", "series", "episode", "documentary"];

export function escapeRegExp(value) {
  if (typeof value !== "string") throw new TypeError("Pesquisa invalida.");
  // Escapa metacaracteres para tratar a pesquisa como texto literal.
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertSearchQuery(value) {
  if (typeof value !== "string") {
    const error = new Error("A pesquisa deve ser texto.");
    error.statusCode = 400;
    throw error;
  }
  const query = value.replace(/\s+/g, " ").trim();

  if (query.length < 2 || query.length > 80) {
    const error = new Error("A pesquisa deve ter entre 2 e 80 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return query;
}

export function parsePagination(input) {
  function parse(value, field, defaultValue, maximum) {
    if (value === undefined) return defaultValue;
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
      const error = new Error(`${field} invalida.`);
      error.statusCode = 400;
      throw error;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed > maximum) {
      const error = new Error(`${field} invalida.`);
      error.statusCode = 400;
      throw error;
    }
    return parsed;
  }

  return {
    page: parse(input.page, "Pagina", 1, 1_000_000),
    limit: parse(input.limit, "Limite", 12, 24),
  };
}

export function parseSearchFilters(input) {
  const type = input.type === undefined || input.type === "" ? null : input.type;
  const sort = input.sort === undefined ? "title" : input.sort;
  const taxonomyId = input.taxonomyId === undefined || input.taxonomyId === ""
    ? null
    : input.taxonomyId;

  if (type !== null && (typeof type !== "string" || !SEARCH_TYPES.includes(type))) {
    const error = new Error("Tipo de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  if (typeof sort !== "string" || !SEARCH_SORTS.includes(sort)) {
    const error = new Error("Ordenacao invalida.");
    error.statusCode = 400;
    throw error;
  }

  if (taxonomyId !== null && (typeof taxonomyId !== "string" || !/^[a-f\d]{24}$/i.test(taxonomyId))) {
    const error = new Error("Taxonomia invalida.");
    error.statusCode = 400;
    throw error;
  }

  return { type, sort, taxonomyId };
}

export function assertSearchParams(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Query de pesquisa invalida.");
    error.statusCode = 400;
    throw error;
  }
  // A allowlist fecha o contrato e rejeita parâmetros não documentados.
  const allowed = ["q", "page", "limit", "type", "taxonomyId", "sort"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) {
    const error = new Error("Query de pesquisa contém campos não permitidos.");
    error.statusCode = 400;
    throw error;
  }
  return {
    query: assertSearchQuery(input.q),
    ...parsePagination(input),
    ...parseSearchFilters(input),
  };
}
```

5. Explicacao do codigo ou da decisao.

Os valores permitidos ficam numa lista fechada. Isto evita queries como `sort=qualquer-coisa`, que deixam o contrato instavel.

6. Validacao do passo.

```bash
node -e "import('./src/modules/search/search.validation.js').then(({ parseSearchFilters }) => console.log(parseSearchFilters({ sort: 'recent' }).sort))"
```

Resultado esperado: `recent`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem lista fechada, o frontend e o backend podem passar a usar nomes diferentes para a mesma ordenacao.

### Passo 2 - Atualizar service de pesquisa

1. Objetivo do passo.

Aplicar filtros e sort sem criar um endpoint duplicado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/search/search.service.js`
    - LOCALIZACAO: substituir a funcao `searchContents` e os imports

3. Instrucoes concretas.

Importa `assertSearchParams` da validação e substitui `searchContents` pela
versão abaixo; mantém `ObjectId`, `escapeRegExp` e `publicSearchItem` definidos
no BK anterior.

4. Codigo completo.

```js
export async function searchContents(params) {
  const db = await getDb();
  const { query, page, limit, type, taxonomyId, sort } = assertSearchParams(params);
  const filters = { type, taxonomyId };
  const expression = new RegExp(escapeRegExp(query), "i");

  const matchingTaxonomies = await db.collection("taxonomies")
    .find({ name: expression })
    .project({ _id: 1, name: 1 })
    .toArray();

  const taxonomyIdsFromQuery = matchingTaxonomies.map((taxonomy) => taxonomy._id);
  const taxonomyNamesById = new Map(
    matchingTaxonomies.map((taxonomy) => [taxonomy._id.toHexString(), taxonomy.name]),
  );

  // Todos os ramos partem de conteúdos publicados e de uma regex já escapada.
  const match = {
    status: "published",
    $or: [
      { title: expression },
      { synopsis: expression },
      { slug: expression },
      ...(taxonomyIdsFromQuery.length > 0 ? [{ taxonomyIds: { $in: taxonomyIdsFromQuery } }] : []),
    ],
  };

  if (type) match.type = type;
  if (taxonomyId) match.taxonomyIds = ObjectId.createFromHexString(taxonomyId);

  const sortDefinition = sort === "recent"
    ? { publishedAt: -1, title: 1, _id: 1 }
    : { title: 1, _id: 1 };

  const basePipeline = [
    { $match: match },
    {
      $lookup: {
        from: "content_ratings",
        localField: "_id",
        foreignField: "contentId",
        as: "ratings",
      },
    },
    {
      $addFields: {
        ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] },
      },
    },
    {
      $sort: sort === "rating"
        ? { ratingAverage: -1, publishedAt: -1, title: 1, _id: 1 }
        : sortDefinition,
    },
  ];

  // Total e itens reutilizam o mesmo pipeline para não divergirem nos filtros ou ratings.
  const [totalRows, contents] = await Promise.all([
    db.collection("contents").aggregate([...basePipeline, { $count: "total" }]).toArray(),
    db.collection("contents").aggregate([
      ...basePipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]).toArray(),
  ]);

  const missingTaxonomyIds = [
    ...new Set(
      contents
        .flatMap((content) => content.taxonomyIds ?? [])
        .filter((id) => id instanceof ObjectId)
        .map((id) => id.toHexString())
        .filter((id) => !taxonomyNamesById.has(id)),
    ),
  ];

  if (missingTaxonomyIds.length > 0) {
    const extraTaxonomies = await db.collection("taxonomies")
      .find({ _id: { $in: missingTaxonomyIds.map((id) => ObjectId.createFromHexString(id)) } })
      .project({ _id: 1, name: 1 })
      .toArray();

    for (const taxonomy of extraTaxonomies) {
      taxonomyNamesById.set(taxonomy._id.toHexString(), taxonomy.name);
    }
  }

  return {
    query,
    page,
    limit,
    total: totalRows[0]?.total ?? 0,
    sort,
    filters,
    items: contents.map((content) => publicSearchItem(content, taxonomyNamesById)),
  };
}
```

5. Explicacao do codigo ou da decisao.

O endpoint continua o mesmo, mas agora aceita filtros. Ordenacao por rating usa a colecao do `BK-MF3-01`; conteudos sem rating ficam com media `0`.

6. Validacao do passo.

```bash
curl -i "http://localhost:3000/api/search?q=fe&type=documentary&sort=rating"
```

Resultado esperado: `200` com `filters.sort` igual a `rating`.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar `/api/search-filtered` duplicaria contratos e deixaria o frontend sem uma fonte unica de pesquisa.

### Passo 3 - Criar service de discovery

1. Objetivo do passo.

Criar carrosseis e relacionados com regras simples e transparentes.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/discovery/discovery.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/discovery/` e adiciona o service.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

function asObjectId(id, label) {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return ObjectId.createFromHexString(id);
}

function publicCard(content) {
  // A allowlist editorial exclui media, playbackUrl, tracks e opções de qualidade.
  const ratingAverage = Number.isFinite(content.ratingAverage)
    ? Math.round(content.ratingAverage * 100) / 100
    : 0;
  return {
    id: content._id.toHexString(),
    title: content.title,
    slug: content.slug,
    type: content.type,
    posterUrl: content.assets?.posterUrl ?? "",
    backdropUrl: content.assets?.backdropUrl ?? "",
    durationSeconds: content.durationSeconds,
    ageRating: content.ageRating,
    ratingAverage,
    synopsis: content.synopsis,
  };
}

async function listRecent(db) {
  return db.collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1, _id: 1 })
    .limit(5)
    .toArray();
}

async function listMostWatched(db) {
  const rows = await db.collection("playback_progress").aggregate([
    {
      $match: {
        $or: [
          { completed: true },
          { currentTimeSeconds: { $gte: 60 } },
        ],
      },
    },
    { $group: { _id: "$contentId", watchCount: { $sum: 1 }, lastWatchedAt: { $max: "$lastWatchedAt" } } },
    { $sort: { watchCount: -1, lastWatchedAt: -1, _id: 1 } },
    { $lookup: { from: "contents", localField: "_id", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
    { $limit: 4 },
  ]).toArray();

  return rows.map((row) => publicCard(row.content));
}

const FEATURED_FORMAT_TYPES = ["movie", "series", "documentary"];

async function listFormats(db) {
  const rows = await db.collection("contents").aggregate([
    { $match: { status: "published", type: { $in: FEATURED_FORMAT_TYPES } } },
    { $sort: { publishedAt: -1, title: 1, _id: 1 } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        sampleTitle: { $first: "$title" },
        posterUrl: { $first: "$assets.posterUrl" },
        backdropUrl: { $first: "$assets.backdropUrl" },
      },
    },
  ]).toArray();
  const byType = new Map(rows.map((row) => [row._id, row]));

  return FEATURED_FORMAT_TYPES.map((type) => {
    const row = byType.get(type);

    return {
      type,
      count: row?.count ?? 0,
      sampleTitle: row?.sampleTitle ?? "",
      posterUrl: row?.posterUrl ?? "",
      backdropUrl: row?.backdropUrl ?? "",
    };
  });
}

export async function getDiscoveryHome() {
  const db = await getDb();
  const [mostWatched, recent, formats] = await Promise.all([
    listMostWatched(db),
    listRecent(db),
    listFormats(db),
  ]);

  return {
    carousels: [
      { id: "most-watched", title: "Mais vistos", items: mostWatched },
      { id: "recent", title: "Adicionados recentemente", items: recent.map(publicCard) },
    ],
    formats,
  };
}

export async function getRelatedContent(contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const content = await db.collection("contents").findOne({
    _id: contentObjectId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const taxonomyIds = (content.taxonomyIds ?? []).filter((id) => id instanceof ObjectId);
  // Nunca devolve o próprio conteúdo nem candidatos que deixaram de estar publicados.
  const related = await db.collection("contents").find({
    _id: { $ne: contentObjectId },
    status: "published",
    $or: [
      ...(taxonomyIds.length > 0 ? [{ taxonomyIds: { $in: taxonomyIds } }] : []),
      { type: content.type },
    ],
  })
    .sort({ publishedAt: -1, title: 1, _id: 1 })
    .limit(8)
    .toArray();

  return {
    contentId,
    items: related.map(publicCard),
  };
}
```

5. Explicacao do codigo ou da decisao.

Carrosseis sao editoriais por regra simples, nao personalizados. Relacionados usam taxonomias e tipo do conteudo atual, sem depender de dados privados do utilizador.

6. Validacao do passo.

```bash
node -e "import('./src/modules/discovery/discovery.service.js').then((m) => console.log(typeof m.getDiscoveryHome, typeof m.getRelatedContent))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se relacionados nao excluirem o conteudo atual, a pagina pode recomendar aquilo que o utilizador ja esta a ver.

### Passo 4 - Criar controller, rotas e montagem

1. Objetivo do passo.

Expor endpoints publicos de descoberta.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/discovery/discovery.controller.js`
    - CRIAR: `backend/src/modules/discovery/discovery.routes.js`
    - EDITAR: `backend/src/app.js`
    - LOCALIZACAO: ficheiros completos e montagem de router

3. Instrucoes concretas.

Cria controller e routes. Monta em `/api/discovery`.

4. Codigo completo.

`backend/src/modules/discovery/discovery.controller.js`

```js
import { getDiscoveryHome, getRelatedContent } from "./discovery.service.js";

export async function getHomeDiscovery(req, res) {
  res.status(200).json(await getDiscoveryHome());
}

export async function getRelatedDiscovery(req, res) {
  res.status(200).json(await getRelatedContent(req.params.contentId));
}
```

`backend/src/modules/discovery/discovery.routes.js`

```js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getHomeDiscovery, getRelatedDiscovery } from "./discovery.controller.js";

export const discoveryRouter = Router();

discoveryRouter.get("/home", asyncHandler(getHomeDiscovery));
discoveryRouter.get("/related/:contentId", asyncHandler(getRelatedDiscovery));
```

Trecho esperado em `backend/src/app.js`:

```js
import { discoveryRouter } from "./modules/discovery/discovery.routes.js";

app.use("/api/discovery", discoveryRouter);
```

5. Explicacao do codigo ou da decisao.

Rotas de discovery sao publicas porque usam apenas catalogo publicado. Nao expõem historico, favoritos ou dados pessoais.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/discovery/home
```

Resultado esperado: `200` com `carousels`.

7. Caso negativo, erro comum ou risco que este passo evita.

Montar em `/api/catalog` misturaria listagem de catalogo com experiencia de descoberta.

### Passo 5 - Atualizar frontend de filtros e discovery

1. Objetivo do passo.

Dar controlos de filtro na pesquisa e criar experiencia visual de descoberta.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/searchApi.js`
    - CRIAR: `frontend/src/services/api/discoveryApi.js`
    - CRIAR: `frontend/src/components/search/SearchFilters.jsx`
    - CRIAR: `frontend/src/components/discovery/ContentCarousel.jsx`
    - CRIAR: `frontend/src/pages/DiscoveryHomePage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - EDITAR: `frontend/src/pages/ContentDetailPage.jsx`

3. Instrucoes concretas.

Atualiza o cliente de pesquisa, cria cliente de discovery e monta a discovery home em `/`.

4. Codigo completo.

`frontend/src/services/api/searchApi.js`

```js
import { apiClient } from "./apiClient.js";

export const searchApi = {
  search(
    { q, page = 1, limit = 12, type = "", taxonomyId = "", sort = "title" },
    options = {},
  ) {
    // URLSearchParams preserva a codificação correta de texto e filtros.
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
      sort,
    });

    if (type) params.set("type", type);
    if (taxonomyId) params.set("taxonomyId", taxonomyId);

    return apiClient.get(`/api/search?${params.toString()}`, options);
  },
  listTaxonomiesForFilters(options = {}) {
    // Esta rota fornece apenas metadata para preencher o seletor de filtros.
    return apiClient.get("/api/catalog/taxonomies", options);
  },
};
```

`frontend/src/services/api/discoveryApi.js`

```js
import { apiClient } from "./apiClient.js";

export const discoveryApi = {
  home(options = {}) {
    return apiClient.get("/api/discovery/home", options);
  },
  getRelated(contentId, options = {}) {
    // O ID codificado não consegue introduzir segmentos adicionais no URL.
    return apiClient.get(
      `/api/discovery/related/${encodeURIComponent(contentId)}`,
      options,
    );
  },
};
```

`frontend/src/components/search/SearchFilters.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { searchApi } from "../../services/api/searchApi.js";

export function SearchFilters({ value, onChange }) {
  const [taxonomies, setTaxonomies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    // A versão e o AbortController ignoram respostas de tentativas anteriores.
    const version = ++requestVersionRef.current;
    const controller = new AbortController();
    setStatus("loading");

    searchApi.listTaxonomiesForFilters({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || version !== requestVersionRef.current) return;
        setTaxonomies(response.taxonomies);
        setStatus("success");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== requestVersionRef.current) return;
        setStatus("error");
      });

    return () => controller.abort();
  }, [retryVersion]);

  return (
    <fieldset className="search-filters">
      <legend>Filtros</legend>

      <label>
        Tipo
        <select value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })}>
          <option value="">Todos</option>
          <option value="movie">Filme</option>
          <option value="series">Serie</option>
          <option value="episode">Episodio</option>
          <option value="documentary">Documentario</option>
        </select>
      </label>

      <label>
        Tema
        {/* O seletor só fica ativo depois de existir uma lista autoritativa. */}
        <select disabled={status !== "success"} value={value.taxonomyId} onChange={(event) => onChange({ ...value, taxonomyId: event.target.value })}>
          <option value="">Todos</option>
          {taxonomies.map((taxonomy) => (
            <option key={taxonomy.id} value={taxonomy.id}>{taxonomy.name}</option>
          ))}
        </select>
      </label>
      {status === "loading" && <p>A carregar temas...</p>}
      {status === "error" && (
        <p role="alert">
          Não foi possível carregar os temas.
          <button type="button" onClick={() => setRetryVersion((current) => current + 1)}>
            Tentar carregar temas novamente
          </button>
        </p>
      )}

      <label>
        Ordenar
        <select value={value.sort} onChange={(event) => onChange({ ...value, sort: event.target.value })}>
          <option value="title">Titulo</option>
          <option value="recent">Recentes</option>
          <option value="rating">Melhor avaliados</option>
        </select>
      </label>
    </fieldset>
  );
}
```

`frontend/src/components/discovery/ContentCarousel.jsx`

```jsx
import { Link } from "react-router-dom";

export function ContentCarousel({ title, items }) {
  // Não cria uma região vazia que aumentaria o ruído para leitores de ecrã.
  if (items.length === 0) return null;

  return (
    <section className="content-carousel" aria-label={title}>
      <h2>{title}</h2>
      <ul className="carousel-row">
        {items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {/* Posters decorativos abaixo da dobra usam carregamento diferido. */}
              {item.posterUrl && <img src={item.posterUrl} alt="" loading="lazy" />}
              <h3>{item.title}</h3>
              <Link to={`/catalogo/${encodeURIComponent(item.slug || item.id)}`}>Ver detalhe</Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`frontend/src/pages/DiscoveryHomePage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ContentCarousel } from "../components/discovery/ContentCarousel.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

export function DiscoveryHomePage() {
  const [carousels, setCarousels] = useState([]);
  const [formats, setFormats] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersionRef = useRef(0);
  const mostWatched = carousels.find((carousel) => carousel.id === "most-watched");

  useEffect(() => {
    // O token de versão evita aplicar uma resposta pertencente a um retry anterior.
    const version = ++requestVersionRef.current;
    const controller = new AbortController();
    setStatus("loading");
    setError("");

    discoveryApi.home({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || version !== requestVersionRef.current) return;
        setCarousels(response.carousels ?? []);
        setFormats(response.formats ?? []);
        setStatus("success");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== requestVersionRef.current) return;
        setError("Nao foi possivel carregar descoberta.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [retryVersion]);

  return (
    <main className="discovery-page">
      <h1>FaithFlix</h1>
      <p>
        Hero alimentado por `backdropUrl` ou `posterUrl`, com CTAs seguros por
        estado de sessão: anónimo vê detalhe, login para reproduzir e planos;
        autenticado vê detalhe e reproduzir.
      </p>
      {status === "loading" && <p>A carregar conteudos...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "error" && <button type="button" onClick={() => setRetryVersion((current) => current + 1)}>Tentar novamente</button>}
      {status === "success" && carousels.every((carousel) => carousel.items.length === 0) && (
        <p>Ainda nao existem conteudos publicados para descoberta.</p>
      )}
      {/* Os cards navegam para detalhe; descoberta não recebe nem constrói URLs de playback. */}
      {mostWatched?.items.length > 0 ? (
        <section aria-labelledby="most-watched-title">
          <h2 id="most-watched-title">Mais vistos</h2>
          {mostWatched.items.slice(0, 4).map((item, index) => (
            <Link key={item.id} to={`/catalogo/${encodeURIComponent(item.slug || item.id)}`}>#{index + 1} {item.title}</Link>
          ))}
        </section>
      ) : null}
      {carousels.filter((carousel) => carousel.id === "recent").map((carousel) => (
        <ContentCarousel key={carousel.id} title={carousel.title} items={carousel.items} />
      ))}
      <nav aria-label="Atalhos do catalogo por formato">
        {formats.map((format) => (
          <Link key={format.type} to={`/catalogo?type=${encodeURIComponent(format.type)}`}>
            {format.type} ({format.count})
          </Link>
        ))}
      </nav>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const DiscoveryHomePage = lazyNamedPage(
  () => import("../pages/DiscoveryHomePage.jsx"),
  "DiscoveryHomePage",
);

// SUBSTITUIR apenas o element da rota raiz; manter o router e as restantes rotas.
<Route path="/" element={<DiscoveryHomePage />} />
```

5. Explicacao do codigo ou da decisao.

`SearchFilters` nao chama API sozinho; recebe estado da pagina. Isto evita que filtros disparem pedidos escondidos e facilita manter a query na URL. A nova home é carregada por lazy loading e substitui somente o elemento da rota raiz; `HomePage` não é redeclarada e o shell continua intacto.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estados de loading e empty, a pagina inicial fica ambigua quando ainda nao ha conteudos publicados.

### Passo 6 - Adicionar relacionados no detalhe

1. Objetivo do passo.

Mostrar conteudos relacionados na pagina de detalhe.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/components/discovery/RelatedContent.jsx`
    - EDITAR: `frontend/src/pages/ContentDetailPage.jsx`
    - LOCALIZACAO: novo ficheiro completo; inserir componente abaixo de comentarios

3. Instrucoes concretas.

Cria o componente e adiciona `<RelatedContent contentId={content.id} />` no detalhe.

4. Codigo completo.

`frontend/src/components/discovery/RelatedContent.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { ContentCarousel } from "./ContentCarousel.jsx";
import { discoveryApi } from "../../services/api/discoveryApi.js";

export function RelatedContent({ contentId }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    // Uma mudança de conteúdo invalida imediatamente os relacionados anteriores.
    const version = ++requestVersionRef.current;
    const controller = new AbortController();
    setStatus("loading");
    setItems([]);

    discoveryApi.getRelated(contentId, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || version !== requestVersionRef.current) return;
        setItems(response.items);
        setStatus("success");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== requestVersionRef.current) return;
        setItems([]);
        setStatus("error");
      });

    // O cleanup também impede updates depois de desmontar o componente.
    return () => controller.abort();
  }, [contentId, retryVersion]);

  if (status === "loading") return <p>A carregar relacionados...</p>;
  if (status === "error") {
    return (
      <p role="alert">
        Não foi possível carregar relacionados.
        <button type="button" onClick={() => setRetryVersion((current) => current + 1)}>
          Tentar novamente
        </button>
      </p>
    );
  }
  if (items.length === 0) return null;

  return <ContentCarousel title="Relacionados" items={items} />;
}
```

5. Explicacao do codigo ou da decisao.

Relacionados ficam no detalhe, porque dependem do conteudo atual. Se nao existirem, o componente nao cria ruido visual.

6. Validacao do passo.

Abre `/catalogo/:slug` e confirma que a seccao "Relacionados" aparece quando ha conteudos com a mesma taxonomia ou tipo.

7. Caso negativo, erro comum ou risco que este passo evita.

Usar recomendacao personalizada aqui confundiria `RF25` com `RF26`; personalizacao fica no proximo BK.

#### Critérios de aceite

- `GET /api/search` aceita `type`, `taxonomyId` e `sort`.
- Sort invalido devolve `400`.
- Tipo invalido devolve `400`.
- Taxonomia invalida devolve `400`.
- `GET /api/discovery/home` devolve `most-watched`, `recent` e `formats`.
- `GET /api/discovery/related/:contentId` nao inclui o proprio conteudo.
- `/` mostra loading, empty, hero com CTAs seguros, `Mais vistos`, `Adicionados recentemente` e atalhos por formato.
- Detalhe mostra relacionados quando existem.
- Filtros/página sobrevivem a refresh; uma nova submissão repõe `page=1`.
- A leitura de temas é abortada no unmount e pode ser repetida sem submeter nem limpar a pesquisa.
- Trocar rapidamente de conteúdo aborta relacionados antigos; erro da home/relacionados permite retry.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i "http://localhost:3000/api/search?q=fe&sort=rating"
curl -i "http://localhost:3000/api/catalog?type=movie"
curl -i http://localhost:3000/api/discovery/home
```

Resultado esperado: testes e build passam; endpoints devolvem `200`.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com filtros e discovery.
- `proof`: resposta de pesquisa com `filters`.
- `proof`: captura de `/`.
- `proof`: captura de relacionados no detalhe.
- `proof`: URL com filtros/página preservados e teste de abort/anti-stale/retry em relacionados.
- `proof`: falha/cancelamento da lista de temas e retry independente do formulário de pesquisa.
- `neg`: `400` para sort invalido, `400` para taxonomia invalida, `404` para relacionado de conteudo inexistente.

#### Handoff

O `BK-MF3-05` pode usar ratings, favoritos, watchlist, historico, taxonomias e catalogo publicado para criar recomendacao baseline. Filtros, carrosseis e atalhos por formato continuam publicos; recomendacao passa a ser autenticada.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 6. O ponto central deste BK e:

```js
app.use("/api/search", searchRouter);
app.use("/api/discovery", discoveryRouter);
```

Este trecho mantem pesquisa e descoberta como dominios proximos, mas separados.

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com filtros, ordenacao, carrosseis, relacionados, frontend e validacao mensuravel.
- `2026-07-10`: contrato copiável consolidado com tipos/enums estritos e
  pesquisa/discovery canceláveis, anti-stale e repetíveis, URL canónico, ordem
  estável e lazy images.
- `2026-07-10`: `SearchFilters` passa a documentar cancelamento e retry independente da lista de taxonomias.
