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
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK ensina a fechar uma fase de governance com alinhamento real da equipa. A reunião não é uma formalidade: serve para confirmar que todos percebem plano, responsabilidades, backlog, DoD, calendário, riscos e primeiro handoff técnico para `MF1`.

##### Resultado operacional esperado

O trabalho operacional é preparar, conduzir e registar a reunião de alinhamento inicial, deixando a equipa pronta para iniciar `BK-MF1-01` e `BK-MF1-02` sem reabrir decisões de MF0.

##### Nota anti-drift MF0

`MF0` fecha apenas governance/kickoff: plano, responsabilidades, backlog, DoD, calendário e reunião de alinhamento. Este BK não cria backend, frontend, base de dados, streaming, catálogo, endpoints, componentes ou funcionalidade real. O handoff para `MF1` deve levar contratos documentais, não código pronto.

##### Enquadramento do BK

##### O que vamos fazer neste BK

Neste BK vamos fechar a `MF0` com uma reunião de alinhamento inicial. A reunião valida os artefactos de governance produzidos ou revistos na fase: plano total, distribuição de responsabilidades, backlog atómico, DoD/evidence e calendário de sprints. O objetivo é garantir que todos os alunos sabem o que vão construir, quando, com que responsabilidades e como provar que está feito.

Este BK é o handoff direto para `MF1`. No FaithFlix, `MF1` é fundação técnica: estrutura base backend por módulos e estrutura base frontend por componentes. Portanto, a reunião deve deixar claros os contratos que esses BKs vão reutilizar: stack derivada, separação de responsabilidades, comandos de validação a definir, política de evidência, owners e limites de escopo.

A fase foi detalhada sem mockup e sem código de app. Isso deve ficar registado na reunião: a equipa não deve inventar UI final nem caminhos de ficheiros antes da fundação técnica.

#### Importância

- Fecha a MF0 com consenso explícito da equipa.
- Evita que `MF1` comece com dúvidas sobre stack, owners ou DoD.
- Obriga os alunos a verbalizar o plano, não apenas a aceitar documentos.
- Regista blockers, assunções e riscos antes de tocar em código.
- Cria evidence de governance para a defesa PAP.

#### Scope-in

- Preparar agenda da reunião.
- Rever decisões dos BK `MF0-01..05`.
- Confirmar responsabilidades e calendário.
- Confirmar DoD/evidence mínima.
- Registar riscos, blockers e decisões abertas.
- Preparar handoff para `BK-MF1-01` e `BK-MF1-02`.

#### Scope-out

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

##### Papel deste BK no produto final

Este BK e a ponte entre a governance da `MF0` e a primeira implementacao tecnica da `MF1`. Sem esta reuniao registada, a equipa pode comecar backend e frontend com interpretacoes diferentes sobre stack, DoD, responsabilidades, privacidade, mockup e limites de escopo. O produto final depende deste alinhamento para construir catalogo, streaming, perfis, subscricoes e pool solidaria sobre uma base combinada e defensavel.

##### Metadados do BK (CANONICO/DERIVADO):

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

##### Complemento do objetivo (DERIVADO):

- Preparar agenda baseada nos outputs dos BK anteriores.
- Confirmar que cada aluno conhece responsabilidade e primeiro foco.
- Registar assunções: sem mockup, sem código existente, stack derivada dos RNF.
- Confirmar que `MF1` começa por backend modular e frontend componentizado.
- Produzir handoff objetivo para `BK-MF1-01` e `BK-MF1-02`.

#### Estado antes e depois

- Estado esperado antes do BK: responsabilidades e calendário publicados; plano, backlog e DoD disponíveis como contexto.
- Estado esperado depois do BK: MF0 encerrada, blockers registados e MF1 desbloqueada para iniciar fundação técnica.
- Ficheiros a criar: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`.
- Ficheiros a editar: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` durante a execução real da reunião; este guia apenas se houver ajustes/evidence do BK.
- Ficheiros a rever: guias `BK-MF0-01..05`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/RNF.md`.
- Dependencias de BK anteriores e uso: depende de `BK-MF0-02` e `BK-MF0-05`; reutiliza também outputs de `BK-MF0-01`, `BK-MF0-03` e `BK-MF0-04` para agenda completa.
- Impacto na arquitetura da app: fecha contratos iniciais para `BK-MF1-01` backend modular e `BK-MF1-02` frontend por componentes.
- Impacto em frontend/backend/dados: não cria código, mas confirma que MF1 vai criar estrutura inicial antes de funcionalidades.
- Impacto em segurança/testes/UI: reforça RNF de segurança, DoD/evidence e decisão de não inventar UI sem mockup.
- Handoff para o próximo BK: entregar a `BK-MF1-01` stack derivada, responsabilidades, DoD e limites de escopo.

##### Mapa de ficheiros e localização (DERIVADO):

| Acao | Caminho | Localizacao/insercao | Regra |
| --- | --- | --- | --- |
| Criar | `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` | Ficheiro novo, conteudo integral baseado no template abaixo | Criar apenas no momento de execucao real da reuniao. |
| Editar | `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` | Secoes `Decisoes`, `Blockers`, `Handoff MF1` e `Evidence` | Atualizar durante ou logo apos a reuniao, com decisoes reais. |
| Rever | `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md` a `BK-MF0-05` | Outputs e handoffs dos BK anteriores | Confirmar que nenhum ponto essencial da `MF0` ficou por validar. |
| Rever | `docs/planificacao/backlogs/BACKLOG-MVP.md` | Linhas `BK-MF1-01` e `BK-MF1-02` | Confirmar owners, dependencias e foco da fundacao tecnica. |
| Rever | `docs/RNF.md` | `RNF27`, `RNF28`, `RNF13`, `RNF15`, `RNF17` | Confirmar arquitetura modular, frontend componentizado, sessao segura e segredos fora do repositorio. |

##### Template da ata/registo da reunião (DERIVADO):

Ficheiro novo: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

Inserir o conteudo completo abaixo e substituir apenas os campos entre parenteses retos por informacao real da reuniao. Nao incluir passwords, tokens, chaves API, contas reais ou dados pessoais desnecessarios.

```markdown
# Ata de Alinhamento Inicial - MF0 FaithFlix

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
- `proof_scope`: ata observada pelos alunos; não prova implementação, testes ou estado da referência docente

## Metadados

- Data: [AAAA-MM-DD]
- Sprint: S01
- BK associado: BK-MF0-06
- Participantes: Nuno, Matheus, Mateus, Davi, Kaue
- Estado da reuniao: [realizada|bloqueada]

## Objetivo

Confirmar que a equipa compreende plano, responsabilidades, backlog, DoD/evidence, calendario e handoff para MF1, sem implementar funcionalidades em MF0.

## Decisoes confirmadas

- Plano total validado: [sim|nao]
- Distribuicao de responsabilidades validada: [sim|nao]
- Backlog atomico validado: [sim|nao]
- DoD/evidence compreendido pela equipa: [sim|nao]
- Calendario de sprints validado: [sim|nao]
- MF1 inicia com BK-MF1-01 e BK-MF1-02: [sim|nao]

## Blockers e decisoes abertas

| Item | Tipo | Owner | Prazo | Acao necessaria |
| --- | --- | --- | --- | --- |
| [descricao curta] | [blocker|decisao|risco] | [nome] | [data] | [acao] |

## Negativos de alinhamento

| Cenario | Resultado esperado | Resultado observado | Risco coberto |
| --- | --- | --- | --- |
| Perguntar quem e owner de BK-MF1-01 | Matheus | [resultado] | Arranque backend sem responsavel |
| Perguntar o que prova um BK DONE | Criterios + proof + negativos + evidence | [resultado] | Fecho falso |
| Tentar decidir UI final sem mockup | Registar como decisao futura, sem implementar | [resultado] | UI inventada fora de escopo |

## Handoff MF1

- Para BK-MF1-01: backend modular, owner Matheus, apoio Davi, foco RNF27, sem auth/catalogo/streaming ainda.
- Para BK-MF1-02: frontend componentizado, owner Mateus, apoio Kaue, foco RNF28, mockup como referencia nao final.
- Regras transversais: sem segredos no repositorio, evidence pr/proof/neg obrigatoria, comandos e pastas reais so em MF1.

## Evidence

- pr: [link ou identificador do PR/commit]
- proof: [resumo do que foi validado]
- neg: [resumo dos 3 negativos de alinhamento]
- files: docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md
- commands: bash scripts/validate-planificacao.sh
- notes: [observacoes curtas]
```

##### Bloqueio/decisão necessária (DERIVADO):

- Se a equipa ou orientador nao aceitarem `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` como local do registo, o BK deve ficar `BLOCKED` ate Nuno indicar o caminho oficial.
- Se algum aluno nao confirmar ownership, disponibilidade ou compreensao minima do primeiro BK tecnico, a reuniao deve registar blocker com owner e prazo antes de autorizar `MF1`.
- Se surgir proposta de implementar backend, frontend, UI final ou funcionalidades durante a reuniao, registar como fora de escopo da `MF0` e mover a discussao para o BK tecnico correto.

##### Handoff explícito para MF1 (DERIVADO):

- Para `BK-MF1-01`: levar `RNF27`, decisão documental de backend modular, ownership `Matheus`/apoio `Davi`, DoD/evidence e aviso de que o BK deve criar fundação técnica, não autenticação completa, catálogo ou streaming.
- Para `BK-MF1-02`: levar `RNF28`, decisão documental de frontend por componentes, ownership `Mateus`/apoio `Kaue`, DoD/evidence e aviso de que o BK deve criar estrutura base, não UI final nem fluxos funcionais completos.
- Para ambos: confirmar que comandos, pastas e ficheiros reais só são definidos/executados nos BKs da `MF1`; em `MF0` ficam apenas contratos, assunções e blockers.
- Para a equipa: manter `pr/proof/neg`, política de negativos P0, registo de blockers e proibição de segredos no repositório como regras desde o primeiro commit técnico.

#### Pré-requisitos

- Guia `BK-MF0-01`: plano total.
- Guia `BK-MF0-02`: responsabilidades.
- Guia `BK-MF0-03`: backlog atómico.
- Guia `BK-MF0-04`: DoD/evidence.
- Guia `BK-MF0-05`: calendário de sprints.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linhas `BK-MF1-01` e `BK-MF1-02`.
- `docs/RNF.md`: RNF27 e RNF28, porque desbloqueiam MF1.
- Mockup: não existe; registar como decisão aberta para fases de UI.
- Código: não existe app detetável; MF1 deverá criar a estrutura inicial.

#### Glossário

- Alinhamento: confirmação partilhada de plano, papéis e próximos passos.
- Handoff: passagem de contexto para o próximo BK.
- Blocker: impedimento que impede avanço sem decisão.
- Assunção: decisão provisória usada até confirmação.
- Fundação técnica: estrutura base da app antes de funcionalidades.
- Stack: conjunto de tecnologias usadas no projeto.
- Contrato: decisão documentada que BKs futuros devem respeitar.
- Ata curta: registo objetivo de decisões e ações.

#### Conceitos teóricos essenciais

**Reunião com output.** Uma boa reunião técnica termina com decisões, responsáveis e próximos passos. Se não houver output escrito, a equipa pode sair com interpretações diferentes.

**Handoff para implementação.** Handoff não é "boa sorte". Deve incluir o que está decidido, o que falta decidir, que ficheiros consultar e que riscos evitar. Aqui o handoff vai para backend modular e frontend por componentes.

**Stack derivada vs stack instalada.** A baseline atual vem de README/RNF:
Node.js LTS, Express, React + Vite, `fetch`/`AbortController` e MongoDB. As
opções futuras do RNF, como Next.js/Axios, não são o runtime deste tutorial.
Nesta MF0 nada é instalado; a estrutura real entra em `MF1`.

**Contrato de segurança inicial.** Mesmo antes do código, a equipa deve saber que passwords não serão guardadas em texto puro, sessões devem usar cookies HttpOnly quando aplicável e segredos não entram no repositório.

**Scope freeze local.** A reunião não é momento para inventar novas funcionalidades. Mudanças de escopo devem virar TODO/BLOCKER ou decisão formal do orientador.

#### Arquitetura do BK

- Endpoint(s), modelo/schema, service, controller/route, guard, cliente API e página/componente: não aplicável; a MF0 não altera a implementação da app.
- Artefacto documental: os documentos e evidences enumerados na secção seguinte e nos passos.
- Testes: validador de planificação, checks documentais e negativos descritos no tutorial.
- Handoff: contrato documental preparado para `BK-MF1-01`.

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`.
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` durante a execução real da reunião; este guia apenas se houver ajustes/evidence do BK.
- REVER: guias `BK-MF0-01..05`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/RNF.md`.
- CRIAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`
- REVER: `docs/planificacao/guias-bk/MF0/BK-MF0-01-publicar-plano-total.md` a `BK-MF0-05`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/guias-bk/MF0/`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
- REVER: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar pré-condições (~10 min)

1. Objetivo funcional do passo no contexto da app.

Verificar se responsabilidades e calendário estão disponíveis.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/guias-bk/MF0/`
- EDITAR: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`

3. Instruções do que fazer.

- Rever `BK-MF0-02` e `BK-MF0-05`.
- Confirmar que backlog e DoD também estão disponíveis como contexto.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

São dependências canónicas deste BK.
Snippet de referência: `dependencias: BK-MF0-02,BK-MF0-05`

6. Validação do passo.

Não há blocker que impeça a reunião.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 2 - Preparar agenda (~10 min)

1. Objetivo funcional do passo no contexto da app.

Montar uma agenda curta com plano, responsabilidades, backlog, DoD, calendário e MF1.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Listar 5 tópicos com tempo estimado.
- Colocar `decisão esperada` em cada tópico.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Reunião sem agenda perde foco.
Snippet de referência: `Segunda: arranque, risco inicial e ownership`

6. Validação do passo.

Cada tópico tem decisão ou confirmação.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 3 - Rever plano e macro fases com a equipa (~15 min)

1. Objetivo funcional do passo no contexto da app.

Confirmar que todos entendem `MF0..MF9`.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Pedir a cada aluno que explique uma macro fase.
- Corrigir interpretações que tratem MF0 como produto funcional.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A equipa precisa perceber continuidade, não só o seu BK isolado.
Snippet de referência: `MF1 | Fundacao tecnica`

6. Validação do passo.

Todos distinguem governance de implementação.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 4 - Confirmar responsabilidades (~15 min)

1. Objetivo funcional do passo no contexto da app.

Validar owner/apoio por aluno e por área.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Rever a matriz por área funcional.
- Confirmar que cada aluno sabe o seu primeiro papel.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

MF1 começa com Matheus e Mateus como owners técnicos iniciais.
Snippet de referência: `Matheus: backend core, seguranca, regras de negocio`

6. Validação do passo.

Não há dúvida sobre owner/apoio.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 5 - Confirmar backlog e DoD (~15 min)

1. Objetivo funcional do passo no contexto da app.

Garantir que a equipa sabe que cada BK fecha com critérios e evidence.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Rever critérios globais de aceite por BK.
- Pedir que os alunos expliquem `pr/proof/neg`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Previne `DONE` falso nas próximas sprints.
Snippet de referência: `Evidence minima por BK: trio pr, proof, neg`

6. Validação do passo.

Todos sabem que P0 exige pelo menos 3 negativos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 6 - Confirmar calendário e Sprint 1 (~15 min)

1. Objetivo funcional do passo no contexto da app.

Validar o foco da Sprint 1 e os BKs que começam logo após a reunião.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Rever linha da Sprint 1.
- Confirmar primeiro compromisso de Matheus e Mateus.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

MF1 arranca dentro da Sprint 1.
Snippet de referência: `BK-MF1-01`, `BK-MF1-02`

6. Validação do passo.

Equipa sabe que MF1 começa com estrutura base, não com features.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 7 - Fechar contratos técnicos iniciais para MF1 (~15 min)

1. Objetivo funcional do passo no contexto da app.

Registar as decisões derivadas que os BKs técnicos devem respeitar.

2. Ficheiros envolvidos.
- REVER: `docs/RNF.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Confirmar stack atual: Node.js LTS, Express modular, React + Vite,
  `fetch`/`AbortController` e MongoDB.
- Marcar como TODO qualquer decisão ainda não fechada, sem inventar.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evita escolhas incompatíveis quando o código começar.
Snippet de referência: `RNF27 backend modular`, `RNF28 frontend por componentes`

6. Validação do passo.

MF1 recebe contratos claros e blockers explícitos.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 8 - Executar negativos da reunião (~15 min)

1. Objetivo funcional do passo no contexto da app.

Testar se a equipa consegue detetar falhas de alinhamento.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Perguntar "quem é owner do backend base?" e validar resposta.
- Perguntar "o que prova que um BK está DONE?" e validar resposta.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Uma reunião pode parecer positiva mas deixar dúvidas críticas abertas.
Snippet de referência: `BK DONE exige evidencia + validacao tecnica`

6. Validação do passo.

Pelo menos 3 negativos P0 de alinhamento ficam registados.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

### Passo 9 - Fechar ata, evidence e handoff para MF1 (~10 min)

1. Objetivo funcional do passo no contexto da app.

Documentar decisões, blockers, owners e próximos passos.

2. Ficheiros envolvidos.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- EDITAR: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`

3. Instruções do que fazer.

- Preencher `pr`, `proof`, `neg`, `files`, `commands`, `notes`.
- Entregar handoff direto para `BK-MF1-01` e informar `BK-MF1-02`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem registo, a equipa pode reabrir decisões na MF1.
Snippet de referência: `proximo_bk: BK-MF1-01`

6. Validação do passo.

Os BK técnicos têm autorização e contexto para arrancar.

7. Cenário negativo/erro esperado.

Se a verificação falhar ou não tiver evidence, o passo fica por concluir e o desvio é registado antes do handoff.

#### Critérios de aceite

**Outputs:**
- Agenda e registo da reunião.
- Lista de decisões, blockers e próximos passos.
- Handoff para `BK-MF1-01` e `BK-MF1-02`.
- Ficheiro `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md` criado com template preenchido.

**Verificacoes:**
- Todos os alunos confirmam o seu primeiro foco.
- `BK-MF1-01` e `BK-MF1-02` estão desbloqueados.
- Pelo menos 3 negativos de alinhamento foram registados.
- Todos os blockers têm owner, prazo e acao necessaria.

**Qualidade:**
- Ata curta, objetiva e sem decisões inventadas.
- Escopo da MF0 encerrado sem adicionar funcionalidades.

**Continuidade:**
- MF1 começa com contratos de arquitetura e validação claros.
- Decisões abertas ficam como TODO/BLOCKER, não como suposições silenciosas.

**Evidencia:**
- `pr`, `proof` e `neg` preenchidos antes de marcar `DONE`.

#### Validação final

**Smoke**
- [ ] Reunião teve agenda.
- [ ] Plano, responsabilidades, backlog, DoD e calendário foram revistos.
- [ ] Ata/registo curto foi produzido em `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`.
- [ ] Handoff para `BK-MF1-01` foi explícito.

**Negativos**
- [ ] Passo: 7; input/acao: perguntar quem é owner de `BK-MF1-01`; resultado esperado: `Matheus`; risco que cobre: arranque backend sem responsável.
- [ ] Passo: 7; input/acao: pedir definição de `DONE`; resultado esperado: critérios + evidence + negativos; risco que cobre: fecho falso.
- [ ] Passo: 6; input/acao: tentar decidir UI final sem mockup; resultado esperado: registar como TODO futuro; risco que cobre: identidade visual inventada.

**Tecnico**
- [ ] Stack inicial fica derivada dos documentos, não instalada nesta fase.
- [ ] RNF27 e RNF28 ficam identificados como foco de `MF1`.
- [ ] O próximo BK recomendado é `BK-MF1-01`.
- [ ] A ata nao contem passwords, tokens, chaves API, contas reais ou dados pessoais desnecessarios.

**Regressao das fases anteriores**
- [ ] `BK-MF0-02` e `BK-MF0-05` cumpridos como dependências.
- [ ] Outputs de `BK-MF0-01..05` foram revistos na reunião.

**UI/mockup**
- [ ] Sem mockup; decisões visuais finais ficam fora do BK.

**Seguranca**
- [ ] A equipa reconhece RNF de passwords, sessões, segredos e dados pessoais como contratos futuros.
- [ ] Nenhuma credencial ou conta real é registada na ata.

#### Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `docs/planificacao/sprints/ATA-ALINHAMENTO-INICIAL-MF0.md`, `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `commands`: `bash scripts/validate-planificacao.sh`
- `screenshots`: `Nao aplicavel; BK documental sem UI`
- `notes`: `Fase detalhada sem mockup e sem codigo de app existente; MF1 deve criar estrutura inicial`

##### TODOs

- TODO: preencher ata real da reunião quando for executada.
- TODO: preencher evidence real antes de marcar `DONE`.
- TODO (BLOCKER): se algum aluno não confirmar ownership ou disponibilidade, reabrir distribuição e calendário.
- TODO (BLOCKER): se o caminho da ata nao for aceite, Nuno deve indicar caminho oficial antes de fechar o BK.
- FOLLOW-UP: iniciar `BK-MF1-01` com backend modular e `BK-MF1-02` com frontend por componentes.
- Assuncao a validar com o orientador: stack derivada dos RNF será suficiente para arranque de MF1.
- Decisao dependente de mockup: UI final fica bloqueada até existir mockup ou decisão visual formal.
- Decisao dependente de app/codigo ainda inexistente: comandos, pastas e ficheiros reais serão criados em `MF1`.

##### Snippet técnico aplicável

```text
CHECK BK-MF0-06
1. dependencias_ok == ["BK-MF0-02", "BK-MF0-05"]
2. equipa_confirmou(plano, responsabilidades, backlog, dod, calendario)
3. ata.tem(decisoes, blockers, owners, proximos_passos)
4. handoff.destino == ["BK-MF1-01", "BK-MF1-02"]
5. sem_decisoes_visuais_inventadas == true
```

#### Handoff

`BK-MF1-01`

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3 (objetivo especifico, pre-condicoes, outputs, snippet e proximo BK real).
- `2026-05-25`: refinado para guia executável de reunião de alinhamento e handoff MF0 -> MF1.
- `2026-05-29`: hidratado com caminho canonico da ata, template completo, mapa de ficheiros e bloqueios/decisoes para handoff MF0 -> MF1.
