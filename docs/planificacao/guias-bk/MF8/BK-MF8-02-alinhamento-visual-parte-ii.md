# BK-MF8-02 - Alinhamento visual parte II

## Header

- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-01`
- `rf_rnf`: `RNF01, RNF02, RNF03, RNF05, RNF21, RNF22, RNF38, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-alinhamento-visual-parte-ii.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais completar o alinhamento visual da aplicação, focando catálogo, cards, planos, estados de carregamento, vazio, erro, responsividade e acessibilidade visual.

O resultado observável é `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`, com a decisão final sobre os ecrãs que faltavam depois de `BK-MF8-01`.

#### Importância

A parte II impede que a home fique polida enquanto os fluxos principais mantêm estados visuais frágeis. Este BK desbloqueia `BK-MF8-03`, porque os testes finais devem correr sobre uma interface visualmente estável.

#### Scope-in

- Validar catálogo, cards, planos, formulários e estados UI.
- Confirmar responsividade em viewports definidos.
- Registar negativos visuais e acessibilidade básica.
- Preparar a suite final de testes.

#### Scope-out

- Criar nova área funcional.
- Reescrever o design system.
- Alterar regras de subscrição, catálogo ou autorização.
- Aceitar páginas sem estados de erro e vazio.

#### Estado antes e depois

- Antes: `BK-MF8-01` fechou tokens, header, navegação e home.
- Depois: os ecrãs principais têm decisão visual final e entrada para testes finais.

#### Pre-requisitos

- Ler `BK-MF8-01` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Estado vazio`: mensagem visível quando não há dados para mostrar.
- `Estado de erro`: mensagem visível quando o pedido ou validação falha.
- `Responsividade`: capacidade de manter leitura e ação em diferentes larguras de ecrã.
- `Card de conteúdo`: unidade visual que resume um filme, série, plano ou item do catálogo.

#### Conceitos teóricos essenciais

- `CANONICO`: estados de loading, erro, vazio e sucesso tornam a UI testável; vêm dos fluxos frontend e seguem para os testes finais.
- `CANONICO`: responsividade protege a apresentação PAP em portátil, projetor e ecrã pequeno; evita layouts que só funcionam numa resolução.
- `DERIVADO`: cards consistentes reduzem esforço cognitivo; entram como padrão visual e evitam páginas com hierarquias contraditórias.
- `CANONICO`: acessibilidade visual cobre contraste, foco e leitura; vem dos RNF e evita uma interface bonita mas difícil de usar.
- `DERIVADO`: uma ressalva visual aceite deve ter impacto, owner e prova; segue para riscos totais se não for corrigida.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-02-alinhamento-visual-parte-ii.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Rever catálogo e cards

1. Objetivo funcional do passo no contexto da app.

Confirmar que catálogo, cards e grelha mantêm hierarquia, espaçamento, imagem, título e CTA consistentes.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Revê `frontend/src/pages/` e componentes de cards. Regista exemplos de estado normal, vazio e erro.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando catálogo e cards têm proof em desktop e viewport estreita.

7. Cenário negativo/erro esperado.

Se um card truncar título sem indicação ou quebrar alinhamento, marca drift visual.

### Passo 2 - Rever planos e subscrição

1. Objetivo funcional do passo no contexto da app.

Validar a apresentação dos planos, benefícios, estado ativo e mensagens de subscrição simulada.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Compara textos e hierarquia com documentação de MF4, sem inventar pagamentos reais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando planos têm estado principal e negativo registados.

7. Cenário negativo/erro esperado.

Se a UI prometer gateway real não documentado, marca `FAIL`.

### Passo 3 - Fechar estados vazio, erro e carregamento

1. Objetivo funcional do passo no contexto da app.

Garantir que páginas principais não ficam em branco nem mostram erro técnico cru.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Revê páginas com pedidos ao backend. Regista a mensagem visível para vazio, erro e loading.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada estado tem comportamento observável.

7. Cenário negativo/erro esperado.

Se um erro técnico aparecer ao utilizador sem tradução, marca problema.

### Passo 4 - Validar responsividade

1. Objetivo funcional do passo no contexto da app.

Testar larguras representativas e confirmar que não há sobreposição, corte de texto ou navegação escondida.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Usa screenshots por viewport e regista problemas por rota.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada viewport tem resultado e ressalvas.

7. Cenário negativo/erro esperado.

Se um botão ficar inacessível em ecrã pequeno, a página não passa.

### Passo 5 - Validar acessibilidade visual

1. Objetivo funcional do passo no contexto da app.

Confirmar foco visível, contraste suficiente, labels e ordem de leitura razoável.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Revê elementos interativos e estados de foco. Liga cada observação a RNF do header.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando foco e contraste são verificados em páginas principais.

7. Cenário negativo/erro esperado.

Se o utilizador não conseguir perceber onde está o foco, marca falha.

### Passo 6 - Comparar mockup vs frontend final

1. Objetivo funcional do passo no contexto da app.

Consolidar as diferenças finais que permanecem entre mockup e frontend.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Classifica diferenças como corrigida, aceite com ressalva ou bloqueante.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há diferença sem decisão.

7. Cenário negativo/erro esperado.

Diferença sem owner ou decisão não pode seguir para freeze.

### Passo 7 - Entregar entrada aos testes finais

1. Objetivo funcional do passo no contexto da app.

Preparar uma lista de rotas e estados que `BK-MF8-03` deve incluir nos testes finais.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.

3. Instruções do que fazer.

Escreve handoff com rotas, estados, comandos e riscos visuais restantes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando `BK-MF8-03` consegue criar matriz de testes a partir do handoff.

7. Cenário negativo/erro esperado.

Se o handoff não indicar rotas concretas, o próximo BK fica bloqueado.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md` existe e referencia `BK-MF8-02`.
- Todos os 7 passos têm prova, decisão e negativo associado.
- Cada decisão usa `PASS`, `PASS_COM_RESSALVAS`, `FAIL` ou `NAO_APLICAVEL` com justificação.
- Os campos `pr`, `proof`, `neg` e `fonte` estão preenchidos ou justificados.
- Erros comuns a evitar: prova sem comando, screenshot sem contexto, decisão sem fonte e handoff sem owner.

#### Validação final

- `bash scripts/validate-planificacao.sh` executado na raiz do repositório.
- `git diff --check` sem linhas reportadas.
- Evidence principal preenchida com `pr`, `proof`, `neg`, decisão final e handoff.
- Nenhum caminho privado ou nota interna aparece no guia nem no artefacto de aluno.

Resultado esperado: a validação documental fica em `PASS`; se existir falha técnica fora deste BK, ela fica registada com estado, impacto e próximo passo.

#### Evidence para PR/defesa

| Campo | Conteúdo esperado |
| --- | --- |
| `pr` | Link ou identificador da alteração, ou nota `NAO_APLICAVEL` quando for só evidence documental. |
| `proof` | Comando, screenshot, checklist preenchida ou output seguro que prova o fluxo principal. |
| `neg` | Cenário negativo com expected result e resultado observado. |
| `fonte` | RF/RNF, BK anterior, documento canónico ou evidence que justifica a decisão. |

#### Handoff

- Entrega principal: `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`.
- Próximo BK: `BK-MF8-03`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
