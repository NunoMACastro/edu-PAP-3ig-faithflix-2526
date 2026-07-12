# Gate S12 - MF6 Hardening tecnico

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-22`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: decisão S12 observada em 2026-06-22; não representa o gate atual

- Data: 2026-06-22 10:44:30 WEST
- Owner do gate: Nuno
- Apoio: Matheus, Mateus, Davi, Kaue
- Branch/entrega: entrega local sem commit/PR, conforme `PERMITIR_COMMITS: nao`
- Decisao tecnica: `GO_COM_RESSALVAS`
- Justificacao da decisao: todos os comandos tecnicos essenciais têm evidence real em `PASS` e nao ha falhas criticas abertas; ficam ressalvas nao bloqueantes sobre validacao humana final do orientador, dependencia de execucao fora da sandbox para testes HTTP e limites naturais de baseline local.

> **Aviso de validade — Fase 2 (2026-07-09):** este documento é um snapshot histórico anterior à Fase 2 de 2026-07-09. Os resultados e decisões preservados abaixo não provam CP2 nem o estado atual da aplicação.

## Regra de decisao

- `GO`: todos os BKs têm `proof` e `neg` reais, sem falhas criticas abertas.
- `GO_COM_RESSALVAS`: nao existem falhas criticas, mas ha riscos residuais explicitos aceites no gate tecnico.
- `NO_GO`: existe falha critica, evidence obrigatoria em falta ou comando essencial sem resultado real.

## Matriz de validacao

| BK | Area | Evidence consultada | Proof | Negativos | Estado | Risco residual | Responsavel pela validacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF6-01 | Regressao backend | `docs/evidence/MF6/BK-MF6-01-regressao-backend.md` | `PASS` | `PASS` | `PASS` | Testes HTTP exigem execucao fora da sandbox quando ha bloqueio `listen EPERM`; fora da sandbox passaram. | Kaue |
| BK-MF6-02 | Regressao frontend | `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md` | `PASS` | `PASS` | `PASS` | Negativo browser com Vite tambem depende de execucao fora da sandbox quando o ambiente bloqueia `listen`. | Kaue |
| BK-MF6-03 | Seguranca e privacidade | `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md` | `PASS` | `PASS` | `PASS` | Ensaio operacional de restore de backup fica como controlo humano/complementar de infraestrutura. | Matheus |
| BK-MF6-04 | Performance | `docs/evidence/MF6/BK-MF6-04-performance.md` | `PASS` | `PASS` | `PASS` | Baseline local nao substitui teste de carga real de producao; serve como prova PAP controlada. | Davi |
| BK-MF6-05 | Acessibilidade e UX | `docs/evidence/MF6/BK-MF6-05-acessibilidade-ux.md` | `PASS` | `PASS` | `PASS` | Validacao Playwright local pode ser complementada por revisao humana visual com screenshots. | Mateus |

## Comandos executados ou consolidados

| Diretorio | Comando | Resultado real | Output/resumo anexado |
| --- | --- | --- | --- |
| Raiz do repositorio | `git diff --check` | `PASS` | Sem output de erro. |
| Raiz do repositorio | `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |
| `real_dev/backend` | `node --test tests/regression/mf6-backend-regression.test.js` | `PASS` | 6 testes, 6 pass, 0 fail, `duration_ms 394.0315`. |
| `real_dev/backend` | `npm test` | `PASS` | Fora da sandbox: 49 testes, 49 pass, 0 fail, `duration_ms 451.821125`; dentro da sandbox falhou apenas por `listen EPERM` em testes HTTP. |
| `real_dev/backend` | `npm run smoke` | `PASS` | Fora da sandbox: 8 testes, 8 pass, 0 fail, `duration_ms 237.024375`; dentro da sandbox falhou apenas por `listen EPERM`. |
| `real_dev/backend` | `node scripts/check-security-baseline.mjs` | `PASS` | Output: `Hardening MF6: PASS`. |
| `real_dev/backend` | `FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE=*** node scripts/measure-performance-baseline.mjs` | `PASS` | Consolidado de `BK-MF6-04`: `/health` 2ms, catalogo 38ms, pesquisa 159ms, recomendacoes 235ms e P95 concorrente 7ms; o cookie real nao foi registado. Nesta execucao, o script sem cookie falhou controladamente com pedido de `FAITHFLIX_SESSION_COOKIE`. |
| `real_dev/frontend` | `node scripts/check-frontend-regression.mjs` | `PASS` | Output: `Regressao frontend MF6: PASS`. |
| `real_dev/frontend` | `npm run build` | `PASS` | Vite build passou, 101 modulos transformados, bundle gerado em 544ms. |

## Pesquisa estatica obrigatoria

| Pesquisa | Estado | Resultado |
| --- | --- | --- |
| Segredos, storage sensivel, XSS, execucao dinamica, TODOs vagos, pagamentos/IA/CDN/DRM indevidos e `deleteMany({})` | `PASS_COM_NOTA` | Apenas falsos positivos defensivos: regras do proprio scanner, lista de chaves sensiveis para redacao/filtragem, teste negativo `stripe_real` e validacao que rejeita segredos em integracoes. |
| Drift de outros dominios (`StudyFlow`, `OPSA`, `Orelle`, `companyId`, fiscalidade, biometria, turma, professor, sala, disciplina) | `PASS` | Sem ocorrencias em `real_dev/backend/src`, `real_dev/backend/scripts`, `real_dev/backend/tests`, `real_dev/frontend/src` e `real_dev/frontend/scripts`. |
| Marcadores de preenchimento pendentes em evidence MF6 e relatorios tecnicos MF6 existentes antes deste gate | `PASS` | Sem ocorrencias. |

## Negativos consolidados

| Area | Negativo obrigatorio | Evidence | Estado |
| --- | --- | --- | --- |
| Backend | Pedido admin anonimo ou role comum rejeitado | `BK-MF6-01`: endpoints admin herdados da MF5 exigem role admin; anonimo devolve 401 e role comum devolve 403. | `PASS` |
| Frontend | Rota ou import invalido falha de forma previsivel | `BK-MF6-02`: remocao de `/login` falha no script e import inexistente falha no build Vite/Rollup. | `PASS` |
| Seguranca | Segredo literal em copia local faz o scanner falhar | `BK-MF6-03`: copia temporaria com `const password = "123";` gerou negativo controlado. | `PASS` |
| Performance | Pedido invalido nao devolve sucesso | `BK-MF6-04`: `/api/catalog?limit=100` e `/api/search?q=f` devolvem HTTP 400; recomendacoes sem sessao devolvem 401. | `PASS` |
| UX | Navegacao so com teclado revela foco e falhas reais | `BK-MF6-05`: primeiro foco chega ao skip link e `Enter` move foco para `#conteudo-principal`. | `PASS` |

## Riscos residuais

| Risco | Severidade | Aceite por | Acao de acompanhamento |
| --- | --- | --- | --- |
| Validacao humana formal do orientador ainda deve confirmar a decisao antes da defesa. | Media | Nuno, owner do gate, a confirmar no fecho humano | Rever este gate, anexar evidencia final e assinar decisao formal. |
| Testes HTTP precisam de execucao fora da sandbox quando o ambiente bloqueia `listen` em `127.0.0.1`. | Baixa | Nuno | Manter nota ambiental no gate; os mesmos comandos passaram fora da sandbox. |
| Baseline de performance e rajada local nao substituem teste de carga real de producao. | Baixa | Davi/Nuno | Usar os valores como evidence PAP controlada e repetir em ambiente mais proximo de producao se houver tempo. |
| A validacao visual automatizada pode ser complementada por screenshots/revisao humana. | Baixa | Mateus/Nuno | Anexar capturas reais na fase de evidencias se forem exigidas na defesa. |

## Coerencia MF5 -> MF6 -> MF7

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF5 -> MF6` | `COERENTE` | `BK-MF5-06` aponta para `BK-MF6-01`; MF6 preserva admin, privacidade, metricas e integracoes protegidas. |
| `MF6 interna` | `COERENTE` | `BK-MF6-01..05` têm proof e negativos reais, e `BK-MF6-06` consolida o pacote sem alterar regras de negocio. |
| `MF6 -> MF7` | `COERENTE_COM_RISCOS` | `BK-MF6-06` aponta para `BK-MF7-01`; `BK-MF7-01` e `BK-MF7-02` dependem de `BK-MF6-06`. A decisao formal humana ainda deve confirmar a passagem para MF7. |

## Handoff para MF7

`BK-MF7-01` deve usar este ficheiro como fonte inicial para ligar RF ativos a evidence real. `BK-MF7-02` deve reutilizar os resultados de RNF da MF6 e completar os RNF que pertencem a MF7.

Se alguma evidencia for reexecutada antes da defesa e o resultado mudar, este gate deve ser atualizado antes de ser usado como prova final.
