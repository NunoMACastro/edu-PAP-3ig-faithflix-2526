# BK-MF2-08 - Teste E2E do fluxo principal

## Header

- `doc_id`: `GUIA-BK-MF2-08`
- `bk_id`: `BK-MF2-08`
- `macro`: `MF2`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-06,BK-MF2-07`
- `rf_rnf`: `RNF07, RNF08`
- `fase_documental`: `Fase 2`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-01`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais aprender a distinguir duas provas Playwright diferentes:

1. o E2E funcional da MF2, que percorre login, catálogo, detalhe, biblioteca e
   progresso e que exige uma base `_e2e` dedicada e um seed separado;
2. a prova browser isolada do player, que usa apenas `preview`, route
   interception e fixtures sintéticas locais progressive/HLS/DASH, sem backend,
   seed ou MongoDB.

A prova browser de media já demonstrada na referência é `9/9`: três protocolos
em Chromium, Firefox e WebKit. O E2E funcional MF2 não foi reexecutado neste
checkpoint e não pode ser apresentado como prova atual.

#### Importância

Um elemento `<video>` renderizado não prova que existe reprodução. A prova
isolada exige uma fonte canónica, media válida, `loadedmetadata`/`canplay`,
cleanup do adapter e zero pedidos externos. Ao mesmo tempo, esta fixture de
canvas não representa vídeo real nem mede produção; por isso não fecha `RNF08`
ou `RNF10`.

Separar as suites evita dois falsos verdes frequentes:

- usar mocks de API/media e dizer que login, DB e fluxo funcional passaram;
- medir uma fixture local de 320×180 e apresentá-la como 4K, CDN ou streaming
  real.

#### Scope-in

- Gerar fixtures sintéticas de canvas num fMP4 H.264 baseline local.
- Manter checksums SHA-256 dos três binários.
- Servir MP4 progressive, HLS e DASH por route interception com HTTP Range.
- Executar o frontend apenas por build/`preview` em `mode=test`.
- Intercetar sessão, CSRF e playback no browser, sem arrancar backend.
- Bloquear rede não-loopback.
- Validar uma única `content.source = { url, protocol, mimeType }`.
- Confirmar que `qualityOptions` e `tracks` públicas não contêm fontes.
- Automatizar Chromium, Firefox e WebKit.
- Registar separadamente o E2E funcional MF2 como pendente enquanto não existir
  DB `_e2e` dedicada autorizada.

#### Scope-out

- Vídeos, pessoas, filmes, séries ou áudio reais.
- Prova de resolução 4K, CDN, ABR, DRM ou latência de produção.
- Teste de 100 streams simultâneos.
- Execução de seed, migração ou escrita em MongoDB na suite de media.
- Promover o resultado isolado a prova do fluxo funcional MF2.
- Safari real, Chrome/Edge branded e revisão manual final.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- Node.js e dependências root/frontend instaladas.
- Browsers Playwright locais disponíveis.
- Build frontend compatível com `--mode test`.
- Porta de preview loopback livre.
- Nenhuma variável MongoDB é necessária para `test:media:browser`.
- Se o E2E funcional MF2 for tentado noutra sessão, tem de existir primeiro uma
  DB dedicada cujo nome termine em `_e2e`; esta condição não autoriza executá-lo
  neste checkpoint.

#### Glossário

- `fMP4`: MP4 fragmentado com inicialização `ftyp/moov` e fragmentos
  `moof/mdat`.
- `progressive`: fonte MP4 ligada diretamente ao elemento de vídeo.
- `HLS`: manifest `.m3u8`; usa suporte nativo ou `hls.js`.
- `DASH`: manifest `.mpd`; usa `dashjs`.
- `preview-only`: o teste serve um build estático Vite; não usa watcher/dev
  server.
- `route interception`: Playwright responde a pedidos controlados sem depender
  de servidores ou Internet.
- `loopback`: hosts locais `127.0.0.1`, `localhost` e `::1`.

#### Conceitos teóricos essenciais

- A resposta autenticada de playback contém exatamente uma fonte autorizada em
  `content.source`.
- `source.protocol` só aceita `progressive`, `hls` ou `dash`.
- `qualityOptions` expõe apenas `value`, `label`, `locked`, `selected` e,
  opcionalmente, `requiredTier`/`lockedReason`; nunca contém URL.
- `tracks` públicas são descritores sem `url`, `src`, `playbackUrl` ou `source`.
- O browser não escolhe nem constrói fontes; liga o adapter indicado pelo
  backend/interception.
- `loadedmetadata` e `canplay` provam o adapter local, não performance real.
- O E2E funcional e a prova isolada de media têm comandos, dados e estados
  independentes.

### Tempo estimado

- Rever contratos e separar suites: 20 min.
- Gerar/verificar fixtures e checksums: 35 min.
- Configurar rede e API interceptada: 45 min.
- Configurar preview e matriz browser: 35 min.
- Executar/diagnosticar os nove casos: 45 min.
- Registar evidence e limites: 20 min.

### Erros comuns

- Encadear seed e browser no mesmo script.
- Usar `vite dev`/watcher como servidor de evidence formal.
- Ativar `reuseExistingServer` e reutilizar uma app desconhecida.
- Arrancar backend/MongoDB para um teste que pode ser totalmente interceptado.
- Expor URLs em cada opção de qualidade.
- Permitir Internet porque as fixtures são locais.
- Tratar a label `4K` como resolução física da fixture.
- Fechar `RNF08`, `RNF10` ou streaming real com `canplay` local.

### Check de compreensao

- [ ] Sei explicar a diferença entre E2E funcional e prova browser isolada.
- [ ] Sei porque a suite de media não usa seed nem DB.
- [ ] Sei identificar a única fonte pública autorizada.
- [ ] Sei explicar o papel dos checksums.
- [ ] Sei justificar `RNF23=PARCIAL_VALIDADO` e
      `RNF08/RNF10=NAO_PROVADO`.

#### Arquitetura do BK

| Área | Contrato |
| --- | --- |
| Config media | `playwright.media.config.js` |
| Spec media | `tests/e2e/media-fixtures.spec.js` |
| Política de rede | `tests/e2e/network-policy.js` e fixture Playwright comum |
| Fixtures | `tests/fixtures/media/` |
| Geração | `scripts/generate-synthetic-media.mjs` |
| Integridade | `scripts/check-media-fixtures.mjs` |
| Frontend | build + `preview --mode test`; sem dev server/watch |
| Backend/DB/seed | não arrancam nem são usados na suite media |
| Browsers | Chromium, Firefox e WebKit |
| Matriz | 3 protocolos × 3 browsers = 9 casos |
| DTO | uma única `content.source`; opções/faixas sem fontes |
| Rede | apenas loopback; qualquer host externo é abortado/falha |
| E2E MF2 funcional | separado e `NAO_REVALIDADO` neste checkpoint |

### Manifesto das fixtures sintéticas

As fixtures são geradas localmente por um `canvas` animado, sem conteúdo real,
áudio ou downloads. O resultado atual é H.264 baseline, 320×180, cerca de 12 fps
e duração curta:

| Ficheiro | Função |
| --- | --- |
| `synthetic-progressive.mp4` | fMP4 completo para progressive |
| `synthetic-init.mp4` | inicialização `ftyp/moov` para HLS/DASH |
| `synthetic-segment.m4s` | fragmentos `moof/mdat` |
| `synthetic.m3u8` | HLS VOD local com `EXT-X-MAP` |
| `synthetic.mpd` | DASH estático local com `SegmentList` |

Checksums auditados em 2026-07-10:

```text
8275def5ed2b836720880da54bce49f8de0aeb137f85b6ded5543e5883a93e20  synthetic-progressive.mp4
a310f52c490f9b3b04dfbd8c355265c4f918bc92207bbf36e574a72cc5e5e917  synthetic-init.mp4
50c9b1272b5f225c244a405a06ba7a41b18a3a7c30e034138ee396df5e5ca004  synthetic-segment.m4s
```

Uma regeneração pode produzir bytes diferentes entre browser/OS. Alterar uma
fixture exige revisão deliberada e atualização dos checksums; nunca aceitar o
novo hash automaticamente só para fazer o teste passar.

### Decisoes tecnicas

- `CANONICO`: media sintética é prova técnica local, não conteúdo do produto.
- `CANONICO`: `test:media:browser` tem zero seed, zero backend e zero DB.
- `CANONICO`: build e preview usam `mode=test`; produção não é apontada para uma
  API HTTP loopback fictícia.
- `CANONICO`: `reuseExistingServer` fica `false` em evidence formal.
- `CANONICO`: toda a API necessária é interceptada e a política de rede é
  fail-closed fora de loopback.
- `CANONICO`: o DTO público tem uma única fonte; listas públicas não transportam
  fontes alternativas.
- `DERIVADO`: o E2E funcional MF2 mantém seed separado e só poderá ser executado
  com guard + DB `_e2e` explícita.

#### Ficheiros a criar/editar/rever

- EDITAR: `package.json`
- REVER: `frontend/package.json`
- REVER: `tests/e2e/mf2-flow.spec.js`
- CRIAR: `backend/scripts/seed-safety.js`
- EDITAR: `backend/scripts/seed-mf2-e2e.js`
- EDITAR: `backend/scripts/seed-mf4-e2e.js`
- EDITAR: `backend/scripts/seed-mf9-e2e.js`
- EDITAR: `backend/src/config/env.js`

#### Tutorial técnico linear

### Passo 1 - Separar os scripts de media do E2E funcional

1. Objetivo do passo.

Garantir que a prova do player não pode acidentalmente ligar a MongoDB ou correr
o seed MF2.

2. Ficheiros envolvidos.
    - EDITAR: `package.json`
    - REVER: `frontend/package.json`
    - LOCALIZACAO: scripts root e script `preview`

3. Instrucoes concretas.

Cria scripts dedicados. Não reutilizes `e2e:mf2` e não introduzas
`seed:e2e:*`, `MONGODB_*` ou `TEST_MONGODB_*` nestes comandos.

4. Codigo aplicavel.

```json
{
  "scripts": {
    "check:media": "node scripts/check-media-fixtures.mjs",
    "test:media:browser": "VITE_API_BASE_URL=http://127.0.0.1:3199 npm --prefix frontend run build -- --mode test && npm exec playwright -- test --config=playwright.media.config.js"
  }
}
```

5. Explicacao.

A API loopback é apenas a origem que Playwright interceta. `--mode test` impede
usar a configuração de produção e `preview` serve exatamente o build acabado de
criar.

6. Validacao.

```bash
npm run check:media
npm exec playwright -- test --config=playwright.media.config.js --list
```

Resultado esperado: integridade `PASS` e nove casos descobertos.

7. Negativo.

Se o script contiver seed, backend, MongoDB ou `vite dev`, a separação falhou.

### Passo 2 - Gerar e verificar o fMP4 de canvas

1. Objetivo do passo.

Produzir media mínima sem conteúdo real nem dependência de Internet.

2. Ficheiros envolvidos.
    - CRIAR/EDITAR: `scripts/generate-synthetic-media.mjs`
    - CRIAR/EDITAR: `tests/fixtures/media/*`
    - CRIAR/EDITAR: `scripts/check-media-fixtures.mjs`

3. Instrucoes concretas.

O gerador usa Chromium local, `canvas.captureStream(12)` e `MediaRecorder` com
`video/mp4;codecs=avc1.42E01E`. Separa a inicialização e o fragmento, normaliza
timing e escreve HLS/DASH locais. O checker calcula SHA-256 e rejeita
`http://`/`https://` dentro dos manifests/README.

4. Comandos.

```bash
node scripts/generate-synthetic-media.mjs --output-dir=tests/fixtures/media
node scripts/check-media-fixtures.mjs
```

5. Explicacao.

O checksum torna alterações binárias observáveis. O vídeo mostra apenas formas
e texto de diagnóstico desenhados em canvas; não é um asset editorial.

6. Validacao.

Confirma `ftyp/moov` na inicialização, `moof/mdat` no segmento e os três hashes
da tabela.

7. Negativo.

Não regenerar fixtures durante uma validação normal. Se o hash divergir, parar e
rever a causa.

### Passo 3 - Aplicar uma política de rede fail-closed

1. Objetivo do passo.

Servir as fixtures por interception, incluindo pedidos Range, e bloquear
qualquer rede não-loopback.

2. Ficheiros envolvidos.
    - CRIAR/EDITAR: `tests/e2e/network-policy.js`
    - CRIAR/EDITAR: `tests/e2e/test.js`

3. Instrucoes concretas.

Instala uma route global automática antes de cada teste. Valida primeiro o host,
responde aos paths `/__fixtures__/...` apenas em loopback, continua os restantes
pedidos locais e aborta o exterior. A fixture automática acumula cada tentativa
externa e falha no teardown, mesmo quando a página tolera o pedido abortado.

4. Codigo aplicavel.

```js
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const FIXTURE_ROOT = resolve("tests/fixtures/media");

const fixtureRoutes = new Map([
  ["/__fixtures__/synthetic-progressive.mp4", { path: resolve(FIXTURE_ROOT, "synthetic-progressive.mp4"), contentType: "video/mp4" }],
  ["/__fixtures__/synthetic-init.mp4", { path: resolve(FIXTURE_ROOT, "synthetic-init.mp4"), contentType: "video/mp4" }],
  ["/__fixtures__/synthetic-segment.m4s", { path: resolve(FIXTURE_ROOT, "synthetic-segment.m4s"), contentType: "video/mp4" }],
  ["/__fixtures__/synthetic.m3u8", { path: resolve(FIXTURE_ROOT, "synthetic.m3u8"), contentType: "application/vnd.apple.mpegurl" }],
  ["/__fixtures__/synthetic.mpd", { path: resolve(FIXTURE_ROOT, "synthetic.mpd"), contentType: "application/dash+xml" }],
]);

function parseByteRange(header, size) {
  const match = String(header ?? "").match(/^bytes=(\d+)-(\d*)$/u);
  if (!match) return null;

  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  const end = Math.min(requestedEnd, size - 1);
  return Number.isInteger(start) && Number.isInteger(end) && start <= end
    ? { start, end }
    : null;
}

async function fulfillFixtureWithOptionalRange(route, fixture) {
  const body = await readFile(fixture.path);
  const rangeHeader = route.request().headers().range;
  const range = parseByteRange(rangeHeader, body.length);

  // Um Range malformado falha explicitamente; nunca se responde 200 ao pedido inválido.
  if (rangeHeader && !range) {
    await route.fulfill({
      status: 416,
      headers: { "content-range": `bytes */${body.length}` },
    });
    return;
  }

  if (range) {
    const partialBody = body.subarray(range.start, range.end + 1);
    await route.fulfill({
      status: 206,
      contentType: fixture.contentType,
      headers: {
        "accept-ranges": "bytes",
        "content-range": `bytes ${range.start}-${range.end}/${body.length}`,
        "content-length": String(partialBody.length),
      },
      body: partialBody,
    });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: fixture.contentType,
    headers: {
      "accept-ranges": "bytes",
      "content-length": String(body.length),
    },
    body,
  });
}

export async function installDeterministicNetworkPolicy(context) {
  const externalAttempts = new Set();

  // Uma única route global cobre também pedidos internos criados por HLS/DASH.
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());

    // O host é validado antes do pathname para uma origem externa nunca se disfarçar de fixture.
    if (!LOOPBACK_HOSTS.has(requestUrl.hostname)) {
      externalAttempts.add(
        `${requestUrl.protocol}//${requestUrl.host}${requestUrl.pathname}`,
      );
      await route.abort("blockedbyclient");
      return;
    }

    const fixture = fixtureRoutes.get(requestUrl.pathname);
    if (fixture) {
      await fulfillFixtureWithOptionalRange(route, fixture);
      return;
    }

    await route.continue();
  });

  return Object.freeze({
    assertNoExternalRequests() {
      if (externalAttempts.size > 0) {
        // O erro expõe apenas a contagem; querystrings potencialmente sensíveis não entram no output.
        throw new Error(`EXTERNAL_NETWORK_ATTEMPT:${externalAttempts.size}`);
      }
    },
  });
}
```

`tests/e2e/test.js` instala a política como fixture automática e verifica a
contagem no teardown de cada teste:

```js
import { expect, test as base } from "@playwright/test";
import { installDeterministicNetworkPolicy } from "./network-policy.js";

export { expect };

export const test = base.extend({
  deterministicNetworkPolicy: [
    async ({ context }, use) => {
      // A fixture automática cobre todos os testes que importam `test` deste módulo.
      const policy = await installDeterministicNetworkPolicy(context);
      await use(policy);
      policy.assertNoExternalRequests();
    },
    { auto: true },
  ],
});
```

5. Explicacao.

HLS/DASH fazem vários pedidos. A allowlist global evita que uma biblioteca ou
manifest alterado contacte uma origem externa sem o teste perceber. Validar o
host antes de procurar a fixture impede que
`https://externo.invalid/__fixtures__/synthetic.m3u8` seja satisfeito como se
fosse local. O erro final contém apenas a contagem para não copiar querystrings.

6. Validacao.

Confirma respostas `200`/`206`, `Accept-Ranges` e `Content-Range` válidos. Num
teste negativo, pede uma fixture através de um host não-loopback: o pedido deve
ser abortado e o teardown deve falhar com `EXTERNAL_NETWORK_ATTEMPT:1`.

7. Negativo.

Uma URL fora de loopback tem de ser abortada e registada como falha, não
silenciosamente ignorada. As specs importam sempre `test` e `expect` de
`./test.js`, nunca diretamente de `@playwright/test`.

### Passo 4 - Configurar preview-only em mode test

1. Objetivo do passo.

Executar um build determinístico, sem watcher e sem reutilizar processos.

2. Ficheiros envolvidos.
    - CRIAR/EDITAR: `playwright.media.config.js`

3. Instrucoes concretas.

Usa apenas a spec de media, output temporário e três engines. O servidor é o
`preview` do frontend em loopback.

4. Codigo completo.

```js
import { defineConfig, devices } from "@playwright/test";

// A matriz cobre engines distintas; browsers branded e Safari real permanecem validação manual.
// `reuseExistingServer: false` impede que um servidor antigo contamine a execução formal.
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "media-fixtures.spec.js",
  outputDir: "/tmp/faithflix-media-playwright",
  use: {
    baseURL: "http://127.0.0.1:5182",
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm --prefix frontend run preview -- --mode test --host 127.0.0.1 --port 5182",
    url: "http://127.0.0.1:5182",
    reuseExistingServer: false,
  },
});
```

5. Explicacao.

`reuseExistingServer:false` garante que o processo pertence à execução. Desligar
traces/screenshots/vídeo evita artefactos desnecessários para esta matriz curta.

6. Validacao.

O comando `--list` deve mostrar progressive, HLS e DASH em cada engine.

7. Negativo.

Uma execução em `development`/watcher ou contra um preview já aberto não serve
como evidence formal.

### Passo 5 - Intercetar sessão e playback com DTO fechado

1. Objetivo do passo.

Carregar a página real do player sem backend e sem fontes alternativas públicas.

2. Ficheiros envolvidos.
    - CRIAR/EDITAR: `tests/e2e/media-fixtures.spec.js`

3. Instrucoes concretas.

Intercepta `session/me`, CSRF, playback, progresso e preferências. O playback
devolve exatamente uma fonte e arrays sem URLs.

4. Codigo aplicavel.

```js
// A resposta é exclusivamente sintética e local; não prova streaming real, CDN, 4K ou carga.
function playbackResponse(protocol, fixture) {
  return {
    content: {
      id: `synthetic-${protocol}`,
      title: `Fixture sintética ${protocol}`,
      mediaStatus: "ready",
      isPlayable: true,
      source: {
        url: fixture.url,
        protocol,
        mimeType: fixture.mimeType,
      },
      selectedAudioLanguage: "pt",
      selectedQuality: "720p",
      // As opções descrevem seleção/bloqueio, mas nunca incluem URLs alternativas.
      qualityOptions: [
        {
          value: "720p",
          label: "Fixture local",
          locked: false,
          selected: true,
        },
      ],
      tracks: { subtitles: [], audio: [] },
      preferences: {
        subtitleLanguage: "",
        audioLanguage: "pt",
        quality: "720p",
      },
    },
    progress: { currentTimeSeconds: 0 },
  };
}
```

5. Explicacao.

O frontend exercita routing, sessão, `PlaybackPage` e adapters reais. Só a
fronteira HTTP é simulada. Isso não equivale a autenticação, autorização ou DB
end-to-end.

6. Validacao.

No handler, responde apenas a endpoints esperados e usa `404
UNEXPECTED_TEST_REQUEST` para qualquer API não prevista.

7. Negativo.

Se uma opção/faixa contiver `url`, `src`, `playbackUrl` ou `source`, o teste deve
falhar por violação do DTO público.

### Passo 6 - Validar os nove casos browser

1. Objetivo do passo.

Exigir `loadedmetadata`/`canplay`, zero alertas e zero pedidos externos para cada
protocolo/engine.

2. Ficheiros envolvidos.
    - EXECUTAR: `scripts/check-media-fixtures.mjs`
    - EXECUTAR: `tests/e2e/media-fixtures.spec.js`

3. Instrucoes concretas.

Corre primeiro o checker e depois a matriz. Não executes seeds e não definas
qualquer variável MongoDB.

4. Comandos.

```bash
npm run check:media
npm run test:media:browser
```

5. Explicacao.

O teste faz `video.play()` muted apenas para permitir que Chromium peça buffer
DASH. O sucesso exige `readyState >= 3`, que corresponde a `canplay`.

6. Validacao.

Evidence atual da referência, registada em 2026-07-10: `9/9` — progressive,
HLS e DASH chegaram a `canplay` em Chromium, Firefox e WebKit, com sessão/API
intercetadas, zero rede externa, zero backend, zero MongoDB e zero seeds.

7. Negativo.

Um resultado `8/9` permanece falha. Não reduzir a expectativa, não retirar DASH
e não marcar o browser como verde só porque chegou a metadata.

### Passo 7 - Classificar e isolar o E2E funcional MF2

1. Objetivo do passo.

Evitar que a prova isolada seja usada para fechar o fluxo de produto e definir
um procedimento futuro que não consiga atingir a base normal.

2. Ficheiros envolvidos.
    - REVER: `tests/e2e/mf2-flow.spec.js`
    - CRIAR: `backend/scripts/seed-safety.js`
    - EDITAR: `backend/scripts/seed-mf2-e2e.js`
    - EDITAR: `backend/scripts/seed-mf4-e2e.js`
    - EDITAR: `backend/scripts/seed-mf9-e2e.js`
    - EDITAR: `backend/src/config/env.js`
    - REVER: `playwright.config.js`

3. Instrucoes concretas.

Mantém estes estados separados:

| Prova | Estado atual | Condição de fecho |
| --- | --- | --- |
| Media browser isolada | `VALIDADO_LOCAL 9/9` | Já cobre adapters/DTO locais |
| E2E funcional MF2 atual | `NAO_REVALIDADO` | Seed separado + DB `_e2e` dedicada + três engines |
| `RNF08` | `NAO_PROVADO` | Vídeo e infraestrutura reais + medição reproduzível |
| `RNF10` | `NAO_PROVADO` | Streaming real + teste de carga a 100 reproduções |
| `RNF23` | `PARCIAL_VALIDADO` | Adapters locais verdes; entrega real ainda pendente |

Para qualquer execução funcional futura, os guardas são cumulativos:
`NODE_ENV=test`; opt-in `ALLOW_E2E_SEED=true` apenas no comando de seed;
`TEST_MONGODB_URI` loopback, sem username/password e com `replicaSet`;
`TEST_MONGODB_DB_NAME` explícito e terminado em `_e2e`; `E2E_RUN_ID` novo e
compatível com o nome da base. O browser recebe
exatamente os mesmos `TEST_MONGODB_*`, nunca `MONGODB_*`. Enquanto o run
marker não cobrir todos os documentos criados pelos services, cada execução
formal usa um nome de DB novo. Seed e browser nunca são encadeados num único
script.

4. Codigo.

No `env.js` cumulativo, importa o guard puro e escolhe a configuração de DB
antes de construir `env`. Em `test`, a aplicação e o browser usam diretamente
`TEST_MONGODB_*`; não existe cópia para `MONGODB_*` nem fallback:

```js
import { assertE2eRuntimeEnvironment } from "../../scripts/seed-safety.js";

const nodeEnv = process.env.NODE_ENV ?? "development";
const E2E_MARKERS = [
  "ALLOW_E2E_SEED",
  "E2E_SUITE_ID",
  "E2E_RUN_ID",
  "TEST_MONGODB_URI",
  "TEST_MONGODB_DB_NAME",
];
const formalE2eRequested = nodeEnv === "test" && E2E_MARKERS.some(
  (name) => Boolean(process.env[name]),
);

if (
  nodeEnv === "test" &&
  (process.env.MONGODB_URI || process.env.MONGODB_DB_NAME)
) {
  throw new Error(
    "NODE_ENV=test recusa MONGODB_URI e MONGODB_DB_NAME; usa TEST_MONGODB_* ou setDbForTests().",
  );
}

const e2eDatabase = formalE2eRequested
  ? assertE2eRuntimeEnvironment(process.env)
  : null;
const mongodbUri = e2eDatabase?.mongoUri ?? (
  nodeEnv === "test" ? null : parseMongoUri(required("MONGODB_URI"))
);
const mongodbDbName = e2eDatabase?.mongoDbName ?? (
  nodeEnv === "test" ? null : parseDatabaseName(required("MONGODB_DB_NAME"))
);

// No Object.freeze existente, substitui apenas as três propriedades equivalentes.
export const env = Object.freeze({
  // ...restantes propriedades cumulativas já criadas
  nodeEnv,
  mongodbUri,
  mongodbDbName,
  // ...rateLimitPepper, sessão, origins e restantes propriedades cumulativas
});
```

Os comentários representam propriedades já existentes, não autorizam um
`env` truncado. Conserva todas as propriedades anteriores. `null` é deliberado:
um teste unitário sem markers não liga a MongoDB e só obtém uma base através de
`setDbForTests(dbDouble)`. No `backend/src/config/database.js` cumulativo de
`BK-MF1-04`, acrescenta este guard antes de construir o `MongoClient` e conserva
o restante módulo:

```js
export async function getMongoClient() {
  // Test sem lane E2E só pode chegar aos services através do double explícito.
  if (!env.mongodbUri || !env.mongodbDbName) {
    throw new Error(
      "MongoDB indisponivel em test sem TEST_MONGODB_*; injeta um DB double com setDbForTests().",
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(env.mongodbUri);
    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
}
```

`getDb()` continua a devolver primeiro `testDb`, por isso unitários in-memory
funcionam sem URI. Integração transacional e browser E2E não usam esse escape:
qualquer marker chama o guard completo e exige a lane `TEST_MONGODB_*`.
`ALLOW_E2E_SEED` é apenas marker fail-closed em `env.js`; só a CLI de seed lhe
atribui autorização de escrita.

Cria primeiro o guard completo. Ele não importa `env.js` nem `database.js`,
logo uma seed nunca consegue herdar o fallback ou a base normal da aplicação.

`backend/scripts/seed-safety.js`

```js
const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{7,47}$/u;
const SUITE_ID_PATTERN = /^mf(?:2|4|9)$/u;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function required(source, name) {
  const value = source[name]?.trim();
  if (!value) throw new Error(`${name} tem de ser definida explicitamente.`);
  return value;
}

function assertTestMongoUri(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("TEST_MONGODB_URI invalida.");
  }

  if (parsed.protocol !== "mongodb:") {
    throw new Error("TEST_MONGODB_URI exige mongodb:// local.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("TEST_MONGODB_URI nao pode conter credenciais.");
  }
  if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
    throw new Error("TEST_MONGODB_URI tem de usar apenas loopback.");
  }
  if (!parsed.searchParams.get("replicaSet")?.trim()) {
    throw new Error("TEST_MONGODB_URI exige replicaSet explicito.");
  }

  return value;
}

export function assertE2eRuntimeEnvironment(source = process.env) {
  const suiteId = required(source, "E2E_SUITE_ID");
  if (!SUITE_ID_PATTERN.test(suiteId)) {
    throw new Error("Suite E2E desconhecida.");
  }
  if (source.NODE_ENV !== "test") {
    throw new Error("E2E exige NODE_ENV=test.");
  }
  if (source.MONGODB_URI || source.MONGODB_DB_NAME) {
    throw new Error("Seeds E2E recusam MONGODB_URI e MONGODB_DB_NAME.");
  }

  const runId = required(source, "E2E_RUN_ID");
  if (!RUN_ID_PATTERN.test(runId)) {
    throw new Error("E2E_RUN_ID exige 8-48 caracteres ASCII seguros.");
  }

  const mongoUri = assertTestMongoUri(required(source, "TEST_MONGODB_URI"));
  const mongoDbName = required(source, "TEST_MONGODB_DB_NAME");
  const expectedDbName = `faithflix_${suiteId}_${runId}_e2e`;

  if (mongoDbName !== expectedDbName) {
    throw new Error(
      `TEST_MONGODB_DB_NAME tem de ser exatamente ${expectedDbName}.`,
    );
  }

  return Object.freeze({ suiteId, runId, mongoUri, mongoDbName });
}

export function assertE2eSeedEnvironment(expectedSuiteId, source = process.env) {
  const config = assertE2eRuntimeEnvironment(source);

  if (config.suiteId !== expectedSuiteId) {
    throw new Error("E2E_SUITE_ID nao corresponde a seed executada.");
  }
  if (source.ALLOW_E2E_SEED !== "true") {
    throw new Error("Seeds E2E exigem ALLOW_E2E_SEED=true.");
  }

  return config;
}

function markerFilter(marker) {
  return {
    "e2eFixture.suite": marker.suite,
    "e2eFixture.run": marker.run,
  };
}

export function createFixtureContext(db, { suiteId, runId }) {
  const marker = Object.freeze({ suite: suiteId, run: runId });
  const fields = Object.freeze({ e2eFixture: marker });
  const exactMarker = markerFilter(marker);
  const markedDb = new Proxy(db, {
    get(targetDb, property) {
      if (property !== "collection") {
        const value = Reflect.get(targetDb, property, targetDb);
        return typeof value === "function" ? value.bind(targetDb) : value;
      }

      return (collectionName) => {
        const collection = targetDb.collection(collectionName);
        return new Proxy(collection, {
          get(targetCollection, operation) {
            if (operation === "insertOne") {
              return (document, options) => targetCollection.insertOne(
                { ...document, ...fields },
                options,
              );
            }
            if (operation === "insertMany") {
              return (documents, options) => targetCollection.insertMany(
                documents.map((document) => ({ ...document, ...fields })),
                options,
              );
            }
            if (operation === "replaceOne" || operation === "findOneAndReplace") {
              return (filter, replacement, options) => targetCollection[operation](
                filter,
                { ...replacement, ...fields },
                options,
              );
            }
            if (["updateOne", "updateMany", "findOneAndUpdate"].includes(operation)) {
              return (filter, update, options = {}) => {
                const serializedUpdate = JSON.stringify(update) ?? "";
                if (serializedUpdate.includes('"e2eFixture')) {
                  throw new Error("Uma seed nao pode alterar o marker E2E.");
                }
                const markedUpdate = options.upsert
                  ? {
                      ...update,
                      $setOnInsert: { ...update.$setOnInsert, ...fields },
                    }
                  : update;
                return targetCollection[operation](filter, markedUpdate, options);
              };
            }
            if (["deleteOne", "deleteMany", "bulkWrite"].includes(operation)) {
              throw new Error(
                `${String(operation)} nao e permitido no seed proxy; usa fixture.cleanup().`,
              );
            }

            const value = Reflect.get(
              targetCollection,
              operation,
              targetCollection,
            );
            return typeof value === "function"
              ? value.bind(targetCollection)
              : value;
          },
        });
      };
    },
  });

  return Object.freeze({
    marker,
    fields,
    db: markedDb,
    async cleanup(plan) {
      // Primeira passagem: nenhuma escrita acontece enquanto houver conflito.
      for (const entry of plan) {
        if (!entry.collectionName || !Array.isArray(entry.reservedSelectors)) {
          throw new Error("Plano de cleanup E2E invalido.");
        }
        if (entry.reservedSelectors.length === 0) continue;

        const conflict = await db.collection(entry.collectionName).findOne(
          {
            $and: [
              { $or: entry.reservedSelectors },
              { $nor: [exactMarker] },
            ],
          },
          { projection: { _id: 1 } },
        );

        if (conflict) {
          throw new Error(
            `${entry.collectionName} contem dados reservados sem o marker desta execução.`,
          );
        }
      }

      // Segunda passagem: apenas documentos desta suite/run podem ser apagados.
      for (const entry of plan) {
        await db.collection(entry.collectionName).deleteMany(exactMarker);
      }
    },
  });
}

async function openIsolatedDatabase(config) {
  // O driver só é carregado depois de todos os guardas terem passado.
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(config.mongoUri);

  try {
    await client.connect();
    return { client, db: client.db(config.mongoDbName) };
  } catch (error) {
    await client.close();
    throw error;
  }
}

export async function runE2eSeedCli({ suiteId, seed }) {
  let client;
  let closeApplicationDatabase;
  try {
    const config = assertE2eSeedEnvironment(suiteId);
    const connection = await openIsolatedDatabase(config);
    client = connection.client;
    const fixture = createFixtureContext(connection.db, config);
    const { closeDatabase, setDbForTests } = await import(
      "../src/config/database.js"
    );
    setDbForTests(fixture.db);
    closeApplicationDatabase = closeDatabase;
    await seed({ db: fixture.db, fixture });
    console.log(`Seed ${suiteId} concluida para run ${config.runId}.`);
  } catch (error) {
    console.error(`Seed ${suiteId} recusada: ${error.message}`);
    process.exitCode = 1;
  } finally {
    try {
      await closeApplicationDatabase?.();
    } finally {
      await client?.close();
    }
  }
}
```

Depois integra **as três seeds**, sem reescrever os documentos de domínio já
ensinados nos respetivos BKs. Remove imports/chamadas a `getDb()`, elimina os
`deleteOne/deleteMany` antigos e obtém sempre `db` do callback; o único cleanup
permitido é `fixture.cleanup()`. Cada insert/replace/upsert da fixture recebe
o marker automaticamente pelo proxy; `setDbForTests()` aponta os services para
o mesmo proxy, por isso os documentos criados por helpers também ficam
marcados. Deletes diretos e `bulkWrite` são recusados para impedir escritas que
contornem a marcação.

```js
// seed-mf2-e2e.js
import { runE2eSeedCli } from "./seed-safety.js";

async function seedMf2E2e({ db, fixture }) {
  await fixture.cleanup([
    { collectionName: "subscription_plans", reservedSelectors: [{ code: { $in: ["faithflix-monthly", "faithflix-yearly", "faithflix-family-monthly", "faithflix-family-yearly"] } }] },
    { collectionName: "users", reservedSelectors: [{ email: "e2e@faithflix.test" }] },
    { collectionName: "contents", reservedSelectors: [{ slug: "piloto-faithflix" }] },
    { collectionName: "sessions", reservedSelectors: [{ userId }] },
    { collectionName: "subscriptions", reservedSelectors: [{ userId }] },
    { collectionName: "trials", reservedSelectors: [{ userId }] },
    { collectionName: "playback_progress", reservedSelectors: [{ userId }, { contentId }] },
    { collectionName: "user_content_lists", reservedSelectors: [{ userId }, { contentId }] },
    { collectionName: "media_preferences", reservedSelectors: [{ userId }] },
  ]);
  // Mantém aqui, sem alterações, todos os inserts completos já existentes.
  // O `db` recebido é o proxy que acrescenta o marker automaticamente.
}

await runE2eSeedCli({ suiteId: "mf2", seed: seedMf2E2e });
```

O mesmo wrapper é obrigatório nas seeds MF4 e MF9; os seletores abaixo são a
allowlist mínima de colisões a copiar para os respetivos planos de cleanup.

```js
// seed-mf4-e2e.js
import { runE2eSeedCli } from "./seed-safety.js";

async function seedMf4E2e({ db, fixture }) {
  await fixture.cleanup([
    { collectionName: "subscription_plans", reservedSelectors: [{ code: { $in: ["faithflix-monthly", "faithflix-yearly", "faithflix-family-monthly", "faithflix-family-yearly"] } }] },
    { collectionName: "sessions", reservedSelectors: [{ userId: { $in: [adminId, userId, charityUserId] } }] },
    { collectionName: "users", reservedSelectors: [{ email: { $in: [ADMIN_EMAIL, USER_EMAIL, CHARITY_USER_EMAIL] } }] },
    { collectionName: "charity_applications", reservedSelectors: [{ email: APPLICATION_EMAIL }] },
    { collectionName: "charities", reservedSelectors: [{ name: CHARITY_NAME }] },
    { collectionName: "charity_memberships", reservedSelectors: [{ charityId }] },
    { collectionName: "subscriptions", reservedSelectors: [{ userId: { $in: [userId, charityUserId] } }] },
    { collectionName: "trials", reservedSelectors: [{ userId: { $in: [userId, charityUserId] } }] },
    { collectionName: "payment_attempts", reservedSelectors: [{ userId: { $in: [userId, charityUserId] } }] },
    { collectionName: "notifications", reservedSelectors: [{ userId: { $in: [userId, charityUserId] } }] },
    { collectionName: "pool_distributions", reservedSelectors: [{ month: DISTRIBUTION_MONTH }] },
  ]);
  // Mantém aqui todos os inserts MF4 existentes, usando apenas este `db`.
}

await runE2eSeedCli({ suiteId: "mf4", seed: seedMf4E2e });
```

`backend/scripts/seed-mf9-e2e.js` — patch de integração:

```js
import { runE2eSeedCli } from "./seed-safety.js";

async function seedMf9E2e({ db, fixture }) {
  await fixture.cleanup([
    { collectionName: "subscription_plans", reservedSelectors: [{ code: { $in: ["faithflix-monthly", "faithflix-yearly", "faithflix-family-monthly", "faithflix-family-yearly"] } }] },
    { collectionName: "sessions", reservedSelectors: [{ userId: { $in: [ownerId, memberId, proId] } }] },
    { collectionName: "users", reservedSelectors: [{ email: { $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL] } }] },
    { collectionName: "subscriptions", reservedSelectors: [{ userId: { $in: [ownerId, memberId, proId] } }] },
    { collectionName: "trials", reservedSelectors: [{ userId: { $in: [ownerId, memberId, proId] } }] },
    { collectionName: "subscription_family_memberships", reservedSelectors: [{ ownerUserId: ownerId }, { memberUserId: memberId }] },
    { collectionName: "payment_attempts", reservedSelectors: [{ userId: { $in: [ownerId, memberId, proId] } }] },
    { collectionName: "notifications", reservedSelectors: [{ userId: { $in: [ownerId, memberId, proId] } }] },
    { collectionName: "contents", reservedSelectors: [{ slug: CONTENT_SLUG }] },
    { collectionName: "playback_progress", reservedSelectors: [{ contentId }] },
    { collectionName: "user_content_lists", reservedSelectors: [{ contentId }] },
    { collectionName: "media_preferences", reservedSelectors: [{ userId: { $in: [ownerId, memberId, proId] } }] },
  ]);
  // Mantém aqui todos os inserts MF9 existentes, usando apenas este `db`.
}

await runE2eSeedCli({ suiteId: "mf9", seed: seedMf9E2e });
```

Estes são patches de integração sobre seeds já existentes, não substitutos dos
respetivos corpos. Não apagues nenhum insert de domínio. IDs, emails, slugs e
mês fixos entram em `reservedSelectors`; se algum pertencer a um documento sem
o marker exato, todo o cleanup aborta antes da primeira escrita.

Exemplo documental para uma execução futura autorizada; troca o timestamp por
um identificador novo e não executes estes comandos nesta correção:

```bash
NODE_ENV=test \
ALLOW_E2E_SEED=true \
E2E_SUITE_ID='mf2' \
E2E_RUN_ID='20260710t120000' \
RATE_LIMIT_PEPPER='faithflix-e2e-test-only-pepper-20260710' \
FRONTEND_ORIGINS='http://127.0.0.1:5173' \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME='faithflix_mf2_20260710t120000_e2e' \
npm --prefix backend run seed:e2e

NODE_ENV=test \
E2E_SUITE_ID='mf2' \
E2E_RUN_ID='20260710t120000' \
RATE_LIMIT_PEPPER='faithflix-e2e-test-only-pepper-20260710' \
FRONTEND_ORIGINS='http://127.0.0.1:5173' \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME='faithflix_mf2_20260710t120000_e2e' \
npm exec playwright -- test tests/e2e/mf2-flow.spec.js --config=playwright.config.js
```

5. Explicacao.

O primeiro comando pode escrever apenas depois de todos os guardas passarem. O
segundo é uma invocação Playwright válida fora de scripts npm e reutiliza a
mesma DB isolada, `E2E_SUITE_ID` e `E2E_RUN_ID`, sem receber autorização de
seed. O pepper é uma constante exclusivamente de teste, não uma credencial de
produção. Uma URI remota, com
credenciais, sem `replicaSet`, um nome sem `_e2e`, qualquer `MONGODB_*` ou
uma DB reutilizada enquanto existirem documentos sem marker deve abortar antes
da ligação. O `9/9` media não satisfaz estas condições nem prova o fluxo MF2.

6. Validacao.

Revisa estaticamente o par de comandos e confirma os dois conjuntos iguais de
`TEST_MONGODB_*`/`E2E_SUITE_ID`/`E2E_RUN_ID`, o opt-in presente apenas no seed e a ausência total de
`MONGODB_URI`/`MONGODB_DB_NAME`. O procedimento permanece
`NAO_EXECUTADO`; não registes `PASS` sem uma execução autorizada e evidence
nova.

7. Negativo.

Qualquer frase “RNF08 passou”, “4K real”, “streaming real” ou “E2E MF2 completo”
baseada apenas nesta matriz bloqueia o fecho. O mesmo acontece se seed/browser
forem unidos, se a URI não for loopback+replica set, se a DB não for nova
`*_e2e` ou se o browser receber variáveis `MONGODB_*`.

## Snippet tecnico aplicavel

```js
// O contrato permite uma única fonte no envelope autenticado e zero fontes nas opções.
expect(Object.keys(playback.content.source).sort()).toEqual([
  "mimeType",
  "protocol",
  "url",
]);
expect(
  playback.content.qualityOptions.some((option) =>
    ["url", "src", "playbackUrl", "source"].some((field) => field in option),
  ),
).toBe(false);
```

#### Critérios de aceite

- [ ] `check:media` confirma os três SHA-256 e zero URL externa.
- [ ] O build e o preview usam `mode=test`.
- [ ] `reuseExistingServer` está `false`.
- [ ] A política global aborta qualquer host não-loopback.
- [ ] A API é totalmente intercetada; o backend não arranca.
- [ ] A suite media não lê/escreve MongoDB e não executa seed.
- [ ] Cada resposta contém exatamente uma `content.source` canónica.
- [ ] `qualityOptions` e `tracks` públicas não contêm fontes.
- [ ] Progressive, HLS e DASH chegam a `canplay` em Chromium, Firefox e WebKit.
- [ ] A contagem esperada é `9/9`, sem skip crítico.
- [ ] A fixture de canvas é descrita como 320×180 sintética, nunca como 4K real.
- [ ] `RNF08` e `RNF10` permanecem `NAO_PROVADO`.
- [ ] `RNF23` fica no máximo `PARCIAL_VALIDADO`.
- [ ] O E2E funcional MF2 permanece separado e não é declarado como revalidado.
- [ ] `seed-safety.js` valida todos os guardas antes de importar o driver ou ligar.
- [ ] MF2, MF4 e MF9 usam `runE2eSeedCli`, `E2E_RUN_ID` e marker `suite/run`.
- [ ] O cleanup pré-valida todas as colisões e apaga apenas pelo marker exato.
- [ ] Uma DB formal é nova por run enquanto qualquer service criar documentos
  sem marker; seed e browser usam os mesmos `TEST_MONGODB_*` sem `MONGODB_*`.

#### Validação final

```bash
npm run check:media
npm exec playwright -- test --config=playwright.media.config.js --list
npm run test:media:browser
```

Na correção documental de 2026-07-10, não se voltou a executar a matriz browser;
o `9/9` citado é a execução atual já registada no report canónico. Não executar
`seed:*`, `e2e:mf2`, migrações ou DB para validar este guia.

#### Evidence para PR/defesa

- Output do checker com checksums válidos e zero URLs externas.
- Lista de nove casos por protocolo/engine.
- Resultado `9/9` da matriz preview-only.
- Prova de que `session/me`, CSRF e playback foram intercetados.
- Prova de rede externa vazia.
- DTO com uma única `content.source` e listas sem fontes.
- Nota explícita: sem backend, DB, seed, media real, 4K real, CDN ou carga.
- Estados finais: `RNF08=NAO_PROVADO`, `RNF10=NAO_PROVADO`,
  `RNF23=PARCIAL_VALIDADO`.

#### Handoff

O `BK-MF3-01` pode consumir os contratos de identidade/conteúdo, mas não deve
assumir que o E2E funcional MF2 ou a performance real ficaram fechados. O gate
final deve manter a separação entre prova browser local e fluxo funcional com
DB dedicada.

## Proximo BK recomendado

`BK-MF3-01` - Ratings e comentários.

#### Changelog

- 2026-07-10: criado o guard E2E copiável e integrado o contrato nas seeds
  MF2/MF4/MF9, com DB única por run, marker suite/run e cleanup em duas passagens.
- 2026-07-10: guia reescrito para separar E2E funcional de media preview-only;
  documentados fMP4 canvas/checksums, route interception, loopback, três engines,
  DTO `content.source`, prova atual `9/9` e limites RNF sem seed/DB.
- 2026-05-31: alinhados critérios, evidence, handoff e changelog com o contrato
  inicial do guia.
