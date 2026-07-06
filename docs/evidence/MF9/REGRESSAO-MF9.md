# Regressao MF9

Data da regressao: 2026-07-04
Raiz validada: `real_dev`
Resultado geral: `PASS_COM_RISCOS`

## Comandos executados

| Area | Comando/prova | Resultado | Observacoes |
| --- | --- | --- | --- |
| Backend MF9 direto | `cd real_dev/backend && node --test tests/unit/mf9-subscriptions.test.js` | `PASS` - 14/14 | Executa diretamente o ficheiro MF9, evitando falso verde por suite generica |
| Backend MF9 por padrao | `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | `PASS` - 24/24 | Inclui ficheiros sem matches e 14 testes MF9 reais |
| Backend completo | `npm --prefix real_dev/backend test` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` - 65/65 | Na sandbox falhou 47/65 por `listen EPERM 127.0.0.1`; fora da sandbox passou |
| Frontend | `npm --prefix real_dev/frontend run build` | `PASS` | Vite build concluido; 104 modulos transformados |
| Planificacao | `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| Playwright discovery | `npx playwright test --list` | `PASS` | Lista `tests/e2e/mf9-family-subscription.spec.js` |
| Seed E2E MF9 | `npm --prefix real_dev/backend run seed:e2e:mf9` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Na sandbox falhou por DNS Atlas `ECONNREFUSED`; fora da sandbox criou owner/member/pro/content |
| E2E MF9 | `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` - 1/1 | Na sandbox falhou no arranque `node --watch` com `EMFILE`; fora da sandbox passou em Chromium |
| Hardening backend | `node scripts/check-security-baseline.mjs` em `real_dev/backend` | `PASS` | `Hardening MF6: PASS` |
| Regressao frontend | `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | `PASS` | `Regressao frontend MF6: PASS` |
| Scan seguranca/drift | `rg ... real_dev/backend real_dev/frontend` | `PASS_COM_RISCOS` | Ocorrencias interpretadas como falsos positivos: redaction/validadores, README, scanner e teste negativo `stripe_real`; drift de dominio sem ocorrencias |

## Evidencia funcional

| Contrato | Evidencia |
| --- | --- |
| Planos Pro/Familia e entitlements | Suite MF9 validou quatro planos ativos, Pro ate `1080p`, Familia ate `2160p`, partilha familiar e 5 lugares |
| Checkout simulado | Suite MF9 validou checkout Familia aprovado e rejeicao de plano inexistente |
| Partilha familiar | Suite MF9 validou convite, aceite, acesso efetivo por Familia e remocao; E2E validou o mesmo ciclo em UI real |
| Negativos familiares | Suite MF9 bloqueou owner sem Familia, auto-convite, email inexistente, membro pago e duplicado |
| Qualidade por plano | Suite MF9 e E2E validaram URL 4K para Familia e ausencia de URL 4K para Pro |
| Privacidade/metricas | Suite MF9 validou exportacao/invalidaçao familiar, metricas agregadas sem PII e pool solidaria sem inflacao por membros familiares |
| Admin guard | Suite backend completa fora da sandbox validou `GET /api/admin/metrics` com HTTP 403 para utilizador comum |

## Falhas ambientais observadas

| Comando | Ambiente | Erro | Tratamento |
| --- | --- | --- | --- |
| `npm --prefix real_dev/backend run seed:e2e:mf9` | sandbox | `querySrv ECONNREFUSED _mongodb._tcp.paps.t5qfwfq.mongodb.net` | Reexecutado fora da sandbox com sucesso |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | sandbox | `EMFILE: too many open files, watch` ao arrancar `node --watch` | Reexecutado fora da sandbox com sucesso |
| `npm --prefix real_dev/backend test` | sandbox | `listen EPERM 127.0.0.1` nos testes HTTP | Reexecutado fora da sandbox com sucesso |

## Riscos residuais

- Revisao manual multi-browser completa fica pendente para `RNF21`.
- Revisao visual mobile/desktop com capturas de `/planos` e `/ver/:id` fica pendente para `RNF22`.
- O negativo "E2E sem seed MF9" nao foi executado diretamente; o risco e operacional e mitigado por script root `e2e:mf9`, que encadeia seed e Playwright.
