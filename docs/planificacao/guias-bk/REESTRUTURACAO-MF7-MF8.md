# Reestruturação MF7/MF8 — snapshot da baseline de 2026-06-27

## Header

- `doc_id`: `REESTRUTURACAO-MF7-MF8`
- `area`: `planificacao`
- `owner`: `Nuno (orientacao)`
- `status`: `historico`
- `last_updated`: `2026-06-27`
- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-27`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: decisão de reestruturação MF7/MF8 anterior à criação da MF9; não descreve a baseline ativa 66/66/94/13

## Decisão observada no snapshot

Em 2026-06-27, a baseline passou para `60 BK / 60 guias`. A MF7 manteve o
fecho visual e de navegação segura; a MF8 ficou condensada em 10 BK práticos,
sem os antigos BK documentais de defesa/pacote como itens formais. A baseline
ativa posterior acrescentou MF9 e está em `66 BK / 66 guias`, `94 requisitos` e
`13 sprints`.

## MF8 observado no snapshot

| BK | Titulo | Owner | Dependencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | Alinhamento visual parte I | Matheus | `BK-MF7-05` |
| `BK-MF8-02` | Alinhamento visual parte II | Matheus | `BK-MF8-01` |
| `BK-MF8-03` | Criacao de testes finais da aplicacao | Matheus | `BK-MF8-02` |
| `BK-MF8-04` | Painel de readiness | Matheus | `BK-MF8-03` |
| `BK-MF8-05` | Auditoria administrativa final | Matheus | `BK-MF8-04` |
| `BK-MF8-06` | Matriz final | Kaue | `BK-MF8-05` |
| `BK-MF8-07` | Lista de riscos totais | Kaue | `BK-MF8-06` |
| `BK-MF8-08` | Execucao de testes e report de erros | Davi | `BK-MF8-07` |
| `BK-MF8-09` | Correcao de erros do report anterior | Kaue | `BK-MF8-08` |
| `BK-MF8-10` | Scope Freeze | Kaue | `BK-MF8-09` |

## Racional

1. O frontend real e aproximado do mockup em duas partes.
2. Os testes finais sao criados e organizados antes de serem executados.
3. Readiness e auditoria administrativa fecham a prova operacional.
4. A matriz final vem depois do trabalho tecnico.
5. A lista de riscos passa a cobrir todos os riscos, nao apenas residuais.
6. O report de erros e corrigido ou classificado antes do scope freeze.

## Implicacoes

- Documentos canonicos devem apontar apenas para `BK-MF8-01` a `BK-MF8-10`.
- Guias MF8 removidos da estrutura formal podem ser reaproveitados como notas internas, mas nao contam para backlog, matriz, sprints ou scorecards.
- Student-facing docs nao devem expor caminhos privados de implementacao.
