# BK-MF2-05 - Reproducao e continuar a ver

## Header

- `doc_id`: `GUIA-BK-MF2-05`
- `bk_id`: `BK-MF2-05`
- `macro`: `MF2`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF2-04`
- `rf_rnf`: `RF11, RF12`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-06`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais implementar reproducao no MVP (`RF11`) e a funcionalidade "continuar a ver" (`RF12`).

No fim, deves conseguir explicar como o player carrega um conteudo publicado, como o backend guarda progresso por utilizador e como a UI mostra os conteudos iniciados mais recentemente.

### Importancia funcional

Streaming sem progresso perde continuidade. Este BK transforma o catalogo num fluxo de consumo real: o utilizador entra no detalhe, reproduz, a aplicacao guarda o ponto de visualizacao e depois apresenta esse conteudo para continuar.

### Scope-in

- Criar colecao `playback_progress`.
- Criar endpoints de leitura de playback, escrita de progresso e lista "continuar a ver".
- Garantir ownership por `userId + contentId`.
- Criar `PlaybackPage` com `<video>`.
- Criar `ContinueWatchingStrip`.
- Ligar rota frontend `/ver/:contentId`.
- Adicionar `data-testid="faithflix-player"` para E2E.

### Scope-out

- DRM.
- CDN.
- Transcodificacao.
- Modo offline.
- Perfis familiares avancados.
- Analytics completos.

### Glossario rapido

- `Playback`: dados necessarios para reproduzir um conteudo.
- `Progress`: ponto guardado de visualizacao.
- `completed`: marca de conteudo praticamente terminado.
- `ContinueWatching`: lista dos conteudos com progresso recente.

### Conceitos essenciais

- O player so reproduz conteudo `published`.
- O progresso pertence ao par `userId + contentId`.
- O frontend nunca envia `userId`; o backend usa `req.user.id`.
- `currentTimeSeconds` nao pode ser negativo nem ultrapassar a duracao.
- A lista "continuar a ver" vem de `playback_progress`, nao de dados locais do browser.

### Tempo estimado

- Rever detalhe e media do catalogo: 15 min.
- Backend de playback e progresso: 80 min.
- Endpoint de continuar a ver: 40 min.
- Player React e rota: 70 min.
- Componente de lista: 35 min.
- Validacao e evidence: 40 min.

### Erros comuns

- Guardar progresso apenas em `localStorage`.
- Permitir atualizar progresso de outro utilizador.
- Aceitar tempos negativos.
- Reproduzir conteudo `draft`.
- Enviar progresso ao backend a cada segundo.
- Montar `/api/playback/:contentId` antes de `/api/playback/me/continue-watching`.

### Check de compreensao

- [ ] Sei explicar a chave `userId + contentId`.
- [ ] Sei porque o progresso fica no servidor.
- [ ] Sei porque `continue-watching` precisa de rota fixa antes da dinamica.
- [ ] Sei onde `BK-MF2-07` vai buscar historico.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-04` concluido.
- Existe pelo menos um conteudo `published` com `media.playbackUrl`.
- `requireAuth` esta disponivel.
- Frontend tem React Router.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecao | `playback_progress` |
| Chave unica | `userId + contentId` |
| Leitura playback | `GET /api/playback/:contentId` |
| Escrita progresso | `PUT /api/playback/:contentId/progress` |
| Continuar a ver | `GET /api/playback/me/continue-watching` |
| Frontend | `PlaybackPage`, `ContinueWatchingStrip` |
| Rota frontend | `/ver/:contentId` |
| Progresso concluido | `completed: true` quando falta menos de 60s ou passou 95% |

### Modelo `PlaybackProgress`

```js
{
  _id,
  userId,
  contentId,
  currentTimeSeconds,
  durationSeconds,
  completed,
  lastWatchedAt,
  createdAt,
  updatedAt
}
```

### Decisoes tecnicas

- `CANONICO`: playback exige utilizador autenticado.
- `CANONICO`: a URL de video vem de `content.media.playbackUrl`.
- `DERIVADO`: progresso e atualizado por eventos do player, com intervalo minimo no frontend.
- `DERIVADO`: historico do `BK-MF2-07` reutiliza `playback_progress`.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de progresso

1. Objetivo do passo.

Normalizar o tempo enviado pelo player e calcular `completed`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/playback/playback.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo.

4. Codigo completo.

```js
export function assertProgressPayload(input, durationSeconds) {
  const currentTimeSeconds = Number(input.currentTimeSeconds);

  if (!Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) {
    const error = new Error("Progresso invalido.");
    error.statusCode = 400;
    throw error;
  }

  const safeDuration = Number(durationSeconds);
  const safeTime = Math.min(currentTimeSeconds, safeDuration);
  const completed = safeDuration > 0 && (safeTime >= safeDuration * 0.95 || safeDuration - safeTime <= 60);

  return {
    currentTimeSeconds: safeTime,
    durationSeconds: safeDuration,
    completed,
  };
}
```

5. Explicacao do codigo ou da decisao.

O backend limita o tempo ao valor maximo da duracao para impedir progresso impossivel.

6. Validacao do passo.

```bash
node -e "import('./src/modules/playback/playback.validation.js').then(({ assertProgressPayload }) => console.log(assertProgressPayload({ currentTimeSeconds: 119 }, 120).completed))"
```

Resultado esperado: `true`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem validacao, o frontend poderia gravar `-10` ou `999999` como progresso.

### Passo 2 - Criar servico de playback

1. Objetivo do passo.

Carregar conteudo publicado, devolver progresso do utilizador e gravar novas posicoes.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/playback/playback.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o servico abaixo. A funcao `listContinueWatching` fica neste ficheiro para manter uma unica fonte de progresso.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertProgressPayload } from "./playback.validation.js";

function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function publicProgress(progress, durationSeconds) {
  if (!progress) {
    return {
      currentTimeSeconds: 0,
      durationSeconds,
      completed: false,
      lastWatchedAt: null,
    };
  }

  return {
    currentTimeSeconds: progress.currentTimeSeconds,
    durationSeconds: progress.durationSeconds,
    completed: progress.completed,
    lastWatchedAt: progress.lastWatchedAt,
  };
}

function publicPlaybackContent(content) {
  return {
    id: String(content._id),
    title: content.title,
    durationSeconds: content.durationSeconds,
    media: content.media,
    tracks: content.tracks ?? { subtitles: [], audio: [] },
    qualityOptions: content.qualityOptions ?? [],
  };
}

export async function ensurePlaybackIndexes() {
  const db = await getDb();
  await db.collection("playback_progress").createIndex({ userId: 1, contentId: 1 }, { unique: true });
  await db.collection("playback_progress").createIndex({ userId: 1, lastWatchedAt: -1 });
}

export async function getPlayback(contentId, userId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");

  const content = await db.collection("contents").findOne({
    _id: contentObjectId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const progress = await db.collection("playback_progress").findOne({
    userId: userObjectId,
    contentId: contentObjectId,
  });

  return {
    content: publicPlaybackContent(content),
    progress: publicProgress(progress, content.durationSeconds),
  };
}

export async function savePlaybackProgress(contentId, userId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const content = await db.collection("contents").findOne({ _id: contentObjectId, status: "published" });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const progress = assertProgressPayload(input, content.durationSeconds);
  const now = new Date();

  await db.collection("playback_progress").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { ...progress, lastWatchedAt: now, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  return publicProgress({ ...progress, lastWatchedAt: now }, content.durationSeconds);
}

export async function listContinueWatching(userId) {
  const db = await getDb();
  const rows = await db.collection("playback_progress").aggregate([
    { $match: { userId: asObjectId(userId, "Utilizador"), completed: false } },
    { $sort: { lastWatchedAt: -1 } },
    { $limit: 12 },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

  return rows.map((row) => ({
    id: String(row.content._id),
    title: row.content.title,
    slug: row.content.slug,
    posterUrl: row.content.assets?.posterUrl ?? "",
    currentTimeSeconds: row.currentTimeSeconds,
    durationSeconds: row.durationSeconds,
    lastWatchedAt: row.lastWatchedAt,
  }));
}
```

5. Explicacao do codigo ou da decisao.

`getPlayback` e `savePlaybackProgress` procuram sempre conteudo publicado. `listContinueWatching` junta progresso e catalogo para devolver apenas itens ainda visiveis.

6. Validacao do passo.

```bash
node -e "import('./src/modules/playback/playback.service.js').then((m) => console.log(typeof m.getPlayback, typeof m.listContinueWatching))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar uma colecao separada para historico duplicaria dados e poderia divergir do progresso real.

### Passo 3 - Criar controller e rotas

1. Objetivo do passo.

Expor endpoints protegidos de playback com ordem de rotas correta.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/playback/playback.controller.js`
    - CRIAR: `backend/src/modules/playback/playback.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e router. A rota `/me/continue-watching` deve vir antes de `/:contentId`.

4. Codigo completo.

`backend/src/modules/playback/playback.controller.js`

```js
import { getPlayback, listContinueWatching, savePlaybackProgress } from "./playback.service.js";

export async function getPlaybackByContent(req, res) {
  res.status(200).json(await getPlayback(req.params.contentId, req.user.id));
}

export async function putPlaybackProgress(req, res) {
  res.status(200).json({ progress: await savePlaybackProgress(req.params.contentId, req.user.id, req.body) });
}

export async function getContinueWatching(req, res) {
  res.status(200).json({ items: await listContinueWatching(req.user.id) });
}
```

`backend/src/modules/playback/playback.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getContinueWatching, getPlaybackByContent, putPlaybackProgress } from "./playback.controller.js";

export const playbackRouter = Router();

playbackRouter.use(requireAuth);
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", asyncHandler(getPlaybackByContent));
playbackRouter.put("/:contentId/progress", asyncHandler(putPlaybackProgress));
```

5. Explicacao do codigo ou da decisao.

`/me/continue-watching` e uma rota fixa. Se ficar depois de `/:contentId`, o Express interpreta `me` como `contentId`.

6. Validacao do passo.

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/me/continue-watching
```

Resultado esperado: `200 { "items": [] }` para utilizador sem progresso.

7. Caso negativo, erro comum ou risco que este passo evita.

Uma ordem errada de rotas faz o endpoint de lista devolver erro de ObjectId invalido.

### Passo 4 - Montar rotas e indices

1. Objetivo do passo.

Ligar playback ao backend e garantir chave unica por utilizador/conteudo.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: trechos de integracao

3. Instrucoes concretas.

Monta o router depois de `attachSession` e chama `ensurePlaybackIndexes` no arranque.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { playbackRouter } from "./modules/playback/playback.routes.js";

app.use(attachSession);
app.use("/api/playback", playbackRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensurePlaybackIndexes } from "./modules/playback/playback.service.js";

await ensurePlaybackIndexes();
```

5. Explicacao do codigo ou da decisao.

O indice unico impede duplicar progresso para o mesmo par `userId + contentId`.

6. Validacao do passo.

Arranca o backend e confirma que nao ha erro de indice:

```bash
npm --prefix backend run dev
```

Resultado esperado: servidor online.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice unico, dois pedidos quase simultaneos podem criar dois progressos para o mesmo conteudo.

### Passo 5 - Criar cliente frontend de playback

1. Objetivo do passo.

Centralizar chamadas do player e da lista "continuar a ver".

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/playbackApi.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Usa o `apiClient` existente.

4. Codigo completo.

```js
import { apiClient } from "./apiClient.js";

export const playbackApi = {
  getPlayback(contentId) {
    return apiClient.get(`/api/playback/${encodeURIComponent(contentId)}`);
  },
  saveProgress(contentId, currentTimeSeconds) {
    return apiClient.put(`/api/playback/${encodeURIComponent(contentId)}/progress`, { currentTimeSeconds });
  },
  listContinueWatching() {
    return apiClient.get("/api/playback/me/continue-watching");
  },
};
```

5. Explicacao do codigo ou da decisao.

As chamadas ficam num cliente dedicado e mantem cookies de sessao.

6. Validacao do passo.

```bash
node -e "import('./src/services/api/playbackApi.js').then(({ playbackApi }) => console.log(typeof playbackApi.saveProgress))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Duplicar `fetch` no componente aumenta o risco de esquecer cookies ou caminhos corretos.

### Passo 6 - Criar pagina de reproducao

1. Objetivo do passo.

Carregar playback, posicionar o video no progresso guardado e gravar novas posicoes.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/pages/PlaybackPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiro completo para pagina; trecho de rotas

3. Instrucoes concretas.

Cria a pagina e adiciona a rota `/ver/:contentId`.

4. Codigo completo.

`frontend/src/pages/PlaybackPage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

export function PlaybackPage() {
  const { contentId } = useParams();
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const [playback, setPlayback] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    playbackApi.getPlayback(contentId)
      .then((response) => setPlayback(response))
      .catch((requestError) => setError(requestError.message));
  }, [contentId]);

  function handleLoadedMetadata() {
    if (!videoRef.current || !playback?.progress.currentTimeSeconds) return;
    videoRef.current.currentTime = playback.progress.currentTimeSeconds;
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - lastSavedRef.current) < SAVE_INTERVAL_SECONDS) {
      return;
    }

    lastSavedRef.current = video.currentTime;
    playbackApi.saveProgress(contentId, video.currentTime).catch(() => {});
  }

  async function handlePause() {
    const video = videoRef.current;
    if (video) await playbackApi.saveProgress(contentId, video.currentTime);
  }

  if (error) {
    return <main className="page-shell"><p role="alert">{error}</p></main>;
  }

  if (!playback) {
    return <main className="page-shell"><p>A carregar player...</p></main>;
  }

  return (
    <main className="page-shell">
      <h1>{playback.content.title}</h1>
      <video
        ref={videoRef}
        controls
        data-testid="faithflix-player"
        src={playback.content.media.playbackUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
      >
        O teu browser nao suporta video HTML5.
      </video>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { PlaybackPage } from "../pages/PlaybackPage.jsx";

<Route path="/ver/:contentId" element={<PlaybackPage />} />
```

5. Explicacao do codigo ou da decisao.

O progresso e gravado em intervalos e no pause. Isto reduz pedidos sem perder o ponto principal de visualizacao.

6. Validacao do passo.

Abre `/ver/<contentId>`, inicia o video, espera mais de 15 segundos e pausa. Deve existir progresso na colecao `playback_progress`.

7. Caso negativo, erro comum ou risco que este passo evita.

Enviar progresso a cada `timeupdate` pode criar dezenas de pedidos por minuto.

### Passo 7 - Criar componente "continuar a ver"

1. Objetivo do passo.

Mostrar ao utilizador conteudos iniciados e ainda nao concluidos.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/components/playback/ContinueWatchingStrip.jsx`
    - EDITAR: `frontend/src/pages/CatalogPage.jsx`
    - LOCALIZACAO: ficheiro completo para componente; trecho de integracao

3. Instrucoes concretas.

Cria o componente e coloca-o no topo de `/catalogo`, antes da grelha publica.

4. Codigo completo.

`frontend/src/components/playback/ContinueWatchingStrip.jsx`

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { playbackApi } from "../../services/api/playbackApi.js";

function progressPercent(item) {
  if (!item.durationSeconds) return 0;
  return Math.round((item.currentTimeSeconds / item.durationSeconds) * 100);
}

export function ContinueWatchingStrip() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    playbackApi.listContinueWatching()
      .then((response) => setItems(response.items))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-label="Continuar a ver">
      <h2>Continuar a ver</h2>
      <div className="content-row">
        {items.map((item) => (
          <article key={item.id}>
            <img src={item.posterUrl} alt="" />
            <h3>{item.title}</h3>
            <progress max="100" value={progressPercent(item)} />
            <Link to={`/ver/${item.id}`}>Continuar</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
```

Trecho esperado em `frontend/src/pages/CatalogPage.jsx`:

```jsx
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";

<main className="page-shell">
  <h1>Catalogo</h1>
  <ContinueWatchingStrip />
  {/* grelha de conteudos publicados */}
</main>
```

5. Explicacao do codigo ou da decisao.

O componente falha silenciosamente se o utilizador nao estiver autenticado, mantendo o catalogo publico acessivel.

6. Validacao do passo.

Depois de ver parte de um conteudo, volta a `/catalogo`. Deve surgir a area "Continuar a ver".

7. Caso negativo, erro comum ou risco que este passo evita.

Se a lista vier do browser local, outro dispositivo do mesmo utilizador nao consegue continuar no mesmo ponto.

### Passo 8 - Validar ownership e fluxo completo

1. Objetivo do passo.

Confirmar que progresso pertence ao utilizador autenticado e que conteudos nao publicados nao reproduzem.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API, UI e MongoDB

3. Instrucoes concretas.

Usa dois utilizadores diferentes com cookies diferentes.

4. Codigo completo.

```bash
curl -i -b /tmp/user-a.cookies http://localhost:3000/api/playback/CONTENT_ID

curl -i -b /tmp/user-a.cookies \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"currentTimeSeconds":45}' \
  http://localhost:3000/api/playback/CONTENT_ID/progress

curl -i -b /tmp/user-b.cookies http://localhost:3000/api/playback/me/continue-watching
```

5. Explicacao do codigo ou da decisao.

O segundo utilizador nao deve ver progresso gravado pelo primeiro, porque a query filtra por `req.user.id`.

6. Validacao do passo.

Resultados esperados:

- User A grava progresso com `200`.
- User A ve o item em `continue-watching`.
- User B nao ve o progresso de User A.
- Conteudo `draft` devolve `404` no playback.

7. Caso negativo, erro comum ou risco que este passo evita.

Se User B ve progresso de User A, existe falha de ownership e o BK nao pode ser fechado.

## Snippet tecnico aplicavel

```js
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", asyncHandler(getPlaybackByContent));
```

## Criterios de aceite (mensuraveis)

- [ ] `GET /api/playback/:contentId` exige login.
- [ ] Conteudo nao publicado nao reproduz.
- [ ] `PUT /api/playback/:contentId/progress` grava progresso por utilizador.
- [ ] `GET /api/playback/me/continue-watching` lista apenas progresso do utilizador autenticado.
- [ ] `/ver/:contentId` mostra `<video>` com `data-testid="faithflix-player"`.
- [ ] `/catalogo` mostra "Continuar a ver" depois de existir progresso.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas `curl`, screenshot do player e screenshot da lista "Continuar a ver".

## Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `GET /api/playback/:contentId` com utilizador autenticado.
- Resposta `curl` de `PUT /api/playback/:contentId/progress` com `200`.
- Resposta `curl` a provar que User B nao ve progresso de User A.
- Screenshot de `/ver/:contentId` com `data-testid="faithflix-player"`.
- Screenshot da zona "Continuar a ver" apos guardar progresso.

## Handoff

O `BK-MF2-06` vai acrescentar legendas, audio, qualidade e parental sobre o mesmo endpoint `GET /api/playback/:contentId`, sem mudar a rota do player.

## Proximo BK recomendado

`BK-MF2-06` - Legendas/audio, parental e qualidade.

## Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
