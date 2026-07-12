# Correcao de auditoria de implementacao - real_dev - MF2

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-23`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: execução MF2 observada naquela data; os comandos e contagens abaixo não são procedimento nem prova atuais

> **Snapshot histórico:** este report preserva a execução original. Não executar
> os comandos E2E antigos abaixo. O procedimento atual exige cumulativamente
> `NODE_ENV=test`, `ALLOW_E2E_SEED=true` no seed, `TEST_MONGODB_URI` loopback sem
> credenciais e com `replicaSet`, e `TEST_MONGODB_DB_NAME` terminada em `_e2e`.
> Seed e browser são passos separados e usam uma DB nova/exclusiva por execução.

## Resultado geral

- Estado: PARCIAL
- MF corrigida: MF2
- Auditoria base: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF2.md`
- Modo: corrigir_auditoria
- Resumo: foi corrigido e validado o P1 de recuperacao de password com um canal dev-only separado, sem alterar a resposta publica de `forgot-password`; foi alinhado o drift documental de sessao anonima em `BK-MF1-06`; o bloqueio de dependencia Playwright foi resolvido, mas o E2E MF2 continua bloqueado porque o MongoDB local nao esta disponivel em `127.0.0.1:27017`.
- Decisão observada na data: ainda não podia pedir fecho total porque faltava
  ambiente E2E. Esta frase não autoriza configurar `MONGODB_URI` nem repetir o
  comando antigo; prevalece o guard atual descrito no aviso acima.

## Findings tratados

| Severidade | BK | Finding | Estado | Ficheiros | Validacoes |
| --- | --- | --- | --- | --- | --- |
| P1 | `BK-MF2-01` | Recuperacao de password nao fecha fluxo auditavel | CORRIGIDO | `real_dev/backend/src/modules/auth/auth.service.js`, `real_dev/backend/src/modules/auth/auth.indexes.js`, `real_dev/backend/scripts/show-dev-reset-token.js`, `real_dev/backend/package.json`, `real_dev/backend/tests/unit/mf2-validation.test.js` | `node --test tests/unit/mf2-validation.test.js` PASS; `npm --prefix real_dev/backend run test` PASS fora do sandbox |
| P2 | `BK-MF2-08` | E2E principal existe mas nao foi executado nesta auditoria | BLOQUEADO_AMBIENTE | `package.json`, `playwright.config.js`, `tests/e2e/mf2-flow.spec.js` | `npm ls @playwright/test` PASS; `npm run e2e:mf2` FAIL no seed por MongoDB indisponivel |
| P2 | `MF1 -> MF2` | Drift documental entre BK-MF1-06 e sessao anonima atual | CORRIGIDO | `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md` | `bash scripts/validate-planificacao.sh` PASS; backend test PASS fora do sandbox |

## Plano de correcao

1. Corrigir `BK-MF2-01` sem expor token no endpoint publico: guardar token bruto apenas num outbox `dev-only`, desligado por defeito e proibido em `NODE_ENV=production`.
2. Criar comando local para evidence PAP: `ENABLE_DEV_RESET_TOKEN_OUTBOX=true npm run dev:reset-token -- email@exemplo.test`.
3. Atualizar teste unitario para garantir que a resposta publica continua sem `resetToken` e que o canal separado so existe quando ativado.
4. Alinhar `BK-MF1-06` com o contrato implementado de `/api/session/me`: pedido anonimo responde `200` com `user: null`.
5. Tentar validar comandos proporcionais e registar blockers ambientais do E2E sem mascarar falhas.

## Alteracoes realizadas

- `requestPasswordReset` continua a devolver apenas uma mensagem generica ao frontend.
- Foi criado um outbox `password_reset_dev_outbox`, com TTL, usado apenas quando `ENABLE_DEV_RESET_TOKEN_OUTBOX=true` e `NODE_ENV` nao e `production`.
- Foi criada a funcao `getLatestDevPasswordResetToken` para obter o token mais recente por email em contexto dev-only.
- Foi criado o script `real_dev/backend/scripts/show-dev-reset-token.js`.
- Foi acrescentado o script backend `dev:reset-token`.
- Foi acrescentado teste unitario para o canal dev-only separado.
- O guia `BK-MF1-06` foi alinhado com a implementacao atual de sessao anonima.

## Testes e comandos

| Comando | Diretoria | Resultado | Observacoes |
| --- | --- | --- | --- |
| `bash scripts/validate-planificacao.sh` | Raiz | PASS | `checked_bks: 55`, `checked_guides: 55`, sem erros. |
| `node --test tests/unit/mf2-validation.test.js` | `real_dev/backend` | PASS | 7/7 testes passaram, incluindo o novo teste do canal dev-only separado. |
| `npm --prefix real_dev/backend run test` | Raiz | FAIL no sandbox | 8/14 passaram; 6 smoke falharam com `listen EPERM: operation not permitted 127.0.0.1`, antes de validar comportamento. |
| `npm --prefix real_dev/backend run test` | Raiz | PASS fora do sandbox | 14/14 testes passaram depois de autorizar execucao fora do sandbox. |
| `npm ls @playwright/test` | Raiz | PASS | `@playwright/test@1.60.0` instalado na raiz. |
| `npm run e2e:mf2` | Raiz | FAIL/BLOQUEADO_AMBIENTE | Seed E2E falhou antes do Playwright por `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`. |

## Blockers e limitacoes

- O E2E MF2 so deve ser executado se MongoDB, Playwright e permissao de servidor local estiverem disponiveis.
- `@playwright/test` ja esta instalado na raiz.
- `npm run e2e:mf2` foi tentado fora do sandbox e ficou bloqueado no seed porque o MongoDB local recusou ligacao em `127.0.0.1:27017`.
- A suite backend abriu servidor local e passou fora do sandbox; a falha `listen EPERM` ficou classificada como restricao ambiental do sandbox.

## Risco residual

- O canal dev-only guarda temporariamente o token bruto de reset numa colecao separada. O risco e mitigado porque fica desligado por defeito, bloqueado em producao e com TTL.
- A MF2 ainda precisa de evidence E2E real para fechar `BK-MF2-08` sem reservas.

## Handoff para re-auditoria

- Handoff histórico: a reauditoria dependia de um ambiente isolado. Qualquer
  execução futura segue exclusivamente o procedimento atual com
  `TEST_MONGODB_*`, `replicaSet`, DB `_e2e` nova e seed/browser separados.
