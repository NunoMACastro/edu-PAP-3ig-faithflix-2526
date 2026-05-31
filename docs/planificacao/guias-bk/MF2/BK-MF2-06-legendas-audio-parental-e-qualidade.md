# BK-MF2-06 - Legendas/audio, parental e qualidade

## Header

- `doc_id`: `GUIA-BK-MF2-06`
- `bk_id`: `BK-MF2-06`
- `macro`: `MF2`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-05`
- `rf_rnf`: `RF13, RF14, RF15`
- `fase_documental`: `Fase 2`
- `sprint`: `S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-07`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais acrescentar selecao de legendas, audio, qualidade e controlo parental basico ao player. A entrega cobre `RF13`, `RF14` e `RF15`.

No fim, deves conseguir explicar porque estes controlos nao sao apenas botoes: eles precisam de dados no catalogo, preferencias por utilizador e validacao no backend antes de devolver a URL de reproducao.

### Importancia funcional

Legendas, audio, qualidade e parental tornam a experiencia mais acessivel e segura. Tambem obrigam a separar tres responsabilidades: catalogo descreve opcoes, utilizador guarda preferencias, backend autoriza acesso.

### Scope-in

- Acrescentar `tracks.subtitles`, `tracks.audio` e `qualityOptions` ao catalogo.
- Acrescentar `parentalMaxAgeRating` ao utilizador.
- Criar endpoints de preferencias de media.
- Validar parental no backend antes de devolver playback.
- Atualizar player com selects de legenda, audio e qualidade.
- Garantir que qualidade inexistente nao gera URL.

### Scope-out

- Controlo parental por PIN.
- Perfis infantis completos.
- Transcodificacao dinamica.
- Upload de ficheiros `.vtt`.
- Deteccao automatica de idioma.

### Glossario rapido

- `Subtitle track`: faixa de legendas.
- `Audio track`: opcao de audio.
- `Quality option`: URL de reproducao associada a uma qualidade.
- `Parental max age rating`: limite etario maximo permitido para o utilizador.
- `Media preferences`: escolhas persistidas por utilizador.

### Conceitos essenciais

- O catalogo declara as opcoes disponiveis; o frontend nao inventa opcoes.
- O parental e verificado no backend em `GET /api/playback/:contentId`.
- Uma preferencia guardada pode nao existir num conteudo especifico; nesse caso o player usa a opcao base.
- `role` nao substitui limite parental.
- Trocar qualidade deve preservar o tempo atual do video.

### Tempo estimado

- Rever catalogo e player: 20 min.
- Atualizar validacao de catalogo: 45 min.
- Backend parental e preferencias: 75 min.
- Atualizar player React: 70 min.
- Validacao e evidence: 35 min.

### Erros comuns

- Bloquear conteudo apenas no frontend.
- Aceitar qualquer qualidade e construir uma URL a partir do texto.
- Perder o tempo atual ao trocar qualidade.
- Guardar preferencias sem login.
- Confundir classificacao etaria com role.

### Check de compreensao

- [ ] Sei onde ficam `subtitles`, `audio` e `qualityOptions`.
- [ ] Sei porque parental precisa de validacao backend.
- [ ] Sei porque uma qualidade inexistente nao pode gerar URL.
- [ ] Sei testar troca de qualidade preservando tempo.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-05` concluido.
- Player React funcional em `/ver/:contentId`.
- Conteudo tem `ageRating`.
- Utilizador autenticado tem `id`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Catalogo | `tracks.subtitles`, `tracks.audio`, `qualityOptions` |
| Utilizador | `parentalMaxAgeRating` |
| Preferencias | `GET /api/playback/preferences`, `PUT /api/playback/preferences` |
| Parental | `GET /api/playback/:contentId` devolve `403` se `ageRating` exceder limite |
| Player | selects para legenda, audio e qualidade |
| Risco bloqueado | qualidade inexistente nao cria URL de media |

### Modelo de media

```js
{
  tracks: {
    subtitles: [
      { language: "pt", label: "Portugues", src: "/tracks/piloto-pt.vtt" }
    ],
    audio: [
      { language: "pt", label: "Portugues" }
    ]
  },
  qualityOptions: [
    { label: "720p", value: "720p", playbackUrl: "/media/piloto-720.mp4" },
    { label: "1080p", value: "1080p", playbackUrl: "/media/piloto-1080.mp4" }
  ]
}
```

### Decisoes tecnicas

- `CANONICO`: parental e validado no backend.
- `CANONICO`: preferencias pertencem ao utilizador autenticado.
- `DERIVADO`: `qualityOptions` guarda URLs explicitas; o player nunca calcula caminho de media.
- `DERIVADO`: se a preferencia de qualidade nao existir no conteudo, usa-se `media.playbackUrl`.

### Guia de execucao (passo-a-passo)

### Passo 1 - Atualizar validacao completa de catalogo

1. Objetivo do passo.

Adicionar faixas e qualidades ao contrato do catalogo sem quebrar a validacao criada no BK-MF2-03.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/catalog/catalog.validation.js`
    - LOCALIZACAO: substituir o ficheiro pelo conteudo completo abaixo

3. Instrucoes concretas.

Atualiza o ficheiro completo. Esta versao inclui todos os campos anteriores e os novos campos de media.

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

function optionalText(value, max = 500) {
  const text = String(value ?? "").trim();
  return text.length > max ? text.slice(0, max) : text;
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

function assertAgeRating(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0 || number > 18) {
    const error = new Error("Classificacao etaria invalida.");
    error.statusCode = 400;
    throw error;
  }

  return number;
}

function mediaTrack(track, includeSrc) {
  const item = {
    language: requiredText(track.language, "language", 2, 12),
    label: requiredText(track.label, "label", 2, 80),
  };

  if (includeSrc) {
    item.src = requiredText(track.src, "src", 1, 500);
  }

  return item;
}

function qualityOption(option) {
  return {
    label: requiredText(option.label, "label", 2, 40),
    value: requiredText(option.value, "value", 2, 40),
    playbackUrl: requiredText(option.playbackUrl, "playbackUrl", 1, 500),
  };
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function assertMediaOptions(input) {
  return {
    tracks: {
      subtitles: Array.isArray(input.tracks?.subtitles)
        ? input.tracks.subtitles.map((track) => mediaTrack(track, true))
        : [],
      audio: Array.isArray(input.tracks?.audio)
        ? input.tracks.audio.map((track) => mediaTrack(track, false))
        : [],
    },
    qualityOptions: Array.isArray(input.qualityOptions)
      ? input.qualityOptions.map(qualityOption)
      : [],
  };
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
    ageRating: assertAgeRating(input.ageRating ?? 0),
    taxonomyIds: Array.isArray(input.taxonomyIds) ? input.taxonomyIds : [],
    assets: {
      posterUrl: optionalText(input.assets?.posterUrl),
      backdropUrl: optionalText(input.assets?.backdropUrl),
    },
    media: {
      playbackUrl: requiredText(input.media?.playbackUrl, "media.playbackUrl", 1, 500),
    },
    ...assertMediaOptions(input),
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
    description: optionalText(input.description),
  };
}
```

5. Explicacao do codigo ou da decisao.

A funcao `assertCatalogPayload` fica completa e devolve todos os campos do catalogo numa unica estrutura.

6. Validacao do passo.

```bash
node -e "import('./src/modules/catalog/catalog.validation.js').then(({ assertMediaOptions }) => console.log(assertMediaOptions({}).qualityOptions.length))"
```

Resultado esperado: `0`.

7. Caso negativo, erro comum ou risco que este passo evita.

Mostrar apenas um excerto de retorno pode deixar variaveis inexistentes no ficheiro final.

### Passo 2 - Acrescentar limite parental ao utilizador

1. Objetivo do passo.

Permitir configurar o limite etario maximo do utilizador autenticado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/users/user.validation.js`
    - EDITAR: `backend/src/modules/users/user.service.js`
    - EDITAR: `backend/src/modules/users/user.controller.js`
    - EDITAR: `backend/src/modules/users/user.routes.js`
    - LOCALIZACAO: acrescentar exports e rota

3. Instrucoes concretas.

Adiciona a validacao, servico, controller e rota abaixo.

4. Codigo completo.

Adicionar em `backend/src/modules/users/user.validation.js`:

```js
export function assertParentalSettings(input) {
  const parentalMaxAgeRating = Number(input.parentalMaxAgeRating);

  if (!Number.isInteger(parentalMaxAgeRating) || parentalMaxAgeRating < 0 || parentalMaxAgeRating > 18) {
    const error = new Error("Limite parental invalido.");
    error.statusCode = 400;
    throw error;
  }

  return { parentalMaxAgeRating };
}
```

Adicionar em `backend/src/modules/users/user.service.js`:

```js
import { assertParentalSettings } from "./user.validation.js";

export async function updateParentalSettings(userId, input) {
  const db = await getDb();
  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(userId) },
    { $set: { ...assertParentalSettings(input), updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}
```

Adicionar em `backend/src/modules/users/user.controller.js`:

```js
import { updateParentalSettings } from "./user.service.js";

export async function patchMyParentalSettings(req, res) {
  res.status(200).json({ user: await updateParentalSettings(req.user.id, req.body) });
}
```

Adicionar em `backend/src/modules/users/user.routes.js` antes das rotas admin:

```js
import { patchMyParentalSettings } from "./user.controller.js";

userRouter.patch("/me/parental", requireAuth, asyncHandler(patchMyParentalSettings));
```

5. Explicacao do codigo ou da decisao.

O limite parental pertence ao utilizador autenticado. A rota usa `/me/parental` porque um utilizador comum so altera a propria configuracao.

6. Validacao do passo.

```bash
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"parentalMaxAgeRating":12}' \
  http://localhost:3000/api/users/me/parental
```

Resultado esperado: `200`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o limite for validado apenas no frontend, um pedido direto a API consegue contornar o bloqueio.

### Passo 3 - Criar servico de preferencias de media

1. Objetivo do passo.

Guardar escolhas de legenda, audio e qualidade por utilizador.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/playback/media-preferences.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo. As preferencias guardam valores escolhidos; a escolha de URL continua a ser validada contra o conteudo no playback.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

const DEFAULT_PREFERENCES = {
  subtitleLanguage: "",
  audioLanguage: "pt",
  quality: "720p",
};

function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(userId);
}

function normalizePreferences(input) {
  return {
    subtitleLanguage: String(input.subtitleLanguage ?? "").trim(),
    audioLanguage: String(input.audioLanguage ?? "pt").trim(),
    quality: String(input.quality ?? "720p").trim(),
  };
}

export async function getMediaPreferences(userId) {
  const db = await getDb();
  const preferences = await db.collection("media_preferences").findOne({ userId: asUserObjectId(userId) });
  return preferences?.values ?? DEFAULT_PREFERENCES;
}

export async function saveMediaPreferences(userId, input) {
  const db = await getDb();
  const now = new Date();
  const values = normalizePreferences(input);

  await db.collection("media_preferences").updateOne(
    { userId: asUserObjectId(userId) },
    { $set: { values, updatedAt: now }, $setOnInsert: { userId: asUserObjectId(userId), createdAt: now } },
    { upsert: true },
  );

  return values;
}
```

5. Explicacao do codigo ou da decisao.

Guardar a preferencia nao significa aceitar uma URL. A URL so e escolhida no playback se existir em `qualityOptions` do conteudo.

6. Validacao do passo.

```bash
node -e "import('./src/modules/playback/media-preferences.service.js').then(({ getMediaPreferences }) => console.log(typeof getMediaPreferences))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Construir URLs a partir de `quality` permitiria caminhos inexistentes ou inesperados.

### Passo 4 - Atualizar playback com parental e qualidade segura

1. Objetivo do passo.

Bloquear conteudo acima do limite parental e devolver uma URL de media apenas se existir no catalogo.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/playback/playback.service.js`
    - LOCALIZACAO: acrescentar imports e substituir a montagem de `content`

3. Instrucoes concretas.

Importa `getMediaPreferences`, adiciona as funcoes abaixo e usa-as dentro de `getPlayback`.

4. Codigo completo.

```js
import { getMediaPreferences } from "./media-preferences.service.js";

function resolvePlayableMedia(content, preferences) {
  const selectedQuality = content.qualityOptions?.find((option) => option.value === preferences.quality);

  return {
    playbackUrl: selectedQuality?.playbackUrl ?? content.media.playbackUrl,
    selectedQuality: selectedQuality?.value ?? "",
  };
}

function assertParentalAccess(user, content) {
  const maxAge = Number.isInteger(user?.parentalMaxAgeRating) ? user.parentalMaxAgeRating : 18;

  if (Number(content.ageRating) > maxAge) {
    const error = new Error("Conteudo bloqueado pelo controlo parental.");
    error.statusCode = 403;
    throw error;
  }
}
```

Dentro de `getPlayback`, depois de carregar `content`:

```js
const user = await db.collection("users").findOne({ _id: userObjectId });
assertParentalAccess(user, content);

const preferences = await getMediaPreferences(userId);
const media = resolvePlayableMedia(content, preferences);
```

E a resposta de `content` deve ficar assim:

```js
content: {
  id: String(content._id),
  title: content.title,
  durationSeconds: content.durationSeconds,
  media,
  tracks: content.tracks ?? { subtitles: [], audio: [] },
  qualityOptions: content.qualityOptions ?? [],
  preferences,
},
```

5. Explicacao do codigo ou da decisao.

`resolvePlayableMedia` procura a qualidade no array do conteudo. Se nao existir, volta a `content.media.playbackUrl`.

6. Validacao do passo.

Com utilizador limitado a `12` e conteudo `ageRating: 16`:

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: `403`.

7. Caso negativo, erro comum ou risco que este passo evita.

Uma qualidade inventada como `9999p` nao deve produzir `/media/9999p.mp4`.

### Passo 5 - Criar endpoints de preferencias

1. Objetivo do passo.

Permitir ler e guardar preferencias de media do utilizador autenticado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/playback/playback.controller.js`
    - EDITAR: `backend/src/modules/playback/playback.routes.js`
    - LOCALIZACAO: exports e rotas antes de `/:contentId`

3. Instrucoes concretas.

Adiciona controllers e monta `/preferences` antes da rota dinamica.

4. Codigo completo.

Adicionar em `backend/src/modules/playback/playback.controller.js`:

```js
import { getMediaPreferences, saveMediaPreferences } from "./media-preferences.service.js";

export async function getPlaybackPreferences(req, res) {
  res.status(200).json({ preferences: await getMediaPreferences(req.user.id) });
}

export async function putPlaybackPreferences(req, res) {
  res.status(200).json({ preferences: await saveMediaPreferences(req.user.id, req.body) });
}
```

Trecho final esperado em `backend/src/modules/playback/playback.routes.js`:

```js
import { getPlaybackPreferences, putPlaybackPreferences } from "./playback.controller.js";

playbackRouter.use(requireAuth);
playbackRouter.get("/preferences", asyncHandler(getPlaybackPreferences));
playbackRouter.put("/preferences", asyncHandler(putPlaybackPreferences));
playbackRouter.get("/me/continue-watching", asyncHandler(getContinueWatching));
playbackRouter.get("/:contentId", asyncHandler(getPlaybackByContent));
playbackRouter.put("/:contentId/progress", asyncHandler(putPlaybackProgress));
```

5. Explicacao do codigo ou da decisao.

`/preferences` tambem e rota fixa e precisa ficar antes de `/:contentId`.

6. Validacao do passo.

```bash
curl -i -b /tmp/faithflix.cookies \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"subtitleLanguage":"pt","audioLanguage":"pt","quality":"1080p"}' \
  http://localhost:3000/api/playback/preferences
```

Resultado esperado: `200`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `/preferences` ficar depois de `/:contentId`, o backend tenta tratar `preferences` como id de conteudo.

### Passo 6 - Atualizar cliente frontend de playback

1. Objetivo do passo.

Adicionar metodos para preferencias sem alterar os metodos de progresso.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/playbackApi.js`
    - LOCALIZACAO: objeto completo

3. Instrucoes concretas.

Mantem os metodos do BK anterior e acrescenta `getPreferences` e `savePreferences`.

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
  getPreferences() {
    return apiClient.get("/api/playback/preferences");
  },
  savePreferences(input) {
    return apiClient.put("/api/playback/preferences", input);
  },
};
```

5. Explicacao do codigo ou da decisao.

O cliente continua coerente com `apiClient.put` e nao muda contratos anteriores.

6. Validacao do passo.

```bash
node -e "import('./src/services/api/playbackApi.js').then(({ playbackApi }) => console.log(typeof playbackApi.savePreferences))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Remover `saveProgress` ao editar este ficheiro quebraria o BK anterior.

### Passo 7 - Atualizar player com controlos

1. Objetivo do passo.

Mostrar selects de legenda, audio e qualidade, guardando preferencias e preservando tempo ao trocar qualidade.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/pages/PlaybackPage.jsx`
    - LOCALIZACAO: componente completo atualizado

3. Instrucoes concretas.

Atualiza o componente para gerir `preferences`, `videoSrc` e controlos.

4. Codigo completo.

```jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

export function PlaybackPage() {
  const { contentId } = useParams();
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const resumeAtRef = useRef(0);
  const [playback, setPlayback] = useState(null);
  const [preferences, setPreferences] = useState({ subtitleLanguage: "", audioLanguage: "pt", quality: "" });
  const [videoSrc, setVideoSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    playbackApi.getPlayback(contentId)
      .then((response) => {
        setPlayback(response);
        setPreferences(response.content.preferences);
        setVideoSrc(response.content.media.playbackUrl);
      })
      .catch((requestError) => setError(requestError.message));
  }, [contentId]);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;

    const startAt = resumeAtRef.current || playback?.progress.currentTimeSeconds || 0;
    if (startAt > 0) video.currentTime = startAt;
    resumeAtRef.current = 0;
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

  async function updatePreference(name, value) {
    const nextPreferences = { ...preferences, [name]: value };
    setPreferences(nextPreferences);
    await playbackApi.savePreferences(nextPreferences);

    if (name === "quality" && playback) {
      const selectedQuality = playback.content.qualityOptions.find((option) => option.value === value);
      if (!selectedQuality || !videoRef.current) return;

      resumeAtRef.current = videoRef.current.currentTime;
      setVideoSrc(selectedQuality.playbackUrl);
    }
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
      <div className="player-controls" aria-label="Opcoes de media">
        <label>
          Legendas
          <select value={preferences.subtitleLanguage} onChange={(event) => updatePreference("subtitleLanguage", event.target.value)}>
            <option value="">Sem legendas</option>
            {playback.content.tracks.subtitles.map((track) => (
              <option key={track.language} value={track.language}>{track.label}</option>
            ))}
          </select>
        </label>
        <label>
          Audio
          <select value={preferences.audioLanguage} onChange={(event) => updatePreference("audioLanguage", event.target.value)}>
            {playback.content.tracks.audio.map((track) => (
              <option key={track.language} value={track.language}>{track.label}</option>
            ))}
          </select>
        </label>
        <label>
          Qualidade
          <select value={preferences.quality} onChange={(event) => updatePreference("quality", event.target.value)}>
            <option value="">Automatica</option>
            {playback.content.qualityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <video
        ref={videoRef}
        controls
        data-testid="faithflix-player"
        src={videoSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
      >
        {playback.content.tracks.subtitles.map((track) => (
          <track key={track.language} kind="subtitles" srcLang={track.language} label={track.label} src={track.src} />
        ))}
        O teu browser nao suporta video HTML5.
      </video>
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

Ao trocar qualidade, o componente guarda o tempo atual em `resumeAtRef` e repoe esse tempo quando a nova fonte carrega.

6. Validacao do passo.

Abre `/ver/:contentId`, muda de qualidade aos 20 segundos e confirma que o video continua perto desse tempo.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o player reiniciar sempre em `0`, a troca de qualidade prejudica a experiencia.

### Passo 8 - Validar parental, preferencias e qualidade

1. Objetivo do passo.

Confirmar os tres contratos principais deste BK.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API, UI e MongoDB

3. Instrucoes concretas.

Testa limite parental, preferencias e qualidade inexistente.

4. Codigo completo.

```bash
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"parentalMaxAgeRating":6}' \
  http://localhost:3000/api/users/me/parental

curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID

curl -i -b /tmp/faithflix.cookies \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"subtitleLanguage":"pt","audioLanguage":"pt","quality":"qualidade-inexistente"}' \
  http://localhost:3000/api/playback/preferences
```

5. Explicacao do codigo ou da decisao.

O backend pode guardar a preferencia textual, mas `GET /api/playback/:contentId` so devolve uma URL que venha do catalogo.

6. Validacao do passo.

Resultados esperados:

- Conteudo acima do limite devolve `403`.
- Preferencias devolvem `200`.
- Qualidade inexistente nao altera `media.playbackUrl` para uma URL criada artificialmente.
- Player mostra selects e continua funcional.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a resposta devolver uma URL construida a partir da qualidade inexistente, a regra de seguranca deste BK falhou.

## Snippet tecnico aplicavel

```js
const selectedQuality = content.qualityOptions?.find((option) => option.value === preferences.quality);
const playbackUrl = selectedQuality?.playbackUrl ?? content.media.playbackUrl;
```

## Criterios de aceite (mensuraveis)

- [ ] Catalogo aceita `tracks.subtitles`, `tracks.audio` e `qualityOptions`.
- [ ] `PATCH /api/users/me/parental` valida limite entre `0` e `18`.
- [ ] `GET /api/playback/:contentId` devolve `403` acima do limite parental.
- [ ] `GET/PUT /api/playback/preferences` exige login.
- [ ] Player mostra selects de legenda, audio e qualidade.
- [ ] Troca de qualidade preserva aproximadamente o tempo atual.
- [ ] Qualidade inexistente nao gera URL.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com resposta `403`, resposta de preferencias e screenshot do player com controlos.

## Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `PATCH /api/users/me/parental` com limite valido.
- Resposta `curl` de `GET /api/playback/:contentId` com `403` para conteudo acima do limite.
- Resposta `curl` de `PUT /api/playback/preferences` com preferencias guardadas.
- Screenshot do player com controlos de legenda, audio e qualidade.
- Nota curta a confirmar que qualidade inexistente nao gera URL nova.

## Handoff

O `BK-MF2-07` pode reutilizar `playback_progress` para historico e manter o player como origem dos eventos de visualizacao.

## Proximo BK recomendado

`BK-MF2-07` - Favoritos/watchlist/historico.

## Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
