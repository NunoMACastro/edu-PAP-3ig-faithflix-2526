# Guias BK - README

`last_updated`: `2026-07-10`

- `contract_version`: `tutorial-v2`
- `document_status`: `CURRENT`
- `implementation_lane`: `STUDENT`

## O que esta pasta contem

Guias de execucao por backlog item (`BK-*`) para apoiar implementacao, validacao e defesa tecnica.

## Estrutura

- `MF0/` ate `MF9/`: guias BK por macrofase.
- `_TEMPLATE-BK.md`: template canonico para criar/editar qualquer guia.

## Contrato canonico obrigatorio

Todos os guias devem conter os campos de header:
`bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.

Regras obrigatorias:
- `core_or_reforco`: `P0 => Reforco`; `P1/P2 => Core`.
- Leitura pedagogica: `Reforco` = item critico (normalmente `P0`) com acompanhamento reforcado; `Core` = execucao base prevista para a sprint.
- `proximo_bk`: `BK-MFxx-yy` para BK nao terminal; `-` apenas no terminal.
- `guia_path` deve corresponder ao caminho real do ficheiro.

## Contrato tutorial v2

O contrato ativo é o mesmo de `_TEMPLATE-BK.md`. Depois do `Header`, cada guia
contém, por esta ordem, as 16 secções:

1. `Objetivo`;
2. `Importância`;
3. `Scope-in`;
4. `Scope-out`;
5. `Estado antes e depois`;
6. `Pré-requisitos`;
7. `Glossário`;
8. `Conceitos teóricos essenciais`;
9. `Arquitetura do BK`;
10. `Ficheiros a criar/editar/rever`;
11. `Tutorial técnico linear`;
12. `Critérios de aceite`;
13. `Validação final`;
14. `Evidence para PR/defesa`;
15. `Handoff`;
16. `Changelog`.

Cada passo do tutorial usa os sete pontos do template: objetivo, ficheiros,
instruções, código, explicação, validação e cenário negativo. O aluno não deve
precisar de descobrir imports, helpers, DTOs, services, componentes, rotas,
testes ou comandos em documentação externa.

Regras obrigatórias:

- critérios de aceite mensuráveis: condição observável + métrica/limiar +
  evidence esperada;
- política de negativos: `P0/P1 >= 3` e `P2 >= 1`;
- código copiável completo e coerente com o contrato final do próprio guia;
- quando um passo não tem código, usar exatamente `Sem código neste passo.`;
- não conservar um snippet inseguro acompanhado apenas por um adendo que diga
  para o adaptar;
- paths de implementação exclusivamente públicos: `backend/` e `frontend/`;
  `real_dev/` nunca aparece num guia BK student-facing.

## Ordem de execucao

- Fonte canonica da ordem: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- O campo `proximo_bk` e derivado dessa ordem.
- Dentro da mesma sprint, respeitar a ordem interna obrigatoria definida em `PLANO-SPRINTS.md` antes de integrar PRs dependentes.

## Regra anti-conflito para snippets

- Snippets que editam ficheiros partilhados (`app.js`, `server.js`, `AppRoutes.jsx`, `package.json` ou clientes API) devem ser aditivos.
- Quando um BK acrescenta funcionalidade a um ficheiro existente, o guia deve dizer explicitamente o que preservar do BK anterior.
- E proibido substituir um ficheiro completo se isso remover rotas, scripts, middlewares, exports ou metodos entregues em BK anterior.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`.
- Qualquer drift entre backlog, matriz, guias, `MF-VIEWS` e `PLANO-SPRINTS` reprova validacao.
- A validade de reports/evidence segue `docs/evidence/README.md`; prova da lane
  `REFERENCE` não promove o estado dos alunos.
