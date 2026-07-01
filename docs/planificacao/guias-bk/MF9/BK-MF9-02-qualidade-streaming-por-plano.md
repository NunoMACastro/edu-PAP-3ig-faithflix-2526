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
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais ligar os entitlements criados em `BK-MF9-01` ao player real do FaithFlix. O backend passa a decidir que qualidades de vídeo o utilizador pode receber: Pro e trial ficam limitados a `1080p`; Família pode receber `2160p/4K` se o conteúdo tiver essa opção.

O resultado observável é que `GET /api/playback/:contentId` nunca envia uma URL de média acima do plano do utilizador. A UI pode mostrar uma qualidade bloqueada, mas não consegue reproduzi-la porque a resposta pública não traz URL.

#### Importância

`RF63` exige qualidade de streaming por plano e `RF15` já tinha criado preferência de qualidade. Se a regra ficar só no frontend, qualquer utilizador pode manipular o browser e tentar usar uma qualidade acima do plano. Por isso, a filtragem tem de estar no backend.

Este BK prepara a partilha familiar do `BK-MF9-03`: quando um membro ganhar acesso por Família, o player deve herdar os entitlements do owner e permitir 4K sem criar uma subscrição própria.

#### Scope-in

- Reutilizar `maxQuality` e `qualityRank` vindos do contrato de planos.
- Filtrar `qualityOptions` no backend antes da resposta pública.
- Remover `playbackUrl` e `src` de qualidades bloqueadas.
- Fazer fallback para a melhor qualidade permitida quando a preferência está acima do plano.
- Atualizar o seletor de qualidade no frontend para mostrar opções bloqueadas sem permitir seleção.
- Criar testes para Pro, Família, fallback e URL bloqueada.

#### Scope-out

- Infraestrutura profissional de distribuição de vídeo.
- Proteção profissional de conteúdo.
- Regras de limite de dispositivos.
- Partilha familiar; fica para `BK-MF9-03`.

#### Estado antes e depois

- Antes: `BK-MF2-06` permite escolher qualidade, mas não cruza essa escolha com o plano.
- Depois: o backend devolve apenas média permitida e bloqueia dados reproduzíveis de qualidades superiores.

#### Pre-requisitos

- `BK-MF9-01` completo, com `maxQuality` nos planos.
- `BK-MF2-06` completo, com `qualityOptions` no catálogo e preferências de média.
- Ler `RF15`, `RF63` e `RNF29`.
- Rever `backend/src/modules/playback/playback.service.js`.
- Rever `frontend/src/pages/PlaybackPage.jsx`.

#### Glossário

- `qualityOptions`: lista de qualidades disponíveis num conteúdo.
- `playbackUrl`: URL reproduzível usada pelo elemento de vídeo.
- `locked`: marca pública que indica que a qualidade existe, mas não está permitida para o plano.
- `fallback`: escolha automática da melhor qualidade permitida quando a preferência não pode ser usada.
- `qualityRank`: número usado para comparar `720p`, `1080p` e `2160p`.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF63` determina que a qualidade máxima é imposta no backend e que URLs bloqueadas não chegam ao frontend.
- Uma preferência de utilizador não é uma permissão. O utilizador pode preferir 4K, mas o service só deve entregar 4K se o plano permitir.
- O backend deve devolver estados observáveis: qualidade permitida com URL, qualidade bloqueada sem URL e razão do bloqueio.
- O frontend deve respeitar `locked` e nunca reconstruir URLs de média.
- `DERIVADO`: mostrar a opção bloqueada na UI ajuda o aluno a perceber a diferença entre disponibilidade do conteúdo e permissão do plano.
- Testar fallback é tão importante como testar sucesso, porque a preferência antiga do utilizador pode ficar acima do plano atual.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Subscrições | `backend/src/modules/subscriptions/subscriptions.service.js` | Exporta `qualityRankForValue` e `filterQualityOptionsByEntitlements`. |
| Playback | `backend/src/modules/playback/playback.service.js` | Resolve acesso efetivo, filtra qualidades e escolhe média permitida. |
| Página frontend | `frontend/src/pages/PlaybackPage.jsx` | Mostra seletor com opções bloqueadas desativadas. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova filtro, fallback e ausência de URL bloqueada. |
| Handoff | `BK-MF9-03` | Acesso efetivo por família passa a alimentar o mesmo filtro. |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/modules/playback/playback.service.js`
- EDITAR: `frontend/src/pages/PlaybackPage.jsx`
- CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
- REVER: `backend/src/modules/subscriptions/subscription-access.middleware.js`

#### Tutorial técnico linear

### Passo 1 - Criar filtro de qualidade por entitlement

1. Objetivo funcional do passo no contexto da app.

Transformar `qualityOptions` numa resposta pública segura.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: junto de `qualityRankForValue`.

3. Instruções do que fazer.

Cria uma função exportada que recebe opções de qualidade e entitlements. Se a qualidade estiver acima do plano, remove qualquer campo reproduzível e marca a opção como bloqueada.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/subscriptions/subscriptions.service.js
/**
 * Filtra opções de qualidade conforme entitlements sem expor URLs bloqueadas.
 *
 * @param {object[]} options Opções vindas do catálogo.
 * @param {object} entitlements Entitlements efetivos do utilizador.
 * @returns {object[]} Opções públicas para o player.
 */
export function filterQualityOptionsByEntitlements(options = [], entitlements = ENTITLEMENTS.none) {
  const maxRank = Number(entitlements.qualityRank ?? qualityRankForValue(entitlements.maxQuality));

  return options.map((option) => {
    const rank = qualityRankForValue(option.value ?? option.label);
    if (!rank || rank <= maxRank) {
      return { ...option, locked: false };
    }

    // Remover URLs bloqueadas é a barreira real; `locked` é apenas feedback para a UI.
    const { playbackUrl: _playbackUrl, src: _src, ...safeOption } = option;
    return {
      ...safeOption,
      locked: true,
      requiredTier: "family",
      lockedReason: "Disponível no plano Família.",
    };
  });
}
```

5. Explicação do código.

A função compara cada opção com a qualidade máxima do plano. As opções permitidas mantêm `playbackUrl`; as bloqueadas perdem `playbackUrl` e `src`. Isto cumpre `RF63`: o frontend pode saber que existe 4K, mas não recebe a URL se o plano não permitir. O aluno pode adaptar a mensagem `lockedReason`, mas não deve devolver URL bloqueada.

6. Validação do passo.

Com entitlements Pro (`qualityRank: 1080`), uma opção `2160p` deve sair com `locked: true` e sem `playbackUrl`.

7. Cenário negativo/erro esperado.

Se a opção bloqueada ainda tiver `playbackUrl`, o teste de segurança do BK deve falhar.

### Passo 2 - Resolver média reproduzível no backend

1. Objetivo funcional do passo no contexto da app.

Escolher a melhor média permitida sem confiar na preferência enviada pelo utilizador.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/playback/playback.service.js`
    - LOCALIZAÇÃO: imports do topo e função `resolvePlayableMedia`.

3. Instruções do que fazer.

Confirma que o ficheiro importa `filterQualityOptionsByEntitlements` e `qualityRankForValue` a partir do módulo de subscrições. Depois filtra as qualidades antes de escolher `playbackUrl`. Se a preferência guardada estiver bloqueada, usa a qualidade permitida mais alta.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/playback/playback.service.js
import {
  filterQualityOptionsByEntitlements,
  getEffectiveSubscriptionAccess,
  qualityRankForValue,
} from "../subscriptions/subscriptions.service.js";

/**
 * Resolve média reproduzível sem construir URLs a partir de input do utilizador.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo publicado.
 * @param {{ audioLanguage: string, quality: string }} preferences Preferências guardadas.
 * @param {Record<string, unknown>} entitlements Entitlements efetivos.
 * @returns {{ playbackUrl: string, selectedAudioLanguage: string, selectedQuality: string }} Média segura.
 */
function resolvePlayableMedia(content, preferences, entitlements) {
  const selectedAudio = content.tracks?.audio?.find(
    (track) => track.language === preferences.audioLanguage,
  );
  const qualityOptions = filterQualityOptionsByEntitlements(
    content.qualityOptions ?? [],
    entitlements,
  );
  const allowedQualityOptions = qualityOptions
    .filter((option) => !option.locked && option.playbackUrl)
    .sort((left, right) => qualityRankForValue(left.value) - qualityRankForValue(right.value));
  const selectedQuality = allowedQualityOptions.find(
    (option) => option.value === preferences.quality,
  );
  // O fallback evita falha de reprodução quando o utilizador tinha preferido 4K num plano Pro.
  const fallbackQuality = selectedQuality ?? allowedQualityOptions[allowedQualityOptions.length - 1];

  return {
    playbackUrl: selectedAudio?.src ?? fallbackQuality?.playbackUrl ?? content.media.playbackUrl,
    selectedAudioLanguage: selectedAudio?.language ?? "",
    selectedQuality: fallbackQuality?.value ?? "",
  };
}
```

5. Explicação do código.

O conteúdo traz várias qualidades, as preferências trazem a escolha anterior e os entitlements dizem o limite do plano. A função junta os três dados, mas só considera opções não bloqueadas para escolher URL. Se a preferência não for permitida, usa a melhor qualidade autorizada. Isto evita que uma preferência antiga ou manipulada crie acesso acima do plano.

6. Validação do passo.

Com preferência `2160p` e plano Pro, a resposta deve escolher `1080p` se essa opção existir.

7. Cenário negativo/erro esperado.

Se o conteúdo não tiver nenhuma qualidade permitida, o fallback final deve usar `content.media.playbackUrl` em vez de devolver valor vazio.

### Passo 3 - Publicar playback com entitlements efetivos

1. Objetivo funcional do passo no contexto da app.

Garantir que o endpoint de playback usa o acesso efetivo da subscrição antes de devolver conteúdo.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/playback/playback.service.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: `publicPlaybackContent` e `getPlayback`.

3. Instruções do que fazer.

Mantém o import de `getEffectiveSubscriptionAccess` apresentado no passo anterior. Chama `getEffectiveSubscriptionAccess(userId)`, passa `effectiveAccess.entitlements` para `publicPlaybackContent` e inclui `qualityOptions` filtradas na resposta.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/playback/playback.service.js
/**
 * Converte conteúdo para o formato público de reprodução.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo.
 * @param {Record<string, string>} preferences Preferências do utilizador.
 * @param {Record<string, unknown>} entitlements Entitlements efetivos.
 * @returns {Record<string, unknown>} Conteúdo público de reprodução.
 */
function publicPlaybackContent(content, preferences, entitlements) {
  return {
    id: String(content._id),
    title: content.title,
    durationSeconds: content.durationSeconds,
    media: resolvePlayableMedia(content, preferences, entitlements),
    tracks: content.tracks ?? { subtitles: [], audio: [] },
    // A UI recebe o estado das opções, mas não recebe URL acima do plano.
    qualityOptions: filterQualityOptionsByEntitlements(content.qualityOptions ?? [], entitlements),
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

  const preferences = await getMediaPreferences(userId);
  const effectiveAccess = await getEffectiveSubscriptionAccess(userId);
  const progress = await db.collection("playback_progress").findOne({ userId: userObjectId, contentId: contentObjectId });

  return {
    content: publicPlaybackContent(content, preferences, effectiveAccess.entitlements),
    progress: publicProgress(progress, content.durationSeconds),
  };
}
```

5. Explicação do código.

`getPlayback` valida conteúdo publicado e controlo parental, carrega preferências e só depois resolve entitlements. O acesso efetivo vem do backend e poderá ser próprio ou familiar no próximo BK. A resposta inclui `entitlements` para feedback de UI e `qualityOptions` já filtradas. Isto preserva os contratos de MF2 e acrescenta `RF63` sem duplicar endpoints.

6. Validação do passo.

Faz um pedido autenticado a `GET /api/playback/:contentId` com plano Pro e conteúdo com 4K. A opção 4K deve vir bloqueada e sem URL.

7. Cenário negativo/erro esperado.

Conteúdo não publicado deve continuar a devolver HTTP `404`, mesmo que o utilizador tenha plano Família.

### Passo 4 - Atualizar seletor de qualidade no frontend

1. Objetivo funcional do passo no contexto da app.

Mostrar ao utilizador as qualidades permitidas e bloqueadas sem permitir selecionar as bloqueadas.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/pages/PlaybackPage.jsx`
    - LOCALIZAÇÃO: controlo `<select>` de qualidade.

3. Instruções do que fazer.

Renderiza todas as opções recebidas do backend, mas usa `disabled={option.locked}` nas bloqueadas. O valor enviado por `updatePreference` continua a ser apenas `option.value`.

4. Código completo, correto e integrado com a app final.

```jsx
// frontend/src/pages/PlaybackPage.jsx
<label>
  Qualidade
  <select
    value={qualityValue}
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

O seletor recebe as opções públicas da API. Quando `locked` é verdadeiro, o browser mostra a opção, mas impede seleção. A UI não tenta criar URL, não muda regra de plano e não esconde completamente a existência de 4K. Isto melhora feedback sem enfraquecer segurança.

6. Validação do passo.

Com plano Pro, abre um conteúdo com `2160p`: a opção deve aparecer desativada e o vídeo deve reproduzir em `1080p` ou fallback permitido.

7. Cenário negativo/erro esperado.

Se o utilizador tentar forçar a preferência bloqueada pelo DevTools, o backend deve continuar a devolver fallback permitido.

### Passo 5 - Testar filtro e ausência de URL bloqueada

1. Objetivo funcional do passo no contexto da app.

Provar a regra de segurança isolada, sem depender de browser.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: imports do topo e suite MF9 de qualidade.

3. Instruções do que fazer.

No ficheiro de testes criado em `BK-MF9-01`, confirma que os imports de `node:assert/strict` e `filterQualityOptionsByEntitlements` existem. Depois testa `filterQualityOptionsByEntitlements` diretamente com uma opção `1080p` e uma `2160p`.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterQualityOptionsByEntitlements,
} from "../../src/modules/subscriptions/subscriptions.service.js";

test("MF9 filtra qualidade e não expõe playbackUrl bloqueado", () => {
  const filtered = filterQualityOptionsByEntitlements(
    // O cenário inclui 4K com URL para provar que o backend remove dados sensíveis em planos Pro.
    [
      { value: "1080p", label: "Full HD", playbackUrl: "https://media/1080.mp4" },
      { value: "2160p", label: "4K", playbackUrl: "https://media/4k.mp4" },
    ],
    { qualityRank: 1080, maxQuality: "1080p" },
  );

  // A qualidade permitida fica reproduzível; a bloqueada fica apenas informativa.
  assert.equal(filtered[0].locked, false);
  assert.equal(filtered[0].playbackUrl, "https://media/1080.mp4");
  assert.equal(filtered[1].locked, true);
  assert.equal("playbackUrl" in filtered[1], false);
});
```

5. Explicação do código.

O teste chama o filtro sem HTTP para isolar a regra. A primeira opção fica intacta porque está dentro do plano. A segunda perde `playbackUrl`, que é a propriedade sensível para reprodução. Se este teste falhar, `RF63` não está cumprido.

6. Validação do passo.

Executa os testes do backend e confirma que este caso passa.

7. Cenário negativo/erro esperado.

Se a opção 4K continuar com `playbackUrl`, a assert deve falhar.

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
        media: { playbackUrl: "https://media/default.mp4" },
        tracks: { subtitles: [], audio: [] },
        // O teste simula conteúdo com 4K para provar que o plano Pro fica limitado.
        qualityOptions: [
          { value: "1080p", label: "Full HD", playbackUrl: "https://media/1080.mp4" },
          { value: "2160p", label: "4K", playbackUrl: "https://media/4k.mp4" },
        ],
      },
    ]),
  });

  const response = await getPlayback(String(contentId), String(userId));

  // A resposta pública deve reproduzir a melhor qualidade permitida e nunca a URL bloqueada.
  assert.equal(response.content.media.playbackUrl, "https://media/1080.mp4");
  assert.equal(response.content.qualityOptions[1].locked, true);
  assert.equal("playbackUrl" in response.content.qualityOptions[1], false);
});
```

5. Explicação do código.

O teste monta o fluxo completo de playback sem servidor HTTP. O utilizador tem plano Pro, mas a preferência pede 4K. A resposta deve escolher `1080p` e marcar 4K como bloqueado. Isto prova que o backend não usa a preferência como permissão e que a UI fica protegida mesmo com estado antigo. As funções auxiliares de coleção e seed continuam a vir da base de testes construída em `BK-MF9-01`, por isso este passo não cria uma segunda infraestrutura de testes.

6. Validação do passo.

Executa a suite do backend. O teste deve passar sem alterar dados reais.

7. Cenário negativo/erro esperado.

Se `response.content.media.playbackUrl` for a URL 4K, o BK está inseguro e não pode avançar.

### Passo 7 - Fechar validação e handoff para família

1. Objetivo funcional do passo no contexto da app.

Confirmar que a qualidade por plano está pronta para acesso próprio e para acesso familiar.

2. Ficheiros envolvidos:
    - REVER: `backend/src/modules/playback/playback.service.js`
    - REVER: `frontend/src/pages/PlaybackPage.jsx`
    - REVER: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: outputs de teste e resposta de playback.

3. Instruções do que fazer.

Regista uma prova com plano Pro bloqueado em 4K e uma prova com plano Família autorizado quando o conteúdo tiver 4K.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O código já foi criado nos passos anteriores; aqui o trabalho é validar o contrato de handoff.

5. Explicação do código.

O filtro aceita entitlements como entrada. Isso significa que `BK-MF9-03` pode mudar a origem do acesso para família sem reescrever o player.

6. Validação do passo.

Executa:

```bash
cd backend
npm test
```

7. Cenário negativo/erro esperado.

Se uma resposta Pro expuser URL 4K, o resultado esperado é bloquear o PR.

#### Critérios de aceite

- Pro e trial ficam limitados a `1080p`.
- Família pode receber `2160p/4K` quando o conteúdo tiver essa opção.
- Qualidades bloqueadas aparecem sem `playbackUrl` e sem `src`.
- Preferência acima do plano faz fallback para a melhor qualidade permitida.
- O seletor de qualidade desativa opções bloqueadas.
- Os testes cobrem filtro, fallback e ausência de URL bloqueada.

#### Validação final

- `cd backend && npm test`
- `cd frontend && npm run build`
- Pedido autenticado a `GET /api/playback/:contentId`
- Negativos: preferência 4K em Pro, conteúdo não publicado e subscrição expirada.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: resposta de playback Família com 4K permitido.
- `neg`: resposta Pro com 4K bloqueado e sem URL.
- `fonte`: `RF15`, `RF63`, `RNF29`, `BK-MF2-06`, `BK-MF9-01`.

#### Handoff

Este BK entrega o filtro de qualidade baseado em entitlements. `BK-MF9-03` deve alimentar o mesmo filtro com acesso efetivo por Família, sem criar outra regra de playback.

#### Changelog

- `2026-06-30`: guia revisto com enforcement backend, fallback, UI bloqueada, testes e handoff para partilha familiar.
- `2026-07-01`: texto normalizado para português de Portugal com acentuação e blocos de código/teste reforçados com imports, contexto e comentários didáticos.
