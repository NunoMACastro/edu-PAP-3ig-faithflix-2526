# BK-MF0-01 - Publicar plano total

## Header

- `doc_id`: `GUIA-BK-MF0-01`
- `bk_id`: `BK-MF0-01`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `-`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-02`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK ensina a equipa a transformar requisitos e planeamento num contrato de execução. Não há implementação de produto nesta fase: em FaithFlix, a `MF0` serve para criar a base de governance que vai impedir drift quando a `MF1` começar a criar backend e frontend.

##### Resultado operacional esperado

O trabalho operacional deste BK é rever, publicar e validar o plano total em `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, garantindo que ele está coerente com README, RF, RNF, backlog, matriz e sprints.

##### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. Qualquer referência a stack ou arquitetura neste guia é decisão documental para preparar `MF1`, não implementação.

##### Enquadramento do BK

##### O que vamos fazer neste BK

Neste BK vamos consolidar o plano total do FaithFlix como o documento que explica a visão de execução da PAP: macro fases, contratos canónicos, gates, responsabilidades de validação e critérios de saída. O resultado não é uma funcionalidade de streaming; é o acordo técnico e pedagógico que permite construir a app real nas fases seguintes sem improvisar.

O plano total deve ficar alinhado com os documentos oficiais já existentes: `README.md`, `docs/RF.md`, `docs/RNF.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e `PLANO-SPRINTS.md`. Como `MF0` é governance/kickoff no FaithFlix, este BK prepara o terreno para que `BK-MF0-02` publique responsabilidades e para que `MF1` arranque com uma fundação técnica coerente.

A fase foi detalhada sem mockup de UI, porque `MOCKUP_PATH` está definido como "Ainda não existe". Isso não bloqueia este BK: a MF0 não define ecrãs finais, apenas cria os contratos que vão orientar decisões futuras de UI quando existirem mockups.

#### Importância

- Garante que a equipa sabe qual é a sequência de macro fases antes de começar a criar código.
- Evita que os alunos saltem diretamente para funcionalidades sem saberem dependências, gates e critérios de saída.
- Cria uma fonte de verdade para decidir se uma alteração futura é correção, melhoria ou mudança de contrato.
- Desbloqueia `BK-MF0-02`, porque responsabilidades só fazem sentido depois de existir um plano total aceite.
- Prepara `MF1`, onde a stack atual dos documentos será aplicada: Node.js LTS,
  Express modular, React + Vite, `fetch`/`AbortController` e MongoDB, sem criar
  dependências novas nesta fase.

##### Papel deste BK no produto final

Este BK não entrega uma funcionalidade visível do FaithFlix, mas protege todas as funcionalidades futuras. O catálogo, o streaming, os perfis, a subscrição, a pool solidária, a privacidade e as evidências PAP só devem avançar depois de a equipa saber em que macrofase cada domínio entra, que documentos mandam e que gates validam o trabalho.

#### Scope-in

- Rever e publicar o plano total da PAP em `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- Confirmar que as macro fases `MF0..MF9` estão descritas e alinhadas com backlog e sprints.
- Confirmar que os contratos canónicos obrigatórios apontam para ficheiros existentes.
- Confirmar que a regra de gates `S4/S8/S12/S13` está clara.
- Registar evidence mínima para defesa: referência de PR/commit, prova de validação e negativos documentais.

#### Scope-out

- Criar código de backend, frontend, base de dados ou testes automatizados da app.
- Definir UI final, identidade visual ou fluxos pixel-perfect.
- Alterar RF/RNF, owners, prioridades ou dependências do backlog.
- Reescrever o plano de sprints ou a matriz canónica; neste BK só se valida coerência.
- Inventar regras de negócio sobre streaming cristão, subscrições ou pool solidária.

##### Como saber que isto ficou bem

- O plano total aponta para todos os artefactos canónicos que existem no repositório.
- A `MF0` está descrita como kickoff/governance, não como produto funcional.
- A sequência `MF0 -> MF1` é clara: primeiro governance, depois fundação técnica.
- Outro aluno consegue ler o plano e explicar em 2 minutos quais são as macro fases, gates e critérios de saída.
- Os negativos documentais mostram que divergências entre plano, backlog e matriz foram procuradas.

##### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `-` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `-` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: documentos base existem e podem ser revistos; não há BK anterior obrigatório (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL > Macro fases > MF0` e `PLANO-SPRINTS > Sprint 1` (CANONICO)
- Flow ID: `MF0-governance-kickoff-01` (DERIVADO)
- Fonte de verdade: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Descricao: publicar o plano total como contrato de execução, gates e rastreabilidade antes de distribuir responsabilidades (DERIVADO)

##### Complemento do objetivo (DERIVADO):

- Confirmar que `PLANO-IMPLEMENTACAO-TOTAL.md` traduz RF/RNF num plano executável para 4 alunos.
- Validar que os 66 BK ativos e as 13 sprints são referidos sem contradição.
- Confirmar que `MF0` aparece como kickoff/governance e que `MF1` aparece como fundação técnica.
- Registar que não existe código de app neste momento, logo este BK não mexe em caminhos de `src`, `server` ou `client`.
- Preparar um handoff curto para `BK-MF0-02` com a lista de macro fases e artefactos canónicos.

#### Estado antes e depois

- Estado esperado antes do BK: documentação base existe, mas o plano total ainda não foi validado como contrato de execução da equipa.
- Estado esperado depois do BK: plano total revisto, macro fases e gates claros, e `BK-MF0-02` desbloqueado.
- Ficheiros a criar: nenhum.
- Ficheiros a editar: apenas este guia se forem registados ajustes/evidence do BK.
- Ficheiros a rever: `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Dependencias de BK anteriores e uso: não existem BK anteriores; este BK cria o primeiro contrato de governance.
- Impacto na arquitetura da app: define que a arquitetura será tratada a partir de `MF1`, com backend modular e frontend componentizado.
- Impacto em frontend/backend/dados: nenhum ficheiro técnico é criado; apenas se prepara a decisão de stack.
- Impacto em segurança/testes/UI: preserva RNF de segurança e gates; UI fica sem decisão final por falta de mockup.
- Handoff para o próximo BK: entregar a `BK-MF0-02` lista de macro fases, contratos canónicos e critérios de saída.

##### Verificação de scaffold/código real (DERIVADO):

- Resultado esperado nesta fase: nao existe `backend/`, `frontend/`, `server/`, `client/` ou outro scaffold real da app final criado por este BK.
- O diretorio `mockup/` pode existir como referencia visual/documental, mas nao e a aplicacao final nem deve ser alterado neste BK.
- Se a equipa encontrar scaffold real antes de executar este BK, deve apenas registar o facto em evidence e abrir `Bloqueio / decisao necessaria` para o orientador decidir se esse scaffold e valido. Nao se deve apagar, reestruturar ou reaproveitar codigo em `MF0`.

#### Pré-requisitos

- `README.md`: visão geral, domínio FaithFlix e stack recomendada.
- `docs/RF.md`: escopo funcional ativo por domínio.
- `docs/RNF.md`: RNF críticos e stack tecnológica sugerida.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: objetivo, macro fases e critérios de saída.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: universo de 66 BK e contrato de campos.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: Sprint 1 e gates.
- Mockup: não existe; a fase foi detalhada sem mockup.
- Código: não existe app detetável no repositório; não há ficheiros de implementação a rever neste BK.

#### Glossário

- Plano total: documento que liga requisitos, macro fases, gates e critérios de saída.
- Macro fase: grupo grande de BKs com objetivo comum, por exemplo `MF0` ou `MF1`.
- Governance: conjunto de regras para decidir, validar e evitar trabalho desalinhado.
- Fonte oficial: ficheiro que tem autoridade sobre uma decisão.
- Drift: divergência entre documentos que deveriam dizer a mesma coisa.
- Gate: ponto formal de validação, como `S4`, `S8`, `S12` ou `S13`.
- Evidence: provas objetivas usadas no PR ou defesa da PAP.
- Scope-out: lista do que fica fora para evitar aumento descontrolado do trabalho.

#### Conceitos teóricos essenciais

**Planeamento como contrato técnico.** Num projeto real, o plano não é só calendário: é um contrato entre requisitos, equipa e validação. Se o plano diz que `MF1` é fundação técnica, os BKs dessa fase devem criar estrutura backend/frontend antes de funcionalidades como catálogo ou streaming.

**Rastreabilidade.** Rastreabilidade significa conseguir responder: "este requisito está coberto por que BK e por que evidência?". Mesmo num BK transversal sem RF direto, a matriz indica que ele entra nos gates por checklist e evidence `pr/proof/neg`.

**Drift documental.** Drift acontece quando, por exemplo, o plano diz 66 BK, mas o backlog mostra outro número. Em PAP isto é perigoso porque os alunos podem trabalhar sobre versões diferentes da verdade.

**Gates.** Um gate é uma paragem de controlo. No FaithFlix há gates em `S4`, `S8`, `S12` e `S13`. O objetivo é corrigir cedo, não descobrir no fim que faltam evidências.

**Stack derivada.** A stack ainda não é implementada neste BK, mas o plano e
RNF fixam a baseline atual em Node.js LTS, Express modular, React + Vite,
`fetch`/`AbortController` e MongoDB. Next.js/Axios aparecem no RNF apenas como
opção futura e não alteram o tutorial. Isto prepara `MF1` sem instalar
dependências agora.

#### Arquitetura do BK

- Endpoint(s), modelo/schema, service, controller/route, guard, cliente API e página/componente: não aplicável; a MF0 não altera a implementação da app.
- Artefacto documental: os documentos e evidences enumerados na secção seguinte e nos passos.
- Testes: validador de planificação, checks documentais e negativos descritos no tutorial.
- Handoff: contrato documental preparado para `BK-MF0-02`.

#### Ficheiros a criar/editar/rever

- CRIAR: nenhum.
- EDITAR: apenas este guia se forem registados ajustes/evidence do BK.
- REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- REVER: `README.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar ponto de partida (~10 min)

1. Objetivo funcional do passo no contexto da app.

Abrir o repositório e confirmar que este BK é o primeiro da `MF0`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Confirmar que a criacao de estrutura real da aplicacao fica reservada para `BK-MF1-01` e `BK-MF1-02`. Neste BK nao criar `backend/`, `frontend/`, `server/`, `client/` nem qualquer pasta tecnica da app.
- Rever a linha `BK-MF0-01` em `BACKLOG-MVP.md`.
- Confirmar que `MF-VIEWS.md` lista `BK-MF0-01` como primeiro item da sequência.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Um BK sem dependências deve estabelecer baseline antes de qualquer outro trabalho.
Snippet de referência: `BK-MF0-01 | Publicar plano total | Nuno | P0 | -`

6. Validação do passo.

Não existe dependência anterior nem blocker documental para iniciar.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 2 - Rever visão e domínio do produto (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que o plano total continua alinhado com FaithFlix como streaming cristão com catálogo, perfis, subscrições e pool solidária.

2. Ficheiros envolvidos.
- REVER: `README.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Ler a visão geral e funcionalidades principais no `README.md`.
- Comparar essa visão com a cobertura principal das macro fases no plano.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O plano total não pode ser genérico; tem de refletir o domínio do projeto.
Snippet de referência: `MF4 | Monetizacao solidaria | RF35..RF48, RF52..RF54`

6. Validação do passo.

O plano menciona monetização solidária e não remove o diferencial do projeto.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 3 - Validar universo de backlog (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que o plano total fala em `66/66` BK ativos e que isso bate certo com o backlog.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Rever a secção `Baseline de escopo MVP` no plano.
- Comparar com `BACKLOG-MVP.md`, secção `Baseline de escopo MVP`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Se o número de BK divergir, as sprints e a matriz ficam pouco confiáveis.
Snippet de referência: `BK ativos no MVP corrente: 66/66`

6. Validação do passo.

Ambos os documentos indicam 66 BK ativos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 4 - Confirmar macro fases (~15 min)

1. Objetivo funcional do passo no contexto da app.

Rever se `MF0..MF9` têm nomes e cobertura coerentes.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Comparar a tabela `Macro fases` com a sequência de `MF-VIEWS.md`.
- Confirmar que `MF0` está descrita como kickoff/governance.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

As fases seguintes só são cumulativas se a sequência macro for estável.
Snippet de referência: `MF0 | Kickoff e governance | alinhamento, ownership, backlog, DoD`

6. Validação do passo.

`MF0` não promete produto funcional.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 5 - Validar contratos canónicos (~15 min)

1. Objetivo funcional do passo no contexto da app.

Garantir que todos os ficheiros listados como contratos canónicos existem.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Confirmar existência dos caminhos indicados no plano.
- Se algum ficheiro faltar, registar `TODO (BLOCKER)` neste guia antes de fechar o BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Um contrato que aponta para ficheiro inexistente gera blocker para os alunos.
Snippet de referência: `Validacao automatica: scripts/validate-planificacao.sh`

6. Validação do passo.

Os seis contratos canónicos obrigatórios existem no repositório.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 6 - Confirmar gates e critérios de saída (~15 min)

1. Objetivo funcional do passo no contexto da app.

Validar que `S4`, `S8`, `S12` e `S13` aparecem com critérios verificáveis.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Rever as secções `Gate S4`, `Gate S8`, `Gate S12` e `Gate S13`.
- Confirmar que o plano exige `PASS` no script e validação humana.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Gates fracos levam a BKs marcados como completos sem evidência.
Snippet de referência: `Validacao automatica a PASS: scripts/validate-planificacao.sh`

6. Validação do passo.

Cada gate tem critérios observáveis, não frases vagas.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 7 - Validar continuidade para MF1 (~10 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que a fase seguinte começa com fundação técnica.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Rever `MF1` no plano e no backlog.
- Confirmar que `BK-MF1-01` e `BK-MF1-02` dependem de `BK-MF0-06`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

FaithFlix não deve implementar funcionalidades antes de criar base FE/BE, sessão e observabilidade.
Snippet de referência: `BK-MF1-01 | dependencias | BK-MF0-06`

6. Validação do passo.

O plano prepara fundação técnica sem antecipar código.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 8 - Executar negativos documentais (~10 min)

1. Objetivo funcional do passo no contexto da app.

Testar cenários de divergência antes de aceitar o plano.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- EDITAR: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`

3. Instruções do que fazer.

- Procurar divergência de contagem de BK entre plano e backlog.
- Procurar macro fase existente no plano mas ausente em `MF-VIEWS.md`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Negativos em documentos procuram erros de consistência, não falhas de runtime.
Snippet de referência: `MF0..MF9`

6. Validação do passo.

Pelo menos 3 negativos P0 ficam registados na evidence.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 9 - Fechar evidence e handoff (~10 min)

1. Objetivo funcional do passo no contexto da app.

Preparar prova de que o plano foi revisto e deixar o próximo BK desbloqueado.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`

3. Instruções do que fazer.

- Preencher `pr`, `proof` e `neg` no registo de trabalho/PR.
- Entregar a `BK-MF0-02` a lista de macro fases e contratos canónicos aceites.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem evidence, o BK não deve passar para `DONE`.
Snippet de referência: `proximo_bk: BK-MF0-02`

6. Validação do passo.

O handoff explica o que `BK-MF0-02` pode reutilizar.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

#### Critérios de aceite

**Outputs:**
- `PLANO-IMPLEMENTACAO-TOTAL.md` revisto como fonte principal de execução macro.
- Handoff para `BK-MF0-02` preparado com macro fases e contratos canónicos.

**Verificacoes:**
- Plano e backlog indicam `66/66` BK ativos.
- `MF0` aparece como kickoff/governance.
- Gates `S4/S8/S12/S13` existem e têm critérios.
- Nao ha criacao de scaffold tecnico no fecho deste BK.

**Qualidade:**
- Nenhum RF/RNF, owner, prioridade ou dependência é alterado neste BK.
- Linguagem clara para alunos de 12.º ano.

**Continuidade:**
- `BK-MF0-02` consegue reutilizar o plano para publicar responsabilidades.
- `MF1` fica preparada como fundação técnica, não como fase funcional isolada.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Validação final

**Smoke**
- [ ] `PLANO-IMPLEMENTACAO-TOTAL.md` existe e tem header ativo.
- [ ] A tabela de macro fases inclui `MF0..MF9`.
- [ ] O plano aponta para backlog, matriz, template, scorecard, guião docente e script.

**Negativos**
- [ ] Passo: 2; input/acao: comparar contagem de BK no plano e backlog; resultado esperado: ambos indicam `66/66`; risco que cobre: planeamento com universo errado.
- [ ] Passo: 3; input/acao: procurar `MF0` tratada como produto funcional; resultado esperado: `MF0` aparece como kickoff/governance; risco que cobre: alunos começarem implementação fora de ordem.
- [ ] Passo: 4; input/acao: verificar caminhos de contratos canónicos; resultado esperado: todos existem; risco que cobre: fonte de verdade quebrada.
- [ ] Passo: 0; input/acao: procurar instrucoes para criar `backend/`, `frontend/` ou comandos de scaffold em `MF0`; resultado esperado: nenhuma instrucao de criacao tecnica; risco que cobre: implementacao antecipada antes de `MF1`.

**Tecnico**
- [ ] O plano mantém a stack apenas como decisão/assunção de alto nível, sem comandos de instalação.
- [ ] Os gates têm critérios observáveis.
- [ ] O próximo BK recomendado é `BK-MF0-02`.

**Regressao das fases anteriores**
- [ ] Não aplicável: não existem fases anteriores antes da `MF0`.

**UI/mockup**
- [ ] Sem mockup; este BK não define UI final.

**Seguranca**
- [ ] O plano preserva RNF de segurança como contrato futuro.
- [ ] Não introduz segredos, tokens, endpoints ou regras de autenticação inventadas.

#### Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

##### TODOs

- TODO: preencher evidence real quando o BK for executado pela equipa.
- TODO: correr o script oficial no fecho real do BK.
- TODO (BLOCKER): se algum contrato canónico deixar de existir, bloquear passagem para `BK-MF0-02`.
- FOLLOW-UP: usar o plano validado para publicar responsabilidades em `BK-MF0-02`.
- Assuncao a validar com o orientador: a stack de implementação em MF1 seguirá a recomendação RNF sem instalar dependências nesta MF0.
- Decisao dependente de mockup: nenhuma nesta fase; mockup ainda não existe.
- Decisao dependente de app/codigo ainda inexistente: caminhos técnicos concretos só devem ser fechados em `MF1`.

##### Snippet técnico aplicável

```text
CHECK BK-MF0-01
1. plano_total.existe == true
2. plano_total.macro_fases == MF0..MF9
3. backlog.total_bk == 66
4. matriz.cobre_bk_transversais(MF0) == true
5. gate_saida.inclui(script_validacao, validacao_orientador) == true
```

#### Handoff

`BK-MF0-02`

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de governance da MF0, sem tratar FaithFlix MF0 como produto funcional.
- `2026-05-29`: removida instrucao indevida de scaffold tecnico em `MF0` e adicionada verificacao explicita para reservar criacao de app para `MF1`.
