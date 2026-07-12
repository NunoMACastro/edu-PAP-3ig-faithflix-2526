# Auditoria, hidratacao e correcao - MF9

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-07-01`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: auditorias MF9 observadas em 2026-07-01; não promovem guias ou evidence atuais

## Auditoria observada - 2026-07-01 - MF9 completa

- Projeto: FaithFlix
- MF alvo: `MF9`
- BKs alvo: `BK-MF9-01` a `BK-MF9-06`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Implementacao de referencia consultada: `real_dev/backend` e `real_dev/frontend`
- Resultado desta execucao: a MF9 completa foi re-auditada como `OK`. Nenhum guia BK nem codigo real foi editado; apenas este relatorio foi atualizado.

### Resultado executivo

Foram auditados os 6 guias da MF9: planos Pro/Familia e entitlements, qualidade de streaming por plano, modelo/API de partilha familiar, UI de gestao familiar, privacidade/operacao/metricas familiares e gate S13. A sequencia esta alinhada com `RF61`, `RF62`, `RF63`, com os RNF associados nos headers, com `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.

Todos os guias MF9 seguem a estrutura obrigatoria de 16 secoes, contêm 7 passos tecnicos, incluem os itens 1 a 7 em cada passo, mantêm paths publicos `backend/` e `frontend/`, nao expõem `real_dev`, nao usam linguagem interna proibida e apresentam codigo completo com JSDoc/comentarios didaticos quando ha codigo. O falso positivo de drift de dominio encontrado foi apenas `IVA` dentro da palavra `DERIVADO`, sem impacto.

Como a execucao e `auditar_apenas`, nao houve correcao de BKs nesta passagem. A contagem antes/depois fica igual porque a auditoria nao alterou os guias.

### Contagem antes e depois

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 6 | 6 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

### BKs auditados

| BK | Ficheiro | Estado | Evidencia principal |
| --- | --- | --- | --- |
| `BK-MF9-01` | `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md` | OK | Guia completo para entitlements, seed de planos, exposicao publica de planos, checkout simulado compativel, UI de planos e testes unitarios MF9. |
| `BK-MF9-02` | `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md` | OK | Liga entitlements ao playback, filtra qualidades por plano, impede exposicao de URL bloqueada e cobre fallback/testes. |
| `BK-MF9-03` | `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md` | OK | Cria contrato de memberships familiares, rotas autenticadas, convites, aceite/recusa/remocao/saida e negativos de ownership/plano. |
| `BK-MF9-04` | `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md` | OK | Integra cliente API familiar, UI de subscricao com estado familiar, convites, pending states, remocao/saida, acessibilidade e PT-PT. |
| `BK-MF9-05` | `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md` | OK | Integra memberships familiares em exportacao RGPD, eliminacao de conta, metricas agregadas, pool solidaria e testes operacionais. |
| `BK-MF9-06` | `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md` | OK | Fecha S13 com matriz de evidencia, Playwright publicavel, seed MF9, regressao backend/frontend, E2E MF9 e decisao final. |

### Mapa de integracao da MF

| BK | Ficheiros criados/editados pelo guia | Contratos produzidos/consumidos | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF9-01` | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/subscriptions/subscriptions.controller.js`, `backend/tests/unit/mf9-subscriptions.test.js`, `frontend/src/pages/SubscriptionPage.jsx` | Produz entitlements `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers`; consome planos de `BK-MF4-01`/`BK-MF4-02`. | Testes unitarios de planos e evidence de compatibilidade dos codigos existentes. |
| `BK-MF9-02` | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/playback/playback.service.js`, `backend/src/modules/playback/playback.controller.js`, `frontend/src/pages/PlaybackPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js` | Consome entitlements de `BK-MF9-01`; produz filtro de qualidade e fallback seguro para playback. | Testes de ausencia de URL 4K bloqueada e fallback para qualidade permitida. |
| `BK-MF9-03` | `backend/src/modules/subscriptions/subscriptions.routes.js`, `subscriptions.controller.js`, `subscriptions.service.js`, `notifications.service.js`, `backend/tests/unit/mf9-subscriptions.test.js` | Produz API `/api/subscriptions/family/*`, memberships familiares, convites e acesso premium efetivo; consome identidade/sessao de `BK-MF2-01`. | Testes de convite, aceite, remocao, bloqueio sem plano Familia e bloqueio de membro com subscricao paga. |
| `BK-MF9-04` | `frontend/src/services/api/subscriptionsApi.js`, `frontend/src/pages/SubscriptionPage.jsx` | Consome API familiar de `BK-MF9-03`; produz experiencia UI para owner, membro e convite pendente. | Evidence manual de owner, convidado, remocao/saida, acessibilidade e mensagens PT-PT. |
| `BK-MF9-05` | `backend/src/modules/privacy/privacy-export.service.js`, `privacy-deletion.service.js`, `admin-metrics.service.js`, `pool-distribution.service.js`, `backend/tests/unit/mf9-subscriptions.test.js` | Consome memberships de `BK-MF9-03`/UI de `BK-MF9-04`; produz exportacao, invalidacao, metricas agregadas e isolamento da pool solidaria. | Testes de exportacao/eliminacao familiar, metricas agregadas e nao contagem de membros familiares na pool. |
| `BK-MF9-06` | `docs/evidence/MF9/GATE-S13-MF9.md`, `docs/evidence/MF9/REGRESSAO-MF9.md`, `backend/scripts/seed-mf9-e2e.js`, `tests/e2e/mf9-family-subscription.spec.js`, `playwright.config.js` | Consome `BK-MF9-01..05`; fecha gate S13 e regressao MF9. | Suite backend MF9, build frontend, Playwright MF9, matriz RF/RNF e revisao manual RNF21/RNF22/RNF38/RNF40. |

### Decisoes confirmadas

- `CANONICO`: MF9 contem 6 BKs em `S13`, com baseline global de `66 BK` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `CANONICO`: `RF61` cobre planos Pro/Familia e entitlements, `RF62` cobre partilha familiar real, e `RF63` cobre qualidade de streaming por plano.
- `CANONICO`: `BK-MF9-06` fecha Gate `S13` com regressao backend/frontend, evidence e parecer final.
- `CANONICO`: os guias publicados para alunos usam `backend/` e `frontend/`; a implementacao em `real_dev/` e apenas referencia privada de validacao.
- `DERIVADO`: usar os campos `tier`, `qualityRank`, `familySharing` e `maxFamilyMembers` e a extensao `faithflix-family-*` e a decisao minima coerente para implementar Pro/Familia sem quebrar os planos existentes.
- `DERIVADO`: separar evidence em `GATE-S13-MF9.md` e `REGRESSAO-MF9.md` melhora rastreabilidade sem criar requisito novo.

### Drift documental encontrado

- Sem drift canonico entre RF/RNF, backlog, matriz, contrato de campos, MF views, sprint plan e guias MF9.
- Sem leakage de `real_dev`, `IMPLEMENTATION_ROOT`, variaveis internas ou caminhos privados nos guias MF9.
- Sem linguagem interna proibida nos guias MF9.
- Scan de dominio devolveu apenas falso positivo: `IVA` dentro de `DERIVADO`.
- Todos os documentos obrigatorios desta execucao existem.

### Coerencia MF anterior -> MF alvo -> MF seguinte

- MF8 fecha com scope freeze e handoff para `BK-MF9-01`; a MF9 consome esse fecho sem reabrir bugs ou evidencias de MF8.
- MF9 constrói incrementalmente: entitlements desbloqueiam qualidade e familia; API familiar desbloqueia UI; privacidade/metricas fecha antes do gate; `BK-MF9-06` agrega a prova final.
- Nao existe MF seguinte documentada neste checkout; `BK-MF9-06` fecha a extensao MF9 e o Gate `S13`.

### Validacoes executadas

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas `IVA` dentro de `DERIVADO`, falso positivo. |
| Script estrutural local para secoes/passos/comentarios | PASS: 6 guias com 16 secoes obrigatorias, 7 passos, itens 1..7 e comentarios em blocos de codigo. |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js --list` | PASS: 1 teste MF9 listado. |
| `npm --prefix real_dev/backend run test -- --test-name-pattern=MF9` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm --prefix real_dev/frontend run build` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a auditoria valida os guias e a implementacao de referencia, mas os alunos ainda terao de executar os passos nos seus roots `backend/` e `frontend/`.
- Risco operacional baixo/medio: `RNF21` e `RNF22` continuam a exigir evidence manual de browser/viewport no gate, alem do E2E Chromium listado.
- Risco de drift futuro baixo: se os artefactos privados de referencia forem republicados, manter a conversao obrigatoria para paths publicos `backend/` e `frontend/`.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` nos guias MF9.
- Sem findings `PARCIAL` ou `CRITICO` dentro do scope desta auditoria.
- Sem necessidade de editar BKs em `MODO=auditar_apenas`.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-06 - confirmacao pos-correcao

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-06`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF4-01`, `BK-MF4-02`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-06` re-auditado como `OK`; nenhum guia BK nem codigo real foi editado. Apenas este relatorio foi atualizado.

### Resultado executivo da reauditoria observada

`BK-MF9-06` mantem-se alinhado com a sequencia canonica da MF9 e agora cumpre os criterios que tinham bloqueado a reauditoria anterior. O guia ja ensina o aluno a criar o seed MF9 publicavel, configurar Playwright com roots `backend/` e `frontend/`, criar a spec E2E MF9, executar a suite backend MF9 por ficheiro explicito e preencher uma matriz de evidence que cobre `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`.

Nao foram encontrados novos blockers no guia alvo. As ocorrencias pesquisadas de termos internos nao existem no BK, a estrutura obrigatoria esta completa, a coerencia canonica continua alinhada com `66/66` BK e Gate `S13`, e as validacoes de referencia continuam verdes em backend, frontend e planificacao.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a correcao imediatamente abaixo, que tinha promovido `BK-MF9-06` de `CRITICO` para `OK`. Esta reauditoria fresca confirma essa promocao.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings revalidados

| ID | Severidade original | Estado atual | Evidencia revalidada | Conclusao |
| --- | --- | --- | --- | --- |
| `MF9-06-AUD-001` | CRITICO | CORRIGIDO_CONFIRMADO | O Passo 3 cria `backend/scripts/seed-mf9-e2e.js` com fixtures owner/membro/Pro, subscricoes Familia/Pro e conteudo 1080p/4K. | O aluno deixa de depender de seed interno para executar o fluxo end-to-end. |
| `MF9-06-AUD-002` | CRITICO | CORRIGIDO_CONFIRMADO | O Passo 2 publica `playwright.config.js` com `backend/` e `frontend/`; o Passo 6 publica `tests/e2e/mf9-family-subscription.spec.js` e `npx playwright test tests/e2e/mf9-family-subscription.spec.js`. | O contrato E2E MF9 fica publicavel e reproduzivel. |
| `MF9-06-AUD-003` | CRITICO | CORRIGIDO_CONFIRMADO | O Passo 4 exige `cd backend && node --test tests/unit/mf9-subscriptions.test.js`. | O gate deixa de aceitar `npm test` generico como falso verde. |
| `MF9-06-AUD-004` | CRITICO | CORRIGIDO_CONFIRMADO | A pesquisa focada de termos sem acentuacao nao encontrou texto pedagogico problematico; os matches restantes sao caminhos ou nomes de comandos como `docs/planificacao` e `validate-planificacao.sh`. | A regra de portugues de Portugal fica cumprida no conteudo do guia. |
| `MF9-06-AUD-005` | PARCIAL | CORRIGIDO_CONFIRMADO | A matriz do Passo 1 inclui linhas proprias para `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`, alem de `RF61..RF63`. | O gate cobre tambem browsers, responsividade, testes, PT-PT e formatos europeus. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF61`, `RF62` e `RF63`: planos Pro/Familia e entitlements, partilha familiar real e qualidade de streaming por plano.
- `docs/RNF.md` confirma `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`: compatibilidade em browsers, responsividade, testes automatizados e localizacao/formato europeu.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-06` com owner `Kaue`, apoio `Matheus, Mateus, Davi`, prioridade `P0`, dependencias `BK-MF9-01..05`, sprint `S13` e fecho do gate MF9.
- `PLANO-IMPLEMENTACAO-TOTAL.md` confirma Gate S13 como fecho incremental `94/94` requisitos ativos e `66/66` BK.
- `npx playwright test tests/e2e/mf9-family-subscription.spec.js --list` lista 1 teste MF9 no checkout de referencia.
- A implementacao de referencia continua valida: `npm --prefix real_dev/backend run test -- --test-name-pattern=MF9` passou com 16 testes e `npm --prefix real_dev/frontend run build` passou.

### Mapa de integracao da MF

| Categoria | Resultado re-auditado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum. |
| Ficheiros editados nesta execucao | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `docs/evidence/MF9/GATE-S13-MF9.md`, `docs/evidence/MF9/REGRESSAO-MF9.md`, `backend/scripts/seed-mf9-e2e.js`, `tests/e2e/mf9-family-subscription.spec.js`, `playwright.config.js`. |
| Imports/contratos consumidos | Entitlements de `BK-MF9-01`, filtro de qualidade de `BK-MF9-02`, API familiar de `BK-MF9-03`, UI familiar de `BK-MF9-04`, RGPD/metricas familiares de `BK-MF9-05`. |
| Endpoints envolvidos | `GET /api/subscriptions/plans`, `GET /api/playback/:contentId`, `/api/subscriptions/family/*`, `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`. |
| DTOs/validators | Nenhum DTO novo; valida contratos existentes por testes e evidence. |
| Schemas/modelos | Reusa `subscription_plans`, `subscriptions` e `subscription_family_memberships`. |
| Services usados | Subscricoes, playback, catalogo, biblioteca, notificacoes, privacidade e metricas admin. |
| Componentes/paginas frontend | `SubscriptionPage.jsx` e `PlaybackPage.jsx`, incluindo gestao familiar e seletor de qualidade. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao autenticada, acesso premium proprio/familiar, owner com plano Familia, bloqueio de 4K para Pro, role admin para metricas e minimizacao de dados familiares. |
| Testes/evidence | Suite backend MF9 explicita, build frontend, spec Playwright MF9, matriz RF/RNF e revisao manual RNF21/RNF22/RNF38/RNF40. |
| BKs seguintes dependentes | Nenhum; `BK-MF9-06` fecha a MF9. |

### Decisoes confirmadas

- `CANONICO`: `BK-MF9-06` fecha `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`.
- `CANONICO`: Gate S13 revalida regressao backend/frontend e planificacao a `66/66` BK.
- `CANONICO`: a sequencia MF9 e `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `DERIVADO`: separar `GATE-S13-MF9.md` de `REGRESSAO-MF9.md` continua adequado para manter decisao final e logs tecnicos rastreaveis.
- `DERIVADO`: exigir Playwright Chromium automatizado e revisao manual adicional para browser/viewport cobre melhor `RNF21` e `RNF22`.

### Drift documental encontrado

- Sem novo drift canonico entre RF/RNF, backlog, matriz, contrato, MF views, sprint plan e objetivo funcional do gate.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados no guia alvo nem nos guias MF9 auditados para esse padrao.
- Sem drift de dominio relevante no guia alvo; no scan MF9 alargado, as ocorrencias devolvidas sao termos pedagogicos legitimos como `aluno` ou falsos positivos como `IVA` dentro de `DERIVADO`.
- Sem `TODO (BLOCKER)` no guia alvo.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| `rg -n "real_dev\|IMPLEMENTATION_ROOT\|/Users/nuno\|apps/api\|apps/web\|apps/backend\|apps/frontend" docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md` | PASS: zero ocorrencias. |
| `rg -n "real_dev\|IMPLEMENTATION_ROOT\|/Users/nuno\|apps/api\|apps/web\|apps/backend\|apps/frontend" docs/planificacao/guias-bk/MF9` | PASS: zero ocorrencias. |
| Pesquisa de drift de dominio nos guias MF9 | INFO: sem drift relevante; apenas termos pedagogicos esperados e falsos positivos. |
| Pesquisa focada de termos sem acentuacao no BK alvo | PASS: zero ocorrencias linguisticas relevantes; matches restantes em caminhos/comandos. |
| Pesquisa de `TODO (BLOCKER)` no BK alvo | PASS: zero ocorrencias. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: `BK-MF9-06` alinhado com `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38`, `RNF40`, owner `Kaue`, apoio `Matheus, Mateus, Davi`, dependencias `BK-MF9-01..05` e sprint `S13`. |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js --list` | PASS: 1 teste MF9 listado. |
| `npm --prefix real_dev/backend run test -- --test-name-pattern=MF9` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm --prefix real_dev/frontend run build` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: esta reauditoria valida o guia e a implementacao de referencia, mas nao substitui a execucao do E2E completo pelos alunos depois de criarem os ficheiros indicados no BK.
- Risco operacional baixo/medio: a revisao manual de browser adicional, mobile e desktop continua a ser uma evidence esperada no gate final, nao um defeito do guia.
- Risco de drift futuro baixo: se os scripts reais do root continuarem a usar harness interno para docentes, o guia deve manter os caminhos publicos para alunos sempre que for republicado.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` para `BK-MF9-06`.
- Sem blocker canonico para `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` ou `RNF40`.
- Sem pendentes conhecidos dentro do scope desta reauditoria.

---

## Correcao observada - 2026-07-01 - BK-MF9-06 - gate MF9, regressao e evidencia final

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-06`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF4-01`, `BK-MF4-02`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-06` corrigido de `CRITICO` para `OK`; a correcao ficou limitada ao guia alvo e a este relatorio.

### Resultado executivo da correcao observada

`BK-MF9-06` foi reescrito como gate executavel para aluno. O guia agora usa portugues de Portugal com acentuacao, preserva caminhos publicos `backend/` e `frontend/`, inclui matriz de evidence para `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`, e elimina o falso verde causado por comandos backend demasiado genericos.

A correcao fecha a causa raiz da reauditoria anterior: o guia ja nao manda o aluno depender de ficheiros existentes apenas na raiz interna. Em vez disso, ensina a criar `backend/scripts/seed-mf9-e2e.js`, a configurar `playwright.config.js` com roots publicas, a criar/executar `tests/e2e/mf9-family-subscription.spec.js` e a correr explicitamente `node --test tests/unit/mf9-subscriptions.test.js` para que a suite falhe se a prova MF9 nao existir.

### Contagem antes e depois da correcao observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 1 | 0 |

Nota: o "Antes" reflete a reauditoria imediatamente abaixo, que classificou `BK-MF9-06` como `CRITICO`.

### BKs editados nesta correcao

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md` | Reescrito com gate publicavel, seed E2E, spec Playwright, matriz RF/RNF e validacao anti-falso-verde. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta correcao. |

### Findings atuais

| ID | Severidade original | Estado atual | Evidencia pos-correcao | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-06-AUD-001` | CRITICO | CORRIGIDO | O Passo 3 passa a criar `backend/scripts/seed-mf9-e2e.js` completo, com contas owner/membro/Pro e conteudo 1080p/4K. | O aluno ja nao precisa de adivinhar o seed nem depender de ficheiro interno para executar o fluxo end-to-end. |
| `MF9-06-AUD-002` | CRITICO | CORRIGIDO | O Passo 6 publica `tests/e2e/mf9-family-subscription.spec.js` completo e o comando `npx playwright test tests/e2e/mf9-family-subscription.spec.js`; o Passo 2 publica `playwright.config.js` com `backend/` e `frontend/`. | O E2E MF9 fica publicavel, reproduzivel e alinhado com os roots dos alunos. |
| `MF9-06-AUD-003` | CRITICO | CORRIGIDO | O Passo 4 substitui a prova backend generica por `cd backend && node --test tests/unit/mf9-subscriptions.test.js`. | O gate deixa de aceitar falso verde: se a suite MF9 nao existir, o comando falha. |
| `MF9-06-AUD-004` | CRITICO | CORRIGIDO | O guia foi normalizado para portugues de Portugal com acentuacao em titulos, texto pedagogico, evidence, comentarios, JSDoc e mensagens visiveis. | O BK volta a cumprir a regra linguistica e reforca `RNF38`/`RNF40`. |
| `MF9-06-AUD-005` | PARCIAL | CORRIGIDO | A matriz de evidence do Passo 1 inclui linhas obrigatorias para `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`, alem de `RF61..RF63`. | O gate cobre tambem browsers, responsividade, testes, PT-PT e formatos europeus. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF61`, `RF62` e `RF63`: planos Pro/Familia e entitlements, partilha familiar real e qualidade de streaming por plano.
- `docs/RNF.md` confirma `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`: compatibilidade em browsers, responsividade, testes automatizados e localizacao/formato europeu.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-06` com owner `Kaue`, apoio `Matheus, Mateus, Davi`, prioridade `P0`, dependencias `BK-MF9-01..05`, sprint `S13` e fecho do gate MF9.
- `PLANO-IMPLEMENTACAO-TOTAL.md` confirma Gate S13 como fecho incremental `94/94` requisitos ativos e `66/66` BK.
- A implementacao de referencia confirmou a validade tecnica do seed/teste usados como base: `npm --prefix real_dev/backend run test -- --test-name-pattern=MF9` passou com 16 testes e `npm --prefix real_dev/frontend run build` passou.

### Mapa de integracao da MF

| Categoria | Resultado pos-correcao |
| --- | --- |
| Ficheiros criados pelo BK | `docs/evidence/MF9/GATE-S13-MF9.md`, `docs/evidence/MF9/REGRESSAO-MF9.md`, `backend/scripts/seed-mf9-e2e.js`, `tests/e2e/mf9-family-subscription.spec.js`. |
| Ficheiros editados pelo BK | `playwright.config.js`; evidence MF9. |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Exports produzidos | Nenhum export aplicacional novo; o BK produz seed, E2E e artefactos de evidence. |
| Imports consumidos de BKs anteriores | Entitlements de `BK-MF9-01`, filtro de qualidade de `BK-MF9-02`, API familiar de `BK-MF9-03`, UI familiar de `BK-MF9-04`, RGPD/metricas de `BK-MF9-05`. |
| Endpoints envolvidos | `GET /api/subscriptions/plans`, `GET /api/playback/:contentId`, `/api/subscriptions/family/*`, `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`. |
| DTOs/validators criados | Nenhum DTO novo; valida contratos existentes por testes e evidence. |
| Schemas/modelos criados | Nenhum schema novo; reusa `subscription_plans`, `subscriptions` e `subscription_family_memberships`. |
| Services usados | Subscricoes, playback, privacidade, metricas admin, catalogo, notificacoes e biblioteca durante seed/testes. |
| Componentes/paginas frontend usados | `SubscriptionPage.jsx` e `PlaybackPage.jsx`, incluindo gestao familiar e seletor de qualidade. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao autenticada, acesso premium proprio/familiar, owner com plano Familia, bloqueio de 4K para Pro, role admin para metricas e minimizacao de dados familiares. |
| Testes criados/consumidos | Seed E2E MF9, Playwright MF9 e suite backend MF9 explicita. |
| BKs seguintes dependentes | Nenhum; `BK-MF9-06` fecha a MF9. |

### Decisoes confirmadas nesta correcao

- `CANONICO`: `BK-MF9-06` fecha `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`.
- `CANONICO`: Gate S13 revalida regressao backend/frontend e planificacao a `66/66` BK.
- `CANONICO`: a sequencia MF9 e `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `DERIVADO`: separar `GATE-S13-MF9.md` de `REGRESSAO-MF9.md` melhora a rastreabilidade sem alterar requisitos.
- `DERIVADO`: usar Playwright Chromium como prova automatizada minima e exigir revisao manual adicional para browsers/viewports fecha melhor `RNF21`/`RNF22`.

### Drift documental encontrado

- Drift de publicacao/executabilidade fechado: o guia deixa de apontar apenas para artefactos internos e passa a ensinar seed/E2E publicaveis.
- Drift de classificacao fechado: a reauditoria anterior rebaixou `BK-MF9-06` para `CRITICO`; esta correcao fecha os findings e promove o BK para `OK`.
- Sem drift canonico entre RF/RNF, backlog, matriz, contrato, MF views, sprint plan e objetivo funcional do gate.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados nos guias MF9.
- A pesquisa de drift de dominio devolveu apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`.

### Validacoes executadas nesta correcao

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Pesquisa focada de termos sem acento no BK alvo | PASS: zero ocorrencias relevantes. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: `BK-MF9-06` alinhado com `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38`, `RNF40`, owner `Kaue`, apoio `Matheus, Mateus, Davi`, dependencias `BK-MF9-01..05` e sprint `S13`. |
| `npm --prefix real_dev/backend run test -- --test-name-pattern=MF9` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm --prefix real_dev/frontend run build` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a correcao foi documental/pedagogica; o guia passa a ensinar o fluxo publicavel e a implementacao de referencia continua validada.
- Risco operacional medio: o E2E publicavel ainda deve ser executado pelos alunos depois de criarem os ficheiros indicados no BK, com MongoDB local/Atlas disponivel.
- Risco de browser baixo/medio: Playwright Chromium cobre o fluxo automatizado minimo, mas `RNF21` continua a exigir registo manual do browser adicional usado na defesa.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` para `BK-MF9-06`.
- Sem blocker canonico para `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` ou `RNF40`.
- Sem pendentes conhecidos dentro do scope desta correcao.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-06 - gate MF9, regressao e evidencia final

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-06`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF4-01`, `BK-MF4-02`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-06` re-auditado como `CRITICO`; nenhum guia BK nem codigo real foi editado. Apenas este relatorio foi atualizado.

### Resultado executivo da reauditoria observada

`BK-MF9-06` esta corretamente posicionado na sequencia canonica da MF9: consome `BK-MF9-01..05`, fecha o gate S13, cobre `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`, e liga o fecho da MF9 ao universo ativo de `66/66` BK.

Mesmo assim, o guia atual nao pode ficar `OK` para alunos. O problema principal nao e a app de referencia: `real_dev/backend` tem seed E2E MF9, teste unitario MF9 e a suite MF9 passou; `real_dev/frontend` tambem compila. O problema e o transporte incompleto para o guia publicado. O BK manda rever `backend/scripts/seed-mf9-e2e.js` e `backend/tests/unit/mf9-subscriptions.test.js`, mas esses ficheiros nao existem na raiz publica `backend/` atual; o seed MF9 e o teste MF9 existem apenas em `real_dev/backend`. Alem disso, o BK nao ensina a criar o seed, nao aponta para `tests/e2e/mf9-family-subscription.spec.js`, nao apresenta um comando publicavel para o E2E MF9, e a validacao backend generica consegue passar sem executar qualquer teste MF9 na raiz publica.

Tambem permanece uma falha formal de publicacao: o guia tem dezenas de ocorrencias sem acentuacao em texto pedagogico e evidence destinada aos alunos (`regressao`, `evidencia`, `decisao`, `nao`, `Familia`, `planificacao`, `tecnica`, `autorizacao`, entre outras). Isto viola a regra de portugues de Portugal e enfraquece precisamente os RNFs de localizacao e evidence que o BK pretende fechar.

Como `MODO=auditar_apenas`, estes problemas ficam registados como findings. A correcao recomendada deve ser feita numa execucao posterior com permissao para editar `BK-MF9-06`.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 0 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 1 |

Nota: o "Antes" reflete a classificacao historica mais recente neste relatorio, que marcava `BK-MF9-06` como `OK` apos a correcao global da MF9. Esta reauditoria fresca rebaixa apenas o BK alvo para `CRITICO`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade | Estado | Evidencia atual | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-06-AUD-001` | CRITICO | BLOQUEADO_POR_SCOPE | O Passo 5 manda rever `backend/scripts/seed-mf9-e2e.js`, mas `backend/scripts/seed-mf9-e2e.js` nao existe na raiz publica; existe apenas em `real_dev/backend/scripts/seed-mf9-e2e.js`. Nenhum BK anterior da MF9 ensina a criar esse seed. | O aluno nao consegue executar o fluxo end-to-end controlado sem adivinhar ou depender da pasta interna. Para um gate final, isto bloqueia a evidence de `RF62`, `RF63`, `RNF21` e `RNF22`. |
| `MF9-06-AUD-002` | CRITICO | BLOQUEADO_POR_SCOPE | O BK nao referencia `tests/e2e/mf9-family-subscription.spec.js` nem o comando E2E real. O `package.json` do root tem `npm run e2e:mf9`, mas esse script usa `npm --prefix real_dev/backend run seed:e2e:mf9`, que nao e publicavel para alunos. | A evidence de fluxo principal fica incompleta: o aluno recebe uma checklist manual, mas nao recebe o contrato executavel que ja existe na implementacao de referencia. |
| `MF9-06-AUD-003` | CRITICO | BLOQUEADO_POR_SCOPE | O BK indica `cd backend && npm test`. Na raiz publica, `npm --prefix backend run test -- --test-name-pattern=MF9` passou com 9 ficheiros genericos, mas nao executou testes MF9 porque `backend/tests/unit/mf9-subscriptions.test.js` nao existe ali. Em `real_dev/backend`, o mesmo filtro executa 16 testes e inclui 6 testes MF9. | O gate pode dar falso verde: a suite backend passa mesmo sem provar planos Familia, convites, filtro 4K e RGPD familiar no tree publicado. |
| `MF9-06-AUD-004` | CRITICO | BLOQUEADO_POR_SCOPE | O guia contem varias ocorrencias sem acentuacao em texto pedagogico e templates de evidence: linhas 1, 24, 26, 30, 36, 38, 41, 46, 52, 65-67, 74-78, 112, 133, 167, 202, 237, 303, 323, 346, 366, 374, 396-407. | Viola a regra linguistica da prompt e enfraquece `RNF38`/`RNF40`, especialmente num BK que fecha evidence e localizacao. |
| `MF9-06-AUD-005` | PARCIAL | BLOQUEADO_POR_SCOPE | A matriz de evidence do Passo 1 fixa linhas para `RF61`, `RF62` e `RF63`, mas nao obriga linhas para `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`; estes RNFs aparecem na metadata e na lista de fontes, mas nao ficam operacionalizados em browser, responsividade, testes, PT-PT e formato europeu. | O gate fica menos completo para defesa: cobre o nucleo funcional, mas deixa RNFs do proprio BK dependentes de interpretacao do aluno. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF61`, `RF62` e `RF63`: planos Pro/Familia e entitlements, partilha familiar real e qualidade de streaming por plano.
- `docs/RNF.md` confirma `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`: compatibilidade em browsers, responsividade, testes automatizados e localizacao PT-PT/formato europeu.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-06` com owner `Kaue`, apoio `Matheus, Mateus, Davi`, prioridade `P0`, dependencias `BK-MF9-01..05`, sprint `S13` e fecho do gate MF9.
- `PLANO-IMPLEMENTACAO-TOTAL.md` confirma Gate S13 como fecho incremental `94/94` requisitos ativos e `66/66` BK.
- `BK-MF8-10` entrega para `BK-MF9-01`; `BK-MF9-01..05` preparam planos, qualidade, familia, UI, privacidade e metricas para o gate final.
- A implementacao de referencia confirma `real_dev/backend/tests/unit/mf9-subscriptions.test.js`, `real_dev/backend/scripts/seed-mf9-e2e.js`, `tests/e2e/mf9-family-subscription.spec.js` e a configuracao Playwright com web servers em `real_dev`.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum nesta execucao. |
| Ficheiros editados nesta execucao | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `docs/evidence/MF9/GATE-S13-MF9.md`, `docs/evidence/MF9/REGRESSAO-MF9.md`, `backend/tests/unit/mf9-subscriptions.test.js`, `backend/scripts/seed-mf9-e2e.js`, `frontend/src/pages/SubscriptionPage.jsx`, `frontend/src/pages/PlaybackPage.jsx`, `scripts/validate-planificacao.sh`, `docs/planificacao/sprints/PLANO-SPRINTS.md`. |
| Exports produzidos | Nenhum export aplicacional novo; o BK produz evidence documental e decisao de gate. |
| Imports/contratos consumidos | Entitlements de `BK-MF9-01`, filtro de qualidade de `BK-MF9-02`, API familiar de `BK-MF9-03`, UI familiar de `BK-MF9-04`, RGPD/metricas familiares de `BK-MF9-05`. |
| Endpoints envolvidos | `GET /api/subscriptions/plans`, `GET /api/playback/:contentId`, `/api/subscriptions/family/*`, `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`. |
| DTOs/validators | Nao cria DTO novo; valida contratos existentes por testes e evidence. |
| Schemas/modelos | Reusa `subscription_plans`, `subscriptions` e `subscription_family_memberships`. |
| Services | Subscricoes, playback, privacidade, metricas admin e pool solidaria. |
| Componentes/paginas frontend | `SubscriptionPage.jsx` e `PlaybackPage.jsx`, incluindo gestao familiar e seletor de qualidade. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao autenticada, acesso premium proprio/familiar, owner com plano Familia, bloqueio de 4K para Pro, role admin para metricas e minimizacao de dados familiares. |
| Testes/evidence | Unitarios MF9 em `real_dev/backend` passaram; build `real_dev/frontend` passou; spec E2E MF9 existe, mas o guia nao publica um caminho executavel completo para alunos. |
| BKs seguintes dependentes | Nenhum; `BK-MF9-06` fecha a MF9. |

### Decisoes confirmadas

- `CANONICO`: `BK-MF9-06` deve fechar `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`.
- `CANONICO`: Gate S13 revalida regressao backend/frontend e planificacao a `66/66` BK.
- `CANONICO`: a sequencia MF9 e `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `DERIVADO`: `GO_COM_RESSALVAS` e uma decisao aceitavel se a app estiver funcional mas faltar prova manual/browser completa; o guia deve, ainda assim, explicar que evidence falta.
- `DERIVADO`: separar `GATE-S13-MF9.md` de `REGRESSAO-MF9.md` e uma organizacao documental aceitavel para PR/defesa.

### Drift documental encontrado

- Drift de publicacao/executabilidade: o contrato real de E2E MF9 existe na implementacao interna, mas nao foi transportado para caminhos/comandos publicaveis no guia do aluno.
- Drift de classificacao: o estado historico marcava `BK-MF9-06` como `OK`; esta reauditoria classifica o BK alvo como `CRITICO`.
- Sem drift canonico entre RF/RNF, backlog, matriz, contrato, MF views, sprint plan e objetivo funcional do gate.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados nos guias MF9.
- A pesquisa de drift de dominio devolveu apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Pesquisa focada de termos sem acentuacao no BK alvo | FINDING: varias ocorrencias em texto pedagogico e templates de evidence. |
| Estrutura obrigatoria do BK alvo | PASS estrutural: 16 secoes obrigatorias e 7 passos. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: `BK-MF9-06` alinhado com `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38`, `RNF40`, owner `Kaue`, apoio `Matheus, Mateus, Davi`, dependencias `BK-MF9-01..05` e sprint `S13`. |
| Verificacao de ficheiros publicos `backend/scripts/seed-mf9-e2e.js` e `backend/tests/unit/mf9-subscriptions.test.js` | FAIL documental: ambos em falta na raiz publica atual. |
| Verificacao de ficheiros internos `real_dev/backend/scripts/seed-mf9-e2e.js` e `real_dev/backend/tests/unit/mf9-subscriptions.test.js` | PASS: ambos existem como referencia validavel. |
| `npm --prefix backend run test -- --test-name-pattern=MF9` | PASS enganador: 9 ficheiros passaram, mas zero testes MF9 especificos foram executados porque o ficheiro MF9 nao existe na raiz publica. |
| `npm --prefix real_dev/backend run test -- --test-name-pattern=MF9` | PASS: 16 testes, 16 passed, 0 failed, incluindo 6 testes MF9. |
| `npm --prefix real_dev/frontend run build` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco pedagogico alto: o aluno precisa de adivinhar como criar/usar seed E2E MF9 e qual comando executar para provar o fluxo completo.
- Risco tecnico alto: o comando backend publicado pode passar sem cobrir MF9, criando falso sentimento de gate fechado.
- Risco de evidence alto: `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40` nao ficam totalmente operacionalizados na matriz de evidence.
- Risco de qualidade textual medio: o guia nao cumpre a regra de portugues de Portugal com acentuacao em texto destinado aos alunos.
- Risco operacional baixo na app de referencia: testes MF9 internos e build frontend passaram nesta reauditoria.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` por falta de contrato canonico; os contratos existem.
- Correcao bloqueada por modo: `auditar_apenas` nao permite editar `BK-MF9-06` nesta execucao.
- Proxima acao recomendada: executar `corrigir_apenas` para `BK-MF9-06`, publicando um fluxo E2E student-safe, incluindo seed/teste ou instrucoes completas para os criar, normalizando PT-PT e tornando todos os RF/RNF do gate linhas obrigatorias de evidence.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-05 - estado pos-correcao

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-05`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-05` re-auditado no estado atual como `OK`; nenhum guia BK nem codigo real foi editado. Apenas este relatorio foi atualizado.

### Resultado executivo da reauditoria observada

`BK-MF9-05` esta agora apto para aluno seguir sem adivinhar pecas tecnicas em falta. O guia atual conserva a estrutura obrigatoria de 16 secoes, tem 7 passos tecnicos, usa caminhos publicos `backend/`, evita linguagem interna e apresenta funcoes completas ou blocos de revisao suficientes para fechar privacidade, metricas admin, pool solidaria e evidence MF9.

A reauditoria nao reproduziu os findings da reauditoria historica preservada mais abaixo. O Passo 4 ja nao esta truncado: a versao atual de `getAdminMetrics` preserva `generatedAt`, `range`, `users`, `catalog`, `privacy`, `notifications` e `solidarity`, acrescentando apenas `subscriptions.familyMembers` e `subscriptions.familyInvitationsPending`. Os Passos 2 e 3 mostram as funcoes completas de privacidade, e a validacao final fixa endpoints, status HTTP esperados e negativos objetivos.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a secao de correcao imediatamente abaixo, que ja tinha fechado `BK-MF9-05` como `OK`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings reavaliados

| ID | Estado nesta reauditoria | Evidencia atual | Conclusao |
| --- | --- | --- | --- |
| `MF9-05-AUD-001` | NAO_REPRODUZIDO | Passo 4 publica `getAdminMetrics` completo e preserva os grupos herdados de metricas, incluindo `users`, `catalog`, `privacy`, `notifications`, `solidarity`, `generatedAt` e `range`. | O risco de regressao das metricas MF5/MF4 esta fechado no guia atual. |
| `MF9-05-AUD-002` | NAO_REPRODUZIDO | Passos 2 e 3 apresentam `exportFamilyMemberships`, `buildUserDataExport`, `invalidateFamilyMembershipsForDeletedAccount` e `deleteMyAccount` como funcoes completas. | O guia ja nao depende de excertos soltos nos fluxos RGPD. |
| `MF9-05-AUD-003` | NAO_REPRODUZIDO | O BK atual usa portugues de Portugal com acentuacao no texto pedagogico, criterios, expected results, handoff e changelog. | A falha linguistica antiga nao se mantem no estado atual. |
| `MF9-05-AUD-004` | NAO_REPRODUZIDO | A contagem de blocos confirmou comentarios suficientes nos blocos longos: 20, 16, 8, 11 e 2 comentarios nos blocos de codigo relevantes. | O contrato de comentarios didaticos esta cumprido para o guia atual. |
| `MF9-05-AUD-005` | NAO_REPRODUZIDO | A validacao final explicita `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`, status esperados e negativos de confirmacao/role. | A evidence de PR/defesa ja e objetiva. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF55`, `RF56`, `RF59` e `RF62`: exportacao, eliminacao, metricas admin e partilha familiar real entre contas existentes.
- `docs/RNF.md` confirma `RNF17`, `RNF19` e `RNF30`: protecao de dados sensiveis, auditoria de operacoes criticas e logs/operacao com contexto suficiente.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-05` com owner `Davi`, apoio `Kaue`, prioridade `P1`, dependencias `BK-MF9-03,BK-MF9-04`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `BK-MF9-03` entrega a colecao `subscription_family_memberships`; `BK-MF9-04` entrega a UI/fluxo de convites; `BK-MF9-06` consome a evidence final deste BK.
- A implementacao de referencia confirma os contratos de `privacy.service.js`, `admin-metrics.service.js`, `pool-distribution.service.js` e `tests/unit/mf9-subscriptions.test.js`.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum. |
| Ficheiros editados nesta execucao | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/privacy/privacy.service.js`, `backend/src/modules/admin-metrics/admin-metrics.service.js`, `backend/tests/unit/mf9-subscriptions.test.js`; revisao de `privacy.controller.js`, `privacy.routes.js`, `admin-metrics.controller.js`, `admin-metrics.routes.js`, `charities/pool-distribution.service.js` e `subscriptions.service.js`. |
| Exports produzidos/consumidos | `buildUserDataExport`, `deleteMyAccount`, `getAdminMetrics`; helpers internos `exportFamilyMemberships` e `invalidateFamilyMembershipsForDeletedAccount`. |
| Endpoints envolvidos | `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`. |
| DTOs/validators | Reusa validacoes de privacidade e metricas existentes; nao cria DTO novo. |
| Schemas/modelos | Reusa `subscription_family_memberships` criado por `BK-MF9-03`. |
| Services | Privacidade, metricas admin, subscricoes e pool solidaria. |
| Componentes frontend | Nao aplicavel neste BK. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao autenticada para privacidade; role admin para metricas; metricas agregadas sem dados pessoais; pool baseada em subscricoes pagas do owner. |
| Testes | Suite MF9 backend com exportacao e invalidacao familiar; build frontend usado como regressao geral da implementacao de referencia. |
| BKs seguintes dependentes | `BK-MF9-06` depende desta evidence para fechar o gate final S13. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: `BK-MF9-05` deve ligar `RF55`, `RF56`, `RF59` e `RF62` para que memberships familiares entrem em exportacao RGPD, eliminacao de conta e metricas admin.
- `CANONICO`: metricas admin ficam agregadas e nao expõem emails, nomes ou IDs pessoais de membros familiares.
- `CANONICO`: membros familiares recebem acesso derivado, mas nao contam como novas subscricoes pagas para a pool solidaria.
- `DERIVADO`: invalidar memberships `pending`/`active` com `status: "removed"` e `removedReason: "account_deleted"` fecha acesso sem destruir o trilho operacional minimo.
- `DERIVADO`: a evidence HTTP manual continua separada do teste unitario MF9, porque a defesa final deve provar endpoints reais com sessao/role.

### Drift documental encontrado

- Sem drift canonico novo entre RF/RNF, backlog, matriz, contrato de campos, views, sprint plan e sequencia funcional da MF9.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados nos guias MF9.
- A pesquisa de drift de dominio devolveu apenas falsos positivos de `IVA` dentro de `DERIVADO`.
- A reauditoria historica preservada abaixo ficou obsoleta face ao estado atual do BK, mas foi mantida por rastreabilidade.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Contagem de blocos de codigo | PASS: blocos longos com comentarios suficientes. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: BK alinhado com `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30`, owner `Davi`, apoio `Kaue`, dependencia `BK-MF9-03,BK-MF9-04` e sprint `S13`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a reauditoria e documental/pedagogica; o BK alvo esta coerente com a implementacao de referencia e com os BKs vizinhos.
- Risco operacional baixo: a suite MF9 passa, mas a defesa final ainda deve recolher evidence HTTP real no ambiente dos alunos.
- Risco historico baixo: secoes antigas continuam no relatorio por rastreabilidade; a fonte de verdade mais recente e esta secao de topo.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` para `BK-MF9-05`.
- Sem blocker de implementacao real encontrado para `RF55`, `RF56`, `RF59` ou `RF62`.
- Sem pendentes conhecidos dentro do scope desta reauditoria.

---

## Correcao observada - 2026-07-01 - BK-MF9-05 - privacidade, operacao e metricas familiares

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-05`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-05` corrigido de `CRITICO` para `OK`; a correcao ficou limitada ao guia alvo e a este relatorio.

### Resultado executivo da correcao observada

`BK-MF9-05` foi reescrito como guia autocontido para aluno. O guia agora usa portugues de Portugal com acentuacao, conserva caminhos publicos `backend/`, remove fragmentos incompletos e passa a ensinar funcoes completas ou blocos funcionais completos para privacidade, metricas admin, revisao da pool solidaria e teste MF9.

A correcao fecha o risco principal da reauditoria anterior: o Passo 4 ja nao publica uma versao truncada de `getAdminMetrics`. A versao atual preserva `generatedAt`, `range`, `users`, `catalog`, `privacy`, `notifications` e `solidarity`, acrescentando apenas `subscriptions.familyMembers` e `subscriptions.familyInvitationsPending`.

Tambem foram fechados os problemas de completude em privacidade: `exportFamilyMemberships`, `buildUserDataExport`, `invalidateFamilyMembershipsForDeletedAccount` e `deleteMyAccount` aparecem como funcoes completas com JSDoc, comentarios didaticos e explicacao pedagogica. A evidence final passa a incluir endpoints, status esperados e negativos objetivos.

### Contagem antes e depois da correcao observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 1 | 0 |

Nota: o "Antes" reflete a reauditoria imediatamente abaixo, que tinha classificado `BK-MF9-05` como `CRITICO`.

### BKs editados nesta correcao

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md` | Corrigido e reescrito dentro do contrato tutorial MF9. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta correcao. |

### Findings atuais

| ID | Severidade original | Estado atual | Evidencia pos-correcao | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-05-AUD-001` | CRITICO | CORRIGIDO | O Passo 4 publica a funcao completa `getAdminMetrics` e preserva `generatedAt`, `range`, `users`, `catalog`, `privacy`, `notifications` e `solidarity`, acrescentando apenas contagens familiares agregadas. | O aluno ja nao apaga metricas herdadas de MF5/MF4 ao aplicar o BK. |
| `MF9-05-AUD-002` | CRITICO | CORRIGIDO | Os Passos 2 e 3 mostram funcoes completas: `exportFamilyMemberships`, `buildUserDataExport`, `invalidateFamilyMembershipsForDeletedAccount` e `deleteMyAccount`. | O guia deixa de depender de excertos soltos em fluxos RGPD/admin. |
| `MF9-05-AUD-003` | CRITICO | CORRIGIDO | O guia foi normalizado para PT-PT com acentuacao em titulos, texto pedagogico, JSDoc, comentarios, expected results, criterios e changelog. | O BK volta a cumprir a regra linguistica para guias de aluno. |
| `MF9-05-AUD-004` | PARCIAL | CORRIGIDO | Blocos longos foram reforcados com comentarios didaticos junto de exportacao RGPD, limpeza de sessao, contagens agregadas, calculo em centimos e confirmacao forte no teste. | O aluno recebe explicacao dentro do codigo nos pontos de maior risco. |
| `MF9-05-AUD-005` | PARCIAL | CORRIGIDO | A validacao final explicita `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`, status esperados, payloads principais e negativos. | A evidence de PR/defesa passa a ser objetiva e verificavel. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF55`, `RF56`, `RF59` e `RF62`: exportacao, eliminacao, metricas admin e partilha familiar real entre contas existentes.
- `docs/RNF.md` confirma `RNF17`, `RNF19` e `RNF30`: protecao de dados sensiveis, auditoria de operacoes criticas e logs/operacao com contexto suficiente.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-05` com owner `Davi`, apoio `Kaue`, prioridade `P1`, dependencias `BK-MF9-03,BK-MF9-04`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- A implementacao de referencia confirma os contratos em `privacy.service.js`, `admin-metrics.service.js`, `pool-distribution.service.js`, rotas/controllers de privacidade/metricas e testes unitarios MF9.

### Mapa de integracao da MF

| Categoria | Resultado pos-correcao |
| --- | --- |
| Ficheiros criados | Nenhum. |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/privacy/privacy.service.js`, `backend/src/modules/admin-metrics/admin-metrics.service.js`, `backend/tests/unit/mf9-subscriptions.test.js`; revisao de `privacy.controller.js`, `privacy.routes.js`, `admin-metrics.controller.js`, `admin-metrics.routes.js`, `charities/pool-distribution.service.js` e `subscriptions.service.js`. |
| Exports produzidos/consumidos | `buildUserDataExport`, `deleteMyAccount`, `getAdminMetrics`; helpers internos `exportFamilyMemberships` e `invalidateFamilyMembershipsForDeletedAccount`. |
| Endpoints envolvidos | `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`. |
| DTOs/validators | Reusa validacoes de privacidade e metricas existentes; nao cria DTO novo. |
| Schemas/modelos | Reusa `subscription_family_memberships` criado por `BK-MF9-03`. |
| Services | Privacidade, metricas admin, subscricoes e pool solidaria. |
| Componentes frontend | Nao aplicavel neste BK. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao autenticada para privacidade; role admin para metricas; metricas agregadas sem dados pessoais; pool baseada em subscricoes pagas do owner. |
| Testes | Suite MF9 backend com exportacao/invalidation; build frontend usado como regressao geral da implementacao de referencia. |
| BKs seguintes dependentes | `BK-MF9-06` depende da evidence RGPD/admin/pool deste BK para fechar o gate S13. |

### Decisoes confirmadas nesta correcao

- `CANONICO`: `BK-MF9-05` fecha o impacto de memberships familiares em exportacao RGPD, eliminacao de conta e metricas admin.
- `CANONICO`: metricas admin devem ser agregadas e nao expor emails, nomes ou IDs pessoais de membros familiares.
- `CANONICO`: membros familiares nao contam como novas subscricoes pagas para efeitos da pool solidaria.
- `CANONICO`: `BK-MF9-06` depende desta prova operacional antes do gate final.
- `DERIVADO`: invalidar memberships `pending`/`active` com `status: "removed"` e `removedReason: "account_deleted"` remove acesso sem apagar trilho operacional minimo.

### Drift documental encontrado

- Drift de classificacao fechado: a reauditoria anterior marcou `BK-MF9-05` como `CRITICO`; esta correcao fecha os findings e devolve o BK a `OK`.
- Sem drift canonico entre RF/RNF, backlog, matriz, contrato de campos, views, sprint plan e sequencia funcional da MF9.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados nos guias MF9.
- A pesquisa de drift de dominio devolve apenas falsos positivos de `IVA` dentro de `DERIVADO`.

### Validacoes executadas nesta correcao

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Contagem de blocos de codigo | PASS: blocos longos com comentarios didaticos suficientes. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: BK alinhado com `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30`, owner `Davi`, apoio `Kaue`, dependencia `BK-MF9-03,BK-MF9-04` e sprint `S13`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a correcao foi documental/pedagogica; a implementacao de referencia continua validada por testes MF9 e build frontend.
- Risco operacional baixo: os testes automatizados passam, mas a defesa final ainda deve executar/recolher evidence HTTP real no ambiente dos alunos.
- Risco historico baixo: o relatorio preserva secoes antigas abaixo; a fonte de verdade operacional mais recente e esta secao de topo.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` para `BK-MF9-05`.
- Sem blocker de implementacao real encontrado para `RF55`, `RF56`, `RF59` ou `RF62`.
- Sem pendentes conhecidos apos esta correcao.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-05 - privacidade, operacao e metricas familiares

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-05`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-05` re-auditado como `CRITICO`; nenhum guia BK nem codigo real foi editado. Apenas este relatorio foi atualizado.

### Resultado executivo da reauditoria observada

`BK-MF9-05` esta corretamente posicionado na sequencia canonica da MF9: consome a API/modelo familiar de `BK-MF9-03`, depende da UI de `BK-MF9-04` e prepara `BK-MF9-06` para o gate S13. A implementacao de referencia confirma que a funcionalidade existe: `privacy.service.js` exporta memberships familiares, invalida memberships abertas na eliminacao de conta, `admin-metrics.service.js` devolve metricas agregadas e a pool solidaria continua baseada em documentos de `subscriptions`.

Mesmo assim, o guia atual nao deve ficar `OK` para alunos. O bloco de metricas do Passo 4 e um fragmento truncado de `getAdminMetrics`: se for aplicado literalmente, remove campos ja existentes como `generatedAt`, `range`, `users.blocked`, `users.deleted`, `catalog`, `privacy`, `notifications` e `solidarity`. Alem disso, o guia continua com texto pedagogico, JSDoc, comentarios e mensagens visiveis sem acentuacao PT-PT, e varios blocos sao apresentados como "codigo completo" apesar de serem insercoes parciais em funcoes existentes de privacidade/metricas.

Como `MODO=auditar_apenas`, estes problemas ficam registados como findings abertos. A correcao recomendada deve ser feita numa execucao posterior com permissao para editar o BK alvo.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 0 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 1 |

Nota: o "Antes" reflete a classificacao historica mais recente neste relatorio, que marcava `BK-MF9-05` como `OK` apos a correcao global da MF9. Esta reauditoria fresca rebaixa apenas o BK alvo para `CRITICO`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade | Estado | Evidencia | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-05-AUD-001` | CRITICO | ABERTO | O Passo 4 mostra apenas um fragmento de `getAdminMetrics` nas linhas 304-331 do BK. A implementacao real contem mais campos nas linhas 52-125 de `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js`: `generatedAt`, `range`, `users.blocked`, `users.deleted`, `catalog`, `privacy`, `notifications` e `solidarity`. | Um aluno que substitua a funcao pelo bloco do BK regressa `RF59`, quebra metricas herdadas de MF5/MF4 e perde dados operacionais necessarios ao painel admin. |
| `MF9-05-AUD-002` | CRITICO | ABERTO | Os Passos 2 e 3 dizem "Codigo completo", mas apresentam excertos de `privacy.service.js` e uma insercao isolada de `Promise.all` nas linhas 150-200 e 231-274, sem mostrar a funcao completa a substituir nem a posicao segura dentro de `deleteMyAccount`. | Em privacidade/RGPD, snippets parciais aumentam o risco de imports partidos, retorno incompleto, limpeza de sessao mal posicionada ou perda de comportamento criado em `BK-MF5-01` e `BK-MF5-02`. |
| `MF9-05-AUD-003` | CRITICO | ABERTO | O BK tem muitas ocorrencias de texto pedagogico e mensagens sem acentuacao: por exemplo linhas 1, 24, 30, 67-71, 75-80, 187, 205, 278, 336, 367 e 428. | Viola a regra de portugues de Portugal para guias de aluno, JSDoc, comentarios didaticos e mensagens visiveis. Em fluxos RGPD/admin, isto tambem degrada defesa pedagogica e alinhamento com `RNF05`/qualidade textual ja exigida nos BKs anteriores. |
| `MF9-05-AUD-004` | PARCIAL | ABERTO | Os blocos longos de codigo tem comentario de caminho e apenas um comentario didatico real junto da decisao principal. Exemplos: bloco 1 com 45 linhas nao vazias, bloco 2 com 29, bloco 4 com 26 e bloco 5 com 27. | A regra da prompt exige pelo menos 2 comentarios didaticos em blocos com 20+ linhas e comentarios junto de validacao, async, persistencia, privacidade e testes. O aluno fica com menos apoio nos pontos de risco. |
| `MF9-05-AUD-005` | PARCIAL | ABERTO | A validacao final indica pedidos genericos, mas nao fixa os endpoints/respostas observaveis: `GET /api/privacy/export`, `DELETE /api/privacy/account` e `GET /api/admin/metrics` devolvem `200` nas controllers reais; negativos devem cobrir confirmacao errada e role comum em metricas. | A evidence de PR/defesa fica menos objetiva e obriga o aluno a descobrir status HTTP, payloads e negativos que o BK deveria explicitar. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF55`, `RF56`, `RF59` e `RF62`: exportacao, eliminacao, metricas admin e partilha familiar real entre contas existentes.
- `docs/RNF.md` confirma `RNF17`, `RNF19` e `RNF30`: protecao de dados sensiveis, auditoria de operacoes criticas e logs/operacao com contexto suficiente.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-05` com owner `Davi`, apoio `Kaue`, prioridade `P1`, dependencias `BK-MF9-03,BK-MF9-04`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `real_dev/backend/src/modules/privacy/privacy.service.js` confirma `exportFamilyMemberships`, `buildUserDataExport`, `invalidateFamilyMembershipsForDeletedAccount` e `familyMembershipsUpdated`.
- `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js` confirma metricas familiares agregadas sem emails/nomes, mas preserva muito mais campos do que o fragmento publicado no BK.
- `real_dev/backend/src/modules/charities/pool-distribution.service.js` confirma que a pool solidaria usa `subscriptions` ativas e nao `subscription_family_memberships`.
- `real_dev/backend/tests/unit/mf9-subscriptions.test.js` confirma teste MF9 para exportar e invalidar memberships familiares na eliminacao de conta.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum nesta execucao. |
| Ficheiros editados nesta execucao | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/privacy/privacy.service.js`, `backend/src/modules/admin-metrics/admin-metrics.service.js`, `backend/tests/unit/mf9-subscriptions.test.js`; revisao de `subscriptions.service.js`, `privacy.routes.js`, `admin-metrics.routes.js` e `charities/pool-distribution.service.js`. |
| Exports produzidos/consumidos | `buildUserDataExport`, `deleteMyAccount`, `getAdminMetrics`; helper interno `exportFamilyMemberships`; helper interno `invalidateFamilyMembershipsForDeletedAccount`. |
| Endpoints envolvidos | `GET /api/privacy/export`, `DELETE /api/privacy/account`, `GET /api/admin/metrics`. |
| DTOs/validators | Reusa validacoes de privacidade e metricas ja existentes; o BK nao cria DTO novo. |
| Schemas/modelos | Reusa `subscription_family_memberships` criado por `BK-MF9-03`. |
| Services | Privacidade, metricas admin, subscricoes e pool solidaria. |
| Componentes frontend | Nao aplicavel neste BK; consome o resultado da UI de `BK-MF9-04` apenas como origem operacional das memberships. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao autenticada para privacidade; role `admin` para metricas; metricas agregadas sem dados pessoais; pool baseada em subscricoes pagas do owner. |
| Testes | Suite MF9 backend com exportacao/invalidation; build frontend usado como prova de regressao geral da implementacao de referencia. |
| BKs seguintes dependentes | `BK-MF9-06` depende da evidence RGPD/admin/pool deste BK para fechar o gate S13. |

### Decisoes confirmadas

- `CANONICO`: `BK-MF9-05` deve fechar o impacto de memberships familiares em exportacao RGPD, eliminacao de conta e metricas admin.
- `CANONICO`: metricas admin devem ser agregadas e nao expor emails, nomes ou IDs pessoais de membros familiares.
- `CANONICO`: membros familiares nao devem ser tratados como novas subscricoes pagas para efeitos da pool solidaria.
- `CANONICO`: `BK-MF9-06` depende desta prova operacional antes do gate final.
- `DERIVADO`: invalidar memberships `pending`/`active` com `status: "removed"` e `removedReason: "account_deleted"` e uma decisao tecnica minima coerente para remover acesso sem apagar trilho operacional.

### Drift documental encontrado

- Drift de classificacao: o estado historico marcava `BK-MF9-05` como `OK`, mas a auditoria atual encontra problemas de publicacao/executabilidade suficientes para `CRITICO`.
- Sem drift canonico nos requisitos: RF/RNF, backlog, matriz, contrato, views e sprint plan continuam coerentes com o objetivo do BK.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados nos BKs MF9.
- A pesquisa de drift de dominio devolve apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Pesquisa focada de texto sem acentuacao no BK alvo | FINDING: varias ocorrencias em texto pedagogico, JSDoc, comentarios e mensagens. |
| Estrutura obrigatoria do BK alvo | PASS estrutural: 16 secoes obrigatorias e 7 passos encontrados. |
| Contagem de blocos de codigo | RISCO: blocos longos existem; JSDoc e comentario de caminho nao substituem comentarios didaticos suficientes junto das decisoes. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: BK alinhado com `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30`, owner `Davi`, apoio `Kaue`, dependencia `BK-MF9-03,BK-MF9-04` e sprint `S13`. |
| Implementacao de referencia em `real_dev` | PASS funcional: services, rotas e testes MF9 existem; o problema e o transporte incompleto para o guia. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco pedagogico alto: o aluno pode copiar o fragmento de metricas e apagar campos administrativos ja existentes.
- Risco tecnico alto: os blocos parciais em servicos RGPD/admin podem quebrar contratos de MF5/MF4 se forem aplicados literalmente.
- Risco de qualidade textual medio: o guia nao cumpre a regra de portugues de Portugal com acentuacao em texto de aluno e mensagens.
- Risco de evidence medio: validacao final ainda nao fixa endpoints, status HTTP e payloads esperados.
- Risco operacional baixo na app de referencia: backend MF9 e build frontend passaram nesta reauditoria.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` por falta de contrato canonico.
- Correcao bloqueada por modo: `auditar_apenas` nao permite editar o BK alvo nesta execucao.
- Proxima acao recomendada: executar `corrigir_apenas` para `BK-MF9-05`, substituindo fragmentos por blocos completos e preservando a resposta completa de `getAdminMetrics`.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-04 - confirmacao pos-correcao

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-04`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-01`, `BK-MF4-01`, `BK-MF4-02`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-04` re-auditado como `OK`; nenhum guia BK nem codigo real foi editado nesta reauditoria. Apenas este relatorio foi atualizado.

### Resultado executivo da reauditoria observada

A reauditoria fresca confirma que a correcao imediatamente abaixo fechou os findings anteriores de `BK-MF9-04`. O guia atual esta autocontido para aluno: apresenta o cliente `frontend/src/services/api/subscriptionsApi.js` completo, substitui `frontend/src/pages/SubscriptionPage.jsx` com um ficheiro completo, declara `familyUserLabel(user)` antes do componente, usa mensagens visiveis em portugues de Portugal e inclui expected results para fluxos positivos e negativos.

A coerencia canonica da MF9 tambem se mantem: `BK-MF9-04` consome a API familiar criada em `BK-MF9-03`, nao inventa regras de ownership no browser, mantem a gestao familiar dentro da pagina de subscricao e prepara `BK-MF9-05` para privacidade, operacao e metricas familiares. Nao foi encontrado leakage de caminhos privados `real_dev` nos guias dos alunos.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a correcao atual imediatamente abaixo, que ja tinha promovido `BK-MF9-04` de `CRITICO` para `OK`. Esta reauditoria confirma esse estado.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria pos-correcao. |

### Findings revalidados

| ID | Severidade original | Estado atual | Evidencia fresca | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-04-AUD-001` | CRITICO | CORRIGIDO CONFIRMADO | A verificacao estrutural confirmou `functionFamilyUserLabelDeclared=true` e 8 ocorrencias coerentes de `familyUserLabel`; o Passo 2 mostra a pagina completa `SubscriptionPage.jsx`. | O aluno ja nao precisa de adivinhar helper, imports ou posicao de codigo. |
| `MF9-04-AUD-002` | CRITICO | CORRIGIDO CONFIRMADO | A pesquisa focada de termos sem acento no BK alvo devolveu apenas `guia_path` e o titulo estrutural `Pre-requisitos`; as mensagens visiveis usam `Família`, `Subscrição`, `Operação concluída` e variantes PT-PT. | O guia volta a cumprir `RNF05` e `RNF38` no texto destinado aos alunos e utilizadores. |
| `MF9-04-AUD-003` | CRITICO | CORRIGIDO CONFIRMADO | Bloco JS: 67 linhas nao vazias e 37 comentarios. Bloco JSX: 364 linhas nao vazias e 69 comentarios. | O BK cumpre a regra formal de comentarios didaticos em blocos longos. |
| `MF9-04-AUD-004` | PARCIAL | CORRIGIDO CONFIRMADO | O guia inclui expected results para owner com plano Familia, convidado pendente, remocao, saida, owner sem Familia, email invalido/conta inexistente, convite duplicado e sessao expirada. | A evidence de PR/defesa fica objetiva e executavel. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF62`: partilha familiar deve usar contas reais existentes, exigir owner com plano Familia ativo e impedir multiplas familias ativas por membro.
- `docs/RNF.md` confirma `RNF01`, `RNF05`, `RNF38` e `RNF40`: a UI deve ter navegacao clara, mensagens claras em portugues de Portugal e formatos europeus quando aplicavel.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-04` com owner `Mateus`, apoio `Davi`, prioridade `P0`, dependencia `BK-MF9-03`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- A implementacao de referencia confirma os endpoints e metodos familiares em `subscriptionsApi.js`, `SubscriptionPage.jsx`, `subscriptions.routes.js`, `subscriptions.controller.js` e testes unitarios MF9.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum. |
| Ficheiros editados nesta execucao | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `frontend/src/services/api/subscriptionsApi.js`, `frontend/src/pages/SubscriptionPage.jsx`; revisao de `apiClient.js`, `apiErrors.js` e `subscriptions.routes.js`. |
| Exports produzidos | `subscriptionsApi.getFamily`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember`, `leaveFamily`; pagina `SubscriptionPage`. |
| Imports consumidos de BKs anteriores | `apiClient` de MF1, `paymentsApi` de MF4/MF9, `EmptyState`, `toUserMessage`, API familiar de `BK-MF9-03` e planos/subscricao de `BK-MF9-01`. |
| Endpoints consumidos | `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId`, `POST /api/subscriptions/family/leave`. |
| Regras de seguranca/autorizacao | Sessao por cookie via `apiClient`; frontend nao envia `ownerUserId`; backend decide plano Familia, lugares livres, ownership e membership ativa. |
| BKs seguintes dependentes | `BK-MF9-05` usa memberships criadas/alteradas pela UI; `BK-MF9-06` valida regressao/gate final da MF9. |

### Decisoes confirmadas

- `CANONICO`: `BK-MF9-04` e um BK frontend que consome a API familiar de `BK-MF9-03`, sem criar regras de autorizacao no browser.
- `CANONICO`: mensagens visiveis e texto pedagogico devem estar em portugues de Portugal.
- `CANONICO`: `BK-MF9-05` depende de memberships familiares reais criadas/alteradas pela UI.
- `DERIVADO`: manter a gestao familiar na pagina de subscricao e a solucao minima coerente, porque Familia e uma capacidade do plano.
- `DERIVADO`: `runOperation` devolver boolean permite limpar o email apenas quando o convite foi criado, sem alterar o contrato da API.

### Drift documental encontrado

- Sem drift ativo no BK alvo apos a correcao.
- Sem leakage de `real_dev`, variaveis internas ou caminhos privados nos guias MF9.
- A pesquisa de drift de dominio devolve apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`; nao ha evidencia de OPSA/Orelle/StudyFlow ou dominio externo nos BKs MF9.
- As secoes historicas abaixo permanecem preservadas para rastreabilidade; o estado valido mais recente e esta reauditoria.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Pesquisa focada de termos sem acento no BK alvo | PASS: zero ocorrencias relevantes; apenas `guia_path` e o titulo estrutural `Pre-requisitos`. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Contagem de blocos/comentarios do BK alvo | PASS: `familyUserLabel` definido; blocos JS/JSX longos com comentarios didaticos suficientes. |
| Coerencia canonica RF/RNF/backlog/matriz/contrato/views/sprints | PASS: `BK-MF9-04` alinhado com `RF62`, `RNF01`, `RNF05`, `RNF38`, `RNF40`, owner `Mateus`, apoio `Davi`, dependencia `BK-MF9-03` e sprint `S13`. |
| Implementacao de referencia em `real_dev` | PASS: metodos familiares, rotas, controllers e testes MF9 existem e alinham com o guia. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a reauditoria foi documental e nao alterou o BK alvo nem codigo real.
- Risco operacional baixo: a evidence final continua a depender da execucao manual/visual dos alunos no ambiente deles.
- Risco historico baixo: o relatorio preserva secoes antigas com estados anteriores; para leitura operacional, esta secao de topo e a fonte de verdade mais recente.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` para `BK-MF9-04`.
- Sem blocker de implementacao real encontrado para `RF62`.
- Sem pendentes conhecidos apos esta reauditoria.

---

## Correcao observada - 2026-07-01 - BK-MF9-04 - UI de gestao familiar e convites

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-04`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-01`, `BK-MF4-01`, `BK-MF4-02`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-04` corrigido de `CRITICO` para `OK`; a correcao ficou limitada ao guia alvo e a este relatorio.

### Resultado executivo da correcao observada

`BK-MF9-04` fica agora autocontido e publicavel para aluno: o guia define `familyUserLabel`, mostra `subscriptionsApi.js` completo, substitui a pagina `SubscriptionPage.jsx` por um ficheiro completo e integrado, corrige mensagens pedagogicas/visiveis para portugues de Portugal com acentuacao e acrescenta validacoes negativas com expected results.

A correcao nao alterou codigo real da app. A implementacao de referencia continua a validar o contrato MF9; o trabalho desta execucao foi transportar esse contrato para o guia do aluno, usando apenas caminhos publicos `frontend/` e preservando a sequencia `BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05`.

### Contagem antes e depois da correcao observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 1 | 0 |

Nota: o "Antes" reflete a reauditoria imediatamente abaixo, que tinha rebaixado `BK-MF9-04` para `CRITICO`.

### BK corrigido nesta execucao

| BK | Estado antes | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF9-04` | CRITICO | OK | Guia reescrito com cliente API familiar completo, pagina React completa, `familyUserLabel`, mensagens PT-PT, comentarios didaticos e negativos objetivos. |

### Findings atuais

| ID | Severidade original | Estado atual | Evidencia pos-correcao | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-04-AUD-001` | CRITICO | CORRIGIDO | O Passo 2 mostra o ficheiro completo `frontend/src/pages/SubscriptionPage.jsx` e define `familyUserLabel(user)` antes do componente; a verificacao estrutural confirmou `functionFamilyUserLabelDeclared=true`. | O aluno ja nao precisa de adivinhar helper, imports ou posicao de codigo. |
| `MF9-04-AUD-002` | CRITICO | CORRIGIDO | O guia foi normalizado para PT-PT com acentuacao em texto pedagogico e mensagens visiveis, incluindo `Família`, `Subscrição`, `Não foi possível atualizar a subscrição`, `Operação concluída` e `Saíste da partilha familiar.` | O guia volta a cumprir `RNF05` e `RNF38` no texto destinado aos alunos e utilizadores. |
| `MF9-04-AUD-003` | CRITICO | CORRIGIDO | Contagem atual dos blocos do BK alvo: bloco JS com 67 linhas nao vazias e 37 comentarios; bloco JSX com 364 linhas nao vazias e 69 comentarios. | O BK cumpre a regra formal de comentarios didaticos em blocos longos. |
| `MF9-04-AUD-004` | PARCIAL | CORRIGIDO | `Validação final` inclui expected results para owner sem Familia, email invalido/conta inexistente, convite duplicado e sessao expirada; os passos 3 a 7 tambem descrevem resultados esperados. | A evidence de PR/defesa fica objetiva e deixa de depender de interpretacao livre. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF62`: partilha familiar deve usar contas reais existentes, exigir owner com plano Familia ativo e impedir multiplas familias ativas por membro.
- `docs/RNF.md` confirma `RNF01`, `RNF05`, `RNF38` e `RNF40`: a UI deve ter navegacao clara, mensagens claras em portugues de Portugal e formatos europeus quando aplicavel.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-04` com owner `Mateus`, apoio `Davi`, prioridade `P0`, dependencia `BK-MF9-03`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `BK-MF9-03` entrega a API `/api/subscriptions/family/*`; `BK-MF9-05` depende dos fluxos visiveis deste BK para exportacao RGPD, eliminacao de conta e metricas agregadas.
- O mockup foi usado apenas como referencia visual/fluxo de planos e pagina de conta, sem criar contratos tecnicos novos.

### Mapa de integracao da MF

| Categoria | Resultado pos-correcao |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo fora dos artefactos permitidos. |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `frontend/src/services/api/subscriptionsApi.js`, `frontend/src/pages/SubscriptionPage.jsx`; revisao de `apiClient.js`, `apiErrors.js` e `subscriptions.routes.js`. |
| Exports produzidos | `subscriptionsApi.getFamily`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember`, `leaveFamily`; pagina `SubscriptionPage`. |
| Imports consumidos de BKs anteriores | `apiClient` de MF1, `paymentsApi` de MF4/MF9, `EmptyState` e `toUserMessage`; API familiar criada em `BK-MF9-03`; planos/subscricao de `BK-MF9-01`. |
| Endpoints consumidos | `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId`, `POST /api/subscriptions/family/leave`. |
| DTOs/validators criados | Nenhum DTO novo no frontend; payload `{ email }` no convite; validacao forte permanece no backend. |
| Schemas/modelos criados | Nenhum modelo novo; consome `subscription_family_memberships` de `BK-MF9-03`. |
| Services/componentes frontend | Cliente API familiar e pagina de subscricao com estados `loading`, `submitting`, `error`, `status`, `ownedFamily`, `pendingInvitations` e `activeMembership`. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao por cookie via `apiClient`; frontend nao envia `ownerUserId`; backend decide plano Familia, lugares livres e ownership. |
| Testes/evidence previstos | Build frontend; fluxo positivo owner convida/membro aceita/owner remove; negativos de owner sem Familia, email invalido, convite duplicado e sessao expirada. |
| BKs seguintes dependentes | `BK-MF9-05` usa memberships criadas pela UI; `BK-MF9-06` valida regressao/gate final da MF9. |

### Decisoes confirmadas nesta correcao

- `CANONICO`: `BK-MF9-04` e um BK frontend que consome a API familiar de `BK-MF9-03`, sem criar regras de ownership no browser.
- `CANONICO`: mensagens visiveis e texto pedagogico devem estar em portugues de Portugal, com acentuacao correta.
- `CANONICO`: `BK-MF9-05` depende de memberships familiares reais criadas/alteradas pela UI.
- `DERIVADO`: manter a gestao familiar na pagina de subscricao e aceitavel como solucao minima, porque Familia e uma capacidade do plano.
- `DERIVADO`: `runOperation` devolver boolean permite limpar o email apenas quando o convite foi criado, sem alterar o contrato da API.

### Drift documental encontrado

- Drift de classificacao fechado: a reauditoria anterior rebaixou `BK-MF9-04` para `CRITICO`; esta correcao fecha os findings e devolve o BK a `OK`.
- Nao foi encontrado drift canonico entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint e a sequencia funcional da MF9.
- A pesquisa de drift de dominio continua a devolver falsos positivos de `IVA` dentro da palavra `DERIVADO`; sem evidencia de OPSA/Orelle/StudyFlow ou dominio externo nos BKs MF9.

### Validacoes executadas nesta correcao

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Pesquisa focada de termos sem acento no BK alvo | PASS: zero ocorrencias relevantes; apenas `guia_path` e o titulo estrutural `Pre-requisitos`. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Contagem de blocos/comentarios do BK alvo | PASS: `familyUserLabel` definido; blocos longos com comentarios didaticos suficientes. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a correcao foi documental/pedagogica; a implementacao de referencia continua coberta por testes MF9 e build frontend.
- Risco operacional baixo: a evidence final de PR/defesa depende da execucao real dos alunos no ambiente deles.
- Risco de leitura baixo: o relatorio preserva secoes historicas abaixo; o estado valido mais recente e o desta secao.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional para `BK-MF9-04`.
- Sem blocker de implementacao real encontrado para `RF62`.
- Sem pendentes conhecidos apos esta correcao.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-04 - UI de gestao familiar e convites

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-04`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-01`, `BK-MF4-01`, `BK-MF4-02`, `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-05`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-04` re-auditado como `CRITICO`; nenhum guia BK nem codigo real foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-04` esta corretamente posicionado na sequencia canonica da MF9: consome a API familiar de `BK-MF9-03`, expoe a gestao de convites na pagina de subscricao e prepara `BK-MF9-05` para privacidade, operacao e metricas familiares. A implementacao de referencia em `real_dev/frontend` confirma que o fluxo existe: `subscriptionsApi.js` tem metodos para overview, convite, aceite, recusa, remocao e saida; `SubscriptionPage.jsx` integra `familyUserLabel`, estados React, loading/error/success e UI familiar; o build Vite passa.

Mesmo assim, o guia atual nao pode ficar `OK` para alunos. O BK apresenta `SubscriptionPage.jsx` em blocos parciais, usa `familyUserLabel(...)` sem ensinar a funcao, deixa texto pedagogico e mensagens visiveis sem acentuacao PT-PT, e o bloco JSX principal de Familia nao cumpre a regra de comentarios didaticos para blocos longos. Seguindo apenas o guia, o aluno ainda teria de adivinhar pecas de integracao da pagina React e publicaria mensagens desalinhadas com `RNF05`/`RNF38`.

Como `MODO=auditar_apenas`, estes problemas ficam registados como findings abertos. A correcao recomendada deve ser feita numa execucao posterior com permissao para editar o BK alvo.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 0 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 1 |

Nota: o "Antes" reflete a classificacao historica mais recente neste relatorio, que marcou `BK-MF9-04` como `OK` apos a correcao global da MF9. Esta reauditoria fresca rebaixa apenas o BK alvo para `CRITICO`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade | Estado | Evidencia atual | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-04-AUD-001` | CRITICO | ABERTO | O guia usa `familyUserLabel(...)` nas linhas 400, 424 e 437, mas nao define a funcao nem mostra o ficheiro completo `SubscriptionPage.jsx`; a implementacao de referencia tem essa funcao antes do componente. | O aluno nao consegue copiar a pagina de forma autocontida sem adivinhar helpers, imports e posicao do codigo. |
| `MF9-04-AUD-002` | CRITICO | ABERTO | O guia contem dezenas de ocorrencias sem acentuacao em texto pedagogico e UI visivel, incluindo linhas 24, 26, 73, 391, 418, 438, 439, 480, 489 e 490. | Viola a regra de lingua da prompt e enfraquece `RNF05`/`RNF38`; a UI ensinada ficaria abaixo do contrato PT-PT. |
| `MF9-04-AUD-003` | CRITICO | ABERTO | O bloco JSX do Passo 5 tem 56 linhas nao vazias e apenas o comentario de caminho; nao tem os 2 comentarios didaticos exigidos para bloco longo com estado React, eventos e regras de dominio. | O BK falha o gate formal de comentarios didaticos e fica menos pedagogico para alunos do 12.o ano. |
| `MF9-04-AUD-004` | PARCIAL | ABERTO | A validacao final lista build, fluxo manual/automatizado e negativos, mas nao apresenta roteiro objetivo com expected results para owner sem Familia, email invalido, convite duplicado e sessao expirada. | A evidence de PR/defesa fica dependente de interpretacao do aluno, apesar de a implementacao de referencia estar funcional. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF62`: partilha familiar deve usar contas reais existentes, exigir owner com plano Familia ativo e impedir multiplas familias ativas por membro.
- `docs/RNF.md` confirma `RNF01`, `RNF05`, `RNF38` e `RNF40`: a UI deve ter navegacao clara, mensagens claras em portugues de Portugal e formatos europeus quando aplicavel.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-04` com owner `Mateus`, apoio `Davi`, prioridade `P0`, dependencia `BK-MF9-03`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `BK-MF9-03` entrega a API `/api/subscriptions/family/*`; `BK-MF9-05` depende dos fluxos visiveis deste BK para exportacao RGPD, eliminacao de conta e metricas agregadas.
- O mockup foi consultado apenas como referencia visual/fluxo de planos e pagina de conta; nao foi usado para inventar endpoints, campos ou regras de negocio.

### Evidencia da implementacao de referencia

- `real_dev/frontend/src/services/api/subscriptionsApi.js` inclui `getFamily`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily`.
- `real_dev/frontend/src/pages/SubscriptionPage.jsx` inclui `familyUserLabel`, estados React de familia, `runOperation`, `handleInvite`, loading/error/success, owner, membros, convites pendentes e membership ativa.
- `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js` preserva `/plans`, `/me`, `/me/cancel-renewal` e expõe `/family/*` com `requireAuth`.
- `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js` usa `req.user.id` nas operacoes familiares, mantendo ownership no backend.
- `real_dev/backend/tests/unit/mf9-subscriptions.test.js` cobre planos Pro/Familia, convite, aceite, remocao, bloqueios, qualidade e privacidade familiar.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo no guia alvo nesta reauditoria. |
| Ficheiros editados nesta reauditoria | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `frontend/src/services/api/subscriptionsApi.js`, `frontend/src/pages/SubscriptionPage.jsx`; revisao de `apiClient.js`, `apiErrors.js` e `subscriptions.routes.js`. |
| Exports produzidos esperados | `subscriptionsApi.getFamily`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember`, `leaveFamily`; pagina `SubscriptionPage` com UI familiar. |
| Imports consumidos de BKs anteriores | `apiClient` de MF1, `EmptyState` e `toUserMessage`; API familiar criada em `BK-MF9-03`; planos/subscricao de `BK-MF9-01`. |
| Endpoints consumidos | `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId`, `POST /api/subscriptions/family/leave`. |
| DTOs/validators previstos | Payload `{ email }` no convite; validacao forte continua no backend, com `type="email"` apenas como apoio de UI. |
| Schemas/modelos previstos | Nao cria modelo novo; consome `subscription_family_memberships` de `BK-MF9-03`. |
| Services/componentes frontend | Cliente API familiar e pagina de subscricao com estados `loading`, `submitting`, `error`, `status`, `ownedFamily`, `pendingInvitations` e `activeMembership`. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Sessao por cookie via `apiClient`; frontend nao envia `ownerUserId`; backend decide plano Familia, lugares livres e ownership. |
| Testes previstos | Guia exige build e fluxo manual/automatizado, mas precisa de expected results mais objetivos para negativos. |
| BKs seguintes dependentes | `BK-MF9-05` usa memberships criadas pela UI; `BK-MF9-06` valida regressao/gate final da MF9. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: `BK-MF9-04` e um BK frontend que consome a API familiar de `BK-MF9-03`, sem criar regras de ownership no browser.
- `CANONICO`: mensagens visiveis e texto pedagogico devem estar em portugues de Portugal, com acentuacao correta.
- `CANONICO`: `BK-MF9-05` depende de memberships familiares reais criadas/alteradas pela UI.
- `DERIVADO`: manter a gestao familiar na pagina de subscricao e aceitavel como solucao minima, porque Familia e capacidade do plano.
- `DERIVADO`: usar `EmptyState` para erro/sucesso preserva padrao visual ja existente na app.

### Drift documental encontrado

- Drift de classificacao: a secao historica global da MF9 classificava `BK-MF9-04` como `OK`; a reauditoria atual encontrou falhas de autocontencao, lingua e comentarios didaticos que rebaixam o BK alvo para `CRITICO`.
- Nao foi encontrado drift canonico entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint e a sequencia funcional da MF9.
- A pesquisa de drift de dominio devolveu apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`; sem evidencia de OPSA/Orelle/StudyFlow ou dominio externo nos BKs MF9.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados nos BKs dos alunos. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| Pesquisa focada de termos sem acento no BK alvo | FAIL: ocorrencias em titulo, narrativa, instrucoes, mensagens UI e criterios/evidence. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias e 7 passos. |
| Contagem de blocos/comentarios do BK alvo | FAIL: `familyUserLabel` usado 3 vezes sem definicao; bloco JSX principal com 56 linhas e comentarios didaticos insuficientes. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco pedagogico alto: o aluno ainda tem de inferir helper, imports e posicao de blocos dentro de `SubscriptionPage.jsx`.
- Risco de publicacao medio/alto: mensagens visiveis como "Nao foi possivel atualizar a subscricao", "Operacao concluida", "Familia" e "Sair da Familia" nao cumprem PT-PT com acentos.
- Risco de evidence medio: a implementacao de referencia passa, mas o BK nao orienta suficientemente a recolha objetiva dos negativos e estados UI.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` canonico: o contrato funcional existe e a implementacao de referencia valida.
- Pendente de correcao documental do guia alvo em execucao posterior com `MODO=hidratar_corrigir` ou `MODO=corrigir_apenas`.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-03 - confirmacao pos-correcao

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-03`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-01`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-03` re-auditado como `OK`; nenhum guia BK nem codigo real foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-03` mantem estado `OK` apos reauditoria fresca. O guia atual ja inclui as pecas que estavam abertas na reauditoria historica: `subscriptions.routes.js` preserva `/plans`, `/me` e `/me/cancel-renewal`, o controller apresenta todos os handlers familiares, o service entrega `getFamilyOverview`, `getEffectiveSubscriptionAccess`, `hasActiveSubscriptionAccess`, convite, aceite, recusa, remocao e saida, e a suite MF9 inclui fluxo positivo e negativos principais.

O contrato funcional continua coerente com `RF62`, `RNF13`, `RNF15`, `RNF16`, `RNF19`, `BK-MF9-01`, `BK-MF2-01`, `BK-MF9-02`, `BK-MF9-04`, `BK-MF9-05` e `BK-MF9-06`. A implementacao de referencia continua a passar nos testes MF9, por isso nao ha finding ativo nem blocker funcional para este BK.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a secao de correcao imediatamente abaixo, que ja tinha fechado `BK-MF9-03` como `OK`. Esta execucao confirmou esse estado sem editar o BK.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade original | Estado atual | Evidencia atual | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-03-AUD-001` | CRITICO | CORRIGIDO CONFIRMADO | O Passo 2 inclui `subscriptions.routes.js` com `/plans`, `/me`, `/me/cancel-renewal` e `/family/*`, e inclui controllers completos para overview, convite, aceite, recusa, remocao e saida. | Sem impacto aberto. |
| `MF9-03-AUD-002` | CRITICO | CORRIGIDO CONFIRMADO | O Passo 3 inclui `getFamilyOverview`, `getEffectiveSubscriptionAccess` e `hasActiveSubscriptionAccess`, com `ownedFamily`, `pendingInvitations` e `activeMembership`. | Sem impacto aberto. |
| `MF9-03-AUD-003` | CRITICO | CORRIGIDO CONFIRMADO | O Passo 5 inclui `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily`. | Sem impacto aberto. |
| `MF9-03-AUD-004` | CRITICO | CORRIGIDO CONFIRMADO | Contagem atual dos blocos do BK alvo: blocos JS com 31, 33, 110, 115, 59, 117 e 148 linhas nao vazias; todos cumprem os comentarios didaticos exigidos. | Sem impacto aberto. |
| `MF9-03-AUD-005` | PARCIAL | CORRIGIDO CONFIRMADO | Pesquisa focada por termos ASCII recorrentes (`Nao`, `Familia`, `subscricao`, `sessao`, etc.) devolveu zero ocorrencias no BK alvo. | Sem impacto aberto. |
| `MF9-03-AUD-006` | PARCIAL | CORRIGIDO CONFIRMADO | O Passo 6 inclui testes para fluxo positivo, owner sem Familia, membro pago, membership duplicada e aceite por outro utilizador. | Sem impacto aberto. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF62`: partilha familiar real usa contas existentes, exige owner com plano Familia ativo, impede multiplas familias ativas por membro e mantem acesso premium apenas enquanto o owner mantiver o plano Familia ativo.
- `docs/RNF.md` confirma `RNF13`, `RNF15`, `RNF16` e `RNF19` para HTTPS, sessoes autenticadas, protecao contra ataques comuns e auditoria de operacoes criticas.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-03` com owner `Matheus`, prioridade `P0`, dependencias `BK-MF9-01,BK-MF2-01`, sprint `S13` e sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `BK-MF9-01` entrega `familySharing` e `maxFamilyMembers`; `BK-MF9-02` consome acesso efetivo no playback; `BK-MF9-04` consome a API familiar; `BK-MF9-05` usa memberships em privacidade/metricas; `BK-MF9-06` valida o gate S13.
- `BK-MF8-10` mantem handoff para `BK-MF9-01`, preservando a transicao MF8 -> MF9.

### Evidencia da implementacao de referencia

- `subscriptions.routes.js` real preserva `/plans`, `/me`, `/me/cancel-renewal` e acrescenta `/family/*` com `requireAuth`.
- `subscriptions.controller.js` real inclui controllers para overview, convite, aceitar, recusar, remover e sair.
- `subscriptions.service.js` real inclui `getFamilyOverview`, `getEffectiveSubscriptionAccess`, `hasActiveSubscriptionAccess`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily`.
- `real_dev/backend/tests/unit/mf9-subscriptions.test.js` confirma fluxo familiar, bloqueios de convites, qualidade por plano e privacidade/invalidacao de memberships.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo no guia alvo nesta reauditoria. |
| Ficheiros editados nesta reauditoria | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/subscriptions/subscriptions.controller.js`, `backend/src/modules/subscriptions/subscriptions.routes.js`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos esperados | `getFamilyOverview`, `getEffectiveSubscriptionAccess`, `hasActiveSubscriptionAccess`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember`, `leaveFamily`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece planos Familia, `familySharing` e `maxFamilyMembers`; `BK-MF2-01` fornece utilizadores, sessao segura e `requireAuth`; `BK-MF9-02` consome `getEffectiveSubscriptionAccess` no playback. |
| Endpoints previstos | `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId`, `POST /api/subscriptions/family/leave`. |
| DTOs/validators previstos | Reutiliza validacao de email e ids; o owner e o membro vêm sempre da sessao ou de params autorizados. |
| Schemas/modelos previstos | `subscription_family_memberships` com owner, membro, subscricao, estado e datas. |
| Services previstos | Overview familiar, convite, aceite, recusa, remocao, saida, acesso efetivo e ownership por sessao. |
| Componentes/paginas frontend | Nao aplicavel neste BK; `BK-MF9-04` consome a API. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Owner e membro vêm de `req.user.id`; `ownerUserId` nao e aceite do frontend; membros pagos, duplicados e convites alheios sao bloqueados. |
| Testes previstos | Fluxo positivo e negativos para owner sem Familia, membro pago, duplicado e convite de outro utilizador. |
| BKs seguintes dependentes | `BK-MF9-04` usa a API familiar; `BK-MF9-05` usa memberships em RGPD/metricas; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: partilha familiar real depende de contas existentes, owner com plano Familia ativo e bloqueio de multiplas familias abertas por membro.
- `CANONICO`: membro familiar so tem acesso premium enquanto o owner mantiver plano Familia ativo.
- `CANONICO`: ownership deve vir da sessao autenticada e nao de `ownerUserId` enviado pelo frontend.
- `CANONICO`: `BK-MF9-03` prepara diretamente `BK-MF9-04`, `BK-MF9-05` e `BK-MF9-06`.
- `DERIVADO`: usar os estados `pending`, `active`, `declined`, `removed` e `left` preserva historico sem apagar memberships.
- `DERIVADO`: notificacoes internas substituem envio externo de email dentro do escopo PAP.

### Drift documental encontrado

Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, handoff MF8->MF9, BK atual e implementacao de referencia para `BK-MF9-03`.

As secoes historicas abaixo preservam o ciclo anterior: uma reauditoria marcou `CRITICO`, a correcao fechou os findings, e esta nova reauditoria confirmou `OK`.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falsos positivos de `IVA` dentro de `DERIVADO`; sem drift ativo de OPSA/Orelle/StudyFlow ou dominios externos. |
| Pesquisa focada de termos ASCII no BK alvo | PASS: zero ocorrencias para os termos recorrentes da reauditoria. |
| Estrutura obrigatoria do BK alvo | PASS: 16 secoes obrigatorias, 7 passos e pontos 1 a 7 em todos os passos. |
| Contagem de comentarios didaticos por bloco no BK alvo | PASS: todos os blocos JS longos cumprem a regra de comentarios didaticos. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual tecnico baixo: a reauditoria foi documental e a implementacao de referencia continua coberta por testes MF9.
- Risco residual operacional baixo: a evidence final de PR/defesa depende da execucao real dos alunos no ambiente deles.
- Risco residual de leitura baixo: o relatorio preserva secoes historicas com estados anteriores; o estado valido mais recente e o desta secao.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional encontrado para `BK-MF9-03`.
- Sem blocker de implementacao real encontrado para `RF62`.
- Sem pendentes conhecidos apos esta reauditoria.

---

## Correcao observada - 2026-07-01 - BK-MF9-03 - modelo/API de partilha familiar

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-03`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-01`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-03` corrigido de `CRITICO` para `OK`; a correcao ficou limitada ao guia alvo e a este relatorio.

### Resultado executivo da correcao observada

`BK-MF9-03` fica agora autocontido e executavel para alunos: o guia preserva as rotas publicas/privadas ja criadas por `BK-MF9-01`, apresenta controllers completos, entrega `getFamilyOverview`, fecha o ciclo aceitar/recusar/remover/sair, inclui testes negativos concretos e cumpre a regra de comentarios didaticos nos blocos longos.

A correcao nao alterou codigo real da app. A implementacao de referencia ja validava o contrato MF9; o trabalho desta execucao foi transportar esse contrato para o guia do aluno, usando apenas caminhos publicos `backend/` e mantendo a sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.

### Contagem antes e depois da correcao observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 1 | 0 |

Nota: o "Antes" reflete a reauditoria imediatamente abaixo, que tinha rebaixado `BK-MF9-03` para `CRITICO`.

### BK corrigido nesta execucao

| BK | Estado antes | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF9-03` | CRITICO | OK | Reescrito como guia autocontido com rotas/controllers completos, overview familiar, ciclo de vida completo, testes negativos e comentarios didaticos suficientes. |

### Findings atuais

| ID | Severidade original | Estado atual | Evidencia pos-correcao | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-03-AUD-001` | CRITICO | CORRIGIDO | O Passo 2 mostra `subscriptions.routes.js` completo preservando `/plans`, `/me`, `/me/cancel-renewal` e acrescentando `/family/*`; o mesmo passo mostra todos os controllers importados. | O aluno ja nao remove endpoints anteriores nem fica com imports sem controller. |
| `MF9-03-AUD-002` | CRITICO | CORRIGIDO | O Passo 3 inclui `getFamilyOverview`, `getEffectiveSubscriptionAccess` e `hasActiveSubscriptionAccess`, com resposta `ownedFamily`, `pendingInvitations` e `activeMembership`. | `BK-MF9-04` passa a ter contrato de API familiar completo. |
| `MF9-03-AUD-003` | CRITICO | CORRIGIDO | O Passo 5 inclui `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily`. | Os endpoints de aceitar, recusar, remover e sair ficam todos ensinados no BK. |
| `MF9-03-AUD-004` | CRITICO | CORRIGIDO | Contagem atual dos blocos do BK alvo: blocos JS com 31/33/110/115/59/117/148 linhas nao vazias e pelo menos 2 comentarios didaticos de linha cada; blocos bash com 2 linhas. | A regra formal de comentarios didaticos fica cumprida. |
| `MF9-03-AUD-005` | PARCIAL | CORRIGIDO | Pesquisa focada por termos ASCII recorrentes (`Nao`, `Familia`, `subscricao`, `sessao`, `LOCALIZACAO`, etc.) devolveu zero ocorrencias no BK alvo. | Texto pedagogico e mensagens visiveis ficam em portugues de Portugal com acentuacao. |
| `MF9-03-AUD-006` | PARCIAL | CORRIGIDO | O Passo 6 inclui testes para fluxo positivo, owner sem Familia, membro pago, membership duplicada e aceite por outro utilizador. | Negativos principais deixam de ser apenas instrucao textual. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF62`: partilha familiar deve usar contas reais existentes, exigir owner com plano Familia ativo, impedir multiplas familias ativas por membro e manter acesso premium do membro apenas enquanto o owner mantiver plano Familia ativo.
- `docs/RNF.md` confirma os RNF associados: `RNF13` para HTTPS, `RNF15` para sessoes autenticadas com cookies HttpOnly, `RNF16` para protecao contra ataques comuns e `RNF19` para auditoria de operacoes criticas.
- `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF9-03` com `RF62, RNF13, RNF15, RNF16, RNF19`, owner `Matheus`, prioridade `P0`, dependencias `BK-MF9-01,BK-MF2-01` e sprint `S13`.
- `MF-VIEWS.md` e `PLANO-SPRINTS.md` confirmam a sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `BK-MF8-10` mantem handoff para `BK-MF9-01`; `BK-MF9-04`, `BK-MF9-05` e `BK-MF9-06` dependem do contrato familiar entregue neste BK.

### Mapa de integracao da MF

| Categoria | Resultado pos-correcao |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo fora dos artefactos permitidos. |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` |
| Ficheiros previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/subscriptions/subscriptions.controller.js`, `backend/src/modules/subscriptions/subscriptions.routes.js`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos | `getFamilyOverview`, `getEffectiveSubscriptionAccess`, `hasActiveSubscriptionAccess`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember`, `leaveFamily`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece planos Familia, `familySharing` e `maxFamilyMembers`; `BK-MF2-01` fornece utilizadores, sessao segura e `requireAuth`; `BK-MF9-02` consome `getEffectiveSubscriptionAccess` no playback. |
| Endpoints criados | `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId`, `POST /api/subscriptions/family/leave`. |
| DTOs/validators criados | Reutiliza `assertValidEmail`, `userObjectId` e `asObjectId`; o guia explica a origem dos ids na sessao e nos params. |
| Schemas/modelos criados | `subscription_family_memberships` com owner, membro, subscricao, estado e datas. |
| Services criados/usados | Overview familiar, convite, aceite, recusa, remocao, saida, acesso efetivo e ownership por sessao. |
| Componentes/paginas frontend | Nao aplicavel neste BK; `BK-MF9-04` consome a API. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Owner e membro vêm sempre de `req.user.id`; `ownerUserId` nao e aceite do frontend; membros pagos, duplicados e convites alheios sao bloqueados. |
| Testes criados | Fluxo positivo e negativos para owner sem Familia, membro pago, duplicado e convite de outro utilizador. |
| BKs seguintes dependentes | `BK-MF9-04` usa a API familiar; `BK-MF9-05` usa memberships em RGPD/metricas; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta correcao

- `CANONICO`: partilha familiar real depende de contas existentes, owner com plano Familia ativo e bloqueio de multiplas familias abertas por membro.
- `CANONICO`: membro familiar so tem acesso premium enquanto o owner mantiver plano Familia ativo.
- `CANONICO`: ownership deve vir da sessao autenticada e nao de `ownerUserId` enviado pelo frontend.
- `CANONICO`: `BK-MF9-03` prepara diretamente a UI de `BK-MF9-04`, a privacidade/metricas de `BK-MF9-05` e o gate `BK-MF9-06`.
- `DERIVADO`: usar os estados `pending`, `active`, `declined`, `removed` e `left` e aceitavel como ciclo minimo preservando historico.
- `DERIVADO`: notificacoes internas substituem envio externo de email dentro do escopo PAP.

### Drift documental encontrado

- Drift de classificacao fechado: a reauditoria anterior rebaixou `BK-MF9-03` para `CRITICO`; esta correcao fecha os findings e devolve o BK a `OK`.
- Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, MF8 handoff e o contrato corrigido do BK.

### Validacoes executadas nesta correcao

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`; sem drift ativo de OPSA/Orelle/StudyFlow ou dominios externos. |
| Pesquisa focada de termos ASCII no BK alvo | PASS: zero ocorrencias para os termos recorrentes da reauditoria. |
| Contagem de comentarios didaticos por bloco no BK alvo | PASS: todos os blocos cumprem a regra de comentarios didaticos. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |

### Riscos restantes

- Risco residual baixo: a correcao foi documental/pedagogica; a implementacao de referencia continua coberta por testes MF9 e build frontend.
- Risco residual operacional baixo: a evidence final de PR/defesa ainda depende de execucao real dos alunos no ambiente deles.
- Risco residual de leitura baixo: o relatorio preserva historico de reauditorias abaixo; o estado atual desta secao e o valido para `BK-MF9-03`.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional para `BK-MF9-03`.
- Sem blocker de implementacao real encontrado para `RF62`.
- Sem pendentes conhecidos apos esta correcao.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-03 - modelo/API de partilha familiar

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-03`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-01`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-03` re-auditado como `CRITICO`; nenhum guia BK nem codigo real foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-03` esta alinhado no dominio certo: `RF62` exige partilha familiar real entre contas existentes, owner com plano Familia ativo, bloqueio de multiplas familias ativas por membro e acesso premium apenas enquanto o owner mantiver o plano Familia. O guia tambem aponta corretamente para `BK-MF9-01` como fonte de `familySharing`/`maxFamilyMembers`, para `BK-MF2-01` como base de sessao autenticada, e para `BK-MF9-04` como consumidor da API familiar.

Mesmo assim, o guia nao pode ficar `OK` nesta reauditoria. Seguindo apenas o BK, o aluno nao consegue implementar a API completa sem adivinhar pecas centrais: o passo das rotas mostra um `subscriptions.routes.js` que omite rotas ja existentes de subscricoes, o controller apresentado so implementa `postFamilyInvitation` apesar de as rotas importarem outros controllers, o passo do overview promete `getFamilyOverview` mas nao inclui a funcao, e o passo de ciclo de vida promete `declineFamilyInvitation` e `leaveFamily` mas nao mostra o codigo dessas operacoes.

A implementacao de referencia confirma que estes contratos existem e passam nos testes MF9, por isso o problema atual e de guia/autocontencao pedagogica, nao de inexistencia funcional no `IMPLEMENTATION_ROOT`. Como `MODO=auditar_apenas`, a correcao fica registada como finding e nao foi aplicada ao BK.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 0 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 1 |

Nota: o "Antes" reflete a secao historica deste relatorio que marcava `BK-MF9-03` como `OK` apos correcao anterior. Esta execucao fez uma reauditoria fresca e rebaixou o BK para `CRITICO`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade | Estado | Evidencia objetiva | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-03-AUD-001` | CRITICO | ABERTO | O bloco de `subscriptions.routes.js` em `BK-MF9-03` mostra apenas `/family/*` e redefine `subscriptionsRouter`, mas a implementacao real preserva tambem `/plans`, `/me` e `/me/cancel-renewal`. O mesmo passo importa `getMyFamilyController`, `postAcceptFamilyInvitation`, `postDeclineFamilyInvitation`, `deleteFamilyMember` e `postLeaveFamily`, mas o bloco de controller apresentado so implementa `postFamilyInvitation`. | Se o aluno copiar o guia como ficheiro completo, pode remover endpoints de `BK-MF9-01` e ficar com imports/controllers em falta. Quebra executabilidade e handoff para `BK-MF9-04`. |
| `MF9-03-AUD-002` | CRITICO | ABERTO | O Passo 3 declara `getFamilyOverview`, `getEffectiveSubscriptionAccess` e `hasActiveSubscriptionAccess`, mas o codigo so inclui `getEffectiveSubscriptionAccess` e `hasActiveSubscriptionAccess`. Mais abaixo, `inviteFamilyMember`, `acceptFamilyInvitation` e `removeFamilyMember` chamam `getFamilyOverview`, que nao e entregue no guia. | A API familiar nao consegue devolver `ownedFamily`, `pendingInvitations` e `activeMembership` sem a funcao omitida. O proximo BK fica bloqueado ou obriga o aluno a inventar contrato de resposta. |
| `MF9-03-AUD-003` | CRITICO | ABERTO | O Passo 5 chama-se "Aceitar, recusar, remover e sair" e lista `declineFamilyInvitation` e `leaveFamily`, mas o codigo inclui apenas `acceptFamilyInvitation` e `removeFamilyMember`. | Os endpoints `/family/invitations/:id/decline` e `/family/leave` ficam sem service ensinavel, apesar de serem prometidos nos criterios, validacao final e handoff. |
| `MF9-03-AUD-004` | CRITICO | ABERTO | A contagem dos blocos mostra blocos JS longos com comentarios didaticos insuficientes: bloco do Passo 3 com 46 linhas e 0 comentarios de linha didaticos, Passo 4 com 58 linhas e 1, Passo 5 com 54 linhas e 1, Passo 6 com 27 linhas e 1. | Viola a regra da prompt para blocos com 20+ linhas e afeta codigo de autenticacao, ownership, validacao, persistencia e testes, areas onde explicacao vaga e critica. |
| `MF9-03-AUD-005` | PARCIAL | ABERTO | O texto pedagogico e varias mensagens visiveis usam ASCII sem acentuacao: `Familia`, `Nao`, `propria`, `subscricao`, `notificacao`, `validacao`, `sessao`, `codigo`, entre muitos exemplos. A implementacao real ja usa mensagens acentuadas como `Não podes convidar a tua própria conta.` e `Plano Família ativo obrigatório...`. | Risco pedagogico e de qualidade linguistica para guia de aluno; nao bloqueia sozinho a arquitetura, mas viola regra explicita de PT-PT com acentuacao. |
| `MF9-03-AUD-006` | PARCIAL | ABERTO | O Passo 6 apresenta apenas o teste positivo convite -> aceitar -> acesso -> remocao. Os negativos principais ficam como instrucao textual ("Cria um segundo teste...") e nao como codigo completo, apesar de o Scope-in pedir negativos principais e a validacao final listar sem sessao, owner sem Familia, auto-convite, email inexistente, membro pago, duplicado e convite de outro utilizador. | Cobertura pedagogica insuficiente para `RNF15`, `RNF16` e `RF62`; o aluno nao recebe codigo completo para provar abusos principais. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF62`: partilha familiar deve usar contas reais existentes, exigir owner com plano Familia ativo, impedir multiplas familias ativas por membro e manter acesso premium do membro apenas enquanto o owner mantiver plano Familia ativo.
- `docs/RNF.md` confirma os RNF associados: `RNF13` para HTTPS, `RNF15` para sessoes autenticadas com cookies HttpOnly, `RNF16` para protecao contra ataques comuns e `RNF19` para auditoria de operacoes criticas.
- `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF9-03` com `RF62, RNF13, RNF15, RNF16, RNF19`, owner `Matheus`, prioridade `P0`, dependencias `BK-MF9-01,BK-MF2-01` e sprint `S13`.
- `MF-VIEWS.md` e `PLANO-SPRINTS.md` confirmam a sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `BK-MF8-10` mantem o handoff correto para `BK-MF9-01`, preservando a transicao MF8 -> MF9.

### Evidencia da implementacao de referencia

- `subscriptions.routes.js` real preserva `/plans`, `/me`, `/me/cancel-renewal` e acrescenta `/family/*` com `requireAuth`.
- `subscriptions.controller.js` real inclui controllers para overview, convite, aceitar, recusar, remover e sair.
- `subscriptions.service.js` real inclui `getFamilyOverview`, `getEffectiveSubscriptionAccess`, `hasActiveSubscriptionAccess`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily`.
- `real_dev/backend/tests/unit/mf9-subscriptions.test.js` contem testes MF9 para planos, partilha familiar, bloqueios principais, qualidade, playback e RGPD familiar.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo no guia alvo nesta reauditoria. |
| Ficheiros editados nesta reauditoria | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/subscriptions/subscriptions.controller.js`, `backend/src/modules/subscriptions/subscriptions.routes.js`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos esperados | `getFamilyOverview`, `getEffectiveSubscriptionAccess`, `hasActiveSubscriptionAccess`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember`, `leaveFamily`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece planos Familia, `familySharing` e `maxFamilyMembers`; `BK-MF2-01` fornece utilizadores, sessao segura e `requireAuth`. |
| Endpoints previstos | `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId`, `POST /api/subscriptions/family/leave`. |
| DTOs/validators previstos | Validacao de email e ids de convite/membro via helpers existentes; o guia nao explicita todos os validators/contratos auxiliares necessarios. |
| Schemas/modelos previstos | `subscription_family_memberships` com owner, membro, subscricao, estado e datas. |
| Services previstos | Overview familiar, convite, aceite, recusa, remocao, saida, acesso efetivo e ownership por sessao. |
| Componentes/paginas frontend | Nao aplicavel neste BK; `BK-MF9-04` consome a API. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Owner e membro devem vir sempre de `req.user.id`; `ownerUserId` nao deve ser aceite do frontend; membros pagos e duplicados devem ser bloqueados. |
| Testes previstos | Fluxo positivo e negativos principais para owner sem Familia, membro pago, duplicado, auto-convite, email inexistente, convite de outro utilizador e sem sessao. |
| BKs seguintes dependentes | `BK-MF9-04` usa a API familiar; `BK-MF9-05` usa memberships em RGPD/metricas; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: partilha familiar real depende de contas existentes, owner com plano Familia ativo e bloqueio de multiplas familias abertas por membro.
- `CANONICO`: membro familiar so tem acesso premium enquanto o owner mantiver plano Familia ativo.
- `CANONICO`: ownership deve vir da sessao autenticada e nao de `ownerUserId` enviado pelo frontend.
- `CANONICO`: `BK-MF9-03` prepara diretamente a UI de `BK-MF9-04`, a privacidade/metricas de `BK-MF9-05` e o gate `BK-MF9-06`.
- `DERIVADO`: usar os estados `pending`, `active`, `declined`, `removed` e `left` e aceitavel como ciclo minimo preservando historico.
- `DERIVADO`: notificacoes internas substituem envio externo de email dentro do escopo PAP.

### Drift documental encontrado

- Drift de classificacao: a secao historica do relatorio marcava `BK-MF9-03` como `OK`, mas a reauditoria atual encontrou lacunas criticas de autocontencao e executabilidade do guia.
- Nao foi encontrado drift no contrato canonico de dominio: RF/RNF, matriz, contrato de campos, MF views e plano de sprint continuam coerentes para `BK-MF9-03`.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas e caminhos privados. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falsos positivos de `IVA` dentro da palavra `DERIVADO`; sem drift ativo de OPSA/Orelle/StudyFlow ou dominios externos. |
| Pesquisa focada no BK alvo | PASS para segredos, `localStorage`, `sessionStorage`, `dangerouslySetInnerHTML`, `eval`, `new Function`, `deleteMany({})`, `payload: unknown`, `as any`, caminhos internos e dominios externos. |
| Contagem de comentarios didaticos por bloco no BK alvo | FAIL: blocos longos dos passos 3, 4, 5 e 6 nao cumprem a regra de 2 comentarios didaticos para 20+ linhas. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |

### Riscos restantes

- Risco pedagogico alto: o aluno pode copiar blocos incompletos e partir o modulo de subscricoes, especialmente rotas e controllers ja criados em `BK-MF9-01`.
- Risco tecnico alto: `getFamilyOverview`, `declineFamilyInvitation` e `leaveFamily` ficam implicitos no guia, mas sao necessarios para a API prometida.
- Risco de seguranca medio: os principios de ownership estao descritos, mas a falta de codigo completo para negativos deixa abuso de convites, duplicados e sessoes parcialmente subensinado.
- Risco operacional baixo na implementacao de referencia: os testes MF9 e build frontend passam; o problema e o guia publicado ao aluno.

### Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: corrigir `BK-MF9-03` em modo `hidratar_corrigir` ou `corrigir_apenas` para incluir codigo completo de rotas, controllers, overview, recusa, saida e negativos principais.
- `TODO (BLOCKER)`: acentuar texto pedagogico e mensagens visiveis do BK, mantendo identificadores tecnicos em ingles quando apropriado.
- `TODO (BLOCKER)`: reforcar comentarios didaticos dentro dos blocos longos, sobretudo em autenticacao, ownership, queries, validacao e testes.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-02 - confirmacao pos-correcao

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-02`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-06`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-02` re-auditado como `OK`; nenhum guia BK nem codigo real foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-02` mantem estado `OK` apos reauditoria fresca. A correcao pedagogica anterior fechou a lacuna do Passo 5: o bloco de teste tem agora 21 linhas nao vazias e 3 linhas de comentario, incluindo comentarios didaticos reais sobre a fixture 4K bloqueada e a ausencia de URL sensivel.

O contrato funcional continua coerente com `RF63`, `RF15`, `RNF29`, `BK-MF9-01`, `BK-MF2-06` e o handoff para `BK-MF9-03`. A implementacao de referencia confirma enforcement no backend: `filterQualityOptionsByEntitlements` remove `playbackUrl`/`src` de qualidades bloqueadas, `getPlayback` usa `getEffectiveSubscriptionAccess`, a UI desativa opcoes com `locked` e os testes MF9 provam filtro, fallback e ausencia de URL bloqueada.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a secao de correcao imediatamente abaixo, que ja tinha fechado `BK-MF9-02` como `OK`. Esta execucao confirmou esse estado sem editar o BK.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade original | Estado atual | Evidencia atual | Impacto |
| --- | --- | --- | --- | --- |
| `MF9-02-AUD-001` | PARCIAL | CORRIGIDO CONFIRMADO | Texto do BK confirmado em portugues de Portugal com acentuacao nas secoes destinadas aos alunos, incluindo objetivo, explicacoes, criterios, validacao, evidence, handoff e changelog. | Sem impacto aberto. |
| `MF9-02-AUD-002` | PARCIAL | CORRIGIDO CONFIRMADO | Passos 2, 3, 5 e 6 mantem imports/contexto suficientes para `filterQualityOptionsByEntitlements`, `getEffectiveSubscriptionAccess`, `qualityRankForValue`, `assert`, `test`, `ObjectId`, `getPlayback` e helpers de `BK-MF9-01`. | Sem impacto aberto. |
| `MF9-02-AUD-003` | PARCIAL | CORRIGIDO CONFIRMADO | Contagem atual dos blocos: 25, 36, 47, 16, 21, 50 e 2 linhas nao vazias; o bloco 5 tem 21 linhas nao vazias e 3 linhas de comentario. | Sem impacto aberto. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF63`: qualidade maxima imposta no backend, Pro/trial ate `1080p`, Familia ate `2160p/4K`, e URLs bloqueadas nao expostas ao frontend.
- `docs/RNF.md` confirma `RNF29` como requisito de testes automatizados para reproducao basica e subscricoes.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-02` com `RF15`, `RF63`, `RNF29`, sprint `S13`, dependencias `BK-MF9-01,BK-MF2-06` e sequencia para `BK-MF9-03`.
- `BK-MF9-01` entrega `maxQuality` e `qualityRank`; `BK-MF2-06` entrega `qualityOptions` e preferencias; `BK-MF9-03` integra acesso efetivo familiar em `getEffectiveSubscriptionAccess`.
- `BK-MF8-10` mantem o handoff correto para `BK-MF9-01`, preservando a transicao MF8 -> MF9.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo no guia alvo. |
| Ficheiros editados nesta reauditoria | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/playback/playback.service.js`, `frontend/src/pages/PlaybackPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos | `filterQualityOptionsByEntitlements`; reutiliza `qualityRankForValue` e `getEffectiveSubscriptionAccess`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece entitlements/planos e helpers de teste MF9; `BK-MF2-06` fornece preferencias/qualidades de media. |
| Endpoints criados | Nenhum endpoint novo; `GET /api/playback/:contentId` devolve `qualityOptions` filtradas e media segura. |
| DTOs/validators criados | Nenhum novo validator dedicado; reutiliza validacao de playback/preferencias existente. |
| Schemas/modelos criados | Nenhum schema novo; usa `contents.qualityOptions`, `subscriptions`, `subscription_plans`, `media_preferences` e `playback_progress`. |
| Services criados/usados | `filterQualityOptionsByEntitlements`, `resolvePlayableMedia`, `publicPlaybackContent`, `getPlayback`, `getEffectiveSubscriptionAccess`. |
| Componentes/paginas frontend | `frontend/src/pages/PlaybackPage.jsx` com seletor de qualidade que desativa opcoes bloqueadas. |
| Regras de seguranca/autorizacao | Backend decide a qualidade permitida, remove URLs de qualidades bloqueadas e usa acesso efetivo por sessao; frontend apenas reflete `locked`. |
| Testes criados | Casos MF9 para filtro de qualidade sem URL bloqueada e fallback de playback para qualidade permitida. |
| BKs seguintes dependentes | `BK-MF9-03` reutiliza acesso efetivo familiar; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: Pro/trial ficam limitados a `1080p`; Familia pode chegar a `2160p/4K`.
- `CANONICO`: URLs de qualidades bloqueadas nao podem ser expostas ao frontend.
- `CANONICO`: o enforcement da qualidade pertence ao backend; a UI apenas mostra/desativa opcoes.
- `CANONICO`: `BK-MF9-02` depende de `BK-MF9-01` e `BK-MF2-06` e prepara `BK-MF9-03`.
- `DERIVADO`: mostrar a opcao bloqueada na UI e aceitavel como feedback pedagogico desde que a URL nao seja enviada.
- `DERIVADO`: manter `requiredTier: "family"` e `lockedReason` como metadados publicos e coerente com o fluxo Pro/Familia.

### Drift documental encontrado

Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, handoff MF8->MF9 e implementacao de referencia para o contrato funcional de `BK-MF9-02`.

As secoes historicas abaixo preservam o ciclo anterior: uma reauditoria marcou `PARCIAL`, a correcao fechou `MF9-02-AUD-003`, e esta nova reauditoria confirmou `OK`.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev`, variaveis internas, caminhos locais e exemplos `apps/api`/`apps/web`. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: apenas falsos positivos de `IVA` dentro de `DERIVADO`; sem drift ativo do dominio FaithFlix. |
| Pesquisa de segredos/placeholders/perigos no BK alvo | INFO: apenas `estado: TODO` no header, esperado para o guia. |
| Contagem de blocos de codigo no BK alvo | PASS: blocos com 25, 36, 47, 16, 21, 50 e 2 linhas nao vazias; bloco 5 com 21 linhas e 3 comentarios. |
| `rg -n '[[:blank:]]$'` no BK alvo e relatorio | PASS: zero ocorrencias. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |

### Riscos restantes

- Risco residual tecnico baixo: a reauditoria foi documental e a implementacao de referencia continua coberta por testes MF9 para filtro, fallback e ausencia de URL bloqueada.
- Risco residual operacional baixo: a evidence final de PR/defesa continua a depender da execucao real dos alunos no ambiente deles.
- Risco residual de leitura baixo: as secoes historicas abaixo preservam estados anteriores; o estado atual desta execucao e o desta secao.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional encontrado para `RF63`.
- Sem blocker de implementacao real encontrado para qualidade por plano.
- Sem pendentes conhecidos apos esta reauditoria.

---

## Correcao observada - 2026-07-01 - BK-MF9-02 - comentario didatico Passo 5

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-02`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-06`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-02` corrigido de `PARCIAL` para `OK`; a correcao ficou limitada ao comentario didatico em falta no Passo 5 e a este relatorio.

### Resultado executivo da correcao observada

`BK-MF9-02` passa novamente a `OK` depois de fechar o unico finding aberto na reauditoria anterior: `MF9-02-AUD-003`. A alteracao foi estritamente pedagogica e nao mudou contratos, caminhos, codigo real da app, comandos, endpoints, regras de dominio ou sequencia da MF9.

O bloco de teste do Passo 5 recebeu um comentario didatico junto da fixture `1080p`/`2160p`, explicando que o cenario inclui 4K com URL para provar que o backend remove dados sensiveis em planos Pro. Assim, o bloco deixa de incumprir a regra da prompt para blocos com 20 ou mais linhas nao vazias.

### Contagem antes e depois da correcao observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 1 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a reauditoria imediatamente abaixo, que tinha rebaixado `BK-MF9-02` para `PARCIAL` por falta de comentario didatico no Passo 5.

### BK corrigido nesta execucao

| BK | Estado antes | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF9-02` | PARCIAL | OK | Acrescentado comentario didatico no bloco de teste do Passo 5 para explicar o cenario Pro com 4K bloqueado e ausencia de URL sensivel. |

### Findings atuais

| ID | Severidade | Estado | Evidencia pos-correcao | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-02-AUD-001` | PARCIAL | CORRIGIDO | Mantem-se fechado: texto do BK esta em portugues de Portugal com acentuacao nas secoes destinadas aos alunos. | Sem impacto aberto. |
| `MF9-02-AUD-002` | PARCIAL | CORRIGIDO | Mantem-se fechado: passos 2, 3, 5 e 6 incluem imports/contexto suficientes para `filterQualityOptionsByEntitlements`, `getEffectiveSubscriptionAccess`, `qualityRankForValue`, `assert`, `test`, `ObjectId`, `getPlayback` e helpers de `BK-MF9-01`. | Sem impacto aberto. |
| `MF9-02-AUD-003` | PARCIAL | CORRIGIDO | `BK-MF9-02`, Passo 5: adicionado comentario didatico antes da fixture de qualidades; a contagem atual mostra bloco 5 com 21 linhas nao vazias e 3 linhas de comentario, incluindo dois comentarios didaticos reais. | O guia volta a cumprir a regra formal de comentarios didaticos para blocos longos. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF63`: qualidade maxima imposta no backend, Pro/trial ate `1080p`, Familia ate `2160p/4K`, e URLs bloqueadas nao expostas ao frontend.
- `docs/RNF.md` confirma `RNF29` como requisito de testes automatizados para reproducao basica e subscricoes.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-02` com `RF15`, `RF63`, `RNF29`, sprint `S13`, dependencias `BK-MF9-01,BK-MF2-06` e sequencia para `BK-MF9-03`.
- `BK-MF9-01` entrega `maxQuality` e `qualityRank`; `BK-MF2-06` entrega `qualityOptions` e preferencias; `BK-MF9-03` integra acesso efetivo familiar em `getEffectiveSubscriptionAccess`.
- `BK-MF8-10` mantem o handoff correto para `BK-MF9-01`, preservando a transicao MF8 -> MF9.

### Mapa de integracao da MF

| Categoria | Resultado pos-correcao |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo. |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` |
| Ficheiros previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/playback/playback.service.js`, `frontend/src/pages/PlaybackPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos | `filterQualityOptionsByEntitlements`; reutiliza `qualityRankForValue` e `getEffectiveSubscriptionAccess`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece entitlements/planos e helpers de teste MF9; `BK-MF2-06` fornece preferencias/qualidades de media; `BK-MF2-05` fornece playback base. |
| Endpoints criados | Nenhum endpoint novo; `GET /api/playback/:contentId` passa a devolver `qualityOptions` filtradas e media segura. |
| DTOs/validators criados | Nenhum novo validator dedicado; reutiliza validacao de playback/preferencias existente. |
| Schemas/modelos criados | Nenhum schema novo; usa `contents.qualityOptions`, `subscriptions`, `subscription_plans`, `media_preferences` e `playback_progress`. |
| Services criados/usados | `filterQualityOptionsByEntitlements`, `resolvePlayableMedia`, `publicPlaybackContent`, `getPlayback`, `getEffectiveSubscriptionAccess`. |
| Componentes/paginas frontend | `frontend/src/pages/PlaybackPage.jsx` com seletor de qualidade que desativa opcoes bloqueadas. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Backend decide a qualidade permitida, remove URLs de qualidades bloqueadas e usa acesso efetivo por sessao; frontend apenas reflete `locked`. |
| Testes criados | Casos MF9 para filtro de qualidade sem URL bloqueada e fallback de playback para qualidade permitida. |
| BKs seguintes dependentes | `BK-MF9-03` reutiliza acesso efetivo familiar; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta correcao

- `CANONICO`: Pro/trial ficam limitados a `1080p`; Familia pode chegar a `2160p/4K`.
- `CANONICO`: URLs de qualidades bloqueadas nao podem ser expostas ao frontend.
- `CANONICO`: o enforcement da qualidade pertence ao backend; a UI apenas mostra/desativa opcoes.
- `CANONICO`: `BK-MF9-02` depende de `BK-MF9-01` e `BK-MF2-06` e prepara `BK-MF9-03`.
- `DERIVADO`: mostrar a opcao bloqueada na UI e aceitavel como feedback pedagogico desde que a URL nao seja enviada.
- `DERIVADO`: manter `requiredTier: "family"` e `lockedReason` como metadados publicos e coerente com o fluxo Pro/Familia.

### Drift documental encontrado

Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, handoff MF8->MF9 e implementacao de referencia para o contrato funcional de `BK-MF9-02`.

O drift de classificacao aberto na reauditoria anterior fica fechado: `BK-MF9-02` passa de `PARCIAL` para `OK` apos correcao do comentario didatico do Passo 5.

### Validacoes executadas nesta correcao

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev` e variaveis internas nos BKs. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: falsos positivos de `IVA` dentro de `DERIVADO`; sem drift ativo do dominio FaithFlix. |
| Contagem de blocos de codigo no BK alvo | PASS: bloco 5 passou para 21 linhas nao vazias e 3 linhas de comentario, com dois comentarios didaticos reais. |
| `rg -n '[[:blank:]]$'` no BK alvo e relatorio | PASS: zero ocorrencias. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |

### Riscos restantes

- Risco residual tecnico baixo: a alteracao foi documental/pedagogica e os testes MF9 continuam a provar filtro, fallback e ausencia de URL bloqueada.
- Risco residual operacional baixo: a evidence final de PR/defesa continua a depender da execucao real dos alunos no ambiente deles.
- Risco residual de leitura: as secoes historicas abaixo preservam estados anteriores; o estado atual desta execucao e o desta secao.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional encontrado para `RF63`.
- Sem blocker de implementacao real encontrado para qualidade por plano.
- Sem pendentes conhecidos apos esta correcao.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-02

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-02`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-06`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-02` re-auditado como `PARCIAL`; nenhum guia BK foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-02` esta tecnicamente alinhado com `RF63`, `RF15`, `RNF29`, `BK-MF9-01`, `BK-MF2-06` e o handoff para `BK-MF9-03`. A implementacao de referencia confirma o contrato: `filterQualityOptionsByEntitlements` remove `playbackUrl`/`src` de qualidades bloqueadas, `getPlayback` aplica `getEffectiveSubscriptionAccess`, a UI desativa opcoes com `locked` e os testes MF9 provam filtro e fallback.

As duas lacunas anteriores continuam fechadas: o texto pedagogico do BK esta em portugues de Portugal com acentuacao, e os blocos dos passos 2, 3, 5 e 6 ja explicam imports/contexto suficiente para um aluno seguir o guia sem adivinhar helpers centrais.

Mesmo assim, a reauditoria estrita encontrou uma lacuna residual na regra mecanica de comentarios didaticos: o bloco de codigo do Passo 5 tem exatamente 20 linhas nao vazias e apenas um comentario didatico real, alem do comentario inicial de caminho do ficheiro. Pela prompt, blocos com 20 ou mais linhas nao vazias precisam de pelo menos 2 comentarios didaticos dentro do proprio bloco. Por isso, o BK nao deve ser classificado como `OK` absoluto nesta execucao.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 0 |
| PARCIAL | 0 | 1 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a secao de correcao imediatamente abaixo, que tinha fechado `BK-MF9-02` como `OK`. Esta execucao fez uma reauditoria fresca em modo `auditar_apenas`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Findings atuais

| ID | Severidade | Estado | Evidencia | Impacto | Correcao recomendada |
| --- | --- | --- | --- | --- | --- |
| `MF9-02-AUD-001` | PARCIAL | CORRIGIDO | A reauditoria confirmou texto do BK com acentuacao em titulo, narrativa, JSDoc, comentarios, mensagens, criterios, validacao, evidence, handoff e changelog. | Sem impacto aberto. | Nenhuma acao adicional. |
| `MF9-02-AUD-002` | PARCIAL | CORRIGIDO | Os passos 2, 3, 5 e 6 explicam imports e contexto para `filterQualityOptionsByEntitlements`, `getEffectiveSubscriptionAccess`, `qualityRankForValue`, `assert`, `test`, `ObjectId`, `getPlayback` e helpers de `BK-MF9-01`. | Sem impacto aberto. | Nenhuma acao adicional. |
| `MF9-02-AUD-003` | PARCIAL | PARCIAL | `BK-MF9-02`, linhas 374-397: o bloco de teste do Passo 5 tem 20 linhas nao vazias. O comentario da linha 375 e apenas caminho do ficheiro; o unico comentario didatico real fica na linha 391. A regra da prompt exige 2 comentarios didaticos em blocos com 20 ou mais linhas nao vazias. | Risco pedagogico baixo: o teste continua tecnicamente executavel, mas o guia nao cumpre a regra formal de comentarios didaticos para material publicavel. | Em modo de correcao, acrescentar mais um comentario didatico junto da fixture de qualidades ou da chamada a `filterQualityOptionsByEntitlements`, explicando que o teste simula Pro a receber 4K bloqueado para provar a ausencia de URL sensivel. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF63`: qualidade maxima imposta no backend, Pro/trial ate `1080p`, Familia ate `2160p/4K`, e URLs bloqueadas nao expostas ao frontend.
- `docs/RNF.md` confirma `RNF29` como requisito de testes automatizados para reproducao basica e subscricoes.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-02` com `RF15`, `RF63`, `RNF29`, sprint `S13`, dependencias `BK-MF9-01,BK-MF2-06` e sequencia para `BK-MF9-03`.
- `BK-MF9-01` entrega `maxQuality` e `qualityRank`; `BK-MF2-06` entrega `qualityOptions` e preferencias; `BK-MF9-03` integra acesso efetivo familiar em `getEffectiveSubscriptionAccess`.
- `BK-MF8-10` mantem o handoff correto para `BK-MF9-01`, preservando a transicao MF8 -> MF9.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo no guia alvo. |
| Ficheiros editados nesta reauditoria | Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`. |
| Ficheiros previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/playback/playback.service.js`, `frontend/src/pages/PlaybackPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos | `filterQualityOptionsByEntitlements`; reutiliza `qualityRankForValue` e `getEffectiveSubscriptionAccess`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece entitlements/planos e helpers de teste MF9; `BK-MF2-06` fornece preferencias/qualidades de media; `BK-MF2-05` fornece playback base. |
| Endpoints criados | Nenhum endpoint novo; `GET /api/playback/:contentId` passa a devolver `qualityOptions` filtradas e media segura. |
| DTOs/validators criados | Nenhum novo validator dedicado; reutiliza validacao de playback/preferencias existente. |
| Schemas/modelos criados | Nenhum schema novo; usa `contents.qualityOptions`, `subscriptions`, `subscription_plans`, `media_preferences` e `playback_progress`. |
| Services criados/usados | `filterQualityOptionsByEntitlements`, `resolvePlayableMedia`, `publicPlaybackContent`, `getPlayback`, `getEffectiveSubscriptionAccess`. |
| Componentes/paginas frontend | `frontend/src/pages/PlaybackPage.jsx` com seletor de qualidade que desativa opcoes bloqueadas. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Backend decide a qualidade permitida, remove URLs de qualidades bloqueadas e usa acesso efetivo por sessao; frontend apenas reflete `locked`. |
| Testes criados | Casos MF9 para filtro de qualidade sem URL bloqueada e fallback de playback para qualidade permitida. |
| BKs seguintes dependentes | `BK-MF9-03` reutiliza acesso efetivo familiar; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: Pro/trial ficam limitados a `1080p`; Familia pode chegar a `2160p/4K`.
- `CANONICO`: URLs de qualidades bloqueadas nao podem ser expostas ao frontend.
- `CANONICO`: o enforcement da qualidade pertence ao backend; a UI apenas mostra/desativa opcoes.
- `CANONICO`: `BK-MF9-02` depende de `BK-MF9-01` e `BK-MF2-06` e prepara `BK-MF9-03`.
- `DERIVADO`: mostrar a opcao bloqueada na UI e aceitavel como feedback pedagogico desde que a URL nao seja enviada.
- `DERIVADO`: manter `requiredTier: "family"` e `lockedReason` como metadados publicos e coerente com o fluxo Pro/Familia.

### Drift documental encontrado

Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, handoff MF8->MF9 e implementacao de referencia para o contrato funcional de `BK-MF9-02`.

Foi reaberto apenas drift de classificacao no relatorio: a secao de correcao anterior classificava o BK como `OK`, mas a reauditoria atual baixa para `PARCIAL` por uma lacuna residual de comentario didatico no Passo 5.

### Validacoes executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev` e variaveis internas nos BKs. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: falsos positivos de `IVA` dentro de `DERIVADO`; sem drift ativo do dominio FaithFlix. |
| Pesquisa de segredos/placeholders/perigos no BK alvo | INFO: apenas `estado: TODO` no header e `Sem codigo neste passo.` no Passo 7; ambos esperados. |
| Contagem de blocos de codigo no BK alvo | INFO: blocos com 25, 36, 47, 16, 20, 50 e 2 linhas nao vazias; o bloco de 20 linhas do Passo 5 tem apenas 1 comentario didatico real. |
| `rg -n '[[:blank:]]$'` no BK alvo e relatorio | PASS: zero ocorrencias. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |

### Riscos restantes

- Risco pedagogico baixo: falta um segundo comentario didatico no bloco de teste do Passo 5 para cumprir a regra formal de blocos com 20 ou mais linhas nao vazias.
- Risco tecnico baixo: a implementacao de referencia e os testes MF9 provam filtro, fallback e ausencia de URL bloqueada.
- Risco de scope: como `MODO=auditar_apenas`, a lacuna foi registada mas nao corrigida nesta execucao.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional encontrado para `RF63`.
- Sem blocker de implementacao real encontrado para qualidade por plano.
- Pendente dentro do guia: acrescentar 1 comentario didatico no bloco de codigo do Passo 5 quando o modo permitir correcao.

---

## Correcao observada - 2026-07-01 - BK-MF9-02

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-02`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-06`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-02` corrigido de `PARCIAL` para `OK`; nao foram editados outros BKs nem codigo real.

### Resultado executivo da correcao observada

`BK-MF9-02` passa a `OK` apos a correcao das duas lacunas abertas na reauditoria anterior. O guia ficou alinhado com o contrato de produto e com a regra pedagogica da prompt: texto publicavel em portugues de Portugal com acentuacao, blocos de codigo com imports/contexto suficientes e testes com comentarios didaticos nos blocos longos.

O contrato tecnico manteve-se igual: `RF63` continua a exigir enforcement backend da qualidade maxima; Pro/trial ficam limitados a `1080p`; Familia pode receber `2160p/4K` quando o conteudo tiver essa opcao; URLs de qualidades bloqueadas nao sao expostas ao frontend; e a UI apenas reflete `locked` sem decidir permissoes.

### Contagem antes e depois da correcao observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 1 | 0 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a reauditoria de `BK-MF9-02` registada abaixo nesta mesma data. Esta execucao corrigiu apenas esse BK e atualizou este relatorio.

### BK corrigido nesta execucao

| BK | Estado antes | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF9-02` | PARCIAL | OK | Texto PT-PT acentuado, imports/contexto explicitos nos blocos backend/frontend/testes e reforco de comentarios didaticos no teste longo de fallback. |

### Findings atuais

| ID | Severidade | Estado | Evidencia pos-correcao | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-02-AUD-001` | PARCIAL | CORRIGIDO | `BK-MF9-02` foi normalizado para portugues de Portugal com acentuacao em titulo, narrativa, comentarios didaticos, JSDoc, mensagens visiveis, criterios, validacao final, handoff e changelog; `last_updated` passou para `2026-07-01`. | O guia volta a cumprir a regra linguistica da prompt para material publicavel ao aluno. |
| `MF9-02-AUD-002` | PARCIAL | CORRIGIDO | Os passos 2, 3, 5 e 6 foram reescritos com imports/contexto explicitos para `filterQualityOptionsByEntitlements`, `getEffectiveSubscriptionAccess`, `qualityRankForValue`, `assert`, `test`, `ObjectId` e `getPlayback`; o passo 6 recorda os helpers criados em `BK-MF9-01` e inclui segundo comentario didatico interno. | O aluno deixa de depender de imports implicitos ou helpers nao situados para implementar e testar `RF63`. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF63` como qualidade de streaming por plano, dependente de `RF11`, `RF15` e `RF61`; os criterios aceitam Pro/trial ate `1080p`, Familia ate `2160p/4K` e proibe expor URLs bloqueadas ao frontend.
- `docs/RNF.md` confirma `RNF29` como requisito de testes automatizados para reproducao basica e subscricoes.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF9-02` com owner `Mateus`, apoio `Matheus`, prioridade `P0`, esforco `M`, dependencias `BK-MF9-01,BK-MF2-06`, `RF15, RF63, RNF29` e sprint `S13`.
- `PLANO-SPRINTS.md` confirma a sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `MF-VIEWS.md` confirma que a MF9 aplica qualidade por plano e fecha com gate S13.
- `BK-MF8-10` mantem `proximo_bk: BK-MF9-01`; `BK-MF9-03` consome o acesso efetivo preparado por `BK-MF9-02`.

### Mapa de integracao da MF

| Categoria | Resultado pos-correcao |
| --- | --- |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` |
| Ficheiros previstos pelo guia | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/playback/playback.service.js`, `frontend/src/pages/PlaybackPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js` |
| Exports produzidos | `filterQualityOptionsByEntitlements`; reutiliza `qualityRankForValue` e `getEffectiveSubscriptionAccess`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece entitlements/planos e helpers de teste MF9; `BK-MF2-06` fornece preferencias/qualidades de media; `BK-MF2-05` fornece playback base. |
| Endpoints criados | Nenhum endpoint novo; altera o contrato publico de `GET /api/playback/:contentId` para devolver `qualityOptions` filtradas e media segura. |
| DTOs/validators criados | Nenhum novo validator dedicado; reutiliza validacao de playback/preferencias existente. |
| Schemas/modelos criados | Nenhum schema novo; usa `contents.qualityOptions`, `subscriptions`, `subscription_plans`, `media_preferences` e `playback_progress`. |
| Services criados/usados | `filterQualityOptionsByEntitlements`, `resolvePlayableMedia`, `publicPlaybackContent`, `getPlayback`, `getEffectiveSubscriptionAccess`. |
| Componentes/paginas frontend | `frontend/src/pages/PlaybackPage.jsx` com seletor de qualidade que desativa opcoes bloqueadas. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Backend decide a qualidade permitida, remove URLs de qualidades bloqueadas e usa acesso efetivo por sessao; frontend apenas reflete `locked`. |
| Testes criados | Casos MF9 para filtro de qualidade sem URL bloqueada e fallback de playback para qualidade permitida. |
| BKs seguintes dependentes | `BK-MF9-03` reutiliza acesso efetivo familiar; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta correcao

- `CANONICO`: Pro/trial ficam limitados a `1080p`; Familia pode chegar a `2160p/4K`.
- `CANONICO`: URLs de qualidades bloqueadas nao podem ser expostas ao frontend.
- `CANONICO`: o enforcement da qualidade pertence ao backend; a UI apenas mostra/desativa opcoes.
- `CANONICO`: `BK-MF9-02` depende de `BK-MF9-01` e `BK-MF2-06` e prepara `BK-MF9-03`.
- `DERIVADO`: mostrar a opcao bloqueada na UI e aceitavel como feedback pedagogico desde que a URL nao seja enviada.
- `DERIVADO`: manter `requiredTier: "family"` e `lockedReason` como metadados publicos e coerente com o fluxo Pro/Familia.

### Drift documental encontrado

Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, handoff MF8->MF9 e implementacao de referencia para o contrato funcional de `BK-MF9-02`.

O drift de classificacao registado na reauditoria anterior fica fechado: `BK-MF9-02` passa de `PARCIAL` para `OK` com evidencia documental e tecnica.

### Validacoes executadas nesta correcao

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev` e variaveis internas nos BKs. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: falsos positivos de `IVA` dentro de `DERIVADO`; sem drift ativo do dominio FaithFlix. |
| `rg -n '[[:blank:]]$'` no BK alvo | PASS: zero ocorrencias. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |

### Riscos restantes

- Risco residual baixo: esta execucao corrigiu apenas `BK-MF9-02`; os restantes BKs MF9 foram lidos para coerencia, mas nao reclassificados em profundidade nesta correcao.
- Risco residual operacional: a evidence final de PR/defesa continua a depender da execucao real dos alunos no ambiente deles.
- Risco residual de leitura: as secoes historicas abaixo preservam estados anteriores; o estado atual desta execucao e o desta secao.

### Bloqueios e TODOs restantes

- Sem blocker funcional ou documental encontrado para `BK-MF9-02`.
- Sem `TODO (BLOCKER)` aberto no BK alvo.
- Sem pendentes conhecidos apos a correcao desta execucao.

---

## Historico preservado - 2026-07-01 - reauditoria BK-MF9-02

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-02`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF2-06`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execucao: `BK-MF9-02` re-auditado como `PARCIAL`; nenhum guia BK foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-02` esta tecnicamente alinhado com o contrato de produto: `RF63` exige enforcement backend da qualidade maxima, `RNF29` exige testes, `BK-MF9-01` fornece `maxQuality`/`qualityRank` e `BK-MF9-03` consegue reutilizar o mesmo filtro quando introduzir acesso familiar efetivo.

A implementacao de referencia confirma o caminho tecnico: `filterQualityOptionsByEntitlements` remove `playbackUrl`/`src` de qualidades bloqueadas, `getPlayback` usa `getEffectiveSubscriptionAccess`, a pagina `PlaybackPage` desativa opcoes bloqueadas e a suite MF9 prova filtro e fallback.

Mesmo assim, o guia nao pode ser classificado como `OK` para aluno porque ainda incumpre duas regras pedagogicas da prompt: o texto destinado ao aluno continua amplamente sem acentuacao PT-PT e alguns blocos de codigo continuam demasiado dependentes de contexto criado fora do proprio passo, sem explicitar imports/helpers suficientes para um aluno seguir sem adivinhar.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 0 |
| PARCIAL | 0 | 1 |
| CRITICO | 0 | 0 |

Nota: o "Antes" reflete a classificacao historica preservada no relatorio MF9. Esta execucao fez uma reauditoria fresca apenas a `BK-MF9-02`.

### BKs editados nesta reauditoria

| Ficheiro | Acao |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md` | Nao editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidencia desta reauditoria. |

### Evidencia de alinhamento canonico

- `docs/RF.md` confirma `RF63` como qualidade de streaming por plano, dependente de `RF11`, `RF15` e `RF61`; os criterios aceitam Pro/trial ate `1080p`, Familia ate `2160p/4K` e proibe expor URLs bloqueadas ao frontend.
- `docs/RNF.md` confirma `RNF29` como requisito de testes automatizados para reproducao basica e subscricoes.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF9-02` com owner `Mateus`, apoio `Matheus`, prioridade `P0`, esforco `M`, dependencias `BK-MF9-01,BK-MF2-06`, `RF15, RF63, RNF29` e sprint `S13`.
- `PLANO-SPRINTS.md` confirma a sequencia `BK-MF9-01 -> BK-MF9-02 -> BK-MF9-03 -> BK-MF9-04 -> BK-MF9-05 -> BK-MF9-06`.
- `MF-VIEWS.md` confirma que a MF9 aplica qualidade por plano e fecha com gate S13.
- `BK-MF8-10` mantem `proximo_bk: BK-MF9-01`; `BK-MF9-03` consome o acesso efetivo preparado por `BK-MF9-02`.

### Findings atuais

| ID | Severidade | Estado | Evidencia | Impacto | Correcao recomendada |
| --- | --- | --- | --- | --- | --- |
| `MF9-02-AUD-001` | PARCIAL | PARCIAL | O guia usa texto de aluno sem acentuacao em varias secoes: por exemplo linhas 24-26 (`video`, `Familia`, `conteudo`, `opcao`, `observavel`, `nao`, `publica`), linhas 39-41 (`preferencia`, `opcoes`, `selecao`) e linhas 501-515 nos criterios/validacao final. | Viola a regra linguistica da prompt e baixa a qualidade pedagogica para alunos do 12.o ano, embora nao quebre o contrato tecnico. | Normalizar todo o texto narrativo, comentarios didaticos, JSDoc, mensagens visiveis, expected results, criterios e handoff para portugues de Portugal com acentuacao correta. |
| `MF9-02-AUD-002` | PARCIAL | PARCIAL | Os passos 2 e 3 mostram funcoes dependentes de imports que nao sao explicitados no bloco (`filterQualityOptionsByEntitlements`, `getEffectiveSubscriptionAccess`, `qualityRankForValue`, `getMediaPreferences`, `publicProgress`), enquanto os passos 5 e 6 usam helpers/imports de teste (`assert`, `ObjectId`, `setCollectionsForTests`, `collection`, `planRows`, `getPlayback`) sem recordar claramente que foram criados em `BK-MF9-01`; o bloco do passo 6 tem mais de 20 linhas nao vazias e apenas um comentario didatico interno. | O aluno consegue perceber a intencao, mas ainda pode ter de adivinhar contexto de imports/helpers e a regra de comentarios didaticos nao fica totalmente cumprida. | Reescrever os blocos como patch integrado com imports relevantes ou indicar explicitamente "mantem os imports/helpers criados em BK-MF9-01 e acrescenta estas imports"; acrescentar pelo menos mais um comentario didatico no teste longo do passo 6. |

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros criados | Nenhum ficheiro novo no guia; o teste MF9 usa `backend/tests/unit/mf9-subscriptions.test.js`. |
| Ficheiros editados previstos pelo BK | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/playback/playback.service.js`, `frontend/src/pages/PlaybackPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js`. |
| Exports produzidos | `filterQualityOptionsByEntitlements`; reutiliza `qualityRankForValue` e `getEffectiveSubscriptionAccess`. |
| Imports consumidos de BKs anteriores | `BK-MF9-01` fornece entitlements/planos e helpers de teste MF9; `BK-MF2-06` fornece preferencias/qualidades de media; `BK-MF2-05` fornece playback base. |
| Endpoints criados | Nenhum endpoint novo; altera o contrato publico de `GET /api/playback/:contentId` para devolver `qualityOptions` filtradas e media segura. |
| DTOs/validators criados | Nenhum novo validator dedicado; reutiliza validacao de playback/preferencias existente. |
| Schemas/modelos criados | Nenhum schema novo; usa `contents.qualityOptions`, `subscriptions`, `subscription_plans`, `media_preferences` e `playback_progress`. |
| Services criados/usados | `filterQualityOptionsByEntitlements`, `resolvePlayableMedia`, `publicPlaybackContent`, `getPlayback`, `getEffectiveSubscriptionAccess`. |
| Componentes/paginas frontend | `frontend/src/pages/PlaybackPage.jsx` com seletor de qualidade que desativa opcoes bloqueadas. |
| Providers de IA | Nao aplicavel. |
| Regras de seguranca/autorizacao | Backend decide a qualidade permitida, remove URLs de qualidades bloqueadas e usa acesso efetivo por sessao; frontend apenas reflete `locked`. |
| Testes criados | Casos MF9 para filtro de qualidade sem URL bloqueada e fallback de playback para qualidade permitida. |
| BKs seguintes dependentes | `BK-MF9-03` reutiliza acesso efetivo familiar; `BK-MF9-06` valida gate/regressao MF9. |

### Decisoes confirmadas nesta reauditoria

- `CANONICO`: Pro/trial ficam limitados a `1080p`; Familia pode chegar a `2160p/4K`.
- `CANONICO`: URLs de qualidades bloqueadas nao podem ser expostas ao frontend.
- `CANONICO`: o enforcement da qualidade pertence ao backend; a UI apenas mostra/desativa opcoes.
- `CANONICO`: `BK-MF9-02` depende de `BK-MF9-01` e `BK-MF2-06` e prepara `BK-MF9-03`.
- `DERIVADO`: mostrar a opcao bloqueada na UI e aceitavel como feedback pedagogico desde que a URL nao seja enviada.
- `DERIVADO`: manter `requiredTier: "family"` e `lockedReason` como metadados publicos e coerente com o fluxo Pro/Familia.

### Drift documental encontrado

Nao foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, MF views, plano de sprint, handoff MF8->MF9 e implementacao de referencia para o contrato funcional de `BK-MF9-02`.

Foi encontrado drift de classificacao no relatorio: o historico preservado classificava `BK-MF9-02` como `OK`, mas a reauditoria atual baixa para `PARCIAL` devido a lacunas pedagogicas publicaveis.

### Validações executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrencias. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev` e variaveis internas nos BKs. |
| Pesquisa de drift de dominio nos BKs MF9 | INFO: falsos positivos de `IVA` dentro de `DERIVADO`. |
| `rg -n '[[:blank:]]$'` no BK alvo e relatorio | PASS: zero ocorrencias. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |

### Riscos restantes

- Risco pedagogico medio: sem correcao linguistica e contextual, o guia ainda nao cumpre totalmente a regra de material publicavel para aluno.
- Risco tecnico baixo: a implementacao de referencia e os testes MF9 provam o contrato de filtro/fallback, mas o guia deve explicitar melhor imports/helpers para reduzir adivinhacao.
- Risco de scope: como `MODO=auditar_apenas`, as lacunas foram registadas mas nao corrigidas nesta execucao.

### Bloqueios e TODOs restantes

- Sem `TODO (BLOCKER)` funcional encontrado para `RF63`.
- Sem blocker de implementacao real encontrado para qualidade por plano.
- Pendentes dentro do guia: normalizacao PT-PT com acentuacao e reforco dos blocos de codigo/teste indicados nos findings.

---

## Reauditoria observada - 2026-07-01 - BK-MF9-01

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-01`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF4-01`, `BK-MF4-02`
- Modo: `auditar_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execução: `BK-MF9-01` re-auditado como `OK`; nenhum guia BK foi editado nesta reauditoria.

### Resultado executivo da reauditoria observada

`BK-MF9-01` mantém estado `OK` após nova leitura integral do guia, cruzamento com documentação canónica e validação técnica focada.

O guia cumpre o contrato pedagógico e técnico exigido para `RF61`: preserva `faithflix-monthly` e `faithflix-yearly`, introduz planos Família, publica `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers` e `features`, mantém checkout simulado compatível e deixa handoff explícito para `BK-MF9-02` e `BK-MF9-03`.

Não foram reabertos os findings da auditoria anterior. O componente `PlansSection` está autocontido, o teste MF9 apresentado inclui imports/helpers/fixtures/asserts suficientes para o contexto do BK, e o texto narrativo do `BK-MF9-01` está em português de Portugal com acentuação correta nas secções destinadas aos alunos.

### Contagem antes e depois da reauditoria observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

### BKs editados nesta reauditoria

| Ficheiro | Ação |
| --- | --- |
| `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md` | Não editado; apenas re-auditado. |
| `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` | Atualizado com a evidência desta reauditoria. |

### Evidência de alinhamento canónico

- `README.md` e `PLANO-IMPLEMENTACAO-TOTAL.md` continuam a enquadrar MF9 como planos Pro/Família, partilha real, qualidade por plano e gate S13.
- `docs/RF.md` confirma `RF61` como planos Pro/Família e entitlements, dependente de `RF35` e `RF38`.
- `docs/RNF.md` mantém `RNF40` como contrato de localização/formatação.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` alinham `BK-MF9-01` com owner, prioridade, dependências, sprint S13 e handoff.
- `BK-MF8-10` mantém `proximo_bk: BK-MF9-01`.
- `BK-MF9-02` consome `maxQuality` e `qualityRank`; `BK-MF9-03` consome `familySharing` e `maxFamilyMembers`.

### Decisões confirmadas nesta reauditoria

- `CANONICO`: Pro/Família expõem entitlements públicos sem quebrar `faithflix-monthly` e `faithflix-yearly`.
- `CANONICO`: a qualidade máxima e a partilha familiar derivam de dados do backend, não de decisão local do frontend.
- `DERIVADO`: `faithflix-family-monthly` e `faithflix-family-yearly` continuam a ser a extensão mínima coerente dos códigos existentes.
- `DERIVADO`: `maxFamilyMembers: 5` continua coerente com o guia, com a implementação de referência e com os testes MF9.

### Drift documental encontrado

Não foi encontrado drift ativo entre RF/RNF, backlog, matriz, contrato de campos, plano de sprint, handoff MF8->MF9, BKs dependentes e implementação de referência para o escopo de `BK-MF9-01`.

### Validações executadas nesta reauditoria

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrências. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrências de `real_dev` e variáveis internas nos BKs. |
| Pesquisa de drift de domínio nos BKs MF9 | INFO: apenas falsos positivos de `IVA` dentro de `DERIVADO`, incluindo BKs fora do alvo. |
| `rg -n '[[:blank:]]$'` no BK alvo e relatório | PASS: zero ocorrências. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluído. |

### Riscos restantes

- Risco residual baixo: esta execução re-auditou apenas `BK-MF9-01`; os restantes BKs MF9 foram lidos para coerência, mas não reclassificados em profundidade.
- Risco residual operacional: a evidence final de PR/defesa continua a depender da execução real dos alunos no ambiente deles.
- Risco residual de leitura: as secções de 2026-06-30 abaixo são histórico preservado; o estado atual desta reauditoria é o desta secção.

### Bloqueios e TODOs restantes

- Sem blocker funcional ou documental encontrado para `BK-MF9-01`.
- Sem `TODO (BLOCKER)` aberto no BK alvo.

---

## Histórico preservado - 2026-06-30 - correção BK-MF9-01

- Projeto: FaithFlix
- MF alvo: `MF9`
- BK alvo: `BK-MF9-01`
- BKs lidos para coerencia: `BK-MF9-01` a `BK-MF9-06`, `BK-MF8-10`, `BK-MF4-01`, `BK-MF4-02`
- Modo: `corrigir_apenas`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Resultado desta execução: `BK-MF9-01` corrigido e relatório atualizado.

### Resultado executivo da execução observada

`BK-MF9-01` foi corrigido a partir dos três findings abertos na reauditoria anterior e passa de `PARCIAL` para `OK`.

O contrato de produto manteve-se coerente: `RF61` pede planos Pro/Família com entitlements sem quebrar `faithflix-monthly` e `faithflix-yearly`; `BK-MF9-01` depende corretamente de `BK-MF4-01` e `BK-MF4-02`; `BK-MF9-02` e `BK-MF9-03` dependem de `maxQuality`, `qualityRank`, `familySharing` e `maxFamilyMembers`; e a implementação em `real_dev` passa os testes MF9 focados.

As correções foram documentais e pedagógicas: texto narrativo normalizado para português de Portugal com acentuação, componente frontend autocontido para a zona de planos e ficheiro de teste MF9 completo para o contexto inicial do BK. Não foram editados ficheiros de produto em `real_dev`.

### Contagem antes e depois da execução observada

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 1 |
| PARCIAL | 1 | 0 |
| CRITICO | 0 | 0 |

Nota: a secção histórica preservada mais abaixo indicava os 6 BKs da MF9 como `OK` após hidratação anterior. Esta execução atualiza apenas o estado de `BK-MF9-01` com evidência recolhida agora.

### BK corrigido nesta execução

| BK | Estado antes | Estado depois | Correção principal |
| --- | --- | --- | --- |
| `BK-MF9-01` | PARCIAL | OK | Texto PT-PT acentuado, componente `PlansSection` autocontido, teste MF9 completo para planos Pro/Família e handoff reforçado para `BK-MF9-02`/`BK-MF9-03`. |

### Findings atuais

| ID | Severidade | Estado | Evidência pós-correção | Impacto fechado |
| --- | --- | --- | --- | --- |
| `MF9-01-AUD-001` | PARCIAL | CORRIGIDO | `BK-MF9-01` foi normalizado para PT-PT acentuado em título, narrativa, comentários didáticos, JSDoc, mensagens visíveis, validações, critérios e changelog. | O guia volta a cumprir a regra linguística da prompt para texto pedagógico de aluno. |
| `MF9-01-AUD-002` | PARCIAL | CORRIGIDO | O passo 5 passou a incluir `moneyFormatter`, `intervalLabels`, `formatPrice`, `formatQuality`, o componente completo `PlansSection` e a linha de integração com `SubscriptionPage`. | O aluno deixa de depender de variáveis implícitas para compilar a zona de planos. |
| `MF9-01-AUD-003` | PARCIAL | CORRIGIDO | O passo 6 passou a incluir imports, `collection`, `setCollectionsForTests`, `planRows`, `afterEach` e o teste `MF9 publica planos Pro/Família com entitlements`. | A suite ensinada no BK fica autocontida para o contexto inicial de `BK-MF9-01`. |

### Evidência de alinhamento canónico

- `README.md` confirma MF9 como escopo de planos Pro/Família, partilha familiar real e qualidade por plano.
- `docs/RF.md` define `RF61` como planos Pro/Família e entitlements, dependente de `RF35` e `RF38`; também preserva que Pro/Família devem expor entitlements sem quebrar os códigos `faithflix-monthly` e `faithflix-yearly`.
- `docs/RNF.md` mantém `RNF40` como contrato ativo de localização/formato.
- `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` estão coerentes em `BK-MF9-01`, `S13`, dependências e handoff para `BK-MF9-02`.
- `BK-MF8-10` aponta corretamente `proximo_bk: BK-MF9-01`.
- `BK-MF9-02` consome `maxQuality`; `BK-MF9-03` consome `familySharing` e `maxFamilyMembers`.

### Mapa de integracao da MF

| Categoria | Resultado auditado |
| --- | --- |
| Ficheiros editados nesta execução | `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md` |
| Ficheiros a criar/editar no guia | `backend/src/modules/subscriptions/subscriptions.service.js`, `backend/src/modules/payments/payments.service.js`, `frontend/src/pages/SubscriptionPage.jsx`, `backend/tests/unit/mf9-subscriptions.test.js` |
| Exports/contratos produzidos | `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers`, `features`, planos Família |
| Imports/contratos consumidos | `BK-MF4-01` fornece planos/subscrições; `BK-MF4-02` fornece checkout simulado/trial; `RF35`, `RF38`, `RF61`, `RNF40` fundamentam o escopo |
| Dependentes | `BK-MF9-02` para qualidade por plano; `BK-MF9-03` para partilha familiar real; `BK-MF9-06` para gate S13 |
| Regras de segurança/autorização | Backend decide entitlements e checkout por plano ativo; frontend apresenta capacidades mas não decide permissões |
| Testes criados no guia | Suite `backend/tests/unit/mf9-subscriptions.test.js` com fixtures Pro/Família e assert por `code` |
| Estado técnico real_dev | Implementação existente passa testes MF9 e build frontend |

### Decisões confirmadas nesta execução

- `CANONICO`: `faithflix-monthly` e `faithflix-yearly` continuam ativos e passam a representar Pro.
- `CANONICO`: entitlements públicos devem sair do backend e alimentar qualidade/família.
- `CANONICO`: a qualidade acima do plano é bloqueada no backend nos BKs seguintes, não no frontend.
- `DERIVADO`: `faithflix-family-monthly` e `faithflix-family-yearly` são extensão mínima coerente dos códigos históricos.
- `DERIVADO`: `maxFamilyMembers: 5` é usado no guia e na implementação real como limite pedagógico operacional da Família.

### Drift documental encontrado

Não foi encontrado drift ativo entre RF/RNF, backlog, matriz, sprint, handoff MF8->MF9 e implementação real para o contrato funcional de `BK-MF9-01`.

O drift de classificação registado na reauditoria anterior foi fechado: a secção histórica continua preservada como histórico, mas o estado atual do BK alvo passa a `OK`.

### Validações executadas nesta execução

| Comando/verificacao | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibidos nos BKs MF9 | PASS: zero ocorrências. |
| Pesquisa de leakage interna nos BKs MF9 | PASS: zero ocorrências de `real_dev` e variáveis internas nos BKs. |
| Pesquisa de drift de domínio nos BKs MF9 | INFO: apenas falsos positivos de `IVA` dentro de `DERIVADO`, incluindo BKs fora do alvo. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm test -- --test-name-pattern=MF9` em `real_dev/backend` | PASS: 16 testes, 16 passed, 0 failed. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluído. |

### Riscos restantes

- Risco residual baixo: os outros BKs MF9 continuam fora do scope desta execução e não foram reescritos.
- Risco residual operacional: a evidence real de PR/defesa continua a depender da execução dos alunos no ambiente deles.
- Risco residual de relatório: a secção histórica preservada deve ser lida como histórico, não como substituto da execução atual.

### Bloqueios e TODOs restantes

- Sem blocker funcional ou de implementação real encontrado para `BK-MF9-01`.
- Sem `TODO (BLOCKER)` aberto no BK alvo.

---

## Historico preservado - contexto da execucao anterior

- Projeto: FaithFlix
- MF alvo: `MF9`
- BKs analisados: `BK-MF9-01` a `BK-MF9-06`
- Modo: `hidratar_corrigir`
- Output: `relatorio_e_resumo`
- Strict scope: sim
- Data: `2026-06-30`

## Resultado executivo historico

Foram analisados e corrigidos os 6 guias BK da MF9. Antes da correcao, todos estavam em estado `CRITICO` para uso pedagogico: tinham apenas 2 passos, usavam linguagem interna como guia generico, expunham caminhos privados de validacao nos guias dos alunos e nao traziam codigo completo suficiente para um aluno executar a implementacao sem adivinhar pecas.

Depois da correcao, os 6 BKs ficam classificados como `OK` enquanto guias pedagogicos: seguem a estrutura obrigatoria, usam caminhos publicos `backend/` e `frontend/`, contem 7 passos tecnicos por BK, incluem codigo integrado ou justificacao explicita quando o passo e documental, descrevem validacoes e negativos, e preservam a sequencia `BK-MF9-01 -> BK-MF9-06`.

## Contagem antes e depois

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 6 |
| PARCIAL | 0 | 0 |
| CRITICO | 6 | 0 |

## BKs corrigidos

| BK | Estado antes | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF9-01` | CRITICO | OK | Planos Pro/Familia, entitlements, checkout simulado, UI de planos e testes. |
| `BK-MF9-02` | CRITICO | OK | Enforcement backend de qualidade, fallback, UI bloqueada e testes de URL removida. |
| `BK-MF9-03` | CRITICO | OK | Modelo/API familiar, ownership, acesso efetivo, rotas autenticadas e negativos. |
| `BK-MF9-04` | CRITICO | OK | Cliente API frontend, estado React, convites, aceitar/recusar/remover/sair e build. |
| `BK-MF9-05` | CRITICO | OK | RGPD familiar, eliminacao de conta, metricas agregadas e revisao da pool solidaria. |
| `BK-MF9-06` | CRITICO | OK | Gate S13, regressao, evidence, negativos obrigatorios e decisao final. |

## Findings corrigidos

| ID | Severidade | Estado | Evidencia inicial | Correcao |
| --- | --- | --- | --- | --- |
| MF9-GUIAS-001 | CRITICO | CORRIGIDO | Todos os BKs tinham apenas 2 passos tecnicos e nao cumpriam o contrato de tutorial linear. | Todos os BKs passaram para 7 passos com estrutura 1 a 7 por passo. |
| MF9-GUIAS-002 | CRITICO | CORRIGIDO | Os BKs mencionavam `real_dev/` em ficheiros, comandos e texto de aluno. | Todos os caminhos publicados foram convertidos para `backend/` e `frontend/`. Pesquisa de leakage interna ficou a zero. |
| MF9-GUIAS-003 | CRITICO | CORRIGIDO | Os guias diziam "Sem codigo neste guia generico", deixando implementacao por adivinhar. | Foram adicionados blocos de codigo integrados, explicacoes, validacoes e negativos por dominio. |
| MF9-GUIAS-004 | CRITICO | CORRIGIDO | Falta de negativos objetivos para acesso familiar, qualidade, privacidade e admin. | Foram adicionados negativos por BK: plano inexistente, owner Pro, membro pago, URL 4K bloqueada, user comum em metricas. |
| MF9-GUIAS-005 | PARCIAL | CORRIGIDO | Titulos de secoes sem acentuacao e linguagem de trabalho em changelog. | Secoes principais foram normalizadas e a linguagem interna removida. |

## Decisoes tecnicas confirmadas

- Backend/API: Node.js, Express, ES Modules e MongoDB com driver oficial.
- Frontend: React + Vite + `apiClient` baseado em `fetch`.
- Sessao: cookie de sessao tratado no cliente API; guias nao ensinam tokens no browser.
- Planos Pro preservam `faithflix-monthly` e `faithflix-yearly`.
- Planos Familia usam `faithflix-family-monthly` e `faithflix-family-yearly` como extensao minima coerente.
- Qualidade por plano e imposta no backend; a UI apenas reflete `locked`.
- Partilha familiar usa `subscription_family_memberships` e acesso efetivo centralizado.
- RGPD familiar entra em exportacao, eliminacao e metricas agregadas.

## Decisoes de dominio confirmadas

- `RF61`: Pro/Familia expõem entitlements publicos.
- `RF62`: Familia usa contas reais, owner com plano Familia ativo e bloqueio de membership duplicada.
- `RF63`: Pro/trial ficam ate `1080p`; Familia pode chegar a `2160p/4K`; URLs bloqueadas nao sao expostas.
- Membros familiares recebem acesso premium derivado, mas nao contam como novas subscricoes pagas para a pool solidaria.

## Decisoes marcadas como DERIVADO

- Codigos Familia `faithflix-family-monthly` e `faithflix-family-yearly`.
- Estados de membership `pending`, `active`, `declined`, `removed` e `left`.
- UI familiar concentrada na pagina de subscricao.
- Invalidacao de memberships por eliminacao com `status: removed`.
- Gate `GO_COM_RESSALVAS` para cenarios em que a app esta funcional mas falta prova manual completa.

## Drift documental encontrado

Nao foi encontrado drift ativo entre backlog, matriz, sprints e os headers dos BKs MF9. O validador confirmou `checked_bks: 66`, `checked_guides: 66` e `errors: []`.

Nota de pesquisa estatica: a pesquisa de referencias externas devolveu `IVA` dentro da palavra `DERIVADO`. Isto e falso positivo do regex, nao drift de fiscalidade ou dominio OPSA.

## Mapa de integracao da MF

| BK | Ficheiros criados/editados no guia | Exports/contratos produzidos | Consome de BKs anteriores | Dependentes |
| --- | --- | --- | --- | --- |
| `BK-MF9-01` | `subscriptions.service.js`, `payments.service.js`, `SubscriptionPage.jsx`, `mf9-subscriptions.test.js` | `tier`, `maxQuality`, `familySharing`, `maxFamilyMembers`, planos Familia | `BK-MF4-01`, `BK-MF4-02` | `BK-MF9-02`, `BK-MF9-03` |
| `BK-MF9-02` | `subscriptions.service.js`, `playback.service.js`, `PlaybackPage.jsx`, testes MF9 | `filterQualityOptionsByEntitlements`, fallback de qualidade | `BK-MF9-01`, `BK-MF2-06` | `BK-MF9-03`, `BK-MF9-06` |
| `BK-MF9-03` | `subscriptions.service.js`, `subscriptions.controller.js`, `subscriptions.routes.js`, testes MF9 | API `/api/subscriptions/family/*`, acesso efetivo familiar | `BK-MF9-01`, `BK-MF2-01` | `BK-MF9-04`, `BK-MF9-05` |
| `BK-MF9-04` | `subscriptionsApi.js`, `SubscriptionPage.jsx` | Cliente API familiar e UI de convites | `BK-MF9-03` | `BK-MF9-05` |
| `BK-MF9-05` | `privacy.service.js`, `admin-metrics.service.js`, testes MF9 | Exportacao RGPD familiar, invalidacao, metricas agregadas | `BK-MF9-03`, `BK-MF9-04`, MF5 | `BK-MF9-06` |
| `BK-MF9-06` | `docs/evidence/MF9/GATE-S13-MF9.md`, `REGRESSAO-MF9.md` | Evidence final, negativos, decisao de gate | `BK-MF9-01..05` | Fim da MF9 |

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| Pesquisa proibidos/linguagem interna nos BKs MF9 | PASS: zero ocorrencias apos correcao do changelog. |
| Pesquisa leakage interna nos BKs MF9 | PASS: zero ocorrencias de `real_dev` e variaveis internas. |
| Pesquisa drift de dominio nos BKs MF9 | INFO: apenas falso positivo `IVA` dentro de `DERIVADO`. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `npm run build` em `real_dev/frontend` | PASS: Vite build concluido. |
| `npm test` em `real_dev/backend` dentro do sandbox | PARCIAL: MF9 passou, mas 18 testes HTTP falharam com `listen EPERM 127.0.0.1`. |
| `npm test` em `real_dev/backend` fora do sandbox | PASS: 57/57 testes passaram. |

## Riscos restantes

- Os BKs foram corrigidos como guias; nao foram alterados ficheiros de produto nesta execucao.
- `BK-MF9-06` ensina a criar evidence final MF9, mas a evidence real de gate so fica completa quando os alunos executarem os fluxos e preencherem os artefactos.
- A pesquisa de drift de dominio tem falso positivo conhecido em `DERIVADO` por conter `IVA`.

## Coerencia MF anterior -> MF9 -> fim

- MF8 termina com scope freeze e handoff para `BK-MF9-01`.
- MF9 inicia em planos/entitlements, passa por qualidade, familia, UI, privacidade/metricas e termina no gate S13.
- Nao existe MF seguinte ativa; o handoff final instrui backlog aprovado para qualquer trabalho posterior.

## Bloqueios e TODOs restantes

Sem bloqueios de correcao documental. Sem `TODO (BLOCKER)` aberto nos BKs alvo.
