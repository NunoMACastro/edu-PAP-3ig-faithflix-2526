# BK-MF9-06 - Gate MF9, regressão e evidência final

## Header

- `doc_id`: `GUIA-BK-MF9-06`
- `bk_id`: `BK-MF9-06`
- `macro`: `MF9`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-01,BK-MF9-02,BK-MF9-03,BK-MF9-04,BK-MF9-05`
- `rf_rnf`: `RF61, RF62, RF63, RNF21, RNF22, RNF29, RNF38, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais fechar a MF9 com regressão técnica, evidência e uma decisão de
gate honesta. O objetivo não é criar funcionalidade: é separar o que foi
realmente executado do que permanece histórico, pendente ou bloqueado por
ambiente.

O gate atual distingue obrigatoriamente:

- suites locais de backend/frontend e documentação;
- prova browser isolada de media, preview-only e sem DB (`9/9` atual);
- E2E funcional MF9 com owner/membro/Pro, que exige seed separado e DB `_e2e`
  dedicada e que não foi reexecutado neste checkpoint;
- requisitos que dependem de media/infraestrutura reais.

#### Importância

Sem esta separação, um teste com API intercetada pode ser apresentado como
prova de família/DB, ou uma fixture de canvas 320×180 pode ser apresentada como
4K. Ambos são falsos verdes. O gate só pode promover um contrato quando a prova
executada corresponde à camada declarada.

#### Scope-in

- Consolidar `GATE-S13-MF9.md` e `REGRESSAO-MF9.md` por adendos datados.
- Validar contratos locais de planos, família, qualidade e privacidade.
- Validar uma única `content.source = { url, protocol, mimeType }`.
- Garantir `qualityOptions`/`tracks` públicas sem fontes.
- Registar a matriz browser isolada progressive/HLS/DASH em três engines.
- Documentar geração canvas fMP4 e checksums.
- Exigir build + `preview --mode test`, sem watcher ou servidor reutilizado.
- Bloquear rede fora de loopback e intercetar API/media.
- Manter seed/full E2E como fluxo separado e não executado sem DB dedicada.
- Classificar `RNF08`, `RNF10` e `RNF23` pelo nível real de prova.

#### Scope-out

- Criar vídeos reais ou usar URLs externas.
- Executar seeds, migrações ou DB configurada nesta atualização documental.
- Apresentar a label `2160p/4K` como resolução física da fixture.
- Fechar CDN, ABR, DRM, performance real ou 100 streams.
- Transformar o gate histórico de 2026-07-04 em prova atual.
- Criar gateway, CI/deploy cloud ou serviços externos.

#### Estado antes e depois

- Antes: o guia misturava o full E2E com a prova de media e ensinava fontes
  públicas antigas por opção.
- Depois: cada prova tem comando, dados, limite e estado próprios; o gate não
  confunde `9/9` local com E2E funcional MF9, 4K real ou produção.

#### Pré-requisitos

- BK-MF9-01..05 documentalmente completos.
- Node.js e dependências root/backend/frontend instaladas.
- Browsers Playwright locais para a matriz media.
- Nenhuma DB ou seed é necessária/autorizada para `test:media:browser`.
- Para uma futura execução do E2E funcional: autorização explícita, DB dedicada
  terminada em `_e2e` e guard cumulativo de seed.
- Ler matriz canónica, plano de sprints e runbook MF9.

#### Glossário

- `Gate`: decisão baseada apenas em provas atuais e rastreáveis.
- `Snapshot histórico`: resultado preservado que não prova o código posterior.
- `Preview-only`: build estático servido por Vite preview, sem dev watcher.
- `Media E2E isolado`: browser real + frontend real + API/media intercetadas;
  não usa backend/DB.
- `Full E2E`: browser, backend e DB de teste integrados.
- `Falso verde`: sucesso de uma camada apresentado como sucesso de outra.
- `NAO_PROVADO`: requisito sem ambiente/prova proporcional.

#### Conceitos teóricos essenciais

- `RF63` é imposto no backend: Pro/trial até `1080p`; Família pode selecionar a
  opção lógica `2160p` quando autorizada.
- A resposta autenticada expõe exatamente uma `content.source`.
- `qualityOptions` expõe apenas `value`, `label`, `locked`, `selected` e campos
  opcionais de tier/razão; nunca expõe URL.
- A label `4K` e uma fixture sintética não provam resolução 4K real.
- A matriz media `9/9` prova adapters/contratos locais em Chromium, Firefox e
  WebKit; não prova DB, família ou entitlements persistidos.
- `RNF08` e `RNF10` ficam `NAO_PROVADO` sem media/infraestrutura reais.
- `RNF23` fica no máximo `PARCIAL_VALIDADO` com adapters/fixtures locais.
- Chrome/Edge branded e Safari real continuam manuais.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Backend | `backend/tests/unit/mf9-subscriptions.test.js` | Regras locais de planos/família/qualidade |
| Full E2E futuro | `backend/scripts/seed-safety.js`, seed MF9 e spec familiar | Fluxo integrado apenas numa DB `_e2e` dedicada |
| Media browser | `tests/e2e/media-fixtures.spec.js` | Progressive/HLS/DASH sem backend/DB |
| Rede | `tests/e2e/network-policy.js` | Fixtures/Range e allowlist loopback |
| Media | `tests/fixtures/media/*` | fMP4 canvas, HLS e DASH locais |
| Config media | `playwright.media.config.js` | Preview test-mode e três engines |
| Frontend | `frontend/` | Build, preview, player e adapters reais |
| Evidência | `docs/evidence/MF9/GATE-S13-MF9.md` | Decisão e matriz RF/RNF |
| Regressão | `docs/evidence/MF9/REGRESSAO-MF9.md` | Comandos, outputs e limitações |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF9/GATE-S13-MF9.md`
- CRIAR/EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`
- REVER: `backend/tests/unit/mf9-subscriptions.test.js`
- REVER: `backend/scripts/seed-safety.js`
- REVER: `backend/scripts/seed-mf9-e2e.js`
- REVER: `tests/e2e/mf9-family-subscription.spec.js`
- REVER: `tests/e2e/media-fixtures.spec.js`
- REVER: `tests/e2e/network-policy.js`
- REVER: `tests/fixtures/media/README.md`
- REVER: `playwright.config.js`
- REVER: `playwright.media.config.js`
- REVER: `frontend/src/pages/PlaybackPage.jsx`
- REVER: `scripts/validate-planificacao.sh`

#### Tutorial técnico linear

### Passo 1 - Congelar a baseline e abrir um adendo atual

1. Objetivo funcional do passo no contexto da app.

Preservar gates/contagens históricas e criar uma secção datada para a prova
atual, sem reescrever o passado.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF9/GATE-S13-MF9.md`
    - EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`

3. Instruções do que fazer.

Mantém a data/decisão histórica e acrescenta um adendo com:

- comandos realmente executados;
- exit code e contagem real;
- camada coberta;
- DB/backend/seed usados ou não usados;
- limitações e estado RNF.

4. Modelo.

```md
## Adendo Fase 4 - media browser isolada (2026-07-10)

| Prova | Resultado | O que valida | O que não valida |
| --- | --- | --- | --- |
| `npm run test:media:browser` | `PASS 9/9` | Adapters e DTO local | DB, família, 4K real, RNF08/RNF10 |
```

5. Explicação.

Um snapshot continua útil para história, mas não pode ser promovido pelo simples
facto de ter sido copiado para um documento atual.

6. Validação.

Confirma que o adendo diz explicitamente que o full E2E MF9 não foi reexecutado.

7. Cenário negativo/erro esperado.

Editar a linha antiga `1/1 Chromium` para `9/9` seria incorreto: são suites e
camadas diferentes.

### Passo 2 - Executar apenas regressão local sem DB

1. Objetivo funcional do passo no contexto da app.

Validar código e documentação sem escrever numa base configurada.

2. Ficheiros envolvidos:
    - EXECUTAR: backend/frontend em testes locais
    - EXECUTAR: `scripts/validate-planificacao.sh`

3. Instruções do que fazer.

Usa apenas suites explicitamente in-memory/doubles, lint e build. Se um comando
pedir DB, seed ou migração, para e classifica-o fora deste checkpoint.

4. Comandos base.

```bash
npm --prefix backend test
npm --prefix frontend run validate
bash scripts/validate-planificacao.sh
```

5. Explicação.

Esta regressão prova contratos locais e compilação; transações/concorrência reais
continuam dependentes de replica set dedicado.

6. Validação.

Regista contagens reais, zero skips críticos e qualquer bloqueio de ambiente.

7. Cenário negativo/erro esperado.

Não reutilizar contagens de 2026-07-04 ou de outra fase como se tivessem sido
geradas agora.

### Passo 3 - Verificar media sintética e checksums

1. Objetivo funcional do passo no contexto da app.

Confirmar integridade e origem local das fixtures antes do browser.

2. Ficheiros envolvidos:
    - REVER: `scripts/generate-synthetic-media.mjs`
    - REVER: `scripts/check-media-fixtures.mjs`
    - REVER: `tests/fixtures/media/*`

3. Instruções do que fazer.

O gerador usa canvas + MediaRecorder e produz fMP4 H.264 baseline 320×180,
inicialização/segmento e manifests locais. O checker valida os hashes:

```text
8275def5ed2b836720880da54bce49f8de0aeb137f85b6ded5543e5883a93e20  synthetic-progressive.mp4
a310f52c490f9b3b04dfbd8c355265c4f918bc92207bbf36e574a72cc5e5e917  synthetic-init.mp4
50c9b1272b5f225c244a405a06ba7a41b18a3a7c30e034138ee396df5e5ca004  synthetic-segment.m4s
```

4. Comando.

```bash
npm run check:media
```

5. Explicação.

Checksums tornam drift binário visível. O checker também recusa URLs externas em
manifests/README.

6. Validação.

Resultado esperado: fixtures locais, hashes válidos e zero URL externa.

7. Cenário negativo/erro esperado.

Não atualizar hashes automaticamente nem chamar `2160p/4K` à fixture 320×180.

### Passo 4 - Provar preview-only, rede loopback e DTO fechado

1. Objetivo funcional do passo no contexto da app.

Executar o frontend/player real sem backend, DB ou seed.

2. Ficheiros envolvidos:
    - REVER: `playwright.media.config.js`
    - REVER: `tests/e2e/network-policy.js`
    - REVER: `tests/e2e/media-fixtures.spec.js`

3. Instruções do que fazer.

Confirma cumulativamente:

- build com `--mode test`;
- `preview --mode test` em loopback;
- `reuseExistingServer:false`;
- service workers bloqueados;
- política global aborta rede não-loopback;
- sessão, CSRF, playback, progresso e preferências são intercetados;
- media é servida por interception com Range;
- resposta contém uma única `content.source`;
- opções/faixas públicas não têm fontes.

4. Contrato de resposta.

```js
// A fixture contém uma única fonte selecionada; opções e faixas nunca incluem URLs.
const syntheticPlaybackResponse = {
  content: {
    source: {
      url: "/__fixtures__/synthetic.mpd",
      protocol: "dash",
      mimeType: "application/dash+xml",
    },
    selectedQuality: "720p",
    qualityOptions: [
      {
        value: "720p",
        label: "Fixture local",
        locked: false,
        selected: true,
      },
    ],
    // As faixas vazias confirmam que não existem aliases src escondidos na fixture.
    tracks: { subtitles: [], audio: [] },
  },
};
```

5. Explicação.

A UI exercita o adapter, mas as decisões de produto são fixtures HTTP. Por isso
esta suite não prova entitlement persistido, família ou MongoDB.

6. Validação.

Pesquisa o payload para confirmar zero `url`/`src`/`playbackUrl`/`source` dentro
de cada opção/faixa.

7. Cenário negativo/erro esperado.

Qualquer pedido externo, backend iniciado ou fonte por opção falha o gate local.

### Passo 5 - Executar a matriz media em três engines

1. Objetivo funcional do passo no contexto da app.

Validar progressive, HLS e DASH até `canplay` em Chromium, Firefox e WebKit.

2. Ficheiros envolvidos:
    - EXECUTAR: `playwright.media.config.js`

3. Instruções do que fazer.

Não definas variáveis MongoDB e não executes seed. Corre apenas:

```bash
npm run test:media:browser
```

4. Resultado atual.

Sem código neste passo.

5. Explicação.

Evidence de 2026-07-10: `9/9`. Os três protocolos chegaram a `canplay` nas três
engines; sessão/API foram intercetadas, rede externa foi zero e não arrancaram
backend, MongoDB ou seed.

HLS usa suporte nativo ou `hls.js`; DASH usa `dashjs`; progressive liga
diretamente a fonte. Os adapters são carregados lazy e destruídos na troca.

6. Validação.

Um resultado `8/9` é `FAIL`. O teste deve exigir `readyState >= 3`, não apenas
metadata.

7. Cenário negativo/erro esperado.

Não transformar o tempo desta fixture local em métrica `RNF08` e não declarar
4K real, CDN ou 100 streams.

### Passo 6 - Manter o full E2E MF9 separado, isolado e pendente

1. Objetivo funcional do passo no contexto da app.

Definir como o fluxo owner/membro/Pro será revalidado sem fingir que isso ocorreu
neste checkpoint e sem permitir acesso à base normal.

2. Ficheiros envolvidos:
    - REVER: `backend/scripts/seed-safety.js`
    - REVER: `backend/scripts/seed-mf9-e2e.js`
    - REVER: `tests/e2e/mf9-family-subscription.spec.js`
    - REVER: `playwright.config.js`

3. Instruções do que fazer.

Uma execução futura exige cumulativamente, antes de qualquer ligação:
`NODE_ENV=test`; `ALLOW_E2E_SEED=true` apenas no seed;
`E2E_SUITE_ID=mf9`; `E2E_RUN_ID` novo; `RATE_LIMIT_PEPPER` de teste;
`FRONTEND_ORIGINS` loopback explícita;
`TEST_MONGODB_URI` loopback, sem username/password e com `replicaSet`;
`TEST_MONGODB_DB_NAME` explícito e terminado em `_e2e`. Seed e browser são
comandos separados; o browser recebe os mesmos valores `TEST_MONGODB_*` e
nunca recebe `MONGODB_*`. Enquanto o run marker não abranger todos os
documentos criados pelo fluxo Family/subscrição, cada execução formal usa uma DB
`_e2e` nova. Servidores formais usam `start`/`preview`, três engines e
`reuseExistingServer:false`.

O estado atual é:

| Prova | Estado |
| --- | --- |
| Seed guard estático/unitário | validado localmente |
| Seed MF9 numa DB `_e2e` atual | `NAO_EXECUTADO` |
| Full E2E MF9 atual | `NAO_REVALIDADO` |
| Histórico 2026-07-04 | snapshot, não CP atual |

4. Codigo.

Exemplo documental para uma execução futura autorizada; substitui o timestamp
por um identificador novo e não executes estes comandos nesta correção:

```bash
NODE_ENV=test \
ALLOW_E2E_SEED=true \
E2E_SUITE_ID='mf9' \
E2E_RUN_ID='20260710t120000' \
RATE_LIMIT_PEPPER='faithflix-e2e-test-only-pepper-20260710' \
FRONTEND_ORIGINS='http://127.0.0.1:4173' \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME='faithflix_mf9_20260710t120000_e2e' \
npm --prefix backend run seed:e2e:mf9

NODE_ENV=test \
E2E_SUITE_ID='mf9' \
E2E_RUN_ID='20260710t120000' \
RATE_LIMIT_PEPPER='faithflix-e2e-test-only-pepper-20260710' \
FRONTEND_ORIGINS='http://127.0.0.1:4173' \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME='faithflix_mf9_20260710t120000_e2e' \
npm exec playwright -- test tests/e2e/mf9-family-subscription.spec.js --config=playwright.config.js
```

5. Explicação.

O primeiro comando tem o opt-in destrutivo e o segundo não. Ambos usam a mesma
suite, run, pepper, origin e DB isolada; só o browser consome as fixtures depois
do seed terminar. A CLI
`npm exec playwright -- test` é a forma válida fora de scripts npm. URI
remota/com credenciais/sem replica set, DB sem sufixo, variáveis de produção,
seed+browser no mesmo comando ou reutilização insegura da DB devem abortar antes
da ligação. O `9/9` media não inclui owner, convite, aceite, subscrição ou DB.

6. Validação.

Revisa estaticamente os comandos: os dois conjuntos de `E2E_*`,
`RATE_LIMIT_PEPPER`, `FRONTEND_ORIGINS` e `TEST_MONGODB_*` são iguais,
`ALLOW_E2E_SEED` aparece apenas no seed e não existe fallback. O estado
continua `NAO_EXECUTADO`/`NAO_REVALIDADO`; estes comandos não são apresentados
como executados nem como `PASS`.

7. Cenário negativo/erro esperado.

Se faltar qualquer guarda ou uma DB nova dedicada, o estado é
bloqueado/pendente. Nunca usar a DB normal, um seed histórico, uma URI com
credenciais ou uma execução browser que receba `MONGODB_*`.

### Passo 7 - Decidir o Gate S13 sem sobrestimar prova

1. Objetivo funcional do passo no contexto da app.

Transformar as provas em estados RF/RNF e numa decisão local/produção.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF9/GATE-S13-MF9.md`
    - EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`

3. Instruções do que fazer.

Usa a matriz mínima:

| Contrato | Estado máximo atual | Justificação |
| --- | --- | --- |
| `RF63` DTO/adapter local | `VALIDADO_LOCAL` | fonte única + options sem URL + fallback unitário |
| Full E2E MF9 | `NAO_REVALIDADO` | sem seed/DB atual |
| `RNF08` | `NAO_PROVADO` | sem vídeo/infra real |
| `RNF10` | `NAO_PROVADO` | sem carga real a 100 streams |
| `RNF23` | `PARCIAL_VALIDADO` | adapters/fixtures locais `9/9` |
| Produção | `NO_GO_PRODUCAO` | media/infra/DB/operacional real pendente |

4. Decisão.

Sem código neste passo.

5. Explicação.

O máximo da baseline é `GO_LOCAL_COM_RESSALVAS`. Não uses `GO` de produção e
não apagues a decisão histórica; acrescenta um adendo atual.

Uma decisão forte não vem de linguagem otimista, mas da correspondência entre
requisito, prova e ambiente.

6. Validação.

Todos os P0/P1 sem prova proporcional permanecem abertos/bloqueados; nenhum
teste crítico é convertido em `PASS` por scanner textual.

7. Cenário negativo/erro esperado.

Uma fixture com label `4K`, `selectedQuality:"2160p"` ou um selector habilitado
não prova pixels 4K reais.

##### Snippet técnico aplicável

```js
const SOURCE_PROTOCOLS = new Set(["progressive", "hls", "dash"]);

expect(SOURCE_PROTOCOLS.has(playback.content.source.protocol)).toBe(true);
for (const option of playback.content.qualityOptions) {
  for (const field of ["url", "src", "playbackUrl", "source"]) {
    expect(field in option).toBe(false);
  }
}
```

#### Critérios de aceite

- [ ] Snapshots históricos permanecem intactos e têm adendo datado.
- [ ] Cada comando atual regista cwd, exit code, contagem e limite da prova.
- [ ] `check:media` valida os três checksums e zero URL externa.
- [ ] A suite media usa build/preview `mode=test`, sem watcher.
- [ ] `reuseExistingServer` está desligado.
- [ ] Rede não-loopback está bloqueada.
- [ ] API/media são intercetadas; não há backend, DB ou seed na suite media.
- [ ] Playback devolve exatamente uma `content.source`.
- [ ] `qualityOptions`/`tracks` públicas não expõem fontes.
- [ ] Progressive/HLS/DASH passam em Chromium/Firefox/WebKit (`9/9`).
- [ ] A fixture canvas 320×180 não é apresentada como 4K real.
- [ ] Full E2E MF9 atual permanece `NAO_REVALIDADO` sem DB `_e2e`.
- [ ] `RNF08` e `RNF10` ficam `NAO_PROVADO`.
- [ ] `RNF23` fica `PARCIAL_VALIDADO`.
- [ ] Gate máximo local `GO_LOCAL_COM_RESSALVAS`; produção `NO_GO_PRODUCAO`.

#### Validação final

```bash
npm run check:media
npm exec playwright -- test --config=playwright.media.config.js --list
bash scripts/validate-planificacao.sh
```

`npm run test:media:browser` já tem evidence atual `9/9` no report canónico. A
correção documental não deve executar `seed:*`, `e2e:mf9`, migração ou DB para
repetir essa prova.

#### Evidence para PR/defesa

- Adendo datado que não reescreve o gate histórico.
- Checker com hashes e zero URL externa.
- Descoberta de nove casos e resultado browser `9/9` já registado.
- Config preview-only/test-mode e `reuseExistingServer:false`.
- Prova de route interception/API e rede externa vazia.
- DTO com única `content.source`; options/tracks sem fontes.
- Nota: sem backend, DB, seed, vídeo/4K/CDN/carga reais.
- Full E2E MF9 atual: `NAO_REVALIDADO`.
- `RNF08=NAO_PROVADO`, `RNF10=NAO_PROVADO`,
  `RNF23=PARCIAL_VALIDADO`.
- Decisão: `GO_LOCAL_COM_RESSALVAS` / `NO_GO_PRODUCAO`.

#### Handoff

O projeto termina a planificação MF9, mas não termina a validação de produção.
Uma futura revalidação integrada deve usar DB `_e2e` dedicada, seed separado,
três engines e evidence nova; streaming/4K/carga reais exigem infraestrutura e
media reais.

#### Changelog

- `2026-07-10`: guia reescrito para separar regressão local, media preview-only
  `9/9` e full E2E MF9 pendente; alinhados `content.source`, checksums, loopback,
  limites 4K/RNF e gates local/produção.
- `2026-07-01`: primeira versão do gate MF9 com matriz, seed e E2E funcional.
