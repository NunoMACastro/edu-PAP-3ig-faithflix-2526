# Implementacao real_dev MF9 - FaithFlix

## Execucao 2026-07-04 - BK-MF9-06

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `implementar`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-06`
- Historico preservado: `BK-MF9-01`, `BK-MF9-02`, `BK-MF9-03`, `BK-MF9-04`, `BK-MF9-05`
- Resultado geral no recorte atual: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`
- Decisao de gate S13: `GO_COM_RESSALVAS`
- Raiz implementada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-06` fica implementado como gate tecnico/evidencia final da MF9. A execucao confirmou planos Pro/Familia, partilha familiar real, qualidade por plano, privacidade operacional, metricas agregadas, seed E2E, E2E Chromium, build frontend, backend completo e planificacao `66/66`.

A decisao nao foi elevada para `GO` porque faltam duas provas manuais que o proprio BK distingue dos testes automatizados: revisao multi-browser completa (`RNF21`) e revisao visual mobile/desktop com capturas (`RNF22`). Por isso, o estado correto e `GO_COM_RESSALVAS` / `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`, sem findings funcionais P0/P1.

### Escopo

#### Incluido nesta execucao

- `BK-MF9-06 - Gate MF9, regressao e evidencia final`
- Criacao de matriz de gate e regressao em `docs/evidence/MF9/`
- Validacao direta da suite backend MF9
- Regressao backend completa, build frontend e validacao da planificacao
- Execucao do seed MF9 e E2E Chromium fora da sandbox
- Pesquisa estatica obrigatoria de seguranca e drift de dominio
- Registo explicito de bloqueios ambientais da sandbox e riscos residuais

#### Fora de escopo

- Alterar guias BK, RF/RNF, matriz canonica, owners, sprints ou prompts
- Criar funcionalidades novas depois da MF9
- Rever manualmente Safari, Firefox, Edge e todos os viewports com capturas
- Inventar CDN, DRM, gateway real, IA generativa, RAG, embeddings ou vector database
- Fazer commits, push ou PR

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF9-01` | `IMPLEMENTADO` | Suite MF9 confirmou planos Pro/Familia, entitlements e checkout simulado |
| `BK-MF9-02` | `IMPLEMENTADO` | Suite MF9 e E2E confirmaram qualidade limitada pelo backend |
| `BK-MF9-03` | `IMPLEMENTADO` | Suite MF9 e E2E confirmaram convite, aceite, acesso familiar e remocao |
| `BK-MF9-04` | `IMPLEMENTADO` | E2E Chromium confirmou UI real de planos/familia/player |
| `BK-MF9-05` | `IMPLEMENTADO` | Suite MF9 confirmou export/delete account, metricas agregadas e pool sem inflacao familiar |
| `BK-MF9-06` | `IMPLEMENTADO_SEM_VALIDACAO_TOTAL` | Gate, regressao e evidence criados; falta revisao manual multi-browser/mobile completa |

### Rastreabilidade

| BK | RF/RNF | Contrato | Ficheiros/evidencia |
| --- | --- | --- | --- |
| `BK-MF9-06` | `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38`, `RNF40` | Fechar MF9 com prova backend, frontend, E2E, negativos obrigatorios, planificacao e decisao S13 | `docs/evidence/MF9/GATE-S13-MF9.md`, `docs/evidence/MF9/REGRESSAO-MF9.md`, `real_dev/backend/tests/unit/mf9-subscriptions.test.js`, `real_dev/backend/scripts/seed-mf9-e2e.js`, `tests/e2e/mf9-family-subscription.spec.js`, `playwright.config.js` |

### Contratos consumidos

- `BK-MF9-01`: planos Pro/Familia, `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers` e checkout simulado.
- `BK-MF9-02`: `filterQualityOptionsByEntitlements(...)`, fallback de qualidade e remocao de URLs bloqueadas.
- `BK-MF9-03`: API familiar, memberships `pending`/`active`/`removed`/`left`, bloqueios de owner/membro e acesso efetivo familiar.
- `BK-MF9-04`: UI de subscricao/familia ligada a API real, com cookies de sessao e estados de sucesso/erro.
- `BK-MF9-05`: exportacao RGPD, eliminacao de conta, metricas agregadas e pool solidaria sem contar memberships como receita.
- `MF8`: scope freeze preservado; o gate valida MF9 sem expandir para funcionalidades futuras.

### Contratos entregues

- `docs/evidence/MF9/GATE-S13-MF9.md` regista matriz RF/RNF, negativos obrigatorios, decisao S13 e riscos aceites.
- `docs/evidence/MF9/REGRESSAO-MF9.md` regista comandos executados, resultados, falhas ambientais e evidencia funcional.
- O seed MF9 foi confirmado contra MongoDB fora da sandbox e cria fixtures isoladas `owner/member/pro/content`.
- O E2E MF9 foi confirmado em Chromium fora da sandbox e valida owner -> membro -> 4K -> Pro bloqueado -> remocao.
- A decisao final fica em `GO_COM_RESSALVAS`, com proximas acoes objetivas para trocar para `GO`.

### Alteracoes efetuadas

| Ficheiro | Alteracao |
| --- | --- |
| `docs/evidence/MF9/GATE-S13-MF9.md` | Criada matriz de gate S13, negativos obrigatorios, decisao `GO_COM_RESSALVAS` e riscos residuais |
| `docs/evidence/MF9/REGRESSAO-MF9.md` | Criado registo de comandos, resultados, falhas ambientais e evidencia funcional |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md` | Relatorio acumulado atualizado para incluir `BK-MF9-06` |

Nota: `real_dev/` esta ignorado por `.gitignore`; isto e esperado neste checkout e nao e finding.

### Evidencia tecnica observada

| Area | Evidencia |
| --- | --- |
| Seed E2E | `real_dev/backend/scripts/seed-mf9-e2e.js:18` a `:28` define fixtures MF9 fixas; `:80` a `:131` remove apenas dados de fixture; `:133` a `:203` cria contas, subscricoes e conteudo 1080p/4K |
| Testes de planos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:355` a `:427` valida planos Pro/Familia e checkout inexistente |
| Testes de familia | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:430` a `:670` valida convite, aceite, remocao, owner sem Familia, membro pago, duplicado e aceite indevido |
| Testes de qualidade | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:672` a `:784` valida bloqueio de URL 4K para Pro e 4K permitido para Familia |
| Testes de privacidade/metricas | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:846` a `:1031` valida RGPD familiar, metricas sem PII e pool sem inflacao familiar |
| E2E | `tests/e2e/mf9-family-subscription.spec.js:55` a `:151` valida o fluxo real em browser Chromium |
| Playwright | `playwright.config.js` arranca `real_dev/backend` e `real_dev/frontend` para testar a app real da raiz de implementacao |
| UI PT-PT/formato europeu | `real_dev/frontend/src/pages/SubscriptionPage.jsx:11` a `:52` usa `Intl.NumberFormat("pt-PT")` e `toLocaleDateString("pt-PT")`; `:220` a `:368` mostra planos/familia em PT-PT |
| Player | `real_dev/frontend/src/pages/PlaybackPage.jsx:276` a `:299` mostra seletor de qualidade e `video` real com `data-testid="faithflix-player"` |
| Admin guard | `real_dev/backend/src/modules/admin-metrics/admin-metrics.routes.js:12` protege metricas com `requireRole(["admin"])`; suite backend completa confirmou HTTP 403 para utilizador comum |

### Findings tratados

| ID | Severidade | Estado | Expected | Observed antes | Resolucao |
| --- | --- | --- | --- | --- | --- |
| `MF9-06-IMPL-001` | `P1` | `CORRIGIDO_SEM_VALIDACAO_TOTAL` | O gate S13 deve ter evidence final, matriz RF/RNF, regressao backend/frontend/planificacao/E2E e decisao formal | `docs/evidence/MF9/` ainda nao existia, embora seed/E2E/config e testes ja estivessem preparados | Criados `GATE-S13-MF9.md` e `REGRESSAO-MF9.md`; comandos principais passaram; decisao ficou `GO_COM_RESSALVAS` por falta de revisao manual multi-browser/mobile completa |

Nao foram encontrados findings funcionais `P0` ou `P1` no codigo MF9 depois da validacao. O P1 acima era lacuna de evidencia/gate e ficou tratado com ressalvas controladas.

### Coerencia entre MFs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | O scope freeze e preservado; MF9 acrescenta apenas planos Pro/Familia, partilha e qualidade previstos |
| `MF4/MF5 -> MF9` | `COERENTE` | Subscricoes/pagamentos simulados, privacidade e metricas foram estendidos sem quebrar contratos anteriores |
| `BK-MF9-01..05 -> BK-MF9-06` | `COERENTE` | O gate consome os contratos ja implementados e prova o fluxo acumulado |
| `MF9 -> fecho PAP` | `COERENTE_COM_RISCOS` | Funcionalidade automatizada passou; faltam provas manuais finais de browser/viewport antes de `GO` sem ressalvas |

### Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `node --test tests/unit/mf9-subscriptions.test.js` | `real_dev/backend` | `PASS`: 14/14 |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 24/24 |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: 47/65; 18 testes HTTP falharam com `listen EPERM 127.0.0.1` |
| `npm --prefix real_dev/backend test` | raiz do repo, fora da sandbox | `PASS`: 65/65 |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS`: Vite build concluido, 104 modulos transformados |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| `npx playwright test --list` | raiz do repo | `PASS`: lista `mf9-family-subscription.spec.js` |
| `npm --prefix real_dev/backend run seed:e2e:mf9` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: DNS Atlas `ECONNREFUSED` |
| `npm --prefix real_dev/backend run seed:e2e:mf9` | raiz do repo, fora da sandbox | `PASS`: seed MF9 concluida |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: `EMFILE: too many open files, watch` no arranque do servidor |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | raiz do repo, fora da sandbox | `PASS`: 1/1 em Chromium |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: falsos positivos em redaction/validadores, README, scanner e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |

### Blockers e TODOs

- Sem blocker funcional para `BK-MF9-06`.
- TODO para trocar `GO_COM_RESSALVAS` por `GO`: executar revisao manual em Chrome/Edge/Firefox/Safari.
- TODO para `RNF22`: recolher capturas mobile/desktop de `/planos` e `/ver/:id`.
- TODO operacional: se for desejado provar o negativo "E2E sem seed", executar numa base isolada ou temporaria para nao apagar fixtures validas.

### Proxima acao recomendada

Executar uma ronda manual de browser/viewport e anexar capturas ao dossier de evidence MF9. Depois disso, se nada falhar, atualizar apenas o gate tecnico de `GO_COM_RESSALVAS` para `GO`.

## Execucao 2026-07-04 - BK-MF9-05

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `implementar`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-05`
- Historico preservado: `BK-MF9-01`, `BK-MF9-02`, `BK-MF9-03`, `BK-MF9-04`
- Resultado geral no recorte atual: `IMPLEMENTADO`
- Raiz implementada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-05` fica implementado na raiz real. A auditoria previa antes das edicoes confirmou que os services ja continham a parte funcional principal: exportacao RGPD de `subscription_family_memberships`, invalidacao de memberships `pending`/`active` na eliminacao de conta, retorno operacional `familyMembershipsUpdated`, metricas admin agregadas `familyMembers`/`familyInvitationsPending` e pool solidaria baseada apenas em subscricoes pagas.

Esta execucao fechou a lacuna de prova automatizada: a suite MF9 passou a validar diretamente metricas familiares agregadas sem PII e a confirmar que memberships familiares nao inflam a receita da pool solidaria. Nao foram criados endpoints, regras de negocio novas, dependencias novas, clientes paralelos, UI nova, gateways reais, CDN, DRM, RAG, embeddings ou IA generativa.

### Escopo

#### Incluido nesta execucao

- `BK-MF9-05 - Privacidade, operacao e metricas com familia`
- Confirmacao de exportacao RGPD com `sections.subscription_family_memberships`
- Confirmacao de eliminacao de conta com invalidacao familiar e `familyMembershipsUpdated`
- Confirmacao de metricas admin agregadas sem emails, nomes ou ids pessoais de membros
- Confirmacao de pool solidaria baseada em `subscriptions`, sem contar memberships familiares como receita paga
- Reforco de testes unitarios MF9 para metricas familiares e pool solidaria

#### Fora de escopo

- Auditoria externa ou relatorio legal avancado
- Retencao legal avancada
- Novo painel detalhado de familias por admin
- Alteracoes a UI de gestao familiar criada em `BK-MF9-04`
- Alteracoes ao modelo base de convites criado em `BK-MF9-03`
- Gate final S13 e evidencia formal completa; pertencem a `BK-MF9-06`
- Alteracoes em guias BK, documentos canonicos ou prompts

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF9-01` | `IMPLEMENTADO` | Historico preservado: planos Pro/Familia e entitlements publicos validados |
| `BK-MF9-02` | `IMPLEMENTADO` | Historico preservado: filtro de qualidade por entitlement e playback seguro validados |
| `BK-MF9-03` | `IMPLEMENTADO` | Historico preservado: API familiar, memberships e acesso efetivo familiar validados |
| `BK-MF9-04` | `IMPLEMENTADO` | Historico preservado: UI familiar ligada a API real e estados visiveis validados |
| `BK-MF9-05` | `IMPLEMENTADO` | Privacidade, eliminacao, metricas agregadas e pool solidaria validadas por services e testes MF9 24/24 |

### Rastreabilidade

| BK | RF/RNF | Contrato | Ficheiros |
| --- | --- | --- | --- |
| `BK-MF9-05` | `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30` | Exportacao RGPD inclui memberships onde o utilizador e owner ou membro; eliminacao fecha convites/partilhas abertas; metricas admin devolvem apenas contagens familiares agregadas; pool solidaria continua a nascer de subscricoes pagas | `real_dev/backend/src/modules/privacy/privacy.service.js`, `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js`, `real_dev/backend/src/modules/charities/pool-distribution.service.js`, `real_dev/backend/tests/unit/mf9-subscriptions.test.js` |

### Contratos consumidos

- `BK-MF9-03`: colecao `subscription_family_memberships`, estados `pending`, `active`, `declined`, `removed` e `left`, owner/membro por sessao e acesso familiar efetivo.
- `BK-MF9-04`: UI cria/aceita/remove memberships observaveis que entram no ciclo de privacidade e metricas.
- `BK-MF5-01`: `buildUserDataExport(userId)` como ponto unico de exportacao RGPD autenticada.
- `BK-MF5-02`: `deleteMyAccount(userId, input)` com confirmacao forte e limpeza controlada.
- `BK-MF5-05`: `getAdminMetrics(query)` com metricas agregadas e range validado.
- `MF4`: distribuicao da pool solidaria por subscricoes pagas e `totalPoolCents`.

### Contratos entregues

- `buildUserDataExport(...)` inclui `sections.subscription_family_memberships` usando filtro por `ownerUserId` ou `memberUserId`.
- `deleteMyAccount(...)` invalida memberships `pending` e `active` com `status: "removed"` e `removedReason: "account_deleted"`.
- O resultado de eliminacao devolve `familyMembershipsUpdated` para evidence operacional.
- `getAdminMetrics(...)` preserva `generatedAt`, `range`, `users`, `catalog`, `privacy`, `notifications` e `solidarity`.
- `getAdminMetrics(...)` acrescenta `subscriptions.familyMembers` e `subscriptions.familyInvitationsPending` como contagens agregadas.
- A resposta de metricas nao devolve `invitedEmail`, `ownerUserId`, `memberUserId`, nomes ou emails de membros familiares.
- `runMonthlyDistribution(...)` continua a consultar `subscriptions` ativas e nao consulta `subscription_family_memberships` para calcular receita.
- `BK-MF9-06` pode usar estes contratos no gate final S13.

### Alteracoes efetuadas

| Ficheiro | Alteracao |
| --- | --- |
| `real_dev/backend/tests/unit/mf9-subscriptions.test.js` | Importados `getAdminMetrics(...)` e `runMonthlyDistribution(...)`; fake Mongo da suite passou a suportar `$exists` e `aggregate(...)`; adicionados testes de metricas familiares sem PII e pool solidaria sem inflacao por memberships |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md` | Relatorio acumulado atualizado para incluir `BK-MF9-05` |

Nota: `real_dev/` esta ignorado por `.gitignore`; isto e esperado neste checkout e nao e finding.

### Evidencia tecnica observada

| Area | Evidencia |
| --- | --- |
| Exportacao familiar | `real_dev/backend/src/modules/privacy/privacy.service.js:140` a `:178` consulta `subscription_family_memberships` por `$or` em `ownerUserId`/`memberUserId` e adiciona a secao ao export RGPD |
| Eliminacao familiar | `real_dev/backend/src/modules/privacy/privacy.service.js:261` a `:339` invalida memberships `pending`/`active`, grava `removedReason: "account_deleted"` e devolve `familyMembershipsUpdated` |
| Metricas agregadas | `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js:47` a `:113` preserva metricas MF5 e acrescenta contagens familiares agregadas |
| Pool solidaria | `real_dev/backend/src/modules/charities/pool-distribution.service.js:113` a `:126` calcula receita apenas a partir de `subscriptions` ativas e planos pagos |
| Teste export/delete | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:846` a `:884` prova exportacao de membership e invalidacao na eliminacao |
| Teste metricas | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:887` a `:972` prova contagens familiares e ausencia de PII na resposta de metricas |
| Teste pool | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:975` a `:1031` prova que dois membros familiares nao multiplicam `totalPoolCents` |

### Findings tratados

| ID | Severidade | Estado | Expected | Observed antes | Resolucao |
| --- | --- | --- | --- | --- | --- |
| `MF9-05-IMPL-001` | `P2` | `CORRIGIDO` | A suite MF9 deve provar privacidade, metricas agregadas e que a pool nao conta memberships como receita paga | Exportacao/eliminacao ja tinham prova MF9, mas metricas familiares e pool sem inflacao familiar nao tinham prova automatizada direta no recorte MF9 | Adicionados testes unitarios MF9 para `getAdminMetrics(...)` e `runMonthlyDistribution(...)`; suite MF9 validada com 24/24 |

Nao foram encontrados findings `P0` ou `P1` no recorte atual.

### Coerencia entre MFs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | A implementacao respeita o scope freeze e acrescenta apenas contratos de MF9 |
| `MF5 -> MF9` | `COERENTE` | Exportacao, eliminacao e metricas preservam os contratos de privacidade/operacao existentes e apenas adicionam a dimensao familiar |
| `BK-MF9-03 -> BK-MF9-05` | `COERENTE` | O ciclo RGPD usa a colecao historica de memberships e os estados criados pela API familiar |
| `BK-MF9-04 -> BK-MF9-05` | `COERENTE` | As memberships geridas pela UI entram nos fluxos de exportacao, eliminacao e metricas |
| `BK-MF9-05 -> BK-MF9-06` | `COERENTE_COM_RISCOS` | Os contratos tecnicos estao provados; o gate final ainda deve recolher evidence HTTP/browser/manual conforme o BK seguinte |

### Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 24/24 |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: 47/65 passaram; 18 testes HTTP falharam com `listen EPERM 127.0.0.1` |
| `npm --prefix real_dev/backend test` | raiz do repo, fora do sandbox | `PASS`: 65/65 |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS`: Vite build concluido, 104 modulos transformados |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: matches interpretados como falsos positivos em README/scanner, validadores de integracao, logger/redaction, filtro de exportacao e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| `git diff --check` | raiz do repo | `PASS` |

### Blockers e TODOs

- Sem blocker funcional para `BK-MF9-05`.
- A evidencia HTTP/browser/manual de `GET /api/privacy/export`, `DELETE /api/privacy/account` e `GET /api/admin/metrics` deve ser recolhida no `BK-MF9-06`, juntamente com o gate final S13.
- A falha `listen EPERM` ocorreu apenas no sandbox; a suite backend completa passou fora do sandbox.

### Proxima acao recomendada

Avancar para `BK-MF9-06`, usando como inputs a suite MF9 24/24, a suite backend 65/65 fora do sandbox, o build frontend e os contratos de privacidade/metricas/pool fechados neste BK.

## Execucao 2026-07-04 - BK-MF9-04

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `implementar`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-04`
- Historico preservado: `BK-MF9-01`, `BK-MF9-02`, `BK-MF9-03`
- Resultado geral no recorte atual: `IMPLEMENTADO`
- Raiz implementada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-04` fica implementado na raiz real. A pagina de subscricao ja consumia os contratos familiares de `BK-MF9-03`: cliente API com metodos `/api/subscriptions/family/*`, estado familiar no carregamento da pagina, formulario de convite, lista de membros, convites pendentes, aceite, recusa, remocao e saida da Familia.

Esta execucao fechou a lacuna funcional encontrada contra o guia: quando a API rejeitava um convite familiar, o campo de email era limpo mesmo que o BK exigisse preservar o valor para correcao. A pagina passou a limpar o campo apenas quando a mutation termina com sucesso e continua a mostrar erro visivel em portugues de Portugal quando a API devolve falha.

Nao foram introduzidas dependencias novas, clientes HTTP paralelos, regras de ownership no frontend, endpoints novos, gateways reais, envio externo de email, CDN, DRM, RAG, embeddings ou IA generativa.

### Escopo

#### Incluido nesta execucao

- `BK-MF9-04 - UI de gestao familiar e convites`
- Confirmacao de `subscriptionsApi` para planos, subscricao propria e endpoints familiares
- Confirmacao da pagina `SubscriptionPage.jsx` com planos, trial, checkout simulado e estado familiar
- Correcao do fluxo de erro do convite familiar para preservar o email quando a API rejeita a operacao
- Validacao de build frontend, suite backend MF9, suite backend completa, hardening, regressao frontend e planificacao

#### Fora de escopo

- Painel admin de familias
- Envio externo de email
- Exportacao RGPD, eliminacao de conta e metricas familiares; pertencem a `BK-MF9-05`
- Gate final S13; pertence a `BK-MF9-06`
- Alteracoes em guias BK, documentos canonicos ou prompts
- Redesign visual completo da aplicacao

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF9-01` | `IMPLEMENTADO` | Historico preservado: planos Pro/Familia e entitlements publicos validados |
| `BK-MF9-02` | `IMPLEMENTADO` | Historico preservado: filtro de qualidade por entitlement e playback seguro validados |
| `BK-MF9-03` | `IMPLEMENTADO` | Historico preservado: API familiar autenticada, memberships e acesso efetivo familiar validados |
| `BK-MF9-04` | `IMPLEMENTADO` | UI familiar ligada a API real, mensagens/estados visiveis e build frontend validado |

### Rastreabilidade

| BK | RF/RNF | Contrato | Ficheiros |
| --- | --- | --- | --- |
| `BK-MF9-04` | `RF62`, `RNF01`, `RNF05`, `RNF38`, `RNF40` | Utilizador gere Familia pela pagina de subscricao, sem scripts nem ownership vindo do browser; erros e sucessos aparecem em PT-PT; datas/precos usam formatos europeus | `real_dev/frontend/src/services/api/subscriptionsApi.js`, `real_dev/frontend/src/pages/SubscriptionPage.jsx`, `real_dev/frontend/src/services/api/apiClient.js`, `real_dev/frontend/src/services/api/apiErrors.js`, `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js` |

### Contratos consumidos

- `BK-MF9-03`: `GET /api/subscriptions/family`, `POST /api/subscriptions/family/invitations`, `POST /api/subscriptions/family/invitations/:id/accept`, `POST /api/subscriptions/family/invitations/:id/decline`, `DELETE /api/subscriptions/family/members/:memberId` e `POST /api/subscriptions/family/leave`.
- `BK-MF9-01`: planos Pro/Familia com `tier`, `maxQuality`, `familySharing` e `maxFamilyMembers`.
- `BK-MF4-02`: checkout/trial simulados ja expostos por `paymentsApi`.
- `MF1`: `apiClient` central com `credentials: "include"` e erros normalizados.
- `MF8`: scope freeze preservado; MF9 acrescenta apenas a extensao familiar planeada.

### Contratos entregues

- `subscriptionsApi` expoe metodos familiares e reutiliza o cliente API central.
- `SubscriptionPage.jsx` mostra planos, subscricao atual, trial, checkout simulado e estado familiar no mesmo fluxo.
- Owner com plano Familia ve lugares usados, formulario de convite e membros.
- Convidado ve convites pendentes e consegue aceitar ou recusar.
- Membro ativo ve a origem familiar e consegue sair da partilha.
- Apos cada mutation, a pagina recarrega o estado canonico do backend.
- Erros da API passam por `toUserMessage(...)` e ficam visiveis sem ecras em branco.
- O campo de email do convite fica preservado em erro e e limpo apenas em sucesso.
- `BK-MF9-05` pode usar memberships criadas pela UI para validar exportacao RGPD, eliminacao e metricas agregadas.

### Alteracoes efetuadas

| Ficheiro | Alteracao |
| --- | --- |
| `real_dev/frontend/src/pages/SubscriptionPage.jsx` | `runOperation(...)` passou a devolver sucesso/falha; `handleInvite(...)` limpa `inviteEmail` apenas quando o convite e criado com sucesso |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md` | Relatorio acumulado atualizado para incluir `BK-MF9-04` |

Nota: `real_dev/` esta ignorado por `.gitignore`; isto e esperado neste checkout e nao e finding.

### Evidencia tecnica observada

| Area | Evidencia |
| --- | --- |
| Cliente API | `real_dev/frontend/src/services/api/subscriptionsApi.js` cobre `listPlans`, `getMine`, `cancelRenewal`, `getFamily`, `inviteFamilyMember`, `acceptFamilyInvitation`, `declineFamilyInvitation`, `removeFamilyMember` e `leaveFamily` |
| Sessao segura | `real_dev/frontend/src/services/api/apiClient.js` usa `credentials: "include"` e nao guarda tokens em `localStorage`/`sessionStorage` |
| Tratamento de erro | `real_dev/frontend/src/services/api/apiErrors.js` devolve mensagens seguras em PT-PT para `401`, `403`, `404`, `5xx` e falhas de rede |
| Pagina | `real_dev/frontend/src/pages/SubscriptionPage.jsx` renderiza loading, erro, sucesso, vazio, planos, owner familiar, convites pendentes e membership ativa |
| Correcao do convite | `runOperation(...)` devolve `true` em sucesso e `false` em erro; `handleInvite(...)` preserva o email quando a API rejeita o convite |
| Backend consumido | `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js` protege rotas `/family/*` com `requireAuth` e mantem `/plans` publico |
| Mockup | `mockup/src/app/pages/PlanosPage.tsx` e specs visuais foram usados apenas como referencia de linguagem/hierarquia de planos; sem criar regra tecnica nova |

### Findings tratados

| ID | Severidade | Estado | Expected | Observed antes | Resolucao |
| --- | --- | --- | --- | --- | --- |
| `MF9-04-IMPL-001` | `P2` | `CORRIGIDO` | Em erro de convite, a UI deve mostrar mensagem e preservar o email para correcao | `handleInvite(...)` limpava `inviteEmail` sempre depois de `runOperation(...)`, mesmo quando a API rejeitava owner sem Familia, email inexistente ou convite duplicado | `runOperation(...)` passou a devolver boolean; `handleInvite(...)` limpa o campo apenas quando `created === true`; build frontend validado |

Nao foram encontrados findings `P0` ou `P1` no recorte atual.

### Coerencia entre MFs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | A implementacao respeita o scope freeze e acrescenta apenas contratos de MF9 |
| `MF1 -> MF9` | `COERENTE` | A UI usa `apiClient` central com cookies de sessao e tratamento de erro comum |
| `BK-MF9-03 -> BK-MF9-04` | `COERENTE` | A pagina consome API familiar real sem enviar `ownerUserId` ou decidir permissao no browser |
| `BK-MF9-04 -> BK-MF9-05` | `COERENTE` | A UI cria/aceita/remove memberships observaveis para os fluxos de privacidade, operacao e metricas do BK seguinte |

### Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS`: Vite build concluido, 104 modulos transformados |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 22/22 |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: matches interpretados como falsos positivos em scanner, logger/redaction, validadores e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: 45/63 passaram; 18 testes HTTP falharam com `listen EPERM 127.0.0.1` |
| `npm --prefix real_dev/backend test` | raiz do repo, fora do sandbox | `PASS`: 63/63 |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| `git diff --check` | raiz do repo | `PASS` |

### Blockers e TODOs

- Sem blocker funcional para `BK-MF9-04`.
- A prova manual/browser dos fluxos owner/convidado/membro continua recomendada para evidence de defesa, mas a implementacao e o build estao fechados no recorte atual.
- `BK-MF9-05` deve validar exportacao RGPD, eliminacao de conta e metricas agregadas usando as memberships geridas por esta UI.

### Proxima acao recomendada

Avancar para `BK-MF9-05`, mantendo a colecao `subscription_family_memberships` e os estados gerados pela UI como fonte para privacidade, operacao e metricas agregadas.

## Execucao 2026-07-04 - BK-MF9-03

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `implementar`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-03`
- Historico preservado: `BK-MF9-01`, `BK-MF9-02`
- Resultado geral no recorte atual: `IMPLEMENTADO`
- Raiz implementada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-03` fica fechado na implementacao real. A API familiar, a colecao `subscription_family_memberships`, o overview familiar, os convites, a aceitacao, a recusa, a remocao, a saida e o acesso efetivo por familia ja estavam materialmente presentes no service/rotas reais. Esta execucao confirmou o contrato contra o guia e fechou a principal lacuna de prova: a suite MF9 passou a cobrir overview, convites pendentes, membership ativa, owner sem Familia, email inexistente, auto-convite, membro pago, duplicado, aceite por outro utilizador, recusa, saida e perda de acesso quando o owner nao mantem plano Familia.

Nao foram introduzidas dependencias novas, endpoints paralelos, gateways reais, envio externo de email, CDN, DRM, RAG, embeddings ou IA generativa.

### Escopo

#### Incluido nesta execucao

- `BK-MF9-03 - Modelo e API de partilha familiar`
- Verificacao de `GET /api/subscriptions/family`
- Verificacao de `POST /api/subscriptions/family/invitations`
- Verificacao de `POST /api/subscriptions/family/invitations/:id/accept`
- Verificacao de `POST /api/subscriptions/family/invitations/:id/decline`
- Verificacao de `DELETE /api/subscriptions/family/members/:memberId`
- Verificacao de `POST /api/subscriptions/family/leave`
- Confirmacao de `getEffectiveSubscriptionAccess(...)` com origem `own`, `family` ou `none`
- Reforco dos testes unitarios MF9 para fluxo positivo e negativos principais de `RF62`

#### Fora de escopo

- UI de gestao familiar; pertence a `BK-MF9-04`
- Exportacao RGPD, eliminacao de conta e metricas familiares; pertencem a `BK-MF9-05`
- Gate final S13; pertence a `BK-MF9-06`
- Alteracoes em guias BK, documentos canonicos ou prompts
- Envio externo de email ou links publicos de convite

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF9-01` | `IMPLEMENTADO` | Historico anterior: planos Pro/Familia e entitlements publicos validados |
| `BK-MF9-02` | `IMPLEMENTADO` | Historico anterior: filtro de qualidade por entitlement e playback seguro validados |
| `BK-MF9-03` | `IMPLEMENTADO` | API familiar autenticada, membership historica, acesso efetivo familiar e testes MF9 22/22 |

### Rastreabilidade

| BK | RF/RNF | Contrato | Ficheiros |
| --- | --- | --- | --- |
| `BK-MF9-03` | `RF62`, `RNF13`, `RNF15`, `RNF16`, `RNF19` | Partilha familiar real entre contas existentes, owner por sessao, membro por convite, sem `ownerUserId` arbitrario no body, sem membership duplicada aberta e acesso premium derivado apenas enquanto o owner mantem Familia ativo | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`, `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js`, `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js`, `real_dev/backend/src/modules/notifications/notifications.service.js`, `real_dev/backend/tests/unit/mf9-subscriptions.test.js` |

### Contratos consumidos

- `BK-MF2-01`: sessao autenticada e `requireAuth` como autoridade de utilizador.
- `BK-MF9-01`: `tier`, `familySharing`, `maxFamilyMembers`, `maxQuality` e `qualityRank` dos planos Familia.
- `BK-MF9-02`: `getEffectiveSubscriptionAccess(...)` como fonte unica para playback e gate premium.
- `MF8`: scope freeze preservado; MF9 continua como extensao posterior sem reabrir o fecho.

### Contratos entregues

- `subscription_family_memberships` com estados `pending`, `active`, `declined`, `removed` e `left`.
- Indice unico parcial por `memberUserId` para impedir duas memberships abertas (`pending` ou `active`) no mesmo membro.
- `GET /api/subscriptions/family` devolve `ownedFamily`, `pendingInvitations` e `activeMembership`.
- Convites usam email de conta existente, mas o owner vem sempre de `req.user.id`.
- Aceitacao, recusa, remocao e saida filtram por utilizador autenticado e estado esperado.
- Membership `pending` nao da acesso premium.
- Membership `active` da acesso premium apenas enquanto o owner tem plano Familia ativo.
- `BK-MF9-04` pode consumir a API familiar sem inventar autorizacao no frontend.
- `BK-MF9-05` pode reutilizar a colecao historica para privacidade, eliminacao e metricas agregadas.

### Alteracoes efetuadas

| Ficheiro | Alteracao |
| --- | --- |
| `real_dev/backend/tests/unit/mf9-subscriptions.test.js` | Reforcados testes de overview, convites, aceite, recusa, saida, owner sem Familia, email inexistente, auto-convite, membro pago, duplicado, aceite por outro utilizador e owner sem Familia ativo |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md` | Relatorio acumulado atualizado para incluir `BK-MF9-03` |

Nota: `real_dev/` esta ignorado por `.gitignore`; isto e esperado neste checkout e nao e finding.

### Evidencia tecnica observada

| Area | Evidencia |
| --- | --- |
| Indices e modelo | `ensureSubscriptionIndexes(...)` cria indices para `subscription_family_memberships`, incluindo unico parcial para estados abertos |
| Rotas | `subscriptions.routes.js` protege todas as rotas `/family/*` com `requireAuth` |
| Ownership | Controllers usam `req.user.id`; nenhum endpoint familiar aceita `ownerUserId` como autoridade vinda do body |
| Convites | `inviteFamilyMember(...)` valida email, conta existente, auto-convite, plano Familia ativo, limite de lugares, membro pago e duplicado |
| Ciclo de vida | `acceptFamilyInvitation(...)`, `declineFamilyInvitation(...)`, `removeFamilyMember(...)` e `leaveFamily(...)` alteram `status` sem apagar historico |
| Acesso efetivo | `getEffectiveSubscriptionAccess(...)` devolve `own`, `family` ou `none`; `hasActiveSubscriptionAccess(...)` consome esse resultado |
| Notificacoes internas | `createNotification(...)` suporta tipos familiares fechados para convite, aceite e remocao |
| Testes | Suite MF9 cobre fluxo positivo, negativos de seguranca e perda de acesso derivado |

### Findings tratados

| ID | Severidade | Estado | Expected | Observed antes | Resolucao |
| --- | --- | --- | --- | --- | --- |
| `MF9-03-IMPL-001` | `P2` | `CORRIGIDO` | Testes provam fluxo familiar completo e negativos principais do guia | A implementacao ja existia, mas a suite MF9 nao provava todos os negativos centrais de `BK-MF9-03`, incluindo auto-convite, email inexistente, duplicado, aceite por outro utilizador, recusa, saida e owner sem Familia ativo | Testes reforcados e suite MF9 validada com 22/22 |

Nao foram encontrados findings `P0` ou `P1` no recorte atual.

### Coerencia entre MFs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | A implementacao respeita o scope freeze e acrescenta apenas contratos de MF9 |
| `MF2 -> MF9` | `COERENTE` | A API familiar usa sessao/ownership do backend; o frontend nao envia autoridade de owner |
| `BK-MF9-01 -> BK-MF9-03` | `COERENTE` | A partilha depende de `familySharing` e `maxFamilyMembers` do plano Familia |
| `BK-MF9-02 -> BK-MF9-03` | `COERENTE` | Playback continua a consumir `getEffectiveSubscriptionAccess(...)`, agora com origem familiar validada |
| `BK-MF9-03 -> BK-MF9-04` | `COERENTE` | API entrega overview e mutations para a UI de gestao familiar |
| `BK-MF9-03 -> BK-MF9-05` | `COERENTE_COM_RISCOS` | Colecao historica existe e ja e conhecida por privacidade/metricas, mas a auditoria profunda desses fluxos pertence ao BK seguinte |

### Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 22/22 |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: 18 testes HTTP falharam com `listen EPERM 127.0.0.1`; 45 passaram |
| `npm --prefix real_dev/backend test` | raiz do repo, fora do sandbox | `PASS`: 63/63 |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS` |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: ocorrencias interpretadas como falsos positivos em README, scanner, logger/redaction, validadores e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |
| `git diff --check` | raiz do repo | `PASS` |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md real_dev/backend/tests/unit/mf9-subscriptions.test.js` | raiz do repo | `PASS`: sem whitespace final |

### Blockers e TODOs

- Sem blocker funcional para `BK-MF9-03`.
- O full backend test precisa de execucao fora do sandbox quando os testes HTTP tentam abrir `127.0.0.1`; fora do sandbox passou 63/63.
- `BK-MF9-04` deve ligar a UI a estes endpoints sem criar regras paralelas no frontend.

### Proxima acao recomendada

Avancar para `BK-MF9-04`, usando `subscriptionsApi` e a pagina de subscricao para consumir `ownedFamily`, `pendingInvitations`, `activeMembership` e as mutations familiares criadas no backend.

## Resumo executivo

- Data da execucao: 2026-07-03
- Modo: `implementar`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-02`
- Historico preservado: `BK-MF9-01`
- Resultado geral no recorte atual: `IMPLEMENTADO`
- Raiz implementada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-02` fica implementado na raiz real. A implementacao backend/frontend ja continha o filtro de qualidade por entitlement, a resolucao de playback com acesso efetivo e a UI com opcoes bloqueadas desativadas. Esta execucao fechou a lacuna de validacao proporcional do BK, acrescentando provas para plano Familia com 4K permitido, conteudo nao publicado e subscricao expirada.

`BK-MF9-01` continua como contrato base fechado: os planos Pro/Familia publicam `tier`, `maxQuality`, `qualityRank`, `familySharing`, `maxFamilyMembers` e `features`, sem quebrar os codigos historicos `faithflix-monthly` e `faithflix-yearly`.

## Escopo

### Incluido nesta execucao

- `BK-MF9-02 - Qualidade de streaming por plano`
- Reutilizacao de `maxQuality` e `qualityRank` vindos de `BK-MF9-01`
- Confirmacao de `GET /api/playback/:contentId` com `qualityOptions` filtradas pelo backend
- Confirmacao de fallback para a melhor qualidade permitida quando a preferencia esta acima do plano
- Confirmacao de que plano Familia pode receber `2160p/4K` quando o conteudo tem essa opcao
- Confirmacao de negativos: URL 4K bloqueada em Pro, conteudo nao publicado e subscricao expirada
- Atualizacao de testes unitarios focados em `real_dev/backend/tests/unit/mf9-subscriptions.test.js`

### Fora de escopo

- Partilha familiar nova; pertence a `BK-MF9-03`
- UI de gestao familiar; pertence a `BK-MF9-04`
- Privacidade/metrica familiar; pertence a `BK-MF9-05`
- Gate final S13; pertence a `BK-MF9-06`
- Alteracoes em guias BK, documentos canonicos ou prompts
- Gateways reais, CDN, DRM, streaming adaptativo real, RAG, embeddings ou IA generativa

## Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF9-01` | `IMPLEMENTADO` | Historico anterior: planos Pro/Familia e entitlements publicos validados |
| `BK-MF9-02` | `IMPLEMENTADO` | Filtro backend, playback com entitlements efetivos, UI bloqueada e testes MF9 20/20 |

## Rastreabilidade

| BK | RF/RNF | Contrato | Ficheiros |
| --- | --- | --- | --- |
| `BK-MF9-02` | `RF15`, `RF63`, `RNF29` | Playback limita qualidade por entitlement, nao expoe URL acima do plano e faz fallback seguro | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`, `real_dev/backend/src/modules/playback/playback.service.js`, `real_dev/frontend/src/pages/PlaybackPage.jsx`, `real_dev/backend/tests/unit/mf9-subscriptions.test.js` |

## Contratos consumidos

- `BK-MF9-01`: `qualityRank`, `maxQuality`, `tier` e `familySharing` como fonte backend de entitlements.
- `BK-MF2-06`: `qualityOptions`, preferencias de media, controlo parental backend e fallback para `content.media.playbackUrl`.
- `BK-MF8-10`: handoff canonico da baseline congelada MF8 para a extensao MF9.

## Contratos entregues

- `filterQualityOptionsByEntitlements(options, entitlements)` devolve opcoes publicas com:
  - qualidades permitidas com `playbackUrl` preservado;
  - qualidades bloqueadas com `locked: true`;
  - remocao de `playbackUrl` e `src` quando a qualidade excede o plano.
- `getPlayback(contentId, userId)` resolve `getEffectiveSubscriptionAccess(userId)` antes de publicar playback.
- `GET /api/playback/:contentId` devolve `content.entitlements` e `content.qualityOptions` ja filtradas.
- Preferencia `2160p` em plano Pro faz fallback para `1080p` quando disponivel.
- Plano Familia pode reproduzir `2160p/4K` quando o conteudo tem URL autorizada.
- UI mostra opcoes bloqueadas no seletor de qualidade sem permitir selecao.
- `BK-MF9-03` pode alimentar o mesmo filtro com acesso efetivo familiar sem criar regra paralela no player.

## Alteracoes efetuadas

| Ficheiro | Alteracao |
| --- | --- |
| `real_dev/backend/tests/unit/mf9-subscriptions.test.js` | Acrescentados testes para plano Familia com 4K permitido, conteudo nao publicado e subscricao expirada |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md` | Relatorio acumulado atualizado para incluir `BK-MF9-02` |

Nota: `real_dev/` esta ignorado por `.gitignore`; isto e esperado neste checkout e nao e finding.

## Evidencia tecnica observada

| Area | Evidencia |
| --- | --- |
| Entitlements | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js` define `QUALITY_RANKS`, `ENTITLEMENTS` e planos Pro/Familia |
| Filtro de qualidade | `filterQualityOptionsByEntitlements(...)` remove `playbackUrl`/`src` de qualidades acima do entitlement |
| Playback | `real_dev/backend/src/modules/playback/playback.service.js` usa `getEffectiveSubscriptionAccess(...)`, filtra `qualityOptions` e escolhe fallback permitido |
| Gate premium | `real_dev/backend/src/modules/subscriptions/subscription-access.middleware.js` usa `hasActiveSubscriptionAccess(...)` antes do playback |
| UI | `real_dev/frontend/src/pages/PlaybackPage.jsx` renderiza `qualityOptions` e desativa opcoes `locked` |
| Testes | Suite MF9 cobre planos, familia, filtro, fallback, 4K autorizado, URL bloqueada, conteudo nao publicado e subscricao expirada |

## Findings tratados

| ID | Severidade | Estado | Expected | Observed antes | Resolucao |
| --- | --- | --- | --- | --- | --- |
| `MF9-02-IMPL-001` | `P2` | `CORRIGIDO` | Testes cobrem Pro, Familia, fallback, URL bloqueada e negativos principais | A suite ja cobria filtro Pro e fallback, mas faltavam provas explicitas de Familia 4K, conteudo nao publicado e subscricao expirada | Testes adicionados e suite MF9 validada com 20/20 |

Nao foram encontrados findings `P0` ou `P1` no recorte atual.

## Coerencia entre MFs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | MF9 continua como extensao posterior ao scope freeze de MF8 |
| `MF2 -> MF9` | `COERENTE` | O BK preserva `qualityOptions`, preferencias e parental de MF2 sem construir URLs no frontend |
| `BK-MF9-01 -> BK-MF9-02` | `COERENTE` | `qualityRank`/`maxQuality` sao consumidos como contrato backend de permissao |
| `BK-MF9-02 -> BK-MF9-03` | `COERENTE` | O playback consome acesso efetivo centralizado, preparado para origem familiar |

## Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 20/20 |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: 18 testes HTTP falharam com `listen EPERM 127.0.0.1`; 43 passaram |
| `npm --prefix real_dev/backend test` | raiz do repo, fora do sandbox | `PASS`: 61/61 |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS` |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: ocorrencias interpretadas como falsos positivos em README, scanner, logger/redaction, validadores e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |
| `git diff --check` | raiz do repo | `PASS` |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md real_dev/backend/tests/unit/mf9-subscriptions.test.js` | raiz do repo | `PASS`: sem whitespace final |

## Blockers e TODOs

- Sem blocker funcional para `BK-MF9-02`.
- O full backend test precisa de execucao fora do sandbox quando os testes HTTP tentam abrir `127.0.0.1`; dentro do sandbox fica bloqueado por `listen EPERM`, nao por regressao de codigo.

## Proxima acao recomendada

Avancar para `BK-MF9-03`, usando `getEffectiveSubscriptionAccess(...)` como ponto unico para acesso proprio ou familiar e mantendo o player dependente do mesmo filtro de qualidade.
