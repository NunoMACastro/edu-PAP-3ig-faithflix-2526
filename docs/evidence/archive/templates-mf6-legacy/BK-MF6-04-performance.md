# Evidence BK-MF6-04 - Performance crítica

- `document_status`: `SUPERSEDED`
- `snapshot_date`: `2026-07-10`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: template MF6 legado arquivado com placeholders preservados; não constitui procedimento atual, execução ou evidence de performance

> Arquivado em 2026-07-10: template duplicado com placeholders; não é evidence.

- Owner: Davi
- Apoio: Mateus
- Data: PREENCHER_COM_DATA_REAL
- Requisitos: RNF09, RNF10, RNF11, RNF12
- Ambiente: PREENCHER_COM_AMBIENTE_LOCAL

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE=*** node scripts/measure-performance-baseline.mjs` | PREENCHER_COM_PASS_OU_FAIL |
| `npm run build` em `frontend` | PREENCHER_COM_PASS_OU_FAIL |

## Baseline local

| Cenário | Limite | Before | After | Estado real |
| --- | --- | ---: | ---: | --- |
| `/health` | 500ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| `/api/catalog?limit=12` | 2000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| `/api/search?q=fe&limit=12` | 2000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| `/api/recommendations/me` | 3000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |
| 20 pedidos concorrentes a `/health` - P95 | 2000ms | PREENCHER_COM_MS | PREENCHER_COM_MS | PREENCHER_COM_PASS_OU_FAIL |

## Negativos

| Cenário | Resultado esperado | Resultado real |
| --- | --- | --- |
| API desligada | Script falha | PREENCHER_COM_RESULTADO_REAL |
| Pesquisa com uma letra | HTTP 400 | PREENCHER_COM_RESULTADO_REAL |
| Limite de catálogo inválido | HTTP 400 | PREENCHER_COM_RESULTADO_REAL |
| Recomendações sem sessão | HTTP 401 | PREENCHER_COM_RESULTADO_REAL |

## Observações

- O cookie de sessão foi usado apenas como variável de ambiente local.
- O valor do cookie não foi registado neste ficheiro.
- A rajada concorrente local apoia RNF10, mas não substitui teste de carga de produção.
