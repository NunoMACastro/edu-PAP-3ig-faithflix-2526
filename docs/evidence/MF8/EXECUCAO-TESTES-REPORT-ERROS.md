# MF8 - Execucao de testes e report de erros

## Metadados

- Projeto: FaithFlix
- Macro-fase: `MF8`
- BK: `BK-MF8-08`
- Data da execucao: 2026-06-29
- Estado final: `PASS_COM_RESSALVAS`
- Decisao: `TESTES_CRITICOS_PASSAM_COM_RESSALVAS_OPERACIONAIS`
- PR: `NAO_APLICAVEL`

## Sumario executivo

A matriz `TST-*` de `BK-MF8-03` foi executada contra a implementacao real definida para a prompt. Os falsos negativos de sandbox (`listen EPERM` e DNS bloqueado) foram repetidos fora da sandbox. A suite final ficou verde depois de correcoes focadas em fixtures/locators E2E e no seed premium MF2.

Nao ficou erro funcional aberto. As ressalvas restantes sao operacionais/documentais: runbook de rollback/deployment e documento tecnico unico.

## Correcoes feitas durante a execucao

| ID | Area | Causa | Correcao | Estado |
| --- | --- | --- | --- | --- |
| `MF8-FIX-001` | `TST-MF8-E2E-MF2` | Teste esperava textos sem acento e locator ambiguo na biblioteca. | Locators passaram a usar `role=status`, heading `Catalogo FaithFlix` com escape Unicode e heading scoped na biblioteca. | `CORRIGIDO_VALIDADO` |
| `MF8-FIX-002` | `TST-MF8-E2E-MF2` | Seed MF2 nao criava acesso premium, mas playback exige subscricao ativa. | Seed MF2 passou a criar subscricao ativa marcada como fixture. | `CORRIGIDO_VALIDADO` |
| `MF8-FIX-003` | `TST-MF8-E2E-MF4` | Teste usava emails, rotas e labels antigos face ao seed/UI atuais. | Fluxo MF4 realinhado com fixtures atuais, rotas atuais e labels PT-PT. | `CORRIGIDO_VALIDADO` |
| `MF8-FIX-004` | `TST-MF8-E2E-MF4` | Versoes iniciais do teste podiam aprovar associacoes dinamicas e poluir dados E2E. | Teste passou a rejeitar candidatura fixa; seed MF4 limpa padroes E2E dinamicos anteriores. | `CORRIGIDO_VALIDADO` |
| `MF8-FIX-005` | `TST-MF8-VISUAL-RESP` | Sweep visual final ainda nao era executavel. | Criado spec Playwright de screenshots desktop/mobile para home, catalogo e associacoes, com check de overflow horizontal. | `CORRIGIDO_VALIDADO` |

## Matriz de execucao

| TST | Comando publicavel/equivalente | Resultado final | Prova | Primeiro erro observado | Decisao |
| --- | --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | `npm --prefix backend test` | `PASS` | 51 testes, 51 pass, 0 fail fora da sandbox. | Na sandbox: `listen EPERM` em `127.0.0.1`. | `PASS_COM_NOTA_AMBIENTE` |
| `TST-MF8-BE-INT-HTTP` | `npm --prefix backend test` | `PASS` | Ciclos HTTP MF3/MF4/MF5/MF8 passaram dentro da suite de 51 testes. | Na sandbox: `listen EPERM`. | `PASS_COM_NOTA_AMBIENTE` |
| `TST-MF8-BE-SMOKE-HEALTH` | `npm --prefix backend run smoke` | `PASS` | 8 testes, 8 pass fora da sandbox. | Na sandbox: `listen EPERM`. | `PASS_COM_NOTA_AMBIENTE` |
| `TST-MF8-BE-REG-HARDENING` | `node scripts/check-security-baseline.mjs` | `PASS` | `Hardening MF6: PASS`. | Nenhum. | `PASS` |
| `TST-MF8-FE-BUILD` | `npm --prefix frontend run build` | `PASS` | Vite build com 104 modulos transformados. | Nenhum. | `PASS` |
| `TST-MF8-FE-SMOKE` | `npm --prefix frontend run smoke` | `PASS` | Smoke executou build Vite com 104 modulos transformados. | Nenhum. | `PASS` |
| `TST-MF8-FE-REG` | `node scripts/check-frontend-regression.mjs` | `PASS` | `Regressao frontend MF6: PASS`. | Nenhum. | `PASS` |
| `TST-MF8-E2E-MF2` | `npm run e2e:mf2` | `PASS` | 1 teste Playwright passou; `RNF07 catalogLoadMs=858`, `RNF08 playStartMs=2`. | Na sandbox: DNS bloqueado. Fora da sandbox antes das correcoes: drift de texto/locator e seed sem subscricao. | `PASS_APOS_CORRECAO` |
| `TST-MF8-E2E-MF4` | `npm run e2e:mf4` | `PASS` | 1 teste Playwright passou cobrindo subscricao, trial, candidatura, admin, pool, historico e notificacoes. | Na sandbox: DNS bloqueado. Fora da sandbox antes das correcoes: emails/rotas/labels antigos. | `PASS_APOS_CORRECAO` |
| `TST-MF8-MANUAL-CRITICO` | Checklist operacional sobre fluxos criticos | `PASS_COM_RESSALVAS` | Browser E2E cobre login, catalogo, playback, biblioteca, subscricao, trial, candidatura, admin, pool, historico e notificacoes. | Nao houve sessao manual exploratoria humana fora do que foi automatizado. | `PASS_COM_RESSALVAS` |
| `TST-MF8-VISUAL-RESP` | `npx playwright test tests/e2e/mf8-visual-responsiveness.spec.js` | `PASS` | 6 testes, 6 pass; screenshots desktop/mobile gerados. | Primeiro sweep capturava estados de loading; spec passou a esperar fim de carregamento antes da screenshot. | `PASS_APOS_AJUSTE` |

## Evidencia visual gerada

| Screenshot | Estado |
| --- | --- |
| `docs/evidence/MF8/screenshots/home-desktop.png` | `PASS` |
| `docs/evidence/MF8/screenshots/home-mobile.png` | `PASS` |
| `docs/evidence/MF8/screenshots/catalogo-desktop.png` | `PASS` |
| `docs/evidence/MF8/screenshots/catalogo-mobile.png` | `PASS` |
| `docs/evidence/MF8/screenshots/associacoes-desktop.png` | `PASS` |
| `docs/evidence/MF8/screenshots/associacoes-mobile.png` | `PASS` |

## Report de erros

| ID | TST | Tipo | Severidade | Primeiro erro | Correcao/decisao | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| `MF8-ERR-001` | `TST-MF8-BE-UNIT-VALIDACAO`, `TST-MF8-BE-INT-HTTP`, `TST-MF8-BE-SMOKE-HEALTH` | Ambiente | `MEDIA` | `listen EPERM` em servidor local dentro da sandbox. | Reexecutado fora da sandbox; backend e smoke passaram. | `RESOLVIDO_AMBIENTE` |
| `MF8-ERR-002` | `TST-MF8-E2E-MF2`, `TST-MF8-E2E-MF4` | Ambiente | `MEDIA` | DNS bloqueado para MongoDB externo dentro da sandbox. | Reexecutado fora da sandbox; seeds e Playwright correram. | `RESOLVIDO_AMBIENTE` |
| `MF8-ERR-003` | `TST-MF8-E2E-MF2` | Suite/fixture | `MEDIA` | Texto esperado sem acento, heading sem acento, locator ambiguo e seed sem subscricao premium. | Teste e seed corrigidos; MF2 passou. | `RESOLVIDO` |
| `MF8-ERR-004` | `TST-MF8-E2E-MF4` | Suite/fixture | `MEDIA` | Emails/rotas/labels antigos e aprovacao dinamica de dados E2E. | Teste realinhado; seed limpa padroes E2E; MF4 passou. | `RESOLVIDO` |
| `MF8-ERR-005` | `TST-MF8-VISUAL-RESP` | Evidencia | `BAIXA` | Primeiro spec tirava screenshots ainda em loading. | Spec passou a esperar `networkidle` e ausencia de `A carregar`; screenshots regenerados. | `RESOLVIDO` |

## Passos de auditoria BK-MF8-08

| Passo | pr | proof | neg | fonte | decisao |
| --- | --- | --- | --- | --- | --- |
| 1. Executar backend unit/integracao | `NAO_APLICAVEL` | 51/51 pass fora da sandbox. | Sandbox `listen EPERM` classificada como ambiente. | Output da suite backend | `PASS_COM_NOTA` |
| 2. Executar smoke backend | `NAO_APLICAVEL` | 8/8 pass fora da sandbox. | Sandbox `listen EPERM` classificada como ambiente. | Output smoke backend | `PASS_COM_NOTA` |
| 3. Executar build/smoke/regressao frontend | `NAO_APLICAVEL` | Build/smoke Vite e regressao frontend passaram. | Sem drift de outro dominio confirmado. | Output frontend | `PASS` |
| 4. Executar E2E MF2 | `NAO_APLICAVEL` | 1/1 pass; metricas RNF07/RNF08 registadas. | Falhas iniciais corrigidas em teste/fixture. | Playwright MF2 | `PASS_APOS_CORRECAO` |
| 5. Executar E2E MF4 | `NAO_APLICAVEL` | 1/1 pass. | Falhas iniciais corrigidas em teste/fixture. | Playwright MF4 | `PASS_APOS_CORRECAO` |
| 6. Executar visual responsivo | `NAO_APLICAVEL` | 6/6 pass; screenshots finais gerados. | Sem overflow horizontal no sweep. | Playwright visual | `PASS` |
| 7. Classificar erros e handoff | `NAO_APLICAVEL` | `MF8-ERR-001..005` todos resolvidos ou ambientais reexecutados. | Sem `FAIL` funcional aberto. | Este ficheiro | `PASS_COM_RESSALVAS` |

## Decisao final BK-MF8-08

`PASS_COM_RESSALVAS`. A execucao final das suites criticas passou. As falhas encontradas foram corrigidas quando eram de fixture/suite ou reclassificadas como ambiente quando eram restricoes de sandbox. Ficam como ressalvas de fecho apenas rollback/deployment formal e documento tecnico unico, ja registados em `BK-MF8-07`.
