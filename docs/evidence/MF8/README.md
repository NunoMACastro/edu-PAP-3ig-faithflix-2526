# Evidence MF8 - alinhamento, testes, readiness e scope freeze

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/evidence/README.md`
- `proof_scope`: índice de evidence MF8 e limites dos adendos atuais; não contém prova adicional

A MF8 consolida a aplicação FaithFlix depois da validação MF7, focando alinhamento visual, testes finais, readiness operacional, auditoria administrativa, matriz final, riscos, correção de erros e scope freeze.

## Refinamento de produto posterior

| Data | Evidence | Âmbito |
| --- | --- | --- |
| 2026-07-11 | `PAGINA-LOGIN-REGISTO.md` | Redesign end-to-end de login, registo e recuperação progressiva, com segurança, testes e quatro viewports na lane `REFERENCE`. |
| 2026-07-11 | `PAGINA-PUBLICA-ASSOCIACOES.md` | Redesign da página pública e candidatura, impacto agregado e entrada segura para o histórico da própria associação na lane `REFERENCE`. |

Os adendos docentes de 2026-07-10 em `ALINHAMENTO-VISUAL-PARTE-I.md`,
`ALINHAMENTO-VISUAL-PARTE-II.md`, `TESTES-FINAIS-CRIADOS.md`,
`PAINEL-READINESS-OPERACIONAL.md` e `EXECUCAO-TESTES-REPORT-ERROS.md` registam
a prova F5 atual: Axe preview-only `14/14`, incluindo `/admin/catalogo`, quatro viewports, reflow, teclado e
budgets. Esses adendos preservam os snapshots anteriores, não promovem BK dos
alunos e não alegam full E2E, streaming real ou readiness de produção.

## Sequência de evidence

| Ordem | BK | Evidence esperada | Objetivo |
| --- | --- | --- | --- |
| 1 | BK-MF8-01 | `ALINHAMENTO-VISUAL-PARTE-I.md` | Comparar mockup, frontend e prioridades visuais iniciais. |
| 2 | BK-MF8-02 | `ALINHAMENTO-VISUAL-PARTE-II.md` | Fechar o alinhamento visual restante e respetivas ressalvas. |
| 3 | BK-MF8-03 | `TESTES-FINAIS-CRIADOS.md` | Inventariar e preparar testes finais reutilizáveis. |
| 4 | BK-MF8-04 | `PAINEL-READINESS-OPERACIONAL.md` | Registar readiness operacional e sinais de estado da aplicação. |
| 5 | BK-MF8-05 | `AUDITORIA-ADMINISTRATIVA-FINAL.md` | Validar fluxos administrativos, permissões e auditoria. |
| 6 | BK-MF8-06 | `MATRIZ-FINAL.md` | Consolidar RF/RNF, BKs, evidências e estado final. |
| 7 | BK-MF8-07 | `LISTA-RISCOS-TOTAIS.md` | Agregar riscos abertos, mitigados e aceites. |
| 8 | BK-MF8-08 | `EXECUCAO-TESTES-REPORT-ERROS.md` | Executar comandos de validação e registar erros observados. |
| 9 | BK-MF8-09 | `CORRECAO-ERROS-REPORT.md` | Documentar correções aplicadas aos erros reportados. |
| 10 | BK-MF8-10 | `SCOPE-FREEZE.md` | Congelar âmbito, estado e ressalvas finais da entrega. |

## Estados de decisão

Cada evidence deve indicar explicitamente `PASS`, `PASS_COM_RISCOS`, `FAIL` ou `NAO_APLICAVEL`, com provas positivas (`proof`) e negativas (`neg`) quando o BK pedir validação técnica.
