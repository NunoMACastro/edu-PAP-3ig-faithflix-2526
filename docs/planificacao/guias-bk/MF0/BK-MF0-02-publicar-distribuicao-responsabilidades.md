# BK-MF0-02 - Publicar distribuicao de responsabilidades

## Header

- `doc_id`: `GUIA-BK-MF0-02`
- `bk_id`: `BK-MF0-02`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `-`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-01`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-03`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK ensina a equipa a separar ownership, apoio e validação. Para alunos de 12.º ano, isto evita uma confusão comum: "todos fazem tudo" parece colaborativo, mas em projeto real costuma gerar buracos de responsabilidade.

##### Resultado operacional esperado

O trabalho operacional é publicar e validar `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, reutilizando o plano total fechado em `BK-MF0-01` e preparando o backlog atómico de `BK-MF0-03`.

##### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. Qualquer referência a áreas técnicas neste guia serve para distribuir responsabilidade futura, não para implementar essas áreas agora.

##### Enquadramento do BK

##### O que vamos fazer neste BK

Neste BK vamos transformar o plano total numa distribuição concreta de responsabilidades. A equipa do FaithFlix tem quatro alunos com papéis técnicos diferentes: Matheus em backend/segurança, Mateus em frontend/UX, Davi em dados/pesquisa/recomendações/métricas e Kaue em QA/operação/evidências. O papel do Nuno fica separado como orientação, governance, avaliação e gates.

O resultado esperado é um documento que diga quem decide, quem implementa, quem apoia e quem valida cada área. Isto é fundamental porque as fases seguintes vão cruzar frontend, backend, dados, segurança e evidências. Sem ownership claro, `MF1` pode começar com estrutura técnica fragmentada.

A fase foi detalhada sem mockup. Como este BK não define UI, a ausência de mockup não bloqueia a distribuição de responsabilidades.

#### Importância

- Evita que BKs críticos fiquem sem dono real.
- Ajuda os alunos a perceber que "owner" não significa trabalhar sozinho; significa responder pelo fecho do BK.
- Prepara pairing e handoff semanal, que são mecanismos pedagógicos obrigatórios.
- Desbloqueia `BK-MF0-03`, porque o backlog atómico precisa de owner e apoio por BK.
- Protege a arquitetura futura: backend, frontend, dados e QA ficam com responsabilidades explícitas.

#### Scope-in

- Rever `DISTRIBUICAO-RESPONSABILIDADES.md`.
- Confirmar equipa, áreas funcionais, matriz por artefacto e cerimónias.
- Confirmar que Nuno não fica como owner de implementação core recorrente.
- Confirmar que cada BK do backlog tem owner único.
- Preparar evidência de que a distribuição bate certo com o plano total e o backlog.

#### Scope-out

- Trocar owners do backlog sem decisão explícita do orientador.
- Mudar prioridades, dependências ou RF/RNF.
- Criar subtarefas pessoais fora do backlog canónico.
- Definir horários finais de reuniões além das cerimónias e regras já documentadas.
- Criar regras de negócio do produto.

##### Como saber que isto ficou bem

- Cada área técnica tem owner principal, apoio e revisor/gate.
- Cada artefacto técnico tem dono claro.
- A equipa consegue explicar a diferença entre owner, apoio e revisor.
- A distribuição não contradiz `BACKLOG-MVP.md`.
- O próximo BK consegue usar esta distribuição para confirmar ownership do backlog.

##### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `-` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-01` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: plano total publicado/validado em `BK-MF0-01` (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL > Assuncoes de execucao` e `DISTRIBUICAO-RESPONSABILIDADES` (CANONICO)
- Flow ID: `MF0-governance-kickoff-02` (DERIVADO)
- Fonte de verdade: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- Descricao: publicar responsabilidade por aluno, área, artefacto e cerimónia para sustentar execução dos BKs seguintes (DERIVADO)

##### Complemento do objetivo (DERIVADO):

- Confirmar a equipa: `Matheus`, `Mateus`, `Davi`, `Kaue` e `Nuno`.
- Confirmar responsabilidades por área funcional e por artefacto técnico.
- Garantir que `owner`, `apoio` e `revisor/gate` não são usados como sinónimos.
- Confirmar que handoff semanal P0 e pairing semanal estão definidos.
- Preparar uma checklist que `BK-MF0-03` usa para validar owners do backlog.

#### Estado antes e depois

- Estado esperado antes do BK: plano total validado em `BK-MF0-01`; responsabilidades ainda podem estar dispersas.
- Estado esperado depois do BK: owners, apoios, cerimónias, pairing e handoff P0 publicados.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: apenas este guia se forem registados ajustes/evidence do BK.
- Ficheiros a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Dependencias de BK anteriores e uso: reutiliza `BK-MF0-01` para garantir que responsabilidades derivam do plano total.
- Impacto na arquitetura da app: separa liderança de backend, frontend, dados, QA, operação e gates antes de existir código.
- Impacto em frontend/backend/dados: define owners por área, mas não cria componentes, rotas, modelos ou endpoints.
- Impacto em segurança/testes/UI: atribui segurança/RGPD a Matheus/Kaue, QA/evidências a Kaue e UI/UX a Mateus.
- Handoff para o próximo BK: entregar a `BK-MF0-03` a matriz de owners/apoios para validar backlog atómico.

#### Pré-requisitos

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: equipa, limites e regras transversais.
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`: documento alvo.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: owners e apoios por BK.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: capacidade recomendada por aluno.
- `docs/planificacao/backlogs/MF-VIEWS.md`: sequência da MF0.
- Mockup: não existe; sem impacto neste BK.
- Código: não existe app detetável; sem ficheiros técnicos a rever.

#### Glossário

- Owner: pessoa responsável por fechar o BK com evidência.
- Apoio: pessoa que ajuda, revê ou desbloqueia partes do BK.
- Revisor/gate: pessoa que valida se pode avançar.
- Handoff: passagem curta e objetiva de contexto para a equipa.
- Pairing: sessão em dupla para resolver bloqueios e transferir aprendizagem.
- Cerimónia: reunião curta com objetivo definido.
- Capacidade: quantidade realista de trabalho por sprint.
- RACI: modelo de responsabilidades; aqui usamos uma versão simples por owner/apoio/gate.

#### Conceitos teóricos essenciais

**Ownership.** Em engenharia de software, ownership significa que existe uma pessoa responsável por garantir que uma entrega fica completa, validada e documentada. Não significa que a pessoa faça tudo sozinha.

**Separação entre implementação e avaliação.** O Nuno aparece como orientador e gate, não como implementador core. Isto protege a avaliação e obriga os alunos a assumir responsabilidade técnica real.

**Pairing pedagógico.** Pairing não é dividir tarefas ao meio. É uma sessão com objetivo técnico claro, por exemplo ajudar a montar um middleware ou rever um teste. Na MF0 fica definido o mecanismo; em MF1 e seguintes será usado sobre código real.

**Handoff.** Handoff é a transferência de contexto: o que foi feito, o que falta, que riscos existem e que dependências continuam abertas. É obrigatório em BK P0 porque P0 impacta fases seguintes.

**Risco de responsabilidade difusa.** Quando todos são responsáveis, na prática ninguém é. Este BK reduz esse risco ao ligar cada área e artefacto a um owner principal.

#### Arquitetura do BK

- Endpoint(s), modelo/schema, service, controller/route, guard, cliente API e página/componente: não aplicável; a MF0 não altera a implementação da app.
- Artefacto documental: os documentos e evidences enumerados na secção seguinte e nos passos.
- Testes: validador de planificação, checks documentais e negativos descritos no tutorial.
- Handoff: contrato documental preparado para `BK-MF0-03`.

#### Ficheiros a criar/editar/rever

- CRIAR: nenhum.
- EDITAR: apenas este guia se forem registados ajustes/evidence do BK.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `docs/RF.md`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar dependência do plano total (~10 min)

1. Objetivo funcional do passo no contexto da app.

Verificar que `BK-MF0-01` foi revisto antes de publicar responsabilidades.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Rever macro fases e equipa no plano total.
- Confirmar que `BK-MF0-02` depende de `BK-MF0-01`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Responsabilidades derivam do plano, não de preferências soltas.
Snippet de referência: `Equipa tecnica: Matheus, Mateus, Davi, Kaue`

6. Validação do passo.

A distribuição usa a mesma equipa do plano.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 2 - Validar equipa e carga alvo (~10 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar nomes, papéis gerais e percentagens de carga.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Comparar secção `Equipa` com `Capacidade recomendada` no plano de sprints.
- Confirmar que Nuno tem papel de orientação e não de implementação core.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Erros de nomes ou carga afetam toda a planificação.
Snippet de referência: `Nuno: governance, gate e avaliacao`

6. Validação do passo.

Os nomes estão consistentes.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 3 - Validar matriz por área funcional (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que cada domínio do FaithFlix tem owner principal, apoio e revisor.

2. Ficheiros envolvidos.
- REVER: `docs/RF.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Rever a tabela `Matriz por area funcional`.
- Comparar com os domínios do README e RF.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Áreas como autenticação, catálogo, streaming e pool solidária cruzam vários BKs.
Snippet de referência: `Pool de associacoes | Davi | Kaue | Nuno`

6. Validação do passo.

Nenhum domínio principal do MVP fica sem owner.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 4 - Validar matriz por artefacto (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar quem responde por rotas, modelos, páginas, testes, métricas e evidências.

2. Ficheiros envolvidos.
- REVER: `docs/RNF.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Rever a tabela `Matriz por artefacto`.
- Cruzar com RNF27, RNF28, RNF29 e RNF30.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Os BKs futuros vão pedir ficheiros concretos; a equipa deve saber quem lidera cada tipo de artefacto.
Snippet de referência: `Testes E2E/integração | Kaue | Mateus`

6. Validação do passo.

QA/evidências têm dono claro.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 5 - Cruzar owners com backlog (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que cada BK em `BACKLOG-MVP.md` tem owner único e apoio coerente.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Rever a tabela da `MF1` e confirmar owners técnicos.
- Rever uma amostra de `MF2..MF6` para validar áreas funcionais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A distribuição só é útil se bater certo com o backlog operacional.
Snippet de referência: `BK-MF1-01 | Matheus | Davi`

6. Validação do passo.

Não há BK sem owner.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 6 - Validar cerimónias (~10 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que planning, sync, review, retro, gate, handoff e pairing têm frequência e resultado.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Rever a tabela `Cerimonias`.
- Confirmar que cada cerimónia tem owner e resultado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Cerimónias sem output viram reuniões sem valor.
Snippet de referência: `Handoff BK P0 | semanal | Owner do BK P0`

6. Validação do passo.

Todas as cerimónias têm propósito verificável.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 7 - Confirmar mecanismos pedagógicos (~10 min)

1. Objetivo funcional do passo no contexto da app.

Garantir que handoff P0 e pairing semanal estão escritos como ações concretas.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Rever `Handoff semanal de BK P0`.
- Rever `Pairing semanal (60-90 min)`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A PAP avalia produto e processo; aprendizagem transferida precisa de registo.
Snippet de referência: `1 aprendizagem transferida registada`

6. Validação do passo.

O mecanismo é executável por alunos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 8 - Executar negativos documentais (~10 min)

1. Objetivo funcional do passo no contexto da app.

Procurar falhas típicas na distribuição.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`

3. Instruções do que fazer.

- Procurar BK sem owner no backlog.
- Procurar área funcional sem owner principal.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Um erro de ownership propaga-se para todos os BKs.
Snippet de referência: `Cada BK tem owner unico`

6. Validação do passo.

Pelo menos 3 negativos P0 ficam registados.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 9 - Fechar evidence e handoff (~10 min)

1. Objetivo funcional do passo no contexto da app.

Preparar evidência e entregar a `BK-MF0-03` a distribuição validada.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`

3. Instruções do que fazer.

- Preencher `pr`, `proof` e `neg`.
- Entregar resumo de owners por área a quem vai validar backlog.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O backlog atómico precisa desta distribuição para confirmar owners/apoios por BK.
Snippet de referência: `proximo_bk: BK-MF0-03`

6. Validação do passo.

`BK-MF0-03` consegue reutilizar owners sem decidir tudo outra vez.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

#### Critérios de aceite

**Outputs:**
- Documento de distribuição revisto e publicável.
- Resumo de owner/apoio por área pronto para usar no backlog.

**Verificacoes:**
- 100% dos BKs do backlog têm owner.
- Nuno aparece como orientação/gate, não como owner core recorrente.
- Handoff P0 e pairing semanal estão documentados.

**Qualidade:**
- Responsabilidades escritas de forma clara para alunos.
- Sem drift em owner, prioridade ou dependências.

**Continuidade:**
- `BK-MF0-03` usa esta distribuição para validar o backlog atómico.
- `MF1` fica com Matheus/Mateus/Davi/Kaue preparados para áreas técnicas.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Validação final

**Smoke**
- [ ] `DISTRIBUICAO-RESPONSABILIDADES.md` existe e está ativo.
- [ ] Equipa e papéis gerais coincidem com o plano total.
- [ ] Cada área funcional tem owner, apoio e revisor/gate.

**Negativos**
- [ ] Passo: 4; input/acao: procurar BK sem owner; resultado esperado: nenhum BK sem owner; risco que cobre: trabalho sem responsável.
- [ ] Passo: 2; input/acao: procurar área funcional sem owner principal; resultado esperado: nenhuma área sem owner; risco que cobre: domínio crítico abandonado.
- [ ] Passo: 1; input/acao: verificar se Nuno aparece como implementador core recorrente; resultado esperado: Nuno fica em governance/gate; risco que cobre: avaliação misturada com implementação.

**Tecnico**
- [ ] Owners do backlog não foram alterados.
- [ ] A distribuição reforça RNF27, RNF28, RNF29 e RNF30 sem criar novas dependências.
- [ ] O próximo BK recomendado é `BK-MF0-03`.

**Regressao das fases anteriores**
- [ ] `BK-MF0-01` continua como dependência e fonte do plano.

**UI/mockup**
- [ ] Sem mockup; este BK não define navegação, layout ou componentes.

**Seguranca**
- [ ] Áreas de autenticação, sessão, RGPD e segurança têm owners claros.
- [ ] Nenhuma credencial, segredo ou conta real é registada no documento.

#### Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

##### TODOs

- TODO: preencher evidence real quando a equipa executar a validação.
- TODO: confirmar em reunião se todos os alunos aceitam owner/apoio atribuídos.
- TODO (BLOCKER): se algum aluno mudar de disponibilidade, atualizar distribuição e backlog no mesmo ciclo.
- FOLLOW-UP: usar owners validados em `BK-MF0-03`.
- Assuncao a validar com o orientador: a distribuição por áreas continua adequada antes de arrancar `MF1`.
- Decisao dependente de mockup: nenhuma nesta fase.
- Decisao dependente de app/codigo ainda inexistente: responsabilidades por ficheiros concretos só serão fechadas em `MF1`.

##### Snippet técnico aplicável

```text
CHECK BK-MF0-02
1. plano_total.aprovado == true
2. todos_bk.tem_owner_unico == true
3. areas_funcionais.tem_owner_e_apoio == true
4. nuno.papel in ["governance", "gate", "avaliacao"]
5. pairing_e_handoff.documentados == true
```

#### Handoff

`BK-MF0-03`

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de ownership, pairing e handoff da MF0.
