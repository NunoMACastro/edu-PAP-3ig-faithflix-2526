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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais acrescentar selecao de legendas, audio, qualidade e controlo parental basico ao player. A entrega cobre `RF13`, `RF14` e `RF15`.

No fim, deves conseguir explicar porque estes controlos nao sao apenas botoes: eles precisam de dados no catalogo, preferencias por utilizador e validacao no backend antes de devolver a URL de reproducao.

#### Importância

Legendas, audio, qualidade e parental tornam a experiencia mais acessivel e segura. Tambem obrigam a separar tres responsabilidades: catalogo descreve opcoes, utilizador guarda preferencias, backend autoriza acesso.

#### Scope-in

- Acrescentar descritores de `tracks.subtitles`, `tracks.audio` e
  `qualityOptions` ao contrato de playback, sem fontes.
- Acrescentar `parentalMaxAgeRating` ao utilizador.
- Criar endpoints de preferencias de media.
- Validar parental no backend antes de devolver playback.
- Atualizar player com selects de legenda, audio e qualidade.
- Garantir que qualidade inexistente nao gera URL.

#### Scope-out

- Controlo parental por PIN.
- Perfis infantis completos.
- Transcodificacao dinamica.
- Upload de ficheiros `.vtt`.
- Deteccao automatica de idioma.

#### Estado antes e depois

- Antes: o player tem uma fonte autorizada, mas não persiste preferências nem
  aplica descritores de idioma, qualidade e limite parental.
- Depois: o backend valida parental e seleciona uma única fonte; o frontend
  escolhe apenas valores metadata-only e volta a pedir playback.

#### Pré-requisitos

- `BK-MF2-05` concluído.
- Player React funcional em `/ver/:contentId` com fixtures sintéticas locais,
  sem pressupor vídeo, 4K ou entrega externa reais.
- Conteúdo com `ageRating` e utilizador autenticado com `id`.

#### Glossário

- `Subtitle track`: faixa de legendas.
- `Audio track`: opcao de audio.
- `Quality option`: descritor de uma qualidade; a fonte correspondente permanece interna ao backend.
- `Parental max age rating`: limite etario maximo permitido para o utilizador.
- `Media preferences`: escolhas persistidas por utilizador.

#### Conceitos teóricos essenciais

- O catalogo declara as opcoes disponiveis; o frontend nao inventa opcoes.
- O parental e verificado no backend em `GET /api/playback/:contentId`.
- Uma preferencia guardada pode nao existir num conteudo especifico; nesse caso o player usa a opcao base.
- `role` nao substitui limite parental.
- Trocar qualidade deve preservar o tempo atual do video.
- O frontend escolhe valores de preferência, não URLs; o backend volta a resolver a fonte autorizada.

##### Tempo estimado

- Rever catalogo e player: 20 min.
- Atualizar validacao de catalogo: 45 min.
- Backend parental e preferencias: 75 min.
- Atualizar player React: 70 min.
- Validacao e evidence: 35 min.

##### Erros comuns

- Bloquear conteudo apenas no frontend.
- Aceitar qualquer qualidade e construir uma URL a partir do texto.
- Perder o tempo atual ao trocar qualidade.
- Guardar preferencias sem login.
- Confundir classificacao etaria com role.

##### Check de compreensão

- [ ] Sei onde ficam `subtitles`, `audio` e `qualityOptions`.
- [ ] Sei porque parental precisa de validacao backend.
- [ ] Sei porque uma qualidade inexistente nao pode gerar URL.
- [ ] Sei testar troca de qualidade preservando tempo.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Media metadata-only | `tracks.subtitles`, `tracks.audio`, `qualityOptions` apenas como descritores sem fontes |
| Utilizador | `parentalMaxAgeRating` |
| Preferencias | `GET /api/playback/preferences`, `PUT /api/playback/preferences` |
| Parental | `GET /api/playback/:contentId` devolve `403` se `ageRating` exceder limite |
| Player | selects para legenda, audio e qualidade com aplicacao no elemento `<video>` |
| Resposta pública | uma única `content.source = { url, protocol, mimeType }`; listas sem fontes |
| Risco bloqueado | qualidade inexistente ou não autorizada não cria nem revela URL de media |

##### Modelo de descritores expostos

O catálogo administrativo não recebe nem edita fontes. Quando o playback
autenticado descreve opções disponíveis, usa apenas o modelo metadata-only
seguinte:

```js
// Estes valores são descritores de UI; nenhuma faixa ou qualidade transporta `src` ou URL.
const publicMediaDescriptors = {
  tracks: {
    subtitles: [
      { language: "pt", label: "Português" }
    ],
    audio: [
      { language: "pt", label: "Português" },
      { language: "en", label: "English" }
    ]
  },
  qualityOptions: [
    { label: "720p", value: "720p", locked: false, selected: true },
    { label: "1080p", value: "1080p", locked: true, selected: false }
  ]
};
```

As fontes continuam exclusivamente no storage interno criado por ingestão fora
deste BK. A administração vê apenas `mediaStatus`/`isPlayable`; o playback
seleciona internamente uma variante e devolve uma única `content.source`.

##### Decisões técnicas

- `CANONICO`: parental e validado no backend.
- `CANONICO`: preferencias pertencem ao utilizador autenticado.
- `CANONICO`: listas de áudio, legendas e qualidade são reconstruídas por
  allowlist; nunca transportam aliases de fonte.
- `DERIVADO`: fontes permanecem internas ao fluxo de ingestão; só a fonte
  canónica selecionada pode sair pelo playback autenticado.
- `DERIVADO`: se a preferência não existir ou não estiver autorizada, o backend escolhe um fallback permitido; nunca aceita uma URL do cliente.

##### Contrato de playback e preferências

- O controlo parental é aplicado no backend antes de qualquer fonte de reprodução.
- `GET /api/playback/:contentId` devolve exatamente uma fonte selecionada em
  `content.source = { url, protocol, mimeType }`, com `protocol` limitado a
  `progressive|hls|dash`.
- `tracks` públicas expõem apenas `language`/`label`. `qualityOptions` públicas
  expõem `value`, `label`, `locked`, `selected` e, opcionalmente,
  `requiredTier`/`lockedReason`. Nenhuma lista transporta `url`, `playbackUrl`
  ou `src`.
- Alterar legenda, áudio ou qualidade significa guardar a preferência e voltar a pedir
  playback. O backend volta a selecionar `content.source`; o frontend não escolhe,
  constrói nem conserva uma fonte de opção localmente.
- Sem uma faixa externa autorizada no DTO, o player só pode ativar legendas já
  incorporadas no media por `TextTrack`; não deve reconstruir endpoints VTT.
- Conteúdo sem media pronta devolve `409 MEDIA_NOT_READY`; preferência inexistente
  não pode fabricar uma URL.

#### Ficheiros a criar/editar/rever

- Rever validação e serializers do catálogo sem acrescentar fontes públicas.
- Editar utilizador, preferências e autorização em `backend/src/modules/`.
- Editar playback para parental e seleção server-side de uma única fonte.
- Editar cliente de playback e player React para descritores metadata-only.
- Criar testes de parental, preferências, fallback e ausência de URLs nas listas.

#### Tutorial técnico linear

### Passo 1 - Acrescentar validação de descritores metadata-only

1. Objetivo funcional do passo no contexto da app.

Adicionar validadores fechados para idiomas, labels e qualidades sem remover ou
alterar qualquer export criado pelo `BK-MF2-03`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/catalog/catalog.validation.js`
    - LOCALIZACAO: acrescentar os exports abaixo no fim do ficheiro existente; não substituir o ficheiro

3. Instruções do que fazer.

Preserva integralmente `assertCatalogPayload`, `assertCatalogUpdatePayload`,
`assertExpectedVersion`, `parseAdminCatalogPagination`,
`parsePublicCatalogFilters`, `assertStatus`, `assertTaxonomyPayload` e os
restantes helpers do `BK-MF2-03`. Acrescenta apenas o bloco seguinte. A
mutação editorial normal continua a recusar `tracks` e `qualityOptions`; este
validador fica disponível para um fluxo privilegiado de ingestão de descritores,
que continua separado das fontes de media.

4. Código completo, correto e integrado com a app final.

Adicionar no fim de `backend/src/modules/catalog/catalog.validation.js`:

```js
export const MEDIA_DESCRIPTOR_LANGUAGES = Object.freeze(["pt", "en"]);
export const MEDIA_DESCRIPTOR_QUALITIES = Object.freeze([
  "480p",
  "720p",
  "1080p",
  "2160p",
  "4k",
]);
const SOURCE_FIELDS = Object.freeze([
  "media",
  "source",
  "url",
  "src",
  "playbackUrl",
]);

function mediaDescriptorError(message, details = undefined) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "MEDIA_DESCRIPTOR_INVALID";
  error.details = details;
  return error;
}

function assertMetadataOnly(value, context) {
  const sourceField = SOURCE_FIELDS.find((field) =>
    Object.prototype.hasOwnProperty.call(value, field),
  );
  if (sourceField) {
    throw mediaDescriptorError(
      `Fontes de media nao pertencem a ${context}.`,
      { field: sourceField },
    );
  }
}

function assertExactFields(value, allowedFields, context) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw mediaDescriptorError(`${context} invalido.`);
  }

  assertMetadataOnly(value, context);
  const unexpected = Object.keys(value).find(
    (field) => !allowedFields.includes(field),
  );
  if (unexpected) {
    // A allowlist rejeita também aliases de fonte como url, src e source.
    throw mediaDescriptorError(
      `Campo ${unexpected} nao permitido em ${context}.`,
      { field: unexpected },
    );
  }
}

function descriptorText(value, field, min, max) {
  if (typeof value !== "string") {
    throw mediaDescriptorError(`${field} tem de ser uma string.`);
  }

  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw mediaDescriptorError(`${field} invalido.`);
  }

  return normalized;
}

function mediaTrackDescriptor(track) {
  assertExactFields(track, ["language", "label"], "faixa");
  const language = descriptorText(track.language, "language", 2, 12);

  if (!MEDIA_DESCRIPTOR_LANGUAGES.includes(language)) {
    throw mediaDescriptorError("Idioma de faixa invalido.");
  }

  return {
    language,
    label: descriptorText(track.label, "label", 2, 80),
  };
}

function qualityDescriptor(option) {
  assertExactFields(option, ["value", "label"], "qualidade");
  const value = descriptorText(option.value, "value", 2, 12);

  if (!MEDIA_DESCRIPTOR_QUALITIES.includes(value)) {
    throw mediaDescriptorError("Valor de qualidade invalido.");
  }

  return {
    value,
    label: descriptorText(option.label, "label", 2, 40),
  };
}

function descriptorList(value, mapper, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 32) {
    throw mediaDescriptorError(`${field} invalido.`);
  }
  return value.map(mapper);
}

export function assertMediaDescriptorPayload(input = {}) {
  assertExactFields(input, ["tracks", "qualityOptions"], "descritores media");
  const tracks = input.tracks ?? {};
  assertExactFields(tracks, ["subtitles", "audio"], "tracks");

  return {
    tracks: {
      subtitles: descriptorList(
        tracks.subtitles,
        mediaTrackDescriptor,
        "subtitles",
      ),
      audio: descriptorList(tracks.audio, mediaTrackDescriptor, "audio"),
    },
    qualityOptions: descriptorList(
      input.qualityOptions,
      qualityDescriptor,
      "qualityOptions",
    ),
  };
}

// Alias explícito para chamadas já descritas neste macrofluxo.
export const assertMediaOptions = assertMediaDescriptorPayload;
```

5. Explicação do código.

Cada nível é reconstruído por allowlist e exige tipos reais. Não há spread de
input, coerção de arrays/booleanos nem remoção tardia de campos: `media`,
`source`, `url`, `src`, `playbackUrl` e qualquer chave desconhecida são
recusados com `400 MEDIA_DESCRIPTOR_INVALID`. Os enums são fechados e as
listas têm limite. O bloco é aditivo, por isso paginação, CAS, taxonomias e a
barreira editorial do BK anterior continuam exportados.

6. Validação do passo.

```bash
node -e "import('./src/modules/catalog/catalog.validation.js').then(({ assertMediaOptions }) => console.log(assertMediaOptions({ tracks: { subtitles: [{ language: 'pt', label: 'Português' }] }, qualityOptions: [{ value: '720p', label: 'HD' }] }).qualityOptions.length))"
```

Resultado esperado: `1`.

7. Cenário negativo/erro esperado.

Um descritor `{ language: "pt", label: "PT", src: "/legendas.vtt" }`, uma
qualidade `"9999p"`, um campo desconhecido ou um array com mais de 32 entradas
é recusado com status `400`; nunca pode chegar ao service nem produzir `200`.

### Passo 2 - Acrescentar limite parental ao utilizador

1. Objetivo funcional do passo no contexto da app.

Permitir configurar o limite etario maximo do utilizador autenticado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/users/user.validation.js`
    - EDITAR: `backend/src/modules/users/user.service.js`
    - EDITAR: `backend/src/modules/users/user.controller.js`
    - EDITAR: `backend/src/modules/users/user.routes.js`
    - LOCALIZACAO: acrescentar exports e rota

3. Instruções do que fazer.

Adiciona a validacao, servico, controller e rota abaixo.

4. Código completo, correto e integrado com a app final.

Adicionar em `backend/src/modules/users/user.validation.js`:

```js
export function assertParentalSettings(input) {
  // Tipo e intervalo são validados sem coerção: vazio, string ou decimal continuam inválidos.
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("O body tem de ser um objeto JSON.");
    error.statusCode = 400;
    throw error;
  }

  const { parentalMaxAgeRating } = input;
  // O limite fechado 0..18 evita que classificações fora do domínio desativem o filtro parental.

  if (
    typeof parentalMaxAgeRating !== "number"
    || !Number.isInteger(parentalMaxAgeRating)
    || parentalMaxAgeRating < 0
    || parentalMaxAgeRating > 18
  ) {
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
  // Validar antes do `$set` garante que um payload inválido não produz escrita parcial.
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

5. Explicação do código.

O limite parental pertence ao utilizador autenticado. A rota usa `/me/parental` porque um utilizador comum so altera a propria configuracao.

6. Validação do passo.

```bash
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"parentalMaxAgeRating":12}' \
  http://localhost:3000/api/users/me/parental
```

Resultado esperado: `200`.

7. Cenário negativo/erro esperado.

Se o limite for validado apenas no frontend, um pedido direto a API consegue contornar o bloqueio.

### Passo 3 - Criar serviço de preferências de media

1. Objetivo funcional do passo no contexto da app.

Guardar escolhas fechadas de legenda, áudio e qualidade por utilizador, sem
aceitar coerções, campos desconhecidos ou valores inventados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/playback/media-preferences.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instruções do que fazer.

Cria o ficheiro abaixo. As preferências guardam apenas valores pertencentes às
allowlists canónicas; nunca guardam URLs. Dados legacy inválidos são lidos com
defaults seguros e um índice único garante um documento por utilizador.

4. Código completo, correto e integrado com a app final.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

export const MEDIA_PREFERENCE_FIELDS = Object.freeze([
  "subtitleLanguage",
  "audioLanguage",
  "quality",
]);
export const MEDIA_LANGUAGE_VALUES = Object.freeze(["", "pt", "en"]);
export const MEDIA_QUALITY_VALUES = Object.freeze([
  "",
  "480p",
  "720p",
  "1080p",
  "2160p",
  "4k",
]);
export const DEFAULT_PREFERENCES = Object.freeze({
  subtitleLanguage: "",
  audioLanguage: "pt",
  quality: "720p",
});

function preferenceError(message, details = undefined) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "MEDIA_PREFERENCE_INVALID";
  error.details = details;
  return error;
}

function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    throw preferenceError("Utilizador invalido.");
  }
  return new ObjectId(userId);
}

export function assertMediaPreferences(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw preferenceError("Preferencias media invalidas.");
  }

  const unknownField = Object.keys(input).find(
    (field) => !MEDIA_PREFERENCE_FIELDS.includes(field),
  );
  if (unknownField) {
    throw preferenceError(
      "Campo de preferencias media invalido.",
      { field: unknownField },
    );
  }

  const values = {
    subtitleLanguage:
      input.subtitleLanguage ?? DEFAULT_PREFERENCES.subtitleLanguage,
    audioLanguage: input.audioLanguage ?? DEFAULT_PREFERENCES.audioLanguage,
    quality: input.quality ?? DEFAULT_PREFERENCES.quality,
  };

  // Não há String(...): booleanos, números e arrays são sempre inválidos.
  for (const field of ["subtitleLanguage", "audioLanguage"]) {
    if (
      typeof values[field] !== "string"
      || !MEDIA_LANGUAGE_VALUES.includes(values[field])
    ) {
      throw preferenceError(`${field} invalido.`);
    }
  }

  if (
    typeof values.quality !== "string"
    || !MEDIA_QUALITY_VALUES.includes(values.quality)
  ) {
    throw preferenceError("Qualidade media invalida.");
  }

  return values;
}

function safeStoredPreferences(value) {
  try {
    return assertMediaPreferences(value);
  } catch {
    // Persistência legacy malformada nunca alarga o contrato de playback.
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function ensureMediaPreferenceIndexes() {
  const db = await getDb();
  await db.collection("media_preferences").createIndex(
    { userId: 1 },
    { unique: true },
  );
}

export async function getMediaPreferences(userId) {
  const db = await getDb();
  const preferences = await db.collection("media_preferences").findOne({
    userId: asUserObjectId(userId),
  });

  return preferences?.values
    ? safeStoredPreferences(preferences.values)
    : { ...DEFAULT_PREFERENCES };
}

export async function saveMediaPreferences(userId, input) {
  const values = assertMediaPreferences(input);
  const userObjectId = asUserObjectId(userId);
  await ensureMediaPreferenceIndexes();

  const db = await getDb();
  const now = new Date();
  await db.collection("media_preferences").updateOne(
    { userId: userObjectId },
    {
      $set: { values, updatedAt: now },
      $setOnInsert: { userId: userObjectId, createdAt: now },
    },
    { upsert: true },
  );

  return values;
}
```

5. Explicação do código.

A allowlist fecha campos e valores; `false`, `720`, `"es"`, `"auto"` e
`"9999p"` não são convertidos nem persistidos. Uma preferência válida não é
uma autorização de media: o playback continua a cruzá-la com variantes internas
e devolve apenas `content.source`. O índice único evita preferências duplicadas
por utilizador e a leitura legacy falha de forma segura para defaults.

6. Validação do passo.

```bash
node -e "import('./src/modules/playback/media-preferences.service.js').then(({ assertMediaPreferences }) => console.log(assertMediaPreferences({ subtitleLanguage: 'pt', audioLanguage: 'en', quality: '1080p' }).quality))"
```

Resultado esperado: `1080p`.

7. Cenário negativo/erro esperado.

`assertMediaPreferences({ audioLanguage: "es", quality: false })` lança um erro
com status `400` antes de qualquer escrita. Esse payload nunca pode ser
normalizado para defaults nem receber resposta `200`.

### Passo 4 - Atualizar playback com parental e qualidade segura

1. Objetivo funcional do passo no contexto da app.

Bloquear conteúdo acima do limite parental e devolver uma única fonte canónica
apenas quando existe uma variante interna válida.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/playback/playback.service.js`
    - LOCALIZACAO: acrescentar imports e substituir a montagem de `content`

3. Instruções do que fazer.

Importa `getMediaPreferences`, adiciona os helpers abaixo e substitui
cumulativamente apenas o `getPlayback` de `BK-MF2-05` pela versão final deste
passo. Mantém `loadEligibleContent`, `asObjectId`, `publicProgress` e os restantes
exports do módulo; não deixes fragmentos livres fora da função.

4. Código completo, correto e integrado com a app final.

```js
import { canonicalMediaSource } from "../catalog/catalog-media.js";
import { getMediaPreferences } from "./media-preferences.service.js";

function mediaNotReadyError() {
  const error = new Error("Video ainda nao disponivel.");
  error.statusCode = 409;
  error.code = "MEDIA_NOT_READY";
  return error;
}

// A allowlist devolve apenas idioma e label, removendo fontes internas das faixas.
function publicTracks(tracks = {}) {
  const describe = (track) => ({
    language: typeof track?.language === "string" ? track.language : "",
    label: typeof track?.label === "string" ? track.label : "",
  });
  const safeDescriptions = (value) => (Array.isArray(value) ? value : [])
    .map(describe)
    .filter((track) => track.language && track.label);

  return {
    subtitles: safeDescriptions(tracks.subtitles),
    audio: safeDescriptions(tracks.audio),
  };
}

function publicQualityOptions(options, selectedQuality) {
  return (Array.isArray(options) ? options : [])
    .filter(
      (option) =>
        typeof option?.value === "string" &&
        typeof option?.label === "string",
    )
    .map((option) => ({
      value: option.value,
      label: option.label,
      locked: option.locked === true,
      selected: option.locked !== true && option.value === selectedQuality,
      ...(typeof option.requiredTier === "string"
        ? { requiredTier: option.requiredTier }
        : {}),
      ...(typeof option.lockedReason === "string"
        ? { lockedReason: option.lockedReason }
        : {}),
    }));
}

// Uma flag `locked` é uma decisão de autorização, não apenas uma label de UI.
function canonicalUnlockedSource(candidate) {
  return candidate?.locked === true ? null : canonicalMediaSource(candidate);
}

// O backend resolve a única fonte autorizada; o browser recebe opções sem URLs alternativas.
function resolvePlayableMedia(content, preferences) {
  const internalQualityOptions = Array.isArray(content.qualityOptions)
    ? content.qualityOptions
    : [];
  const internalAudioTracks = Array.isArray(content.tracks?.audio)
    ? content.tracks.audio
    : [];
  const qualityCandidates = internalQualityOptions
    // Excluir antes da preferência e do fallback impede que uma opção locked
    // seja escolhida por valor ou por posição no array.
    .filter((option) => option?.locked !== true)
    .map((option) => ({ option, source: canonicalUnlockedSource(option) }))
    .filter(({ source }) => source);
  const preferredQuality = qualityCandidates.find(
    ({ option }) => option.value === preferences.quality,
  );
  const selectedQuality = preferredQuality ?? qualityCandidates.at(-1);
  const selectedAudio = internalAudioTracks
    .map((track) => ({ track, source: canonicalUnlockedSource(track) }))
    .find(
      ({ track, source }) =>
        source && track.language === preferences.audioLanguage,
  );
  const source =
    selectedAudio?.source ??
    selectedQuality?.source ??
    canonicalUnlockedSource(content.media);

  return {
    source,
    selectedAudioLanguage: selectedAudio?.track?.language ?? "",
    selectedQuality: selectedQuality?.option?.value ?? "",
    qualityOptions: publicQualityOptions(
      internalQualityOptions,
      selectedQuality?.option?.value ?? "",
    ),
  };
}

function assertParentalAccess(user, content) {
  const storedMaxAge = user?.parentalMaxAgeRating;
  const maxAge = storedMaxAge === undefined
    ? 18
    : Number.isInteger(storedMaxAge) && storedMaxAge >= 0 && storedMaxAge <= 18
      ? storedMaxAge
      : 0;
  const contentAge = content?.ageRating;

  // Classificação ausente/malformada falha fechada em vez de produzir NaN permissivo.
  if (!Number.isInteger(contentAge) || contentAge < 0 || contentAge > 18) {
    const error = new Error("Conteudo sem classificacao etaria valida.");
    error.statusCode = 403;
    error.code = "PARENTAL_CLASSIFICATION_INVALID";
    throw error;
  }

  if (contentAge > maxAge) {
    const error = new Error("Conteudo bloqueado pelo controlo parental.");
    error.statusCode = 403;
    error.code = "PARENTAL_BLOCKED";
    throw error;
  }
}
```

No mesmo bloco do ficheiro, usa esta implementação completa e copiável. É uma
extensão do contrato MF2-05: preserva a validação comum de publicação,
entitlement parental/media-ready e a retoma de progresso, acrescentando apenas
preferências e a variante canónica selecionada:

```js
export async function getPlayback(contentId, userId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const { content, user } = await loadEligibleContent(
    db,
    contentObjectId,
    userObjectId,
  );

  // A extensão reutiliza a fronteira segura e não volta a consultar conteúdo por fora.
  assertParentalAccess(user, content);
  const preferences = await getMediaPreferences(userId);
  const selectedMedia = resolvePlayableMedia(content, preferences);
  if (!selectedMedia.source) throw mediaNotReadyError();

  // A retoma MF2-05 permanece no mesmo envelope de resposta.
  const progress = await db.collection("playback_progress").findOne({
    userId: userObjectId,
    contentId: contentObjectId,
  });

  return {
    content: {
      id: String(content._id),
      title: content.title,
      durationSeconds: content.durationSeconds,
      mediaStatus: "ready",
      isPlayable: true,
      // O backend publica uma fonte; opções e faixas são descritores sem URL.
      source: selectedMedia.source,
      selectedAudioLanguage: selectedMedia.selectedAudioLanguage,
      selectedQuality: selectedMedia.selectedQuality,
      tracks: publicTracks(content.tracks),
      qualityOptions: selectedMedia.qualityOptions,
      preferences,
    },
    progress: publicProgress(progress, content.durationSeconds),
  };
}
```

5. Explicação do código.

`resolvePlayableMedia` elimina primeiro qualquer candidato com `locked: true`
e só depois procura a fonte de áudio escolhida ou uma qualidade de fallback. A
mesma regra cobre `content.media`, pelo que nenhuma das três vias pode publicar
uma fonte bloqueada em `content.source`. As faixas e opções são reconstruídas
por allowlist, não por remoção parcial de campos. Se não existir fonte canónica
e desbloqueada, o service devolve `409 MEDIA_NOT_READY`.

6. Validação do passo.

Com utilizador limitado a `12` e conteudo `ageRating: 16`:

```bash
curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID
```

Resultado esperado: `403`.

7. Cenário negativo/erro esperado.

Uma qualidade inventada como `9999p` ou um audio inexistente nao devem produzir uma URL criada a partir do texto da preferencia.

### Passo 5 - Criar endpoints de preferencias

1. Objetivo funcional do passo no contexto da app.

Permitir ler e guardar preferencias de media do utilizador autenticado.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/playback/playback.controller.js`
    - EDITAR: `backend/src/modules/playback/playback.routes.js`
    - LOCALIZACAO: exports e rotas antes de `/:contentId`

3. Instruções do que fazer.

Adiciona controllers e monta `/preferences` antes da rota dinamica.

4. Código completo, correto e integrado com a app final.

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

5. Explicação do código.

`/preferences` tambem e rota fixa e precisa ficar antes de `/:contentId`.

6. Validação do passo.

```bash
curl -i -b /tmp/faithflix.cookies \
  -X PUT \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"subtitleLanguage":"pt","audioLanguage":"pt","quality":"1080p"}' \
  http://localhost:3000/api/playback/preferences
```

Resultado esperado: `200`.

7. Cenário negativo/erro esperado.

Envia um segundo pedido com `{"subtitleLanguage":false,"audioLanguage":"es","quality":"9999p"}`. A allowlist recusa-o com `400 MEDIA_PREFERENCE_INVALID`; o service não escreve e nunca responde `200`. Se `/preferences` ficar depois de `/:contentId`, o backend tenta ainda tratar `preferences` como id de conteudo.

### Passo 6 - Atualizar cliente frontend de playback

1. Objetivo funcional do passo no contexto da app.

Adicionar metodos para preferencias sem alterar os metodos de progresso.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/playbackApi.js`
    - LOCALIZACAO: objeto completo

3. Instruções do que fazer.

Mantem os metodos do BK anterior e acrescenta `getPreferences` e `savePreferences`.

4. Código completo, correto e integrado com a app final.

```js
import { apiClient } from "./apiClient.js";

function contentPath(contentId) {
  // O ID tem de ser uma string real e permanece num único segmento da rota.
  if (typeof contentId !== "string" || contentId.length === 0) {
    throw new TypeError("Conteudo invalido.");
  }
  return encodeURIComponent(contentId);
}

function continueWatchingQuery(pagination = {}) {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 12;
  if (
    !Number.isSafeInteger(page)
    || page < 1
    || !Number.isSafeInteger(limit)
    || limit < 1
    || limit > 50
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
      typeof currentTimeSeconds !== "number"
      || !Number.isFinite(currentTimeSeconds)
      || currentTimeSeconds < 0
    ) {
      throw new TypeError("Progresso invalido.");
    }

    return apiClient.put(
      `/api/playback/${contentPath(contentId)}/progress`,
      { currentTimeSeconds },
      options,
    );
  },
  listContinueWatching(pagination = {}, options = {}) {
    // Paginação e AbortSignal mantêm o contrato anti-stale do BK anterior.
    return apiClient.get(
      `/api/playback/me/continue-watching?${continueWatchingQuery(pagination)}`,
      options,
    );
  },
  getPreferences(options = {}) {
    return apiClient.get("/api/playback/preferences", options);
  },
  savePreferences(input, options = {}) {
    // O `apiClient` acrescenta CSRF às mutações autenticadas e propaga o AbortSignal recebido.
    return apiClient.put("/api/playback/preferences", input, options);
  },
};
```

5. Explicação do código.

O cliente continua coerente com `apiClient.put` e acrescenta preferências sem
alterar os contratos anteriores: IDs e progresso continuam validados,
`listContinueWatching(pagination, options)` conserva paginação até 50 e todos os
métodos que leem ou escrevem aceitam as opções usadas para propagar
`AbortSignal`.

6. Validação do passo.

```bash
node -e "import('./src/services/api/playbackApi.js').then(({ playbackApi }) => console.log(typeof playbackApi.savePreferences))"
```

Resultado esperado: `function`.

7. Cenário negativo/erro esperado.

Remover `saveProgress` ao editar este ficheiro quebraria o BK anterior.

### Passo 7 - Atualizar player com controlos

1. Objetivo funcional do passo no contexto da app.

Mostrar selects de legenda, áudio e qualidade, persistir a preferência e pedir ao
backend uma nova decisão canónica sem escolher fontes no browser.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/pages/PlaybackPage.jsx`
    - LOCALIZACAO: estado, atualização de preferências e controlos do componente

3. Instruções do que fazer.

Mantém o adapter, retry e fila de progresso do `BK-MF2-05`. Acrescenta os
refs/estados/controlos e substitui apenas os effects `mountedRef`/primeiro
`getPlayback` e `handleLoadedMetadata` pelas composições indicadas. Não deixes
as versões antigas em paralelo. Não cries `videoSrc`, não atribuas
`content.source.url` no JSX e não montes elementos `<track src>` a partir dos
descritores públicos.

4. Código completo, correto e integrado com a app final.

```jsx
const EMPTY_PREFERENCES = Object.freeze({
  subtitleLanguage: "",
  audioLanguage: "",
  quality: "",
});

function canonicalPreferences(response) {
  const content = response.content;
  const saved = content.preferences ?? EMPTY_PREFERENCES;

  return {
    subtitleLanguage: saved.subtitleLanguage ?? "",
    audioLanguage: content.selectedAudioLanguage ?? saved.audioLanguage ?? "",
    quality: content.selectedQuality ?? saved.quality ?? "",
  };
}

function applySubtitlePreference(video, language) {
  Array.from(video?.textTracks ?? []).forEach((track) => {
    track.mode = language && track.language === language ? "showing" : "disabled";
  });
}

// Acrescentar junto dos refs/estados existentes de PlaybackPage.
const contentIdRef = useRef(contentId);
const playbackRequestVersionRef = useRef(0);
const preferenceVersionRef = useRef(0);
const preferenceOperationRef = useRef(null);
const preferenceStateRef = useRef(EMPTY_PREFERENCES);
const [preferences, setPreferences] = useState(EMPTY_PREFERENCES);
const [preferenceBusy, setPreferenceBusy] = useState("");
const [preferenceError, setPreferenceError] = useState("");

// A atribuição em render torna uma resposta antiga inválida antes de os effects limparem.
contentIdRef.current = contentId;

// Substituir o effect `mountedRef` de BK-MF2-05 por este cleanup cumulativo.
useEffect(() => {
  mountedRef.current = true;
  return () => {
    mountedRef.current = false;
    preferenceVersionRef.current += 1;
    preferenceOperationRef.current?.controller.abort();
    preferenceOperationRef.current = null;
  };
}, []);

// Substituir o effect que faz o primeiro getPlayback em BK-MF2-05.
useEffect(() => {
  const controller = new AbortController();
  const requestedContentId = contentId;
  const requestVersion = ++playbackRequestVersionRef.current;

  // Troca/retry invalida de imediato qualquer PUT/refetch de preferências anterior.
  preferenceVersionRef.current += 1;
  preferenceOperationRef.current?.controller.abort();
  preferenceOperationRef.current = null;
  preferenceStateRef.current = EMPTY_PREFERENCES;
  setPreferences(EMPTY_PREFERENCES);
  setPreferenceBusy("");
  setPreferenceError("");
  setPlayback(null);
  setRequestError(null);

  playbackApi.getPlayback(requestedContentId, { signal: controller.signal })
    .then((response) => {
      const current =
        mountedRef.current &&
        !controller.signal.aborted &&
        contentIdRef.current === requestedContentId &&
        playbackRequestVersionRef.current === requestVersion;
      if (!current) return;

      const initialPreferences = canonicalPreferences(response);
      preferenceStateRef.current = initialPreferences;
      setPreferences(initialPreferences);
      setPlayback(response);
    })
    .catch((error) => {
      const current =
        mountedRef.current &&
        !controller.signal.aborted &&
        contentIdRef.current === requestedContentId &&
        playbackRequestVersionRef.current === requestVersion;
      if (current && error?.code !== "REQUEST_ABORTED") setRequestError(error);
    });

  return () => controller.abort();
}, [contentId, retryVersion]);

function isCurrentPreferenceOperation(operation) {
  return (
    mountedRef.current &&
    !operation.controller.signal.aborted &&
    contentIdRef.current === operation.contentId &&
    preferenceVersionRef.current === operation.version &&
    preferenceOperationRef.current === operation
  );
}

async function updatePreference(name, value) {
  // O ref reserva sincronamente; dois eventos no mesmo tick nunca iniciam dois PUT.
  if (preferenceOperationRef.current) return;

  const previousPreferences = preferenceStateRef.current;
  if (previousPreferences[name] === value) return;

  const nextPreferences = { ...previousPreferences, [name]: value };
  const operation = {
    contentId: contentIdRef.current,
    controller: new AbortController(),
    version: ++preferenceVersionRef.current,
  };
  preferenceOperationRef.current = operation;
  preferenceStateRef.current = nextPreferences;
  setPreferenceBusy(name);
  setPreferenceError("");
  setPreferences(nextPreferences);

  try {
    resumeAtRef.current = safePosition(
      videoRef.current?.currentTime ?? lastPositionRef.current,
    );
    await playbackApi.savePreferences(nextPreferences, {
      signal: operation.controller.signal,
    });
    if (!isCurrentPreferenceOperation(operation)) return;

    const refreshVersion = ++playbackRequestVersionRef.current;
    const refreshedPlayback = await playbackApi.getPlayback(
      operation.contentId,
      { signal: operation.controller.signal },
    );
    if (
      !isCurrentPreferenceOperation(operation) ||
      playbackRequestVersionRef.current !== refreshVersion
    ) {
      return;
    }

    const confirmedPreferences = canonicalPreferences(refreshedPlayback);
    preferenceStateRef.current = confirmedPreferences;
    setPlayback(refreshedPlayback);
    setPreferences(confirmedPreferences);
    applySubtitlePreference(
      videoRef.current,
      confirmedPreferences.subtitleLanguage,
    );
    // O effect do BK-MF2-05 observa refreshedPlayback.content.source,
    // destrói o adapter anterior e liga a fonte escolhida pelo backend.
  } catch (error) {
    if (
      !isCurrentPreferenceOperation(operation) ||
      error?.code === "REQUEST_ABORTED" ||
      error?.name === "AbortError"
    ) {
      return;
    }

    preferenceStateRef.current = previousPreferences;
    setPreferences(previousPreferences);
    setPreferenceError(toUserMessage(error));
  } finally {
    if (preferenceOperationRef.current === operation) {
      preferenceOperationRef.current = null;
      if (
        mountedRef.current &&
        contentIdRef.current === operation.contentId
      ) {
        setPreferenceBusy("");
      }
    }
  }
}

// Substituir o handler homónimo de BK-MF2-05 por esta composição cumulativa.
function handleLoadedMetadata() {
  const video = videoRef.current;
  if (!video) return;
  const startAt =
    resumeAtRef.current ||
    safePosition(playback?.progress?.currentTimeSeconds);
  if (startAt > 0) video.currentTime = startAt;
  lastPositionRef.current = startAt;
  resumeAtRef.current = 0;
  applySubtitlePreference(
    video,
    preferenceStateRef.current.subtitleLanguage,
  );
}

const tracks = playback.content.tracks ?? { subtitles: [], audio: [] };
const qualityOptions = playback.content.qualityOptions ?? [];

<>
  {preferenceError ? <p role="alert">{preferenceError}</p> : null}
  <div className="player-controls" role="group" aria-label="Opções de média">
  <label>
    Legendas
    <select
      value={preferences.subtitleLanguage}
      disabled={Boolean(preferenceBusy)}
      onChange={(event) => updatePreference("subtitleLanguage", event.target.value)}
    >
      <option value="">Sem legendas</option>
      {tracks.subtitles.map((track) => (
        <option key={track.language} value={track.language}>{track.label}</option>
      ))}
    </select>
  </label>
  <label>
    Áudio
    <select
      value={preferences.audioLanguage}
      disabled={Boolean(preferenceBusy)}
      onChange={(event) => updatePreference("audioLanguage", event.target.value)}
    >
      <option value="">Original</option>
      {tracks.audio.map((track) => (
        <option key={track.language} value={track.language}>{track.label}</option>
      ))}
    </select>
  </label>
  <label>
    Qualidade
    <select
      value={preferences.quality}
      disabled={Boolean(preferenceBusy)}
      onChange={(event) => updatePreference("quality", event.target.value)}
    >
      <option value="">Automática</option>
      {qualityOptions.map((option) => (
        <option key={option.value} value={option.value} disabled={option.locked}>
          {option.locked
            ? `${option.label} - ${option.lockedReason ?? "indisponível no plano atual"}`
            : option.label}
        </option>
      ))}
    </select>
  </label>
  </div>
</>
```

5. Explicação do código.

O primeiro `getPlayback` hidrata simultaneamente `playback`, state e ref de
preferências. A reserva síncrona em `preferenceOperationRef` impede dois PUT no
mesmo tick; state `preferenceBusy` serve apenas a apresentação. Cada operação
transporta `AbortController`, versão e `contentId`. Uma troca, retry ou unmount
aborta e invalida respostas antigas antes de estas poderem trocar playback.

Cada alteração válida é persistida antes do refetch autenticado. A resposta
confirmada torna-se a única verdade: `selectedAudioLanguage`/`selectedQuality`
corrigem preferências antigas e o effect já existente reage apenas à nova
`content.source`. Um erro atual reverte state/ref e aparece junto aos controlos;
um abort stale não mostra erro nem faz rollback sobre o conteúdo novo. As
legendas públicas são descritores; só `TextTrack` já incorporada no media pode
ser ativada sem uma fonte externa autorizada.

6. Validação do passo.

Abre `/ver/:contentId`, muda uma preferência e confirma no Network que ocorre
primeiro o `PUT` e depois um novo `GET /api/playback/:contentId`. Aos 20 segundos,
muda áudio ou qualidade e confirma que a nova fonte canónica preserva a posição.
Confirma também que os selects nascem com os valores da primeira resposta.
Dispara duas mudanças no mesmo tick: deve existir só um PUT. Durante um PUT,
navega para outro `contentId`; o pedido anterior é abortado e nenhuma resposta
antiga altera título, fonte, opções ou erro do novo conteúdo.

7. Cenário negativo/erro esperado.

Se o player reiniciar sempre em `0`, a troca prejudica a experiência. Se busy
existir apenas em state, dois eventos rápidos podem sobrepor PUT/refetch. Se a
UI aplicar resposta de outro `contentId`, usar URL guardada numa opção ou não
reverter uma falha atual, contorna a decisão do backend e apresenta estado falso.

### Passo 8 - Validar parental, preferencias e qualidade

1. Objetivo funcional do passo no contexto da app.

Confirmar parental, preferencias, qualidade, audio e legendas.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API, UI e MongoDB

3. Instruções do que fazer.

Obtém primeiro o token em `GET /api/session/csrf-token`, guarda-o apenas na
variável shell `CSRF_TOKEN` e testa limite parental, preferências válidas e
valores/tipos fora das allowlists.

4. Código completo, correto e integrado com a app final.

```bash
curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"parentalMaxAgeRating":6}' \
  http://localhost:3000/api/users/me/parental

curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/playback/CONTENT_ID

curl -i -b /tmp/faithflix.cookies \
  -X PUT \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"subtitleLanguage":"pt","audioLanguage":"en","quality":"1080p"}' \
  http://localhost:3000/api/playback/preferences

curl -i -b /tmp/faithflix.cookies \
  -X PUT \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"subtitleLanguage":false,"audioLanguage":"audio-inexistente","quality":"qualidade-inexistente"}' \
  http://localhost:3000/api/playback/preferences
```

5. Explicação do código.

O backend guarda apenas uma preferência pertencente às allowlists fechadas.
Mesmo uma preferência válida não escolhe diretamente uma fonte:
`GET /api/playback/:contentId` volta a validar parental, disponibilidade e
autorização. O frontend não recebe as restantes fontes.

6. Validação do passo.

Resultados esperados:

- Conteudo acima do limite devolve `403`.
- Preferencias da allowlist devolvem `200`.
- Tipos falsos, qualidade ou áudio fora da allowlist devolvem `400 MEDIA_PREFERENCE_INVALID`, sem escrita.
- `content.source` contém apenas `url`, `protocol` e `mimeType`; o protocolo é `progressive`, `hls` ou `dash`.
- `tracks` e `qualityOptions` da resposta não contêm `url`, `src` nem `playbackUrl`.
- Uma preferência que aponta para uma qualidade `locked: true` seleciona apenas
  um fallback desbloqueado; se todas as fontes estiverem locked, devolve
  `409 MEDIA_NOT_READY` e nenhuma URL bloqueada sai na resposta.
- Player mostra selects, refaz o playback após persistir preferências e continua funcional depois da troca de fonte.

7. Cenário negativo/erro esperado.

Se o payload inválido devolver `200`, for coercivo, produzir uma URL a partir
da qualidade/áudio ou devolver uma fonte marcada `locked`, a regra de segurança
deste BK falhou.

##### Snippet técnico aplicável

O único snippet aplicável é `updatePreference` completo do Passo 7, juntamente
com os refs/effects que o invalidam. Não copies uma sequência isolada
`savePreferences -> getPlayback -> setPlayback`: sem reserva, abort e guards de
versão/conteúdo, essa sequência reintroduz a race corrigida.

#### Critérios de aceite

- [ ] A administração aceita apenas descritores `language`/`label` e
  `value`/`label`; o payload validado nunca contém `media`, `source`, `url`,
  `src` ou `playbackUrl`.
- [ ] `PATCH /api/users/me/parental` valida limite entre `0` e `18`.
- [ ] `GET /api/playback/:contentId` devolve `403` acima do limite parental.
- [ ] Conteúdo sem media pronta devolve `409 MEDIA_NOT_READY`.
- [ ] `GET/PUT /api/playback/preferences` exige login.
- [ ] O playback autenticado devolve uma única `content.source = { url, protocol, mimeType }`, com protocolo fechado.
- [ ] `tracks` e `qualityOptions` públicas não expõem `url`, `src` nem `playbackUrl`.
- [ ] `qualityOptions` contém apenas `value`, `label`, `locked`, `selected` e campos opcionais de tier/razão.
- [ ] Preferência e fallback ignoram qualquer candidato com `locked: true`;
  nenhuma fonte locked sai e ausência de alternativa devolve
  `409 MEDIA_NOT_READY`.
- [ ] O frontend persiste e volta a pedir playback depois de alterar legenda/áudio/qualidade; nunca seleciona ou constrói a fonte.
- [ ] Uma falha ao guardar preferências reverte o estado otimista.
- [ ] A primeira resposta de playback hidrata state e ref de preferências.
- [ ] A reserva síncrona permite no máximo um PUT/refetch de preferências ativo.
- [ ] Mudança de conteúdo, retry e unmount abortam a operação; guards de versão
  e `contentId` impedem que resposta antiga altere playback/preferências/erro.
- [ ] Falha atual reverte state/ref e mostra erro seguro local; abort stale não
  altera a UI do novo conteúdo.
- [ ] Player mostra selects de legenda, audio e qualidade.
- [ ] Legenda selecionada só ativa uma `TextTrack` incorporada; a UI não fabrica fontes VTT.
- [ ] Troca de audio preserva aproximadamente o tempo atual.
- [ ] Troca de qualidade preserva aproximadamente o tempo atual.
- [ ] Qualidade inexistente nao gera URL.
- [ ] Audio inexistente nao gera URL.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com resposta `403`, resposta de preferencias e screenshot do player com controlos.

#### Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `PATCH /api/users/me/parental` com limite valido.
- Resposta `curl` de `GET /api/playback/:contentId` com `403` para conteudo acima do limite.
- Resposta `curl` de `PUT /api/playback/preferences` com preferencias guardadas.
- Resposta autenticada com uma `content.source` e opções/faixas sem fontes.
- Negativos com qualidade, áudio e `content.media` marcados `locked: true`:
  existe apenas fallback desbloqueado ou `409 MEDIA_NOT_READY`, nunca a URL
  bloqueada.
- Screenshot do player com controlos de legenda, audio e qualidade.
- Nota curta a confirmar que qualidade e audio inexistentes nao geram URL nova.
- Prova do `PUT` seguido de refetch e da reversão do estado quando o `PUT` falha.
- Teste de duas mudanças no mesmo tick com um único PUT e de navegação durante
  a operação sem resposta antiga aplicada.
- Assert de hidratação dos selects a partir do primeiro playback.
- Nota curta a confirmar que `subtitleLanguage` só altera `TextTrack.mode` quando a faixa está incorporada.

#### Handoff

O `BK-MF2-07` pode reutilizar `playback_progress` para historico e manter o player como origem dos eventos de visualizacao.

##### Próximo BK recomendado

`BK-MF2-07` - Favoritos/watchlist/historico.

##### Inputs estritos

- O body de controlo parental exige número JSON inteiro `0..18`; vazio e string
  numérica devolvem `400`. Preferências de legenda, áudio e qualidade exigem
  strings reais pertencentes às listas fechadas, sem coerção.
- IDs de path são strings escalares e arrays/objetos são recusados. O body tem
  de ser objeto JSON, nunca array, e campos desconhecidos devolvem `400`.
- Valores acima dos limites definidos devolvem `400`; não são truncados nem
  convertidos para um fallback silencioso.
- `assertParentalSettings` e `normalizePreferences` implementam diretamente
  estas regras: validam o objeto, rejeitam tipos incorretos/campos desconhecidos
  e não usam coerção para transformar input inválido em preferências.

#### Changelog

- `2026-07-10`: preferências recompostas com hidratação inicial, reserva
  síncrona, abort/version/content guard, cleanup e rollback/erro local seguro.
- `2026-07-10`: migrado para tutorial v2 e substituídas coerções de input por
  validação explícita no parental e nas preferências.
- 2026-07-10: Substituído o antigo `content.media` por uma única `content.source`; listas públicas ficaram sem fontes e alterações de preferências passaram a persistir/refazer playback sem seleção local de URL.
- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
- 2026-05-31: Completada aplicacao real de legendas via `TextTrack.mode` e troca de fonte para audio/qualidade.
- 2026-07-10: seleção de playback passou a excluir `locked: true` antes da
  preferência e de qualquer fallback, com negativos de zero fontes bloqueadas.
