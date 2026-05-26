# BK-MF0-06 - Reuniao de alinhamento inicial

## Header

- `doc_id`: `GUIA-BK-MF0-06`
- `bk_id`: `BK-MF0-06`
- `macro`: `MF0`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-02,BK-MF0-05`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-01`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
- `last_updated`: `2026-05-25`

## Bloco pedagogico (obrigatorio)

Este BK ensina a fechar uma fase de governance com alinhamento real da equipa. A reunião não é uma formalidade: serve para confirmar que todos percebem plano, responsabilidades, backlog, DoD, calendário, riscos e primeiro handoff técnico para `MF1`.

## Bloco operacional (obrigatorio)

O trabalho operacional é preparar, conduzir e registar a reunião de alinhamento inicial, deixando a equipa pronta para iniciar `BK-MF1-01` e `BK-MF1-02` sem reabrir decisões de MF0.

#### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. O handoff para `MF1` deve levar contratos documentais, não código pronto.

#### BK-MF0-06 - Reuniao de alinhamento inicial

##### O que vamos fazer neste BK

Neste BK vamos fechar a `MF0` com uma reunião de alinhamento inicial. A reunião valida os artefactos de governance produzidos ou revistos na fase: plano total, distribuição de responsabilidades, backlog atómico, DoD/evidence e calendário de sprints. O objetivo é garantir que todos os alunos sabem o que vão construir, quando, com que responsabilidades e como provar que está feito.

Este BK é o handoff direto para `MF1`. No FaithFlix, `MF1` é fundação técnica: estrutura base backend por módulos e estrutura base frontend por componentes. Portanto, a reunião deve deixar claros os contratos que esses BKs vão reutilizar: stack derivada, separação de responsabilidades, comandos de validação a definir, política de evidência, owners e limites de escopo.

A fase foi detalhada sem mockup e sem código de app. Isso deve ficar registado na reunião: a equipa não deve inventar UI final nem caminhos de ficheiros antes da fundação técnica.

##### Porque e que isto e importante

- Fecha a MF0 com consenso explícito da equipa.
- Evita que `MF1` comece com dúvidas sobre stack, owners ou DoD.
- Obriga os alunos a verbalizar o plano, não apenas a aceitar documentos.
- Regista blockers, assunções e riscos antes de tocar em código.
- Cria evidence de governance para a defesa PAP.

##### O que entra (scope)

- Preparar agenda da reunião.
- Rever decisões dos BK `MF0-01..05`.
- Confirmar responsabilidades e calendário.
- Confirmar DoD/evidence mínima.
- Registar riscos, blockers e decisões abertas.
- Preparar handoff para `BK-MF1-01` e `BK-MF1-02`.

##### O que nao entra (scope-out)

- Implementar backend ou frontend.
- Instalar dependências.
- Definir mockup ou UI final.
- Alterar escopo, owners ou prioridades durante a reunião sem registo formal.
- Fechar BKs futuros como prontos.

##### Como saber que isto ficou bem

- Existe registo curto da reunião com decisões, dúvidas e próximos passos.
- Todos os alunos conseguem explicar o seu papel e o primeiro BK técnico.
- Os blockers ficam com owner e prazo.
- `BK-MF1-01` e `BK-MF1-02` ficam desbloqueados.
- A equipa sabe que `DONE` exige evidence e negativos, não apenas entrega informal.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF0` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Nuno` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Matheus, Mateus, Davi, Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-02,BK-MF0-05` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: responsabilidades publicadas e calendário de sprints definido; backlog e DoD devem estar disponíveis como contexto da reunião (DERIVADO)
- Ref. Plano: `MF-VIEWS > MF0`, `PLANO-SPRINTS > Sprint 1`, `DISTRIBUICAO-RESPONSABILIDADES > Cerimonias` (CANONICO)
- Flow ID: `MF0-governance-kickoff-06` (DERIVADO)
- Fonte de verdade: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- Fonte de verdade: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Descricao: conduzir reunião de alinhamento inicial e fechar handoff de governance para fundação técnica (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Preparar agenda baseada nos outputs dos BK anteriores.
- Confirmar que cada aluno conhece responsabilidade e primeiro foco.
- Registar assunções: sem mockup, sem código existente, stack derivada dos RNF.
- Confirmar que `MF1` começa por backend modular e frontend componentizado.
- Produzir handoff objetivo para `BK-MF1-01` e `BK-MF1-02`.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: responsabilidades e calendário publicados; plano, backlog e DoD disponíveis como contexto.
- Estado esperado depois do BK: MF0 encerrada, blockers registados e MF1 desbloqueada para iniciar fundação técnica.
- Ficheiros a criar: ata/registo da reunião se a equipa ainda não tiver local oficial para isso.
- Ficheiros a editar: apenas este guia ou o registo de reunião/evidence, sem alterar contratos canónicos.
- Ficheiros a rever: guias `BK-MF0-01..05`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/RNF.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF0-02` e `BK-MF0-05`; reutiliza também outputs de `BK-MF0-01`, `BK-MF0-03` e `BK-MF0-04` para agenda completa.
- Impacto na arquitetura da app: fecha contratos iniciais para `BK-MF1-01` backend modular e `BK-MF1-02` frontend por componentes.
- Impacto em frontend/backend/dados: não cria código, mas confirma que MF1 vai criar estrutura inicial antes de funcionalidades.
- Impacto em segurança/testes/UI: reforça RNF de segurança, DoD/evidence e decisão de não inventar UI sem mockup.
- Handoff para o próximo BK: entregar a `BK-MF1-01` stack derivada, responsabilidades, DoD e limites de escopo.

#### Handoff explicito para MF1 (DERIVADO):

- Para `BK-MF1-01`: levar `RNF27`, decisão documental de backend modular, ownership `Matheus`/apoio `Davi`, DoD/evidence e aviso de que o BK deve criar fundação técnica, não autenticação completa, catálogo ou streaming.
- Para `BK-MF1-02`: levar `RNF28`, decisão documental de frontend por componentes, ownership `Mateus`/apoio `Kaue`, DoD/evidence e aviso de que o BK deve criar estrutura base, não UI final nem fluxos funcionais completos.
- Para ambos: confirmar que comandos, pastas e ficheiros reais só são definidos/executados nos BKs da `MF1`; em `MF0` ficam apenas contratos, assunções e blockers.
- Para a equipa: manter `pr/proof/neg`, política de negativos P0, registo de blockers e proibição de segredos no repositório como regras desde o primeiro commit técnico.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- Guia `BK-MF0-01`: plano total.
- Guia `BK-MF0-02`: responsabilidades.
- Guia `BK-MF0-03`: backlog atómico.
- Guia `BK-MF0-04`: DoD/evidence.
- Guia `BK-MF0-05`: calendário de sprints.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linhas `BK-MF1-01` e `BK-MF1-02`.
- `docs/RNF.md`: RNF27 e RNF28, porque desbloqueiam MF1.
- Mockup: não existe; registar como decisão aberta para fases de UI.
- Código: não existe app detetável; MF1 deverá criar a estrutura inicial.

#### Glossario (rapido) (DERIVADO):

- Alinhamento: confirmação partilhada de plano, papéis e próximos passos.
- Handoff: passagem de contexto para o próximo BK.
- Blocker: impedimento que impede avanço sem decisão.
- Assunção: decisão provisória usada até confirmação.
- Fundação técnica: estrutura base da app antes de funcionalidades.
- Stack: conjunto de tecnologias usadas no projeto.
- Contrato: decisão documentada que BKs futuros devem respeitar.
- Ata curta: registo objetivo de decisões e ações.

#### Conceitos teoricos essenciais (DERIVADO):

**Reunião com output.** Uma boa reunião técnica termina com decisões, responsáveis e próximos passos. Se não houver output escrito, a equipa pode sair com interpretações diferentes.

**Handoff para implementação.** Handoff não é "boa sorte". Deve incluir o que está decidido, o que falta decidir, que ficheiros consultar e que riscos evitar. Aqui o handoff vai para backend modular e frontend por componentes.

**Stack derivada vs stack instalada.** A stack recomendada vem de README/RNF: Node.js LTS, Express, React/Next.js e MongoDB Atlas. Mas nesta MF0 nada é instalado; a instalação e estrutura real entram em `MF1`.

**Contrato de segurança inicial.** Mesmo antes do código, a equipa deve saber que passwords não serão guardadas em texto puro, sessões devem usar cookies HttpOnly quando aplicável e segredos não entram no repositório.

**Scope freeze local.** A reunião não é momento para inventar novas funcionalidades. Mudanças de escopo devem virar TODO/BLOCKER ou decisão formal do orientador.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar pré-condições**
   - Descricao detalhada do objetivo: verificar se responsabilidades e calendário estão disponíveis.
   - Justificacao: são dependências canónicas deste BK.
   - Como fazer (0.1): rever `BK-MF0-02` e `BK-MF0-05`.
   - Como fazer (0.2): confirmar que backlog e DoD também estão disponíveis como contexto.
   - Ficheiro a rever: `docs/planificacao/guias-bk/MF0/`
   - Ficheiro alvo: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
   - Snippet de referencia: `dependencias: BK-MF0-02,BK-MF0-05`
   - O que verificar: não há blocker que impeça a reunião.

1. **Objetivo (~10 min): Preparar agenda**
   - Descricao detalhada do objetivo: montar uma agenda curta com plano, responsabilidades, backlog, DoD, calendário e MF1.
   - Justificacao: reunião sem agenda perde foco.
   - Como fazer (1.1): listar 5 tópicos com tempo estimado.
   - Como fazer (1.2): colocar `decisão esperada` em cada tópico.
   - Ficheiro a rever: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `Segunda: arranque, risco inicial e ownership`
   - O que verificar: cada tópico tem decisão ou confirmação.

2. **Objetivo (~15 min): Rever plano e macro fases com a equipa**
   - Descricao detalhada do objetivo: confirmar que todos entendem `MF0..MF8`.
   - Justificacao: a equipa precisa perceber continuidade, não só o seu BK isolado.
   - Como fazer (2.1): pedir a cada aluno que explique uma macro fase.
   - Como fazer (2.2): corrigir interpretações que tratem MF0 como produto funcional.
   - Ficheiro a rever: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `MF1 | Fundacao tecnica`
   - O que verificar: todos distinguem governance de implementação.

3. **Objetivo (~15 min): Confirmar responsabilidades**
   - Descricao detalhada do objetivo: validar owner/apoio por aluno e por área.
   - Justificacao: MF1 começa com Matheus e Mateus como owners técnicos iniciais.
   - Como fazer (3.1): rever a matriz por área funcional.
   - Como fazer (3.2): confirmar que cada aluno sabe o seu primeiro papel.
   - Ficheiro a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `Matheus: backend core, seguranca, regras de negocio`
   - O que verificar: não há dúvida sobre owner/apoio.

4. **Objetivo (~15 min): Confirmar backlog e DoD**
   - Descricao detalhada do objetivo: garantir que a equipa sabe que cada BK fecha com critérios e evidence.
   - Justificacao: previne `DONE` falso nas próximas sprints.
   - Como fazer (4.1): rever critérios globais de aceite por BK.
   - Como fazer (4.2): pedir que os alunos expliquem `pr/proof/neg`.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `Evidence minima por BK: trio pr, proof, neg`
   - O que verificar: todos sabem que P0 exige pelo menos 3 negativos.

5. **Objetivo (~15 min): Confirmar calendário e Sprint 1**
   - Descricao detalhada do objetivo: validar o foco da Sprint 1 e os BKs que começam logo após a reunião.
   - Justificacao: MF1 arranca dentro da Sprint 1.
   - Como fazer (5.1): rever linha da Sprint 1.
   - Como fazer (5.2): confirmar primeiro compromisso de Matheus e Mateus.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `BK-MF1-01`, `BK-MF1-02`
   - O que verificar: equipa sabe que MF1 começa com estrutura base, não com features.

6. **Objetivo (~15 min): Fechar contratos técnicos iniciais para MF1**
   - Descricao detalhada do objetivo: registar as decisões derivadas que os BKs técnicos devem respeitar.
   - Justificacao: evita escolhas incompatíveis quando o código começar.
   - Como fazer (6.1): confirmar stack derivada: Node.js LTS, Express modular, React/Next.js, MongoDB Atlas.
   - Como fazer (6.2): marcar como TODO qualquer decisão ainda não fechada, sem inventar.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `RNF27 backend modular`, `RNF28 frontend por componentes`
   - O que verificar: MF1 recebe contratos claros e blockers explícitos.

7. **Objetivo (~15 min): Executar negativos da reunião**
   - Descricao detalhada do objetivo: testar se a equipa consegue detetar falhas de alinhamento.
   - Justificacao: uma reunião pode parecer positiva mas deixar dúvidas críticas abertas.
   - Como fazer (7.1): perguntar "quem é owner do backend base?" e validar resposta.
   - Como fazer (7.2): perguntar "o que prova que um BK está DONE?" e validar resposta.
   - Ficheiro a rever: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `BK DONE exige evidencia + validacao tecnica`
   - O que verificar: pelo menos 3 negativos P0 de alinhamento ficam registados.

8. **Objetivo (~10 min): Fechar ata, evidence e handoff para MF1**
   - Descricao detalhada do objetivo: documentar decisões, blockers, owners e próximos passos.
   - Justificacao: sem registo, a equipa pode reabrir decisões na MF1.
   - Como fazer (8.1): preencher `pr`, `proof`, `neg`, `files`, `commands`, `notes`.
   - Como fazer (8.2): entregar handoff direto para `BK-MF1-01` e informar `BK-MF1-02`.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: registo/ata da reunião
   - Snippet de referencia: `proximo_bk: BK-MF1-01`
   - O que verificar: os BK técnicos têm autorização e contexto para arrancar.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] Reunião teve agenda.
- [ ] Plano, responsabilidades, backlog, DoD e calendário foram revistos.
- [ ] Ata/registo curto foi produzido.
- [ ] Handoff para `BK-MF1-01` foi explícito.

**Negativos**
- [ ] Passo: 7; input/acao: perguntar quem é owner de `BK-MF1-01`; resultado esperado: `Matheus`; risco que cobre: arranque backend sem responsável.
- [ ] Passo: 7; input/acao: pedir definição de `DONE`; resultado esperado: critérios + evidence + negativos; risco que cobre: fecho falso.
- [ ] Passo: 6; input/acao: tentar decidir UI final sem mockup; resultado esperado: registar como TODO futuro; risco que cobre: identidade visual inventada.

**Tecnico**
- [ ] Stack inicial fica derivada dos documentos, não instalada nesta fase.
- [ ] RNF27 e RNF28 ficam identificados como foco de `MF1`.
- [ ] O próximo BK recomendado é `BK-MF1-01`.

**Regressao das fases anteriores**
- [ ] `BK-MF0-02` e `BK-MF0-05` cumpridos como dependências.
- [ ] Outputs de `BK-MF0-01..05` foram revistos na reunião.

**UI/mockup**
- [ ] Sem mockup; decisões visuais finais ficam fora do BK.

**Seguranca**
- [ ] A equipa reconhece RNF de passwords, sessões, segredos e dados pessoais como contratos futuros.
- [ ] Nenhuma credencial ou conta real é registada na ata.

#### Criterios de aceite:

**Outputs:**
- Agenda e registo da reunião.
- Lista de decisões, blockers e próximos passos.
- Handoff para `BK-MF1-01` e `BK-MF1-02`.

**Verificacoes:**
- Todos os alunos confirmam o seu primeiro foco.
- `BK-MF1-01` e `BK-MF1-02` estão desbloqueados.
- Pelo menos 3 negativos de alinhamento foram registados.

**Qualidade:**
- Ata curta, objetiva e sem decisões inventadas.
- Escopo da MF0 encerrado sem adicionar funcionalidades.

**Continuidade:**
- MF1 começa com contratos de arquitetura e validação claros.
- Decisões abertas ficam como TODO/BLOCKER, não como suposições silenciosas.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente; MF1 deve criar estrutura inicial`

#### TODOs

- TODO: preencher ata real da reunião quando for executada.
- TODO: preencher evidence real antes de marcar `DONE`.
- TODO (BLOCKER): se algum aluno não confirmar ownership ou disponibilidade, reabrir distribuição e calendário.
- FOLLOW-UP: iniciar `BK-MF1-01` com backend modular e `BK-MF1-02` com frontend por componentes.
- Assuncao a validar com o orientador: stack derivada dos RNF será suficiente para arranque de MF1.
- Decisao dependente de mockup: UI final fica bloqueada até existir mockup ou decisão visual formal.
- Decisao dependente de app/codigo ainda inexistente: comandos, pastas e ficheiros reais serão criados em `MF1`.

## Snippet tecnico aplicavel

```text
CHECK BK-MF0-06
1. dependencias_ok == ["BK-MF0-02", "BK-MF0-05"]
2. equipa_confirmou(plano, responsabilidades, backlog, dod, calendario)
3. ata.tem(decisoes, blockers, owners, proximos_passos)
4. handoff.destino == ["BK-MF1-01", "BK-MF1-02"]
5. sem_decisoes_visuais_inventadas == true
```

## Proximo BK recomendado

`BK-MF1-01`

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de reunião de alinhamento e handoff MF0 -> MF1.
