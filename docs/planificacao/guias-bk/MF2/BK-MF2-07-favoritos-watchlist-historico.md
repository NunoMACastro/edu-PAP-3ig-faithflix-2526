# BK-MF2-07 - Favoritos/watchlist/historico

## Header

- `doc_id`: `GUIA-BK-MF2-07`
- `bk_id`: `BK-MF2-07`
- `macro`: `MF2`
- `owner`: `Davi`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-05`
- `rf_rnf`: `RF16, RF17, RF18`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-08`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-07-favoritos-watchlist-historico.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Implementar favoritos (`RF16`), watchlist (`RF17`) e historico de visualizacao (`RF18`) por utilizador. Este BK consolida a area pessoal do produto e entrega dados que vao ser usados por ratings, recomendacao e E2E.

### Tempo estimado

- Rever progresso de playback: 15 min.
- Backend de favoritos/watchlist: 60 min.
- Endpoint de historico: 45 min.
- UI e integracao no detalhe: 60 min.
- Negativos e evidence: 30 min.

### Conceitos essenciais

- Favorito e um marcador afetivo: "gosto deste conteudo".
- Watchlist e uma fila pessoal: "quero ver mais tarde".
- Historico vem de `playback_progress`, nao de uma colecao paralela.
- As operacoes de adicionar/remover devem ser idempotentes.
- Cada utilizador so ve as suas listas.

### Erros comuns

- Criar favoritos globais em vez de favoritos por utilizador.
- Duplicar o mesmo conteudo na mesma lista.
- Criar historico separado do progresso.
- Permitir guardar conteudo inexistente ou nao publicado.
- Devolver listas de outro utilizador.

### Check de compreensao

- [ ] Sei explicar a diferenca entre favorito e watchlist.
- [ ] Sei porque historico usa `playback_progress`.
- [ ] Sei testar idempotencia.
- [ ] Sei que `BK-MF2-08` depende deste fluxo.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-05` concluido.
- Utilizador autenticado.
- Conteudos publicados existem.
- `playback_progress` guarda eventos de visualizacao.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecao | `user_content_lists` |
| Tipos de lista | `favorite`, `watchlist` |
| Chave unica | `userId + contentId + type` |
| Favoritos | `PUT/DELETE /api/me/favorites/:contentId`, `GET /api/me/favorites` |
| Watchlist | `PUT/DELETE /api/me/watchlist/:contentId`, `GET /api/me/watchlist` |
| Historico | `GET /api/me/history` a partir de `playback_progress` |

### Modelo `user_content_lists`

```js
{
  _id,
  userId,
  contentId,
  type,
  createdAt,
  updatedAt
}
```

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao e helpers

`CRIAR backend/src/modules/library/library.validation.js`

```js
import { ObjectId } from "mongodb";

export const LIST_TYPES = ["favorite", "watchlist"];

export function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

export function assertListType(type) {
  if (!LIST_TYPES.includes(type)) {
    const error = new Error("Tipo de lista invalido.");
    error.statusCode = 400;
    throw error;
  }

  return type;
}
```

### Passo 2 - Criar servico de library

`CRIAR backend/src/modules/library/library.service.js`

```js
import { getDb } from "../../config/database.js";
import { asObjectId, assertListType } from "./library.validation.js";

async function assertPublishedContent(db, contentId) {
  const content = await db.collection("contents").findOne({
    _id: contentId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return content;
}

function publicContent(content) {
  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    posterUrl: content.assets?.posterUrl ?? "",
    type: content.type,
    durationSeconds: content.durationSeconds,
  };
}

export async function addToList(userId, contentId, type) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const listType = assertListType(type);

  await assertPublishedContent(db, contentObjectId);
  const now = new Date();

  await db.collection("user_content_lists").updateOne(
    { userId: userObjectId, contentId: contentObjectId, type: listType },
    { $set: { updatedAt: now }, $setOnInsert: { userId: userObjectId, contentId: contentObjectId, type: listType, createdAt: now } },
    { upsert: true },
  );

  return { contentId, type: listType, saved: true };
}

export async function removeFromList(userId, contentId, type) {
  const db = await getDb();
  await db.collection("user_content_lists").deleteOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: asObjectId(contentId, "Conteudo"),
    type: assertListType(type),
  });

  return { contentId, type, saved: false };
}

export async function listSavedContent(userId, type) {
  const db = await getDb();
  const rows = await db.collection("user_content_lists").aggregate([
    { $match: { userId: asObjectId(userId, "Utilizador"), type: assertListType(type) } },
    { $sort: { updatedAt: -1 } },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

  return rows.map((row) => publicContent(row.content));
}

export async function listHistory(userId) {
  const db = await getDb();
  const rows = await db.collection("playback_progress").aggregate([
    { $match: { userId: asObjectId(userId, "Utilizador") } },
    { $sort: { lastWatchedAt: -1 } },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

  return rows.map((row) => ({
    ...publicContent(row.content),
    currentTimeSeconds: row.currentTimeSeconds,
    durationSeconds: row.durationSeconds,
    completed: row.completed,
    lastWatchedAt: row.lastWatchedAt,
  }));
}
```

### Passo 3 - Criar controller e rotas

`CRIAR backend/src/modules/library/library.controller.js`

```js
import { addToList, listHistory, listSavedContent, removeFromList } from "./library.service.js";

export async function getFavorites(req, res) {
  res.status(200).json({ items: await listSavedContent(req.user.id, "favorite") });
}

export async function putFavorite(req, res) {
  res.status(200).json(await addToList(req.user.id, req.params.contentId, "favorite"));
}

export async function deleteFavorite(req, res) {
  res.status(200).json(await removeFromList(req.user.id, req.params.contentId, "favorite"));
}

export async function getWatchlist(req, res) {
  res.status(200).json({ items: await listSavedContent(req.user.id, "watchlist") });
}

export async function putWatchlist(req, res) {
  res.status(200).json(await addToList(req.user.id, req.params.contentId, "watchlist"));
}

export async function deleteWatchlist(req, res) {
  res.status(200).json(await removeFromList(req.user.id, req.params.contentId, "watchlist"));
}

export async function getHistory(req, res) {
  res.status(200).json({ items: await listHistory(req.user.id) });
}
```

`CRIAR backend/src/modules/library/library.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteFavorite,
  deleteWatchlist,
  getFavorites,
  getHistory,
  getWatchlist,
  putFavorite,
  putWatchlist,
} from "./library.controller.js";

export const libraryRouter = Router();

libraryRouter.use(requireAuth);
libraryRouter.get("/favorites", asyncHandler(getFavorites));
libraryRouter.put("/favorites/:contentId", asyncHandler(putFavorite));
libraryRouter.delete("/favorites/:contentId", asyncHandler(deleteFavorite));
libraryRouter.get("/watchlist", asyncHandler(getWatchlist));
libraryRouter.put("/watchlist/:contentId", asyncHandler(putWatchlist));
libraryRouter.delete("/watchlist/:contentId", asyncHandler(deleteWatchlist));
libraryRouter.get("/history", asyncHandler(getHistory));
```

`EDITAR backend/src/app.js`

```js
import { libraryRouter } from "./modules/library/library.routes.js";

app.use("/api/me", libraryRouter);
```

### Passo 4 - Criar cliente frontend

`CRIAR frontend/src/services/api/libraryApi.js`

```js
import { apiClient } from "./apiClient.js";

export const libraryApi = {
  getFavorites() {
    return apiClient.get("/api/me/favorites");
  },
  addFavorite(contentId) {
    return apiClient.put(`/api/me/favorites/${contentId}`);
  },
  removeFavorite(contentId) {
    return apiClient.delete(`/api/me/favorites/${contentId}`);
  },
  getWatchlist() {
    return apiClient.get("/api/me/watchlist");
  },
  addWatchlist(contentId) {
    return apiClient.put(`/api/me/watchlist/${contentId}`);
  },
  removeWatchlist(contentId) {
    return apiClient.delete(`/api/me/watchlist/${contentId}`);
  },
  getHistory() {
    return apiClient.get("/api/me/history");
  },
};
```

### Passo 5 - Adicionar botoes ao detalhe

`EDITAR frontend/src/pages/ContentDetailPage.jsx`

Adicionar handlers:

```jsx
import { libraryApi } from "../services/api/libraryApi.js";

async function addToFavorites() {
  await libraryApi.addFavorite(content.id);
}

async function addToWatchlist() {
  await libraryApi.addWatchlist(content.id);
}
```

Renderizar perto do botao `Reproduzir`:

```jsx
<button type="button" onClick={addToFavorites}>Favorito</button>
<button type="button" onClick={addToWatchlist}>Watchlist</button>
```

### Passo 6 - Criar pagina de biblioteca pessoal

`CRIAR frontend/src/pages/MyLibraryPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { libraryApi } from "../services/api/libraryApi.js";

export function MyLibraryPage() {
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      libraryApi.getFavorites(),
      libraryApi.getWatchlist(),
      libraryApi.getHistory(),
    ])
      .then(([favoritesResponse, watchlistResponse, historyResponse]) => {
        setFavorites(favoritesResponse.items);
        setWatchlist(watchlistResponse.items);
        setHistory(historyResponse.items);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  function renderItems(items) {
    return (
      <ul>
        {items.map((item) => (
          <li key={`${item.id}-${item.lastWatchedAt ?? "saved"}`}>
            <Link to={`/catalog/${item.slug || item.id}`}>{item.title}</Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="page-shell">
      <h1>A minha biblioteca</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <section><h2>Favoritos</h2>{renderItems(favorites)}</section>
      <section><h2>Watchlist</h2>{renderItems(watchlist)}</section>
      <section><h2>Historico</h2>{renderItems(history)}</section>
    </main>
  );
}
```

### Passo 7 - Validar fluxo

Executar com sessao autenticada:

```bash
curl -i -X PUT http://localhost:3000/api/me/favorites/CONTENT_ID
curl -i http://localhost:3000/api/me/favorites
curl -i -X PUT http://localhost:3000/api/me/watchlist/CONTENT_ID
curl -i http://localhost:3000/api/me/watchlist
curl -i http://localhost:3000/api/me/history
```

Depois abrir `/library` no frontend e confirmar as tres listas.

### Passo 8 - Validar negativos minimos

- Sem login, qualquer rota `/api/me/*` devolve `401`.
- Adicionar o mesmo favorito duas vezes mantem uma unica entrada.
- Remover item inexistente devolve sucesso sem duplicar erro operacional.
- Conteudo inexistente devolve `404`.
- Conteudo nao publicado devolve `404`.
- Historico de outro utilizador nao aparece.

## Snippet tecnico aplicavel

O ponto central e tornar favorito/watchlist idempotente:

```js
await db.collection("user_content_lists").updateOne(
  { userId, contentId, type },
  { $set: { updatedAt: now }, $setOnInsert: { userId, contentId, type, createdAt: now } },
  { upsert: true },
);
```

## Criterios de aceite (mensuraveis)

- Utilizador autenticado adiciona e remove favoritos.
- Utilizador autenticado adiciona e remove itens da watchlist.
- Duplicados nao sao criados.
- Historico lista conteudos vistos a partir de `playback_progress`.
- Listas respeitam ownership por utilizador.
- Pelo menos seis negativos ficam registados.

## Validacao final

- Confirmar que historico cresce apos usar o player.
- Confirmar que favoritos/watchlist nao aceitam conteudo nao publicado.
- Confirmar que dois utilizadores tem listas independentes.
- Confirmar que `BK-MF3-01` e `BK-MF3-05` podem reutilizar estes dados.

## Evidence para PR/defesa

- Log de adicionar favorito.
- Log de adicionar watchlist.
- Log de historico apos reproducao.
- Log de idempotencia.
- Captura da pagina da biblioteca.

## Handoff

Para `BK-MF2-08`, entregar:

- Fluxo completo autenticado ate player e biblioteca.
- Endpoints `/api/me/favorites`, `/api/me/watchlist`, `/api/me/history`.
- Dados pessoais isolados por utilizador.
- Historico baseado em progresso real.

## Proximo BK recomendado

`BK-MF2-08 - Teste E2E do fluxo principal`

## Changelog

- `2026-05-31`: Guia reescrito com listas pessoais, historico, ownership, UI, negativos e handoff para E2E.
