# Gate S13 - MF9

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: adendos atuais da referência e gate histórico de 2026-07-04 delimitado; não fecha o gate S13 dos alunos

Data da avaliacao: 2026-07-04
Responsavel pelo gate: Kaue
Raiz validada: `real_dev`
Decisao historica: `GO_COM_RESSALVAS`

Na data do snapshot, esta evidence registou o fecho de `BK-MF9-06` sem alterar
guias canónicos. Não é uma decisão atual: além das limitações já conhecidas,
faltava revisão manual completa e a prova não foi repetida depois dos novos
guards/configuração formal.

> **Validade temporal:** este gate é um snapshot de 2026-07-04. A decisão e as
> contagens abaixo não foram revalidadas depois dos guards de seed, da separação
> `seed:e2e:mf9`/`e2e:mf9` e da configuração Playwright sobre `real_dev` com
> `start`/`preview` e `reuseExistingServer:false` obrigatório. Mantém-se como histórico,
> não como prova de `CP1` ou de execução atual.

## Adendo Fase 4 - prova media isolada e gate atual (2026-07-10)

Este adendo não altera o `GO_COM_RESSALVAS` histórico. A única prova browser
nova aplicável a media é preview-only: progressive/HLS/DASH chegaram a `canplay`
em Chromium/Firefox/WebKit (`9/9`), com fixtures canvas fMP4 320×180, checksums,
API/media intercetadas, rede apenas loopback e uma única `content.source`.
`qualityOptions`/`tracks` públicas não continham fontes.

Não houve seed, backend, MongoDB nem full E2E MF9 nesta prova; o `1/1` funcional
e as alegações 4K abaixo pertencem ao snapshot de 2026-07-04. Uma label
`2160p/4K` prova apenas autorização lógica, não resolução real. Estados atuais:
full E2E MF9 `NAO_REVALIDADO`, `RNF08=NAO_PROVADO`, `RNF10=NAO_PROVADO`,
`RNF23=PARCIAL_VALIDADO`; gate máximo local `GO_LOCAL_COM_RESSALVAS` e produção
`NO_GO_PRODUCAO`.

Para uma futura atualização do gate, executar primeiro o seed com
`NODE_ENV=test`, `ALLOW_E2E_SEED=true`, `TEST_MONGODB_URI` explícita e
loopback com `?replicaSet=<nome>` e uma DB nova por execução, por exemplo
`TEST_MONGODB_DB_NAME=faithflix_mf9_20260710t120000_e2e`; substituir o run ID
UTC do exemplo e depois executar separadamente
`npm run e2e:mf9` com as mesmas `TEST_MONGODB_*`. O harness valida/mapeia a DB
para o backend e compila o frontend com `--mode test`; não se fornecem
`MONGODB_*` manualmente. Os
artefactos normais ficam em `test-results/`/`playwright-report/`; evidence em
`docs/` exige revisão e publicação deliberada.

## Adendo administrativo acumulado - 2026-07-10

O gate continua a ser o snapshot de 2026-07-04 e não muda de decisão. Para uma
futura revalidação, executar também
`real_dev/backend/tests/unit/f3-admin-transactions.test.js`. A execução local de
2026-07-10, combinada com `mf5-validation.test.js`, passou `14/14` e cobriu
rollback de review/membership/user update, revogação de sessões, audit com
`requestId` e `409 LAST_ACTIVE_ADMIN`. A prova usa doubles e não substitui
replica set MongoDB nem E2E.

## Adendo billing, pool e família - 2026-07-10

Este adendo não altera a decisão histórica. A baseline local atual exige
`Idempotency-Key` no checkout/trial, ledger financeiro v2 e transações para
multi-writes. O worker com leases processa ciclos vencidos e o mês UTC anterior;
a renovação é apenas uma simulação determinística. A pool inclui somente
pagamentos v2 aprovados, não estimados e pertencentes ao mês, com snapshots
persistidos. O limite Família inclui o owner e mutações familiares são
transacionais/serializadas.

Não houve migração aplicada, worker ligado à DB, replica set real, gateway ou
nova execução E2E/browser. Consequentemente, este texto não converte o gate em
prova atual nem valida `RNF24`.

## Estado probatório atual

| Contrato | Estado em 2026-07-10 | Limite obrigatório |
| --- | --- | --- |
| `RF61` | `VALIDADO_LOCAL` | Planos/checkout simulados; não é gateway real. |
| `RF62` | `VALIDADO_LOCAL_SEM_E2E_ATUAL` | Doubles/fault injection; replica set e full E2E não revalidados. |
| `RF63` | `PARCIAL_VALIDADO_LOCAL` | Entitlement e zero URL nas opções; não prova reprodução ou 4K real. |
| `RNF21/RNF22` | `PARCIAL_VALIDADO` | Chrome/Edge branded e Safari real estão `NAO_EXECUTADO`; ver `MATRIZ-BROWSERS-MANUAL.md`. |
| `RNF29` | `PARCIAL_VALIDADO` | Suites locais verdes; full E2E com DB `_e2e` não revalidado. |

Esta tabela é vinculativa para o estado atual. Qualquer `PASS` abaixo pertence
exclusivamente ao snapshot histórico de 2026-07-04.

## Matriz RF/RNF - snapshot histórico de 2026-07-04

| Requisito | BK fonte | Prova positiva obrigatoria | Prova negativa obrigatoria | Resultado | Responsavel |
| --- | --- | --- | --- | --- | --- |
| RF61 | BK-MF9-01 | `GET /api/subscriptions/plans` lista Pro/Familia com entitlements | Plano inexistente rejeitado no checkout simulado | `PASS` - suite MF9 direta validou planos e checkout inexistente | Matheus |
| RF62 | BK-MF9-03/04 | Owner Familia convida membro real e membro aceita | Owner Pro bloqueado, membro pago/duplicado rejeitado e acesso removido apos remocao | `PASS` - suite MF9 e E2E Chromium validaram o ciclo owner -> membro -> remocao | Matheus/Mateus |
| RF63 | BK-MF9-02 | Membro Familia consegue selecionar 4K | Utilizador Pro ve 4K bloqueado sem URL reproduzivel | `SNAPSHOT_PASS_DECLARADO_2026-07-04` - não é prova atual de reprodução ou resolução 4K | Mateus |
| RNF21 | BK-MF9-06 | E2E Chromium passa e browser usado fica registado | Falha de browser fica registada com ambiente e impacto | `PASS_COM_RISCOS` - Chromium passou; restantes browsers ficam como revisao manual pendente | Kaue |
| RNF22 | BK-MF9-06 | Fluxo revisto em viewport mobile e desktop | Overlap ou quebra visual fica registado com captura | `PASS_COM_RISCOS` - build e E2E cobrem render principal; revisao visual mobile/desktop completa fica pendente | Kaue |
| RNF29 | BK-MF9-06 | Testes backend MF9, build frontend e E2E MF9 executados | Suite backend sem teste MF9 e recusada como falso verde | `PASS` - ficheiro MF9 executado diretamente, build passou, E2E passou fora da sandbox | Kaue |
| RNF38 | BK-MF9-06 | UI e evidence final em portugues de Portugal | Texto sem acentuacao em UI/evidence fica registado | `PASS_COM_RISCOS` - UI principal tem copy PT-PT; seed/scripts mantem algum texto ASCII tecnico nao visivel | Kaue |
| RNF40 | BK-MF9-06 | Datas e numeros visiveis seguem formato europeu | Formato fora do padrao europeu fica registado | `PASS` - UI usa `Intl.NumberFormat("pt-PT")` e `toLocaleDateString("pt-PT")` | Kaue |

## Negativos obrigatorios

| Negativo | Resultado esperado | Resultado obtido | Evidencia |
| --- | --- | --- | --- |
| Plano inexistente no checkout simulado | Erro de plano nao encontrado | `PASS` | `cd real_dev/backend && node --test tests/unit/mf9-subscriptions.test.js`, teste "checkout simulado aceita plano Familia ativo e rejeita plano inexistente" |
| Owner Pro tenta convidar membro | Bloqueio por falta de plano Familia ativo | `PASS` | Suite MF9, teste "bloqueia owner sem Familia, membro pago, duplicado, auto-convite e email inexistente" |
| Membro com subscricao paga tenta aceitar Familia | Bloqueio por subscricao paga ativa | `PASS` | Suite MF9, teste de membro pago |
| Membro duplicado tenta entrar noutra Familia | Bloqueio por partilha ativa ou pendente | `PASS` | Suite MF9, teste de duplicado |
| Utilizador Pro tenta reproduzir 4K | 4K bloqueado sem URL 4K | `SNAPSHOT_PASS_DECLARADO_2026-07-04` | Não é prova atual; o snapshot declarou a label bloqueada e `src` 1080p, sem validar media 4K real. |
| User comum tenta abrir metricas admin | HTTP 403 | `PASS` | Suite backend completa fora da sandbox: `GET /api/admin/metrics` devolveu 403 para utilizador comum |
| E2E sem seed MF9 | Teste falha antes do gate | `NAO_EXECUTADO` | O seed foi executado antes do E2E para preservar o fluxo reprodutivel; risco registado como ressalva operacional |

## Revisao RNF21/RNF22/RNF38/RNF40

| Area | Prova minima | Resultado |
| --- | --- | --- |
| Browser moderno | Chromium E2E + browser manual registado | `PASS_COM_RISCOS` - Chromium automatizado passou; Firefox/Safari/Edge pendentes |
| Mobile | `/planos` e `/ver/:id` sem overlap em largura movel | `PENDENTE_MANUAL` |
| Desktop | `/planos` e `/ver/:id` sem regressao visual evidente | `PASS_COM_RISCOS` - E2E desktop Chromium validou fluxo e elementos principais |
| Portugues de Portugal | Mensagens visiveis com acentuacao correta | `PASS_COM_RISCOS` - UI principal validada por selectors/texto; seed tecnico permanece ASCII |
| Formato europeu | Datas e numeros visiveis em formato PT/EU | `PASS` |

## Decisao final histórica de 2026-07-04

- Decisao: `GO_COM_RESSALVAS`
- Data: 2026-07-04
- Responsavel: Kaue
- Evidencia backend: `cd real_dev/backend && node --test tests/unit/mf9-subscriptions.test.js` passou com 14/14; `npm --prefix real_dev/backend test` passou fora da sandbox com 65/65.
- Evidencia frontend: `npm --prefix real_dev/frontend run build` passou, com 104 modulos transformados.
- Evidencia E2E: `npm --prefix real_dev/backend run seed:e2e:mf9` passou fora da sandbox; `npx playwright test tests/e2e/mf9-family-subscription.spec.js` passou fora da sandbox com 1/1.
- Evidencia de planificacao: `bash scripts/validate-planificacao.sh` passou com `checked_bks=66` e `checked_guides=66`.
- Riscos aceites: falta revisao manual multi-browser completa; falta revisao visual mobile/desktop com capturas; negativo "E2E sem seed" nao foi executado diretamente.
- Proxima acao: executar a matriz em `MATRIZ-BROWSERS-MANUAL.md`, revalidar
  seed/E2E numa DB `_e2e` isolada e guardar capturas revistas antes de emitir
  uma nova decisão. A decisão histórica não pode ser promovida para `GO`.
