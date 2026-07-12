# BK-MF0-03 - Publicar backlog atomico inicial

## Header

- `doc_id`: `GUIA-BK-MF0-03`
- `bk_id`: `BK-MF0-03`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-01`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-04`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK ensina a transformar um projeto grande numa lista de entregas pequenas, rastreáveis e validáveis. O foco é backlog de execução, não uma lista genérica de ideias.

##### Resultado operacional esperado

O trabalho operacional é validar `docs/planificacao/backlogs/BACKLOG-MVP.md` como backlog atómico oficial, cruzando-o com a matriz canónica, as MF views e o plano de sprints.

##### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. O backlog pode referir BKs técnicos futuros, mas a implementação desses BKs começa apenas em `MF1` e fases seguintes.

##### Enquadramento do BK

##### O que vamos fazer neste BK

Neste BK vamos publicar o backlog atómico inicial do FaithFlix. "Atómico" significa que cada BK deve ser suficientemente pequeno para ser executado, validado e defendido, mas suficientemente completo para entregar valor ou preparar uma entrega seguinte. Na MF0, o valor é organizacional: a equipa passa a saber exatamente que BKs existem, quem é owner, que dependências há e que evidência mínima será exigida.

O backlog oficial tem 66 BK ativos, distribuídos por `MF0..MF9`. Este BK não altera o escopo funcional; confirma que o backlog representa o MVP descrito no README/RF/RNF e que cada linha tem os campos obrigatórios: `bk_id`, `titulo`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias` e `rf_rnf`.

A fase foi detalhada sem mockup e sem código da app. Isto é esperado: antes de criar ecrãs, rotas ou modelos, a equipa precisa de uma lista de trabalho estável.

#### Importância

- Evita que funcionalidades sejam implementadas fora do backlog oficial.
- Dá aos alunos uma unidade clara de trabalho para cada entrega.
- Cria a base para DoD/evidence em `BK-MF0-04`.
- Garante continuidade: `MF1` só começa depois de existir backlog com dependências fechadas.
- Ajuda a defesa da PAP, porque cada requisito passa a ter caminho para BK e evidência.

#### Scope-in

- Validar os 66 BK ativos do MVP.
- Confirmar campos obrigatórios e valores permitidos.
- Confirmar sequência e dependências da `MF0` e transição para `MF1`.
- Confirmar ligação entre backlog, matriz canónica, MF views e plano de sprints.
- Preparar um resumo dos contratos que o DoD deve exigir.

#### Scope-out

- Criar novos BKs.
- Remover BKs ativos.
- Alterar RF/RNF ou criar requisitos novos.
- Repriorizar owners, dependências ou esforços sem decisão formal.
- Implementar código ou criar estrutura de app.

##### Como saber que isto ficou bem

- O backlog mantém `66 BK` e todos têm campos obrigatórios.
- A `MF0` tem 6 BK em sequência coerente.
- `BK-MF1-01` e `BK-MF1-02` dependem de `BK-MF0-06`, garantindo handoff de governance para fundação técnica.
- A matriz canónica reconhece os BK transversais da MF0.
- O próximo BK consegue definir DoD e evidence sobre uma lista estável.

##### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Matheus, Mateus, Davi, Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-01` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: plano total publicado; distribuição pode ser usada como apoio de validação, mas não é dependência canónica (DERIVADO)
- Ref. Plano: `BACKLOG-MVP > Contrato canonico de campos BK` e `PLANO-SPRINTS > Sprint 1` (CANONICO)
- Flow ID: `MF0-governance-kickoff-03` (DERIVADO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Fonte de verdade: `docs/planificacao/backlogs/MF-VIEWS.md`
- Descricao: publicar backlog atómico oficial, com campos, dependências e rastreabilidade preparados para DoD e execução (DERIVADO)

##### Complemento do objetivo (DERIVADO):

- Confirmar que o backlog tem 66 BK ativos e não contém itens fora de escopo.
- Confirmar que cada BK usa o formato `BK-MF[0-9]+-NN`.
- Confirmar que prioridade, estado, esforço e dependências seguem os valores permitidos.
- Confirmar que a sequência MF0 do backlog coincide com `MF-VIEWS.md`.
- Criar handoff para `BK-MF0-04` com as regras que entram na Definition of Done.

#### Estado antes e depois

- Estado esperado antes do BK: plano total existe e a equipa tem distribuição de responsabilidades; backlog ainda precisa de validação atómica.
- Estado esperado depois do BK: backlog de 66 BK validado como fonte operacional e pronto para alimentar DoD/evidence.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: apenas este guia se forem registados ajustes/evidence do BK.
- Ficheiros a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF0-01`; reutiliza a distribuição de `BK-MF0-02` como contexto de sequência, sem alterar dependência canónica.
- Impacto na arquitetura da app: fixa a ordem de construção que impede funcionalidades antes da fundação técnica.
- Impacto em frontend/backend/dados: nenhum código é criado; o backlog reserva BKs específicos para cada camada.
- Impacto em segurança/testes/UI: preserva BKs futuros de sessão segura, smoke tests, hardening e UX.
- Handoff para o próximo BK: entregar a `BK-MF0-04` campos obrigatórios, política de prioridades e dependências validadas.

#### Pré-requisitos

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: limites estruturais `13 sprints`, `66 BK`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: documento alvo.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: rastreabilidade e cobertura.
- `docs/planificacao/backlogs/MF-VIEWS.md`: sequência por macro fase.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: distribuição dos BK por sprint.
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`: owners e apoios por área.
- Mockup: não existe; sem impacto neste BK.
- Código: não existe app detetável; sem impacto neste BK.

#### Glossário

- Backlog: lista priorizada de trabalho a executar.
- BK: unidade de entrega da PAP, com owner, prioridade, dependências e evidência.
- Atómico: pequeno o suficiente para ser executado e validado sem ambiguidade.
- Dependência: BK que deve estar pronto antes de outro começar.
- Prioridade P0/P1/P2: criticidade relativa de execução e validação.
- Esforço S/M/L: estimativa simples de tamanho.
- Rastreabilidade: ligação entre requisito, BK e evidência.
- Estado: situação atual do BK, como `TODO`, `IN_PROGRESS`, `BLOCKED` ou `DONE`.

#### Conceitos teóricos essenciais

**Backlog executável.** Um backlog executável diz o que se constrói, por quem, com que dependências e como se valida. Uma lista como "fazer login" é insuficiente; um BK deve indicar requisitos, owner e evidence.

**Atomicidade.** Um item atómico evita duas falhas: ser tão grande que ninguém consegue fechar, ou tão pequeno que não entrega nada validável. No FaithFlix, `BK-MF2-01` agrupa registo, login e recuperação porque pertencem ao mesmo domínio de identidade.

**Dependências.** Dependências protegem ordem técnica. Por exemplo, `BK-MF1-04` depende de `BK-MF1-01` porque sessão segura precisa de backend base. Na MF0, `BK-MF0-04` depende do backlog porque o DoD precisa saber que itens vai avaliar.

**Campos canónicos.** Campos como `owner`, `prioridade` e `dependencias` não são decoração: são contratos usados por guias, sprints e gates. Alterá-los num sítio e não noutro cria drift.

**Negativos documentais.** Em BKs de governance, testar negativos significa procurar inconsistências: BK duplicado, dependência inexistente, prioridade inválida ou owner ausente.

#### Arquitetura do BK

- Endpoint(s), modelo/schema, service, controller/route, guard, cliente API e página/componente: não aplicável; a MF0 não altera a implementação da app.
- Artefacto documental: os documentos e evidences enumerados na secção seguinte e nos passos.
- Testes: validador de planificação, checks documentais e negativos descritos no tutorial.
- Handoff: contrato documental preparado para `BK-MF0-04`.

#### Ficheiros a criar/editar/rever

- CRIAR: nenhum.
- EDITAR: apenas este guia se forem registados ajustes/evidence do BK.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/MF0/`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar baseline do backlog (~10 min)

1. Objetivo funcional do passo no contexto da app.

Validar que o backlog ativo é o documento certo e está alinhado ao plano total.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever header e baseline do `BACKLOG-MVP.md`.
- Confirmar referência a `66 BK`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O backlog é a base operacional dos BK seguintes.
Snippet de referência: `Universo final de backlog ativo: 66 BK`

6. Validação do passo.

Não há contagem divergente entre plano e backlog.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 2 - Validar contrato de campos (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que o backlog define campos obrigatórios e valores permitidos.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever `Contrato canonico de campos BK`.
- Confirmar que `prioridade`, `estado` e `esforco` têm enumerações.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Os guias BK dependem destes campos para metadados.
Snippet de referência: `prioridade so permite P0|P1|P2`

6. Validação do passo.

Os campos são claros para validação.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 3 - Rever a tabela da MF0 (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar os 6 BK da MF0, owners, apoios, prioridade, esforço e dependências.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/guias-bk/MF0/`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever a secção `MF0 - Kickoff e governance`.
- Comparar com os seis guias existentes em `guias-bk/MF0`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Esta fase desbloqueia todas as restantes.
Snippet de referência: `BK-MF0-06 | dependencias | BK-MF0-02,BK-MF0-05`

6. Validação do passo.

A ordem é coerente e não há dependência inexistente.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 4 - Cruzar backlog com MF views (~15 min)

1. Objetivo funcional do passo no contexto da app.

Garantir que a sequência da MF0 é igual em `BACKLOG-MVP.md` e `MF-VIEWS.md`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever sequência da MF0 em `MF-VIEWS.md`.
- Comparar com a tabela MF0 do backlog.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Os alunos usam views para executar; não podem divergir do backlog.
Snippet de referência: `BK-MF0-01 -> BK-MF0-02 -> BK-MF0-03`

6. Validação do passo.

A ordem é igual nos dois documentos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 5 - Cruzar backlog com matriz canónica (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que os BK transversais da MF0 aparecem na matriz de cobertura.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever `Cobertura de BKs transversais`.
- Confirmar que todos os `BK-MF0-01..06` aparecem.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Mesmo sem RF direto, MF0 precisa de validação em gate.
Snippet de referência: `Checklist de gate S4/S8/S12/S13 + evidence pr/proof/neg`

6. Validação do passo.

Os seis BK da MF0 têm cobertura transversal.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 6 - Validar ligação ao plano de sprints (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que a Sprint 1 inclui `BK-MF0-01..06`, `BK-MF1-01` e `BK-MF1-02`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever calendário de 13 sprints.
- Confirmar carga alvo de Sprint 1.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A carga e ordem semanal devem ser realistas.
Snippet de referência: `Sprint 1 | Governance e arranque | BK-MF0-01..06, BK-MF1-01, BK-MF1-02 | 11`

6. Validação do passo.

A soma planeada não ultrapassa 11 pontos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 7 - Confirmar handoff para MF1 (~15 min)

1. Objetivo funcional do passo no contexto da app.

Garantir que os primeiros BK técnicos dependem do fecho de MF0.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Rever linhas `BK-MF1-01` e `BK-MF1-02`.
- Confirmar dependência `BK-MF0-06`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evita começar backend/frontend antes do alinhamento inicial.
Snippet de referência: `BK-MF1-01 | dependencias | BK-MF0-06`

6. Validação do passo.

MF1 só começa depois da reunião de alinhamento.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 8 - Executar negativos documentais (~20 min)

1. Objetivo funcional do passo no contexto da app.

Procurar falhas que impediriam o backlog de ser executável.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

- Procurar IDs duplicados ou fora do formato `BK-MF*-NN`.
- Procurar dependências para BK inexistente.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Backlog com erro propaga erro para todos os guias.
Snippet de referência: `dependencias aceita - ou lista de BK-* existentes`

6. Validação do passo.

Pelo menos 3 negativos P0 documentados.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 9 - Fechar evidence e handoff (~10 min)

1. Objetivo funcional do passo no contexto da app.

Preparar prova de validação e entregar contrato de backlog ao DoD.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`

3. Instruções do que fazer.

- Preencher `pr`, `proof` e `neg`.
- Resumir regras de campos e negativos mínimos para `BK-MF0-04`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

`BK-MF0-04` precisa saber que campos e evidências deve exigir.
Snippet de referência: `proximo_bk: BK-MF0-04`

6. Validação do passo.

O próximo BK consegue definir DoD sem redefinir backlog.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

#### Critérios de aceite

**Outputs:**
- Backlog atómico revisto como fonte operacional.
- Lista de regras de campos preparada para DoD.

**Verificacoes:**
- 66 BK ativos.
- 6 BK na MF0.
- Todos os BK da MF0 aparecem na matriz como transversais.

**Qualidade:**
- Sem alteração de escopo funcional.
- Sem novos BK ou RF/RNF.
- Dependências legíveis e existentes.

**Continuidade:**
- `BK-MF0-04` recebe backlog estável para definir DoD.
- `MF1` continua dependente de `BK-MF0-06`.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Validação final

**Smoke**
- [ ] Backlog tem header ativo.
- [ ] Backlog declara `66 BK`.
- [ ] Secção MF0 contém 6 BK.
- [ ] Ligações para guias da MF0 existem.

**Negativos**
- [ ] Passo: 7; input/acao: procurar dependência inexistente; resultado esperado: nenhuma dependência inválida; risco que cobre: execução bloqueada por BK fantasma.
- [ ] Passo: 7; input/acao: procurar prioridade fora de `P0|P1|P2`; resultado esperado: nenhuma prioridade inválida; risco que cobre: política de negativos errada.
- [ ] Passo: 7; input/acao: procurar BK sem owner; resultado esperado: todos têm owner; risco que cobre: entrega sem responsável.

**Tecnico**
- [ ] `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` estão alinhados.
- [ ] `rf_rnf` transversal da MF0 não foi trocado por RF/RNF inventado.
- [ ] O próximo BK recomendado é `BK-MF0-04`.

**Regressao das fases anteriores**
- [ ] `BK-MF0-01` mantém-se como dependência canónica.
- [ ] A saída de `BK-MF0-02` é reutilizável, mas sem alterar dependência oficial.

**UI/mockup**
- [ ] Sem mockup; este BK não define ecrãs.

**Seguranca**
- [ ] O backlog preserva BKs de sessão segura, hardening e RGPD.
- [ ] Não são adicionados dados reais, contas, passwords ou chaves.

#### Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

##### TODOs

- TODO: preencher evidence real no fecho do BK.
- TODO: confirmar manualmente com a equipa se a atomicidade dos BK é compreendida.
- TODO (BLOCKER): se houver BK duplicado, dependência inexistente ou owner ausente, bloquear `BK-MF0-04`.
- FOLLOW-UP: usar contrato de campos e política de negativos em `BK-MF0-04`.
- Assuncao a validar com o orientador: `rf_rnf` transversal continua adequado para todos os BK da MF0.
- Decisao dependente de mockup: nenhuma nesta fase.
- Decisao dependente de app/codigo ainda inexistente: caminhos de implementação só serão definidos a partir de `MF1`.

##### Snippet técnico aplicável

```text
CHECK BK-MF0-03
1. backlog.total_bk == 66
2. all(bk.id.match("BK-MF[0-9]+-[0-9][0-9]"))
3. all(bk.owner != "")
4. all(bk.prioridade in ["P0", "P1", "P2"])
5. all(bk.dependencias == "-" or dependencias_existem(bk))
```

#### Handoff

`BK-MF0-04`

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de backlog atómico, rastreabilidade e negativos documentais.
