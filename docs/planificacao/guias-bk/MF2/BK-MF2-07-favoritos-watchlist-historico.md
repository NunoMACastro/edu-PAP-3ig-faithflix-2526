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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar favoritos (`RF16`), watchlist (`RF17`) e historico de visualizacao (`RF18`) por utilizador.

No fim, deves conseguir explicar a diferenca entre guardar um conteudo numa lista pessoal e obter historico a partir do progresso de playback.

#### Importância

Favoritos, watchlist e historico criam a biblioteca pessoal do utilizador. Estas funcionalidades tambem preparam ratings, recomendacoes e o teste E2E do fluxo principal.

#### Scope-in

- Criar colecao `user_content_lists`.
- Criar endpoints para favoritos e watchlist.
- Criar endpoint de historico baseado em `playback_progress`.
- Garantir ownership por `req.user.id`.
- Criar cliente frontend com `apiClient.del`.
- Adicionar botoes ao detalhe.
- Criar pagina `/biblioteca` com `data-testid="my-library"`.

#### Scope-out

- Partilha de listas.
- Listas customizadas com nome livre.
- Exportacao de historico.
- Recomendacoes automaticas.
- Ratings.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-05` concluido.
- Utilizador autenticado.
- Conteudos publicados existem.
- `playback_progress` guarda eventos de visualizacao.
- `apiClient` expoe `del`.

#### Glossário

- `Favorite`: marcador de preferencia afetiva.
- `Watchlist`: fila pessoal de conteudos para ver mais tarde.
- `History`: conteudos vistos, obtidos a partir de progresso.
- `Idempotencia`: repetir a mesma acao mantem o mesmo resultado.

#### Conceitos teóricos essenciais

- Favoritos e watchlist pertencem a um utilizador.
- A mesma entrada nao deve duplicar na mesma lista.
- Historico vem de `playback_progress`, que ja tem `lastWatchedAt`.
- O frontend usa `apiClient.del`, porque esse e o metodo criado na MF1.
- A rota da biblioteca pessoal e `/biblioteca`.
- As três leituras são paginadas, usam envelope `{ items, page, limit, total, totalPages }`, recusam coerções ambíguas e limitam `limit` a `50`.
- Favoritos/watchlist ordenam por `updatedAt DESC, _id ASC`; histórico por `lastWatchedAt DESC, _id ASC`.
- Leituras e mutações propagam `AbortSignal`; respostas de um conteúdo ou página anterior são ignoradas.
- Cada ação tem busy state imediato, impede duplo clique, atualiza otimisticamente e reverte se a API falhar.
- `/biblioteca` mantém três secções independentes com páginas de 12 itens, loading, erro, vazio e retry próprios.

### Tempo estimado

- Rever playback e progresso: 15 min.
- Backend de listas: 70 min.
- Backend de historico: 35 min.
- Frontend de acoes no detalhe: 50 min.
- Pagina de biblioteca: 45 min.
- Validacao e evidence: 35 min.

### Erros comuns

- Criar favoritos globais.
- Duplicar o mesmo conteudo na mesma lista.
- Criar historico separado do progresso.
- Permitir guardar conteudo inexistente ou nao publicado.
- Chamar `apiClient.delete` quando o cliente exposto se chama `apiClient.del`.
- Aceitar arrays, decimais ou strings não canónicas como paginação.

### Check de compreensao

- [ ] Sei explicar a diferenca entre favorito e watchlist.
- [ ] Sei porque historico usa `playback_progress`.
- [ ] Sei testar idempotencia.
- [ ] Sei porque `/biblioteca` precisa ficar ligada ao router.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Colecao | `user_content_lists` |
| Tipos de lista | `favorite`, `watchlist` |
| Chave unica | `userId + contentId + type` |
| Favoritos | `GET /api/me/favorites?page=1&limit=20`, `PUT/DELETE /api/me/favorites/:contentId` |
| Watchlist | `GET /api/me/watchlist?page=1&limit=20`, `PUT/DELETE /api/me/watchlist/:contentId` |
| Historico | `GET /api/me/history?page=1&limit=20` a partir de `playback_progress` |
| Envelope | `{ items, page, limit, total, totalPages }`, `limit <= 50` |
| Ordem | listas: `updatedAt DESC, _id ASC`; histórico: `lastWatchedAt DESC, _id ASC` |
| Frontend | `libraryApi`, `LibraryActions`, `MyLibraryPage` |
| Rota frontend | `/biblioteca` |

### Modelo `user_content_lists`

```js
// O índice composto torna cada associação de utilizador, conteúdo e tipo idempotente.
{
  _id,
  userId,
  contentId,
  type,
  createdAt,
  updatedAt
}
```

### Decisoes tecnicas

- `CANONICO`: ownership vem de `req.user.id`.
- `CANONICO`: historico reutiliza `playback_progress`.
- `DERIVADO`: adicionar e remover listas sao operacoes idempotentes.
- `DERIVADO`: paginação ocorre depois de ownership, join e visibilidade, para `total` representar apenas itens apresentáveis.
- `DERIVADO`: a UI pode ser otimista, mas tem de reverter em erro e bloquear repetições da mesma ação.
- `CANONICO`: toda leitura/mutação é cancelável e uma resposta stale não altera a rota atual.
- `DERIVADO`: a rota frontend usa portugues para alinhar com `/catalogo` e `/ver`.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/library/library.validation.js`
- CRIAR: `backend/src/modules/library/library.service.js`
- CRIAR: `backend/src/modules/library/library.controller.js`
- CRIAR: `backend/src/modules/library/library.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- CRIAR: `frontend/src/services/api/libraryApi.js`
- CRIAR: `frontend/src/components/library/LibraryActions.jsx`
- EDITAR: `frontend/src/pages/ContentDetailPage.jsx`
- CRIAR: `frontend/src/pages/MyLibraryPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`

#### Tutorial técnico linear

### Passo 1 - Criar validacao de library

1. Objetivo do passo.

Validar ids e tipos de lista de forma centralizada.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/library/library.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

// O enum fechado impede criar coleções pessoais arbitrárias através do parâmetro da rota.
export const LIST_TYPES = ["favorite", "watchlist"];

export function asObjectId(id, label) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} invalido.`);
  }

  return new ObjectId(id);
}

export function assertListType(type) {
  if (typeof type !== "string" || !LIST_TYPES.includes(type)) {
    throw new HttpError(400, "Tipo de lista invalido.");
  }

  return type;
}

// Paginação aceita apenas inteiros positivos em texto e nunca coerções como `1.5` ou arrays.
function positiveQueryInteger(value, fallback, label) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, `${label} invalido.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new HttpError(400, `${label} invalido.`);
  }
  return parsed;
}

export function parsePersonalListPagination(query = {}) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new HttpError(400, "Paginacao invalida.");
  }

  const page = positiveQueryInteger(query.page, 1, "Pagina");
  const limit = positiveQueryInteger(query.limit, 20, "Limite");
  if (limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
    throw new HttpError(400, "Paginacao invalida.");
  }

  return { page, limit };
}
```

5. Explicacao do codigo ou da decisao.

`favorite` e `watchlist` ficam como lista fechada. IDs têm de ser strings reais e a paginação só converte dígitos canónicos depois de validar a gramática HTTP; `01`, vazio, arrays, decimais e `limit > 50` são recusados.

6. Validacao do passo.

```bash
node -e "import('./src/modules/library/library.validation.js').then(({ assertListType }) => console.log(assertListType('favorite')))"
```

Resultado esperado: `favorite`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem validacao, a base de dados pode ficar com tipos como `favourite`, `favorites` e `fav`.

### Passo 2 - Criar servico de library

1. Objetivo do passo.

Gerir favoritos, watchlist e historico com ownership correto.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/library/library.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o servico abaixo.

4. Codigo completo.

```js
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
  asObjectId,
  assertListType,
  parsePersonalListPagination,
} from "./library.validation.js";

// Só conteúdos publicados podem entrar numa lista pessoal, mesmo quando o ID existe internamente.
async function assertPublishedContent(db, contentId) {
  const content = await db.collection("contents").findOne({
    _id: contentId,
    status: "published",
  });

  if (!content) {
    throw new HttpError(404, "Conteudo nao encontrado.");
  }

  return content;
}

function publicContent(content) {
  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    posterUrl: typeof content.assets?.posterUrl === "string"
      ? content.assets.posterUrl
      : "",
    type: content.type,
    durationSeconds: content.durationSeconds,
  };
}

// `$facet` calcula itens e total sobre o mesmo filtro para manter o envelope paginado coerente.
async function aggregatePersonalPage(collection, pipeline, sort, query) {
  const { page, limit } = parsePersonalListPagination(query);
  const [result = {}] = await collection.aggregate([
    ...pipeline,
    {
      $facet: {
        items: [
          { $sort: sort },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        metadata: [{ $count: "total" }],
      },
    },
  ]).toArray();
  const total = result.metadata?.[0]?.total ?? 0;

  return {
    rows: result.items ?? [],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function ensureLibraryIndexes() {
  const db = await getDb();
  await db.collection("user_content_lists").createIndex(
    { userId: 1, contentId: 1, type: 1 },
    { unique: true },
  );
}

export async function addToList(userId, contentId, type) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const listType = assertListType(type);
  const now = new Date();

  await assertPublishedContent(db, contentObjectId);

  await db.collection("user_content_lists").updateOne(
    { userId: userObjectId, contentId: contentObjectId, type: listType },
    {
      $set: { updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, type: listType, createdAt: now },
    },
    { upsert: true },
  );

  return { contentId, type: listType, saved: true };
}

export async function removeFromList(userId, contentId, type) {
  const listType = assertListType(type);
  const db = await getDb();

  await db.collection("user_content_lists").deleteOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: asObjectId(contentId, "Conteudo"),
    type: listType,
  });

  return { contentId, type: listType, saved: false };
}

export async function listSavedContent(userId, type, query = {}) {
  const db = await getDb();
  const result = await aggregatePersonalPage(
    db.collection("user_content_lists"),
    [
      { $match: { userId: asObjectId(userId, "Utilizador"), type: assertListType(type) } },
      { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
      { $unwind: "$content" },
      { $match: { "content.status": "published" } },
    ],
    { updatedAt: -1, _id: 1 },
    query,
  );

  return {
    items: result.rows.map((row) => publicContent(row.content)),
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
}

export async function listHistory(userId, query = {}) {
  const db = await getDb();
  const result = await aggregatePersonalPage(
    db.collection("playback_progress"),
    [
      { $match: { userId: asObjectId(userId, "Utilizador") } },
      { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
      { $unwind: "$content" },
      { $match: { "content.status": "published" } },
    ],
    { lastWatchedAt: -1, _id: 1 },
    query,
  );

  return {
    items: result.rows.map((row) => ({
      ...publicContent(row.content),
      currentTimeSeconds: row.currentTimeSeconds,
      durationSeconds: row.durationSeconds,
      completed: row.completed,
      lastWatchedAt: row.lastWatchedAt,
    })),
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
}
```

5. Explicacao do codigo ou da decisao.

O serviço valida conteúdo publicado antes de guardar listas. As três leituras filtram ownership/join/visibilidade antes do `$facet`, ordenam com desempate `_id` e só depois calculam `total` e página. O histórico não cria outra coleção: lê `playback_progress`.

6. Validacao do passo.

```bash
node -e "import('./src/modules/library/library.service.js').then((m) => console.log(typeof m.addToList, typeof m.listHistory))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice unico, clicar duas vezes em favorito pode criar entradas duplicadas.

### Passo 3 - Criar controller e rotas

1. Objetivo do passo.

Expor endpoints de biblioteca pessoal protegidos por login.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/library/library.controller.js`
    - CRIAR: `backend/src/modules/library/library.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e router. O router sera montado em `/api/me`.

4. Codigo completo.

`backend/src/modules/library/library.controller.js`

```js
import { addToList, listHistory, listSavedContent, removeFromList } from "./library.service.js";

// O utilizador vem exclusivamente da sessão; nenhum endpoint aceita `userId` fornecido pelo cliente.
export async function getFavorites(req, res) {
  res.status(200).json(await listSavedContent(req.user.id, "favorite", req.query));
}

export async function putFavorite(req, res) {
  res.status(200).json(await addToList(req.user.id, req.params.contentId, "favorite"));
}

export async function deleteFavorite(req, res) {
  res.status(200).json(await removeFromList(req.user.id, req.params.contentId, "favorite"));
}

export async function getWatchlist(req, res) {
  res.status(200).json(await listSavedContent(req.user.id, "watchlist", req.query));
}

export async function putWatchlist(req, res) {
  res.status(200).json(await addToList(req.user.id, req.params.contentId, "watchlist"));
}

export async function deleteWatchlist(req, res) {
  res.status(200).json(await removeFromList(req.user.id, req.params.contentId, "watchlist"));
}

// O histórico reutiliza o envelope paginado completo em vez de devolver um array sem total.
export async function getHistory(req, res) {
  res.status(200).json(await listHistory(req.user.id, req.query));
}
```

`backend/src/modules/library/library.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
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

// A autenticação cobre toda a subárvore, incluindo leituras e remoções de dados pessoais.
libraryRouter.use(requireAuth);
// Rotas fixas antecedem os segmentos `:contentId` para evitar colisões de resolução.
libraryRouter.get("/favorites", asyncHandler(getFavorites));
libraryRouter.put("/favorites/:contentId", asyncHandler(putFavorite));
libraryRouter.delete("/favorites/:contentId", asyncHandler(deleteFavorite));
libraryRouter.get("/watchlist", asyncHandler(getWatchlist));
libraryRouter.put("/watchlist/:contentId", asyncHandler(putWatchlist));
libraryRouter.delete("/watchlist/:contentId", asyncHandler(deleteWatchlist));
libraryRouter.get("/history", asyncHandler(getHistory));
```

5. Explicacao do codigo ou da decisao.

Todas as rotas usam `req.user.id`. O frontend nunca escolhe o dono da lista e a query é validada no serviço antes de chegar ao pipeline.

6. Validacao do passo.

Sem cookie:

```bash
curl -i http://localhost:3000/api/me/favorites
```

Resultado esperado: `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a API aceitar `userId` no corpo, um utilizador pode escrever nas listas de outro.

### Passo 4 - Montar router e indices

1. Objetivo do passo.

Ligar `/api/me/*` ao backend e criar a chave unica.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: trechos de integracao

3. Instrucoes concretas.

Monta `libraryRouter` depois de `attachSession` e chama `ensureLibraryIndexes`.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { libraryRouter } from "./modules/library/library.routes.js";

app.use(attachSession);
app.use("/api/me", libraryRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureLibraryIndexes } from "./modules/library/library.service.js";

await ensureLibraryIndexes();
```

5. Explicacao do codigo ou da decisao.

`/api/me` deixa claro que os dados pertencem ao utilizador autenticado.

6. Validacao do passo.

```bash
npm --prefix backend run dev
```

Resultado esperado: servidor online sem erro de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o router for montado antes da sessao, todos os endpoints devolvem `401`.

### Passo 5 - Criar cliente frontend de biblioteca

1. Objetivo do passo.

Expor chamadas para favoritos, watchlist e historico usando o cliente API canonico.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/libraryApi.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Usa `apiClient.del` para pedidos `DELETE`.

4. Codigo completo.

```js
import { apiClient } from "./apiClient.js";

// A codificação confina o identificador a um único segmento de rota.
function encodedContentId(contentId) {
  if (typeof contentId !== "string" || contentId.length === 0) {
    throw new TypeError("Conteudo invalido.");
  }
  return encodeURIComponent(contentId);
}

// O cliente replica `limit <= 50`, falhando cedo antes de criar pedidos inválidos.
function paginationQuery(pagination = {}) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw new TypeError("Paginacao invalida.");
  }
  return new URLSearchParams({ page: `${page}`, limit: `${limit}` }).toString();
}

export const libraryApi = {
  listFavorites(pagination = {}, options = {}) {
    return apiClient.get(
      `/api/me/favorites?${paginationQuery(pagination)}`,
      options,
    );
  },
  addFavorite(contentId, options = {}) {
    return apiClient.put(
      `/api/me/favorites/${encodedContentId(contentId)}`,
      undefined,
      options,
    );
  },
  removeFavorite(contentId, options = {}) {
    return apiClient.del(
      `/api/me/favorites/${encodedContentId(contentId)}`,
      options,
    );
  },
  listWatchlist(pagination = {}, options = {}) {
    return apiClient.get(
      `/api/me/watchlist?${paginationQuery(pagination)}`,
      options,
    );
  },
  addWatchlist(contentId, options = {}) {
    return apiClient.put(
      `/api/me/watchlist/${encodedContentId(contentId)}`,
      undefined,
      options,
    );
  },
  removeWatchlist(contentId, options = {}) {
    return apiClient.del(
      `/api/me/watchlist/${encodedContentId(contentId)}`,
      options,
    );
  },
  listHistory(pagination = {}, options = {}) {
    return apiClient.get(
      `/api/me/history?${paginationQuery(pagination)}`,
      options,
    );
  },
};
```

5. Explicacao do codigo ou da decisao.

O método de remoção chama `apiClient.del`. Todas as leituras usam paginação explícita e todas as operações propagam `options.signal`; ids e números inválidos são recusados antes do pedido.

6. Validacao do passo.

```bash
node -e "import('./src/services/api/libraryApi.js').then(({ libraryApi }) => console.log(typeof libraryApi.removeFavorite))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

`apiClient.delete` nao existe no contrato da MF1 e causaria erro em runtime.

### Passo 6 - Adicionar acoes ao detalhe

1. Objetivo do passo.

Permitir guardar e remover o conteudo atual em favoritos e watchlist.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/components/library/LibraryActions.jsx`
    - EDITAR: `frontend/src/pages/ContentDetailPage.jsx`
    - LOCALIZACAO: ficheiro completo para componente; trecho de integracao

3. Instrucoes concretas.

Cria o componente e inclui-o dentro de `ContentDetailPage`, depois do link de reproducao.

4. Codigo completo.

`frontend/src/components/library/LibraryActions.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { libraryApi } from "../../services/api/libraryApi.js";
import { buildLoginRedirectPath } from "../../utils/authRedirect.js";

async function listContainsContent(listPage, contentId, signal) {
  // Percorrer todas as páginas evita apresentar um falso “não guardado” quando o item não está na primeira.
  let page = 1;
  let totalPages = 1;

  do {
    const response = await listPage({ page, limit: 50 }, { signal });
    const items = Array.isArray(response.items) ? response.items : [];
    if (items.some((item) => item?.id === contentId)) return true;
    totalPages = Number.isSafeInteger(response.totalPages)
      ? Math.max(response.totalPages, 1)
      : 1;
    page += 1;
  } while (page <= totalPages);

  return false;
}

export function LibraryActions({ contentId }) {
  const { status: sessionStatus, refreshSession } = useSession();
  const location = useLocation();
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [watchlistSaved, setWatchlistSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busyActions, setBusyActions] = useState(() => new Set());
  const busyRef = useRef(new Set());
  const controllersRef = useRef(new Set());
  const generationRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      for (const controller of controllersRef.current) controller.abort();
      controllersRef.current.clear();
      busyRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    const controller = new AbortController();
    controllersRef.current.add(controller);
    let active = true;

    setFavoriteSaved(false);
    setWatchlistSaved(false);
    setStatus("");
    setError("");
    busyRef.current.clear();
    setBusyActions(new Set());

    if (sessionStatus === "authenticated") {
      Promise.all([
        listContainsContent(libraryApi.listFavorites, contentId, controller.signal),
        listContainsContent(libraryApi.listWatchlist, contentId, controller.signal),
      ])
        .then(([favorite, watchlist]) => {
          if (active && generationRef.current === generation) {
            setFavoriteSaved(favorite);
            setWatchlistSaved(watchlist);
          }
        })
        .catch((requestError) => {
          if (
            active &&
            generationRef.current === generation &&
            requestError?.code !== "REQUEST_ABORTED"
          ) {
            setError(toUserMessage(requestError));
          }
        })
        .finally(() => controllersRef.current.delete(controller));
    } else {
      controllersRef.current.delete(controller);
    }

    return () => {
      active = false;
      for (const pendingController of controllersRef.current) {
        pendingController.abort();
      }
      controllersRef.current.clear();
    };
  }, [contentId, sessionStatus]);

  async function toggle(action) {
    // A UI otimista conserva o valor anterior para o repor se a mutação remota falhar.
    if (sessionStatus !== "authenticated" || busyRef.current.has(action)) return;

    const generation = generationRef.current;
    const previous = action === "favorite" ? favoriteSaved : watchlistSaved;
    const next = !previous;
    const setSaved = action === "favorite" ? setFavoriteSaved : setWatchlistSaved;
    const request = action === "favorite"
      ? (previous ? libraryApi.removeFavorite : libraryApi.addFavorite)
      : (previous ? libraryApi.removeWatchlist : libraryApi.addWatchlist);
    const controller = new AbortController();
    controllersRef.current.add(controller);
    busyRef.current.add(action);
    setBusyActions(new Set(busyRef.current));
    setSaved(next);
    setError("");
    setStatus("");

    try {
      const response = await request(contentId, { signal: controller.signal });
      if (mountedRef.current && generationRef.current === generation) {
        const confirmed = typeof response.saved === "boolean" ? response.saved : next;
        setSaved(confirmed);
        setStatus(confirmed ? "Conteudo guardado." : "Conteudo removido.");
      }
    } catch (requestError) {
      if (
        mountedRef.current &&
        generationRef.current === generation &&
        requestError?.code !== "REQUEST_ABORTED"
      ) {
        setSaved(previous);
        setError(toUserMessage(requestError));
      }
    } finally {
      controllersRef.current.delete(controller);
      busyRef.current.delete(action);
      if (mountedRef.current && generationRef.current === generation) {
        setBusyActions(new Set(busyRef.current));
      }
    }
  }

  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (sessionStatus === "loading") {
    return <section aria-label="Biblioteca pessoal"><p role="status">A confirmar sessao...</p></section>;
  }

  if (sessionStatus === "unavailable") {
    return (
      <section aria-label="Biblioteca pessoal">
        <p role="alert">Sessao temporariamente indisponivel.</p>
        <button type="button" onClick={() => refreshSession().catch(() => {})}>
          Tentar confirmar sessao
        </button>
      </section>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <section aria-label="Biblioteca pessoal">
        <Link to={buildLoginRedirectPath(returnTo)}>Entrar para guardar</Link>
      </section>
    );
  }

  return (
    <section aria-label="Biblioteca pessoal">
      {error ? <p role="alert">{error}</p> : null}
      {status ? <p role="status">{status}</p> : null}
      <button
        type="button"
        disabled={busyActions.has("favorite")}
        onClick={() => void toggle("favorite")}
      >
        {busyActions.has("favorite")
          ? "A guardar favorito..."
          : favoriteSaved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </button>
      <button
        type="button"
        disabled={busyActions.has("watchlist")}
        onClick={() => void toggle("watchlist")}
      >
        {busyActions.has("watchlist")
          ? "A guardar lista..."
          : watchlistSaved ? "Remover da lista" : "Adicionar a lista"}
      </button>
    </section>
  );
}
```

Trecho esperado em `frontend/src/pages/ContentDetailPage.jsx`:

```jsx
import { LibraryActions } from "../components/library/LibraryActions.jsx";

<>
  <Link to={`/ver/${encodeURIComponent(content.id)}`}>Reproduzir</Link>
  <LibraryActions contentId={content.id} />
</>
```

5. Explicacao do codigo ou da decisao.

O componente percorre apenas as páginas declaradas pelo backend e cancela tudo quando muda o conteúdo ou a sessão. Cada tipo de ação fica serializado por uma reserva em `ref`, aplica o estado otimista, usa a resposta como estado confirmado e reverte em erro. Uma resposta de uma geração anterior nunca altera o conteúdo atual.

6. Validacao do passo.

Abre o detalhe, adiciona aos favoritos, remove e volta a adicionar. A UI deve atualizar o texto do botao.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estado de remocao, a UI permite adicionar mas nao corrigir uma escolha.

### Passo 7 - Criar pagina de biblioteca

1. Objetivo do passo.

Mostrar favoritos, watchlist e historico num unico espaco pessoal.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/pages/MyLibraryPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiro completo para pagina; trecho de rotas

3. Instrucoes concretas.

Cria a pagina abaixo e liga `/biblioteca`.

4. Codigo completo.

`frontend/src/pages/MyLibraryPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toUserMessage } from "../services/api/apiErrors.js";
import { libraryApi } from "../services/api/libraryApi.js";

const PAGE_LIMIT = 12;

function PaginatedLibrarySection({ id, title, loadItems }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // Cada página/retry cancela a leitura anterior para impedir respostas fora de ordem.
    setLoading(true);
    setItems([]);
    setError("");

    loadItems({ page, limit: PAGE_LIMIT }, { signal: controller.signal })
      .then((response) => {
        if (!active) return;
        const nextItems = Array.isArray(response.items) ? response.items : [];
        const totalPages = Number.isSafeInteger(response.totalPages)
          ? response.totalPages
          : 0;
        setItems(nextItems);
        setPagination({
          page: Number.isSafeInteger(response.page) ? response.page : page,
          total: Number.isSafeInteger(response.total) ? response.total : 0,
          totalPages,
        });
      })
      .catch((requestError) => {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setError(toUserMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadItems, page, reloadVersion]);

  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {loading ? <p role="status">A carregar {title.toLowerCase()}...</p> : null}
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : null}
      {!loading && !error && items.length === 0 ? <p>Sem itens.</p> : null}
      {!loading && !error && items.length > 0 ? (
        <div className="content-row">
          {items.map((item) => (
            <article key={`${id}-${item.id}`}>
              {item.posterUrl ? (
                <img src={item.posterUrl} alt={`Cartaz de ${item.title}`} loading="lazy" />
              ) : null}
              <h3>{item.title}</h3>
              {/* O slug é codificado para ocupar um único segmento do link de detalhe. */}
              <Link to={`/catalogo/${encodeURIComponent(item.slug || item.id)}`}>
                Ver detalhe
              </Link>
            </article>
          ))}
        </div>
      ) : null}
      {!loading && !error && pagination.totalPages > 1 ? (
        <nav aria-label={`Paginacao de ${title}`}>
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </button>
          <span>Pagina {pagination.page} de {pagination.totalPages} ({pagination.total})</span>
          <button
            type="button"
            disabled={loading || page >= pagination.totalPages}
            onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </section>
  );
}

export function MyLibraryPage() {
  return (
    <main className="page-shell" data-testid="my-library">
      <h1>Biblioteca</h1>
      <PaginatedLibrarySection
        id="favorites"
        title="Favoritos"
        loadItems={libraryApi.listFavorites}
      />
      <PaginatedLibrarySection
        id="watchlist"
        title="Para ver mais tarde"
        loadItems={libraryApi.listWatchlist}
      />
      <PaginatedLibrarySection
        id="history"
        title="Historico"
        loadItems={libraryApi.listHistory}
      />
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const MyLibraryPage = lazyNamedPage(() => import("../pages/MyLibraryPage.jsx"), "MyLibraryPage");

<Route path="/biblioteca" element={<MyLibraryPage />} />
```

5. Explicacao do codigo ou da decisao.

Cada secção controla página, cancelamento, flag anti-stale, loading, erro, vazio e retry sem bloquear as restantes. O `data-testid` identifica a página sem depender do texto visual. A declaração lazy reutiliza o helper da fundação e mantém a biblioteca fora do chunk inicial.

6. Validacao do passo.

Abre `/biblioteca` depois de adicionar favorito e watchlist. Os itens devem aparecer nas seccoes corretas.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a rota nao for montada, o E2E falha ao tentar validar a biblioteca pessoal.

### Passo 8 - Validar idempotencia e ownership

1. Objetivo do passo.

Confirmar que listas nao duplicam e que cada utilizador ve apenas os seus dados.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API, UI e MongoDB

3. Instrucoes concretas.

Usa dois cookies diferentes, obtém o token CSRF da sessão A sem o imprimir e repete a mesma ação.

4. Codigo completo.

```bash
curl -sS -b /tmp/user-a.cookies -c /tmp/user-a.cookies \
  -o /tmp/user-a-csrf.json \
  http://localhost:3000/api/session/csrf-token

CSRF_TOKEN="$(node -p "JSON.parse(require('fs').readFileSync('/tmp/user-a-csrf.json','utf8')).csrfToken")"

curl -i -b /tmp/user-a.cookies \
  -X PUT \
  -H "Origin: http://localhost:5173" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  http://localhost:3000/api/me/favorites/CONTENT_ID

curl -i -b /tmp/user-a.cookies \
  -X PUT \
  -H "Origin: http://localhost:5173" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  http://localhost:3000/api/me/favorites/CONTENT_ID

curl -i -b /tmp/user-a.cookies \
  'http://localhost:3000/api/me/favorites?page=1&limit=20'

curl -i -b /tmp/user-b.cookies \
  'http://localhost:3000/api/me/favorites?page=1&limit=20'

curl -i -b /tmp/user-a.cookies \
  'http://localhost:3000/api/me/favorites?page=1&limit=51'

unset CSRF_TOKEN
```

5. Explicacao do codigo ou da decisao.

Repetir `PUT` deve manter uma unica entrada. User B nao deve ver favoritos de User A.

6. Validacao do passo.

Resultados esperados:

- Dois `PUT` seguidos devolvem sucesso.
- A lista de User A contem uma entrada para esse conteudo.
- A lista de User B nao contem esse conteudo.
- `/api/me/history` mostra conteudos vistos por User A a partir de `playback_progress`.
- `limit=51` devolve `400`; a página válida inclui `page`, `limit`, `total` e `totalPages`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se User B ve dados de User A, existe falha de ownership.

## Snippet tecnico aplicavel

```js
// A remoção propaga as opções do `apiClient`, incluindo CSRF e AbortSignal.
const libraryClientExcerpt = {
  removeFavorite(contentId, options = {}) {
    return apiClient.del(
      `/api/me/favorites/${encodeURIComponent(contentId)}`,
      options,
    );
  },
};
```

#### Critérios de aceite

- [ ] `GET /api/me/favorites` exige login.
- [ ] `PUT/DELETE /api/me/favorites/:contentId` sao idempotentes.
- [ ] `GET /api/me/watchlist` exige login.
- [ ] `PUT/DELETE /api/me/watchlist/:contentId` sao idempotentes.
- [ ] `GET /api/me/history` le `playback_progress`.
- [ ] As três leituras devolvem `{ items, page, limit, total, totalPages }`, recusam `limit=51` e têm desempate por `_id`.
- [ ] `libraryApi` usa `apiClient.del`.
- [ ] Leituras/mutações propagam `AbortSignal`; respostas de um conteúdo anterior não alteram o atual.
- [ ] Ações otimistas revertem em falha e o busy state impede duplo clique.
- [ ] `/biblioteca` esta ligada e tem `data-testid="my-library"`.
- [ ] Favoritos, para ver mais tarde e histórico paginam e fazem retry independentemente.
- [ ] O detalhe permite adicionar e remover favoritos/watchlist.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas `curl`, screenshot do detalhe com acoes e screenshot de `/biblioteca`.

#### Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Respostas `curl` de `PUT` repetido em favoritos a provar idempotencia.
- Resposta `curl` de User A e User B a provar ownership.
- Resposta `curl` de `GET /api/me/history` baseada em `playback_progress`.
- Respostas das páginas 1 e 2 das três listas, com metadata, ordem determinística e `400` para `limit=51`.
- Testes comportamentais de abort/anti-stale, duplo clique, rollback de mutação falhada e retry independente.
- Screenshot do detalhe com acoes de favoritos e watchlist.
- Screenshot de `/biblioteca` com `data-testid="my-library"`.

#### Handoff

O `BK-MF2-08` pode validar login, detalhe, favoritos, watchlist, player, progresso e biblioteca usando as rotas `/login`, `/catalogo/:idOrSlug`, `/ver/:contentId` e `/biblioteca`.

## Proximo BK recomendado

`BK-MF2-08` - Teste E2E do fluxo principal.

#### Changelog

- 2026-07-10: Tutorial canónico consolidado com envelopes paginados, ordem estável, tipos estritos, cancelamento/anti-stale, busy state imediato, resposta autoritativa e rollback.
- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
