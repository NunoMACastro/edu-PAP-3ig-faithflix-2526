# BK-MF9-06 - Gate MF9, regressao e evidencia final

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
- `last_updated`: `2026-06-30`

#### Objetivo

Este BK fecha a MF9 com regressao, evidence e validacao da planificacao. Confirma que Pro/Familia, partilha real e qualidade por plano funcionam como parte coerente da aplicacao.

#### Importancia

MF9 altera acesso premium e streaming. O gate garante que os fluxos existentes de subscricao, playback, privacidade e UI continuam validos.

#### Scope-in

- Executar testes backend MF9.
- Executar build/smoke frontend.
- Criar ou executar E2E MF9.
- Validar `scripts/validate-planificacao.sh`.
- Registar evidence final.

#### Scope-out

- Novas funcionalidades depois de MF9.

#### Estado antes e depois

- Estado antes: funcionalidades MF9 implementadas em BKs anteriores.
- Estado depois: MF9 fica validada e pronta para defesa/entrega.

#### Pre-requisitos

- `BK-MF9-01..05` completos.
- Ambiente local com backend/frontend configurados.

#### Glossario

- Gate: ponto de validacao com criterio GO, GO_COM_RESSALVAS ou NO_GO.
- Regressao: verificacao de que fluxos antigos nao quebraram.

#### Conceitos teoricos essenciais

Um gate nao cria produto novo; comprova que as alteracoes estao integradas, testadas e documentadas.

#### Arquitetura do BK

- Endpoint(s): todos os fluxos MF9 relevantes.
- Modelo/schema: planos, subscricoes, memberships, playback, privacidade.
- Service(s): subscricoes, playback, privacidade, metricas.
- Controller/route: rotas MF9 e existentes.
- Guard/middleware: auth, role e premium access.
- Cliente API: `subscriptionsApi`, `playbackApi`.
- Pagina/componente: `SubscriptionPage`, `PlaybackPage`.
- Testes: unit, integration/build/e2e.
- Handoff para o proximo BK: nao aplicavel.

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF9/*`
- TESTAR: `real_dev/backend/tests/unit/mf9-subscriptions.test.js`
- TESTAR: `tests/e2e/mf9-family-subscription.spec.js`

#### Tutorial tecnico linear

### Passo 1 - Executar regressao tecnica

1. Correr testes backend.
2. Correr build frontend.
3. Correr E2E MF9 quando o ambiente estiver disponivel.

```bash
npm --prefix real_dev/backend test
npm --prefix real_dev/frontend run build
bash scripts/validate-planificacao.sh
```

### Passo 2 - Registar evidence final

1. Guardar comandos, resultado e ressalvas.
2. Ligar evidence aos RF61..RF63.
3. Classificar riscos restantes.

```md
<!-- Sem codigo aplicacional; evidence deve ser objetiva e auditavel. -->
```

#### Criterios de aceite

- Testes MF9 passam.
- Build frontend passa.
- Planificacao valida com 66 BK e 66 guias.
- Evidence inclui `pr`, `proof`, `neg` e `fonte`.

#### Validacao final

- `npm --prefix real_dev/backend test`
- `npm --prefix real_dev/frontend run build`
- `bash scripts/validate-planificacao.sh`
- E2E MF9 quando houver servidor e seed disponiveis.

#### Evidence para PR/defesa

- `pr`: commit ou PR da MF9.
- `proof`: logs de testes/build/validacao.
- `neg`: lista de negativos executados.
- `fonte`: `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38`, `RNF40`.

#### Handoff

MF9 fica encerrada; qualquer melhoria posterior deve abrir nova macrofase ou backlog aprovado.

#### Changelog

- `2026-06-30`: guia generico criado para MF9.
