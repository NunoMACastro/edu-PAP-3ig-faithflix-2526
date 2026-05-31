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

Implementar reproducao adaptada ao MVP (`RF11`) e a funcionalidade "continuar a ver" (`RF12`). O aluno deve sair deste BK a perceber como um player frontend conversa com o backend para ler conteudo publicado e guardar progresso por utilizador.

### Tempo estimado

- Rever detalhe e contrato de media: 15 min.
- Backend de playback/progresso: 75 min.
- Player React: 75 min.
- Validacao, negativos e evidence: 45 min.

### Conceitos essenciais

- O player so reproduz conteudo publicado.
- O progresso pertence ao par `userId + contentId`.
- `currentTimeSeconds` nunca pode ser negativo nem superior a duracao.
- O MVP usa URL de media existente no catalogo; CDN, DRM e transcodificacao ficam fora desta entrega.
- "Continuar a ver" e uma leitura do ultimo progresso guardado.

### Erros comuns

- Guardar progresso apenas no browser.
- Permitir que um utilizador atualize progresso de outro.
- Aceitar tempos negativos.
- Reproduzir conteudo `draft`.
- Fazer um pedido ao backend a cada segundo sem necessidade.

### Check de compreensao

- [ ] Sei explicar a chave `userId + contentId`.
- [ ] Sei porque o progresso fica no servidor.
- [ ] Sei que a URL de media vem de `BK-MF2-03`.
- [ ] Sei onde `BK-MF2-07` vai buscar historico.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-04` concluido.
- `media.playbackUrl` existe em pelo menos um conteudo publicado.
- `requireAuth` esta disponivel.
- O frontend ja tem rota para `/watch/:contentId`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecao | `playback_progress` |
| Chave unica | `userId + contentId` |
| Endpoint leitura | `GET /api/playback/:contentId` |
| Endpoint escrita | `PUT /api/playback/:contentId/progress` |
| Frontend | `PlaybackPage` com elemento `<video>` |
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

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de progresso

`CRIAR backend/src/modules/playback/playback.validation.js`

```js
export function assertProgressPayload(input, durationSeconds) {
  const currentTimeSeconds = Number(input.currentTimeSeconds);

  if (!Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) {
    const error = new Error("Progresso invalido.");
    error.statusCode = 400;
    throw error;
  }

  const safeTime = Math.min(currentTimeSeconds, durationSeconds);
  const completed = durationSeconds > 0 && (safeTime >= durationSeconds * 0.95 || durationSeconds - safeTime <= 60);

  return {
    currentTimeSeconds: safeTime,
    durationSeconds,
    completed,
  };
}
```

### Passo 2 - Criar servico de playback

`CRIAR backend/src/modules/playback/playback.service.js`

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
    content: {
      id: String(content._id),
      title: content.title,
      durationSeconds: content.durationSeconds,
      media: content.media,
      tracks: content.tracks ?? { subtitles: [], audio: [] },
    },
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
```

### Passo 3 - Criar controller e rotas

`CRIAR backend/src/modules/playback/playback.controller.js`

```js
import { getPlayback, savePlaybackProgress } from "./playback.service.js";

export async function getPlaybackController(req, res) {
  res.status(200).json(await getPlayback(req.params.contentId, req.user.id));
}

export async function putProgressController(req, res) {
  res.status(200).json({
    progress: await savePlaybackProgress(req.params.contentId, req.user.id, req.body),
  });
}
```

`CRIAR backend/src/modules/playback/playback.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getPlaybackController, putProgressController } from "./playback.controller.js";

export const playbackRouter = Router();

playbackRouter.get("/:contentId", requireAuth, asyncHandler(getPlaybackController));
playbackRouter.put("/:contentId/progress", requireAuth, asyncHandler(putProgressController));
```

`EDITAR backend/src/app.js`

```js
import { playbackRouter } from "./modules/playback/playback.routes.js";

app.use("/api/playback", playbackRouter);
```

### Passo 4 - Criar cliente frontend de playback

`CRIAR frontend/src/services/api/playbackApi.js`

```js
import { apiClient } from "./apiClient.js";

export const playbackApi = {
  getPlayback(contentId) {
    return apiClient.get(`/api/playback/${contentId}`);
  },
  saveProgress(contentId, payload) {
    return apiClient.put(`/api/playback/${contentId}/progress`, payload);
  },
};
```

### Passo 5 - Criar pagina de reproducao

`CRIAR frontend/src/pages/PlaybackPage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playback) return;

    video.currentTime = playback.progress.currentTimeSeconds;
  }, [playback]);

  async function saveProgress() {
    const video = videoRef.current;
    if (!video || Math.abs(video.currentTime - lastSavedRef.current) < 15) return;

    lastSavedRef.current = video.currentTime;
    await playbackApi.saveProgress(contentId, {
      currentTimeSeconds: video.currentTime,
    });
  }

  if (error) return <main className="page-shell"><h1>Reproducao indisponivel</h1><p>{error}</p></main>;
  if (!playback) return <main className="page-shell"><p>A carregar player...</p></main>;

  return (
    <main className="playback-page">
      <h1>{playback.content.title}</h1>
      <video
        ref={videoRef}
        src={playback.content.media.playbackUrl}
        controls
        playsInline
        onTimeUpdate={saveProgress}
        onPause={saveProgress}
        onEnded={saveProgress}
      />
    </main>
  );
}
```

### Passo 6 - Adicionar rota frontend

`EDITAR frontend/src/App.jsx` ou o ficheiro de rotas:

```jsx
import { PlaybackPage } from "./pages/PlaybackPage.jsx";

<Route path="/watch/:contentId" element={<PlaybackPage />} />
```

### Passo 7 - Adicionar "continuar a ver" ao catalogo ou home

`CRIAR backend/src/modules/playback/continue.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

export async function listContinueWatching(userId) {
  const db = await getDb();
  const rows = await db.collection("playback_progress").aggregate([
    { $match: { userId: new ObjectId(userId), completed: false } },
    { $sort: { lastWatchedAt: -1 } },
    { $limit: 12 },
    {
      $lookup: {
        from: "contents",
        localField: "contentId",
        foreignField: "_id",
        as: "content",
      },
    },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

  return rows.map((row) => ({
    contentId: String(row.contentId),
    title: row.content.title,
    posterUrl: row.content.assets?.posterUrl ?? "",
    currentTimeSeconds: row.currentTimeSeconds,
    durationSeconds: row.durationSeconds,
    lastWatchedAt: row.lastWatchedAt,
  }));
}
```

Adicionar controller/rota:

```js
playbackRouter.get("/me/continue-watching", requireAuth, asyncHandler(async (req, res) => {
  res.status(200).json({ items: await listContinueWatching(req.user.id) });
}));
```

Esta rota deve ficar antes de `/:contentId`.

### Passo 8 - Validar fluxo principal

1. Iniciar sessao.
2. Abrir `/catalog/:slug`.
3. Clicar em `Reproduzir`.
4. Ver 20 segundos.
5. Pausar.
6. Recarregar `/watch/:contentId`.
7. Confirmar que o video retoma perto do tempo guardado.

### Passo 9 - Validar negativos minimos

- Sem login, `GET /api/playback/:contentId` devolve `401`.
- Conteudo inexistente devolve `404`.
- Conteudo `draft` devolve `404`.
- Progresso negativo devolve `400`.
- Progresso maior que a duracao e limitado a duracao.
- Outro utilizador nao ve o progresso do primeiro.

## Snippet tecnico aplicavel

O ponto central e o `upsert` por utilizador e conteudo:

```js
await db.collection("playback_progress").updateOne(
  { userId: userObjectId, contentId: contentObjectId },
  { $set: { currentTimeSeconds, durationSeconds, completed, lastWatchedAt: now } },
  { upsert: true },
);
```

## Criterios de aceite (mensuraveis)

- Utilizador autenticado consegue abrir `/watch/:contentId`.
- Player usa `media.playbackUrl` vindo do backend.
- Progresso e guardado no backend.
- Reabrir o player retoma a partir do progresso guardado.
- "Continuar a ver" lista conteudos incompletos por utilizador.
- Os negativos obrigatorios ficam registados.

## Validacao final

- Confirmar que o endpoint de playback exige login.
- Confirmar que conteudo nao publicado nao reproduz.
- Confirmar que o progresso de dois utilizadores diferentes nao se mistura.
- Confirmar que o frontend nao guarda progresso como fonte principal.
- Confirmar que `BK-MF2-06` pode usar `tracks` e `ageRating`.

## Evidence para PR/defesa

- Captura do player aberto.
- Log de `PUT /api/playback/:contentId/progress` com `200`.
- Log de retoma apos recarregar pagina.
- Log de `401` sem login.
- Log de `404` para conteudo nao publicado.

## Handoff

Para `BK-MF2-06`, entregar:

- Player React com `<video>`.
- Endpoint `GET /api/playback/:contentId`.
- Resposta com `tracks`, `media.playbackUrl`, `durationSeconds` e progresso.
- Colecao `playback_progress` para historico em `BK-MF2-07`.

## Proximo BK recomendado

`BK-MF2-06 - Legendas/audio, parental e qualidade`

## Changelog

- `2026-05-31`: Guia reescrito com backend de playback, progresso, player React, continuar a ver, negativos e handoff para media controls.
