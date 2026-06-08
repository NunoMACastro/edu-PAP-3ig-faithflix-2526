# BK-MF3-04 - Filtros, carrosseis e relacionados

## Header

- `doc_id`: `GUIA-BK-MF3-04`
- `bk_id`: `BK-MF3-04`
- `macro`: `MF3`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF3-03`
- `rf_rnf`: `RF23, RF24, RF25`
- `fase_documental`: `Fase 2`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-05`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-04-filtros-carrosseis-e-relacionados.md`
- `last_updated`: `2026-06-07`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais melhorar descoberta com filtros e ordenacao (`RF23`), carrosseis editoriais (`RF24`) e conteudos relacionados (`RF25`).

No fim, deves conseguir explicar a diferenca entre pesquisa, filtro, carrossel e relacionado. Tambem deves conseguir justificar porque estes fluxos continuam a respeitar apenas conteudos publicados.

### Importancia funcional

Pesquisa resolve a pergunta "onde esta X?". Filtros, carrosseis e relacionados resolvem a pergunta "o que posso ver agora?". Isto torna a experiencia mais proxima de uma plataforma de streaming real, mas ainda com regras simples e auditaveis.

### Scope-in

- Alargar `GET /api/search` com `type`, `taxonomyId` e `sort`.
- Criar `GET /api/discovery/home` para carrosseis.
- Criar `GET /api/discovery/related/:contentId` para relacionados.
- Reutilizar `contents`, `taxonomies` e `content_ratings`.
- Criar cliente `discoveryApi`.
- Criar componentes de carrossel e relacionados.
- Acrescentar controlos de filtro a `/pesquisa`.

### Scope-out

- Personalizacao de recomendacoes.
- Carrosseis configuraveis por painel admin.
- Algoritmos opacos.
- Conteudo nao publicado.
- Alteracao do fluxo de ratings.

### Glossario rapido

- `Filtro`: criterio que reduz resultados, como tipo ou tema.
- `Ordenacao`: criterio que muda a ordem, como recentes ou melhor avaliados.
- `Carrossel editorial`: grupo curado por regra simples para a pagina de descoberta.
- `Relacionado`: conteudo com tipo ou taxonomia semelhante ao conteudo atual.

### Conceitos essenciais

- `CANONICO`: `RF23` cobre filtros e ordenacao.
- `CANONICO`: `RF24` cobre carrosseis editoriais.
- `CANONICO`: `RF25` cobre relacionados.
- `DERIVADO`: carrosseis usam regras simples: recentes, documentarios e melhor avaliados.
- `DERIVADO`: relacionados priorizam taxonomias iguais e depois o mesmo tipo.

### Tempo estimado

- Atualizar pesquisa: 35 min.
- Backend de discovery: 60 min.
- Frontend de descoberta e relacionados: 60 min.
- Validacao e evidence: 35 min.

### Erros comuns

- Criar outro endpoint para pesquisa textual.
- Mostrar conteudo `draft` em carrosseis.
- Deixar `/api/discovery/related/:contentId` incluir o proprio conteudo.
- Ordenar por rating sem tratar conteudos sem rating.

### Check de compreensao

- [ ] Sei explicar porque filtros usam `/api/search`.
- [ ] Sei explicar porque carrosseis nao sao recomendacao personalizada.
- [ ] Sei testar relacionado por taxonomia e por tipo.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF3-03` concluido.
- `content_ratings` existe a partir de `BK-MF3-01`.
- Catalogo contem taxonomias e conteudos publicados.
- A pagina `/pesquisa` existe.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Pesquisa com filtros | `GET /api/search?q=fe&type=movie&taxonomyId=...&sort=recent` |
| Sort permitido | `title`, `recent`, `rating` |
| Discovery home | `GET /api/discovery/home` |
| Relacionados | `GET /api/discovery/related/:contentId` |
| Carrosseis | `recent`, `documentaries`, `top-rated` |
| Frontend | `SearchFilters`, `discoveryApi`, `DiscoveryHomePage`, `RelatedContent` |
| Handoff | `BK-MF3-05` usa ratings, historico e listas para recomendacao |

### Guia de execucao (passo-a-passo)

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
import { ObjectId } from "mongodb";

export const SEARCH_SORTS = ["title", "recent", "rating"];
export const SEARCH_TYPES = ["movie", "series", "episode", "documentary"];

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertSearchQuery(value) {
  const query = String(value ?? "").replace(/\s+/g, " ").trim();

  if (query.length < 2 || query.length > 80) {
    const error = new Error("A pesquisa deve ter entre 2 e 80 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return query;
}

export function parsePagination(input) {
  const page = Number(input.page ?? 1);
  const limit = Number(input.limit ?? 12);

  if (!Number.isInteger(page) || page < 1) {
    const error = new Error("Pagina invalida.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 24) {
    const error = new Error("Limite invalido.");
    error.statusCode = 400;
    throw error;
  }

  return { page, limit };
}

export function parseSearchFilters(input) {
  const type = String(input.type ?? "").trim();
  const sort = String(input.sort ?? "title").trim();
  const taxonomyId = String(input.taxonomyId ?? "").trim();

  if (type && !SEARCH_TYPES.includes(type)) {
    const error = new Error("Tipo de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  if (!SEARCH_SORTS.includes(sort)) {
    const error = new Error("Ordenacao invalida.");
    error.statusCode = 400;
    throw error;
  }

  if (taxonomyId && !ObjectId.isValid(taxonomyId)) {
    const error = new Error("Taxonomia invalida.");
    error.statusCode = 400;
    throw error;
  }

  return { type: type || null, sort, taxonomyId: taxonomyId || null };
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

Adiciona `parseSearchFilters` aos imports e substitui `searchContents` pela versao abaixo.

4. Codigo completo.

```js
export async function searchContents(params) {
  const db = await getDb();
  const query = assertSearchQuery(params.q);
  const { page, limit } = parsePagination(params);
  const filters = parseSearchFilters(params);
  const expression = new RegExp(escapeRegExp(query), "i");

  const matchingTaxonomies = await db.collection("taxonomies")
    .find({ name: expression })
    .project({ _id: 1, name: 1 })
    .toArray();

  const taxonomyIdsFromQuery = matchingTaxonomies.map((taxonomy) => taxonomy._id);
  const taxonomyNamesById = new Map(
    matchingTaxonomies.map((taxonomy) => [String(taxonomy._id), taxonomy.name]),
  );

  const match = {
    status: "published",
    $or: [
      { title: expression },
      { synopsis: expression },
      { slug: expression },
      ...(taxonomyIdsFromQuery.length > 0 ? [{ taxonomyIds: { $in: taxonomyIdsFromQuery } }] : []),
    ],
  };

  if (filters.type) match.type = filters.type;
  if (filters.taxonomyId) match.taxonomyIds = new ObjectId(filters.taxonomyId);

  const sort =
    filters.sort === "recent"
      ? { publishedAt: -1, title: 1 }
      : { title: 1 };

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
    { $sort: filters.sort === "rating" ? { ratingAverage: -1, title: 1 } : sort },
  ];

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
        .map((id) => String(id))
        .filter((id) => !taxonomyNamesById.has(id)),
    ),
  ];

  if (missingTaxonomyIds.length > 0) {
    const extraTaxonomies = await db.collection("taxonomies")
      .find({ _id: { $in: missingTaxonomyIds.map((id) => ObjectId.createFromHexString(id)) } })
      .project({ _id: 1, name: 1 })
      .toArray();

    for (const taxonomy of extraTaxonomies) {
      taxonomyNamesById.set(String(taxonomy._id), taxonomy.name);
    }
  }

  return {
    query,
    page,
    limit,
    total: totalRows[0]?.total ?? 0,
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
    synopsis: content.synopsis,
  };
}

async function listRecent(db) {
  return db.collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .limit(12)
    .toArray();
}

async function listDocumentaries(db) {
  return db.collection("contents")
    .find({ status: "published", type: "documentary" })
    .sort({ title: 1 })
    .limit(12)
    .toArray();
}

async function listTopRated(db) {
  return db.collection("contents").aggregate([
    { $match: { status: "published" } },
    {
      $lookup: {
        from: "content_ratings",
        localField: "_id",
        foreignField: "contentId",
        as: "ratings",
      },
    },
    { $addFields: { ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] } } },
    { $sort: { ratingAverage: -1, title: 1 } },
    { $limit: 12 },
  ]).toArray();
}

export async function getDiscoveryHome() {
  const db = await getDb();
  const [recent, documentaries, topRated] = await Promise.all([
    listRecent(db),
    listDocumentaries(db),
    listTopRated(db),
  ]);

  return {
    carousels: [
      { id: "recent", title: "Adicionados recentemente", items: recent.map(publicCard) },
      { id: "documentaries", title: "Documentarios", items: documentaries.map(publicCard) },
      { id: "top-rated", title: "Melhor avaliados", items: topRated.map(publicCard) },
    ],
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

  const taxonomyIds = content.taxonomyIds ?? [];
  const related = await db.collection("contents").find({
    _id: { $ne: contentObjectId },
    status: "published",
    $or: [
      ...(taxonomyIds.length > 0 ? [{ taxonomyIds: { $in: taxonomyIds } }] : []),
      { type: content.type },
    ],
  })
    .sort({ publishedAt: -1, title: 1 })
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

Atualiza o cliente de pesquisa, cria cliente de discovery e adiciona rota `/descobrir`.

4. Codigo completo.

`frontend/src/services/api/searchApi.js`

```js
import { apiClient } from "./apiClient.js";

export const searchApi = {
  search({ q, page = 1, limit = 12, type = "", taxonomyId = "", sort = "title" }) {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
      sort,
    });

    if (type) params.set("type", type);
    if (taxonomyId) params.set("taxonomyId", taxonomyId);

    return apiClient.get(`/api/search?${params.toString()}`);
  },
  listTaxonomiesForFilters() {
    return apiClient.get("/api/catalog/taxonomies");
  },
};
```

`frontend/src/services/api/discoveryApi.js`

```js
import { apiClient } from "./apiClient.js";

export const discoveryApi = {
  getHome() {
    return apiClient.get("/api/discovery/home");
  },
  getRelated(contentId) {
    return apiClient.get(`/api/discovery/related/${encodeURIComponent(contentId)}`);
  },
};
```

`frontend/src/components/search/SearchFilters.jsx`

```jsx
export function SearchFilters({ value, taxonomies, onChange }) {
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
        <select value={value.taxonomyId} onChange={(event) => onChange({ ...value, taxonomyId: event.target.value })}>
          <option value="">Todos</option>
          {taxonomies.map((taxonomy) => (
            <option key={taxonomy.id} value={taxonomy.id}>{taxonomy.name}</option>
          ))}
        </select>
      </label>

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
  if (items.length === 0) return null;

  return (
    <section className="content-carousel" aria-label={title}>
      <h2>{title}</h2>
      <ul className="carousel-row">
        {items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {item.posterUrl && <img src={item.posterUrl} alt="" />}
              <h3>{item.title}</h3>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
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
import { useEffect, useState } from "react";
import { ContentCarousel } from "../components/discovery/ContentCarousel.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

export function DiscoveryHomePage() {
  const [carousels, setCarousels] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    discoveryApi.getHome()
      .then((response) => {
        setCarousels(response.carousels);
        setStatus("success");
      })
      .catch(() => {
        setError("Nao foi possivel carregar descoberta.");
        setStatus("error");
      });
  }, []);

  return (
    <main className="discovery-page">
      <h1>Descobrir</h1>
      {status === "loading" && <p>A carregar conteudos...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "success" && carousels.every((carousel) => carousel.items.length === 0) && (
        <p>Ainda nao existem conteudos publicados para descoberta.</p>
      )}
      {carousels.map((carousel) => (
        <ContentCarousel key={carousel.id} title={carousel.title} items={carousel.items} />
      ))}
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { DiscoveryHomePage } from "../pages/DiscoveryHomePage.jsx";

<Route path="/descobrir" element={<DiscoveryHomePage />} />
```

5. Explicacao do codigo ou da decisao.

`SearchFilters` nao chama API sozinho; recebe estado da pagina. Isto evita que filtros disparem pedidos escondidos e facilita manter a query na URL.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estados de loading e empty, a pagina `/descobrir` fica ambigua quando ainda nao ha conteudos publicados.

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
import { useEffect, useState } from "react";
import { ContentCarousel } from "./ContentCarousel.jsx";
import { discoveryApi } from "../../services/api/discoveryApi.js";

export function RelatedContent({ contentId }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    discoveryApi.getRelated(contentId)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  if (status === "loading") return <p>A carregar relacionados...</p>;
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

## Criterios de aceite (mensuraveis)

- `GET /api/search` aceita `type`, `taxonomyId` e `sort`.
- Sort invalido devolve `400`.
- Tipo invalido devolve `400`.
- Taxonomia invalida devolve `400`.
- `GET /api/discovery/home` devolve tres carrosseis.
- `GET /api/discovery/related/:contentId` nao inclui o proprio conteudo.
- `/descobrir` mostra loading, empty e carrosseis.
- Detalhe mostra relacionados quando existem.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i "http://localhost:3000/api/search?q=fe&sort=rating"
curl -i http://localhost:3000/api/discovery/home
```

Resultado esperado: testes e build passam; endpoints devolvem `200`.

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com filtros e discovery.
- `proof`: resposta de pesquisa com `filters`.
- `proof`: captura de `/descobrir`.
- `proof`: captura de relacionados no detalhe.
- `neg`: `400` para sort invalido, `400` para taxonomia invalida, `404` para relacionado de conteudo inexistente.

## Handoff

O `BK-MF3-05` pode usar ratings, favoritos, watchlist, historico, taxonomias e catalogo publicado para criar recomendacao baseline. Filtros e carrosseis continuam publicos; recomendacao passa a ser autenticada.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 6. O ponto central deste BK e:

```js
app.use("/api/search", searchRouter);
app.use("/api/discovery", discoveryRouter);
```

Este trecho mantem pesquisa e descoberta como dominios proximos, mas separados.

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com filtros, ordenacao, carrosseis, relacionados, frontend e validacao mensuravel.
