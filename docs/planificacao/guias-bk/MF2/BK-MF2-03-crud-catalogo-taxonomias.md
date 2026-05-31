# BK-MF2-03 - CRUD de catalogo e taxonomias

## Header

- `doc_id`: `GUIA-BK-MF2-03`
- `bk_id`: `BK-MF2-03`
- `macro`: `MF2`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF1-01`
- `rf_rnf`: `RF06, RF07, RF09, RF10`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-04`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais criar o catalogo base da FaithFlix: conteudos, taxonomias, estados de publicacao e revisoes. A entrega cobre `RF06`, `RF07`, `RF09` e `RF10`.

No fim, deves conseguir explicar como um conteudo passa de `draft` para `published`, porque utilizadores comuns so veem conteudo publicado e como uma revisao preserva o estado anterior antes de uma alteracao relevante.

### Importancia funcional

O catalogo e o contrato central da experiencia de streaming. A pagina de detalhe, o player, favoritos, watchlist, historico, pesquisa e recomendacoes dependem dos mesmos campos (`id`, `slug`, `title`, `synopsis`, `assets`, `media`, `status`).

### Scope-in

- Criar colecoes `contents`, `taxonomies` e `content_revisions`.
- Criar validacao para tipos, estados, campos de apresentacao e media base.
- Listar apenas conteudos publicados no catalogo publico.
- Permitir criar, editar, publicar e arquivar conteudos a `admin` e `moderator`.
- Criar taxonomias reutilizaveis.
- Criar cliente frontend de catalogo e uma pagina admin minima.

### Scope-out

- Pesquisa full-text avancada.
- Recomendacoes personalizadas.
- Upload real de ficheiros de video.
- Series com temporadas e episodios encadeados.
- Workflow editorial com aprovacao multipla.

### Glossario rapido

- `Content`: item reproduzivel ou apresentavel no catalogo.
- `Taxonomy`: classificacao reutilizavel para organizar conteudos.
- `draft`: conteudo ainda nao visivel ao publico.
- `published`: conteudo visivel no catalogo publico.
- `archived`: conteudo removido da experiencia publica sem apagar historico.
- `Revision`: registo do estado anterior antes de uma alteracao.

### Conceitos essenciais

- O header canonico deste BK mantem a dependencia documental existente. Na sequencia de execucao da MF2, os BKs 01 e 02 ja entregam `req.user`, `requireAuth` e `requireRole`, que sao usados aqui.
- A listagem publica filtra sempre `status: "published"`.
- Criar ou alterar catalogo e uma acao protegida por role.
- O `slug` deve ser unico para permitir URLs estaveis.
- `media.playbackUrl` fica definido aqui para o player do `BK-MF2-05`.

### Tempo estimado

- Rever contratos e campos do catalogo: 25 min.
- Backend de conteudos: 90 min.
- Backend de taxonomias: 45 min.
- Frontend publico e admin minimo: 70 min.
- Validacao, negativos e evidence: 45 min.

### Erros comuns

- Mostrar `draft` no catalogo publico.
- Aceitar estados fora de `draft`, `published`, `archived`.
- Deixar um utilizador comum criar conteudos.
- Criar um campo diferente para URL de reproducao.
- Editar conteudo sem guardar revisao.

### Check de compreensao

- [ ] Sei listar os campos obrigatorios de `Content`.
- [ ] Sei explicar a diferenca entre `draft`, `published` e `archived`.
- [ ] Sei porque `admin` e `moderator` podem gerir catalogo.
- [ ] Sei que o detalhe do `BK-MF2-04` usa este mesmo modelo.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-01` concluido.
- Na sequencia MF2, `BK-MF2-01` e `BK-MF2-02` ja foram concluidos para auth e roles.
- MongoDB configurado.
- `requireRole(["admin", "moderator"])` disponivel.
- Frontend consegue chamar a API com cookie.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecoes | `contents`, `taxonomies`, `content_revisions` |
| Estados | `draft`, `published`, `archived` |
| Tipos | `movie`, `series`, `episode`, `documentary` |
| Catalogo publico | `GET /api/catalog` devolve apenas `published` |
| Admin catalogo | `POST /api/catalog`, `PATCH /api/catalog/:id`, `PATCH /api/catalog/:id/status` |
| Taxonomias | `GET /api/catalog/taxonomies`, `POST /api/catalog/taxonomies` |
| Guards | `admin` e `moderator` gerem catalogo; `user` consulta apenas publicado |
| Handoff | `BK-MF2-04` recebe `id`, `slug`, `title`, `synopsis`, `assets`, `media`, `taxonomyIds` |

### Modelo `Content`

```js
{
  _id,
  title,
  slug,
  synopsis,
  type,
  durationSeconds,
  ageRating,
  status,
  taxonomyIds,
  assets: {
    posterUrl,
    backdropUrl
  },
  media: {
    playbackUrl
  },
  createdBy,
  updatedBy,
  publishedAt,
  createdAt,
  updatedAt
}
```

### Decisoes tecnicas

- `CANONICO`: a base do catalogo usa MongoDB.
- `CANONICO`: conteudo publico e apenas `published`.
- `DERIVADO`: `slug` unico permite rotas legiveis no frontend.
- `DERIVADO`: revisoes guardam snapshots para diagnosticar alteracoes.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de catalogo

1. Objetivo do passo.

Garantir que conteudos entram no sistema com campos coerentes e estados controlados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/catalog.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo. Usa `assertCatalogPayload` em criacao e edicao.

4. Codigo completo.

```js
export const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];
export const CONTENT_STATUS = ["draft", "published", "archived"];

function requiredText(value, field, min = 2, max = 160) {
  const text = String(value ?? "").trim();

  if (text.length < min || text.length > max) {
    const error = new Error(`${field} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function positiveInteger(value, field) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    const error = new Error(`${field} deve ser um inteiro positivo.`);
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function ageRating(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0 || number > 18) {
    const error = new Error("Classificacao etaria invalida.");
    error.statusCode = 400;
    throw error;
  }

  return number;
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function assertCatalogPayload(input) {
  const title = requiredText(input.title, "title");
  const type = String(input.type ?? "").trim();

  if (!CONTENT_TYPES.includes(type)) {
    const error = new Error("Tipo de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  const slug = input.slug ? slugify(input.slug) : slugify(title);

  if (!slug) {
    const error = new Error("Slug invalido.");
    error.statusCode = 400;
    throw error;
  }

  return {
    title,
    slug,
    synopsis: requiredText(input.synopsis, "synopsis", 20, 1000),
    type,
    durationSeconds: positiveInteger(input.durationSeconds, "durationSeconds"),
    ageRating: ageRating(input.ageRating ?? 0),
    taxonomyIds: Array.isArray(input.taxonomyIds) ? input.taxonomyIds : [],
    assets: {
      posterUrl: String(input.assets?.posterUrl ?? "").trim(),
      backdropUrl: String(input.assets?.backdropUrl ?? "").trim(),
    },
    media: {
      playbackUrl: requiredText(input.media?.playbackUrl, "media.playbackUrl", 1, 500),
    },
  };
}

export function assertStatus(status) {
  const normalized = String(status ?? "").trim();

  if (!CONTENT_STATUS.includes(normalized)) {
    const error = new Error("Estado de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export function assertTaxonomyPayload(input) {
  const name = requiredText(input.name, "name", 2, 80);

  return {
    name,
    slug: input.slug ? slugify(input.slug) : slugify(name),
    description: String(input.description ?? "").trim(),
  };
}
```

5. Explicacao do codigo ou da decisao.

O validador centraliza nomes de campos e impede que cada controller aceite formatos diferentes.

6. Validacao do passo.

```bash
node -e "import('./src/modules/catalog/catalog.validation.js').then(({ slugify }) => console.log(slugify('Piloto FaithFlix')))"
```

Resultado esperado: `piloto-faithflix`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estados fechados, um conteudo com `status: "publicado"` poderia ficar invisivel para um endpoint que espera `published`.

### Passo 2 - Criar servico de catalogo

1. Objetivo do passo.

Implementar criacao, edicao, publicacao, arquivo e listagem publica com revisoes.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/catalog.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o servico abaixo. Garante indice unico por `slug` antes de usar em ambiente local.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertCatalogPayload, assertStatus } from "./catalog.validation.js";

function asContentObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function publicContent(content) {
  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    synopsis: content.synopsis,
    type: content.type,
    durationSeconds: content.durationSeconds,
    ageRating: content.ageRating,
    taxonomyIds: content.taxonomyIds ?? [],
    assets: content.assets,
    media: content.media,
    publishedAt: content.publishedAt ?? null,
  };
}

async function saveRevision(db, content, userId, action) {
  await db.collection("content_revisions").insertOne({
    contentId: content._id,
    action,
    snapshot: content,
    changedBy: new ObjectId(userId),
    createdAt: new Date(),
  });
}

export async function ensureCatalogIndexes() {
  const db = await getDb();
  await db.collection("contents").createIndex({ slug: 1 }, { unique: true });
  await db.collection("contents").createIndex({ status: 1, publishedAt: -1 });
  await db.collection("taxonomies").createIndex({ slug: 1 }, { unique: true });
}

export async function listPublishedCatalog() {
  const db = await getDb();
  const contents = await db
    .collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .toArray();

  return contents.map(publicContent);
}

export async function listAdminCatalog() {
  const db = await getDb();
  const contents = await db.collection("contents").find({}).sort({ updatedAt: -1 }).toArray();
  return contents.map((content) => ({ ...publicContent(content), status: content.status }));
}

export async function createContent(input, userId) {
  const db = await getDb();
  const now = new Date();
  const payload = assertCatalogPayload(input);

  const document = {
    ...payload,
    status: "draft",
    createdBy: new ObjectId(userId),
    updatedBy: new ObjectId(userId),
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("contents").insertOne(document);
  return { ...publicContent({ ...document, _id: result.insertedId }), status: document.status };
}

export async function updateContent(contentId, input, userId) {
  const db = await getDb();
  const _id = asContentObjectId(contentId);
  const existing = await db.collection("contents").findOne({ _id });

  if (!existing) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await saveRevision(db, existing, userId, "update");

  const updated = await db.collection("contents").findOneAndUpdate(
    { _id },
    { $set: { ...assertCatalogPayload(input), updatedBy: new ObjectId(userId), updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return { ...publicContent(updated), status: updated.status };
}

export async function changeContentStatus(contentId, status, userId) {
  const db = await getDb();
  const _id = asContentObjectId(contentId);
  const existing = await db.collection("contents").findOne({ _id });

  if (!existing) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const nextStatus = assertStatus(status);
  const now = new Date();
  await saveRevision(db, existing, userId, nextStatus);

  const updated = await db.collection("contents").findOneAndUpdate(
    { _id },
    {
      $set: {
        status: nextStatus,
        updatedBy: new ObjectId(userId),
        updatedAt: now,
        publishedAt: nextStatus === "published" ? now : existing.publishedAt ?? null,
      },
    },
    { returnDocument: "after" },
  );

  return { ...publicContent(updated), status: updated.status };
}
```

5. Explicacao do codigo ou da decisao.

O servico publico devolve apenas conteudos publicados. O servico admin devolve tambem `status`, porque essa informacao e necessaria para gestao editorial.

6. Validacao do passo.

```bash
node -e "import('./src/modules/catalog/catalog.service.js').then((m) => console.log(typeof m.createContent, typeof m.listPublishedCatalog))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice unico em `slug`, dois conteudos poderiam disputar a mesma URL no detalhe.

### Passo 3 - Criar servico de taxonomias

1. Objetivo do passo.

Permitir criar e listar classificacoes reutilizaveis para o catalogo.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/taxonomy.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o servico abaixo e usa a validacao criada no passo 1.

4. Codigo completo.

```js
import { getDb } from "../../config/database.js";
import { assertTaxonomyPayload } from "./catalog.validation.js";

function publicTaxonomy(taxonomy) {
  return {
    id: String(taxonomy._id),
    name: taxonomy.name,
    slug: taxonomy.slug,
    description: taxonomy.description,
  };
}

export async function listTaxonomies() {
  const db = await getDb();
  const taxonomies = await db.collection("taxonomies").find({}).sort({ name: 1 }).toArray();
  return taxonomies.map(publicTaxonomy);
}

export async function createTaxonomy(input) {
  const db = await getDb();
  const now = new Date();
  const document = {
    ...assertTaxonomyPayload(input),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("taxonomies").insertOne(document);
  return publicTaxonomy({ ...document, _id: result.insertedId });
}
```

5. Explicacao do codigo ou da decisao.

Taxonomias ficam independentes de conteudos para serem reutilizadas por varios itens.

6. Validacao do passo.

```bash
node -e "import('./src/modules/catalog/taxonomy.service.js').then(({ listTaxonomies }) => console.log(typeof listTaxonomies))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se cada conteudo guardar nomes livres, filtros e recomendacoes futuras ficam inconsistentes.

### Passo 4 - Criar controller e rotas

1. Objetivo do passo.

Expor catalogo publico e operacoes protegidas de gestao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/catalog/catalog.controller.js`
    - CRIAR: `backend/src/modules/catalog/catalog.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e rotas. Mantem rotas fixas antes de rotas dinamicas que serao adicionadas no `BK-MF2-04`.

4. Codigo completo.

`backend/src/modules/catalog/catalog.controller.js`

```js
import {
  changeContentStatus,
  createContent,
  listAdminCatalog,
  listPublishedCatalog,
  updateContent,
} from "./catalog.service.js";
import { createTaxonomy, listTaxonomies } from "./taxonomy.service.js";

export async function getCatalog(req, res) {
  res.status(200).json({ items: await listPublishedCatalog() });
}

export async function getAdminCatalog(req, res) {
  res.status(200).json({ items: await listAdminCatalog() });
}

export async function postContent(req, res) {
  res.status(201).json({ content: await createContent(req.body, req.user.id) });
}

export async function patchContent(req, res) {
  res.status(200).json({ content: await updateContent(req.params.id, req.body, req.user.id) });
}

export async function patchContentStatus(req, res) {
  res.status(200).json({ content: await changeContentStatus(req.params.id, req.body.status, req.user.id) });
}

export async function getTaxonomies(req, res) {
  res.status(200).json({ items: await listTaxonomies() });
}

export async function postTaxonomy(req, res) {
  res.status(201).json({ taxonomy: await createTaxonomy(req.body) });
}
```

`backend/src/modules/catalog/catalog.routes.js`

```js
import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getAdminCatalog,
  getCatalog,
  getTaxonomies,
  patchContent,
  patchContentStatus,
  postContent,
  postTaxonomy,
} from "./catalog.controller.js";

export const catalogRouter = Router();

const canManageCatalog = requireRole(["admin", "moderator"]);

catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.patch("/:id/status", canManageCatalog, asyncHandler(patchContentStatus));
```

5. Explicacao do codigo ou da decisao.

`GET /api/catalog` e publico. Qualquer escrita passa por `canManageCatalog`.

6. Validacao do passo.

Sem admin:

```bash
curl -i -X POST http://localhost:3000/api/catalog
```

Resultado esperado: `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `POST /api/catalog` ficar publico, qualquer visitante pode criar conteudo.

### Passo 5 - Montar catalogo na app

1. Objetivo do passo.

Ligar as rotas de catalogo e criar indices antes de aceitar pedidos.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: trechos de integracao

3. Instrucoes concretas.

Monta `catalogRouter` depois de `attachSession`. Chama `ensureCatalogIndexes` no arranque do servidor.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { catalogRouter } from "./modules/catalog/catalog.routes.js";

app.use(attachSession);
app.use("/api/catalog", catalogRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";

await ensureCatalogIndexes();
```

5. Explicacao do codigo ou da decisao.

As rotas admin precisam de sessao, por isso o router vem depois de `attachSession`. Os indices reduzem conflitos de `slug` e aceleram listagens.

6. Validacao do passo.

Arranca o backend:

```bash
npm --prefix backend run dev
```

Resultado esperado: o servidor arranca sem erro de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o router vier antes da sessao, `requireRole` nao encontra `req.user`.

### Passo 6 - Criar cliente frontend e pagina publica

1. Objetivo do passo.

Permitir ao frontend listar catalogo publicado e preparar links para o detalhe.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/catalogApi.js`
    - CRIAR ou EDITAR: `frontend/src/pages/CatalogPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiros completos para API e pagina; trecho de rotas

3. Instrucoes concretas.

Cria `catalogApi` com metodos publicos e admin. Liga a rota `/catalogo`.

4. Codigo completo.

`frontend/src/services/api/catalogApi.js`

```js
import { apiClient } from "./apiClient.js";

export const catalogApi = {
  listPublished() {
    return apiClient.get("/api/catalog");
  },
  listAdmin() {
    return apiClient.get("/api/catalog/admin");
  },
  createContent(input) {
    return apiClient.post("/api/catalog", input);
  },
  updateContent(contentId, input) {
    return apiClient.patch(`/api/catalog/${encodeURIComponent(contentId)}`, input);
  },
  updateStatus(contentId, status) {
    return apiClient.patch(`/api/catalog/${encodeURIComponent(contentId)}/status`, { status });
  },
  listTaxonomies() {
    return apiClient.get("/api/catalog/taxonomies");
  },
  createTaxonomy(input) {
    return apiClient.post("/api/catalog/taxonomies", input);
  },
};
```

`frontend/src/pages/CatalogPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../services/api/catalogApi.js";

export function CatalogPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    catalogApi.listPublished()
      .then((response) => setItems(response.items))
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <main className="page-shell">
      <h1>Catalogo</h1>
      {error && <p role="alert">{error}</p>}
      <section className="content-grid" aria-label="Conteudos publicados">
        {items.map((content) => (
          <article key={content.id}>
            <img src={content.assets.posterUrl} alt="" />
            <h2>{content.title}</h2>
            <p>{content.synopsis}</p>
            <Link to={`/catalogo/${content.slug}`}>Ver detalhe</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { CatalogPage } from "../pages/CatalogPage.jsx";

<Route path="/catalogo" element={<CatalogPage />} />
```

5. Explicacao do codigo ou da decisao.

A pagina publica nao recebe drafts, porque o filtro esta no backend. O link usa `slug` para preparar o detalhe.

6. Validacao do passo.

Abre `/catalogo` com pelo menos um conteudo publicado. Deve aparecer o item e o link para detalhe.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a pagina filtrar drafts no browser, a API continua a expor conteudo indevido.

### Passo 7 - Criar pagina admin minima

1. Objetivo do passo.

Permitir a `admin` e `moderator` ver, criar e mudar estado de conteudos.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/pages/AdminCatalogPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiro completo para pagina; trecho de rotas

3. Instrucoes concretas.

Cria a pagina com um formulario minimo e botoes para alterar estado.

4. Codigo completo.

```jsx
import { useEffect, useState } from "react";
import { catalogApi } from "../services/api/catalogApi.js";

const EMPTY_FORM = {
  title: "",
  synopsis: "",
  type: "movie",
  durationSeconds: 120,
  ageRating: 6,
  assets: { posterUrl: "", backdropUrl: "" },
  media: { playbackUrl: "/media/piloto.mp4" },
};

export function AdminCatalogPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function loadItems() {
    const response = await catalogApi.listAdmin();
    setItems(response.items);
  }

  useEffect(() => {
    loadItems().catch((requestError) => setError(requestError.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await catalogApi.createContent(form);
      setForm(EMPTY_FORM);
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeStatus(contentId, status) {
    setError("");

    try {
      await catalogApi.updateStatus(contentId, status);
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>Gestao de catalogo</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input aria-label="Titulo" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <textarea aria-label="Sinopse" value={form.synopsis} onChange={(event) => setForm({ ...form, synopsis: event.target.value })} />
        <button type="submit">Criar conteudo</button>
      </form>
      <section>
        {items.map((content) => (
          <article key={content.id}>
            <h2>{content.title}</h2>
            <p>{content.status}</p>
            <button type="button" onClick={() => changeStatus(content.id, "published")}>Publicar</button>
            <button type="button" onClick={() => changeStatus(content.id, "archived")}>Arquivar</button>
          </article>
        ))}
      </section>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { AdminCatalogPage } from "../pages/AdminCatalogPage.jsx";

<Route path="/admin/catalogo" element={<AdminCatalogPage />} />
```

5. Explicacao do codigo ou da decisao.

A UI e minima, mas usa os endpoints reais. A permissao continua a ser validada no backend.

6. Validacao do passo.

Com utilizador `admin` ou `moderator`, cria conteudo, publica e confirma que aparece em `/catalogo`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o admin criar conteudo com `media.playbackUrl` vazio, o player do BK seguinte nao tem fonte de video.

### Passo 8 - Validar endpoints principais

1. Objetivo do passo.

Confirmar que publico, admin e estados se comportam como esperado.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API e UI

3. Instrucoes concretas.

Usa um cookie de admin gerado nos BKs anteriores.

4. Codigo completo.

```bash
curl -i http://localhost:3000/api/catalog

curl -i -b /tmp/faithflix.cookies \
  -H "Content-Type: application/json" \
  -d '{"title":"Piloto FaithFlix","synopsis":"Conteudo curto para validar o catalogo da FaithFlix.","type":"movie","durationSeconds":120,"ageRating":6,"assets":{"posterUrl":"","backdropUrl":""},"media":{"playbackUrl":"/media/piloto.mp4"}}' \
  http://localhost:3000/api/catalog

curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/catalog/admin
```

5. Explicacao do codigo ou da decisao.

A primeira chamada publica deve funcionar sem login. As chamadas de escrita e admin precisam do cookie.

6. Validacao do passo.

Resultados esperados:

- `GET /api/catalog` devolve `200`.
- `POST /api/catalog` sem cookie devolve `401`.
- `POST /api/catalog` com admin devolve `201`.
- Conteudo `draft` nao aparece em `/api/catalog` antes de publicar.

7. Caso negativo, erro comum ou risco que este passo evita.

Se um `draft` aparecer na listagem publica, corrige primeiro o filtro do backend.

## Snippet tecnico aplicavel

```js
catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.post("/", requireRole(["admin", "moderator"]), asyncHandler(postContent));
```

## Criterios de aceite (mensuraveis)

- [ ] `GET /api/catalog` devolve apenas conteudos `published`.
- [ ] `POST /api/catalog` exige `admin` ou `moderator`.
- [ ] `PATCH /api/catalog/:id/status` aceita apenas `draft`, `published` e `archived`.
- [ ] `slug` e unico.
- [ ] Alteracoes relevantes geram documento em `content_revisions`.
- [ ] `/catalogo` mostra conteudos publicados.
- [ ] `/admin/catalogo` permite gestao minima a roles autorizadas.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas de `curl`, screenshot de `/catalogo` e screenshot de `/admin/catalogo`.

## Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `GET /api/catalog` com apenas conteudos `published`.
- Resposta `curl` de `POST /api/catalog` sem cookie a devolver `401`.
- Resposta `curl` de `POST /api/catalog` com admin a devolver `201`.
- Screenshot de `/catalogo` com conteudos publicados.
- Screenshot de `/admin/catalogo` com gestao minima para roles autorizadas.

## Handoff

O `BK-MF2-04` deve usar `GET /api/catalog/:idOrSlug` sobre a colecao `contents`, devolvendo apenas conteudos `published` com os campos definidos neste BK.

## Proximo BK recomendado

`BK-MF2-04` - Pagina de detalhe de conteudo.

## Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
