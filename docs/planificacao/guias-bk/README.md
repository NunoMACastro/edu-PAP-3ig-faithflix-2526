# Guias BK - README

`last_updated`: `2026-04-13`

## O que esta pasta contem

Guias de execucao por backlog item (`BK-*`) para apoiar implementacao, validacao e defesa tecnica.

## Estrutura

- `MF0/` ate `MF8/`: guias BK por macrofase.
- `_TEMPLATE-BK.md`: template canonico para criar/editar qualquer guia.

## Como usar um guia BK

1. Confirmar o `bk_id` e dependencias no `BACKLOG-MVP.md`.
2. Executar o passo-a-passo do guia.
3. Validar com checklist, criterios mensuraveis e cenarios negativos.
4. Preencher evidencia (`pr`, `proof`, `neg`).
5. Navegar para o `Proximo BK recomendado`.

## Contrato minimo obrigatorio (resumo)

- Criterios de aceite mensuraveis: condicao observavel + metrica/limiar + evidencia esperada.
- Politica de negativos: `P0/P1 >= 3` e `P2 >= 1`.
- Snippet tecnico obrigatorio em todos os guias.
- `Proximo BK recomendado` obrigatorio: `BK-MFxx-yy` para BK nao terminal, ou `-` apenas no BK terminal.

## Ordem de execucao

- Fonte canonica da ordem: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- O campo `Proximo BK recomendado` e derivado dessa ordem.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`
- Qualquer drift entre guias, `MF-VIEWS` e `PLANO-SPRINTS` reprova validacao.
