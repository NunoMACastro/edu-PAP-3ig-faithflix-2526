# BK-MF3-03 - Pesquisa unificada

## Header

- `doc_id`: `GUIA-BK-MF3-03`
- `bk_id`: `BK-MF3-03`
- `macro`: `MF3`
- `owner`: `Davi`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF2-03`
- `rf_rnf`: `RF22`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-04`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-03-pesquisa-unificada.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar pesquisa unificada (`RF22`) sobre conteudos publicados e taxonomias.

No fim, deves conseguir explicar porque a pesquisa publica nao pode mostrar conteudos `draft`, porque e necessario paginar resultados e como uma pesquisa por tema encontra conteudos associados a taxonomias.

#### Importância

Pesquisa e a porta principal da descoberta. Sem ela, o utilizador depende apenas do catalogo inicial. Este BK prepara `BK-MF3-04`, onde filtros, ordenacao, carrosseis e relacionados melhoram a navegacao.

#### Scope-in

- Criar endpoint publico `GET /api/search`.
- Pesquisar em `title`, `synopsis`, `slug` e nomes de taxonomias.
- Devolver apenas conteudos `published`.
- Usar paginacao com `page` e `limit`.
- Criar cliente frontend `searchApi`.
- Criar pagina `/pesquisa`.

#### Scope-out

- Motor externo de pesquisa.
- Ranking por aprendizagem automatica.
- Pesquisa em comentarios.
- Filtros e ordenacao avancados, que ficam no `BK-MF3-04`.
- Recomendacoes.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-03` concluido.
- Colecoes `contents` e `taxonomies` existem.
- Conteudos publicados usam `title`, `slug`, `synopsis`, `type`, `assets.posterUrl` e `taxonomyIds`.
- Frontend tem router e `apiClient`.

#### Glossário

- `Query`: texto que o utilizador escreve para pesquisar.
- `Taxonomy`: tema ou classificacao criada no catalogo.
- `Paginacao`: dividir resultados por paginas para nao carregar tudo de uma vez.
- `Regex escapada`: pesquisa textual controlada sem executar padroes perigosos escritos pelo utilizador.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF22` exige pesquisa unificada.
- `CANONICO`: `RF06` e `RF07` criam catalogo e taxonomias que a pesquisa usa.
- `CANONICO`: `RNF09` pede respostas de pesquisa em menos de 2 segundos com paginacao ou carregamento incremental.
- `DERIVADO`: a pesquisa usa MongoDB e expressoes regulares escapadas para manter a solucao simples no MVP.
- `DERIVADO`: a resposta publica usa o mesmo formato basico de card do catalogo.
- `DERIVADO`: URL é a fonte de verdade para `q`, `type`, `taxonomyId`, `sort` e
  `page`; nova pesquisa/filtro repõe a página 1 e paginação preserva o resto.
- `DERIVADO`: `page`/`limit` exigem dígitos canónicos, `limit <= 24`, e filtros
  pertencem a enums/ID fechados; todas as ordenações têm desempate por `_id`.
- `DERIVADO`: mudar URL aborta o pedido anterior e uma versão de pedido recusa
  respostas tardias; retry preserva exatamente o URL.
- `DERIVADO`: a rota permite 120 pedidos por IP/minuto; o pedido 121 devolve
  `429 RATE_LIMITED` com `Retry-After` antes de consultar o catálogo.

### Tempo estimado

- Rever catalogo e taxonomias: 20 min.
- Backend de pesquisa: 65 min.
- Frontend de pesquisa: 55 min.
- Validacao e evidence: 35 min.

### Erros comuns

- Pesquisar tambem em conteudos `draft`.
- Aceitar queries enormes.
- Devolver documentos completos do MongoDB.
- Esquecer empty state no frontend.

### Check de compreensao

- [ ] Sei explicar porque pesquisamos taxonomias e conteudos.
- [ ] Sei porque a query precisa de limite de tamanho.
- [ ] Sei testar sem resultados, query curta e pagina invalida.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/search?q=texto&page=1&limit=12` |
| Fonte de dados | `contents`, `taxonomies` |
| Visibilidade | apenas `status: "published"` |
| Query | `2..80` caracteres |
| Paginacao | `page >= 1`, `limit 1..24` |
| Rate limit | `120/IP/min`; pedido 121 devolve `429 RATE_LIMITED` e `Retry-After` |
| Ordenação | `title \| recent \| rating`, sempre com desempate por `_id` |
| Filtros | `type` e `taxonomyId`, ambos preservados no URL |
| Resposta | `{ query, page, limit, total, sort, filters, items }`; sem `totalPages` |
| Robustez frontend | URL-driven, `AbortSignal`, anti-stale, retry sem alterar URL, segmento de detalhe codificado e anterior/seguinte |
| Frontend | `searchApi`, `SearchPage` |
| Rota frontend | `/pesquisa` |
| Handoff | `BK-MF3-04` acrescenta filtros e discovery sobre este contrato |

### Formato de resposta

```js
// O total é independente da página e permite calcular a navegação no frontend.
const response = {
  query,
  page,
  limit,
  total,
  sort,
  filters: { type, taxonomyId },
  items: [
    { id, title, slug, synopsis, type, posterUrl, taxonomyNames, ratingAverage }
  ]
};
```

O frontend deriva `totalPages = Math.ceil(total / limit)`; não acrescentes
esse campo ao contrato desta rota sem alterar API, testes e documentação em
conjunto.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/search/search.validation.js`
- CRIAR: `backend/src/modules/search/search.service.js`
- CRIAR: `backend/src/modules/search/search.controller.js`
- CRIAR: `backend/src/modules/search/search.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- CRIAR: `frontend/src/services/api/searchApi.js`
- CRIAR: `frontend/src/pages/SearchPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`

#### Tutorial técnico linear

### Passo 1 - Criar validacao de pesquisa

1. Objetivo do passo.

Controlar query e paginacao antes de consultar a base de dados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/search/search.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/search/` e adiciona a validacao.

4. Codigo completo.

```js
export function escapeRegExp(value) {
  if (typeof value !== "string") throw new TypeError("Pesquisa inválida.");
  // Escapa metacaracteres para o texto do utilizador não alterar a expressão regular.
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

  const page = parse(input.page, "Pagina", 1, 1_000_000);
  const limit = parse(input.limit, "Limite", 12, 24);

  return { page, limit };
}

export function assertSearchParams(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Query de pesquisa invalida.");
    error.statusCode = 400;
    throw error;
  }
  // A allowlist rejeita filtros desconhecidos em vez de os coagir silenciosamente.
  const allowed = ["q", "page", "limit", "type", "taxonomyId", "sort"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) {
    const error = new Error("Query de pesquisa contém campos não permitidos.");
    error.statusCode = 400;
    throw error;
  }
  const query = assertSearchQuery(input.q);
  const { page, limit } = parsePagination(input);
  const type = input.type === undefined || input.type === "" ? null : input.type;
  const taxonomyId = input.taxonomyId === undefined || input.taxonomyId === ""
    ? null
    : input.taxonomyId;
  const sort = input.sort === undefined ? "title" : input.sort;
  if (type !== null && (typeof type !== "string" || !["movie", "series", "episode", "documentary"].includes(type))) {
    const error = new Error("Tipo invalido.");
    error.statusCode = 400;
    throw error;
  }
  if (taxonomyId !== null && (typeof taxonomyId !== "string" || !/^[a-f\d]{24}$/i.test(taxonomyId))) {
    const error = new Error("Taxonomia invalida.");
    error.statusCode = 400;
    throw error;
  }
  if (typeof sort !== "string" || !["title", "recent", "rating"].includes(sort)) {
    const error = new Error("Ordenacao invalida.");
    error.statusCode = 400;
    throw error;
  }
  return { query, page, limit, type, taxonomyId, sort };
}
```

5. Explicacao do codigo ou da decisao.

`escapeRegExp` transforma caracteres especiais em texto normal. Isto impede que a query do utilizador se transforme num padrao pesado ou inesperado.

6. Validacao do passo.

```bash
node -e "import('./src/modules/search/search.validation.js').then(({ assertSearchQuery }) => console.log(assertSearchQuery('fe')))"
```

Resultado esperado: `fe`.

7. Caso negativo, erro comum ou risco que este passo evita.

Uma query sem limite pode gerar consultas lentas e prejudicar `RNF09`.

### Passo 2 - Criar service de pesquisa

1. Objetivo do passo.

Pesquisar conteudos publicados por texto direto ou por taxonomia.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/search/search.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo. Ele usa duas consultas: primeiro encontra taxonomias que batem com a query; depois pesquisa conteudos.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertSearchParams, escapeRegExp } from "./search.validation.js";

function publicSearchItem(content, taxonomyNamesById) {
  // A projeção por allowlist nunca transporta fontes de media para a pesquisa pública.
  const taxonomyNames = (content.taxonomyIds ?? [])
    .map((id) => taxonomyNamesById.get(id.toHexString()))
    .filter(Boolean);

  return {
    id: content._id.toHexString(),
    title: content.title,
    slug: content.slug,
    synopsis: content.synopsis,
    type: content.type,
    posterUrl: content.assets?.posterUrl ?? "",
    taxonomyNames,
    ratingAverage: content.ratingAverage ?? 0,
  };
}

export async function ensureSearchIndexes() {
  const db = await getDb();
  await db.collection("contents").createIndex({ status: 1, title: 1, _id: 1 });
  await db.collection("contents").createIndex({ status: 1, publishedAt: -1, _id: 1 });
  await db.collection("contents").createIndex({ status: 1, type: 1, _id: 1 });
  await db.collection("taxonomies").createIndex({ name: 1 });
  await db.collection("content_ratings").createIndex({ contentId: 1, value: 1 });
}

async function attachPageRatingAverages(db, contents) {
  if (contents.length === 0) return contents;

  // Para title/recent, só se agregam ratings dos IDs já paginados (máximo 24).
  const summaries = await db.collection("content_ratings").aggregate([
    { $match: { contentId: { $in: contents.map((content) => content._id) } } },
    { $group: { _id: "$contentId", ratingAverage: { $avg: "$value" } } },
  ]).toArray();
  const averageByContentId = new Map(
    summaries.map((summary) => [String(summary._id), summary.ratingAverage]),
  );

  return contents.map((content) => ({
    ...content,
    ratingAverage: averageByContentId.get(String(content._id)) ?? 0,
  }));
}

async function loadRatingSortedPage(db, match, page, limit) {
  // Rating precisa do agregado antes do sort global. O count continua separado
  // e simples; esta pipeline tem deadline e devolve no máximo `limit <= 24`.
  return db.collection("contents").aggregate(
    [
      { $match: match },
      {
        $lookup: {
          from: "content_ratings",
          let: { candidateId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$contentId", "$$candidateId"] } } },
            { $group: { _id: null, average: { $avg: "$value" } } },
          ],
          as: "ratingSummary",
        },
      },
      {
        $set: {
          ratingAverage: {
            $ifNull: [{ $first: "$ratingSummary.average" }, 0],
          },
        },
      },
      { $unset: "ratingSummary" },
      { $sort: { ratingAverage: -1, publishedAt: -1, title: 1, _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ],
    { maxTimeMS: 500 },
  ).toArray();
}

export async function searchContents(params) {
  const db = await getDb();
  const { query, page, limit, type, taxonomyId, sort } = assertSearchParams(params);
  const expression = new RegExp(escapeRegExp(query), "i");

  const matchingTaxonomies = await db.collection("taxonomies")
    .find({ name: expression })
    .project({ _id: 1, name: 1 })
    .toArray();

  const taxonomyIds = matchingTaxonomies.map((taxonomy) => taxonomy._id);
  const taxonomyNamesById = new Map(
    matchingTaxonomies.map((taxonomy) => [taxonomy._id.toHexString(), taxonomy.name]),
  );

  const match = {
    status: "published",
    ...(type ? { type } : {}),
    ...(taxonomyId ? {
      taxonomyIds: ObjectId.createFromHexString(taxonomyId),
    } : {}),
    $or: [
      { title: expression },
      { synopsis: expression },
      { slug: expression },
      ...(taxonomyIds.length > 0 ? [{ taxonomyIds: { $in: taxonomyIds } }] : []),
    ],
  };

  const sortDefinition = {
    title: { title: 1, _id: 1 },
    recent: { publishedAt: -1, title: 1, _id: 1 },
  }[sort];

  // O total nunca repete lookup/agregação de ratings.
  const pagePromise = sort === "rating"
    ? loadRatingSortedPage(db, match, page, limit)
    : db.collection("contents")
        .find(match)
        .sort(sortDefinition)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
  const [total, pageContents] = await Promise.all([
    db.collection("contents").countDocuments(match),
    pagePromise,
  ]);
  const contents = sort === "rating"
    ? pageContents
    : await attachPageRatingAverages(db, pageContents);

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
    total,
    sort,
    filters: { type, taxonomyId },
    items: contents.map((content) => publicSearchItem(content, taxonomyNamesById)),
  };
}
```

5. Explicacao do codigo ou da decisao.

A pesquisa respeita o contrato do catalogo: apenas `published`. Taxonomias
permitem que pesquisar por um tema encontre conteudos associados. O `total` é
sempre um `countDocuments(match)` sem lookup. Em `title`/`recent`, a página é
escolhida primeiro e ratings só são agregados para os seus até 24 IDs. O sort
global por `rating` precisa do agregado antes da ordenação, mas usa índice
`content_ratings(contentId,value)`, deadline de 500 ms, paginação estável e não
repete a pipeline pesada para contar.

6. Validacao do passo.

```bash
node -e "import('./src/modules/search/search.service.js').then(({ searchContents }) => console.log(typeof searchContents))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Pesquisar diretamente em toda a base sem `status` pode mostrar conteudos ainda
em preparacao. Fazer `$lookup` de todos os ratings também no count duplica o
custo; ordenar por um campo `ratingAverage` inexistente produz uma ordem
silenciosamente errada.

### Passo 3 - Criar controller e rota

1. Objetivo do passo.

Expor a pesquisa publica para o frontend.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/search/search.controller.js`
    - CRIAR: `backend/src/modules/search/search.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e router. Esta rota e publica porque pesquisa de catalogo e para todos.

4. Codigo completo.

`backend/src/modules/search/search.controller.js`

```js
import { searchContents } from "./search.service.js";

export async function getSearchResults(req, res) {
  res.status(200).json(await searchContents(req.query));
}
```

`backend/src/modules/search/search.routes.js`

```js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  rateLimit,
  rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import { getSearchResults } from "./search.controller.js";

export const searchRouter = Router();

const searchIpLimit = rateLimit({
  // O primeiro pedido acima de 120 na mesma janela é recusado com 429.
  scope: "search:ip",
  limit: 120,
  windowMs: 60_000,
  key: rateLimitKeys.ip,
});

searchRouter.get("/", searchIpLimit, asyncHandler(getSearchResults));
```

5. Explicacao do codigo ou da decisao.

O controller fica pequeno porque a regra de negocio esta no service. Isto facilita testes e evita controllers com consultas complexas.

6. Validacao do passo.

```bash
curl -i "http://localhost:3000/api/search?q=fe"
```

Resultado esperado: `200` com `items`.

7. Caso negativo, erro comum ou risco que este passo evita.

Colocar a consulta diretamente em `app.js` torna dificil reaproveitar pesquisa em filtros no BK seguinte.

### Passo 4 - Montar router e indices

1. Objetivo do passo.

Ligar a pesquisa ao backend.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: imports e montagem de rotas

3. Instrucoes concretas.

Monta `searchRouter` em `/api/search` e cria indices no arranque.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { searchRouter } from "./modules/search/search.routes.js";

app.use("/api/search", searchRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureSearchIndexes } from "./modules/search/search.service.js";

await ensureSearchIndexes();
```

5. Explicacao do codigo ou da decisao.

`/api/search` fica separado de `/api/catalog`, porque a pesquisa combina conteudos e taxonomias.

6. Validacao do passo.

```bash
npm --prefix backend run dev
```

Resultado esperado: servidor inicia sem erro de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem router montado, o frontend ficaria a chamar um endpoint inexistente.

### Passo 5 - Criar frontend de pesquisa

1. Objetivo do passo.

Permitir que o utilizador pesquise e veja resultados com estados claros.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/searchApi.js`
    - CRIAR: `frontend/src/pages/SearchPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: novos ficheiros completos; adicionar rota `/pesquisa`

3. Instrucoes concretas.

Cria o cliente e a pagina. Depois adiciona a rota no router principal.

4. Codigo completo.

`frontend/src/services/api/searchApi.js`

```js
import { apiClient } from "./apiClient.js";

export const searchApi = {
  search(
    { q, type = "", taxonomyId = "", sort = "title", page = 1, limit = 12 },
    options = {},
  ) {
    // URLSearchParams codifica texto e filtros sem concatenar query strings inseguras.
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
};
```

`frontend/src/pages/SearchPage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchApi } from "../services/api/searchApi.js";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({ q: "", type: "", taxonomyId: "", sort: "title" });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersionRef = useRef(0);
  // O URL é a fonte de verdade, permitindo voltar, avançar e partilhar a pesquisa.
  const urlState = searchParams.toString();
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    setForm({
      q: searchParams.get("q") ?? "",
      type: searchParams.get("type") ?? "",
      taxonomyId: searchParams.get("taxonomyId") ?? "",
      sort: searchParams.get("sort") ?? "title",
    });
  }, [urlState]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      setStatus("idle");
      return;
    }

    // A versão e o cancelamento impedem uma resposta antiga de substituir a mais recente.
    const version = ++requestVersionRef.current;
    const controller = new AbortController();
    setStatus("loading");
    setError("");
    setResult(null);

    searchApi.search({
      q: query,
      type: searchParams.get("type") ?? "",
      taxonomyId: searchParams.get("taxonomyId") ?? "",
      sort: searchParams.get("sort") ?? "title",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "12",
    }, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || version !== requestVersionRef.current) return;
        setResult(response);
        setStatus("success");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== requestVersionRef.current) return;
        setError("Nao foi possivel concluir a pesquisa.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [urlState, retryVersion]);

  function submit(event) {
    event.preventDefault();
    const trimmed = form.q.trim();
    if (trimmed.length < 2) return;
    const next = new URLSearchParams();
    next.set("q", trimmed);
    next.set("sort", form.sort);
    next.set("page", "1");
    if (form.type) next.set("type", form.type);
    if (form.taxonomyId) next.set("taxonomyId", form.taxonomyId.trim());
    setSearchParams(next);
  }

  function moveToPage(page) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  const totalPages = result ? Math.ceil(result.total / result.limit) : 0;

  return (
    <main className="search-page">
      <h1>Pesquisa</h1>

      <form onSubmit={submit} role="search">
        <label htmlFor="search-query">Pesquisar conteudos e temas</label>
        <input
          id="search-query"
          value={form.q}
          minLength={2}
          maxLength={80}
          onChange={(event) => setForm((current) => ({ ...current, q: event.target.value }))}
        />
        <label htmlFor="search-type">Tipo</label>
        <select id="search-type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
          <option value="">Todos</option>
          <option value="movie">Filme</option>
          <option value="series">Série</option>
          <option value="episode">Episódio</option>
          <option value="documentary">Documentário</option>
        </select>
        <label htmlFor="search-taxonomy">ID da taxonomia (opcional)</label>
        <input id="search-taxonomy" value={form.taxonomyId} maxLength={24} onChange={(event) => setForm((current) => ({ ...current, taxonomyId: event.target.value }))} />
        <label htmlFor="search-sort">Ordenar</label>
        <select id="search-sort" value={form.sort} onChange={(event) => setForm((current) => ({ ...current, sort: event.target.value }))}>
          <option value="title">Título</option>
          <option value="recent">Mais recentes</option>
          <option value="rating">Melhor classificação</option>
        </select>
        <button type="submit">Pesquisar</button>
      </form>

      {status === "idle" && <p>Escreve pelo menos 2 caracteres para pesquisar.</p>}
      {status === "loading" && <p>A pesquisar...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "error" && <button type="button" onClick={() => setRetryVersion((current) => current + 1)}>Tentar novamente</button>}
      {status === "success" && result.items.length === 0 && <p>Nao foram encontrados conteudos publicados.</p>}

      {result?.items.length > 0 && (
        <section aria-label="Resultados de pesquisa">
          <p>{result.total} resultado(s) para "{result.query}".</p>
          <ul className="content-grid">
            {result.items.map((item) => (
              <li key={item.id}>
                <article className="content-card">
                  {item.posterUrl && <img src={item.posterUrl} alt="" loading="lazy" />}
                  <h2>{item.title}</h2>
                  <p>{item.synopsis}</p>
                  <p>{item.taxonomyNames.join(", ")}</p>
                  <Link to={`/catalogo/${encodeURIComponent(item.slug || item.id)}`}>Ver detalhe</Link>
                </article>
              </li>
            ))}
          </ul>
          <nav aria-label="Páginas dos resultados">
            <button type="button" disabled={result.page <= 1} onClick={() => moveToPage(result.page - 1)}>Anterior</button>
            <span>Página {result.page} de {totalPages}</span>
            <button type="button" disabled={result.page >= totalPages} onClick={() => moveToPage(result.page + 1)}>Seguinte</button>
          </nav>
        </section>
      )}
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// SUBSTITUIR a declaração lazy de SearchPage criada em BK-MF1-02.
const SearchPage = lazyNamedPage(() => import("../pages/SearchPage.jsx"), "SearchPage");

<Route path="/pesquisa" element={<SearchPage />} />
```

5. Explicacao do codigo ou da decisao.

A pagina mantem a query na URL. Assim, o utilizador pode partilhar ou recarregar a pesquisa. Estados `idle`, `loading`, `error`, `empty` e `success` evitam uma interface confusa. No router, substitui-se a declaração placeholder sem criar um segundo binding nem um import eager.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem empty state, uma pesquisa sem resultados parece uma pagina partida.

#### Critérios de aceite

- `GET /api/search?q=fe` devolve `200`, `items`, `total`, `page` e `limit`.
- Query com menos de 2 caracteres devolve `400`.
- `page=0` ou `limit=100` devolve `400`.
- Resultados incluem apenas conteudos `published`.
- Pesquisa por nome de taxonomia devolve conteudos associados a essa taxonomia.
- A pagina `/pesquisa` mostra loading, erro, vazio e resultados.
- Query, filtros, sort e página sobrevivem a refresh e navegação anterior/seguinte.
- Todos os sorts têm desempate determinístico e um pedido substituído é abortado/ignorado.
- `total` usa count simples sem `$lookup`; title/recent agregam ratings apenas
  para a página e rating usa uma única pipeline indexada com `maxTimeMS: 500`,
  `limit <= 24` e desempate por `_id`.
- Uma pesquisa falhada pode ser repetida mantendo exatamente o URL atual.
- Slug/ID com `/`, espaço, `?` ou Unicode produz um único segmento codificado no link de detalhe.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i "http://localhost:3000/api/search?q=fe&page=1&limit=12"
```

Resultado esperado: testes e build passam; o endpoint devolve resposta paginada.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `search`.
- `proof`: resposta de `GET /api/search?q=fe`.
- `proof`: captura da pagina `/pesquisa?q=fe`.
- `proof`: pesquisa com mais de 12 resultados, página 2 e URL que preserva filtros/sort; teste de cancelamento/anti-stale.
- `proof`: falha recuperável seguida de retry sem mudar filtros e resultado com slug codificado no link interno.
- `neg`: `400` para query curta, `400` para limite invalido, zero resultados para termo inexistente.
- `neg`: booleano/array/`01`, tipo, sort e taxonomia inválidos; resposta tardia da query anterior ignorada.
- `neg`: o pedido 121 do mesmo IP na mesma janela devolve `429` sem consultar
  `contents`; outra janela ou IP começa um contador independente.

#### Handoff

O `BK-MF3-04` deve reutilizar este contrato e alargar descoberta com filtros, ordenacao, carrosseis e relacionados, sem criar outro endpoint para a mesma pesquisa textual.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 5. O ponto central deste BK e:

```js
// Só conteúdos publicados entram na pesquisa; expression já contém texto escapado.
const match = {
  status: "published",
  $or: [
    { title: expression },
    { synopsis: expression },
    { slug: expression },
    ...(taxonomyIds.length > 0 ? [{ taxonomyIds: { $in: taxonomyIds } }] : []),
  ],
};
```

Este trecho garante pesquisa unificada sem mostrar conteudo fora do catalogo publico.

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com pesquisa publica, paginacao, taxonomias, frontend e criterios mensuraveis.
- `2026-07-10`: contrato copiável consolidado com URL como fonte de verdade,
  tipos/limites estritos, ordem estável, rate limit, cancelamento/anti-stale e
  cálculo frontend de `totalPages`.
- `2026-07-10`: retry da pesquisa separado do formulário e links de detalhe com slug/ID codificado.
