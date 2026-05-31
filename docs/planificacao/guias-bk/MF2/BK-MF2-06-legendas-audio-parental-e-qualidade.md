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

Adicionar ao player selecao de legendas, audio, qualidade e bloqueio parental basico. Este BK cobre `RF13`, `RF14` e `RF15`.

O aluno deve perceber que estes controlos nao sao apenas botoes de interface: precisam de dados no catalogo, preferencia por utilizador e validacao no backend.

### Tempo estimado

- Rever player e catalogo: 15 min.
- Campos de media e preferencia: 45 min.
- Controlo parental backend: 45 min.
- Controles frontend: 60 min.
- Negativos e evidence: 30 min.

### Conceitos essenciais

- Legendas e audio sao faixas associadas ao conteudo.
- Qualidade e uma opcao de reproducao associada a uma URL.
- Controlo parental no MVP usa `parentalMaxAgeRating` guardado no utilizador.
- A verificacao parental ocorre no backend antes de devolver `playbackUrl`.
- Preferencias sao guardadas por utilizador para manter a experiencia entre sessoes.

### Erros comuns

- Bloquear conteudo apenas no frontend.
- Aceitar uma qualidade que nao existe para o conteudo.
- Alterar `src` do video sem preservar o tempo atual.
- Guardar preferencias sem utilizador autenticado.
- Misturar idade recomendada com role de autorizacao.

### Check de compreensao

- [ ] Sei onde ficam `subtitles`, `audio` e `qualityOptions`.
- [ ] Sei porque o parental precisa de validacao backend.
- [ ] Sei que `role` nao substitui controlo parental.
- [ ] Sei validar uma opcao de qualidade inexistente.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-05` concluido.
- Player React funcional.
- Conteudo tem `ageRating`.
- Utilizador autenticado tem `id`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Catalogo | acrescentar `tracks.subtitles`, `tracks.audio`, `qualityOptions` |
| Utilizador | acrescentar `parentalMaxAgeRating` e preferencias de media |
| Preferencias | `GET/PUT /api/playback/preferences` |
| Parental | `GET /api/playback/:contentId` devolve `403` se `ageRating` exceder limite |
| Player | selects para legenda, audio e qualidade |

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

### Guia de execucao (passo-a-passo)

### Passo 1 - Atualizar validacao de catalogo

`EDITAR backend/src/modules/catalog/catalog.validation.js`

Adicionar validadores:

```js
function mediaTrack(track) {
  return {
    language: String(track.language ?? "").trim(),
    label: String(track.label ?? "").trim(),
    src: String(track.src ?? "").trim(),
  };
}

function qualityOption(option) {
  return {
    label: String(option.label ?? "").trim(),
    value: String(option.value ?? "").trim(),
    playbackUrl: String(option.playbackUrl ?? "").trim(),
  };
}

export function assertMediaOptions(input) {
  return {
    tracks: {
      subtitles: Array.isArray(input.tracks?.subtitles) ? input.tracks.subtitles.map(mediaTrack) : [],
      audio: Array.isArray(input.tracks?.audio) ? input.tracks.audio.map(mediaTrack) : [],
    },
    qualityOptions: Array.isArray(input.qualityOptions) ? input.qualityOptions.map(qualityOption) : [],
  };
}
```

Dentro de `assertCatalogPayload`, juntar:

```js
const mediaOptions = assertMediaOptions(input);

return {
  ...basePayload,
  ...mediaOptions,
};
```

### Passo 2 - Acrescentar limite parental ao perfil

`EDITAR backend/src/modules/users/user.validation.js`

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

`EDITAR backend/src/modules/users/user.service.js`

```js
import { assertParentalSettings } from "./user.validation.js";

export async function updateParentalSettings(userId, input) {
  const db = await getDb();
  const result = await db.collection("users").findOneAndUpdate(
    { _id: assertObjectId(userId) },
    { $set: { ...assertParentalSettings(input), updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return toPublicUser(result);
}
```

Adicionar rota:

```js
userRouter.patch("/me/parental", requireAuth, asyncHandler(async (req, res) => {
  res.status(200).json({ user: await updateParentalSettings(req.user.id, req.body) });
}));
```

### Passo 3 - Validar parental no playback

`EDITAR backend/src/modules/playback/playback.service.js`

No inicio de `getPlayback`, depois de carregar `content`, carregar o utilizador:

```js
const user = await db.collection("users").findOne({ _id: userObjectId });
const maxAge = Number.isInteger(user?.parentalMaxAgeRating) ? user.parentalMaxAgeRating : 18;

if (Number(content.ageRating) > maxAge) {
  const error = new Error("Conteudo bloqueado pelo controlo parental.");
  error.statusCode = 403;
  throw error;
}
```

A resposta de playback deve passar a incluir:

```js
tracks: content.tracks ?? { subtitles: [], audio: [] },
qualityOptions: content.qualityOptions ?? [],
```

### Passo 4 - Criar preferencias de media

`CRIAR backend/src/modules/playback/media-preferences.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

const DEFAULT_PREFERENCES = {
  subtitleLanguage: "",
  audioLanguage: "pt",
  quality: "720p",
};

export async function getMediaPreferences(userId) {
  const db = await getDb();
  const preferences = await db.collection("media_preferences").findOne({ userId: new ObjectId(userId) });
  return preferences?.values ?? DEFAULT_PREFERENCES;
}

export async function saveMediaPreferences(userId, input) {
  const values = {
    subtitleLanguage: String(input.subtitleLanguage ?? "").trim(),
    audioLanguage: String(input.audioLanguage ?? "pt").trim(),
    quality: String(input.quality ?? "720p").trim(),
  };

  const db = await getDb();
  await db.collection("media_preferences").updateOne(
    { userId: new ObjectId(userId) },
    { $set: { values, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );

  return values;
}
```

`EDITAR backend/src/modules/playback/playback.routes.js`

```js
import { getMediaPreferences, saveMediaPreferences } from "./media-preferences.service.js";

playbackRouter.get("/preferences", requireAuth, asyncHandler(async (req, res) => {
  res.status(200).json({ preferences: await getMediaPreferences(req.user.id) });
}));

playbackRouter.put("/preferences", requireAuth, asyncHandler(async (req, res) => {
  res.status(200).json({ preferences: await saveMediaPreferences(req.user.id, req.body) });
}));
```

As rotas `/preferences` devem ficar antes de `/:contentId`.

### Passo 5 - Atualizar cliente frontend

`EDITAR frontend/src/services/api/playbackApi.js`

```js
export const playbackApi = {
  getPlayback(contentId) {
    return apiClient.get(`/api/playback/${contentId}`);
  },
  saveProgress(contentId, payload) {
    return apiClient.put(`/api/playback/${contentId}/progress`, payload);
  },
  getPreferences() {
    return apiClient.get("/api/playback/preferences");
  },
  savePreferences(payload) {
    return apiClient.put("/api/playback/preferences", payload);
  },
};
```

### Passo 6 - Atualizar player com controles

`EDITAR frontend/src/pages/PlaybackPage.jsx`

Adicionar estados:

```jsx
const [preferences, setPreferences] = useState(null);
const [selectedQuality, setSelectedQuality] = useState("");
```

Carregar preferencias:

```jsx
useEffect(() => {
  playbackApi.getPreferences()
    .then((response) => {
      setPreferences(response.preferences);
      setSelectedQuality(response.preferences.quality);
    })
    .catch((requestError) => setError(requestError.message));
}, []);
```

Escolher a URL:

```jsx
const quality = playback.content.qualityOptions.find((option) => option.value === selectedQuality);
const playbackUrl = quality?.playbackUrl ?? playback.content.media.playbackUrl;
```

Renderizar o video:

```jsx
<video ref={videoRef} src={playbackUrl} controls playsInline onTimeUpdate={saveProgress}>
  {playback.content.tracks.subtitles.map((track) => (
    <track key={track.language} kind="subtitles" srcLang={track.language} label={track.label} src={track.src} />
  ))}
</video>
```

Renderizar controles:

```jsx
<label>
  Qualidade
  <select
    value={selectedQuality}
    onChange={(event) => {
      setSelectedQuality(event.target.value);
      playbackApi.savePreferences({ ...preferences, quality: event.target.value });
    }}
  >
    {playback.content.qualityOptions.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
</label>
```

### Passo 7 - Validar backend

Executar:

```bash
curl -i http://localhost:3000/api/playback/preferences
curl -i -X PUT http://localhost:3000/api/playback/preferences \
  -H "Content-Type: application/json" \
  -d '{"subtitleLanguage":"pt","audioLanguage":"pt","quality":"720p"}'
curl -i -X PATCH http://localhost:3000/api/users/me/parental \
  -H "Content-Type: application/json" \
  -d '{"parentalMaxAgeRating":12}'
```

### Passo 8 - Validar negativos minimos

- Conteudo com `ageRating: 16` bloqueia utilizador com `parentalMaxAgeRating: 12`.
- Limite parental fora de `0..18` devolve `400`.
- Preferencia de qualidade inexistente nao deve gerar URL inventada.
- Sem login, preferencias devolvem `401`.
- Legenda sem `src` nao deve quebrar o player.

## Snippet tecnico aplicavel

O ponto central e a verificacao parental no backend:

```js
if (Number(content.ageRating) > maxAge) {
  const error = new Error("Conteudo bloqueado pelo controlo parental.");
  error.statusCode = 403;
  throw error;
}
```

## Criterios de aceite (mensuraveis)

- Conteudos podem ter legendas, audio e qualidades no catalogo.
- Player mostra opcoes de qualidade disponiveis.
- Player renderiza tracks de legenda.
- Preferencias de media ficam guardadas por utilizador.
- Conteudo acima do limite parental devolve `403`.
- Negativos de parental, preferencia e login ficam registados.

## Validacao final

- Confirmar que `BK-MF2-05` continua a guardar progresso.
- Confirmar que mudar qualidade mantem o player funcional.
- Confirmar que controlo parental e aplicado no endpoint de playback.
- Confirmar que a UI nao mostra erro se um conteudo nao tiver legendas.

## Evidence para PR/defesa

- Captura do player com seletor de qualidade.
- Log de `PUT /api/playback/preferences`.
- Log de `PATCH /api/users/me/parental`.
- Log de `403` por bloqueio parental.
- Exemplo de conteudo com `tracks` e `qualityOptions`.

## Handoff

Para `BK-MF2-07`, entregar:

- Player com progresso preservado.
- `playback_progress` intacto.
- Preferencias por utilizador.
- Conteudo bloqueado por parental sem criar historico indevido.

## Proximo BK recomendado

`BK-MF2-07 - Favoritos/watchlist/historico`

## Changelog

- `2026-05-31`: Guia reescrito com media tracks, qualidade, preferencias, controlo parental, frontend e negativos.
