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

Neste BK vais implementar favoritos (`RF16`), watchlist (`RF17`) e historico de visualizacao (`RF18`) por utilizador.

No fim, deves conseguir explicar a diferenca entre guardar um conteudo numa lista pessoal e obter historico a partir do progresso de playback.

### Importancia funcional

Favoritos, watchlist e historico criam a biblioteca pessoal do utilizador. Estas funcionalidades tambem preparam ratings, recomendacoes e o teste E2E do fluxo principal.

### Scope-in

- Criar colecao `user_content_lists`.
- Criar endpoints para favoritos e watchlist.
- Criar endpoint de historico baseado em `playback_progress`.
- Garantir ownership por `req.user.id`.
- Criar cliente frontend com `apiClient.del`.
- Adicionar botoes ao detalhe.
- Criar pagina `/biblioteca` com `data-testid="my-library"`.

### Scope-out

- Partilha de listas.
- Listas customizadas com nome livre.
- Exportacao de historico.
- Recomendacoes automaticas.
- Ratings.

### Glossario rapido

- `Favorite`: marcador de preferencia afetiva.
- `Watchlist`: fila pessoal de conteudos para ver mais tarde.
- `History`: conteudos vistos, obtidos a partir de progresso.
- `Idempotencia`: repetir a mesma acao mantem o mesmo resultado.

### Conceitos essenciais

- Favoritos e watchlist pertencem a um utilizador.
- A mesma entrada nao deve duplicar na mesma lista.
- Historico vem de `playback_progress`, que ja tem `lastWatchedAt`.
- O frontend usa `apiClient.del`, porque esse e o metodo criado na MF1.
- A rota da biblioteca pessoal e `/biblioteca`.

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

### Check de compreensao

- [ ] Sei explicar a diferenca entre favorito e watchlist.
- [ ] Sei porque historico usa `playback_progress`.
- [ ] Sei testar idempotencia.
- [ ] Sei porque `/biblioteca` precisa ficar ligada ao router.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-05` concluido.
- Utilizador autenticado.
- Conteudos publicados existem.
- `playback_progress` guarda eventos de visualizacao.
- `apiClient` expoe `del`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecao | `user_content_lists` |
| Tipos de lista | `favorite`, `watchlist` |
| Chave unica | `userId + contentId + type` |
| Favoritos | `GET /api/me/favorites`, `PUT /api/me/favorites/:contentId`, `DELETE /api/me/favorites/:contentId` |
| Watchlist | `GET /api/me/watchlist`, `PUT /api/me/watchlist/:contentId`, `DELETE /api/me/watchlist/:contentId` |
| Historico | `GET /api/me/history` a partir de `playback_progress` |
| Frontend | `libraryApi`, `LibraryActions`, `MyLibraryPage` |
| Rota frontend | `/biblioteca` |

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

### Decisoes tecnicas

- `CANONICO`: ownership vem de `req.user.id`.
- `CANONICO`: historico reutiliza `playback_progress`.
- `DERIVADO`: adicionar e remover listas sao operacoes idempotentes.
- `DERIVADO`: a rota frontend usa portugues para alinhar com `/catalogo` e `/ver`.

### Guia de execucao (passo-a-passo)

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

5. Explicacao do codigo ou da decisao.

`favorite` e `watchlist` ficam como lista fechada para evitar valores divergentes na colecao.

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

5. Explicacao do codigo ou da decisao.

O servico valida conteudo publicado antes de guardar listas. O historico nao cria nova colecao: ele le `playback_progress`.

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

`backend/src/modules/library/library.routes.js`

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

5. Explicacao do codigo ou da decisao.

Todas as rotas usam `req.user.id`. O frontend nunca escolhe o dono da lista.

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

export const libraryApi = {
  listFavorites() {
    return apiClient.get("/api/me/favorites");
  },
  addFavorite(contentId) {
    return apiClient.put(`/api/me/favorites/${encodeURIComponent(contentId)}`);
  },
  removeFavorite(contentId) {
    return apiClient.del(`/api/me/favorites/${encodeURIComponent(contentId)}`);
  },
  listWatchlist() {
    return apiClient.get("/api/me/watchlist");
  },
  addWatchlist(contentId) {
    return apiClient.put(`/api/me/watchlist/${encodeURIComponent(contentId)}`);
  },
  removeWatchlist(contentId) {
    return apiClient.del(`/api/me/watchlist/${encodeURIComponent(contentId)}`);
  },
  listHistory() {
    return apiClient.get("/api/me/history");
  },
};
```

5. Explicacao do codigo ou da decisao.

O metodo de remocao chama `apiClient.del`, alinhado com o cliente criado na MF1.

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
import { useState } from "react";
import { libraryApi } from "../../services/api/libraryApi.js";

export function LibraryActions({ contentId }) {
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [watchlistSaved, setWatchlistSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function toggleFavorite() {
    setError("");
    try {
      if (favoriteSaved) {
        await libraryApi.removeFavorite(contentId);
        setFavoriteSaved(false);
        setStatus("Removido dos favoritos.");
      } else {
        await libraryApi.addFavorite(contentId);
        setFavoriteSaved(true);
        setStatus("Adicionado aos favoritos.");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function toggleWatchlist() {
    setError("");
    try {
      if (watchlistSaved) {
        await libraryApi.removeWatchlist(contentId);
        setWatchlistSaved(false);
        setStatus("Removido da watchlist.");
      } else {
        await libraryApi.addWatchlist(contentId);
        setWatchlistSaved(true);
        setStatus("Adicionado a watchlist.");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section aria-label="Biblioteca pessoal">
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <button type="button" onClick={toggleFavorite}>
        {favoriteSaved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </button>
      <button type="button" onClick={toggleWatchlist}>
        {watchlistSaved ? "Remover da watchlist" : "Adicionar a watchlist"}
      </button>
    </section>
  );
}
```

Trecho esperado em `frontend/src/pages/ContentDetailPage.jsx`:

```jsx
import { LibraryActions } from "../components/library/LibraryActions.jsx";

<Link to={`/ver/${content.id}`}>Reproduzir</Link>
<LibraryActions contentId={content.id} />
```

5. Explicacao do codigo ou da decisao.

O componente tem estados de sucesso e erro, e permite desfazer a acao.

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
import { libraryApi } from "../services/api/libraryApi.js";

function ContentList({ title, items }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>Sem itens.</p>
      ) : (
        <div className="content-row">
          {items.map((item) => (
            <article key={`${title}-${item.id}`}>
              <img src={item.posterUrl} alt="" />
              <h3>{item.title}</h3>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function MyLibraryPage() {
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      libraryApi.listFavorites(),
      libraryApi.listWatchlist(),
      libraryApi.listHistory(),
    ])
      .then(([favoriteResponse, watchlistResponse, historyResponse]) => {
        setFavorites(favoriteResponse.items);
        setWatchlist(watchlistResponse.items);
        setHistory(historyResponse.items);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <main className="page-shell" data-testid="my-library">
      <h1>Biblioteca</h1>
      {error && <p role="alert">{error}</p>}
      <ContentList title="Favoritos" items={favorites} />
      <ContentList title="Watchlist" items={watchlist} />
      <ContentList title="Historico" items={history} />
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { MyLibraryPage } from "../pages/MyLibraryPage.jsx";

<Route path="/biblioteca" element={<MyLibraryPage />} />
```

5. Explicacao do codigo ou da decisao.

O `data-testid` da pagina sera usado no E2E. A pagina usa tres endpoints e mostra listas vazias sem quebrar.

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

Usa dois cookies diferentes e repete a mesma acao.

4. Codigo completo.

```bash
curl -i -b /tmp/user-a.cookies \
  -X PUT \
  http://localhost:3000/api/me/favorites/CONTENT_ID

curl -i -b /tmp/user-a.cookies \
  -X PUT \
  http://localhost:3000/api/me/favorites/CONTENT_ID

curl -i -b /tmp/user-a.cookies http://localhost:3000/api/me/favorites

curl -i -b /tmp/user-b.cookies http://localhost:3000/api/me/favorites
```

5. Explicacao do codigo ou da decisao.

Repetir `PUT` deve manter uma unica entrada. User B nao deve ver favoritos de User A.

6. Validacao do passo.

Resultados esperados:

- Dois `PUT` seguidos devolvem sucesso.
- A lista de User A contem uma entrada para esse conteudo.
- A lista de User B nao contem esse conteudo.
- `/api/me/history` mostra conteudos vistos por User A a partir de `playback_progress`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se User B ve dados de User A, existe falha de ownership.

## Snippet tecnico aplicavel

```js
removeFavorite(contentId) {
  return apiClient.del(`/api/me/favorites/${encodeURIComponent(contentId)}`);
}
```

## Criterios de aceite (mensuraveis)

- [ ] `GET /api/me/favorites` exige login.
- [ ] `PUT/DELETE /api/me/favorites/:contentId` sao idempotentes.
- [ ] `GET /api/me/watchlist` exige login.
- [ ] `PUT/DELETE /api/me/watchlist/:contentId` sao idempotentes.
- [ ] `GET /api/me/history` le `playback_progress`.
- [ ] `libraryApi` usa `apiClient.del`.
- [ ] `/biblioteca` esta ligada e tem `data-testid="my-library"`.
- [ ] O detalhe permite adicionar e remover favoritos/watchlist.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas `curl`, screenshot do detalhe com acoes e screenshot de `/biblioteca`.

## Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Respostas `curl` de `PUT` repetido em favoritos a provar idempotencia.
- Resposta `curl` de User A e User B a provar ownership.
- Resposta `curl` de `GET /api/me/history` baseada em `playback_progress`.
- Screenshot do detalhe com acoes de favoritos e watchlist.
- Screenshot de `/biblioteca` com `data-testid="my-library"`.

## Handoff

O `BK-MF2-08` pode validar login, detalhe, favoritos, watchlist, player, progresso e biblioteca usando as rotas `/login`, `/catalogo/:idOrSlug`, `/ver/:contentId` e `/biblioteca`.

## Proximo BK recomendado

`BK-MF2-08` - Teste E2E do fluxo principal.

## Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
