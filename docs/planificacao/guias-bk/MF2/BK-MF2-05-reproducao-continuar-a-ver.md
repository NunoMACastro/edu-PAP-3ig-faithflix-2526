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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar reproducao no MVP (`RF11`) e a funcionalidade "continuar a ver" (`RF12`).

No fim, deves conseguir explicar como o player carrega um conteudo publicado, como o backend guarda progresso por utilizador e como a UI mostra os conteudos iniciados mais recentemente.

#### Importância

Streaming sem progresso perde continuidade. Este BK transforma o catálogo num
fluxo funcional de consumo: o utilizador entra no detalhe, reproduz, a aplicação
guarda o ponto de visualização e depois apresenta esse conteúdo para continuar.
A baseline atual usa apenas fixtures sintéticas locais; não existe ainda vídeo
real para demonstrar este fluxo.

#### Scope-in

- Criar colecao `playback_progress`.
- Criar endpoints de leitura de playback, escrita de progresso e lista "continuar a ver".
- Garantir ownership por `userId + contentId`.
- Criar `PlaybackPage` com `<video>`.
- Criar `ContinueWatchingStrip`.
- Ligar rota frontend `/ver/:contentId`.
- Adicionar `data-testid="faithflix-player"` para E2E.

#### Scope-out

- DRM.
- CDN.
- Transcodificacao.
- Modo offline.
- Perfis familiares avancados.
- Analytics completos.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-04` concluido.
- Conteúdos reais podem continuar `published` com `mediaStatus: "pending"`.
- A validação do player usa uma fixture sintética local marcada `ready`, isolada
  dos dados normais; não é necessário nem permitido inventar um vídeo real.
- `requireAuth` esta disponivel.
- Frontend tem React Router.

#### Glossário

- `Playback`: dados necessarios para reproduzir um conteudo.
- `Progress`: ponto guardado de visualizacao.
- `completed`: marca de conteudo praticamente terminado.
- `ContinueWatching`: lista dos conteudos com progresso recente.

#### Conceitos teóricos essenciais

- O player so reproduz conteudo `published`.
- O progresso pertence ao par `userId + contentId`.
- O frontend nunca envia `userId`; o backend usa `req.user.id`.
- `currentTimeSeconds` nao pode ser negativo nem ultrapassar a duracao.
- A lista "continuar a ver" vem de `playback_progress`, nao de dados locais do browser.
- O catálogo público só anuncia disponibilidade; a fonte é devolvida pelo playback autenticado.
- `GET /api/playback/:contentId` exige sessão e verifica publicação, parental, entitlement e media antes de devolver exatamente uma fonte selecionada.
- Media não pronta ou incoerente devolve `409 MEDIA_NOT_READY`; a UI apresenta estado recuperável e retry, nunca um player preto.
- Playback importa a canonicalização de `catalog-media.js`; catálogo e player não mantêm validadores divergentes.
- `tracks` e `qualityOptions` são descritores por allowlist, sem qualquer alias de fonte.
- O player usa progressive, HLS nativo/`hls.js` e `dashjs`, destrói o adapter anterior e cancela o pedido ao trocar de conteúdo ou desmontar.
- Escritas de progresso são serializadas e coalescidas; o marcador confirmado só avança após sucesso.
- “Continuar a ver” é paginado (`page=1`, `limit=12`, máximo `50`), ordenado por `lastWatchedAt DESC, _id ASC` e exclui itens sem acesso ou media utilizável.

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
- Converter strings, vazio, `null` ou arrays em progresso/paginação válidos.

### Check de compreensao

- [ ] Sei explicar a chave `userId + contentId`.
- [ ] Sei porque o progresso fica no servidor.
- [ ] Sei porque `continue-watching` precisa de rota fixa antes da dinamica.
- [ ] Sei onde `BK-MF2-07` vai buscar historico.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Colecao | `playback_progress` |
| Chave unica | `userId + contentId` |
| Leitura playback | `GET /api/playback/:contentId` |
| Media indisponível | `409 { code: "MEDIA_NOT_READY", message, requestId }` |
| Fonte autenticada | `content.source = { url, protocol, mimeType }` |
| Protocolos | `progressive \| hls \| dash` |
| Escrita progresso | `PUT /api/playback/:contentId/progress` |
| Continuar a ver | `GET /api/playback/me/continue-watching?page=1&limit=12` |
| Envelope da lista | `{ items, page, limit, total, totalPages }`, `limit <= 50` |
| Ordem da lista | `lastWatchedAt DESC, _id ASC` |
| Frontend | `PlaybackPage`, `ContinueWatchingStrip` |
| Rota frontend | `/ver/:contentId` |
| Progresso concluido | `completed: true` quando falta menos de 60s ou passou 95% |

### Modelo `PlaybackProgress`

```js
// Um índice único por `userId` e `contentId` mantém um só marcador por conteúdo.
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
- `CANONICO`: a única URL pública de vídeo vem em `content.source.url`, na resposta autenticada de playback e depois das verificações backend.
- `CANONICO`: playback importa `canonicalMediaSource`/disponibilidade de `catalog-media.js`; não duplica regras de fonte.
- `CANONICO`: o frontend não escolhe nem constrói fontes; limita-se a ligar o adapter indicado por `content.source.protocol`.
- `DERIVADO`: progresso e atualizado por eventos do player, com intervalo minimo no frontend.
- `DERIVADO`: escritas de progresso são serializadas e coalescidas; a posição confirmada só avança depois de sucesso do backend.
- `DERIVADO`: historico do `BK-MF2-07` reutiliza `playback_progress`.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/playback/playback.validation.js`
- CRIAR: `backend/src/modules/playback/playback.service.js`
- CRIAR: `backend/src/modules/playback/playback.controller.js`
- CRIAR: `backend/src/modules/playback/playback.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- CRIAR: `frontend/src/services/api/playbackApi.js`
- CRIAR: `frontend/src/pages/PlaybackPage.jsx`
- CRIAR: `frontend/src/components/playback/mediaAdapter.js`
- CRIAR: `frontend/src/components/playback/progressQueue.js`
- EDITAR: `frontend/package.json`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- CRIAR: `frontend/src/components/playback/ContinueWatchingStrip.jsx`
- EDITAR: `frontend/src/pages/CatalogPage.jsx`

#### Tutorial técnico linear

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
import { HttpError } from "../../utils/http-error.js";

// Só aceitamos inteiros positivos em texto; valores fracionários ou coercíveis são rejeitados.
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

export function parseContinueWatchingPagination(query = {}) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new HttpError(400, "Paginacao invalida.");
  }

  const page = positiveQueryInteger(query.page, 1, "Pagina");
  const limit = positiveQueryInteger(query.limit, 12, "Limite");
  if (limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
    throw new HttpError(400, "Paginacao invalida.");
  }

  return { page, limit };
}

export function assertProgressPayload(input, durationSeconds) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Progresso invalido.");
  }

  const currentTimeSeconds = input.currentTimeSeconds;

  if (
    typeof currentTimeSeconds !== "number" ||
    !Number.isFinite(currentTimeSeconds) ||
    currentTimeSeconds < 0
  ) {
    throw new HttpError(400, "Progresso invalido.");
  }

  if (
    typeof durationSeconds !== "number" ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0
  ) {
    throw new HttpError(400, "Duracao de conteudo invalida.");
  }

  // Limitar à duração impede persistir posições impossíveis enviadas por clientes desatualizados.
  const safeTime = Math.min(currentTimeSeconds, durationSeconds);
  const completed = durationSeconds > 0 && (
    safeTime >= durationSeconds * 0.95 || durationSeconds - safeTime <= 60
  );

  return {
    currentTimeSeconds: safeTime,
    durationSeconds,
    completed,
  };
}
```

5. Explicacao do codigo ou da decisao.

O backend confirma os tipos JSON antes de limitar o tempo à duração. A paginação só converte strings canónicas de dígitos; vazio, arrays, decimais e `limit > 50` devolvem `400`.

6. Validacao do passo.

```bash
node -e "import('./src/modules/playback/playback.validation.js').then(({ assertProgressPayload, parseContinueWatchingPagination }) => console.log(assertProgressPayload({ currentTimeSeconds: 119 }, 120).completed, parseContinueWatchingPagination({ page: '1', limit: '12' }).limit))"
```

Resultado esperado: `true 12`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem validação, o frontend poderia gravar `-10` ou aceitar `"45"` como se fosse um número JSON real. Sem gramática estrita na query, `limit[]=12` ou `12.5` poderia ser convertido de forma ambígua.

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
import { HttpError } from "../../utils/http-error.js";
import {
  canonicalMediaSource,
  getMediaAvailability,
} from "../catalog/catalog-media.js";
import {
  assertProgressPayload,
  parseContinueWatchingPagination,
} from "./playback.validation.js";

function asObjectId(id, label) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} invalido.`);
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

// As faixas públicas são meros descritores de idioma/label e nunca transportam `src` ou URL.
function publicTracks(tracks = {}) {
  const describe = (track) => {
    const language = typeof track?.language === "string" ? track.language : "";
    const label = typeof track?.label === "string" ? track.label : language;
    return { language, label };
  };

  return {
    subtitles: Array.isArray(tracks?.subtitles)
      ? tracks.subtitles.map(describe)
      : [],
    audio: Array.isArray(tracks?.audio) ? tracks.audio.map(describe) : [],
  };
}

function publicQualityOptions(options = []) {
  if (!Array.isArray(options)) return [];

  return options.map((option) => {
    const value = typeof option?.value === "string" ? option.value : "";
    const locked = option?.locked === true;
    return {
      value,
      label: typeof option?.label === "string" ? option.label : value,
      locked,
      selected: !locked && option?.selected === true,
      ...(typeof option?.requiredTier === "string"
        ? { requiredTier: option.requiredTier }
        : {}),
      ...(typeof option?.lockedReason === "string"
        ? { lockedReason: option.lockedReason }
        : {}),
    };
  });
}

function selectedCanonicalSource(content) {
  const qualityCandidates = Array.isArray(content.qualityOptions)
    ? content.qualityOptions.filter((option) => option?.locked !== true)
    : [];
  const audioCandidates = Array.isArray(content.tracks?.audio)
    ? content.tracks.audio
    : [];
  const candidates = [...qualityCandidates, ...audioCandidates, content.media];
  const preferred = candidates.find(
    (candidate) => candidate?.selected === true && canonicalMediaSource(candidate),
  );

  return canonicalMediaSource(preferred)
    ?? candidates
      .map(canonicalMediaSource)
      .find((candidate) => candidate !== null)
    ?? null;
}

function publicPlaybackContent(content) {
  const source = selectedCanonicalSource(content);

  if (!getMediaAvailability(content).isPlayable || !source) {
    throw new HttpError(
      409,
      "Conteudo ainda nao tem media pronta para reproducao.",
      undefined,
      "MEDIA_NOT_READY",
    );
  }

  return {
    id: String(content._id),
    title: content.title,
    durationSeconds: content.durationSeconds,
    mediaStatus: "ready",
    isPlayable: true,
    source,
    tracks: publicTracks(content.tracks),
    qualityOptions: publicQualityOptions(content.qualityOptions),
  };
}

// Autorização, estado publicado, controlo parental e media pronta são verificados antes de devolver fonte.
async function loadEligibleContent(db, contentObjectId, userObjectId) {
  const [content, user] = await Promise.all([
    db.collection("contents").findOne({
      _id: contentObjectId,
      status: "published",
    }),
    db.collection("users").findOne({ _id: userObjectId }),
  ]);

  if (!content) throw new HttpError(404, "Conteudo nao encontrado.");
  if (!user) throw new HttpError(401, "Autenticacao obrigatoria.");

  const maxAge = Number.isInteger(user.parentalMaxAgeRating)
    ? user.parentalMaxAgeRating
    : 18;
  if (typeof content.ageRating === "number" && content.ageRating > maxAge) {
    throw new HttpError(403, "Conteudo bloqueado pelo controlo parental.");
  }

  publicPlaybackContent(content);
  return { content, user };
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
  const { content } = await loadEligibleContent(db, contentObjectId, userObjectId);

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
  const { content } = await loadEligibleContent(db, contentObjectId, userObjectId);

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

export async function listContinueWatching(userId, query = {}) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const { page, limit } = parseContinueWatchingPagination(query);
  const user = await db.collection("users").findOne({ _id: userObjectId });

  if (!user) throw new HttpError(401, "Autenticacao obrigatoria.");

  const maxAge = Number.isInteger(user.parentalMaxAgeRating)
    ? user.parentalMaxAgeRating
    : 18;
  const rows = await db.collection("playback_progress").aggregate([
    { $match: { userId: userObjectId, completed: false } },
    { $sort: { lastWatchedAt: -1, _id: 1 } },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    {
      $match: {
        "content.status": "published",
        "content.mediaStatus": "ready",
      },
    },
  ]).toArray();

  const eligibleRows = rows.filter((row) => {
    const ageAllowed = typeof row.content.ageRating !== "number"
      || row.content.ageRating <= maxAge;
    return ageAllowed
      && getMediaAvailability(row.content).isPlayable
      && selectedCanonicalSource(row.content) !== null;
  });
  const total = eligibleRows.length;
  const pageRows = eligibleRows.slice((page - 1) * limit, page * limit);

  const items = pageRows.map((row) => ({
    id: String(row.content._id),
    title: row.content.title,
    slug: row.content.slug,
    posterUrl: typeof row.content.assets?.posterUrl === "string"
      ? row.content.assets.posterUrl
      : "",
    mediaStatus: "ready",
    isPlayable: true,
    currentTimeSeconds: row.currentTimeSeconds,
    durationSeconds: row.durationSeconds,
    lastWatchedAt: row.lastWatchedAt,
  }));

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
```

5. Explicacao do codigo ou da decisao.

`getPlayback` e `savePlaybackProgress` usam a mesma fronteira de publicação, parental e media. A fonte vem exclusivamente de `catalog-media.js`; containers malformados tornam-se listas vazias. `listContinueWatching` filtra visibilidade e media antes de calcular `total` e paginar, com desempate `_id`, por isso não cria páginas vazias nem metadata falsa.

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
  // A fonte autorizada é específica da sessão e não pode ser guardada em caches partilhadas.
  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json(await getPlayback(req.params.contentId, req.user.id));
}

export async function putPlaybackProgress(req, res) {
  res.status(200).json({ progress: await savePlaybackProgress(req.params.contentId, req.user.id, req.body) });
}

export async function getContinueWatching(req, res) {
  res.status(200).json(await listContinueWatching(req.user.id, req.query));
}
```

`backend/src/modules/playback/playback.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getContinueWatching, getPlaybackByContent, putPlaybackProgress } from "./playback.controller.js";

export const playbackRouter = Router();

// Todas as rotas de playback, progresso e lista pessoal exigem uma sessão autenticada.
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

Resultado esperado: `200 { "items": [], "page": 1, "limit": 12, "total": 0, "totalPages": 0 }` para utilizador sem progresso.

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

// Codificar o ID garante que permanece num único segmento e não altera o endpoint solicitado.
function contentPath(contentId) {
  if (typeof contentId !== "string" || contentId.length === 0) {
    throw new TypeError("Conteudo invalido.");
  }
  return encodeURIComponent(contentId);
}

function continueWatchingQuery(pagination = {}) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 12;
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

export const playbackApi = {
  getPlayback(contentId, options = {}) {
    return apiClient.get(`/api/playback/${contentPath(contentId)}`, options);
  },
  saveProgress(contentId, currentTimeSeconds, options = {}) {
    if (
      typeof currentTimeSeconds !== "number" ||
      !Number.isFinite(currentTimeSeconds) ||
      currentTimeSeconds < 0
    ) {
      throw new TypeError("Progresso invalido.");
    }

    return apiClient.put(
      `/api/playback/${contentPath(contentId)}/progress`,
      { currentTimeSeconds },
      options,
    );
  },
  // A listagem propaga `signal` para cancelar pedidos antigos quando a sessão ou página muda.
  listContinueWatching(pagination = {}, options = {}) {
    return apiClient.get(
      `/api/playback/me/continue-watching?${continueWatchingQuery(pagination)}`,
      options,
    );
  },
};
```

5. Explicacao do codigo ou da decisao.

As chamadas ficam num cliente dedicado, mantêm cookies/CSRF, recusam valores frontend inválidos e propagam `AbortSignal`. A faixa pede explicitamente a primeira página de 12 itens.

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
    - CRIAR: `frontend/src/components/playback/mediaAdapter.js`
    - CRIAR: `frontend/src/components/playback/progressQueue.js`
    - EDITAR: `frontend/package.json`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiro completo para pagina; trecho de rotas

3. Instrucoes concretas.

Instala as versões runtime fixadas e auditadas para este contrato. Depois cria a página e adiciona a rota `/ver/:contentId`. O helper `mediaAdapter.js`
valida `{ url, protocol, mimeType }` e devolve um `destroy()` idempotente: usa
`video.src` em `progressive`, HLS nativo ou `import("hls.js")` em `hls`, e
`import("dashjs")` em `dash`. O helper `progressQueue.js` serializa escritas,
coalesce posições pendentes e só atualiza `lastSaved` depois de a API responder
com sucesso.

4. Codigo completo.

```bash
npm --prefix frontend install --save-exact hls.js@1.6.16 dashjs@5.2.0
```

`frontend/src/components/playback/mediaAdapter.js`

```js
const MIME_BY_PROTOCOL = Object.freeze({
  progressive: "video/mp4",
  hls: "application/vnd.apple.mpegurl",
  dash: "application/dash+xml",
});

function abortError() {
  return new DOMException("Pedido cancelado.", "AbortError");
}

function assertSource(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new TypeError("Fonte de media invalida.");
  }
  if (
    typeof source.url !== "string" ||
    typeof source.protocol !== "string" ||
    MIME_BY_PROTOCOL[source.protocol] !== source.mimeType
  ) {
    throw new TypeError("Fonte de media incoerente.");
  }
  return source;
}

export async function attachMediaSource(video, rawSource, options = {}) {
  if (!(video instanceof HTMLVideoElement)) {
    throw new TypeError("Elemento video obrigatorio.");
  }

  const source = assertSource(rawSource);
  const { signal, onError = () => {} } = options;
  if (signal?.aborted) throw abortError();

  let engine = null;
  let destroyed = false;
  // Destruir o adapter liberta listeners/engines e remove a fonte ao mudar de conteúdo ou desmontar.
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    signal?.removeEventListener("abort", destroy);
    if (source.protocol === "hls" && engine) engine.destroy();
    if (source.protocol === "dash" && engine) engine.reset();
    video.removeAttribute("src");
    video.load();
  };
  signal?.addEventListener("abort", destroy, { once: true });

  if (source.protocol === "progressive") {
    video.src = source.url;
    video.load();
    return { destroy };
  }

  if (source.protocol === "hls" && video.canPlayType(source.mimeType)) {
    video.src = source.url;
    video.load();
    return { destroy };
  }

  // Os adapters pesados são importados apenas quando o protocolo do conteúdo os exige.
  if (source.protocol === "hls") {
    const module = await import("hls.js");
    if (signal?.aborted) throw abortError();
    const Hls = module.default;
    if (!Hls?.isSupported()) throw new Error("HLS nao suportado.");
    engine = new Hls();
    engine.on(Hls.Events.ERROR, (_event, data) => {
      if (data?.fatal) onError();
    });
    engine.loadSource(source.url);
    engine.attachMedia(video);
    return { destroy };
  }

  const module = await import("dashjs");
  if (signal?.aborted) throw abortError();
  const dashjs = module.default ?? module;
  engine = dashjs.MediaPlayer().create();
  engine.on(dashjs.MediaPlayer.events.ERROR, onError);
  engine.initialize(video, source.url, false);
  return { destroy };
}
```

`frontend/src/components/playback/progressQueue.js`

```js
export function createProgressQueue(saveProgress, options = {}) {
  if (typeof saveProgress !== "function") {
    throw new TypeError("Funcao de progresso obrigatoria.");
  }

  function validPosition(value) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new TypeError("Posicao de progresso invalida.");
    }
    return value;
  }

  // `pending` guarda apenas a posição mais recente, coalescendo eventos `timeupdate` muito frequentes.
  let pending = null;
  let waiters = [];
  let running = false;
  let closed = false;
  let lastSaved = validPosition(options.initialPosition ?? 0);

  async function drain() {
    while (pending !== null) {
      const position = pending;
      const batch = waiters;
      pending = null;
      waiters = [];
      try {
        await saveProgress(position);
        // O marcador confirmado só avança depois de o backend aceitar a escrita.
        lastSaved = position;
        batch.forEach(({ resolve }) => resolve(position));
      } catch (error) {
        batch.forEach(({ reject }) => reject(error));
      }
    }
    running = false;
  }

  function enqueueInternal(position) {
    pending = validPosition(position);
    const result = new Promise((resolve, reject) => {
      waiters.push({ resolve, reject });
    });
    if (!running) {
      running = true;
      queueMicrotask(() => void drain());
    }
    return result;
  }

  return {
    enqueue(position) {
      return closed ? Promise.resolve(lastSaved) : enqueueInternal(position);
    },
    close(position) {
      if (closed) return Promise.resolve(lastSaved);
      const result = position === undefined
        ? Promise.resolve(lastSaved)
        : enqueueInternal(position);
      closed = true;
      return result;
    },
    getLastSaved() {
      return lastSaved;
    },
  };
}
```

`frontend/src/pages/PlaybackPage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { attachMediaSource } from "../components/playback/mediaAdapter.js";
import { createProgressQueue } from "../components/playback/progressQueue.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

function safePosition(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export function PlaybackPage() {
  const { contentId } = useParams();
  const videoRef = useRef(null);
  const queueRef = useRef(null);
  const resumeAtRef = useRef(0);
  const lastPositionRef = useRef(0);
  const mountedRef = useRef(true);
  const [playback, setPlayback] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [progressError, setProgressError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const [mediaRetryVersion, setMediaRetryVersion] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // Trocar de conteúdo ou repetir cancela a leitura anterior e impede respostas fora de ordem.
    setPlayback(null);
    setRequestError(null);

    playbackApi.getPlayback(contentId, { signal: controller.signal })
      .then((response) => {
        if (active) setPlayback(response);
      })
      .catch((error) => {
        if (active && error?.code !== "REQUEST_ABORTED") setRequestError(error);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [contentId, retryVersion]);

  const source = playback?.content?.source;

  useEffect(() => {
    if (!source) return undefined;

    const video = videoRef.current;
    const controller = new AbortController();
    let adapter = null;
    let active = true;
    setMediaError("");

    attachMediaSource(video, source, {
      signal: controller.signal,
      onError: () => setMediaError("Não foi possível reproduzir este vídeo."),
    })
      .then((nextAdapter) => {
        if (!active) return nextAdapter.destroy();
        adapter = nextAdapter;
      })
      .catch((error) => {
        if (active && error?.name !== "AbortError") {
          setMediaError("Não foi possível preparar o vídeo neste browser.");
        }
      });

    return () => {
      active = false;
      controller.abort();
      resumeAtRef.current = safePosition(video?.currentTime ?? lastPositionRef.current);
      adapter?.destroy();
    };
  }, [contentId, mediaRetryVersion, source?.url, source?.protocol, source?.mimeType]);

  useEffect(() => {
    if (!playback) return undefined;

    const initialPosition = safePosition(playback.progress?.currentTimeSeconds);
    const queue = createProgressQueue(
      (position) => playbackApi.saveProgress(contentId, position, { keepalive: true }),
      { initialPosition },
    );
    queueRef.current = queue;
    lastPositionRef.current = initialPosition;

    // Pause/hidden/pagehide reutilizam a fila para tentar persistir a última posição observada.
    const flush = () => {
      const position = safePosition(videoRef.current?.currentTime ?? lastPositionRef.current);
      lastPositionRef.current = position;
      void queue.enqueue(position).catch((error) => {
        if (mountedRef.current) setProgressError(toUserMessage(error));
      });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    globalThis.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      globalThis.removeEventListener("pagehide", flush);
      if (queueRef.current === queue) queueRef.current = null;
      void queue.close(lastPositionRef.current).catch(() => {});
    };
  }, [contentId, playback]);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    const startAt = resumeAtRef.current || safePosition(playback?.progress?.currentTimeSeconds);
    if (startAt > 0) video.currentTime = startAt;
    lastPositionRef.current = startAt;
    resumeAtRef.current = 0;
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    const queue = queueRef.current;
    if (!video || !queue) return;

    lastPositionRef.current = video.currentTime;
    if (Math.abs(video.currentTime - queue.getLastSaved()) < SAVE_INTERVAL_SECONDS) {
      return;
    }

    void queue.enqueue(video.currentTime)
      .then(() => {
        if (mountedRef.current) setProgressError("");
      })
      .catch((error) => {
        if (mountedRef.current) setProgressError(toUserMessage(error));
      });
  }

  function handlePause() {
    const video = videoRef.current;
    if (!video || !queueRef.current) return;
    lastPositionRef.current = video.currentTime;
    void queueRef.current.enqueue(video.currentTime)
      .then(() => {
        if (mountedRef.current) setProgressError("");
      })
      .catch((error) => {
        if (mountedRef.current) setProgressError(toUserMessage(error));
      });
  }

  if (requestError) {
    const mediaPending = requestError.code === "MEDIA_NOT_READY";
    return (
      <main className="page-shell">
        <h1>{mediaPending ? "Vídeo ainda não disponível" : "Reprodução indisponível"}</h1>
        <p role="alert">
          {mediaPending ? "O vídeo ainda está a ser preparado." : toUserMessage(requestError)}
        </p>
        <button type="button" onClick={() => setRetryVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      </main>
    );
  }

  if (!playback) {
    return <main className="page-shell"><p>A carregar player...</p></main>;
  }

  return (
    <main className="page-shell">
      <h1>{playback.content.title}</h1>
      {mediaError ? (
        <div role="alert">
          <p>{mediaError}</p>
          <button type="button" onClick={() => setMediaRetryVersion((value) => value + 1)}>
            Tentar reproduzir novamente
          </button>
        </div>
      ) : null}
      {progressError ? <p role="alert">{progressError}</p> : null}
      <video
        ref={videoRef}
        controls
        data-testid="faithflix-player"
        hidden={mediaError !== ""}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onError={() => setMediaError("Não foi possível carregar o vídeo.")}
      >
        O teu browser nao suporta video HTML5.
      </video>
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const PlaybackPage = lazyNamedPage(() => import("../pages/PlaybackPage.jsx"), "PlaybackPage");

<Route path="/ver/:contentId" element={<PlaybackPage />} />
```

5. Explicacao do codigo ou da decisao.

O player não recebe `src` diretamente no JSX. O adapter interpreta apenas o
protocolo devolvido pelo backend e é cancelado/destruído na troca. A fila reduz
pedidos concorrentes, grava a posição mais recente em `pause`, `hidden` e
`pagehide`, e só avança o marcador depois de uma resposta bem-sucedida. A rota
acrescenta apenas uma declaração lazy e um `Route`; não substitui o router base
nem os seus boundaries/lifecycle.

6. Validacao do passo.

Abre `/ver/<contentId>`, inicia o vídeo, espera mais de 15 segundos e pausa. Deve
existir progresso na coleção `playback_progress`. Repete com fixtures locais
progressive, HLS e DASH e confirma `loadedmetadata`/`canplay`, troca de adapter,
cleanup e erro com retry, sem qualquer pedido externo.

7. Caso negativo, erro comum ou risco que este passo evita.

Enviar progresso a cada `timeupdate` pode criar dezenas de pedidos por minuto.
Atualizar o marcador antes da confirmação perde a posição quando a escrita falha;
manter adapters antigos ativos provoca pedidos e listeners concorrentes.

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
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { playbackApi } from "../../services/api/playbackApi.js";

function progressPercent(item) {
  const currentTime = item?.currentTimeSeconds;
  const duration = item?.durationSeconds;
  if (
    typeof currentTime !== "number" ||
    !Number.isFinite(currentTime) ||
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
}

export function ContinueWatchingStrip() {
  const { status } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Dados pessoais só são pedidos quando o estado autoritativo confirma autenticação.
    setItems([]);
    setError("");
    // O cleanup deste ramo também invalida qualquer resolução tardia depois de logout.
    if (status !== "authenticated") {
      setLoading(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    setLoading(true);
    playbackApi.listContinueWatching(
      { page: 1, limit: 12 },
      { signal: controller.signal },
    )
      .then((response) => {
        if (active) setItems(Array.isArray(response.items) ? response.items : []);
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
  }, [reloadVersion, status]);

  if (status !== "authenticated") return null;

  if (loading) {
    return <section aria-label="Continuar a ver"><p role="status">A carregar...</p></section>;
  }

  if (error) {
    return (
      <section aria-label="Continuar a ver">
        <p role="alert">{error}</p>
        <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section aria-label="Continuar a ver">
      <h2>Continuar a ver</h2>
      <div className="content-row">
        {items.map((item) => (
          <article key={item.id}>
            {item.posterUrl ? (
              <img src={item.posterUrl} alt={`Cartaz de ${item.title}`} loading="lazy" />
            ) : null}
            <h3>{item.title}</h3>
            <progress
              aria-label={`Progresso de ${item.title}`}
              max="100"
              value={progressPercent(item)}
            />
            <Link
              aria-label={`Continuar a ver ${item.title}`}
              to={`/ver/${encodeURIComponent(item.id)}`}
            >
              Continuar
            </Link>
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

O componente não pede dados pessoais fora de uma sessão autenticada. Com sessão válida, usa cancelamento/anti-stale, erro seguro e retry; não converte valores inválidos em percentagens e codifica o id antes de navegar.

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

Usa dois utilizadores diferentes com cookies diferentes. Obtém primeiro o token CSRF da sessão A sem o imprimir.

4. Codigo completo.

```bash
curl -sS -b /tmp/user-a.cookies -c /tmp/user-a.cookies \
  -o /tmp/user-a-csrf.json \
  http://localhost:3000/api/session/csrf-token

CSRF_TOKEN="$(node -p "JSON.parse(require('fs').readFileSync('/tmp/user-a-csrf.json','utf8')).csrfToken")"

curl -i -b /tmp/user-a.cookies http://localhost:3000/api/playback/CONTENT_ID

curl -i -b /tmp/user-a.cookies \
  -X PUT \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"currentTimeSeconds":45}' \
  http://localhost:3000/api/playback/CONTENT_ID/progress

curl -i -b /tmp/user-a.cookies \
  'http://localhost:3000/api/playback/me/continue-watching?page=1&limit=12'

curl -i -b /tmp/user-b.cookies \
  'http://localhost:3000/api/playback/me/continue-watching?page=1&limit=12'

curl -i -b /tmp/user-a.cookies \
  'http://localhost:3000/api/playback/me/continue-watching?page=1&limit=51'

unset CSRF_TOKEN
```

5. Explicacao do codigo ou da decisao.

O segundo utilizador nao deve ver progresso gravado pelo primeiro, porque a query filtra por `req.user.id`.

6. Validacao do passo.

Resultados esperados:

- User A grava progresso com `200`.
- User A ve o item em `continue-watching`.
- User B nao ve o progresso de User A.
- Conteudo `draft` devolve `404` no playback.
- `limit=51` devolve `400` e a resposta válida inclui toda a metadata de paginação.

7. Caso negativo, erro comum ou risco que este passo evita.

Se User B ve progresso de User A, existe falha de ownership e o BK nao pode ser fechado.

## Snippet tecnico aplicavel

```js
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", asyncHandler(getPlaybackByContent));
```

#### Critérios de aceite

- [ ] `GET /api/playback/:contentId` exige login.
- [ ] Leitura e escrita aplicam publicação, controlo parental e disponibilidade através da mesma fronteira.
- [ ] Conteudo nao publicado nao reproduz.
- [ ] Conteúdo publicado com media pendente devolve `409 MEDIA_NOT_READY`.
- [ ] O playback devolve exatamente uma `content.source = { url, protocol, mimeType }`, com protocolo `progressive|hls|dash`.
- [ ] `tracks` e `qualityOptions` públicas não contêm `url`, `playbackUrl` nem `src`.
- [ ] `qualityOptions` públicas usam apenas `value`, `label`, `locked`, `selected` e os campos opcionais `requiredTier`/`lockedReason`.
- [ ] `PUT /api/playback/:contentId/progress` grava progresso por utilizador.
- [ ] As escritas de progresso são serializadas/coalescidas e o marcador confirmado só avança após sucesso.
- [ ] `GET /api/playback/me/continue-watching` lista apenas progresso do utilizador autenticado.
- [ ] Continuar a ver devolve metadata completa, recusa `limit=51` e mantém ordem estável entre páginas.
- [ ] A faixa cancela a leitura ao desmontar/mudar de sessão e oferece retry num erro real.
- [ ] `/ver/:contentId` mostra `<video>` com `data-testid="faithflix-player"`, usa o adapter indicado e destrói-o na troca/unmount.
- [ ] Falhas de media mostram erro com retry; nunca deixam um player preto sem feedback.
- [ ] `/catalogo` mostra "Continuar a ver" depois de existir progresso.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas `curl`, screenshot do player e screenshot da lista "Continuar a ver".

#### Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `GET /api/playback/:contentId` com utilizador autenticado.
- Resposta que prove uma única `content.source` e ausência de fontes em `tracks`/`qualityOptions`.
- Resposta `curl` de conteúdo pendente com `409`, `MEDIA_NOT_READY` e `requestId`, sem URL.
- Resposta `curl` de `PUT /api/playback/:contentId/progress` com `200`.
- Resposta `curl` a provar que User B nao ve progresso de User A.
- Respostas das páginas 1 e 2 a provar `{ page, limit, total, totalPages }`, ordem estável e `400` para `limit=51`.
- Teste comportamental que prove cancelamento no unmount, erro/retry e ausência de resposta stale.
- Screenshot de `/ver/:contentId` com `data-testid="faithflix-player"`.
- Screenshot da zona "Continuar a ver" apos guardar progresso.
- Resultado das fixtures sintéticas locais progressive/HLS/DASH, identificado como prova de contrato/adapters e não como streaming real, 4K real, CDN ou carga.

#### Handoff

O `BK-MF2-06` vai acrescentar legendas, audio, qualidade e parental sobre o mesmo endpoint `GET /api/playback/:contentId`, sem mudar a rota do player.

## Proximo BK recomendado

`BK-MF2-06` - Legendas/audio, parental e qualidade.

#### Changelog

- 2026-07-10: Tutorial canónico consolidado com tipos JSON estritos, fonte partilhada, paginação estável, adapters progressive/HLS/DASH, progresso serial/coalescido, cancelamento/anti-stale e retry.
- 2026-07-10: Alinhado o DTO autenticado com `content.source`, adapters progressive/HLS/DASH, cleanup, retry e fila de progresso; fixtures sintéticas ficam explicitamente fora de prova de streaming real.
- 2026-07-10: Catálogo e playback passam a partilhar a canonicalização de fonte;
  aliases inseguros e containers legacy malformados falham sem CTA falso ou 500.
- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
