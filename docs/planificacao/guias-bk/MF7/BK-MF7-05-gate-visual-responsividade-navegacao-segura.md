# BK-MF7-05 - Gate visual, responsividade e navegação segura

## Header

- `doc_id`: `GUIA-BK-MF7-05`
- `bk_id`: `BK-MF7-05`
- `macro`: `MF7`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF7-04`
- `rf_rnf`: `RNF21, RNF22, RNF38, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-01`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-gate-visual-responsividade-navegacao-segura.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais fechar a MF7 com uma decisão de gate: `GO`, `GO_COM_RESSALVAS` ou `NO_GO`.

O resultado observável é `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`, com validação por perfil, teclado, viewport, português de Portugal e handoff para `BK-MF8-01`.

#### Importância

MF7 só pode avançar se a UI estiver defensável e a navegação segura estiver validada. Este BK junta a evidence dos BKs anteriores e transforma-a numa decisão final de avanço.

#### Scope-in

- Rever evidências `BK-MF7-01` a `BK-MF7-04`.
- Validar visitante, utilizador comum e admin.
- Validar mobile, tablet e desktop.
- Validar teclado, foco e mensagens em português de Portugal.
- Registar decisão de gate e handoff para `BK-MF8-01`.

#### Scope-out

- Implementar novas features.
- Corrigir bugs grandes sem aprovação.
- Alterar backlog, owner, prioridade ou dependências.
- Criar novas regras de negócio.
- Fechar MF7 sem negativos.

#### Estado antes e depois

- Estado antes: `BK-MF7-04` refinou páginas e estados de UX.
- Estado antes: existem evidências parciais para inventário, navegação, visual e páginas.
- Estado depois: existe uma decisão formal de gate da MF7.
- Estado depois: `BK-MF8-01` pode iniciar matriz RF -> evidence com base numa UI validada.

#### Pré-requisitos

- `BK-MF7-01` concluído.
- `BK-MF7-02` concluído.
- `BK-MF7-03` concluído.
- `BK-MF7-04` concluído.
- Evidence dos quatro BKs anteriores preenchida.
- `bash scripts/validate-planificacao.sh` disponível.

#### Glossário

- Gate: decisão formal sobre avanço da macrofase.
- `GO`: avanço sem blockers conhecidos.
- `GO_COM_RESSALVAS`: avanço permitido com riscos documentados e não bloqueantes.
- `NO_GO`: avanço bloqueado por risco crítico.
- Viewport: dimensão usada para testar responsividade.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF21` e `RNF22` exigem compatibilidade e testes em diferentes resoluções.
- `CANONICO`: `RNF38` exige português de Portugal na interface.
- `CANONICO`: `RNF40` exige formato europeu para datas, horas e números.
- `DERIVADO`: um link admin visível a visitante é blocker P0 do gate.
- Gate bom não é ausência de problemas; é decisão transparente, com provas e riscos classificados.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Evidence | `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md` | Base de discrepâncias. |
| Evidence | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md` | Sessão, roles e negativos. |
| Evidence | `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md` | Tokens, header, hero e interações. |
| Evidence | `docs/evidence/MF7/USABILIDADE-UX.md` | Páginas e viewports. |
| Gate | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md` | Decisão final da MF7. |
| Handoff | `BK-MF8-01` | Matriz RF -> evidence. |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- REVER: `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`
- REVER: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`
- REVER: `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`
- REVER: `docs/evidence/MF7/USABILIDADE-UX.md`
- REVER: `frontend/src/components/layout/AppHeader.jsx`
- REVER: `frontend/src/routes/AppRoutes.jsx`
- REVER: `frontend/src/styles/global.css`
- REVER: `frontend/src/pages/DiscoveryHomePage.jsx`
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`

#### Tutorial técnico linear

### Passo 1 - Consolidar evidências dos BKs anteriores

1. Objetivo funcional do passo no contexto da app.

Confirmar que a decisão de gate usa provas reais dos BKs anteriores.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF7/INVENTARIO-UI-MOCKUP.md`
    - REVER: `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md`
    - REVER: `docs/evidence/MF7/REFINAMENTO-VISUAL-MOCKUP.md`
    - REVER: `docs/evidence/MF7/USABILIDADE-UX.md`
    - LOCALIZAÇÃO: decisões, negativos, riscos e handoff.

3. Instruções do que fazer.

Confirma que cada evidence tem estado final. Se faltar uma, marca o gate como `NO_GO` até ser preenchida.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo consolida evidence.

O gate não deve criar uma verdade nova. Ele lê as provas já criadas e decide se a macrofase pode avançar.

6. Validação do passo.

Resultado esperado: quatro ficheiros de evidence existem e têm resultados observados.

7. Cenário negativo/erro esperado.

Se `NAVEGACAO-SEGURA-POR-PERFIL.md` não provar visitante e user comum, o gate fica `NO_GO`.

### Passo 2 - Criar matriz de decisão do gate

1. Objetivo funcional do passo no contexto da app.

Criar o ficheiro final de decisão da MF7.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo e preenche os campos `Resultado observado`, `Estado` e `Prova`.

4. Código completo, correto e integrado com a app final.

```md
# Gate UI, responsividade e navegação segura - MF7

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-gate-visual-responsividade-navegacao-segura.md`
- `proof_scope`: gate visual baseado em evidence dos alunos; não herda resultados browser, Axe ou media da referência privada

## Metadados

- BK: BK-MF7-05
- Owner: Nuno
- Fonte: RNF21, RNF22, RNF38, RNF40
- Decisão final: EM_REVISAO

## Entradas obrigatórias

| Evidence | Existe | Estado | Observação |
| --- | --- | --- | --- |
| INVENTARIO-UI-MOCKUP.md | A preencher | A preencher | A preencher |
| NAVEGACAO-SEGURA-POR-PERFIL.md | A preencher | A preencher | A preencher |
| REFINAMENTO-VISUAL-MOCKUP.md | A preencher | A preencher | A preencher |
| USABILIDADE-UX.md | A preencher | A preencher | A preencher |

## Matriz de gate

| Critério | Resultado esperado | Resultado observado | Estado | Prova |
| --- | --- | --- | --- | --- |
| Visitante | Não vê links admin | A preencher | A preencher | A preencher |
| Visitante em rota admin | Vai para login | A preencher | A preencher | A preencher |
| User comum | Não vê links admin | A preencher | A preencher | A preencher |
| User comum em rota admin | Recebe aviso de permissão | A preencher | A preencher | A preencher |
| Admin | Acede a páginas admin | A preencher | A preencher | A preencher |
| Mobile 390px | Sem sobreposição | A preencher | A preencher | A preencher |
| Tablet 768px | Grelhas legíveis | A preencher | A preencher | A preencher |
| Desktop largo | Conteúdo com largura controlada | A preencher | A preencher | A preencher |
| Teclado | Foco visível e skip link funcional | A preencher | A preencher | A preencher |
| PT-PT | Texto visível com acentuação correta | A preencher | A preencher | A preencher |
| Formatos europeus | Datas e valores em pt-PT | A preencher | A preencher | A preencher |

## Regras de decisão

- GO: todos os P0 passam e não há blocker P1.
- GO_COM_RESSALVAS: todos os P0 passam e há apenas ressalvas documentadas.
- NO_GO: qualquer P0 falha ou falta evidence obrigatória.

## Handoff para BK-MF8-01

- Estado final da MF7:
- Riscos aceites:
- Riscos bloqueantes:
- Evidence que pode entrar na matriz RF:
```

5. Explicação do código.

Este ficheiro é o contrato final do gate. Ele exige provas para perfis, viewports, teclado, localização e formatos. A secção de regras impede que a equipa avance com um P0 falhado.

6. Validação do passo.

Confirma que a decisão final deixou de estar `EM_REVISAO`.

7. Cenário negativo/erro esperado.

Se qualquer critério P0 ficar sem prova, a decisão deve ser `NO_GO`.

### Passo 3 - Executar verificações técnicas e textuais

1. Objetivo funcional do passo no contexto da app.

Confirmar que os documentos e a app não quebraram depois do refinamento.

2. Ficheiros envolvidos:
    - REVER: `frontend/package.json`
    - REVER: `scripts/validate-planificacao.sh`
    - REVER: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
    - LOCALIZAÇÃO: comandos no terminal e secção de validação da evidence.

3. Instruções do que fazer.

Executa os comandos e regista resultado, data e erro se falhar.

4. Código completo, correto e integrado com a app final.

```bash
npm --prefix frontend run build
bash scripts/validate-planificacao.sh
git diff --check
```

5. Explicação do código.

`npm --prefix frontend run build` confirma que os imports e componentes React compilam. `validate-planificacao.sh` confirma que os metadados dos BKs continuam alinhados com o backlog. `git diff --check` deteta problemas de whitespace.

6. Validação do passo.

Os três comandos devem passar ou ficar registados como bloqueio com erro exato.

7. Cenário negativo/erro esperado.

Se a build falhar por import inexistente, o gate é `NO_GO` até corrigir o ficheiro indicado.

### Passo 4 - Fechar decisão e handoff para MF8

1. Objetivo funcional do passo no contexto da app.

Registar a decisão final e preparar `BK-MF8-01`.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-alinhamento-visual-parte-i.md`
    - LOCALIZAÇÃO: decisão final e handoff.

3. Instruções do que fazer.

Preenche:

- decisão final;
- riscos aceites;
- riscos bloqueantes;
- evidence que deve alimentar o alinhamento visual parte I da MF8;
- assinatura do owner do gate.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo fecha a decisão documental.

O handoff garante que a MF8 começa com provas visuais organizadas, sem repetir validação visual da MF7.

6. Validação do passo.

`BK-MF8-01` deve receber referência a `GATE-UI-NAVEGACAO-SEGURA.md`.

7. Cenário negativo/erro esperado.

Se a decisão for `GO` com riscos P0 em aberto, a decisão está errada e deve ser alterada para `NO_GO`.

#### Critérios de aceite

- Todas as evidências de `BK-MF7-01..04` existem.
- A matriz de gate tem perfis, viewports, teclado, PT-PT e formatos europeus.
- Existem pelo menos cinco negativos de navegação segura.
- A decisão final é `GO`, `GO_COM_RESSALVAS` ou `NO_GO`.
- O handoff para `BK-MF8-01` está preenchido.

#### Validação final

- Executar `npm --prefix frontend run build`.
- Executar `bash scripts/validate-planificacao.sh`.
- Executar `git diff --check`.
- Confirmar `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`.
- `neg`: visitante em admin, user comum em admin, mobile estreito, teclado sem rato e texto fora de PT-PT.
- `fonte`: `RNF21`, `RNF22`, `RNF38`, `RNF40`.

#### Handoff

- `BK-MF8-01` recebe decisão de gate e lista de evidence pronta para matriz RF.
- Se a decisão for `GO_COM_RESSALVAS`, os riscos aceites devem entrar na matriz de riscos da MF8.
- Se a decisão for `NO_GO`, `BK-MF8-01` não deve iniciar até fechar blockers.

##### Adendo do gate visual mensurável

O gate dos alunos só pode fechar quando a evidence própria demonstrar:

- zero violação Axe `serious` ou `critical` nas rotas efetivamente cobertas;
- contraste WCAG AA, foco visível, targets mínimos `44x44 px` e respeito por
  `prefers-reduced-motion`;
- header móvel fechado até `72 px`, menu operável por teclado, fecho com
  `Escape` e restituição do foco;
- ausência de overflow horizontal em `390x844`, `768x900`, `1280x720` e
  `1440x900`, além de reflow utilizável equivalente a `200%`;
- JavaScript inicial até `90 kB` gzip, CSS até `25 kB` gzip, logo até `30 kB`
  e adapters media lazy fora do chunk inicial.

Um preview com API sintética pode provar DOM, ARIA e layout, mas não prova full
E2E, backend, base de dados, streaming, compatibilidade cross-browser completa
ou comportamento com dados reais. Esses limites devem ficar no gate.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-23`: guia atualizado com matriz de gate, regras de decisão, comandos de validação e handoff para MF8.
- `2026-07-10`: gate visual passou a exigir Axe, quatro viewports, reflow,
  teclado, targets e budgets com limites probatórios explícitos.
