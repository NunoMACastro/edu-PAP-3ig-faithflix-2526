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

Criar o catalogo base do FaithFlix: conteudos, temas/taxonomias, estados de publicacao e revisoes. Este BK cobre `RF06`, `RF07`, `RF09` e `RF10`.

O aluno deve perceber que o catalogo e o contrato central do produto. Se os campos ficarem instaveis, a pagina de detalhe, o player, a pesquisa e as recomendacoes ficam incoerentes.

### Tempo estimado

- Leitura dos contratos e definicao de campos: 25 min.
- Backend de taxonomias: 45 min.
- Backend de conteudos e revisoes: 90 min.
- UI/admin minima: 60 min.
- Testes negativos e evidence: 45 min.

### Conceitos essenciais

- `Content` representa filme, serie, episodio ou documentario dentro do MVP.
- `Taxonomy` representa tema/colecao generica reutilizavel.
- Conteudo `draft` nao aparece no catalogo publico.
- `published` aparece para utilizadores.
- `archived` fica guardado, mas nao entra na experiencia publica.
- Uma revisao guarda o estado anterior antes de cada alteracao relevante.

### Erros comuns

- Misturar conteudo publicado com rascunhos na listagem publica.
- Aceitar qualquer string como estado.
- Criar campos diferentes para o mesmo conceito em BKs seguintes.
- Deixar utilizadores comuns criar ou publicar conteudo.
- Editar conteudo sem registar revisao.

### Check de compreensao

- [ ] Sei listar os campos obrigatorios de `Content`.
- [ ] Sei explicar a diferenca entre `draft`, `published` e `archived`.
- [ ] Sei porque `admin` e `moderator` podem gerir catalogo, mas `user` nao.
- [ ] Sei que `BK-MF2-04` usa o mesmo modelo para mostrar detalhe.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-01` concluido para autenticacao.
- `BK-MF2-02` concluido para `requireRole(["admin", "moderator"])`.
- MongoDB configurado.
- Frontend consegue chamar API com cookie.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecoes | `contents`, `taxonomies`, `content_revisions` |
| Estados | `draft`, `published`, `archived` |
| Tipos | `movie`, `series`, `episode`, `documentary` |
| Publico | `GET /api/catalog` devolve apenas `published` |
| Admin | `POST/PATCH /api/catalog`, publicar, arquivar, criar taxonomias |
| Guards | `admin` e `moderator` gerem catalogo; `user` so consulta publicado |
| Handoff | `BK-MF2-04` recebe `id`, `slug`, `title`, `synopsis`, `assets`, `media`, `taxonomies` |

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

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de catalogo

`CRIAR backend/src/modules/catalog/catalog.validation.js`

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

function positiveNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    const error = new Error(`${field} deve ser positivo.`);
    error.statusCode = 400;
    throw error;
  }
  return number;
}

export function slugify(title) {
  return title
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

  return {
    title,
    slug: input.slug ? slugify(input.slug) : slugify(title),
    synopsis: requiredText(input.synopsis, "synopsis", 20, 1000),
    type,
    durationSeconds: positiveNumber(input.durationSeconds, "durationSeconds"),
    ageRating: Number(input.ageRating ?? 0),
    taxonomyIds: Array.isArray(input.taxonomyIds) ? input.taxonomyIds : [],
    assets: {
      posterUrl: String(input.assets?.posterUrl ?? "").trim(),
      backdropUrl: String(input.assets?.backdropUrl ?? "").trim(),
    },
    media: {
      playbackUrl: String(input.media?.playbackUrl ?? "").trim(),
    },
  };
}

export function assertStatus(status) {
  if (!CONTENT_STATUS.includes(status)) {
    const error = new Error("Estado de conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }
  return status;
}
```

### Passo 2 - Criar servico de catalogo

`CRIAR backend/src/modules/catalog/catalog.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertCatalogPayload, assertStatus } from "./catalog.validation.js";

function asObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(id);
}

function publicContent(content) {
  return { ...content, id: String(content._id), _id: undefined };
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

export async function createContent(input, userId) {
  const db = await getDb();
  const payload = assertCatalogPayload(input);
  const now = new Date();

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
  return publicContent({ ...document, _id: result.insertedId });
}

export async function updateContent(id, input, userId) {
  const db = await getDb();
  const objectId = asObjectId(id);
  const current = await db.collection("contents").findOne({ _id: objectId });
  if (!current) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await saveRevision(db, current, userId, "update");
  const update = { ...assertCatalogPayload(input), updatedBy: new ObjectId(userId), updatedAt: new Date() };
  const result = await db.collection("contents").findOneAndUpdate(
    { _id: objectId },
    { $set: update },
    { returnDocument: "after" },
  );

  return publicContent(result);
}

export async function changeContentStatus(id, status, userId) {
  const db = await getDb();
  const objectId = asObjectId(id);
  const current = await db.collection("contents").findOne({ _id: objectId });
  if (!current) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await saveRevision(db, current, userId, status);
  const nextStatus = assertStatus(status);
  const result = await db.collection("contents").findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        status: nextStatus,
        publishedAt: nextStatus === "published" ? new Date() : current.publishedAt,
        updatedBy: new ObjectId(userId),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return publicContent(result);
}

export async function listPublishedContent() {
  const db = await getDb();
  const contents = await db.collection("contents").find({ status: "published" }).sort({ publishedAt: -1 }).toArray();
  return contents.map(publicContent);
}

export async function listAdminContent() {
  const db = await getDb();
  const contents = await db.collection("contents").find({}).sort({ updatedAt: -1 }).toArray();
  return contents.map(publicContent);
}
```

### Passo 3 - Criar taxonomias

`CRIAR backend/src/modules/catalog/taxonomy.service.js`

```js
import { getDb } from "../../config/database.js";
import { slugify } from "./catalog.validation.js";

export async function listTaxonomies() {
  const db = await getDb();
  return db.collection("taxonomies").find({}).sort({ name: 1 }).toArray();
}

export async function createTaxonomy(input, userId) {
  const name = String(input.name ?? "").trim();
  if (name.length < 2 || name.length > 80) {
    const error = new Error("Taxonomia invalida.");
    error.statusCode = 400;
    throw error;
  }

  const db = await getDb();
  const document = {
    name,
    slug: slugify(name),
    createdBy: userId,
    createdAt: new Date(),
  };

  const result = await db.collection("taxonomies").insertOne(document);
  return { ...document, id: String(result.insertedId) };
}
```

### Passo 4 - Criar controller e rotas

`CRIAR backend/src/modules/catalog/catalog.controller.js`

```js
import { createContent, changeContentStatus, listAdminContent, listPublishedContent, updateContent } from "./catalog.service.js";
import { createTaxonomy, listTaxonomies } from "./taxonomy.service.js";

export async function getPublishedCatalog(req, res) {
  res.status(200).json({ contents: await listPublishedContent() });
}

export async function getAdminCatalog(req, res) {
  res.status(200).json({ contents: await listAdminContent() });
}

export async function postContent(req, res) {
  res.status(201).json({ content: await createContent(req.body, req.user.id) });
}

export async function patchContent(req, res) {
  res.status(200).json({ content: await updateContent(req.params.id, req.body, req.user.id) });
}

export async function publishContent(req, res) {
  res.status(200).json({ content: await changeContentStatus(req.params.id, "published", req.user.id) });
}

export async function archiveContent(req, res) {
  res.status(200).json({ content: await changeContentStatus(req.params.id, "archived", req.user.id) });
}

export async function getTaxonomies(req, res) {
  res.status(200).json({ taxonomies: await listTaxonomies() });
}

export async function postTaxonomy(req, res) {
  res.status(201).json({ taxonomy: await createTaxonomy(req.body, req.user.id) });
}
```

`CRIAR backend/src/modules/catalog/catalog.routes.js`

```js
import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  archiveContent,
  getAdminCatalog,
  getPublishedCatalog,
  getTaxonomies,
  patchContent,
  postContent,
  postTaxonomy,
  publishContent,
} from "./catalog.controller.js";

export const catalogRouter = Router();
const canManageCatalog = requireRole(["admin", "moderator"]);

catalogRouter.get("/", asyncHandler(getPublishedCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.post("/:id/publish", canManageCatalog, asyncHandler(publishContent));
catalogRouter.post("/:id/archive", canManageCatalog, asyncHandler(archiveContent));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
```

`EDITAR backend/src/app.js`

```js
import { catalogRouter } from "./modules/catalog/catalog.routes.js";

app.use("/api/catalog", catalogRouter);
```

### Passo 5 - Criar cliente frontend

`CRIAR frontend/src/services/api/catalogApi.js`

```js
import { apiClient } from "./apiClient.js";

export const catalogApi = {
  listPublished() {
    return apiClient.get("/api/catalog");
  },
  listAdmin() {
    return apiClient.get("/api/catalog/admin");
  },
  createContent(payload) {
    return apiClient.post("/api/catalog", payload);
  },
  updateContent(contentId, payload) {
    return apiClient.patch(`/api/catalog/${contentId}`, payload);
  },
  publishContent(contentId) {
    return apiClient.post(`/api/catalog/${contentId}/publish`);
  },
  archiveContent(contentId) {
    return apiClient.post(`/api/catalog/${contentId}/archive`);
  },
  listTaxonomies() {
    return apiClient.get("/api/catalog/taxonomies");
  },
  createTaxonomy(payload) {
    return apiClient.post("/api/catalog/taxonomies", payload);
  },
};
```

### Passo 6 - Criar pagina admin de catalogo

`CRIAR frontend/src/pages/AdminCatalogPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { catalogApi } from "../services/api/catalogApi.js";

const EMPTY_CONTENT = {
  title: "",
  synopsis: "",
  type: "movie",
  durationSeconds: 3600,
  ageRating: 6,
  taxonomyIds: [],
  assets: { posterUrl: "", backdropUrl: "" },
  media: { playbackUrl: "" },
};

export function AdminCatalogPage() {
  const [contents, setContents] = useState([]);
  const [form, setForm] = useState(EMPTY_CONTENT);
  const [error, setError] = useState("");

  async function loadCatalog() {
    const response = await catalogApi.listAdmin();
    setContents(response.contents);
  }

  useEffect(() => {
    loadCatalog().catch((requestError) => setError(requestError.message));
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await catalogApi.createContent(form);
      setForm(EMPTY_CONTENT);
      await loadCatalog();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>Catalogo</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <form onSubmit={submit} className="catalog-form">
        <input name="title" value={form.title} onChange={updateField} placeholder="Titulo" />
        <textarea name="synopsis" value={form.synopsis} onChange={updateField} placeholder="Sinopse" />
        <select name="type" value={form.type} onChange={updateField}>
          <option value="movie">movie</option>
          <option value="series">series</option>
          <option value="episode">episode</option>
          <option value="documentary">documentary</option>
        </select>
        <input name="durationSeconds" type="number" value={form.durationSeconds} onChange={updateField} />
        <input name="ageRating" type="number" value={form.ageRating} onChange={updateField} />
        <button type="submit">Criar rascunho</button>
      </form>
      <ul className="admin-list">
        {contents.map((content) => (
          <li key={content.id}>
            <strong>{content.title}</strong>
            <span>{content.status}</span>
            <button type="button" onClick={() => catalogApi.publishContent(content.id).then(loadCatalog)}>Publicar</button>
            <button type="button" onClick={() => catalogApi.archiveContent(content.id).then(loadCatalog)}>Arquivar</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Passo 7 - Validar catalogo publico

Criar um conteudo como `admin` ou `moderator`, publicar e validar:

```bash
curl -i http://localhost:3000/api/catalog
curl -i http://localhost:3000/api/catalog/admin
curl -i -X POST http://localhost:3000/api/catalog \
  -H "Content-Type: application/json" \
  -d '{"title":"Piloto FaithFlix","synopsis":"Conteudo inicial para validar o catalogo do MVP.","type":"movie","durationSeconds":3600,"ageRating":6,"taxonomyIds":[],"assets":{"posterUrl":"","backdropUrl":""},"media":{"playbackUrl":"/media/piloto.mp4"}}'
```

### Passo 8 - Validar negativos minimos

- Utilizador sem role `admin` ou `moderator` em `POST /api/catalog` recebe `403`.
- Conteudo `draft` nao aparece em `GET /api/catalog`.
- Tipo invalido recebe `400`.
- Conteudo inexistente em `PATCH /api/catalog/:id` recebe `404`.
- Publicar conteudo cria revisao em `content_revisions`.

## Snippet tecnico aplicavel

O contrato mais importante e a separacao entre listagem publica e gestao:

```js
catalogRouter.get("/", asyncHandler(getPublishedCatalog));
catalogRouter.post("/", requireRole(["admin", "moderator"]), asyncHandler(postContent));
```

## Criterios de aceite (mensuraveis)

- `GET /api/catalog` mostra apenas conteudo `published`.
- `POST /api/catalog` cria conteudo `draft`.
- `PATCH /api/catalog/:id` atualiza conteudo e regista revisao.
- `POST /api/catalog/:id/publish` muda estado para `published`.
- `POST /api/catalog/:id/archive` muda estado para `archived`.
- `admin` e `moderator` conseguem gerir catalogo; `user` recebe `403`.
- A UI admin permite criar rascunho, publicar e arquivar.

## Validacao final

- Confirmar que existe indice unico opcional por `slug`, se a equipa decidir impedir slugs repetidos.
- Confirmar que `GET /api/catalog` nunca devolve `draft` nem `archived`.
- Confirmar que os campos usados por `BK-MF2-04` existem em todos os conteudos publicados.
- Confirmar que pelo menos uma revisao e criada apos alteracao.

## Evidence para PR/defesa

- Resposta de criacao de conteudo com `201`.
- Resposta de publicacao com `200`.
- Resposta publica sem rascunhos.
- Resposta `403` para utilizador sem permissao.
- Registo de revisao no MongoDB.

## Handoff

Para `BK-MF2-04`, entregar:

- Colecao `contents` com campos estaveis.
- Endpoints de listagem publica.
- Estados de publicacao claros.
- `media.playbackUrl` preparado para player.
- `assets.posterUrl` e `assets.backdropUrl` preparados para UI.

## Proximo BK recomendado

`BK-MF2-04 - Pagina de detalhe de conteudo`

## Changelog

- `2026-05-31`: Guia reescrito com modelo de catalogo, taxonomias, estados, revisoes, guards, UI admin, negativos e handoff para detalhe.
