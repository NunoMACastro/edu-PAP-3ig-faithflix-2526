# BK-MF8-04 - Ensaio técnico da defesa

## Header

- `doc_id`: `GUIA-BK-MF8-04`
- `bk_id`: `BK-MF8-04`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-03`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-05`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-04-ensaio-tecnico-da-defesa.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais executar um ensaio técnico completo da defesa da FaithFlix. O ensaio deve transformar o roteiro final em prova prática: demo cronometrada, comandos essenciais, perguntas técnicas, falhas observadas, ajustes aceites e decisão objetiva para o feedback final.

#### Importância

Uma defesa não falha apenas por falta de código. Também pode falhar por excesso de tempo, sequência confusa, login por preparar, pergunta técnica sem fonte, comando sem output ou evidence difícil de encontrar. Este BK reduz esse risco antes da avaliação final do orientador.

#### Scope-in

- Ensaiar o roteiro final produzido em `BK-MF8-03`.
- Medir tempo real por bloco da demo.
- Registar comandos essenciais de backend, frontend e planificação.
- Preparar respostas técnicas com fonte e owner.
- Classificar falhas como ajuste, risco residual ou bug bloqueante.
- Entregar handoff objetivo para `BK-MF8-05`.

#### Scope-out

- Criar uma demo nova que contradiga o roteiro aprovado.
- Corrigir bugs dentro deste BK sem aprovação.
- Prometer funcionalidades que não tenham proof.
- Usar dados pessoais reais, credenciais reais ou contas de terceiros.
- Alterar RF, RNF, owners, prioridades, sprints ou dependências.

#### Estado antes e depois

- Estado antes: existe `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`, criado no `BK-MF8-03`, com blocos, perfis, rotas, proof, fallback e tempos previstos.
- Estado antes: a dependência `BK-MF8-03` tem de estar concluída, validada ou registada com ressalva explícita.
- Estado depois: existe `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` com tempos reais, comandos executados, perguntas, respostas, falhas, ajustes e decisão final.
- Estado depois: o `BK-MF8-05` recebe dúvidas, riscos e ajustes já observados, sem depender de explicação oral.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` existe ou tem ressalva registada.
- Confirmar que as matrizes `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` e `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` existem ou têm ressalva registada.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.
- Ter cronómetro, ambiente local, dados de demonstração controlados e lista de perfis necessários.

#### Glossário

- Ensaio técnico: execução controlada da demo antes da defesa, com tempo, comandos, perguntas e falhas registados.
- Tempo previsto: duração estimada no roteiro final.
- Tempo real: duração medida durante o ensaio.
- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação da equipa.
- Fallback: prova alternativa honesta quando o ambiente falha.
- Risco residual: limitação conhecida, avaliada e aceite para defesa.
- Bug bloqueante: falha que impede entrega honesta ou defesa segura.
- Handoff: informação mínima para o próximo BK continuar sem adivinhar contexto.

#### Conceitos teóricos essenciais

- `CANONICO`: a MF8 concentra consolidação, evidência, defesa, buffer e fecho.
- `CANONICO`: `BK-MF8-04` depende de `BK-MF8-03` e entrega contexto para `BK-MF8-05`.
- `DERIVADO`: perguntas técnicas ficam agrupadas por domínio para a equipa responder rapidamente durante a defesa.
- Ensaio técnico não é apresentação informal; é uma validação operacional da defesa.
- Uma falha de ensaio deve ter decisão explícita: ajustar roteiro, aceitar risco, promover a bug bloqueante ou bloquear a demo.
- Uma resposta técnica forte aponta para fonte: ficheiro, rota, comando, evidence, matriz ou decisão de gate.
- Dados de demonstração devem ser controlados e não podem expor informação sensível.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Roteiro | `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` | Define blocos, perfis, rotas, proof, fallback e tempos previstos. |
| Matrizes | `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`, `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` | Fornecem cobertura funcional e técnica para a defesa. |
| Gates | `docs/evidence/MF6/`, `docs/evidence/MF7/` | Confirmam decisões e ressalvas herdadas. |
| Ata de ensaio | `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` | Regista tempos reais, perguntas, falhas, comandos e decisão. |
| Feedback | `BK-MF8-05` | Recebe ajustes, dúvidas, riscos e blockers observados no ensaio. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
- REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
- REVER: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- REVER: `frontend/src/routes/AppRoutes.jsx`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`

#### Tutorial técnico linear

### Passo 1 - Preparar ambiente de ensaio

1. Objetivo funcional do passo no contexto da app.

Garantir que a equipa sabe exatamente que versão, artefactos, perfis e comandos vai usar antes de iniciar a demo cronometrada.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Estado de entrada`

3. Instruções do que fazer.

Cria `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` com esta estrutura inicial:

| Campo | Valor a preencher |
| --- | --- |
| Data e hora do ensaio |  |
| Responsável pelo ensaio | Matheus |
| Apoio | Davi |
| Roteiro usado | `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` |
| Decisão do roteiro | `DEMO_PRONTA`, `DEMO_PRONTA_COM_RESSALVAS` ou `DEMO_BLOQUEADA` |
| Decisão MF6 herdada | `GO`, `GO_COM_RESSALVAS` ou `NO_GO` |
| Decisão MF7 herdada | `GO`, `GO_COM_RESSALVAS` ou `NO_GO` |
| Perfis necessários | visitante, utilizador, associação, moderador, admin ou apenas os usados |
| Dados preparados | apenas dados fictícios ou controlados |
| Estado de entrada | `PRONTO_PARA_ENSAIO`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO` |

Depois adiciona uma lista curta de pré-verificação:

- O roteiro tem pelo menos um bloco `ENTRA` ou `ENTRA_COM_RESSALVA`.
- Cada bloco tem proof e fallback.
- Os dados usados na demo não são sensíveis.
- Os comandos essenciais estão identificados.
- Há uma pessoa a apresentar e outra a registar tempos/falhas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. A decisão importante é preparar o ensaio antes de abrir a aplicação. Isto evita começar a defesa sem dados, sem perfis ou sem saber que evidence confirma cada afirmação.

6. Validação do passo.

O passo passa quando `Estado de entrada` existe e a equipa consegue dizer que roteiro, perfis, dados e gates vai usar.

7. Cenário negativo/erro esperado.

Se o roteiro tiver decisão `DEMO_BLOQUEADA`, o ensaio não deve avançar como defesa principal. Regista o estado como `BLOQUEADO` e escreve que o `BK-MF8-03` precisa de correção antes do ensaio.

### Passo 2 - Executar demo cronometrada

1. Objetivo funcional do passo no contexto da app.

Executar os blocos aprovados no roteiro, medir tempo real e perceber se a demo cabe numa defesa de 12 a 15 minutos.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: secção `Demo cronometrada`

3. Instruções do que fazer.

Cria a secção `Demo cronometrada` e copia do roteiro apenas os blocos com estado `ENTRA` ou `ENTRA_COM_RESSALVA`. Para cada bloco, preenche esta tabela durante o ensaio:

| Ordem | Bloco | Perfil | Rota ou artefacto | Tempo previsto | Tempo real | Resultado observado | Proof usado | Fallback usado | Estado |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | Abertura técnica | Visitante | `/` | 1 min |  |  |  |  | `PASS` |

Usa estes estados:

- `PASS`: o bloco funcionou, ficou dentro do tempo e tem proof.
- `PASS_COM_RESSALVA`: funcionou, mas precisou de fallback, ultrapassou ligeiramente o tempo ou depende de ressalva já assumida.
- `AJUSTAR_ROTEIRO`: a ordem, fala ou duração precisa de ajuste antes do feedback.
- `BLOQUEADO`: faltou proof, falhou rota essencial, falhou perfil essencial ou houve risco de segurança.

Aplica estas regras:

- Se um bloco ultrapassar o tempo previsto em mais de 30 segundos, marca `AJUSTAR_ROTEIRO`.
- Se a demo total ultrapassar 15 minutos, move primeiro blocos `PASS_COM_RESSALVA` para anexo.
- Se o apresentador tiver de improvisar para explicar um bloco, regista a frase que faltou no roteiro.
- Se um bloco mostrar dados sensíveis, interrompe o ensaio, marca `BLOQUEADO` e remove esse dado da demo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. A medição de tempo transforma a demo numa prova repetível. Sem tempo real, a equipa pode achar que a defesa cabe no limite quando, na prática, fica demasiado longa.

6. Validação do passo.

O passo passa quando todos os blocos ensaiados têm tempo real, resultado observado, proof usado, fallback usado ou indicação explícita de que não foi necessário.

7. Cenário negativo/erro esperado.

Se algum bloco ficar `BLOQUEADO`, não o mantenhas na demo principal. Regista owner, impacto e critério de fecho para decidir se passa para risco residual ou bug bloqueante.

### Passo 3 - Confirmar comandos e evidence essenciais

1. Objetivo funcional do passo no contexto da app.

Garantir que a equipa consegue provar tecnicamente a qualidade da entrega com comandos e ficheiros de evidence, sem depender apenas da UI.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - REVER: `scripts/validate-planificacao.sh`
    - REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
    - REVER: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
    - LOCALIZAÇÃO: secção `Comandos e evidence essenciais`

3. Instruções do que fazer.

Cria uma secção `Comandos e evidence essenciais` com esta tabela:

| Área | Diretório | Comando ou ficheiro | Resultado esperado | Resultado observado | Evidence | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Backend | `backend/` | `npm test` | Testes passam ou falha fica justificada |  |  |  |
| Backend | `backend/` | `npm run smoke` | Smoke passa ou falha fica justificada |  |  |  |
| Frontend | `frontend/` | `npm run build` | Build Vite passa |  |  |  |
| Frontend | `frontend/` | `npm run smoke` | Smoke frontend passa quando existir |  |  |  |
| Planificação | raiz | `bash scripts/validate-planificacao.sh` | Validador sem erros |  |  |  |
| Higiene textual | raiz | `git diff --check` | Sem espaços finais ou conflitos |  |  |  |
| Gate MF6 | `docs/evidence/MF6/GATE-S12-MF6.md` | Decisão técnica | Sem `NO_GO` crítico |  |  |  |
| Gate MF7 | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md` | Decisão UI/navegação | Sem blocker P0 |  |  |  |

Preenche `Estado` com `PASS`, `PASS_COM_RESSALVA`, `FALHA_AMBIENTE`, `BLOQUEADO` ou `NAO_EXECUTADO_COM_JUSTIFICACAO`.

Regras de decisão:

- Se um comando falhar por erro real do projeto, regista `BLOQUEADO`.
- Se falhar por limitação de ambiente, regista `FALHA_AMBIENTE` e escreve o erro observado.
- Se o comando não existir, regista `NAO_EXECUTADO_COM_JUSTIFICACAO` e não inventes script.
- Se a evidence já existir e for suficiente, regista o caminho e a decisão herdada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. A defesa técnica precisa de comandos porque a UI sozinha não prova regressão, build, planificação ou gate. Esta tabela ajuda a responder rapidamente a perguntas sobre qualidade e validação.

6. Validação do passo.

O passo passa quando cada comando ou ficheiro tem resultado, evidence e estado. Nenhuma linha pode ficar vazia sem justificação.

7. Cenário negativo/erro esperado.

Se `npm test` ou `npm run build` falhar por erro real, a decisão do ensaio não pode ser `ENSAIO_APROVADO`. Marca o ensaio como `ENSAIO_BLOQUEADO` ou promove a falha para `BK-MF8-07`.

### Passo 4 - Recolher perguntas técnicas

1. Objetivo funcional do passo no contexto da app.

Preparar respostas curtas, com fonte, para perguntas prováveis da defesa sobre arquitetura, segurança, dados, UI, testes e decisões de escopo.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secção `Perguntas técnicas`

3. Instruções do que fazer.

Cria a secção `Perguntas técnicas` com esta tabela:

| Domínio | Pergunta provável | Resposta curta | Fonte | Owner | Estado |
| --- | --- | --- | --- | --- | --- |
| Arquitetura | Como está separada a responsabilidade entre backend e frontend? |  | `README.md`, BKs MF1, matrizes MF8 |  |  |
| Autenticação e perfis | Como evitam mostrar páginas admin a perfis errados? |  | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md` |  |  |
| Catálogo e player | Que fluxo mostra o valor principal da FaithFlix? |  | `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` |  |  |
| Privacidade | Que dados não devem aparecer na demo? |  | RNF, gates MF6/MF7 |  |  |
| Testes | Que comandos provam regressão e build? |  | `backend/package.json`, `frontend/package.json` |  |  |
| Riscos | Que ressalvas ficam assumidas antes do fecho? |  | gates MF6/MF7, matriz RNF |  |  |

Usa estes estados:

- `RESPONDIDA`: a resposta tem fonte objetiva.
- `RESPONDIDA_COM_RESSALVA`: a resposta existe, mas depende de ressalva já registada.
- `PRECISA_REVER`: a equipa ainda não consegue responder sem hesitar.
- `SEM_FONTE`: a resposta não tem documento, comando ou evidence.

Cada resposta deve ter no máximo três frases. A defesa precisa de clareza, não de leitura longa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. A tabela obriga a equipa a ligar cada resposta a uma fonte. Isto evita respostas vagas como "acho que sim" e ajuda a defender decisões com evidence.

6. Validação do passo.

O passo passa quando todas as perguntas têm resposta curta, fonte e owner. Perguntas `SEM_FONTE` devem bloquear a aprovação do ensaio até serem resolvidas ou registadas como ressalva.

7. Cenário negativo/erro esperado.

Se uma pergunta sobre segurança, privacidade ou perfis ficar `SEM_FONTE`, o ensaio fica `ENSAIO_COM_RESSALVAS` ou `ENSAIO_BLOQUEADO`, conforme impacto.

### Passo 5 - Registar falhas e ajustes

1. Objetivo funcional do passo no contexto da app.

Transformar problemas observados durante o ensaio em ações claras, sem confundir ajuste de apresentação, risco residual e bug bloqueante.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Falhas, ajustes e decisões`

3. Instruções do que fazer.

Cria a secção `Falhas, ajustes e decisões` com esta tabela:

| ID | Observação | Tipo | Impacto | Owner | Ação | Critério de fecho | Vai para |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ENS-001 |  | `AJUSTE_ROTEIRO` |  |  |  |  | `BK-MF8-05` |

Tipos permitidos:

- `AJUSTE_ROTEIRO`: fala, ordem, tempo ou clareza da apresentação.
- `RISCO_RESIDUAL`: limitação conhecida, aceitável e documentada para `BK-MF8-06`.
- `BUG_BLOQUEANTE`: falha que impede demo honesta ou segurança, candidata a `BK-MF8-07`.
- `SEM_ACAO`: observação sem impacto, mantendo justificação.

Critérios:

- Se a falha impede login, autorização, rota principal ou prova central, classifica como `BUG_BLOQUEANTE`.
- Se a falha é uma limitação conhecida e tem fallback honesto, classifica como `RISCO_RESIDUAL`.
- Se a falha é apenas tempo, linguagem ou ordem da demo, classifica como `AJUSTE_ROTEIRO`.
- Se a observação não altera a defesa, classifica como `SEM_ACAO` e justifica.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. A classificação protege a equipa de corrigir tudo por impulso. Nem toda a falha é bug; algumas são risco aceite ou ajuste de comunicação.

6. Validação do passo.

O passo passa quando cada falha tem tipo, impacto, owner, ação, critério de fecho e destino.

7. Cenário negativo/erro esperado.

Se uma falha de segurança for marcada como `SEM_ACAO`, corrige a classificação para `BUG_BLOQUEANTE` ou justifica formalmente porque não expõe risco real.

### Passo 6 - Fechar decisão do ensaio

1. Objetivo funcional do passo no contexto da app.

Tomar uma decisão final sobre a prontidão da defesa técnica, com base em tempos, comandos, perguntas e falhas.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Decisão do ensaio`

3. Instruções do que fazer.

No fim da ata, cria a secção `Decisão do ensaio` com este resumo:

| Indicador | Valor |
| --- | --- |
| Tempo total previsto |  |
| Tempo total real |  |
| Blocos `PASS` |  |
| Blocos `PASS_COM_RESSALVA` |  |
| Blocos `AJUSTAR_ROTEIRO` |  |
| Blocos `BLOQUEADO` |  |
| Perguntas `RESPONDIDA` |  |
| Perguntas `RESPONDIDA_COM_RESSALVA` |  |
| Perguntas `PRECISA_REVER` |  |
| Perguntas `SEM_FONTE` |  |
| Bugs bloqueantes abertos |  |
| Riscos residuais aceites |  |
| Decisão final |  |

A decisão final só pode ser:

- `ENSAIO_APROVADO`: todos os blocos principais passam, não há perguntas sem fonte e não há bug bloqueante aberto.
- `ENSAIO_APROVADO_COM_RESSALVAS`: há ressalvas controladas, ajustes pequenos ou riscos residuais aceites.
- `REPETIR_ENSAIO`: há ajustes relevantes de tempo, ordem ou respostas, mas sem bug bloqueante.
- `ENSAIO_BLOQUEADO`: há bug bloqueante, pergunta crítica sem fonte ou demo principal sem proof.

Antes de fechar, escreve uma frase de justificação com base nos dados da tabela.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. A decisão final evita fechar o ensaio por impressão pessoal. A equipa passa a ter uma regra objetiva para saber se avança, repete o ensaio ou promove falhas para o buffer final.

6. Validação do passo.

O passo passa quando a decisão final é coerente com os indicadores. Por exemplo, não podes escolher `ENSAIO_APROVADO` se existir bloco `BLOQUEADO`.

7. Cenário negativo/erro esperado.

Se a tabela disser `Bugs bloqueantes abertos: 1` e a decisão for `ENSAIO_APROVADO`, corrige a decisão para `ENSAIO_BLOQUEADO` ou justifica que o bug foi fechado com proof antes da decisão.

### Passo 7 - Preparar handoff do feedback

1. Objetivo funcional do passo no contexto da app.

Entregar ao `BK-MF8-05` apenas informação acionável: decisão do ensaio, dúvidas para o orientador, riscos, bugs e ajustes.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - LOCALIZAÇÃO: secção `Handoff para BK-MF8-05`

3. Instruções do que fazer.

Cria a secção `Handoff para BK-MF8-05` com esta lista:

- Decisão final do ensaio.
- Blocos que entram na defesa sem alteração.
- Blocos que entram com ressalva.
- Blocos retirados da defesa.
- Perguntas para validar com o orientador.
- Ajustes de roteiro já aceites.
- Riscos residuais candidatos a `BK-MF8-06`.
- Bugs bloqueantes candidatos a `BK-MF8-07`.
- Comandos ou evidence que devem ser mostrados se forem pedidos.
- Owner de cada ponto em aberto.

Depois cria esta tabela de handoff:

| Item | Tipo | Owner | Evidence | Decisão pedida ao orientador | Destino |
| --- | --- | --- | --- | --- | --- |
| 1 | `DUVIDA_ORIENTADOR` |  |  |  | `BK-MF8-05` |

Tipos permitidos: `DUVIDA_ORIENTADOR`, `AJUSTE_ROTEIRO`, `RISCO_RESIDUAL`, `BUG_BLOQUEANTE`, `SEM_ACAO`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica e operacional; o resultado fica registado em `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.

5. Explicação do código.

Não há código a explicar neste passo. O handoff impede que o feedback final comece do zero. O orientador recebe decisões e dúvidas concretas, não uma conversa solta sobre o ensaio.

6. Validação do passo.

O handoff passa quando outra pessoa consegue abrir `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` e preparar o `BK-MF8-05` sem pedir contexto adicional.

7. Cenário negativo/erro esperado.

Se existir item sem owner ou sem destino, não feches o handoff. Um ponto sem responsável tende a desaparecer sem decisão.

#### Critérios de aceite

- A ata de ensaio tem estado de entrada, demo cronometrada, comandos/evidence, perguntas técnicas, falhas, decisão e handoff.
- Cada bloco ensaiado tem tempo previsto, tempo real, proof, fallback e estado.
- Cada comando ou evidence essencial tem resultado observado e estado.
- Cada pergunta técnica tem resposta curta, fonte e owner.
- Cada falha tem tipo, impacto, owner, ação, critério de fecho e destino.
- A decisão final é uma das quatro permitidas: `ENSAIO_APROVADO`, `ENSAIO_APROVADO_COM_RESSALVAS`, `REPETIR_ENSAIO` ou `ENSAIO_BLOQUEADO`.
- O handoff entrega dúvidas, riscos, bugs e ajustes para `BK-MF8-05`.

#### Validação final

- Confirmar que `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` existe.
- Confirmar que os blocos ensaiados vieram do roteiro final.
- Confirmar que nenhum bloco sem proof fica aprovado sem ressalva.
- Confirmar que perguntas críticas sem fonte impedem `ENSAIO_APROVADO`.
- Confirmar que bugs bloqueantes impedem `ENSAIO_APROVADO`.
- Confirmar que dados sensíveis reais não aparecem na ata.
- Executar `git diff --check` após editar a ata.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`.
- `neg`: bloco bloqueado, pergunta crítica sem fonte ou bug bloqueante impede aprovação do ensaio.
- `fonte`: roteiro, matrizes, gates MF6/MF7, comandos de backend/frontend e validador de planificação.

#### Handoff

O `BK-MF8-05` deve usar a ata de ensaio como entrada principal para a avaliação final do orientador.

- Entregar `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` preenchido.
- Entregar decisão final do ensaio e justificação.
- Entregar perguntas para o orientador com owner e fonte.
- Entregar riscos residuais candidatos a `BK-MF8-06`.
- Entregar bugs bloqueantes candidatos a `BK-MF8-07`.
- Não apagar falhas históricas; atualizar estado, decisão e proof.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: passos 2 a 6 corrigidos com modelo concreto de demo cronometrada, comandos, perguntas técnicas, classificação de falhas, decisão de ensaio e handoff para feedback.
