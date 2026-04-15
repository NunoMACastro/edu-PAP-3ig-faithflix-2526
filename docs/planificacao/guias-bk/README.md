# Guias BK - README

`last_updated`: `2026-04-14`

## O que esta pasta contem

Guias de execucao por backlog item (`BK-*`) para apoiar implementacao, validacao e defesa tecnica.

## Estrutura

- `MF0/` ate `MF8/`: guias BK por macrofase.
- `_TEMPLATE-BK.md`: template canonico para criar/editar qualquer guia.

## Contrato canonico obrigatorio

Todos os guias devem conter os campos de header:
`bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.

Regras obrigatorias:
- `core_or_reforco`: `P0 => Reforco`; `P1/P2 => Core`.
- `proximo_bk`: `BK-MFxx-yy` para BK nao terminal; `-` apenas no terminal.
- `guia_path` deve corresponder ao caminho real do ficheiro.

## Contrato pedagogico-operacional

- Criterios de aceite mensuraveis: condicao observavel + metrica/limiar + evidencia esperada.
- Politica de negativos: `P0/P1 >= 3` e `P2 >= 1`.
- Bloco pedagogico obrigatorio: `Objetivo pedagogico`, `Tempo estimado`, `Erros comuns`, `Check de compreensao`.
- Bloco operacional obrigatorio: `Pre-condicoes`, `Execucao`, `Outputs`, `Validacao`, `Handoff`.
- Snippet tecnico aplicavel obrigatorio em todos os guias.

## Ordem de execucao

- Fonte canonica da ordem: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- O campo `proximo_bk` e derivado dessa ordem.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`.
- Qualquer drift entre backlog, matriz, guias, `MF-VIEWS` e `PLANO-SPRINTS` reprova validacao.
