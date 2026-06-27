# BK-MF8-05 - Avaliação final e feedback orientador

## Header

- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-04`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-avaliacao-final-e-feedback-orientador.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais registar a avaliação final do orientador, transformar feedback em decisões rastreáveis e separar o que é obrigatório, recomendável, residual ou fora do escopo final.

#### Importância

O feedback final só ajuda a equipa se virar decisão concreta. Sem registo, a equipa pode corrigir demais, corrigir de menos ou alterar algo crítico sem autorização.

#### Scope-in

- Registar feedback final com fonte, data e owner.
- Classificar cada ponto por severidade e decisão.
- Ligar feedback a risco residual, bug bloqueante ou scope freeze.
- Definir o que entra no buffer final.

#### Scope-out

- Alterar requisitos sem aprovação explícita.
- Transformar sugestão estética em blocker.
- Fechar feedback oral sem registo.
- Atribuir ações sem owner.

#### Estado antes e depois

- Estado antes: o ensaio técnico já identificou perguntas, falhas e ajustes.
- Estado antes: a dependência `BK-MF8-04` tem de estar concluída, validada ou registada com ressalva.
- Estado depois: existe feedback classificado e pronto para alimentar riscos e bugs bloqueantes.
- Estado depois: o handoff para `BK-MF8-06` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-04` está disponível ou tem ressalva registada.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.
- Não alterar RF, RNF, owner, prioridade, sprint ou dependência sem decisão documentada do orientador.

#### Glossário

- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação da equipa.
- Negativo: cenário em que a entrega deve bloquear, avisar ou falhar de forma controlada.
- Risco residual: limitação conhecida, avaliada e aceite para defesa.
- Bug bloqueante: falha que impede entrega honesta ou defesa segura.
- Scope freeze: ponto em que novas alterações passam a exigir aprovação explícita.
- Handoff: informação mínima para o próximo BK continuar sem adivinhar contexto.

#### Conceitos teóricos essenciais

- `CANONICO`: Nuno coordena governance, avaliação, gates e defesa.
- `DERIVADO`: feedback fica classificado em `OBRIGATORIO`, `RECOMENDADO`, `RISCO_RESIDUAL` ou `FORA_DO_ESCOPO`.
- Feedback final é uma fonte de decisão, não uma lista informal.
- Owner e critério de fecho evitam ações vagas na reta final.
- Ponto obrigatório sem correção ou aceitação vira blocker antes do freeze.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Ensaio | `ENSAIO-TECNICO-DEFESA.md` | Entrada com falhas e dúvidas. |
| Feedback | `FEEDBACK-ORIENTADOR-FINAL.md` | Registo de decisão e owner. |
| Riscos | `BK-MF8-06` | Recebe limitações aceites. |
| Bugs | `BK-MF8-07` | Recebe correções bloqueantes aprovadas. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
- REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
- REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- REVER: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`

#### Tutorial técnico linear

### Passo 1 - Recolher feedback do orientador

1. Objetivo funcional do passo no contexto da app.

Preparar a entrada específica de BK-MF8-05 antes de alterar o artefacto principal.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - LOCALIZAÇÃO: secção ligada a "Recolher feedback do orientador"

3. Instruções do que fazer.

Confirma a dependência `BK-MF8-04`, o owner e a fonte canónica antes de avançar. Regista no artefacto o estado de entrada e qualquer ressalva.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A entrada passa quando dependência, owner, prioridade e fonte estão explícitos.

7. Cenário negativo/erro esperado.

Se a dependência estiver sem decisão, marca a entrada como pendente.

### Passo 2 - Classificar decisão por ponto

1. Objetivo funcional do passo no contexto da app.

Transformar cada comentário do orientador ou cada falha vinda do ensaio numa decisão rastreável, com impacto, proof, negativo e estado.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secção `Pontos de feedback classificados`

3. Instruções do que fazer.

Cria a secção `Pontos de feedback classificados` e regista uma linha por ponto vindo do orientador, do ensaio técnico ou de uma matriz de evidência. Usa esta tabela:

| ID | Fonte | Ponto observado | Área | Severidade | Decisão | Ação necessária | Proof existente | Negativo associado | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FDB-001 | `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` |  | Defesa, UX, segurança, testes ou documentação | `P0`, `P1`, `P2` ou `P3` | `OBRIGATORIO`, `RECOMENDADO`, `RISCO_RESIDUAL` ou `FORA_DO_ESCOPO` |  |  |  | `ABERTO` |

Usa estas regras:

- `OBRIGATORIO`: o ponto afeta segurança, privacidade, prova central, autenticidade da demo, requisito P0/P1 ou decisão explícita do orientador.
- `RECOMENDADO`: melhora clareza, apresentação, UX ou documentação, mas não bloqueia a defesa.
- `RISCO_RESIDUAL`: é uma limitação conhecida, aceitável e que deve seguir para `BK-MF8-06`.
- `FORA_DO_ESCOPO`: é uma ideia nova, uma funcionalidade não contratada ou uma alteração que quebraria o scope freeze.

Não juntes vários temas na mesma linha. Se o orientador comentar segurança e UI no mesmo parágrafo, cria duas linhas para poderes dar owner, proof e destino separados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A classificação serve para impedir que feedback final fique como conversa solta. Cada ponto passa a ter uma origem, uma decisão e um estado, o que permite saber se deve seguir para risco residual, bug bloqueante, ajuste de apresentação ou arquivo fora do escopo.

6. Validação do passo.

A validação passa quando todos os pontos têm `ID`, `Fonte`, `Severidade`, `Decisão`, `Proof existente` ou justificação de ausência, `Negativo associado` quando houver risco, e `Estado`.

7. Cenário negativo/erro esperado.

Se um ponto obrigatório ficar sem proof, não pode ser aceite. Mantém o estado como `ABERTO`, escreve a prova em falta e passa o item para o passo 3 para receber owner e critério de fecho.

### Passo 3 - Atribuir owner e critério

1. Objetivo funcional do passo no contexto da app.

Garantir que cada ponto classificado tem uma pessoa responsável, uma ação objetiva e uma condição clara para ser fechado.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - LOCALIZAÇÃO: secção `Plano de ação por owner`

3. Instruções do que fazer.

Cria a secção `Plano de ação por owner` e copia para lá todos os pontos com decisão `OBRIGATORIO`, `RECOMENDADO` ou `RISCO_RESIDUAL`. Usa esta tabela:

| ID | Owner | Apoio | Ação concreta | Critério de fecho | Evidence esperada | Prazo dentro da MF8 | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FDB-001 |  |  |  |  |  | antes de `BK-MF8-06`, `BK-MF8-07` ou `BK-MF8-08` | `POR_TRATAR` |

Usa estas regras:

- Owner deve ser uma pessoa da equipa indicada nos BKs, não "equipa" nem "todos".
- Ação concreta deve começar por verbo observável: rever, corrigir, validar, anexar, justificar, remover, promover ou arquivar.
- Critério de fecho deve dizer que prova fecha o ponto: ficheiro atualizado, comando executado, decisão assinável, captura, matriz revista ou item promovido.
- Pontos `FORA_DO_ESCOPO` não entram como ação, mas ficam arquivados com motivo no passo 6.

Se o owner não for óbvio, usa a responsabilidade do BK mais próximo: `BK-MF8-06` para riscos, `BK-MF8-07` para bugs bloqueantes, `BK-MF8-08` para freeze e `BK-MF8-09` para pacote final.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. O owner evita que um feedback importante fique sem responsável. O critério de fecho evita fechar um ponto apenas porque alguém disse que está tratado; a equipa precisa de uma evidência que outra pessoa consiga rever.

6. Validação do passo.

A validação passa quando todos os pontos acionáveis têm owner individual, ação concreta, critério de fecho, evidence esperada e prazo ligado a um BK seguinte.

7. Cenário negativo/erro esperado.

Se um ponto `OBRIGATORIO` não tiver owner, mantém o estado `BLOQUEADO_SEM_OWNER` e não o deixes seguir como risco aceite. Um ponto obrigatório sem owner deve ser discutido antes do freeze.

### Passo 4 - Cruzar com scorecards

1. Objetivo funcional do passo no contexto da app.

Confirmar se o feedback altera a leitura dos scorecards da sprint e se alguma decisão exige remediação antes do fecho.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
    - LOCALIZAÇÃO: secção `Impacto nos scorecards`

3. Instruções do que fazer.

Cria a secção `Impacto nos scorecards` e cruza cada ponto obrigatório ou risco residual com os critérios do scorecard. Usa esta tabela:

| ID | Critério afetado | Score antes | Evidência que justifica | Impacto | Decisão |
| --- | --- | ---: | --- | --- | --- |
| FDB-001 | Planeamento, implementação, validação, qualidade ou evidência |  |  | `MANTEM`, `DESCE`, `SOBE_COM_PROVA` ou `REVER_COM_ORIENTADOR` |  |

Aplica estas regras:

- Não alteres score oficial dentro deste BK sem decisão documentada do orientador.
- Se o feedback revelar falta de proof, usa `REVER_COM_ORIENTADOR`.
- Se o feedback confirmar falha P0/P1, usa `DESCE` e envia a causa para risco ou bug.
- Se o feedback for apenas sugestão estética sem impacto no contrato, usa `MANTEM`.
- Se houver nova evidência objetiva, usa `SOBE_COM_PROVA` e aponta o ficheiro ou comando.

No fim da secção, escreve uma decisão curta:

```md
Decisão sobre scorecards: `SEM_ALTERACAO`, `REVER_COM_ORIENTADOR` ou `REMETER_PARA_BUG_BLOQUEANTE`.
Justificação: ...
```

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. O scorecard resume a saúde da sprint, por isso o feedback final não pode ficar separado dele. Este cruzamento evita dizer que a sprint está verde quando existe uma falha obrigatória ainda aberta, mas também impede baixar uma nota por opinião sem contrato ou sem prova.

6. Validação do passo.

A validação passa quando cada ponto obrigatório ou risco residual tem critério afetado, score antes, evidência, impacto e decisão.

7. Cenário negativo/erro esperado.

Se um ponto baixar score sem evidence objetiva, marca `REVER_COM_ORIENTADOR` em vez de alterar a decisão. Scorecard sem fonte cria ruído e pode esconder o problema real.

### Passo 5 - Separar risco de bug

1. Objetivo funcional do passo no contexto da app.

Separar limitações aceitáveis de falhas que impedem uma entrega honesta, segura ou defensável.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-06-lista-de-riscos-residuais.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-correcao-de-bugs-bloqueantes.md`
    - LOCALIZAÇÃO: secção `Triagem risco ou bug`

3. Instruções do que fazer.

Cria a secção `Triagem risco ou bug` e avalia todos os pontos `OBRIGATORIO`, `RISCO_RESIDUAL` ou `REVER_COM_ORIENTADOR`. Usa esta tabela:

| ID | Sintoma | Impacto na defesa | Afeta segurança/privacidade? | Afeta requisito P0/P1? | Tem fallback honesto? | Destino |
| --- | --- | --- | --- | --- | --- | --- |
| FDB-001 |  |  | `SIM` ou `NAO` | `SIM` ou `NAO` | `SIM` ou `NAO` | `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08` ou `ARQUIVAR` |

Usa esta matriz de decisão:

- Envia para `BK-MF8-07` se houver falha de login, autorização, dados sensíveis, prova principal, build, teste obrigatório, rota essencial ou demo central sem fallback honesto.
- Envia para `BK-MF8-06` se a limitação for conhecida, tiver impacto controlado, tiver fallback ou explicação honesta e puder ser aceite na defesa.
- Envia para `BK-MF8-08` se o ponto for uma decisão de congelamento de escopo, por exemplo recusar nova funcionalidade ou mudança visual tardia.
- Usa `ARQUIVAR` se for sugestão sem impacto, duplicado já tratado ou pedido fora do escopo aprovado.

Nunca classifiques como risco residual uma falha que exponha dados pessoais, credenciais, permissões indevidas ou uma funcionalidade central sem prova.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. Esta triagem protege a equipa de dois erros comuns: tratar um bug bloqueante como "risco aceite" ou transformar uma melhoria opcional num bloqueio de entrega. O destino correto mantém a cadeia MF8 clara: riscos em `BK-MF8-06`, bugs em `BK-MF8-07` e freeze em `BK-MF8-08`.

6. Validação do passo.

A validação passa quando todos os pontos críticos têm destino, motivo e regra aplicada. Nenhum item pode ficar com destino vazio.

7. Cenário negativo/erro esperado.

Se um ponto afetar segurança ou privacidade e alguém tentar enviá-lo para `BK-MF8-06`, bloqueia a decisão e promove-o para `BK-MF8-07`. Segurança e privacidade não podem ser tratadas como ressalva vaga.

### Passo 6 - Fechar feedback final

1. Objetivo funcional do passo no contexto da app.

Produzir uma decisão final assinável sobre o feedback: aprovado, aprovado com ressalvas, precisa de correção ou bloqueado.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
    - LOCALIZAÇÃO: secção `Decisão final do feedback`

3. Instruções do que fazer.

Cria a secção `Decisão final do feedback` com este resumo:

| Campo | Valor |
| --- | --- |
| Data da revisão |  |
| Orientador validou diretamente? | `SIM`, `NAO` ou `VALIDACAO_AGENDADA` |
| Total de pontos recebidos |  |
| Pontos obrigatórios abertos |  |
| Riscos enviados para `BK-MF8-06` |  |
| Bugs enviados para `BK-MF8-07` |  |
| Decisões de freeze enviadas para `BK-MF8-08` |  |
| Decisão final | `FEEDBACK_APROVADO`, `APROVADO_COM_RESSALVAS`, `CORRIGIR_ANTES_DO_FREEZE` ou `FEEDBACK_BLOQUEADO` |

Aplica estas regras:

- Usa `FEEDBACK_APROVADO` apenas se não houver pontos obrigatórios abertos, bugs bloqueantes ou perguntas críticas sem fonte.
- Usa `APROVADO_COM_RESSALVAS` quando houver riscos residuais documentados e aceites para `BK-MF8-06`.
- Usa `CORRIGIR_ANTES_DO_FREEZE` quando houver ações obrigatórias com owner e prazo, mas sem blocker imediato de defesa.
- Usa `FEEDBACK_BLOQUEADO` quando existir bug bloqueante, falha de segurança/privacidade, falta de proof central ou decisão do orientador ainda indispensável.

No fim, escreve a decisão em três frases:

```md
Decisão final: `...`
Motivo: ...
Próximo passo obrigatório: ...
```

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A decisão final evita que a equipa avance para riscos, bugs ou freeze com uma interpretação ambígua do feedback. Quem abrir o ficheiro deve perceber imediatamente se pode continuar, se precisa de corrigir algo ou se a defesa está bloqueada.

6. Validação do passo.

A validação passa quando a decisão final respeita as regras acima e todos os contadores batem certo com as tabelas dos passos 2 a 5.

7. Cenário negativo/erro esperado.

Se existir bug bloqueante aberto e a decisão final estiver como `FEEDBACK_APROVADO`, a validação falha. Altera a decisão para `FEEDBACK_BLOQUEADO` ou envia o bug para `BK-MF8-07` antes de continuar.

### Passo 7 - Preparar handoff riscos/bugs

1. Objetivo funcional do passo no contexto da app.

Fechar a passagem de BK-MF8-05 para BK-MF8-06.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - LOCALIZAÇÃO: secção ligada a "Preparar handoff riscos/bugs"

3. Instruções do que fazer.

Escreve decisões aceites, riscos restantes e ações que `BK-MF8-06` deve consumir. Se `BK-MF8-06` for `FIM`, escreve nota de arquivo e defesa final.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

O handoff passa quando outra pessoa consegue continuar sem explicação oral.

7. Cenário negativo/erro esperado.

Se o próximo BK precisar de dado em falta, declara blocker no handoff.

#### Critérios de aceite

- Todo o feedback tem fonte, decisão, owner e critério de fecho.
- Sugestões não obrigatórias não bloqueiam sem decisão.
- Pontos obrigatórios entram em riscos ou bugs.
- O scorecard fica revisto sem mudar canon indevidamente.
- O handoff separa riscos residuais de bugs bloqueantes.

#### Validação final

- Rever o ficheiro com o orientador ou registar ausência de validação.
- Confirmar que nenhum ponto obrigatório fica sem owner.
- Cruzar decisões com scorecards e roteiro.
- Executar `git diff --check` após editar o artefacto.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`.
- `neg`: feedback sem owner ou critério de fecho não pode ficar aceite.
- `fonte`: ensaio, scorecards e decisão do orientador.

#### Handoff

O BK-MF8-06 deve receber riscos aceites; o BK-MF8-07 deve receber apenas bugs bloqueantes aprovados.

- Entregar `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` preenchido.
- Registar blockers com owner, impacto e critério de fecho.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
