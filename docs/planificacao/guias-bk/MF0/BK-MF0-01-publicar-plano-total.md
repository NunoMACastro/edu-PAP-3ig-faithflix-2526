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
- `last_updated`: `2026-05-29`

## Bloco pedagogico (obrigatorio)

Este BK ensina a equipa a transformar requisitos e planeamento num contrato de execução. Não há implementação de produto nesta fase: em FaithFlix, a `MF0` serve para criar a base de governance que vai impedir drift quando a `MF1` começar a criar backend e frontend.

## Bloco operacional (obrigatorio)

O trabalho operacional deste BK é rever, publicar e validar o plano total em `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, garantindo que ele está coerente com README, RF, RNF, backlog, matriz e sprints.

#### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. Qualquer referência a stack ou arquitetura neste guia é decisão documental para preparar `MF1`, não implementação.

#### BK-MF0-01 - Publicar plano total

##### O que vamos fazer neste BK

Neste BK vamos consolidar o plano total do FaithFlix como o documento que explica a visão de execução da PAP: macro fases, contratos canónicos, gates, responsabilidades de validação e critérios de saída. O resultado não é uma funcionalidade de streaming; é o acordo técnico e pedagógico que permite construir a app real nas fases seguintes sem improvisar.

O plano total deve ficar alinhado com os documentos oficiais já existentes: `README.md`, `docs/RF.md`, `docs/RNF.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e `PLANO-SPRINTS.md`. Como `MF0` é governance/kickoff no FaithFlix, este BK prepara o terreno para que `BK-MF0-02` publique responsabilidades e para que `MF1` arranque com uma fundação técnica coerente.

A fase foi detalhada sem mockup de UI, porque `MOCKUP_PATH` está definido como "Ainda não existe". Isso não bloqueia este BK: a MF0 não define ecrãs finais, apenas cria os contratos que vão orientar decisões futuras de UI quando existirem mockups.

##### Porque e que isto e importante

- Garante que a equipa sabe qual é a sequência de macro fases antes de começar a criar código.
- Evita que os alunos saltem diretamente para funcionalidades sem saberem dependências, gates e critérios de saída.
- Cria uma fonte de verdade para decidir se uma alteração futura é correção, melhoria ou mudança de contrato.
- Desbloqueia `BK-MF0-02`, porque responsabilidades só fazem sentido depois de existir um plano total aceite.
- Prepara `MF1`, onde a stack derivada dos documentos será aplicada: Node.js LTS, Express modular, frontend React/Next.js e MongoDB Atlas, sem criar dependências novas nesta fase.

##### Papel deste BK no produto final

Este BK não entrega uma funcionalidade visível do FaithFlix, mas protege todas as funcionalidades futuras. O catálogo, o streaming, os perfis, a subscrição, a pool solidária, a privacidade e as evidências PAP só devem avançar depois de a equipa saber em que macrofase cada domínio entra, que documentos mandam e que gates validam o trabalho.

##### O que entra (scope)

- Rever e publicar o plano total da PAP em `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- Confirmar que as macro fases `MF0..MF9` estão descritas e alinhadas com backlog e sprints.
- Confirmar que os contratos canónicos obrigatórios apontam para ficheiros existentes.
- Confirmar que a regra de gates `S4/S8/S12/S13` está clara.
- Registar evidence mínima para defesa: referência de PR/commit, prova de validação e negativos documentais.

##### O que nao entra (scope-out)

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

#### Metadados do BK (CANONICO/DERIVADO):

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

#### O que vamos fazer neste BK (DERIVADO):

- Confirmar que `PLANO-IMPLEMENTACAO-TOTAL.md` traduz RF/RNF num plano executável para 4 alunos.
- Validar que os 66 BK ativos e as 13 sprints são referidos sem contradição.
- Confirmar que `MF0` aparece como kickoff/governance e que `MF1` aparece como fundação técnica.
- Registar que não existe código de app neste momento, logo este BK não mexe em caminhos de `src`, `server` ou `client`.
- Preparar um handoff curto para `BK-MF0-02` com a lista de macro fases e artefactos canónicos.

#### Estado, ficheiros e impacto (DERIVADO):

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

#### Verificacao de scaffold/codigo real (DERIVADO):

- Resultado esperado nesta fase: nao existe `backend/`, `frontend/`, `apps/api`, `apps/web`, `server/`, `client/` ou outro scaffold real da app final criado por este BK.
- O diretorio `mockup/` pode existir como referencia visual/documental, mas nao e a aplicacao final nem deve ser alterado neste BK.
- Se a equipa encontrar scaffold real antes de executar este BK, deve apenas registar o facto em evidence e abrir `Bloqueio / decisao necessaria` para o orientador decidir se esse scaffold e valido. Nao se deve apagar, reestruturar ou reaproveitar codigo em `MF0`.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `README.md`: visão geral, domínio FaithFlix e stack recomendada.
- `docs/RF.md`: escopo funcional ativo por domínio.
- `docs/RNF.md`: RNF críticos e stack tecnológica sugerida.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: objetivo, macro fases e critérios de saída.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: universo de 66 BK e contrato de campos.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: Sprint 1 e gates.
- Mockup: não existe; a fase foi detalhada sem mockup.
- Código: não existe app detetável no repositório; não há ficheiros de implementação a rever neste BK.

#### Glossario (rapido) (DERIVADO):

- Plano total: documento que liga requisitos, macro fases, gates e critérios de saída.
- Macro fase: grupo grande de BKs com objetivo comum, por exemplo `MF0` ou `MF1`.
- Governance: conjunto de regras para decidir, validar e evitar trabalho desalinhado.
- Fonte oficial: ficheiro que tem autoridade sobre uma decisão.
- Drift: divergência entre documentos que deveriam dizer a mesma coisa.
- Gate: ponto formal de validação, como `S4`, `S8`, `S12` ou `S13`.
- Evidence: provas objetivas usadas no PR ou defesa da PAP.
- Scope-out: lista do que fica fora para evitar aumento descontrolado do trabalho.

#### Conceitos teoricos essenciais (DERIVADO):

**Planeamento como contrato técnico.** Num projeto real, o plano não é só calendário: é um contrato entre requisitos, equipa e validação. Se o plano diz que `MF1` é fundação técnica, os BKs dessa fase devem criar estrutura backend/frontend antes de funcionalidades como catálogo ou streaming.

**Rastreabilidade.** Rastreabilidade significa conseguir responder: "este requisito está coberto por que BK e por que evidência?". Mesmo num BK transversal sem RF direto, a matriz indica que ele entra nos gates por checklist e evidence `pr/proof/neg`.

**Drift documental.** Drift acontece quando, por exemplo, o plano diz 66 BK, mas o backlog mostra outro número. Em PAP isto é perigoso porque os alunos podem trabalhar sobre versões diferentes da verdade.

**Gates.** Um gate é uma paragem de controlo. No FaithFlix há gates em `S4`, `S8`, `S12` e `S13`. O objetivo é corrigir cedo, não descobrir no fim que faltam evidências.

**Stack derivada.** A stack ainda não é implementada neste BK, mas o plano e RNF apontam para Node.js LTS, Express modular, frontend React/Next.js e MongoDB Atlas. Isto fica como contrato de preparação para `MF1`, sem instalar dependências agora.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar ponto de partida**
   - Descricao detalhada do objetivo: abrir o repositório e confirmar que este BK é o primeiro da `MF0`.
   - Justificacao: um BK sem dependências deve estabelecer baseline antes de qualquer outro trabalho.
   - Como fazer (0.0): confirmar que a criacao de estrutura real da aplicacao fica reservada para `BK-MF1-01` e `BK-MF1-02`. Neste BK nao criar `apps/api`, `apps/web`, `backend/`, `frontend/`, `server/`, `client/` nem qualquer pasta tecnica da app.
   - Como fazer (0.1): rever a linha `BK-MF0-01` em `BACKLOG-MVP.md`.
   - Como fazer (0.2): confirmar que `MF-VIEWS.md` lista `BK-MF0-01` como primeiro item da sequência.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `BK-MF0-01 | Publicar plano total | Nuno | P0 | -`
   - O que verificar: não existe dependência anterior nem blocker documental para iniciar.

1. **Objetivo (~15 min): Rever visão e domínio do produto**
   - Descricao detalhada do objetivo: confirmar que o plano total continua alinhado com FaithFlix como streaming cristão com catálogo, perfis, subscrições e pool solidária.
   - Justificacao: o plano total não pode ser genérico; tem de refletir o domínio do projeto.
   - Como fazer (1.1): ler a visão geral e funcionalidades principais no `README.md`.
   - Como fazer (1.2): comparar essa visão com a cobertura principal das macro fases no plano.
   - Ficheiro a rever: `README.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `MF4 | Monetizacao solidaria | RF35..RF48, RF52..RF54`
   - O que verificar: o plano menciona monetização solidária e não remove o diferencial do projeto.

2. **Objetivo (~15 min): Validar universo de backlog**
   - Descricao detalhada do objetivo: confirmar que o plano total fala em `66/66` BK ativos e que isso bate certo com o backlog.
   - Justificacao: se o número de BK divergir, as sprints e a matriz ficam pouco confiáveis.
   - Como fazer (2.1): rever a secção `Baseline de escopo MVP` no plano.
   - Como fazer (2.2): comparar com `BACKLOG-MVP.md`, secção `Baseline de escopo MVP`.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `BK ativos no MVP corrente: 66/66`
   - O que verificar: ambos os documentos indicam 66 BK ativos.

3. **Objetivo (~15 min): Confirmar macro fases**
   - Descricao detalhada do objetivo: rever se `MF0..MF9` têm nomes e cobertura coerentes.
   - Justificacao: as fases seguintes só são cumulativas se a sequência macro for estável.
   - Como fazer (3.1): comparar a tabela `Macro fases` com a sequência de `MF-VIEWS.md`.
   - Como fazer (3.2): confirmar que `MF0` está descrita como kickoff/governance.
   - Ficheiro a rever: `docs/planificacao/backlogs/MF-VIEWS.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `MF0 | Kickoff e governance | alinhamento, ownership, backlog, DoD`
   - O que verificar: `MF0` não promete produto funcional.

4. **Objetivo (~15 min): Validar contratos canónicos**
   - Descricao detalhada do objetivo: garantir que todos os ficheiros listados como contratos canónicos existem.
   - Justificacao: um contrato que aponta para ficheiro inexistente gera blocker para os alunos.
   - Como fazer (4.1): confirmar existência dos caminhos indicados no plano.
   - Como fazer (4.2): se algum ficheiro faltar, registar `TODO (BLOCKER)` neste guia antes de fechar o BK.
   - Ficheiro a rever: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `Validacao automatica: scripts/validate-planificacao.sh`
   - O que verificar: os seis contratos canónicos obrigatórios existem no repositório.

5. **Objetivo (~15 min): Confirmar gates e critérios de saída**
   - Descricao detalhada do objetivo: validar que `S4`, `S8`, `S12` e `S13` aparecem com critérios verificáveis.
   - Justificacao: gates fracos levam a BKs marcados como completos sem evidência.
   - Como fazer (5.1): rever as secções `Gate S4`, `Gate S8`, `Gate S12` e `Gate S13`.
   - Como fazer (5.2): confirmar que o plano exige `PASS` no script e validação humana.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `Validacao automatica a PASS: scripts/validate-planificacao.sh`
   - O que verificar: cada gate tem critérios observáveis, não frases vagas.

6. **Objetivo (~10 min): Validar continuidade para MF1**
   - Descricao detalhada do objetivo: confirmar que a fase seguinte começa com fundação técnica.
   - Justificacao: FaithFlix não deve implementar funcionalidades antes de criar base FE/BE, sessão e observabilidade.
   - Como fazer (6.1): rever `MF1` no plano e no backlog.
   - Como fazer (6.2): confirmar que `BK-MF1-01` e `BK-MF1-02` dependem de `BK-MF0-06`.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `BK-MF1-01 | dependencias | BK-MF0-06`
   - O que verificar: o plano prepara fundação técnica sem antecipar código.

7. **Objetivo (~10 min): Executar negativos documentais**
   - Descricao detalhada do objetivo: testar cenários de divergência antes de aceitar o plano.
   - Justificacao: negativos em documentos procuram erros de consistência, não falhas de runtime.
   - Como fazer (7.1): procurar divergência de contagem de BK entre plano e backlog.
   - Como fazer (7.2): procurar macro fase existente no plano mas ausente em `MF-VIEWS.md`.
   - Ficheiro a rever: `docs/planificacao/backlogs/MF-VIEWS.md`
   - Ficheiro alvo: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Snippet de referencia: `MF0..MF9`
   - O que verificar: pelo menos 3 negativos P0 ficam registados na evidence.

8. **Objetivo (~10 min): Fechar evidence e handoff**
   - Descricao detalhada do objetivo: preparar prova de que o plano foi revisto e deixar o próximo BK desbloqueado.
   - Justificacao: sem evidence, o BK não deve passar para `DONE`.
   - Como fazer (8.1): preencher `pr`, `proof` e `neg` no registo de trabalho/PR.
   - Como fazer (8.2): entregar a `BK-MF0-02` a lista de macro fases e contratos canónicos aceites.
   - Ficheiro a rever: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Ficheiro alvo: `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
   - Snippet de referencia: `proximo_bk: BK-MF0-02`
   - O que verificar: o handoff explica o que `BK-MF0-02` pode reutilizar.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `PLANO-IMPLEMENTACAO-TOTAL.md` existe e tem header ativo.
- [ ] A tabela de macro fases inclui `MF0..MF9`.
- [ ] O plano aponta para backlog, matriz, template, scorecard, guião docente e script.

**Negativos**
- [ ] Passo: 2; input/acao: comparar contagem de BK no plano e backlog; resultado esperado: ambos indicam `66/66`; risco que cobre: planeamento com universo errado.
- [ ] Passo: 3; input/acao: procurar `MF0` tratada como produto funcional; resultado esperado: `MF0` aparece como kickoff/governance; risco que cobre: alunos começarem implementação fora de ordem.
- [ ] Passo: 4; input/acao: verificar caminhos de contratos canónicos; resultado esperado: todos existem; risco que cobre: fonte de verdade quebrada.
- [ ] Passo: 0; input/acao: procurar instrucoes para criar `apps/api`, `apps/web`, `backend/`, `frontend/` ou comandos de scaffold em `MF0`; resultado esperado: nenhuma instrucao de criacao tecnica; risco que cobre: implementacao antecipada antes de `MF1`.

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

#### Criterios de aceite:

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

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente`

#### TODOs

- TODO: preencher evidence real quando o BK for executado pela equipa.
- TODO: correr o script oficial no fecho real do BK.
- TODO (BLOCKER): se algum contrato canónico deixar de existir, bloquear passagem para `BK-MF0-02`.
- FOLLOW-UP: usar o plano validado para publicar responsabilidades em `BK-MF0-02`.
- Assuncao a validar com o orientador: a stack de implementação em MF1 seguirá a recomendação RNF sem instalar dependências nesta MF0.
- Decisao dependente de mockup: nenhuma nesta fase; mockup ainda não existe.
- Decisao dependente de app/codigo ainda inexistente: caminhos técnicos concretos só devem ser fechados em `MF1`.

## Snippet tecnico aplicavel

```text
CHECK BK-MF0-01
1. plano_total.existe == true
2. plano_total.macro_fases == MF0..MF9
3. backlog.total_bk == 66
4. matriz.cobre_bk_transversais(MF0) == true
5. gate_saida.inclui(script_validacao, validacao_orientador) == true
```

## Proximo BK recomendado

`BK-MF0-02`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de governance da MF0, sem tratar FaithFlix MF0 como produto funcional.
- `2026-05-29`: removida instrucao indevida de scaffold tecnico em `MF0` e adicionada verificacao explicita para reservar criacao de app para `MF1`.
