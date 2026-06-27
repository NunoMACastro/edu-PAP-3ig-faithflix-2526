# BK-MF8-09 - Empacotamento final de entrega

## Header

- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-08`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-10`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-empacotamento-final-de-entrega.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais preparar o pacote final de entrega da FaithFlix: manifesto, comandos executados, ficheiros essenciais, evidence incluída, exclusões justificadas e checklist de abertura pelo avaliador.

#### Importância

A entrega final deve ser reproduzível. Um pacote sem manifesto obriga o avaliador a adivinhar comandos, ficheiros, evidence e limitações. O empacotamento protege a equipa porque separa o que foi congelado no `BK-MF8-08`, o que vai para avaliação, o que fica excluído e que provas demonstram que a entrega pode ser aberta sem conversa oral.

#### Scope-in

- Confirmar que o freeze final de `BK-MF8-08` permite iniciar o pacote.
- Criar ou atualizar `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`.
- Listar estrutura do pacote, ficheiros essenciais e evidence incluída.
- Listar comandos finais por diretório, com resultado esperado e proof.
- Excluir ficheiros sensíveis, artefactos locais e outputs regeneráveis.
- Entregar handoff claro para `BK-MF8-10`.

#### Scope-out

- Alterar escopo depois do freeze.
- Corrigir bugs bloqueantes fora de `BK-MF8-07`.
- Incluir ficheiros sensíveis no pacote final.
- Omitir comandos falhados ou validações não executadas.
- Empacotar artefactos temporários sem utilidade para avaliação.
- Reescrever README, backlogs, RF, RNF ou matriz canónica sem decisão documentada.

#### Estado antes e depois

- Estado antes: o scope freeze define exatamente o que entra na entrega.
- Estado antes: a dependência `BK-MF8-08` tem de estar concluída, validada ou registada com ressalva.
- Estado antes: matrizes RF/RNF, roteiro, ensaio, feedback, riscos e bugs já produziram evidence ou ressalvas.
- Estado depois: existe manifesto final para abrir, validar e defender a entrega sem adivinhação.
- Estado depois: comandos, ficheiros, evidence, exclusões e riscos aceites ficam rastreados.
- Estado depois: o handoff para `BK-MF8-10` fica explícito no artefacto de empacotamento.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-08` está disponível ou tem ressalva registada.
- Rever `README.md`, `backend/package.json`, `frontend/package.json` e `scripts/`.
- Rever `docs/evidence/MF6/`, `docs/evidence/MF7/` e `docs/evidence/MF8/`.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.
- Não alterar RF, RNF, owner, prioridade, sprint ou dependência sem decisão documentada do orientador.

#### Glossário

- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação da equipa.
- Negativo: cenário em que a entrega deve bloquear, avisar ou falhar de forma controlada.
- Scope freeze: ponto em que novas alterações passam a exigir aprovação explícita.
- Manifesto: documento que explica como abrir, validar e avaliar a entrega.
- Pacote final: conjunto de código, documentação e evidence que segue para avaliação.
- Exclusão sensível: ficheiro ou conteúdo que não deve entrar no pacote por risco de segurança, privacidade, ruído ou irreprodutibilidade.
- Handoff: informação mínima para o próximo BK continuar sem adivinhar contexto.

#### Conceitos teóricos essenciais

- `CANONICO`: MF8 termina com entrega final e retro.
- `CANONICO`: `BK-MF8-09` depende de `BK-MF8-08` e prepara `BK-MF8-10`.
- `DERIVADO`: o manifesto é o ponto de entrada para avaliador e equipa.
- `DERIVADO`: o pacote usa estados `PRONTO_PARA_ENTREGA`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO`.
- Empacotamento não muda produto; organiza o que já foi congelado.
- Manifesto final deve responder a cinco perguntas: o que está incluído, como se valida, que evidence prova, que fica excluído e que ressalvas devem ser defendidas.
- Comando documentado precisa de diretório, objetivo, pré-condição, resultado esperado, proof e decisão.
- Ficheiros sensíveis não pertencem ao pacote, mesmo que existam no ambiente local.
- Evidence sem caminho, owner ou estado não é suficiente para defesa.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Freeze | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` | Define o que entra, fica fora ou segue com ressalva. |
| Código backend | `backend/` | Projeto de API a validar e referenciar no manifesto. |
| Código frontend | `frontend/` | Projeto web a validar e referenciar no manifesto. |
| Scripts | `scripts/` | Validações de planificação e checks auxiliares. |
| Evidence | `docs/evidence/` | Provas MF6, MF7 e MF8 usadas na defesa. |
| Manifesto | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` | Lista estrutura, comandos, evidence, exclusões, decisão e handoff. |
| Retro | `BK-MF8-10` | Usa problemas e aprendizagens do pacote final. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
- REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
- REVER: `README.md`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`
- REVER: `scripts/validate-planificacao.sh`
- REVER: `docs/evidence/MF6/`
- REVER: `docs/evidence/MF7/`
- REVER: `docs/evidence/MF8/`

#### Tutorial técnico linear

### Passo 1 - Confirmar freeze final

1. Objetivo funcional do passo no contexto da app.

Validar a entrada do empacotamento: o pacote final só pode começar se o freeze de `BK-MF8-08` indicar que a entrega pode avançar, avançar com ressalvas ou ficar bloqueada com motivo explícito.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `README.md`
    - LOCALIZAÇÃO: secção `Entrada do pacote`

3. Instruções do que fazer.

Cria a secção `Entrada do pacote` em `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`.

Preenche esta tabela:

| Campo | Valor |
| --- | --- |
| BK de origem | `BK-MF8-08` |
| Artefacto de freeze | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` |
| Owner do pacote | `Kaue` |
| Data de preparação |  |
| Decisão recebida do freeze | `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR` |
| Condição para empacotar |  |
| Proof principal do freeze |  |
| Riscos que têm de aparecer no pacote |  |

Aplica estas regras:

- Se a decisão for `PODE_CONGELAR`, o pacote pode seguir sem ressalvas obrigatórias.
- Se a decisão for `CONGELAR_COM_RESSALVAS`, copia as ressalvas para o manifesto e prepara texto de defesa.
- Se a decisão for `NAO_CONGELAR`, não declares o pacote como pronto; regista `BLOQUEADO` e devolve o trabalho ao owner indicado no freeze.
- Não substituas a decisão de freeze por opinião da equipa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de validação operacional: o pacote não altera a app, apenas confirma se pode ser preparado.

5. Explicação do código.

Não há código a explicar neste passo. A entrada do pacote evita que o empacotamento esconda blockers. O `BK-MF8-08` é a fonte da decisão; este BK apenas transforma essa decisão numa checklist de entrega.

6. Validação do passo.

A validação passa quando a decisão de freeze, o proof principal e a condição para empacotar estão preenchidos. Se a decisão for `NAO_CONGELAR`, o estado do pacote tem de ficar `BLOQUEADO`.

7. Cenário negativo/erro esperado.

Se `SCOPE-FREEZE-FINAL.md` indicar `NAO_CONGELAR` e o manifesto disser `PRONTO_PARA_ENTREGA`, a validação falha. Corrige o estado para `BLOQUEADO` e indica o owner que deve resolver o blocker.

### Passo 2 - Inventariar entrega

1. Objetivo funcional do passo no contexto da app.

Listar os elementos que entram no pacote final, separando código, documentação, evidence e instruções de abertura.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `README.md`
    - REVER: `backend/`
    - REVER: `frontend/`
    - REVER: `docs/`
    - LOCALIZAÇÃO: secções `Estrutura do pacote` e `Inventário da entrega`

3. Instruções do que fazer.

Cria a secção `Estrutura do pacote` e define a organização esperada:

| Área | Caminho | Entra no pacote? | Motivo | Observação |
| --- | --- | --- | --- | --- |
| Documentação principal | `README.md` | `SIM` | Explica visão, stack e abertura da PAP. | Rever antes de entregar. |
| Backend | `backend/` | `SIM` | Contém API e scripts de validação backend. | Excluir dependências instaladas localmente. |
| Frontend | `frontend/` | `SIM` | Contém app React/Vite e scripts de build. | Excluir outputs regeneráveis. |
| Planificação | `docs/planificacao/` | `SIM` | Contém backlog, matriz e guias BK. | Deve manter cadeia MF0..MF8. |
| Evidence | `docs/evidence/` | `SIM` | Contém provas de validação, gate e defesa. | Incluir apenas evidence sem dados sensíveis. |
| Scripts | `scripts/` | `SIM` | Contém validações de planificação. | Documentar comando de execução. |

Depois cria a secção `Inventário da entrega`:

| Item | Tipo | Fonte de freeze | Caminho no pacote | Owner | Estado | Proof |
| --- | --- | --- | --- | --- | --- | --- |
| Backend FaithFlix | `CODIGO` | `DENTRO_DO_SCOPE` | `backend/` |  | `INCLUIR` |  |
| Frontend FaithFlix | `CODIGO` | `DENTRO_DO_SCOPE` | `frontend/` |  | `INCLUIR` |  |
| Guias BK | `DOCUMENTACAO` | `DENTRO_DO_SCOPE` | `docs/planificacao/guias-bk/` |  | `INCLUIR` |  |
| Evidence final | `EVIDENCE` | `DENTRO_DO_SCOPE` ou `RESSALVA` | `docs/evidence/` |  | `INCLUIR` ou `INCLUIR_COM_RESSALVA` |  |
| Limitações aceites | `RESSALVA` | `FORA_DO_SCOPE` ou `RISCO_ACEITE` | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` |  | `MENCIONAR_NA_DEFESA` |  |

Aplica estas regras:

- Usa `INCLUIR` apenas quando o item existe e tem origem no freeze.
- Usa `INCLUIR_COM_RESSALVA` quando o item entra, mas precisa de texto de defesa.
- Usa `EXCLUIR` quando o item fica fora do scope final.
- Usa `BLOQUEAR_PACOTE` quando um item essencial não existe, não tem owner ou não tem proof.
- Não inventes ficheiros que ainda não foram criados pelos BKs anteriores.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de inventário: o manifesto explica a estrutura do pacote sem alterar `backend/` nem `frontend/`.

5. Explicação do código.

Não há código a explicar neste passo. O inventário evita uma entrega ambígua. Cada item liga área, caminho, decisão de freeze, owner, estado e proof, para o avaliador perceber o que está incluído e porquê.

6. Validação do passo.

A validação passa quando todos os itens essenciais têm caminho, owner, estado e proof. Um item sem caminho real deve ficar `BLOQUEAR_PACOTE` ou sair do pacote.

7. Cenário negativo/erro esperado.

Se a equipa escrever "evidence final incluída" sem listar caminhos concretos em `docs/evidence/`, a validação falha. Substitui por linhas específicas, como matriz RF, matriz RNF, gate MF6, gate MF7, freeze e manifesto.

### Passo 3 - Listar comandos finais

1. Objetivo funcional do passo no contexto da app.

Registar os comandos que o avaliador ou a equipa devem conseguir repetir para validar a entrega final.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - REVER: `scripts/validate-planificacao.sh`
    - LOCALIZAÇÃO: secção `Comandos finais de validação`

3. Instruções do que fazer.

Cria a secção `Comandos finais de validação` e preenche a tabela seguinte:

| Ordem | Diretório | Comando | Objetivo | Pré-condição | Resultado esperado | Proof a anexar | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | raiz | `bash scripts/validate-planificacao.sh` | Confirmar 60 BK e 60 guias. | Repositório completo. | `PASS` sem erros. | Output do comando. | `EXECUTAR` |
| 2 | raiz | `git diff --check` | Confirmar higiene de whitespace. | Alterações guardadas. | Sem output. | Output vazio ou nota `sem erros`. | `EXECUTAR` |
| 3 | `backend/` | `npm test` | Correr testes backend. | Dependências instaladas. | Testes passam. | Output resumido. | `EXECUTAR` ou `BLOQUEADO_AMBIENTE` |
| 4 | `backend/` | `npm run smoke` | Validar smoke backend. | Dependências instaladas e ambiente preparado. | Smoke passa ou bloqueio documentado. | Output resumido. | `EXECUTAR` ou `BLOQUEADO_AMBIENTE` |
| 5 | `frontend/` | `npm run build` | Confirmar build frontend. | Dependências instaladas. | Build termina sem erro. | Output resumido. | `EXECUTAR` ou `BLOQUEADO_AMBIENTE` |
| 6 | `frontend/` | `npm run smoke` | Validar smoke frontend. | Dependências instaladas. | Smoke passa ou aponta para build. | Output resumido. | `EXECUTAR` ou `BLOQUEADO_AMBIENTE` |

Aplica estas regras:

- Não escrevas apenas `npm test`; indica sempre o diretório.
- Se um comando não foi executado, usa `NAO_EXECUTADO` e explica o motivo.
- Se falhar por ambiente, usa `BLOQUEADO_AMBIENTE` e copia a mensagem essencial.
- Se falhar por erro do projeto, usa `FALHA_PROJETO` e bloqueia o pacote.
- Se passar, usa `PASS` e guarda o output resumido.
- Não apagues comandos falhados para melhorar a aparência do pacote.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é operacional: documenta comandos existentes nos packages e scripts do projeto.

5. Explicação do código.

Não há código a explicar neste passo. A matriz de comandos torna a entrega reproduzível. Diretório, comando, pré-condição e proof evitam que alguém execute a validação no sítio errado ou aceite uma prova sem output.

6. Validação do passo.

A validação passa quando cada comando tem diretório, objetivo, pré-condição, resultado esperado, proof e estado. Comandos marcados como `FALHA_PROJETO` bloqueiam a decisão final do pacote.

7. Cenário negativo/erro esperado.

Se o manifesto disser que o frontend foi validado mas não indicar `frontend/`, comando, output e estado, a validação falha. Completa a linha antes de fechar o manifesto.

### Passo 4 - Confirmar evidence incluída

1. Objetivo funcional do passo no contexto da app.

Confirmar que a evidence necessária para defesa está dentro do pacote e ligada à fase correta.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF6/`
    - REVER: `docs/evidence/MF7/`
    - REVER: `docs/evidence/MF8/`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secção `Evidence incluída`

3. Instruções do que fazer.

Cria a secção `Evidence incluída` e preenche esta matriz:

| Evidence | Macro | Caminho | Origem/BK | Prova que oferece | Estado | Observação de defesa |
| --- | --- | --- | --- | --- | --- | --- |
| Gate técnico final | MF6 | `docs/evidence/MF6/GATE-S12-MF6.md` | `BK-MF6-06` | Estado técnico antes da fase final. | `INCLUIR` ou `AUSENTE` |  |
| Gate visual/navegação | MF7 | `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md` | `BK-MF7-05` | Base visual e navegação segura. | `INCLUIR` ou `AUSENTE` |  |
| Matriz RF | MF8 | `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` | `BK-MF8-01` | Cobertura funcional. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Matriz RNF | MF8 | `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` | `BK-MF8-02` | Cobertura não funcional. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Roteiro de demo | MF8 | `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` | `BK-MF8-03` | Ordem da apresentação. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Ensaio técnico | MF8 | `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` | `BK-MF8-04` | Perguntas, falhas e ajustes. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Feedback final | MF8 | `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` | `BK-MF8-05` | Decisões finais do orientador. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Riscos residuais | MF8 | `docs/evidence/MF8/RISCOS-RESIDUAIS.md` | `BK-MF8-06` | Limitações aceites. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Bugs bloqueantes | MF8 | `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md` | `BK-MF8-07` | Estado de blockers. | `INCLUIR`, `RESSALVA` ou `AUSENTE` |  |
| Freeze final | MF8 | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` | `BK-MF8-08` | Contrato do pacote. | `INCLUIR` ou `AUSENTE` |  |
| Manifesto final | MF8 | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` | `BK-MF8-09` | Abertura e validação da entrega. | `INCLUIR` |  |

Aplica estas regras:

- Usa `INCLUIR` quando o ficheiro existe e está pronto para defesa.
- Usa `RESSALVA` quando existe, mas contém limitação aceite.
- Usa `AUSENTE` quando o ficheiro ainda não existe; nesse caso indica se bloqueia pacote.
- Evidence P0 ausente deve bloquear ou exigir decisão do orientador.
- Evidence de ressalva deve aparecer no texto de defesa final, não ficar escondida.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental: o aluno está a confirmar provas, não a alterar funcionalidades.

5. Explicação do código.

Não há código a explicar neste passo. A matriz de evidence liga cada prova à macro e ao BK que a originou. Isto evita empacotar ficheiros soltos sem contexto e ajuda a defesa a explicar que prova demonstra cada decisão.

6. Validação do passo.

A validação passa quando cada evidence tem macro, caminho, origem, prova oferecida, estado e observação. Evidence marcada como `AUSENTE` deve indicar impacto no pacote.

7. Cenário negativo/erro esperado.

Se a matriz RF estiver ausente e o pacote continuar `PRONTO_PARA_ENTREGA`, a validação falha. Marca o pacote como `BLOQUEADO` ou obtém decisão explícita do orientador.

### Passo 5 - Verificar exclusões sensíveis

1. Objetivo funcional do passo no contexto da app.

Impedir que o pacote final inclua ficheiros que exponham dados, confundam a avaliação ou tornem a entrega pesada e irreprodutível.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `backend/`
    - REVER: `frontend/`
    - REVER: `docs/evidence/`
    - REVER: `README.md`
    - LOCALIZAÇÃO: secção `Exclusões sensíveis e artefactos fora do pacote`

3. Instruções do que fazer.

Cria a secção `Exclusões sensíveis e artefactos fora do pacote`.

Preenche esta checklist:

| Padrão/ficheiro | Motivo de exclusão | Como validar | Estado | Observação |
| --- | --- | --- | --- | --- |
| `.env` e variantes locais | Pode conter segredos ou configurações privadas. | Confirmar ausência no pacote. | `EXCLUIR` |  |
| Ficheiros com passwords, tokens ou chaves privadas | Risco direto de segurança. | Pesquisar termos sensíveis antes de entregar. | `EXCLUIR` |  |
| `node_modules/` | Dependências são instaláveis e tornam o pacote pesado. | Confirmar ausência em `backend/` e `frontend/`. | `EXCLUIR` |  |
| `frontend/dist/` | Output regenerável por build. | Incluir só se o orientador pedir entrega compilada. | `EXCLUIR` ou `INCLUIR_COM_DECISAO` |  |
| caches locais | Ruído de ambiente. | Confirmar ausência de pastas de cache. | `EXCLUIR` |  |
| dumps locais de base de dados | Podem conter dados pessoais ou estado não validado. | Confirmar ausência. | `EXCLUIR` |  |
| screenshots com dados pessoais | Risco de privacidade. | Rever nomes, emails, cookies, identificadores e dados sensíveis. | `EXCLUIR` ou `ANONIMIZAR` |  |
| logs com cabeçalhos, cookies ou credenciais | Risco de exposição de sessão. | Rever outputs anexados. | `EXCLUIR` ou `ANONIMIZAR` |  |
| ficheiros temporários do editor | Ruído e baixa qualidade de entrega. | Confirmar ausência. | `EXCLUIR` |  |

Depois cria a tabela `Exclusões decididas`:

| Item excluído | Caminho ou padrão | Motivo | Risco se entrasse | Owner da decisão | Estado |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  | `EXCLUIDO`, `ANONIMIZADO` ou `INCLUIR_COM_DECISAO` |

Aplica estas regras:

- `INCLUIR_COM_DECISAO` só pode ser usado quando houver motivo pedagógico e aprovação.
- Prints e logs com dados sensíveis devem ser removidos ou anonimizados.
- Não escondas exclusões; documenta-as para o avaliador perceber que foram intencionais.
- Se encontrares segredo real, bloqueia o pacote e remove o ficheiro do conjunto de entrega.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de segurança e qualidade de entrega: rever e decidir, não alterar a app.

5. Explicação do código.

Não há código a explicar neste passo. A lista de exclusões protege dados, credenciais e clareza do pacote. Uma entrega académica também deve mostrar maturidade operacional: incluir apenas o necessário e justificar o que fica fora.

6. Validação do passo.

A validação passa quando a checklist está preenchida e qualquer exceção tem owner e decisão. Um segredo real ou log sensível não anonimizado bloqueia o pacote.

7. Cenário negativo/erro esperado.

Se o pacote incluir `.env` ou uma captura com cookie visível, a validação falha. Remove o ficheiro ou anonimiza a prova antes de continuar.

### Passo 6 - Fechar manifesto

1. Objetivo funcional do passo no contexto da app.

Emitir a decisão final sobre o pacote, consolidando inventário, comandos, evidence, exclusões e ressalvas.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `README.md`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - LOCALIZAÇÃO: secções `Resumo final do pacote` e `Decisão final de empacotamento`

3. Instruções do que fazer.

Cria a secção `Resumo final do pacote`:

| Campo | Valor |
| --- | --- |
| Código backend incluído | `SIM`, `NAO` ou `BLOQUEADO` |
| Código frontend incluído | `SIM`, `NAO` ou `BLOQUEADO` |
| Documentação incluída | `SIM`, `NAO` ou `BLOQUEADO` |
| Evidence incluída | `SIM`, `SIM_COM_RESSALVAS`, `NAO` ou `BLOQUEADO` |
| Comandos executados |  |
| Comandos bloqueados por ambiente |  |
| Comandos com falha de projeto |  |
| Ficheiros sensíveis excluídos |  |
| Riscos a mencionar na defesa |  |

Depois cria a secção `Decisão final de empacotamento`:

| Campo | Valor |
| --- | --- |
| Estado final | `PRONTO_PARA_ENTREGA`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO` |
| Motivo |  |
| Proof principal | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` |
| Condição para `BK-MF8-10` |  |
| Owner que confirma | `Kaue` |
| Data de fecho |  |

Aplica estas regras:

- Usa `PRONTO_PARA_ENTREGA` apenas se não houver falhas de projeto, evidence P0 ausente ou segredo no pacote.
- Usa `PRONTO_COM_RESSALVAS` quando existem limitações aceites e descritas no freeze.
- Usa `BLOQUEADO` quando existe comando essencial com falha de projeto, evidence central ausente ou ficheiro sensível não resolvido.
- A decisão final tem de ser compatível com a decisão de freeze do `BK-MF8-08`.
- Escreve um parágrafo curto de defesa para cada ressalva.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de decisão: o manifesto diz se a entrega pode ser enviada.

5. Explicação do código.

Não há código a explicar neste passo. A decisão final impede sucesso artificial. Se a entrega tem ressalvas, elas ficam visíveis; se está bloqueada, o manifesto explica o motivo e o próximo owner.

6. Validação do passo.

A validação passa quando o estado final é coerente com comandos, evidence e exclusões. `PRONTO_PARA_ENTREGA` é inválido se existir falha de projeto ou evidence central ausente.

7. Cenário negativo/erro esperado.

Se `npm run build` em `frontend/` falhar e o manifesto disser `PRONTO_PARA_ENTREGA`, a validação falha. Muda o estado para `BLOQUEADO` ou corrige a falha num BK apropriado antes de empacotar.

### Passo 7 - Preparar handoff da retro

1. Objetivo funcional do passo no contexto da app.

Fechar a passagem de `BK-MF8-09` para `BK-MF8-10`, deixando claro que problemas, decisões e aprendizagens a retro deve consumir.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-10-retro-final-e-licoes-aprendidas.md`
    - LOCALIZAÇÃO: secção `Handoff para BK-MF8-10`

3. Instruções do que fazer.

Cria a secção `Handoff para BK-MF8-10`.

Preenche a tabela:

| Campo | Valor |
| --- | --- |
| Estado final do pacote | `PRONTO_PARA_ENTREGA`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO` |
| Manifesto final | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` |
| Riscos que a retro deve discutir |  |
| Comandos que falharam ou ficaram bloqueados |  |
| Ficheiros excluídos por segurança/privacidade |  |
| Decisões difíceis tomadas no pacote |  |
| Lições técnicas candidatas |  |
| Lições de processo candidatas |  |
| Owner da retro | `Nuno` |

Depois cria a tabela `Problemas para retro`:

| Problema | Origem | Impacto | Decisão tomada | Lição provável | Deve virar ação futura? |
| --- | --- | --- | --- | --- | --- |
|  | `COMANDO`, `EVIDENCE`, `EXCLUSAO`, `RESSALVA`, `ORGANIZACAO` ou `DEFESA` |  |  |  | `SIM` ou `NAO` |

Aplica estas regras:

- Não escondas falhas históricas; transforma-as em aprendizagem.
- Se o pacote ficou `BLOQUEADO`, a retro deve começar pelo motivo do bloqueio.
- Se o pacote ficou `PRONTO_COM_RESSALVAS`, a retro deve discutir se as ressalvas surgiram tarde ou já eram conhecidas.
- O handoff deve permitir que `BK-MF8-10` escreva lições reais, não frases genéricas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de handoff entre BKs.

5. Explicação do código.

Não há código a explicar neste passo. O handoff transforma a entrega em aprendizagem. A retro final fica melhor quando recebe problemas concretos, decisões, impactos e possíveis ações futuras.

6. Validação do passo.

O handoff passa quando outra pessoa consegue abrir o manifesto e iniciar `BK-MF8-10` sem pedir explicação oral.

7. Cenário negativo/erro esperado.

Se `BK-MF8-10` precisar de saber que comando falhou e o handoff só disser "houve problemas", a validação falha. Regista comando, diretório, impacto e decisão tomada.

#### Critérios de aceite

- O manifesto indica decisão de freeze recebida de `BK-MF8-08`.
- O manifesto lista estrutura do pacote com caminhos concretos.
- O manifesto inventaria código, documentação, scripts e evidence com owner, estado e proof.
- Os comandos finais têm diretório, comando, pré-condição, resultado esperado, proof e estado.
- Evidence MF6, MF7 e MF8 fica referenciada com caminho, origem e estado.
- Ficheiros sensíveis, dependências locais, caches, outputs regeneráveis e logs sensíveis ficam excluídos ou justificados.
- A decisão final usa apenas `PRONTO_PARA_ENTREGA`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO`.
- O `BK-MF8-10` recebe handoff com problemas, decisões, riscos e lições candidatas.

#### Validação final

- Confirmar que `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` tem `Entrada do pacote`, `Estrutura do pacote`, `Inventário da entrega`, `Comandos finais de validação`, `Evidence incluída`, `Exclusões sensíveis e artefactos fora do pacote`, `Resumo final do pacote`, `Decisão final de empacotamento` e `Handoff para BK-MF8-10`.
- Rever cada comando e confirmar diretório, objetivo, pré-condição, resultado esperado, proof e estado.
- Rever cada linha de evidence e confirmar caminho, origem, prova oferecida e impacto se estiver ausente.
- Confirmar que nenhuma linha com `FALHA_PROJETO`, evidence central ausente ou segredo real permite `PRONTO_PARA_ENTREGA`.
- Confirmar que o pacote não lista ficheiros sensíveis como entregáveis.
- Executar `bash scripts/validate-planificacao.sh` na raiz.
- Executar `git diff --check` na raiz.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`.
- `neg`: ficheiro sensível, comando sem diretório, evidence ausente ou falha de projeto bloqueia pacote.
- `fonte`: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`, `README.md`, `backend/package.json`, `frontend/package.json`, `docs/evidence/` e `scripts/`.
- `decisao`: `PRONTO_PARA_ENTREGA`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO`.

#### Handoff

O `BK-MF8-10` deve usar o manifesto para fechar aprendizagens reais da entrega.

- Entregar `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` preenchido.
- Indicar estado final do pacote e motivo.
- Indicar comandos executados, comandos bloqueados e comandos com falha.
- Indicar evidence ausente, evidence com ressalva e ficheiros excluídos.
- Registar problemas com owner, impacto e critério de fecho.
- Não apagar falhas históricas; atualizar estado, decisão e aprendizagem.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: passos 2 a 6 reescritos com matrizes de inventário, comandos, evidence, exclusões, decisão final e handoff para retro.
