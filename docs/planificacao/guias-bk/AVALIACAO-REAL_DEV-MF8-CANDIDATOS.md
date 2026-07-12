# Avaliacao MF8 - candidatos finais alinhados com a estrutura de 10 BKs

## Header

- `doc_id`: `AVALIACAO-MF8-CANDIDATOS`
- `area`: `planificacao`
- `macro`: `MF8`
- `owner`: `Nuno (orientacao)`
- `status`: `historico`
- `last_updated`: `2026-06-27`
- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-27`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: avaliação dos candidatos MF8 antes de MF9; não descreve a baseline ativa

## Decisao

Na data do snapshot, a avaliação de candidatos ficou sincronizada com a MF8 de
10 BK. A estrutura então ativa deixou de usar a cadeia anterior e passou a
privilegiar trabalho prático: alinhamento visual, testes, readiness, auditoria,
matriz, riscos totais, report de erros, correção e scope freeze.

## Candidatos aprovados para a MF8 formal

| BK | Foco aprovado | Motivo |
| --- | --- | --- |
| `BK-MF8-01` | Alinhamento visual parte I | Reduz drift inicial entre mockup e frontend real. |
| `BK-MF8-02` | Alinhamento visual parte II | Fecha catalogo, cards, planos, estados, responsividade e acessibilidade visual. |
| `BK-MF8-03` | Criacao de testes finais | Organiza a suite antes da execucao consolidada. |
| `BK-MF8-04` | Painel de readiness | Cria decisao operacional `GO`, `GO_COM_RESSALVAS` ou `NO_GO`. |
| `BK-MF8-05` | Auditoria administrativa final | Fecha permissoes, rotas protegidas, dados sensiveis e configuracao. |
| `BK-MF8-06` | Matriz final | Consolida RF/RNF apenas depois dos BKs tecnicos. |
| `BK-MF8-07` | Lista de riscos totais | Cobre riscos tecnicos, produto, UX, seguranca, dados, demonstracao e manutencao. |
| `BK-MF8-08` | Execucao de testes e report de erros | Transforma testes em report acionavel. |
| `BK-MF8-09` | Correcao de erros do report anterior | Corrige, aceita como risco ou classifica os erros encontrados. |
| `BK-MF8-10` | Scope Freeze | Congela funcionalidades, exclusoes, riscos aceites e trabalho pos-PAP. |

## Resultado esperado

- `60 BKs / 60 guias` no total global observado em 2026-06-27; a baseline ativa posterior é `66/66`, com `94 requisitos` e `13 sprints`.
- `10/10` guias MF8 ativos.
- Nenhum BK MF8 removido deve aparecer em backlog, sprints, matriz ou indices ativos.
- Guias student-facing usam caminhos publicos/canonicos.
