# BK-MF0-05 - Definir calendario de sprints

## Header

- `doc_id`: `GUIA-BK-MF0-05`
- `bk_id`: `BK-MF0-05`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `-`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-06`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK ensina que um calendário de sprints não é só uma tabela de datas: é uma decisão de capacidade, prioridade, risco e validação. Para alunos, isto ajuda a perceber porque não se deve encher uma semana com trabalho que não dá tempo de testar.

##### Resultado operacional esperado

O trabalho operacional é validar `docs/planificacao/sprints/PLANO-SPRINTS.md`, garantindo que os 66 BK estão distribuídos por 13 sprints, com carga controlada, excecoes S12/S13 documentadas e gates claros.

##### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. O calendário pode posicionar `BK-MF1-01` e `BK-MF1-02`, mas isso é handoff de planeamento, não implementação em `MF0`.

##### Enquadramento do BK

##### O que vamos fazer neste BK

Neste BK vamos definir e validar o calendário de sprints da PAP FaithFlix. O calendário distribui os BKs ao longo de 13 sprints, respeitando capacidade recomendada dos alunos, prioridade dos BKs e gates `S4`, `S8`, `S12` e `S13`.

O calendário também garante continuidade técnica: a Sprint 1 começa com governance e arranque (`BK-MF0-01..06`) e ainda prepara a fundação técnica com `BK-MF1-01` e `BK-MF1-02`. Isto significa que a equipa não fica parada depois da MF0: termina alinhamento e começa a estrutura base.

A fase foi detalhada sem mockup e sem código existente. Isso é aceitável porque o calendário prepara execução futura; as validações de UI e comandos de build serão concretizadas quando a app existir em `MF1` e seguintes.

#### Importância

- Ajuda a equipa a trabalhar em ciclos curtos e validáveis.
- Evita picos de carga acima do limite de 11 pontos.
- Garante que BKs P0 aparecem cedo e não ficam para o fim.
- Reserva gates formais para corrigir drift antes da defesa.
- Desbloqueia `BK-MF0-06`, onde a equipa valida se percebe o plano e o calendário.

#### Scope-in

- Validar calendário de 13 sprints.
- Confirmar carga alvo por sprint e limite máximo.
- Confirmar que Sprint 1 contém MF0 e início de MF1.
- Confirmar gates `S4/S8/S12/S13`.
- Confirmar regras de replaneamento e checkpoints semanais.

#### Scope-out

- Alterar datas reais do calendário escolar sem confirmação externa.
- Reatribuir BKs a outros alunos.
- Mudar escopo funcional ou remover BKs.
- Criar cronogramas paralelos fora do plano oficial.
- Fechar BKs como `DONE` só por estarem planeados.

##### Como saber que isto ficou bem

- Todas as sprints têm foco, BKs alvo e carga alvo.
- Nenhuma sprint ultrapassa 11 pontos planeados.
- Os gates aparecem com critérios objetivos.
- A Sprint 1 fecha MF0 e prepara MF1.
- O calendário considera validação/evidence, não apenas escrita de código.

##### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `-` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: backlog atómico publicado; DoD pode ser usado como referência de validação mesmo sem dependência canónica (DERIVADO)
- Ref. Plano: `PLANO-SPRINTS > Calendario de 13 sprints` e `PLANO-IMPLEMENTACAO-TOTAL > Gates` (CANONICO)
- Flow ID: `MF0-governance-kickoff-05` (DERIVADO)
- Fonte de verdade: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- Descricao: validar calendário de sprints, carga, gates e regras de replaneamento para execução cumulativa (DERIVADO)

##### Complemento do objetivo (DERIVADO):

- Confirmar que as 13 sprints cobrem os 66 BK.
- Confirmar que Sprint 1 contém `BK-MF0-01..06`, `BK-MF1-01` e `BK-MF1-02`.
- Confirmar que cargas planeadas respeitam o limite `<= 11`.
- Confirmar que os gates têm critérios de validação, não apenas datas.
- Preparar agenda de reunião para `BK-MF0-06`.

#### Estado antes e depois

- Estado esperado antes do BK: backlog atómico existe; calendário precisa de validação de carga, sequência e gates.
- Estado esperado depois do BK: 13 sprints validadas e agenda de alinhamento pronta.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: apenas este guia se forem registados ajustes/evidence do BK.
- Ficheiros a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/sprints/SCORECARD-SPRINTS.md`, `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MF-VIEWS.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF0-03`; reutiliza o DoD de `BK-MF0-04` como regra de planeamento, sem alterar dependência canónica.
- Impacto na arquitetura da app: agenda a fundação técnica antes do core funcional, mantendo a ordem MF0 -> MF1 -> MF2.
- Impacto em frontend/backend/dados: posiciona `BK-MF1-01` e `BK-MF1-02` na Sprint 1, mas não cria ficheiros.
- Impacto em segurança/testes/UI: mantém sprints futuras para sessão segura, smoke tests, hardening e UX.
- Handoff para o próximo BK: entregar a `BK-MF0-06` calendário, foco da Sprint 1, gates e regras de remediação.

#### Pré-requisitos

- `docs/planificacao/backlogs/BACKLOG-MVP.md`: BKs e esforço `S/M/L`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: documento alvo.
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`: cargas planeadas e critérios.
- `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`: checkpoints por dia.
- `docs/planificacao/backlogs/MF-VIEWS.md`: ordem por macro fase.
- Guia `BK-MF0-04`: DoD/evidence para considerar tempo de validação.
- Mockup: não existe; sem impacto direto no calendário.
- Código: não existe app detetável; comandos futuros serão fechados em MF1.

#### Glossário

- Sprint: período curto de execução com objetivo definido.
- Carga: soma dos pontos planeados para uma sprint.
- Ponto: unidade simples de esforço (`S=1`, `M=2`, `L=3`).
- Sprint goal: objetivo central da semana.
- Gate: validação formal num marco do plano.
- Remediação: ação corretiva quando há atraso, drift ou evidence incompleta.
- Semáforo de risco: indicador verde/amarelo/vermelho.
- Replaneamento: ajuste controlado sem quebrar prioridades.

#### Conceitos teóricos essenciais

**Capacidade.** Capacidade é o trabalho que a equipa consegue fazer com qualidade. Não é o máximo imaginável; é o máximo sustentável com implementação, testes, evidence e revisão.

**Pontos de esforço.** A escala `S/M/L` evita falsas precisões. Em vez de prometer horas exatas, a equipa estima tamanho relativo: pequeno, médio ou grande.

**Sprint goal.** Um sprint goal dá foco. "Governance e arranque" na Sprint 1 significa que a prioridade é alinhar e preparar base, não desenvolver catálogo ou streaming.

**Gates e remediação.** Gates só são úteis se houver ação corretiva. O plano define que drift documental deve ser corrigido em 24h e BK P0 atrasado até quarta exige corte de P2 e pairing.

**Risco de sobrecarga.** Uma sprint cheia demais aumenta erros e reduz aprendizagem. O limite de 11 pontos ajuda a manter trabalho realista para quatro alunos.

#### Arquitetura do BK

- Endpoint(s), modelo/schema, service, controller/route, guard, cliente API e página/componente: não aplicável; a MF0 não altera a implementação da app.
- Artefacto documental: os documentos e evidences enumerados na secção seguinte e nos passos.
- Testes: validador de planificação, checks documentais e negativos descritos no tutorial.
- Handoff: contrato documental preparado para `BK-MF0-06`.

#### Ficheiros a criar/editar/rever

- CRIAR: nenhum.
- EDITAR: apenas este guia se forem registados ajustes/evidence do BK.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/sprints/SCORECARD-SPRINTS.md`, `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MF-VIEWS.md`.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- REVER: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar dependência do backlog (~10 min)

1. Objetivo funcional do passo no contexto da app.

Verificar que o calendário é derivado do backlog atómico.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Rever a dependência `BK-MF0-03`.
- Confirmar que o plano de sprints menciona 66 BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não se planeia sprint com itens fora do backlog.
Snippet de referência: `Planeamento alinhado ao backlog final de 66 BK`

6. Validação do passo.

Calendário não contém BK fora do backlog.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 2 - Validar capacidade recomendada (~10 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar capacidade semanal por aluno e papel do Nuno.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Rever a secção `Capacidade recomendada`.
- Cruzar com distribuição de responsabilidades.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A carga de sprint precisa ser realista para equipa de 4 alunos.
Snippet de referência: `Matheus: 3 a 4 pontos/semana`

6. Validação do passo.

Nenhum aluno é tratado como capacidade ilimitada.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 3 - Validar conversão de esforço (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que `S=1`, `M=2`, `L=3`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Rever a secção `Conversao de pontos`.
- Confirmar que o scorecard usa cargas planeadas compatíveis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A soma de carga depende desta regra.
Snippet de referência: `S = 1; M = 2; L = 3`

6. Validação do passo.

A mesma regra é usada na planificação.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 4 - Validar calendário de 13 sprints (~20 min)

1. Objetivo funcional do passo no contexto da app.

Rever todas as linhas do calendário e confirmar foco, BKs alvo e carga.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Percorrer a tabela de `Sprint 1` a `Sprint 12`.
- Confirmar que a carga alvo não passa de 11.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A equipa precisa saber quando cada macro fase acontece.
Snippet de referência: `Regra operacional: nenhuma sprint pode ultrapassar 11 pontos`

6. Validação do passo.

Todas as cargas estão dentro do limite.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 5 - Validar Sprint 1 em detalhe (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que Sprint 1 fecha MF0 e arranca MF1 com backend/frontend base.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Rever linha da Sprint 1.
- Cruzar com MF views da MF0 e MF1.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A transição MF0->MF1 é crítica para continuidade.
Snippet de referência: `BK-MF0-01..06, BK-MF1-01, BK-MF1-02`

6. Validação do passo.

O calendário não deixa hiato entre governance e fundação técnica.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 6 - Validar gates (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que `S4`, `S8`, `S12` e `S13` têm critérios e registo obrigatório.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Rever secções de gates.
- Comparar com `PLANO-IMPLEMENTACAO-TOTAL.md`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Gates controlam qualidade documental e técnica ao longo do projeto.
Snippet de referência: `PASS ou FAIL + acao corretiva + dono + prazo`

6. Validação do passo.

Gates têm resultado e ação, não só descrição.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 7 - Validar checkpoints semanais (~10 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que segunda a sexta têm ações claras.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Rever `Step-by-step semanal`.
- Cruzar com `GUIAO-DOCENTE-SEMANAL.md`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Alunos precisam de ritmo de execução, não só fim da semana.
Snippet de referência: `Segunda: arranque; Quinta: pre-gate; Sexta: fecho`

6. Validação do passo.

Cada dia tem objetivo operacional.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 8 - Executar negativos documentais (~15 min)

1. Objetivo funcional do passo no contexto da app.

Procurar incoerências de carga, sequência ou cobertura.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/sprints/PLANO-SPRINTS.md`

3. Instruções do que fazer.

- Procurar sprint com carga `> 11`.
- Procurar BK planeado antes da sua dependência.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Calendário errado gera atrasos e scope creep.
Snippet de referência: `BK P0 nao fechado regressa ao topo da sprint seguinte`

6. Validação do passo.

Pelo menos 3 negativos P0 documentados.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 9 - Fechar agenda para reunião inicial (~10 min)

1. Objetivo funcional do passo no contexto da app.

Preparar o conteúdo que será validado em `BK-MF0-06`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md`

3. Instruções do que fazer.

- Listar as decisões que a equipa deve confirmar.
- Preencher evidence e preparar handoff.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A reunião final da MF0 precisa de inputs claros: plano, responsabilidades, backlog, DoD e calendário.
Snippet de referência: `proximo_bk: BK-MF0-06`

6. Validação do passo.

`BK-MF0-06` tem agenda objetiva.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

#### Critérios de aceite

**Outputs:**
- Calendário de 13 sprints validado.
- Agenda de reunião inicial preparada.

**Verificacoes:**
- Nenhuma sprint acima de 11 pontos.
- Gates `S4/S8/S12/S13` com critérios.
- Scorecard alinhado com cargas planeadas.

**Qualidade:**
- Calendário legível para alunos e orientador.
- Sem alteração de backlog ou escopo.

**Continuidade:**
- `BK-MF0-06` consegue validar compromissos da Sprint 1.
- `MF1` fica pronta para arrancar logo após alinhamento.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Validação final

**Smoke**
- [ ] `PLANO-SPRINTS.md` existe e está ativo.
- [ ] Há 13 sprints.
- [ ] Todas as sprints têm foco, BKs alvo e carga.
- [ ] Sprint 1 contém `BK-MF0-01..06`, `BK-MF1-01`, `BK-MF1-02`.

**Negativos**
- [ ] Passo: 3; input/acao: procurar sprint com carga `> 11`; resultado esperado: nenhuma; risco que cobre: sobrecarga.
- [ ] Passo: 7; input/acao: procurar BK antes da dependência; resultado esperado: dependências respeitadas; risco que cobre: execução impossível.
- [ ] Passo: 5; input/acao: procurar gate sem ação corretiva; resultado esperado: todos exigem PASS/FAIL + ação; risco que cobre: gate simbólico.

**Tecnico**
- [ ] Cargas do plano coincidem com scorecard.
- [ ] Regras de replaneamento preservam P0.
- [ ] O próximo BK recomendado é `BK-MF0-06`.

**Regressao das fases anteriores**
- [ ] `BK-MF0-03` mantém-se como dependência canónica.
- [ ] DoD de `BK-MF0-04` é considerado no fecho semanal, mesmo sem ser dependência formal.

**UI/mockup**
- [ ] Sem mockup; calendário não inventa ecrãs nem design final.

**Seguranca**
- [ ] Sprints futuras preservam BKs de sessão segura, hardening e RGPD.
- [ ] Nenhuma data ou integração externa é inventada.

#### Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/sprints/SCORECARD-SPRINTS.md`, `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

##### TODOs

- TODO: preencher evidence real após validação do calendário.
- TODO: confirmar datas reais com o calendário escolar, se necessário.
- TODO (BLOCKER): se uma sprint ultrapassar 11 pontos após mudança futura, replanear antes de executar.
- FOLLOW-UP: usar agenda preparada em `BK-MF0-06`.
- Assuncao a validar com o orientador: cargas planeadas continuam adequadas à disponibilidade da equipa.
- Decisao dependente de mockup: nenhuma nesta fase.
- Decisao dependente de app/codigo ainda inexistente: comandos de validação técnicos serão concretizados em `MF1`.

##### Snippet técnico aplicável

```text
CHECK BK-MF0-05
1. len(sprints) == 13
2. all(sprint.carga_planeada <= 11 or sprint.id in ["S12", "S13"])
3. sprint_1.includes(BK-MF0-01..BK-MF0-06)
4. gates == ["S4", "S8", "S12", "S13"]
5. scorecard.cargas == plano_sprints.cargas
```

#### Handoff

`BK-MF0-06`

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de calendário, capacidade, gates e replaneamento.
