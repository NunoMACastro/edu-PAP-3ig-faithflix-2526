# Evidence BK-MF6-01 - Regressao backend

- Owner: Kaue
- Apoio: Matheus
- Data da execucao: 2026-06-22 00:09:35 WEST
- Requisito: RNF29
- Branch/entrega: entrega local sem commit, conforme `PERMITIR_COMMITS: nao`
- Raiz validada: `real_dev/backend`

## Proof

| Comando | Resultado real |
| --- | --- |
| `node --test tests/regression/mf6-backend-regression.test.js` | `PASS`: 5 testes, 5 pass, 0 fail, `duration_ms 235.486875`. |
| `npm --prefix real_dev/backend test` | `PASS` fora da sandbox: 48 testes, 48 pass, 0 fail, `duration_ms 355.840708`. Na sandbox falhou apenas por `listen EPERM: operation not permitted 127.0.0.1` nos testes HTTP/smoke. |
| `npm --prefix real_dev/backend run smoke` | `PASS` fora da sandbox: 8 testes, 8 pass, 0 fail, `duration_ms 209.678625`. Na sandbox falhou apenas por `listen EPERM: operation not permitted 127.0.0.1`. |
| `npm --prefix real_dev/frontend run build` | `PASS`: Vite build, 100 modules transformed. |
| `bash scripts/validate-planificacao.sh` | `PASS`: `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |
| `git diff --check` | `PASS`: sem erros de whitespace. |

## Cobertura

| Area RNF29 | Prova executada |
| --- | --- |
| Autenticacao | Email normalizado, password minima, email invalido e password curta rejeitados com HTTP 400. |
| Criacao de subscricao | Checkout simulado aprovado com `card_test` cria tentativa de pagamento e subscricao ativa. |
| Cancelamento de subscricao | `cancelRenewal` preserva o ciclo atual e marca `cancelAtPeriodEnd=true`. |
| Reproducao basica | Progresso e limitado a duracao real do conteudo e marca conclusao. |
| Rotacao de associacoes | Segunda distribuicao mensal comeca na associacao seguinte. |
| Handoff MF5 | `/api/admin/metrics` e `/api/admin/integrations` continuam montados e protegidos por role admin. |

## Negativos

| Cenario | Resultado observado |
| --- | --- |
| Email invalido | Erro HTTP 400. |
| Password curta | Erro HTTP 400. |
| Metodo de pagamento nao documentado | Erro de validacao por metodo invalido. |
| Progresso negativo | Erro HTTP 400. |
| Distribuicao duplicada no mesmo mes | Erro de conflito com mensagem `Distribuicao deste mes ja existe.` |
| Pedido admin anonimo | HTTP 401. |
| Pedido admin com role comum | HTTP 403. |

## Observacoes

- A suite usa base em memoria via `setDbForTests` e nao grava dados reais em MongoDB.
- Nao foram usados cartoes reais, gateways de pagamento, servicos externos de video, CDN, DRM, IA generativa, RAG, embeddings ou fornecedores externos.
- A falha inicial de `npm --prefix real_dev/backend test` e `npm --prefix real_dev/backend run smoke` dentro da sandbox foi ambiental: `listen EPERM: operation not permitted 127.0.0.1`. Os mesmos comandos passaram fora da sandbox.
