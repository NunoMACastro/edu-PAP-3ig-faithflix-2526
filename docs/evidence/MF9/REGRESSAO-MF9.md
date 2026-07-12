# Regressao MF9

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: adendo media preview-only atual e regressão histórica de 2026-07-04; o full E2E MF9 não foi revalidado

Data da regressao: 2026-07-04
Raiz validada: `real_dev`
Resultado histórico: `PASS_COM_RISCOS`

> **Snapshot histórico de 2026-07-04:** os resultados abaixo foram obtidos
> antes dos guards de seed e da configuração Playwright formal da Fase 1. Não
> foram reexecutados nesta atualização documental e não provam `CP1`. Referências
> a um fornecedor MongoDB externo, `node --watch`, seed seguido implicitamente de E2E ou contagem 1/1
> descrevem apenas o ambiente daquela execução.

## Adendo Fase 4 - regressão media browser isolada (2026-07-10)

| Prova atual | Resultado | Ambiente/dados | Limite |
| --- | --- | --- | --- |
| Checksums/URLs das fixtures | `PASS` | Ficheiros canvas fMP4/HLS/DASH locais | Não valida reprodução |
| Matriz media browser | `PASS 9/9` já registado no report canónico | Build + preview `mode=test`; Chromium/Firefox/WebKit; API/media intercetadas; rede loopback | Sem backend, DB, seed, família ou full E2E |

O playback intercetado devolve exatamente uma `content.source`; options/tracks
não expõem fontes. O full E2E MF9 não foi reexecutado e continua
`NAO_REVALIDADO`. A fixture 320×180 ou a label 4K não provam resolução real,
CDN, ABR ou carga. Consequentemente: `RNF08/RNF10=NAO_PROVADO` e
`RNF23=PARCIAL_VALIDADO`.

## Procedimento atual para futura revalidação

Seed e browser são comandos separados. Exemplo local MF9:

```bash
NODE_ENV=test \
ALLOW_E2E_SEED=true \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME=faithflix_mf9_20260710t120000_e2e \
npm run seed:e2e:mf9

NODE_ENV=test \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME=faithflix_mf9_20260710t120000_e2e \
npm run e2e:mf9
```

`test:e2e` valida o ambiente, mapeia internamente `TEST_MONGODB_*` para o
backend, compila o frontend com `--mode test` e só depois arranca
`real_dev/backend start`/`real_dev/frontend preview`. Chromium/Firefox/WebKit
usam sempre `reuseExistingServer:false`. Artefactos
normais ficam em `test-results/`/`playwright-report/`. Quando este procedimento
for realmente executado, substitui `20260710t120000` por um run ID UTC novo,
mantém exatamente o mesmo ID no seed e no browser e acrescenta uma nova secção
datada; não alteres as linhas históricas abaixo para simular revalidação.

## Adendo administrativo acumulado - 2026-07-10

Este resultado não reexecuta nem reclassifica a MF9. Acrescenta apenas a prova
backend que o gate futuro deve conservar:

| Comando | Resultado atual | Cobertura | Limite |
| --- | --- | --- | --- |
| `cd real_dev/backend && node --test tests/unit/f3-admin-transactions.test.js tests/unit/mf5-validation.test.js` | `PASS 14/14` | Review/membership/user admin transacionais, sessões, `requestId`, fault injection e último admin concorrente. | Doubles locais; sem DB, HTTP ou browser. |

## Adendo Fase 3 - billing, pool e família (2026-07-10)

A regressão futura deve acrescentar negativos de chave idempotente ausente,
replay/conflito de `requestHash`, rollback de checkout/trial, dois workers no
mesmo ciclo, fecho do mês UTC anterior, exclusão cumulativa de legacy/backfill
estimado e concorrência no último lugar familiar. `maxFamilyMembers` inclui o
owner. O adapter de renovação continua `faithflix-simulated`.

Os novos unitários locais usam doubles/fault injection. Nesta atualização não
foram executados seed, E2E, migração, worker contra MongoDB ou transações num
replica set; as contagens históricas abaixo permanecem inalteradas.

## Snapshot histórico de 2026-07-04 — comandos executados

| Area | Comando/prova | Resultado | Observacoes |
| --- | --- | --- | --- |
| Backend MF9 direto | `cd real_dev/backend && node --test tests/unit/mf9-subscriptions.test.js` | `PASS` - 14/14 | Executa diretamente o ficheiro MF9, evitando falso verde por suite generica |
| Backend MF9 por padrao | `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | `PASS` - 24/24 | Inclui ficheiros sem matches e 14 testes MF9 reais |
| Backend completo | `npm --prefix real_dev/backend test` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` - 65/65 | Na sandbox falhou 47/65 por `listen EPERM 127.0.0.1`; fora da sandbox passou |
| Frontend | `npm --prefix real_dev/frontend run build` | `PASS` | Vite build concluido; 104 modulos transformados |
| Planificacao | `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| Playwright discovery | `npx playwright test --list` | `PASS` | Lista `tests/e2e/mf9-family-subscription.spec.js` |
| Seed E2E MF9 | `npm --prefix real_dev/backend run seed:e2e:mf9` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | No snapshot, a sandbox falhou por DNS externo `ECONNREFUSED`; o hostname foi redigido. |
| E2E MF9 | `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` - 1/1 | Na sandbox falhou no arranque `node --watch` com `EMFILE`; fora da sandbox passou em Chromium |
| Hardening backend | `node scripts/check-security-baseline.mjs` em `real_dev/backend` | `PASS` | `Hardening MF6: PASS` |
| Regressao frontend | `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | `PASS` | `Regressao frontend MF6: PASS` |
| Scan seguranca/drift | `rg ... real_dev/backend real_dev/frontend` | `PASS_COM_RISCOS` | Ocorrencias interpretadas como falsos positivos: redaction/validadores, README, scanner e teste negativo `stripe_real`; drift de dominio sem ocorrencias |

## Snapshot histórico — evidence funcional

| Contrato | Evidencia |
| --- | --- |
| Planos Pro/Familia e entitlements | Suite MF9 validou quatro planos ativos, Pro ate `1080p`, Familia ate `2160p`, partilha familiar e 5 lugares |
| Checkout simulado | Suite MF9 validou checkout Familia aprovado e rejeicao de plano inexistente |
| Partilha familiar | Suite MF9 validou convite, aceite, acesso efetivo por Familia e remocao; E2E validou o mesmo ciclo em UI real |
| Negativos familiares | Suite MF9 bloqueou owner sem Familia, auto-convite, email inexistente, membro pago e duplicado |
| Qualidade por plano | O snapshot declarou URL etiquetada 4K para Família e ausência dessa URL para Pro; não é prova atual de reprodução ou resolução 4K real. |
| Privacidade/metricas | Suite MF9 validou exportacao/invalidaçao familiar, metricas agregadas sem PII e pool solidaria sem inflacao por membros familiares |
| Admin guard | Suite backend completa fora da sandbox validou `GET /api/admin/metrics` com HTTP 403 para utilizador comum |

## Snapshot histórico — falhas ambientais observadas

| Comando | Ambiente | Erro | Tratamento |
| --- | --- | --- | --- |
| `npm --prefix real_dev/backend run seed:e2e:mf9` | sandbox | `querySrv ECONNREFUSED [HOST_REDACTED]` | Reexecutado fora da sandbox com sucesso |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | sandbox | `EMFILE: too many open files, watch` ao arrancar `node --watch` | Reexecutado fora da sandbox com sucesso |
| `npm --prefix real_dev/backend test` | sandbox | `listen EPERM 127.0.0.1` nos testes HTTP | Reexecutado fora da sandbox com sucesso |

## Snapshot histórico — riscos residuais

- Revisao manual multi-browser completa fica pendente para `RNF21`.
- Revisao visual mobile/desktop com capturas de `/planos` e `/ver/:id` fica pendente para `RNF22`.
- No snapshot, o negativo "E2E sem seed MF9" nao foi executado diretamente. No contrato atual, `seed:e2e:mf9` e `e2e:mf9` são deliberadamente separados; a mitigação antiga por encadeamento já não se aplica e precisa de nova prova.
