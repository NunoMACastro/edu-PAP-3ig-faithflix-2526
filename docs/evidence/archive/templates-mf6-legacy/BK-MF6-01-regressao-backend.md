# Evidence BK-MF6-01 - Regressão backend

- `document_status`: `SUPERSEDED`
- `snapshot_date`: `2026-07-10`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: template MF6 legado arquivado com placeholders preservados; não constitui procedimento atual, execução ou evidence de regressão

> Arquivado em 2026-07-10: template duplicado com placeholders; não é evidence.

- Owner: Kaue
- Apoio: Matheus
- Data da execução: PREENCHER_COM_DATA_REAL
- Requisito: RNF29
- Branch/entrega: PREENCHER_COM_REFERENCIA_REAL

## Proof

| Comando | Resultado real |
| --- | --- |
| `node --test tests/regression/mf6-backend-regression.test.js` | PREENCHER_COM_OUTPUT_REAL |
| `npm test` | PREENCHER_COM_OUTPUT_REAL |
| `npm run smoke` | PREENCHER_COM_OUTPUT_REAL |

## Cobertura

| Área RNF29 | Prova esperada |
| --- | --- |
| Autenticação | Email normalizado, password mínima e rejeições HTTP 400 |
| Criação de subscrição | Checkout simulado aprovado cria subscrição ativa |
| Cancelamento de subscrição | `cancelRenewal` mantém o ciclo atual e marca `cancelAtPeriodEnd=true` |
| Reprodução básica | Progresso é limitado à duração e negativo é rejeitado |
| Rotação de associações | Segunda distribuição começa na associação seguinte |
| Handoff MF5 | `/api/admin/metrics` e `/api/admin/integrations` continuam montados e protegidos |

## Negativos

| Cenário | Resultado esperado |
| --- | --- |
| Email inválido | Erro HTTP 400 |
| Password curta | Erro HTTP 400 |
| Método de pagamento não documentado | Erro de validação |
| Progresso negativo | Erro HTTP 400 |
| Distribuição duplicada no mesmo mês | Erro de conflito |
| Pedido admin anónimo | HTTP 401 |
| Pedido admin com role comum | HTTP 403 |

## Observações

A suite usa base em memória e não grava dados reais. Não foram usados cartões reais, tokens externos, gateways de pagamento, serviços externos de vídeo ou IA avançada.
