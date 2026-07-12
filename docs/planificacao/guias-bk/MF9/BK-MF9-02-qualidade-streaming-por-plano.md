# BK-MF9-02 - Qualidade de streaming por plano

## Header

- `doc_id`: `GUIA-BK-MF9-02`
- `bk_id`: `BK-MF9-02`
- `macro`: `MF9`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-01,BK-MF2-06`
- `rf_rnf`: `RF15, RF63, RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF9-03`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais ligar os entitlements criados em `BK-MF9-01` ao player da
aplicação. O backend passa a decidir que opções de qualidade o utilizador pode
receber: Pro e trial ficam limitados a `1080p`; Família pode selecionar
`2160p/4K` se o conteúdo declarar essa opção. Enquanto só existirem fixtures
sintéticas, esta é uma prova de autorização e não de resolução real.

O resultado observável é que `GET /api/playback/:contentId` devolve apenas a fonte selecionada pelo backend. A UI pode mostrar descritores de qualidades permitidas ou bloqueadas, mas nenhuma opção pública transporta URL.

#### Importância

`RF63` exige qualidade de streaming por plano e `RF15` já tinha criado preferência de qualidade. Se a regra ficar só no frontend, qualquer utilizador pode manipular o browser e tentar usar uma qualidade acima do plano. Por isso, a filtragem tem de estar no backend.

Este BK prepara a partilha familiar do `BK-MF9-03`: quando um membro ganhar acesso por Família, o player deve herdar os entitlements do owner e permitir 4K sem criar uma subscrição própria.

#### Scope-in

- Reutilizar `maxQuality` e `qualityRank` vindos do contrato de planos.
- Filtrar `qualityOptions` no backend antes da resposta pública.
- Substituir o guard premium da MF4 para consultar o acesso efetivo canónico,
  preservando o mesmo export e as rotas existentes.
- Remover `url`, `playbackUrl`, `src` e `source` de todas as opções antes da resposta pública.
- Fazer fallback para a melhor qualidade permitida quando a preferência está acima do plano.
- Atualizar o seletor de qualidade no frontend para mostrar opções bloqueadas sem permitir seleção.
- Criar testes para Pro, Família, fallback e ausência de fontes nas opções públicas.

#### Scope-out

- Infraestrutura profissional de distribuição de vídeo.
- Proteção profissional de conteúdo.
- Regras de limite de dispositivos.
- Partilha familiar; fica para `BK-MF9-03`.

#### Estado antes e depois

- Antes: `BK-MF2-06` permite escolher qualidade, mas não cruza essa escolha com o plano.
- Depois: o backend devolve apenas média permitida e bloqueia dados reproduzíveis de qualidades superiores.

#### Pré-requisitos

- `BK-MF9-01` completo, com `maxQuality` nos planos.
- `BK-MF2-06` completo, com `qualityOptions` no catálogo e preferências de média.
- Ler `RF15`, `RF63` e `RNF29`.
- Rever `backend/src/modules/playback/playback.service.js`.
- Rever `frontend/src/pages/PlaybackPage.jsx`.

#### Glossário

- `qualityOptions`: lista de qualidades disponíveis num conteúdo.
- `content.source`: única fonte canónica autenticada, composta por `url`, `protocol` e `mimeType`.
- `locked`: marca pública que indica que a qualidade existe, mas não está permitida para o plano.
- `fallback`: escolha automática da melhor qualidade permitida quando a preferência não pode ser usada.
- `qualityRank`: número usado para comparar `720p`, `1080p` e `2160p`.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF63` determina que a qualidade máxima é imposta no backend e que URLs bloqueadas não chegam ao frontend.
- Uma preferência de utilizador não é uma permissão. O utilizador pode preferir 4K, mas o service só deve entregar 4K se o plano permitir.
- O backend deve devolver estados observáveis: fonte selecionada em `content.source`, descritores de qualidade sem URL e razão para opções bloqueadas.
- O frontend deve respeitar `locked` e nunca reconstruir URLs de média.
- `DERIVADO`: mostrar a opção bloqueada na UI ajuda o aluno a perceber a diferença entre disponibilidade do conteúdo e permissão do plano.
- Testar fallback é tão importante como testar sucesso, porque a preferência antiga do utilizador pode ficar acima do plano atual.

##### Contrato atual da referência docente (Fase 4 - 2026-07-10)

- `filterQualityOptionsByEntitlements` pode manter temporariamente fontes de opções
  permitidas para o service escolher o fallback. É um helper interno e a sua saída
  não deve ser serializada diretamente.
- `publicPlaybackContent` aplica uma allowlist depois da escolha: `qualityOptions`
  públicas contêm apenas `value`, `label`, `locked`, `selected` e campos
  opcionais `requiredTier`/`lockedReason`; `tracks` públicas contêm apenas
  `language`/`label`.
- A única fonte devolvida fica em
  `content.source = { url, protocol, mimeType }`, corresponde à qualidade/áudio
  autorizados e usa um protocolo fechado `progressive|hls|dash`.
- Conteúdo sem `mediaStatus: "ready"` ou sem fonte utilizável devolve
  `409 MEDIA_NOT_READY`, mesmo quando o utilizador tem plano Família.
- Depois de guardar uma preferência, o frontend refaz o playback e deixa o
  backend escolher a nova `source`; nunca usa uma fonte guardada na opção.
- Fixtures sintéticas locais MP4/HLS/DASH provam contratos, adapters e fallback.
  Não provam vídeo real, 4K real, CDN, ABR, tempos de arranque ou carga. Assim,
  `RNF23` fica no máximo `PARCIAL_VALIDADO` e `RNF08`/`RNF10` continuam
  `NAO_PROVADO`.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Subscrições | `backend/src/modules/subscriptions/subscriptions.service.js` | Exporta o acesso próprio efetivo, `qualityRankForValue` e `filterQualityOptionsByEntitlements`. |
| Autorização | `backend/src/modules/subscriptions/subscription-access.middleware.js` | Exige `hasPremiumAccess === true` no acesso efetivo, sem assumir que a origem é o owner. |
| Playback | `backend/src/modules/playback/playback.service.js` | Resolve acesso efetivo, filtra qualidades e escolhe média permitida. |
| Página frontend | `frontend/src/pages/PlaybackPage.jsx` | Mostra seletor com opções bloqueadas desativadas. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova filtro, fallback e ausência de URL bloqueada. |
| Handoff | `BK-MF9-03` | Acesso efetivo por família passa a alimentar o mesmo filtro. |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/modules/subscriptions/subscription-access.middleware.js`
- EDITAR: `backend/src/modules/playback/playback.service.js`
- EDITAR: `frontend/src/pages/PlaybackPage.jsx`
- CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`

#### Tutorial técnico linear

### Passo 1 - Criar filtro de qualidade por entitlement

1. Objetivo funcional do passo no contexto da app.

Filtrar internamente `qualityOptions` para que o playback escolha apenas uma fonte autorizada.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - EDITAR: `backend/src/modules/subscriptions/subscription-access.middleware.js`
    - LOCALIZAÇÃO: junto de `qualityRankForValue` e ficheiro completo do middleware.

3. Instruções do que fazer.

Cria uma função exportada que recebe opções de qualidade e entitlements. Se a
qualidade estiver acima do plano, remove qualquer campo reproduzível e marca a
opção como bloqueada. No mesmo módulo, cria a versão inicial de
`getEffectiveSubscriptionAccess`: neste BK resolve apenas subscrição própria;
o `BK-MF9-03` vai estendê-la, no mesmo nome, para membership familiar.

Substitui também o ficheiro completo do guard criado no `BK-MF4-01`, mantendo o
export `requireActiveSubscription`. O guard deixa de consultar
`hasActiveSubscriptionAccess`, que nessa fase conhece apenas o owner, e passa a
exigir o booleano do acesso efetivo. Não alteres `playback.routes.js`: a ordem
existente `requireAuth` -> `requireActiveSubscription` -> controller mantém-se.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Filtra opções de qualidade conforme entitlements sem expor URLs bloqueadas.
 *
 * @param {object[]} options Opções vindas do catálogo.
 * @param {object} entitlements Entitlements efetivos do utilizador.
 * @returns {object[]} Opções internas filtradas; serializar só depois de redaction.
 */
export function filterQualityOptionsByEntitlements(options = [], entitlements = ENTITLEMENTS.none) {
  const maxRank = Number(entitlements.qualityRank ?? qualityRankForValue(entitlements.maxQuality));

  return (Array.isArray(options) ? options : []).map((option) => {
    const candidate = option && typeof option === "object" && !Array.isArray(option)
      ? option
      : {};
    const rank = qualityRankForValue(candidate.value ?? candidate.label);
    if (rank > 0 && rank <= maxRank) {
      return { ...candidate, locked: false };
    }

    // Qualidade acima do plano ou desconhecida perde todos os aliases reproduzíveis.
    const {
      playbackUrl: _playbackUrl,
      src: _src,
      url: _url,
      source: _source,
      ...safeOption
    } = candidate;
    return {
      ...safeOption,
      locked: true,
      ...(rank > 0 ? { requiredTier: "family" } : {}),
      lockedReason: rank > 0
        ? "Disponível no plano Família."
        : "Qualidade indisponível.",
    };
  });
}

/**
 * Resolve entitlements apenas para combinações coerentes de estado e plano.
 *
 * @param {object | null} subscription Subscrição observada.
 * @param {object | null} plan Plano persistido para subscrições ativas.
 * @returns {object} Entitlements fechados ou `none` em qualquer incoerência.
 */
export function entitlementsForSubscription(subscription, plan = null) {
  if (subscription?.status === "trialing") {
    return subscription.planCode === "trial"
      ? { ...ENTITLEMENTS.trial }
      : { ...ENTITLEMENTS.none };
  }

  if (
    subscription?.status !== "active" ||
    subscription.planCode === "trial"
  ) {
    return { ...ENTITLEMENTS.none };
  }

  return entitlementsForPlan(plan);
}

/**
 * Resolve acesso próprio antes de a partilha familiar existir.
 *
 * @param {string} userId Identificador autenticado.
 * @param {Date} referenceDate Instante usado para expiração e testes.
 * @returns {Promise<{source: "own"|"none", hasPremiumAccess: boolean, entitlements: object}>}
 */
export async function getEffectiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const subscription = await db.collection("subscriptions").findOne({
    userId: userObjectId(userId),
  });

  if (!hasSubscriptionAccess(subscription, referenceDate)) {
    return { source: "none", hasPremiumAccess: false, entitlements: ENTITLEMENTS.none };
  }

  const plan = subscription.status === "active"
    ? await db.collection("subscription_plans").findOne({
        code: subscription.planCode,
        active: true,
      })
    : null;
  const entitlements = entitlementsForSubscription(subscription, plan);
  const hasPremiumAccess = entitlements.tier !== "none";

  // Um plano ausente ou incompleto nunca herda a fonte base do conteúdo.
  return {
    source: hasPremiumAccess ? "own" : "none",
    hasPremiumAccess,
    entitlements: hasPremiumAccess ? entitlements : ENTITLEMENTS.none,
  };
}
```

Substitui o middleware da MF4 pelo ficheiro autónomo seguinte:

```js
// backend/src/modules/subscriptions/subscription-access.middleware.js
/**
 * @file Autorização premium baseada na origem efetiva de acesso.
 */
import { getEffectiveSubscriptionAccess } from "./subscriptions.service.js";

/**
 * Cria o erro público devolvido quando não existe acesso premium.
 *
 * @returns {Error} Erro HTTP seguro, sem detalhes de subscrição ou Família.
 */
function subscriptionRequiredError() {
  const error = new Error("Subscrição ativa necessária para reproduzir este conteúdo.");
  error.statusCode = 403;
  error.code = "SUBSCRIPTION_REQUIRED";
  return error;
}

/**
 * Valida o contrato efetivo sem inferir acesso por `source` ou truthiness.
 *
 * @param {object | null | undefined} effectiveAccess Resposta do service.
 * @returns {object} Acesso premium validado.
 * @throws {Error} Quando `hasPremiumAccess` não é exatamente `true`.
 */
export function assertEffectiveSubscriptionAccess(effectiveAccess) {
  if (effectiveAccess?.hasPremiumAccess !== true) {
    throw subscriptionRequiredError();
  }
  return effectiveAccess;
}

/**
 * Mantém o guard usado pelas rotas de playback desde o BK-MF4-01.
 *
 * `requireAuth` corre primeiro e fornece `req.user.id`. O middleware consulta a
 * mesma função usada pelo playback; a extensão Família do BK-MF9-03 passa assim
 * a ser reconhecida automaticamente sem criar outra regra de autorização.
 *
 * @param {object} req Pedido Express autenticado.
 * @param {object} _res Resposta Express não usada.
 * @param {(error?: Error) => unknown} next Continuação Express.
 * @returns {Promise<unknown>} Resultado de `next`.
 */
export async function requireActiveSubscription(req, _res, next) {
  try {
    const effectiveAccess = await getEffectiveSubscriptionAccess(req.user.id);
    assertEffectiveSubscriptionAccess(effectiveAccess);
    return next();
  } catch (error) {
    return next(error);
  }
}
```

5. Explicação do código.

A função compara cada opção com a qualidade máxima do plano. Apenas uma
qualidade reconhecida e dentro do limite fica desbloqueada. Opções acima do
plano, desconhecidas ou malformadas perdem imediatamente todos os aliases de
fonte e ficam bloqueadas; não existe o antigo ramo permissivo para `rank === 0`.
As opções permitidas mantêm temporariamente a fonte para o service escolher o
fallback. Este helper não é uma resposta pública.
Antes de serializar, `publicPlaybackContent` reconstrói todas as opções por
allowlist e devolve apenas a selecionada em `content.source`. O acesso efetivo
fica fail-closed: subscrição expirada ou plano incompleto produz
`hasPremiumAccess: false` e `ENTITLEMENTS.none`.

O middleware preserva o nome e a posição nas rotas, mas remove a suposição de
que só uma subscrição própria pode autorizar playback. Neste BK, a função
efetiva ainda devolve apenas `own|none`; quando o `BK-MF9-03` acrescentar
`source: "family"`, o mesmo guard aceita o membro apenas porque
`hasPremiumAccess === true`. Qualquer objeto ausente, malformado ou com valor
truthy diferente de `true` produz `403 SUBSCRIPTION_REQUIRED`.

6. Validação do passo.

Com entitlements Pro (`qualityRank: 1080`), tanto uma opção `2160p` como uma
opção desconhecida `999p` devem sair com `locked: true` e sem qualquer alias
`url`/`playbackUrl`/`src`/`source`.

Confirma também por teste que `assertEffectiveSubscriptionAccess` aceita
`{ source: "family", hasPremiumAccess: true }` e rejeita `false`, ausência do
campo e valores não booleanos com status `403` e code `SUBSCRIPTION_REQUIRED`.

7. Cenário negativo/erro esperado.

Se uma opção acima do plano ou desconhecida ainda tiver qualquer alias de fonte,
ou surgir como `locked: false`, o teste de segurança do BK deve falhar.
O middleware também deve falhar se autorizar pela presença de `source`,
`subscription` ou `familyMembership` sem `hasPremiumAccess === true`.

### Passo 2 - Resolver média reproduzível no backend

1. Objetivo funcional do passo no contexto da app.

Escolher a melhor média permitida sem confiar na preferência enviada pelo utilizador.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/playback/playback.service.js`
    - LOCALIZAÇÃO: imports do topo e função `resolvePlayableMedia`.

3. Instruções do que fazer.

Reutiliza e importa `canonicalMediaSource` criado no `BK-MF2-03`. Confirma
também que o ficheiro importa `filterQualityOptionsByEntitlements`,
`isSupportedQualityValue` e `qualityRankForValue` a partir do módulo de
subscrições. Depois filtra as variantes antes de construir a única `source`. Se
a preferência guardada estiver bloqueada, usa a qualidade permitida mais alta.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/playback/playback.service.js
import { canonicalMediaSource } from "../catalog/catalog-media.js";
import {
  filterQualityOptionsByEntitlements,
  getEffectiveSubscriptionAccess,
  isSupportedQualityValue,
  qualityRankForValue,
} from "../subscriptions/subscriptions.service.js";

function candidateQuality(candidate) {
  return String(candidate?.quality ?? candidate?.qualityValue ?? candidate?.value ?? "").toLowerCase();
}

function isAllowedQuality(quality, entitlements) {
  const maxRank = Number(
    entitlements.qualityRank ?? qualityRankForValue(entitlements.maxQuality),
  );
  return isSupportedQualityValue(quality) && qualityRankForValue(quality) <= maxRank;
}

/**
 * Resolve média reproduzível sem construir URLs a partir de input do utilizador.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo publicado.
 * @param {{ audioLanguage: string, quality: string }} preferences Preferências guardadas.
 * @param {Record<string, unknown>} entitlements Entitlements efetivos.
 * @returns {{ source: {url: string, protocol: string, mimeType: string} | null, selectedAudioLanguage: string, selectedQuality: string, qualityOptions: object[] }} Média segura.
 */
function resolvePlayableMedia(content, preferences, entitlements) {
  const qualityOptions = filterQualityOptionsByEntitlements(
    content.qualityOptions ?? [],
    entitlements,
  );
  const qualityCandidates = qualityOptions
    .filter((option) => !option.locked && isSupportedQualityValue(option.value))
    .map((option) => ({ option, source: canonicalMediaSource(option) }))
    .filter(({ source }) => source)
    .sort(
      (left, right) =>
        qualityRankForValue(left.option.value) - qualityRankForValue(right.option.value),
    );
  const preferredQuality = qualityCandidates.find(
    ({ option }) => option.value === preferences.quality,
  );
  const selectedQuality = preferredQuality ?? qualityCandidates.at(-1);
  const selectedQualityValue = selectedQuality?.option?.value ?? "";
  const selectedAudio = (content.tracks?.audio ?? []).find((track) => {
    const quality = candidateQuality(track);
    return (
      track.language === preferences.audioLanguage &&
      canonicalMediaSource(track) &&
      isAllowedQuality(quality, entitlements) &&
      (!selectedQualityValue || quality === selectedQualityValue)
    );
  });
  const baseSource = canonicalMediaSource(content.media);
  const baseQuality = candidateQuality(content.media);
  const canUseBase =
    baseSource &&
    (isAllowedQuality(baseQuality, entitlements) ||
      ((content.qualityOptions ?? []).length === 0 && !baseQuality));
  const source =
    canonicalMediaSource(selectedAudio) ??
    selectedQuality?.source ??
    (canUseBase ? baseSource : null);
  const effectiveQuality =
    candidateQuality(selectedAudio) || selectedQualityValue || baseQuality;

  return {
    source,
    selectedAudioLanguage: selectedAudio?.language ?? "",
    selectedQuality: effectiveQuality,
    qualityOptions: publicQualityOptions(qualityOptions, effectiveQuality),
  };
}
```

5. Explicação do código.

O conteúdo traz várias qualidades, as preferências trazem a escolha anterior e os entitlements dizem o limite do plano. A função só transforma variantes autorizadas em `source`; áudio e media base também passam pelo limite para não servirem de bypass. `canonicalMediaSource` é o único nome/export usado desde o catálogo, sem aliases implícitos. Se a preferência não for permitida, usa a melhor qualidade autorizada.

6. Validação do passo.

Com preferência `2160p` e plano Pro, a resposta deve escolher `1080p` se essa opção existir.

7. Cenário negativo/erro esperado.

Se o conteúdo não tiver nenhuma fonte permitida, `resolvePlayableMedia` devolve `source: null` e o passo seguinte converte esse estado em `409 MEDIA_NOT_READY`. Nunca deve existir resposta `200` com uma fonte vazia.

### Passo 3 - Publicar playback com entitlements efetivos

1. Objetivo funcional do passo no contexto da app.

Garantir que o endpoint de playback usa o acesso efetivo da subscrição antes de devolver conteúdo.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/playback/playback.service.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: `publicPlaybackContent` e `getPlayback`.

3. Instruções do que fazer.

Mantém o import de `getEffectiveSubscriptionAccess` criado no Passo 1. Mantém
também a barreira `MEDIA_NOT_READY` do fluxo de playback do `BK-MF2-05`, chama
`getEffectiveSubscriptionAccess(userId)`, exige
`effectiveAccess.hasPremiumAccess === true`, passa os entitlements para
`publicPlaybackContent` e inclui `qualityOptions` filtradas na resposta.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/playback/playback.service.js
function mediaNotReadyError() {
  const error = new HttpError(
    409,
    "Conteúdo ainda não tem media pronta para reprodução.",
  );
  error.code = "MEDIA_NOT_READY";
  return error;
}

function assertMediaReady(content) {
  if (content.mediaStatus !== "ready") {
    throw mediaNotReadyError();
  }
}

function subscriptionRequiredError() {
  const error = new HttpError(403, "É necessária uma subscrição ativa.");
  error.code = "SUBSCRIPTION_REQUIRED";
  return error;
}

/**
 * Converte conteúdo para o formato público de reprodução.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo.
 * @param {Record<string, string>} preferences Preferências do utilizador.
 * @param {Record<string, unknown>} entitlements Entitlements efetivos.
 * @returns {Record<string, unknown>} Conteúdo público de reprodução.
 */
function publicPlaybackContent(content, preferences, entitlements) {
  const selectedMedia = resolvePlayableMedia(
    content,
    preferences,
    entitlements,
  );

  if (!selectedMedia.source) {
    throw mediaNotReadyError();
  }

  return {
    id: String(content._id),
    title: content.title,
    durationSeconds: content.durationSeconds,
    mediaStatus: "ready",
    isPlayable: true,
    source: selectedMedia.source,
    selectedAudioLanguage: selectedMedia.selectedAudioLanguage,
    selectedQuality: selectedMedia.selectedQuality,
    tracks: publicTracks(content.tracks),
    // Esta lista já foi reconstruída por allowlist em resolvePlayableMedia.
    qualityOptions: selectedMedia.qualityOptions,
    preferences,
    entitlements,
  };
}

/**
 * Carrega dados de reprodução de conteúdo publicado para um utilizador autenticado.
 *
 * @param {string} contentId Id do conteúdo.
 * @param {string} userId Id autenticado.
 * @returns {Promise<{ content: Record<string, unknown>, progress: object | null }>} Resposta de reprodução.
 */
export async function getPlayback(contentId, userId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteúdo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const content = await db.collection("contents").findOne({ _id: contentObjectId, status: "published" });

  if (!content) {
    throw new HttpError(404, "Conteúdo não encontrado.");
  }

  const user = await db.collection("users").findOne({ _id: userObjectId });
  assertParentalAccess(user, content);
  assertMediaReady(content);

  const preferences = await getMediaPreferences(userId);
  const effectiveAccess = await getEffectiveSubscriptionAccess(userId);
  if (!effectiveAccess.hasPremiumAccess) {
    throw subscriptionRequiredError();
  }
  const progress = await db.collection("playback_progress").findOne({ userId: userObjectId, contentId: contentObjectId });

  return {
    content: publicPlaybackContent(content, preferences, effectiveAccess.entitlements),
    progress: publicProgress(progress, content.durationSeconds),
  };
}
```

5. Explicação do código.

`getPlayback` valida conteúdo publicado, media pronta e controlo parental,
carrega preferências e só depois resolve entitlements. Sem acesso premium falha
antes de escolher qualquer fonte. O acesso efetivo vem do backend, é próprio
neste BK e poderá ser familiar no próximo. A resposta inclui `entitlements` e
descritores por allowlist para feedback de UI; só `content.source.url` é
reproduzível.

6. Validação do passo.

Faz um pedido autenticado a `GET /api/playback/:contentId` com plano Pro e uma
fixture que declare a opção lógica `2160p`. Essa opção deve vir bloqueada e sem
qualquer fonte; não descrevas a fixture como vídeo 4K real.

7. Cenário negativo/erro esperado.

Conteúdo não publicado deve continuar a devolver HTTP `404`, mesmo que o
utilizador tenha plano Família. Um utilizador sem subscrição ativa recebe
`403 SUBSCRIPTION_REQUIRED` e a resposta não contém fonte base.

### Passo 4 - Atualizar seletor de qualidade no frontend

1. Objetivo funcional do passo no contexto da app.

Mostrar ao utilizador as qualidades permitidas e bloqueadas sem permitir selecionar as bloqueadas.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/PlaybackPage.jsx`
    - LOCALIZAÇÃO: controlo `<select>` de qualidade.

3. Instruções do que fazer.

Renderiza todas as opções recebidas do backend, mas usa `disabled={option.locked}`
nas bloqueadas. O valor enviado por `updatePreference` continua a ser apenas
`option.value`. Essa função persiste a preferência, refaz
`GET /api/playback/:contentId` e deixa o adapter reagir à nova `content.source`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/PlaybackPage.jsx
<label>
  Qualidade
  <select
    value={preferences.quality}
    disabled={Boolean(preferenceBusy)}
    onChange={(event) => updatePreference("quality", event.target.value)}
  >
    <option value="">Automática</option>
    {playback.content.qualityOptions.map((option) => (
      // `locked` vem do backend; a UI só reflete a decisão e não calcula permissões.
      <option key={option.value} value={option.value} disabled={option.locked}>
        {option.locked ? `${option.label} - Plano Família` : option.label}
      </option>
    ))}
  </select>
</label>
```

5. Explicação do código.

O seletor recebe as opções públicas da API. Quando `locked` é verdadeiro, o browser mostra a opção, mas impede seleção. A UI não tenta criar URL, não muda regra de plano e não esconde completamente a existência de 4K. Depois da escrita, usa apenas a nova fonte selecionada pelo backend; em falha, reverte a preferência otimista.

6. Validação do passo.

Com plano Pro, abre uma fixture que declare `2160p`: a opção deve aparecer
desativada, `selectedQuality` deve indicar `1080p` (ou outro fallback permitido)
e o player deve atingir `canplay`. Isto não mede a resolução efetiva da fixture.

7. Cenário negativo/erro esperado.

Se o utilizador tentar forçar a preferência bloqueada pelo DevTools, o backend deve continuar a devolver fallback permitido.

### Passo 5 - Testar filtro e ausência de fonte bloqueada

1. Objetivo funcional do passo no contexto da app.

Provar a regra de segurança isolada, sem depender de browser.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: imports do topo e suite MF9 de qualidade.

3. Instruções do que fazer.

No ficheiro de testes criado em `BK-MF9-01`, confirma que os imports de
`node:assert/strict`, `filterQualityOptionsByEntitlements` e
`assertEffectiveSubscriptionAccess` existem. Testa o filtro com uma opção
permitida `1080p`, uma acima do plano `2160p` e uma desconhecida `999p`; testa
também o guard com acesso Família explícito e respostas malformadas.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  entitlementsForSubscription,
  filterQualityOptionsByEntitlements,
} from "../../src/modules/subscriptions/subscriptions.service.js";
import {
  assertEffectiveSubscriptionAccess,
} from "../../src/modules/subscriptions/subscription-access.middleware.js";

test("MF9 filtra qualidade e não expõe fonte bloqueada", () => {
  const filtered = filterQualityOptionsByEntitlements(
    // Fixtures sintéticas locais: não constituem prova de vídeo ou 4K reais.
    [
      {
        value: "1080p",
        label: "Full HD",
        source: {
          url: "/tests/fixtures/media/synthetic-progressive.mp4",
          protocol: "progressive",
          mimeType: "video/mp4",
        },
      },
      {
        value: "2160p",
        label: "4K (entitlement simulado)",
        source: {
          url: "/tests/fixtures/media/synthetic-progressive.mp4?quality=2160p",
          protocol: "progressive",
          mimeType: "video/mp4",
        },
      },
      {
        value: "999p",
        label: "Qualidade desconhecida",
        url: "/tests/fixtures/media/synthetic-progressive.mp4?quality=999p",
      },
    ],
    { qualityRank: 1080, maxQuality: "1080p" },
  );

  // O helper interno mantém a opção permitida para escolher a fonte.
  assert.equal(filtered[0].locked, false);
  assert.equal(filtered[0].source.protocol, "progressive");
  assert.equal(filtered[1].locked, true);
  assert.equal(filtered[2].locked, true);
  for (const option of [filtered[1], filtered[2]]) {
    for (const field of ["url", "src", "playbackUrl", "source"]) {
      assert.equal(field in option, false);
    }
  }
});

test("MF9 fecha combinações incoerentes de subscrição e plano", () => {
  const trial = entitlementsForSubscription({
    status: "trialing",
    planCode: "trial",
  });
  assert.equal(trial.tier, "trial");
  assert.equal(trial.maxQuality, "1080p");

  const pro = entitlementsForSubscription(
    { status: "active", planCode: "faithflix-monthly" },
    {
      active: true,
      tier: "pro",
      maxQuality: "1080p",
      familySharing: false,
      maxFamilyMembers: 1,
    },
  );
  assert.equal(pro.tier, "pro");

  for (const incoherent of [
    { status: "unknown", planCode: "faithflix-monthly" },
    { status: "active", planCode: "trial" },
    { status: "trialing", planCode: "faithflix-monthly" },
  ]) {
    assert.equal(entitlementsForSubscription(incoherent).tier, "none");
  }
});

test("MF9 guard aceita Família apenas com acesso premium explícito", () => {
  const familyAccess = { source: "family", hasPremiumAccess: true };
  assert.equal(assertEffectiveSubscriptionAccess(familyAccess), familyAccess);

  // `source` nunca substitui o booleano canónico de autorização.
  for (const denied of [
    { source: "family", hasPremiumAccess: false },
    { source: "family" },
    { source: "family", hasPremiumAccess: "true" },
  ]) {
    assert.throws(
      () => assertEffectiveSubscriptionAccess(denied),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, "SUBSCRIPTION_REQUIRED");
        return true;
      },
    );
  }
});
```

5. Explicação do código.

O teste chama o filtro interno sem HTTP para isolar a autorização. A primeira
opção mantém a fonte apenas para a escolha dentro do service; tanto a opção
acima do plano como a desconhecida ficam bloqueadas e perdem todos os aliases.
Um teste separado da resposta de playback confirma que todas as opções públicas
ficam sem fontes.

O segundo teste fixa o contrato do guard sem depender de MongoDB ou HTTP: um
membro Família com booleano explícito passa; `source` isolado, `false` e a
string `"true"` falham com o mesmo erro seguro.

6. Validação do passo.

Executa os testes do backend e confirma que este caso passa.

7. Cenário negativo/erro esperado.

Se a opção 4K ou a qualidade desconhecida continuar com `url`, `src`,
`playbackUrl` ou `source`, a assert deve falhar.

### Passo 6 - Testar fallback de playback

1. Objetivo funcional do passo no contexto da app.

Garantir que a experiência continua funcional quando a preferência guardada está acima do plano.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: imports, funções auxiliares de teste criadas em `BK-MF9-01` e teste de `getPlayback`.

3. Instruções do que fazer.

Mantém no topo do ficheiro os imports de `ObjectId`, `setCollectionsForTests`, `collection`, `planRows` e `getPlayback` já usados pela suite MF9. Cria um utilizador Pro, um conteúdo publicado com `1080p` e `2160p`, e uma preferência guardada em `2160p`.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import { ObjectId } from "mongodb";
import { getPlayback } from "../../src/modules/playback/playback.service.js";

test("MF9 playback faz fallback para qualidade permitida", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    media_preferences: collection([
      {
        _id: new ObjectId(),
        userId,
        values: { subtitleLanguage: "", audioLanguage: "", quality: "2160p" },
      },
    ]),
    playback_progress: collection([]),
    contents: collection([
      {
        _id: contentId,
        title: "Documentário",
        status: "published",
        ageRating: 12,
        durationSeconds: 1200,
        mediaStatus: "ready",
        media: {
          quality: "1080p",
          source: {
            url: "/tests/fixtures/media/synthetic-progressive.mp4",
            protocol: "progressive",
            mimeType: "video/mp4",
          },
        },
        tracks: { subtitles: [], audio: [] },
        // "2160p" prova apenas a regra de entitlement; a fixture não é 4K real.
        qualityOptions: [
          {
            value: "1080p",
            label: "Full HD",
            source: {
              url: "/tests/fixtures/media/synthetic-progressive.mp4",
              protocol: "progressive",
              mimeType: "video/mp4",
            },
          },
          {
            value: "2160p",
            label: "4K (entitlement simulado)",
            source: {
              url: "/tests/fixtures/media/synthetic-progressive.mp4?quality=2160p",
              protocol: "progressive",
              mimeType: "video/mp4",
            },
          },
        ],
      },
    ]),
  });

  const response = await getPlayback(String(contentId), String(userId));

  // A resposta pública contém exatamente uma fonte e nunca fontes nas opções.
  assert.deepEqual(response.content.source, {
    url: "/tests/fixtures/media/synthetic-progressive.mp4",
    protocol: "progressive",
    mimeType: "video/mp4",
  });
  assert.equal(response.content.selectedQuality, "1080p");
  assert.equal(response.content.qualityOptions[1].locked, true);
  for (const option of response.content.qualityOptions) {
    for (const field of ["url", "src", "playbackUrl", "source"]) {
      assert.equal(field in option, false);
    }
  }
});
```

5. Explicação do código.

O teste monta o fluxo completo de playback sem servidor HTTP. O utilizador tem plano Pro, mas a preferência pede `2160p`. A resposta escolhe `1080p`, marca a opção superior como bloqueada e remove fontes de todas as opções públicas. Isto prova a regra de autorização e o DTO; não prova reprodução ou resolução 4K reais.

6. Validação do passo.

Executa a suite do backend. O teste deve passar sem alterar dados reais.

7. Cenário negativo/erro esperado.

Se `response.content.source` selecionar a variante `2160p`, ou alguma opção
pública conservar um alias de fonte, o BK está inseguro e não pode avançar.

### Passo 7 - Fechar validação e handoff para família

1. Objetivo funcional do passo no contexto da app.

Confirmar que a qualidade por plano está pronta para acesso próprio e para acesso familiar.

2. Ficheiros envolvidos:
    - REVER: `backend/src/modules/subscriptions/subscription-access.middleware.js`
    - REVER: `backend/src/modules/playback/playback.service.js`
    - REVER: `frontend/src/pages/PlaybackPage.jsx`
    - REVER: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: outputs de teste e resposta de playback.

3. Instruções do que fazer.

Regista uma prova com plano Pro limitado a `1080p` e outra com plano Família
autorizado a selecionar a opção lógica `2160p`. Usa fixtures sintéticas locais e
identifica expressamente que a prova cobre entitlement/DTO, não resolução 4K
real. Confirma que as duas passam pelo mesmo `requireActiveSubscription`, sem
alterar as rotas nem criar um guard específico para Família.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O código já foi criado nos passos anteriores; aqui o trabalho é validar o contrato de handoff.

O filtro aceita entitlements como entrada e o middleware consulta a mesma função
de acesso efetivo. Isso significa que `BK-MF9-03` pode mudar a origem para
Família sem reescrever o player, o guard ou as rotas.

6. Validação do passo.

Executa:

```bash
cd backend
npm test
```

7. Cenário negativo/erro esperado.

Se uma resposta Pro selecionar a variante `2160p` ou expuser qualquer fonte nas
opções, o resultado esperado é bloquear o PR.
Se um membro Família com `hasPremiumAccess: true` receber `403` no middleware,
o resultado também bloqueia o PR porque prova que o guard antigo sobreviveu.

#### Critérios de aceite

- Pro e trial ficam limitados a `1080p`.
- Trial só recebe esse entitlement com `status: "trialing"` e
  `planCode: "trial"`; Pro exige `status: "active"` e plano persistido válido.
  Estados desconhecidos, trial ativo ou trialing com plano pago devolvem `none`.
- Família pode selecionar a opção lógica `2160p` quando o conteúdo a declarar;
  a fixture sintética não prova resolução 4K real.
- A resposta contém exatamente uma `content.source = { url, protocol, mimeType }`,
  com protocolo `progressive|hls|dash`.
- Todas as opções públicas aparecem sem `url`, `playbackUrl`, `src` ou `source`.
- Preferência acima do plano faz fallback para a melhor qualidade permitida.
- Alterar a preferência persiste primeiro e refaz playback; só o backend escolhe a nova fonte.
- Conteúdo sem media pronta devolve `409 MEDIA_NOT_READY`.
- Subscrição ausente/expirada ou plano incompleto devolve
  `403 SUBSCRIPTION_REQUIRED`, sem qualquer fonte.
- `requireActiveSubscription` decide apenas por
  `getEffectiveSubscriptionAccess(req.user.id).hasPremiumAccess === true`; a
  extensão do MF9-03 reconhece owner e membro Família pelo mesmo caminho.
- O seletor de qualidade usa o state canónico `preferences.quality` de
  `BK-MF2-06` e desativa opções bloqueadas; não introduz `qualityValue` paralelo.
- Os testes cobrem filtro interno, fallback, redaction de todas as opções e ausência de media pronta.
- O máximo local para `RNF23` é `PARCIAL_VALIDADO`; `RNF08` e `RNF10`
  permanecem `NAO_PROVADO` até existirem media e infraestrutura reais.

#### Validação final

- `cd backend && npm test`
- `cd frontend && npm run build`
- Pedido autenticado a `GET /api/playback/:contentId`
- Negativos: preferência 4K em Pro, conteúdo não publicado, subscrição expirada
  e `source: "family"` sem `hasPremiumAccess === true`.
- Fixtures locais progressive/HLS/DASH com pedidos externos bloqueados; o resultado
  não é evidência de CDN, ABR, 4K real, performance ou 100 streams.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: resposta Família com `selectedQuality: "2160p"` e uma única
  `content.source`, identificada como prova lógica sobre fixture sintética.
- `neg`: resposta Pro com 4K bloqueado, todas as opções sem fontes e conteúdo pendente com `409 MEDIA_NOT_READY`.
- `proof`: teste do middleware aceita acesso Família explícito e rejeita
  respostas ausentes/malformadas com `403 SUBSCRIPTION_REQUIRED`.
- `fonte`: `RF15`, `RF63`, `RNF29`, `BK-MF2-06`, `BK-MF9-01`.

#### Handoff

Este BK entrega o filtro e substitui o guard owner-only da MF4 pelo acesso
efetivo. `BK-MF9-03` estende a mesma `getEffectiveSubscriptionAccess`; por isso,
um membro Família passa automaticamente pelo middleware existente, sem outra
regra de playback ou alteração de rotas.

#### Changelog

- `2026-07-10`: alinhado o contrato público com uma única `content.source`, allowlist de opções/faixas, refetch após preferências e limites explícitos das fixtures (`RNF23` parcial; `RNF08`/`RNF10` não provados).
- `2026-07-10`: guard premium composto com `getEffectiveSubscriptionAccess`,
  erro `403` seguro e teste copiável para owner/membro Família.
- `2026-06-30`: guia revisto com enforcement backend, fallback, UI bloqueada, testes e handoff para partilha familiar.
- `2026-07-01`: texto normalizado para português de Portugal com acentuação e blocos de código/teste reforçados com imports, contexto e comentários didáticos.
