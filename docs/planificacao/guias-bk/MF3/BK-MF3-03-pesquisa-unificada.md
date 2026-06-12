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
- `last_updated`: `2026-06-12`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais implementar pesquisa unificada (`RF22`) sobre conteudos publicados e taxonomias.

No fim, deves conseguir explicar porque a pesquisa publica nao pode mostrar conteudos `draft`, porque e necessario paginar resultados e como uma pesquisa por tema encontra conteudos associados a taxonomias.

### Importancia funcional

Pesquisa e a porta principal da descoberta. Sem ela, o utilizador depende apenas do catalogo inicial. Este BK prepara `BK-MF3-04`, onde filtros, ordenacao, carrosseis e relacionados melhoram a navegacao.

### Scope-in

- Criar endpoint publico `GET /api/search`.
- Pesquisar em `title`, `synopsis`, `slug` e nomes de taxonomias.
- Devolver apenas conteudos `published`.
- Usar paginacao com `page` e `limit`.
- Criar cliente frontend `searchApi`.
- Criar pagina `/pesquisa`.

### Scope-out

- Motor externo de pesquisa.
- Ranking por aprendizagem automatica.
- Pesquisa em comentarios.
- Filtros e ordenacao avancados, que ficam no `BK-MF3-04`.
- Recomendacoes.

### Glossario rapido

- `Query`: texto que o utilizador escreve para pesquisar.
- `Taxonomy`: tema ou classificacao criada no catalogo.
- `Paginacao`: dividir resultados por paginas para nao carregar tudo de uma vez.
- `Regex escapada`: pesquisa textual controlada sem executar padroes perigosos escritos pelo utilizador.

### Conceitos essenciais

- `CANONICO`: `RF22` exige pesquisa unificada.
- `CANONICO`: `RF06` e `RF07` criam catalogo e taxonomias que a pesquisa usa.
- `CANONICO`: `RNF09` pede respostas de pesquisa em menos de 2 segundos com paginacao ou carregamento incremental.
- `DERIVADO`: a pesquisa usa MongoDB e expressoes regulares escapadas para manter a solucao simples no MVP.
- `DERIVADO`: a resposta publica usa o mesmo formato basico de card do catalogo.

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

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-03` concluido.
- Colecoes `contents` e `taxonomies` existem.
- Conteudos publicados usam `title`, `slug`, `synopsis`, `type`, `assets.posterUrl` e `taxonomyIds`.
- Frontend tem router e `apiClient`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/search?q=texto&page=1&limit=12` |
| Fonte de dados | `contents`, `taxonomies` |
| Visibilidade | apenas `status: "published"` |
| Query | `2..80` caracteres |
| Paginacao | `page >= 1`, `limit 1..24` |
| Frontend | `searchApi`, `SearchPage` |
| Rota frontend | `/pesquisa` |
| Handoff | `BK-MF3-04` acrescenta filtros e discovery sobre este contrato |

### Formato de resposta

```js
{
  query,
  page,
  limit,
  total,
  items: [
    { id, title, slug, synopsis, type, posterUrl, taxonomyNames }
  ]
}
```

### Guia de execucao (passo-a-passo)

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
import { assertSearchQuery, escapeRegExp, parsePagination } from "./search.validation.js";

function publicSearchItem(content, taxonomyNamesById) {
  const taxonomyNames = (content.taxonomyIds ?? [])
    .map((id) => taxonomyNamesById.get(String(id)))
    .filter(Boolean);

  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    synopsis: content.synopsis,
    type: content.type,
    posterUrl: content.assets?.posterUrl ?? "",
    taxonomyNames,
  };
}

export async function ensureSearchIndexes() {
  const db = await getDb();
  await db.collection("contents").createIndex({ status: 1, title: 1 });
  await db.collection("contents").createIndex({ status: 1, slug: 1 });
  await db.collection("taxonomies").createIndex({ name: 1 });
}

export async function searchContents(params) {
  const db = await getDb();
  const query = assertSearchQuery(params.q);
  const { page, limit } = parsePagination(params);
  const expression = new RegExp(escapeRegExp(query), "i");

  const matchingTaxonomies = await db.collection("taxonomies")
    .find({ name: expression })
    .project({ _id: 1, name: 1 })
    .toArray();

  const taxonomyIds = matchingTaxonomies.map((taxonomy) => taxonomy._id);
  const taxonomyNamesById = new Map(
    matchingTaxonomies.map((taxonomy) => [String(taxonomy._id), taxonomy.name]),
  );

  const match = {
    status: "published",
    $or: [
      { title: expression },
      { synopsis: expression },
      { slug: expression },
      ...(taxonomyIds.length > 0 ? [{ taxonomyIds: { $in: taxonomyIds } }] : []),
    ],
  };

  const [total, contents] = await Promise.all([
    db.collection("contents").countDocuments(match),
    db.collection("contents")
      .find(match)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
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
    total,
    items: contents.map((content) => publicSearchItem(content, taxonomyNamesById)),
  };
}
```

5. Explicacao do codigo ou da decisao.

A pesquisa respeita o contrato do catalogo: apenas `published`. Taxonomias permitem que pesquisar por um tema encontre conteudos associados a esse tema.

6. Validacao do passo.

```bash
node -e "import('./src/modules/search/search.service.js').then(({ searchContents }) => console.log(typeof searchContents))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Pesquisar diretamente em toda a base sem `status` pode mostrar conteudos ainda em preparacao.

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
import { getSearchResults } from "./search.controller.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(getSearchResults));
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
  search({ q, page = 1, limit = 12 }) {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
    });

    return apiClient.get(`/api/search?${params.toString()}`);
  },
};
```

`frontend/src/pages/SearchPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchApi } from "../services/api/searchApi.js";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formQuery, setFormQuery] = useState(searchParams.get("q") ?? "");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      setStatus("idle");
      return;
    }

    let active = true;
    setStatus("loading");
    setError("");

    searchApi.search({ q: query })
      .then((response) => {
        if (!active) return;
        setResult(response);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setError("Nao foi possivel concluir a pesquisa.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [query]);

  function submit(event) {
    event.preventDefault();
    const trimmed = formQuery.trim();
    if (trimmed.length >= 2) setSearchParams({ q: trimmed });
  }

  return (
    <main className="search-page">
      <h1>Pesquisa</h1>

      <form onSubmit={submit} role="search">
        <label htmlFor="search-query">Pesquisar conteudos e temas</label>
        <input
          id="search-query"
          value={formQuery}
          minLength={2}
          maxLength={80}
          onChange={(event) => setFormQuery(event.target.value)}
        />
        <button type="submit">Pesquisar</button>
      </form>

      {status === "idle" && <p>Escreve pelo menos 2 caracteres para pesquisar.</p>}
      {status === "loading" && <p>A pesquisar...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "success" && result.items.length === 0 && <p>Nao foram encontrados conteudos publicados.</p>}

      {result?.items.length > 0 && (
        <section aria-label="Resultados de pesquisa">
          <p>{result.total} resultado(s) para "{result.query}".</p>
          <ul className="content-grid">
            {result.items.map((item) => (
              <li key={item.id}>
                <article className="content-card">
                  {item.posterUrl && <img src={item.posterUrl} alt="" />}
                  <h2>{item.title}</h2>
                  <p>{item.synopsis}</p>
                  <p>{item.taxonomyNames.join(", ")}</p>
                  <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { SearchPage } from "../pages/SearchPage.jsx";

<Route path="/pesquisa" element={<SearchPage />} />
```

5. Explicacao do codigo ou da decisao.

A pagina mantem a query na URL. Assim, o utilizador pode partilhar ou recarregar a pesquisa. Estados `idle`, `loading`, `error`, `empty` e `success` evitam uma interface confusa.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem empty state, uma pesquisa sem resultados parece uma pagina partida.

## Criterios de aceite (mensuraveis)

- `GET /api/search?q=fe` devolve `200`, `items`, `total`, `page` e `limit`.
- Query com menos de 2 caracteres devolve `400`.
- `page=0` ou `limit=100` devolve `400`.
- Resultados incluem apenas conteudos `published`.
- Pesquisa por nome de taxonomia devolve conteudos associados a essa taxonomia.
- A pagina `/pesquisa` mostra loading, erro, vazio e resultados.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i "http://localhost:3000/api/search?q=fe&page=1&limit=12"
```

Resultado esperado: testes e build passam; o endpoint devolve resposta paginada.

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `search`.
- `proof`: resposta de `GET /api/search?q=fe`.
- `proof`: captura da pagina `/pesquisa?q=fe`.
- `neg`: `400` para query curta, `400` para limite invalido, zero resultados para termo inexistente.

## Handoff

O `BK-MF3-04` deve reutilizar este contrato e alargar descoberta com filtros, ordenacao, carrosseis e relacionados, sem criar outro endpoint para a mesma pesquisa textual.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 5. O ponto central deste BK e:

```js
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

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com pesquisa publica, paginacao, taxonomias, frontend e criterios mensuraveis.
