# Evidence BK-MF6-05 - Acessibilidade e UX final

- `document_status`: `SUPERSEDED`
- `snapshot_date`: `2026-07-10`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: template MF6 legado arquivado com placeholders preservados; não constitui procedimento atual, execução ou evidence de acessibilidade

> Arquivado em 2026-07-10: template duplicado com placeholders; não é evidence.

- Owner: Mateus
- Apoio: Kaue
- Data: PREENCHER_COM_DATA_REAL
- Requisitos: RNF01, RNF02, RNF03, RNF04, RNF06

## Comandos executados

| Comando | Resultado real | Evidence anexada |
| --- | --- | --- |
| `cd real_dev/frontend && npm run build` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_OUTPUT_RESUMIDO |

## Proof

| Verificação | Resultado real | Evidence anexada |
| --- | --- | --- |
| Skip link visível ao primeiro foco por teclado | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| `Enter` no skip link move o foco para `#conteudo-principal` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Navegação principal clara em `/`, `/catalogo`, `/pesquisa`, `/planos`, `/associacoes` e `/conta` | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_PAGINAS_TESTADAS |
| Layout mantém hierarquia a 390px | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Layout mantém hierarquia a 768px | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Layout mantém hierarquia a 1280px | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |
| Botões, links e selects têm foco visível | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_COMPONENTES_TESTADOS |
| Player em `/ver/:contentId` mantém controlos acessíveis por teclado | PREENCHER_COM_PASS_OU_FAIL | PREENCHER_COM_SCREENSHOT_OU_NOTA |

## Negativos

| Cenário | Resultado esperado | Resultado real |
| --- | --- | --- |
| Usar só teclado desde o início da página | Todos os controlos principais recebem foco visível | PREENCHER_COM_RESULTADO_REAL |
| Campo obrigatório vazio num formulário existente | Mensagem clara em português, sem bloquear a página | PREENCHER_COM_RESULTADO_REAL |
| Player sem interação de rato | Play/pause, progresso e seletores continuam alcançáveis | PREENCHER_COM_RESULTADO_REAL |

## Observações

- Não substituir placeholders por `PASS` sem execução real.
- Se a validação manual falhar, registar `FAIL`, página, largura e componente afetado.
- Não anexar cookies, tokens, passwords ou dados pessoais em screenshots ou logs.
