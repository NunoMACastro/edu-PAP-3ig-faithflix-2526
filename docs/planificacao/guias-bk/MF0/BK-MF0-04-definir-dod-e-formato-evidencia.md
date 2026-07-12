# BK-MF0-04 - Definir DoD e formato de evidencia

## Header

- `doc_id`: `GUIA-BK-MF0-04`
- `bk_id`: `BK-MF0-04`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-05`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK ensina o que significa "feito" num projeto técnico. Para os alunos, a ideia essencial é: um BK não está concluído só porque o código ou documento foi escrito; precisa de validação, negativos, regressão e evidência.

##### Resultado operacional esperado

O trabalho operacional é transformar as regras do backlog, matriz e plano de sprints numa Definition of Done comum para todos os BK, com formato de evidence reutilizável até à defesa.

##### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. Exemplos técnicos neste guia são exemplos de validação futura; não são tarefas de implementação da `MF0`.

##### Enquadramento do BK

##### O que vamos fazer neste BK

Neste BK vamos definir a Definition of Done (DoD) e o formato mínimo de evidência para fechar BKs do FaithFlix. O DoD é a lista objetiva que diz quando uma entrega pode ser marcada como `DONE`. A evidence é o conjunto de provas que acompanha essa decisão: PR/commit, prova do caso válido, negativos e ficheiros/comandos relevantes.

O resultado deve ser usado por todos os BKs seguintes, incluindo BKs técnicos de backend, frontend, dados, segurança, testes e UI. Como a MF0 não implementa produto funcional, este BK prepara o contrato de qualidade que será aplicado quando a app começar a ser construída em `MF1`.

A fase foi detalhada sem mockup. Para BKs de UI futuros, o DoD deve prever campo de screenshots/mockup quando aplicável, mas este BK não define identidade visual final.

#### Importância

- Impede que BKs sejam fechados sem prova.
- Torna os critérios de aceite mensuráveis e auditáveis.
- Obriga a testar negativos, especialmente em BKs P0/P1.
- Cria padrão comum para defesa da PAP.
- Desbloqueia `BK-MF0-05`, porque o calendário de sprints precisa saber que evidência será exigida no fecho semanal.

#### Scope-in

- Definir o que significa `DONE` para BKs documentais e técnicos.
- Definir evidence mínima: `pr`, `proof`, `neg`, `files`, `commands`, `screenshots`, `notes`.
- Definir política de negativos por prioridade.
- Definir regressão mínima contra BKs anteriores.
- Definir como tratar blockers e TODOs.

#### Scope-out

- Executar testes reais da app, porque ainda não há código.
- Criar ferramenta nova de CI/CD.
- Alterar backlog, matriz ou plano de sprints.
- Definir critérios específicos de cada RF futuro em detalhe final.
- Substituir validação humana do orientador.
- Criar ou editar um documento canónico novo de DoD sem decisão explícita do orientador.

##### Como saber que isto ficou bem

- Qualquer aluno consegue olhar para um BK e saber que provas precisa anexar.
- A política `P0/P1 >= 3 negativos` e `P2 >= 1 negativo` fica clara.
- O formato de evidence serve tanto para documentação como para código.
- O DoD inclui smoke, negativos, técnica, regressão, UI/mockup quando aplicável e segurança quando aplicável.
- O próximo BK pode planear sprints sabendo o custo real de validar e fechar.

##### Papel deste BK no produto final

Este BK não cria funcionalidades do FaithFlix, mas cria a regra de qualidade que vai acompanhar todas elas. Quando a equipa chegar a autenticação, catálogo, streaming, favoritos, recomendações, subscrições, pool solidária, privacidade e evidências PAP, cada entrega terá de provar que funciona, que negativos foram testados e que não quebrou contratos anteriores.

##### Artefacto de DoD nesta execucao

Nao existe no repositorio, nesta data, um ficheiro separado chamado `DOD.md`, `DEFINITION-OF-DONE.md` ou equivalente. Por isso, neste BK o contrato operacional de DoD/evidence fica documentado neste proprio guia, nas secoes `Checklist de validacao`, `Criterios de aceite`, `Evidence (para o PR/defesa)` e `Snippet tecnico aplicavel`.

Se o orientador quiser promover este contrato para artefacto canonico separado, essa decisao deve ser registada antes de editar `_TEMPLATE-BK.md`, `BACKLOG-MVP.md`, `SCORECARD-SPRINTS.md` ou criar novo ficheiro. Ate essa decisao existir, este BK nao altera contratos canonicos fora do proprio guia.

##### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Matheus, Mateus, Davi, Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: backlog atómico validado e campos BK estáveis (DERIVADO)
- Ref. Plano: `BACKLOG-MVP > Contrato pedagogico v3`, `PLANO-SPRINTS > Gates obrigatorios`, `_TEMPLATE-BK.md` (CANONICO)
- Flow ID: `MF0-governance-kickoff-04` (DERIVADO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Fonte de verdade: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- Descricao: definir DoD e evidence mínima para fechar BKs com prova objetiva, negativos e continuidade (DERIVADO)

##### Complemento do objetivo (DERIVADO):

- Reutilizar o backlog atómico de `BK-MF0-03`.
- Escrever regras de fecho aplicáveis a qualquer BK.
- Definir evidence mínima e placeholders quando ainda não há execução.
- Explicar aos alunos a diferença entre smoke, negativo, regressão e proof.
- Preparar handoff para calendário de sprints, incluindo tempo real para validação.

#### Estado antes e depois

- Estado esperado antes do BK: backlog atómico validado, mas ainda sem contrato operacional de fecho.
- Estado esperado depois do BK: DoD e formato de evidence definidos para BKs documentais e técnicos.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`, apenas nas secoes de DoD/evidence deste guia.
- Ficheiros a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/sprints/SCORECARD-SPRINTS.md`, `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF0-03` para saber que BKs e campos o DoD vai avaliar.
- Impacto na arquitetura da app: cria contrato de qualidade que futuros módulos backend/frontend/dados terão de cumprir.
- Impacto em frontend/backend/dados: define formato de validação para quando essas camadas forem criadas em `MF1+`.
- Impacto em segurança/testes/UI: obriga negativos de segurança quando aplicável, regressão, smoke e screenshots em BKs de UI.
- Handoff para o próximo BK: entregar a `BK-MF0-05` a regra de que sprints devem reservar tempo para validação/evidence.

##### Mapa de ficheiros e localização (DERIVADO):

| Acao | Caminho | Localizacao exata | Regra |
| --- | --- | --- | --- |
| Criar | `-` | `-` | Este BK nao cria ficheiros novos enquanto nao houver decisao do orientador para artefacto DoD separado. |
| Editar | `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md` | Secoes `Checklist de validacao`, `Criterios de aceite`, `Evidence (para o PR/defesa)` e `Snippet tecnico aplicavel` | Registar o contrato operacional de DoD/evidence deste BK. |
| Rever | `docs/planificacao/backlogs/BACKLOG-MVP.md` | `Contrato pedagogico v3` e `Criterios de aceite globais por BK` | Confirmar politica `P0/P1 >= 3`, `P2 >= 1`, trio `pr/proof/neg` e criterios mensuraveis. |
| Rever | `docs/planificacao/guias-bk/_TEMPLATE-BK.md` | Estrutura de `Bloco operacional`, `Criterios de aceite` e `Evidence` | Confirmar que os guias futuros têm secoes onde aplicar a DoD. |
| Rever | `docs/planificacao/sprints/PLANO-SPRINTS.md` | `Gates obrigatorios de conformidade` | Confirmar que os gates exigem evidence e criterios mensuraveis. |

##### Bloqueio/decisão necessária (DERIVADO):

- Falta uma decisao explicita sobre criar um artefacto canonico separado para DoD/evidence, por exemplo `docs/planificacao/DOD-E-EVIDENCIAS.md`, ou sobre promover este contrato para `_TEMPLATE-BK.md`.
- Ate essa decisao existir, a acao segura e documentar a DoD operacional neste guia e nao alterar outros documentos canonicos.
- O BK fica bloqueado apenas se a equipa exigir que a DoD esteja num ficheiro separado antes de fechar a `MF0`. Nesse caso, Nuno deve escolher o caminho oficial e autorizar a criacao/edicao desse documento.

#### Pré-requisitos

- `docs/planificacao/backlogs/BACKLOG-MVP.md`: contrato pedagógico v3 e critérios globais.
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`: estrutura mínima atual dos guias.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: gates `S4/S8/S12/S13`.
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`: critérios de avaliação por sprint.
- `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`: remediação e evidence incompleta.
- Guias `MF0/BK-MF0-01..03`: outputs anteriores.
- Mockup: não existe; screenshots só serão obrigatórios em BKs de UI quando aplicável.
- Código: não existe app detetável; comandos técnicos ficam como contrato futuro.

#### Glossário

- DoD: Definition of Done, lista do que tem de estar verdadeiro para fechar.
- Evidence: provas objetivas anexadas ao BK.
- Smoke test: teste rápido do fluxo principal.
- Negativo: teste de erro, limite ou uso indevido.
- Regressão: validação de que algo anterior não quebrou.
- Proof: prova do caso válido, como log, output, screenshot ou teste.
- Gate: validação formal por janela de sprint.
- Blocker: impedimento que bloqueia avanço sem decisão.

#### Conceitos teóricos essenciais

**Definition of Done.** DoD é um acordo de qualidade. Em software, "funciona no meu computador" não chega. O BK só fecha quando cumpre critérios, testes e evidências acordadas.

**Smoke vs negativos.** Smoke confirma o caminho feliz: por exemplo, "o endpoint responde 200". Negativo confirma robustez: por exemplo, "dados inválidos respondem 400". Os dois são necessários.

**Regressão.** Regressão acontece quando uma nova alteração quebra algo que já estava certo. Por isso, cada BK deve validar dependências anteriores, mesmo quando trabalha noutra área.

**Evidence auditável.** Evidence deve ser objetiva. "Testei e deu" é fraco; `npm test passou`, screenshot, log ou output de comando são provas mais fortes.

**Segurança no DoD.** BKs com autenticação, passwords, dados pessoais, pagamento simulado ou pool solidária devem ter negativos de segurança. Isto evita fechar código que aceita input perigoso, expõe dados ou ignora permissões.

#### Arquitetura do BK

- Endpoint(s), modelo/schema, service, controller/route, guard, cliente API e página/componente: não aplicável; a MF0 não altera a implementação da app.
- Artefacto documental: os documentos e evidences enumerados na secção seguinte e nos passos.
- Testes: validador de planificação, checks documentais e negativos descritos no tutorial.
- Handoff: contrato documental preparado para `BK-MF0-05`.

#### Ficheiros a criar/editar/rever

- CRIAR: nenhum.
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`, apenas nas secoes de DoD/evidence deste guia.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/sprints/SCORECARD-SPRINTS.md`, `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`.
- CRIAR: `-`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: guia do BK em execução
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`, secao `Evidence (para o PR/defesa)`
- REVER: `docs/RF.md`, `docs/RNF.md`
- EDITAR: guias BK
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/RNF.md`
- EDITAR: guias BK de frontend futuros
- EDITAR: guias BK técnicos futuros

#### Tutorial técnico linear

### Passo 1 - Confirmar backlog validado (~10 min)

1. Objetivo funcional do passo no contexto da app.

Verificar que `BK-MF0-03` entregou a lista estável de BKs.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`

3. Instruções do que fazer.

- Rever o contrato pedagógico v3 no backlog.
- Confirmar política de negativos por prioridade.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não se define DoD no vazio; o DoD avalia BKs concretos.
Snippet de referência: `P0/P1 >= 3; P2 >= 1`

6. Validação do passo.

A política de negativos fica preservada.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 2 - Definir estados de fecho (~10 min)

1. Objetivo funcional do passo no contexto da app.

Clarificar quando usar `TODO`, `IN_PROGRESS`, `BLOCKED` e `DONE`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: guia do BK em execução

3. Instruções do que fazer.

- Rever valores permitidos no backlog.
- Escrever regra prática para cada estado na evidência do BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Estados errados mascaram risco real da sprint.
Snippet de referência: `estado so permite TODO|IN_PROGRESS|BLOCKED|DONE`

6. Validação do passo.

`DONE` exige evidence, não apenas intenção.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 3 - Definir evidence mínima (~15 min)

1. Objetivo funcional do passo no contexto da app.

Padronizar os campos `pr`, `proof`, `neg`, `files`, `commands`, `screenshots`, `notes`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`, secao `Evidence (para o PR/defesa)`

3. Instruções do que fazer.

- Rever template de BK.
- Complementar com campos pedidos na prompt e no backlog.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem formato comum, a defesa fica difícil de auditar.
Snippet de referência: `Evidence minima por BK: trio pr, proof, neg`

6. Validação do passo.

Os campos aceitam placeholders claros enquanto não há execução.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 4 - Definir smoke por tipo de BK (~15 min)

1. Objetivo funcional do passo no contexto da app.

Explicar como smoke muda entre documentação, backend, frontend, dados e segurança.

2. Ficheiros envolvidos.
- REVER: `docs/RF.md`, `docs/RNF.md`
- EDITAR: guia do BK em execução

3. Instruções do que fazer.

- Listar exemplos de smoke por tipo de BK.
- Garantir que não inventa endpoints futuros sem RF/RNF.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O aluno precisa saber validar o fluxo principal do seu BK.
Snippet de referência: `backend: endpoint válido responde código esperado`

6. Validação do passo.

Exemplos são genéricos o suficiente para não criar requisitos novos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 5 - Definir negativos por prioridade (~15 min)

1. Objetivo funcional do passo no contexto da app.

Transformar a política de negativos em regra executável.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: guias BK

3. Instruções do que fazer.

- Definir mínimo de cenários por prioridade.
- Exigir em cada negativo passo, input/ação, resultado esperado e risco coberto.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Negativos reduzem bugs, falhas de segurança e regressões.
Snippet de referência: `passo; input/acao; resultado esperado; risco que cobre`

6. Validação do passo.

P0 inclui pelo menos 3 negativos concretos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 6 - Definir regressão mínima (~15 min)

1. Objetivo funcional do passo no contexto da app.

Exigir validação contra dependências e BKs anteriores relevantes.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- EDITAR: guias BK

3. Instruções do que fazer.

- Cada guia deve listar dependências e como são usadas.
- Cada checklist deve incluir regressão das fases anteriores quando existir.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

BKs cumulativos não podem quebrar contratos anteriores.
Snippet de referência: `Regressao das fases anteriores`

6. Validação do passo.

MF0 indica não aplicável antes do primeiro BK, mas BKs seguintes validam dependências.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 7 - Definir DoD para UI/mockup (~10 min)

1. Objetivo funcional do passo no contexto da app.

Preparar regra para quando existirem BKs de frontend/UI.

2. Ficheiros envolvidos.
- REVER: `docs/RNF.md`
- EDITAR: guias BK de frontend futuros

3. Instruções do que fazer.

- Escrever que screenshots são obrigatórios quando houver UI aplicável.
- Escrever que ausência de mockup deve ser registada, não inventada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Mockup orienta fluxo, mas não é contrato pixel-perfect.
Snippet de referência: `screenshots: Nao aplicavel; BK documental sem UI`

6. Validação do passo.

Este BK não cria identidade visual definitiva.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 8 - Definir DoD de segurança (~15 min)

1. Objetivo funcional do passo no contexto da app.

Preparar exigências mínimas para BKs com dados sensíveis, auth, permissões, pagamentos ou RGPD.

2. Ficheiros envolvidos.
- REVER: `docs/RNF.md`
- EDITAR: guias BK técnicos futuros

3. Instruções do que fazer.

- Rever RNF13..RNF20 e RNF37.
- Exigir negativos de segurança quando aplicável.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Segurança é prioridade nos RNF e não deve ser validada só no fim.
Snippet de referência: `Nao guardar passwords em texto puro`

6. Validação do passo.

O DoD força validação de riscos, não só funcionalidade.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 9 - Fechar evidence e handoff (~10 min)

1. Objetivo funcional do passo no contexto da app.

Entregar o formato de DoD para ser usado no calendário.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`

3. Instruções do que fazer.

- Preencher evidence do BK.
- Resumir para `BK-MF0-05` a política de fecho por BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sprint planning deve considerar tempo de validação, não só implementação.
Snippet de referência: `proximo_bk: BK-MF0-05`

6. Validação do passo.

O calendário futuro reserva espaço mental para validação/evidence.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

#### Critérios de aceite

**Outputs:**
- DoD comum definido para BKs documentais e técnicos.
- Formato de evidence mínimo definido.
- Local operacional da DoD identificado: este guia, ate haver decisao para artefacto separado.

**Verificacoes:**
- Campos `pr`, `proof`, `neg`, `files`, `commands`, `screenshots`, `notes` presentes.
- Política de negativos por prioridade explícita.
- Regressão e segurança incluídas quando aplicável.
- Existe decisao escrita sobre nao criar ficheiro DoD separado nesta fase sem confirmacao do orientador.

**Qualidade:**
- Critérios mensuráveis e compreensíveis para alunos.
- Sem dependências novas e sem alteração de escopo.

**Continuidade:**
- `BK-MF0-05` consegue planear sprints sabendo o custo de validação.
- BKs de `MF1..MF8` podem reutilizar o mesmo padrão.
- Se Nuno decidir criar artefacto canonico separado, essa acao fica como decisao posterior e nao como suposicao silenciosa.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Validação final

**Smoke**
- [ ] DoD exige implementação/entrega concluída pelo owner.
- [ ] DoD exige critérios mensuráveis e evidence.
- [ ] DoD distingue smoke, negativos, regressão e segurança.
- [ ] O local onde a DoD operacional fica registada esta identificado neste guia.

**Negativos**
- [ ] Passo: 4; input/acao: tentar fechar P0 com apenas 1 negativo; resultado esperado: fecho rejeitado; risco que cobre: validação insuficiente.
- [ ] Passo: 2; input/acao: tentar fechar BK sem `proof`; resultado esperado: fecho bloqueado; risco que cobre: entrega sem prova.
- [ ] Passo: 5; input/acao: ignorar dependência anterior no checklist; resultado esperado: revisão exige regressão; risco que cobre: quebra de contrato cumulativo.

**Tecnico**
- [ ] Campos de evidence cobrem `pr`, `proof`, `neg`, `files`, `commands`, `screenshots`, `notes`.
- [ ] Política de negativos preserva `P0/P1 >= 3`, `P2 >= 1`.
- [ ] O próximo BK recomendado é `BK-MF0-05`.
- [ ] Nenhum ficheiro canonico externo foi alterado sem decisao explicita do orientador.

**Regressao das fases anteriores**
- [ ] `BK-MF0-03` continua como dependência.
- [ ] O DoD é compatível com backlog e matriz.

**UI/mockup**
- [ ] Sem mockup nesta fase; screenshots ficam como aplicáveis a BKs de UI futuros.

**Seguranca**
- [ ] BKs com auth, dados pessoais, permissões, pagamentos ou RGPD exigem negativos de segurança.
- [ ] DoD proíbe evidências com segredos, tokens ou passwords reais.

#### Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

##### TODOs

- TODO: preencher evidence real no fecho do BK.
- TODO: validar com a equipa se todos compreendem diferença entre smoke e negativo.
- TODO (BLOCKER): se a equipa não aceitar o formato mínimo de evidence, bloquear fecho da MF0.
- TODO (DECISAO): Nuno decide se a DoD operacional deste guia deve ser promovida para `_TEMPLATE-BK.md` ou para um novo documento canonico.
- FOLLOW-UP: incorporar tempo de validação no calendário em `BK-MF0-05`.
- Assuncao a validar com o orientador: este DoD será aplicado a todos os BK, com adaptações por tipo.
- Decisao dependente de mockup: screenshots e comparação visual só entram em BKs de UI futuros.
- Decisao dependente de app/codigo ainda inexistente: comandos concretos (`npm test`, `npm run build`) serão fechados em `MF1`.

##### Snippet técnico aplicável

```text
CHECK BK-MF0-04
done = (
  owner_validou &&
  criterios_aceite_mensuraveis &&
  proof_preenchido &&
  negativos_minimos_por_prioridade &&
  regressao_relevante_validada &&
  sem_blockers_abertos
)
```

#### Handoff

`BK-MF0-05`

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de DoD, evidence, negativos e regressão.
- `2026-05-29`: hidratado com mapa de ficheiros, local operacional da DoD e bloqueio/decisao necessaria para eventual artefacto canonico separado.
