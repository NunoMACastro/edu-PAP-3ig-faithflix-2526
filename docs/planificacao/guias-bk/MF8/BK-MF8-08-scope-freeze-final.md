# BK-MF8-08 - Scope freeze final

## Header

- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-07`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-scope-freeze-final.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais declarar o scope freeze final da FaithFlix: o que entra na entrega, o que fica fora, que riscos são aceites, que blockers impedem o fecho e que regra passa a controlar qualquer mudança até ao pacote final.

#### Importância

Sem freeze, a equipa pode continuar a alterar produto até quebrar a entrega. O freeze protege estabilidade, evidência, demo, defesa e empacotamento final, porque transforma o estado da app numa baseline que todos conseguem rever.

#### Scope-in

- Confirmar que `BK-MF8-07` fechou, bloqueou ou justificou todos os bugs bloqueantes.
- Listar funcionalidades, validações e artefactos que ficam dentro da entrega final.
- Listar pedidos, melhorias, riscos e limitações que ficam fora da entrega final.
- Definir regra de mudança pós-freeze com owner, motivo, risco, aprovação e validação.
- Registar a decisão final de freeze para o `BK-MF8-09`.

#### Scope-out

- Adicionar funcionalidades novas.
- Reclassificar blockers sem decisão documentada.
- Alterar RF, RNF, owner, prioridade, sprint ou dependência durante o pacote final.
- Apagar riscos residuais aceites ou falhas históricas.
- Corrigir bugs de produto dentro deste BK sem passarem pelo `BK-MF8-07`.

#### Estado antes e depois

- Estado antes: bugs bloqueantes já foram corrigidos, bloqueados, descartados ou decididos no `BK-MF8-07`.
- Estado antes: riscos residuais aceites e mitigados vêm do `BK-MF8-06`.
- Estado antes: roteiro de demo, matrizes RF/RNF e feedback final já indicam o que a entrega promete demonstrar.
- Estado depois: o escopo final fica congelado, com itens dentro e fora da entrega registados.
- Estado depois: qualquer mudança passa a exigir motivo, owner, aprovação e prova.
- Estado depois: o handoff para `BK-MF8-09` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-07` está disponível ou tem ressalva registada.
- Rever `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md` e `docs/evidence/MF8/RISCOS-RESIDUAIS.md`.
- Rever `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`, `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` e `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.
- Não alterar RF, RNF, owner, prioridade, sprint ou dependência sem decisão documentada do orientador.

#### Glossário

- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação da equipa.
- Negativo: cenário em que a entrega deve bloquear, avisar ou falhar de forma controlada.
- Risco residual: limitação conhecida, avaliada e aceite para defesa.
- Bug bloqueante: falha que impede entrega honesta ou defesa segura.
- Scope freeze: ponto em que novas alterações passam a exigir aprovação explícita.
- Baseline: fotografia controlada do que está dentro da entrega final.
- Handoff: informação mínima para o próximo BK continuar sem adivinhar contexto.

#### Conceitos teóricos essenciais

- `CANONICO`: MF8 inclui scope freeze antes de empacotamento.
- `CANONICO`: `BK-MF8-08` depende de `BK-MF8-07` e prepara `BK-MF8-09`.
- `DERIVADO`: a decisão final de freeze usa `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR` para tornar o handoff mensurável.
- `DERIVADO`: alteração depois do freeze precisa de motivo, owner, risco, aprovação e validação.
- Scope freeze não significa perfeição; significa estabilidade consciente e defendível.
- Item dentro do scope deve ter fonte e proof, não apenas uma promessa verbal.
- Item fora do scope deve ter justificação defendível para não parecer omissão.
- Mudança tardia só entra se corrigir blocker, erro documental crítico ou risco aceite pelo orientador.
- O pacote final não decide escopo; apenas empacota o que este BK congelar.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Bugs | `CORRECAO-BUGS-BLOQUEANTES.md` | Confirma blockers resolvidos, bloqueados ou aceites com decisão. |
| Riscos | `RISCOS-RESIDUAIS.md` | Lista ressalvas aceites e riscos ainda presentes. |
| Matrizes | `MATRIZ-RF-EVIDENCIA.md`, `MATRIZ-RNF-VALIDACAO.md` | Mostram requisitos e validações que entram na entrega. |
| Demo | `ROTEIRO-DEMO-FINAL.md` | Define o que a equipa promete demonstrar. |
| Freeze | `SCOPE-FREEZE-FINAL.md` | Congela inclusões, exclusões, regra de mudança e decisão final. |
| Pacote | `BK-MF8-09` | Usa o freeze como contrato de empacotamento. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
- REVER: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
- REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
- REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar blockers fechados

1. Objetivo funcional do passo no contexto da app.

Validar a entrada do freeze: o escopo só pode congelar se os bugs bloqueantes vindos do `BK-MF8-07` estiverem fechados, bloqueados com motivo ou aceites por decisão explícita.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - LOCALIZAÇÃO: secções `Entrada do freeze` e `Estado dos blockers`

3. Instruções do que fazer.

Cria a secção `Entrada do freeze` em `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` e regista a dependência do `BK-MF8-07`.

Usa esta tabela:

| Campo | Valor |
| --- | --- |
| BK dependente | `BK-MF8-07` |
| Artefacto revisto | `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md` |
| Owner do freeze | `Nuno` |
| Data da revisão |  |
| Decisão recebida do `BK-MF8-07` | `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR` |
| Proof principal |  |
| Observação |  |

Depois cria a secção `Estado dos blockers` e copia a tabela de handoff do `BK-MF8-07`.

Usa esta tabela:

| Bug ID | Estado final no `BK-MF8-07` | Evidence para freeze | Ação no freeze | Owner | Pode congelar? |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | `CORRIGIDO`, `CORRIGIDO_SEM_VALIDACAO_TOTAL`, `BLOQUEADO`, `BLOQUEADO_POR_SCOPE` ou `NAO_REPRODUZIDO` |  | `CONGELAR`, `CONGELAR_COM_RESSALVA`, `BLOQUEAR_FREEZE` ou `PEDIR_DECISAO_ORIENTADOR` |  | `SIM` ou `NAO` |

Aplica estas regras:

- Usa `CONGELAR` apenas quando o blocker tem proof depois e validação de regressão.
- Usa `CONGELAR_COM_RESSALVA` quando o orientador aceitou uma validação incompleta.
- Usa `BLOQUEAR_FREEZE` se existir bug de segurança, privacidade, build, teste obrigatório, demo central ou prova principal ainda aberto.
- Usa `PEDIR_DECISAO_ORIENTADOR` se a equipa não tiver autoridade para aceitar o risco.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de validação operacional: o freeze não deve alterar a app, deve decidir se a app pode parar de mudar.

5. Explicação do código.

Não há código a explicar neste passo. A confirmação dos blockers evita congelar uma entrega com falhas escondidas. O `BK-MF8-07` é a fonte da decisão técnica; este BK só transforma essa decisão em regra de escopo final.

6. Validação do passo.

A validação passa quando cada blocker recebido tem estado final, evidence, ação no freeze, owner e resposta `Pode congelar?`. Nenhum bug com `BLOQUEAR_FREEZE` pode avançar para decisão final positiva.

7. Cenário negativo/erro esperado.

Se existir um bug `BLOQUEADO` por falta de proof e a ação no freeze estiver `CONGELAR`, a validação falha. Corrige a ação para `BLOQUEAR_FREEZE` ou obtém decisão explícita do orientador.

### Passo 2 - Listar dentro do scope

1. Objetivo funcional do passo no contexto da app.

Definir a baseline positiva da entrega: funcionalidades, validações e artefactos que a equipa se compromete a entregar e defender.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - LOCALIZAÇÃO: secção `Dentro do scope final`

3. Instruções do que fazer.

Cria a secção `Dentro do scope final` e lista apenas itens com fonte verificável.

Usa esta tabela:

| Item | Tipo | Fonte | Proof | Owner | Estado para entrega | Observação de defesa |
| --- | --- | --- | --- | --- | --- | --- |
| Autenticação e sessão segura | `FUNCIONALIDADE` | `MATRIZ-RF-EVIDENCIA.md` ou BK que validou o fluxo |  |  | `DENTRO_DO_SCOPE` |  |
| Validações RNF finais | `VALIDACAO` | `MATRIZ-RNF-VALIDACAO.md` |  |  | `DENTRO_DO_SCOPE` |  |
| Demo final | `DEMO` | `ROTEIRO-DEMO-FINAL.md` |  |  | `DENTRO_DO_SCOPE` |  |
| Riscos aceites | `RESSALVA` | `RISCOS-RESIDUAIS.md` |  |  | `DENTRO_DO_SCOPE_COM_RESSALVA` |  |

Aplica estas regras:

- Só marca `DENTRO_DO_SCOPE` quando existir fonte e proof.
- Usa `DENTRO_DO_SCOPE_COM_RESSALVA` para item que entra na entrega com limitação conhecida e texto de defesa.
- Não incluas feature nova que não esteja no backlog, matriz, demo ou decisão do orientador.
- Não incluas item sem owner, porque o empacotamento final precisa de responsável para responder a dúvidas.
- Se um item for essencial mas ainda não tiver proof, marca `BLOQUEADO_SEM_PROOF` e não o uses para justificar freeze positivo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental: a baseline de scope fica registada em `SCOPE-FREEZE-FINAL.md`.

5. Explicação do código.

Não há código a explicar neste passo. A tabela `Dentro do scope final` evita promessas vagas. Cada linha liga uma parte da entrega a fonte, proof, owner e observação de defesa, para o `BK-MF8-09` empacotar apenas aquilo que está declarado.

6. Validação do passo.

A validação passa quando todos os itens dentro do scope têm tipo, fonte, proof, owner e estado. Um item sem proof deve ficar `BLOQUEADO_SEM_PROOF` ou sair do scope final.

7. Cenário negativo/erro esperado.

Se a equipa escrever "sistema completo" sem fonte, proof e owner, a validação falha. Substitui por itens concretos, como autenticação, catálogo, player, matrizes RF/RNF, demo e riscos aceites.

### Passo 3 - Listar fora do scope

1. Objetivo funcional do passo no contexto da app.

Definir o que não entra na entrega final, para impedir promessas tardias, confusão na defesa ou empacotamento de trabalho não validado.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - LOCALIZAÇÃO: secção `Fora do scope final`

3. Instruções do que fazer.

Cria a secção `Fora do scope final` e regista melhorias, sugestões, limitações e pedidos que não entram no pacote final.

Usa esta tabela:

| Item fora do scope | Origem | Motivo de exclusão | Risco de exclusão | Texto de defesa | Owner da decisão | Estado |
| --- | --- | --- | --- | --- | --- | --- |
|  | `FEEDBACK_ORIENTADOR`, `RISCO_RESIDUAL`, `SUGESTAO_EQUIPE`, `BACKLOG_FUTURO` ou `DUPLICADO` |  | `BAIXO`, `MEDIO` ou `ALTO` |  |  | `FORA_DO_SCOPE`, `ARQUIVADO`, `ADIADO_POS_PAP` ou `REVER_COM_ORIENTADOR` |

Aplica estas regras:

- Usa `FORA_DO_SCOPE` quando o item não faz parte do MVP final ou não tem proof suficiente.
- Usa `ARQUIVADO` quando o item é duplicado, estético sem impacto ou já resolvido noutro artefacto.
- Usa `ADIADO_POS_PAP` quando a ideia é válida, mas não cabe no buffer final.
- Usa `REVER_COM_ORIENTADOR` quando a exclusão pode afetar defesa, avaliação ou honestidade da entrega.
- O texto de defesa deve explicar a exclusão sem culpar falta de tempo de forma vaga.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental: o objetivo é impedir que itens fora do escopo entrem no pacote final sem decisão.

5. Explicação do código.

Não há código a explicar neste passo. A lista `Fora do scope final` protege a equipa de duas falhas comuns: prometer mais do que entrega e esconder limitações. Um item fora do scope pode ser defendido se a exclusão tiver origem, motivo, risco e owner.

6. Validação do passo.

A validação passa quando cada exclusão tem origem, motivo, risco, texto de defesa, owner e estado. Itens com impacto alto devem ter decisão do orientador ou voltar para análise de blocker.

7. Cenário negativo/erro esperado.

Se uma falha de segurança for colocada como `ADIADO_POS_PAP`, a validação falha. Uma falha desse tipo deve bloquear o freeze ou voltar para `BK-MF8-07`.

### Passo 4 - Definir regra de mudança

1. Objetivo funcional do passo no contexto da app.

Criar a política que controla qualquer alteração depois do freeze, separando correções críticas de novas features e alterações sem autorização.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - LOCALIZAÇÃO: secções `Regra de mudança pós-freeze` e `Pedido de mudança`

3. Instruções do que fazer.

Cria a secção `Regra de mudança pós-freeze` com esta decisão:

```md
A partir deste freeze, nenhuma alteração entra na entrega sem pedido registado, owner, motivo, risco, aprovação e validação. Mudanças permitidas: corrigir bug bloqueante aprovado, corrigir erro documental crítico ou aplicar decisão explícita do orientador. Mudanças recusadas: feature nova, melhoria estética sem blocker, alteração de RF/RNF sem decisão e refatoração ampla sem falha reproduzida.
```

Depois cria a tabela `Pedido de mudança` para qualquer pedido que apareça depois do freeze:

| Pedido | Origem | Tipo | Motivo | Risco se entrar | Risco se ficar fora | Owner | Aprovação | Decisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CHG-001 |  | `BUG_BLOQUEANTE`, `ERRO_DOCUMENTAL_CRITICO`, `DECISAO_ORIENTADOR`, `FEATURE_NOVA`, `MELHORIA_ESTETICA` ou `REFATORACAO` |  |  |  |  | `ORIENTADOR`, `OWNER_TECNICO`, `NAO_APROVADO` ou `POR_DECIDIR` | `ACEITAR`, `RECUSAR`, `VOLTA_BK_MF8_07` ou `ADIAR_POS_PAP` |

Aplica estas regras:

- Usa `ACEITAR` apenas para bug bloqueante aprovado, erro documental crítico ou decisão explícita do orientador.
- Usa `RECUSAR` para feature nova, melhoria estética ou refatoração sem falha reproduzida.
- Usa `VOLTA_BK_MF8_07` se a mudança for bug técnico que precisa de reprodução, causa raiz e regressão.
- Usa `ADIAR_POS_PAP` se o pedido for válido, mas não for necessário para defesa final.
- Toda mudança aceite precisa de validação e proof antes de seguir para `BK-MF8-09`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de governança: a regra controla decisões futuras, não altera ficheiros da app.

5. Explicação do código.

Não há código a explicar neste passo. A regra pós-freeze impede que a equipa reabra a entrega por preferência ou insegurança. Também preserva uma exceção responsável: se surgir blocker verdadeiro ou erro documental crítico, a mudança entra com prova e aprovação.

6. Validação do passo.

A validação passa quando a regra está escrita e qualquer pedido de mudança tem tipo, motivo, riscos, owner, aprovação e decisão. Nenhum pedido `FEATURE_NOVA` deve ficar `ACEITAR`.

7. Cenário negativo/erro esperado.

Se alguém pedir "adicionar nova página de recomendações" depois do freeze, regista como `FEATURE_NOVA` e decisão `RECUSAR` ou `ADIAR_POS_PAP`. Não alteres `frontend/` por causa desse pedido.

### Passo 5 - Bloquear novas features

1. Objetivo funcional do passo no contexto da app.

Aplicar a regra pós-freeze a pedidos novos, garantindo que a equipa só aceita mudanças indispensáveis e aprovadas.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - LOCALIZAÇÃO: secção `Triagem de pedidos novos`

3. Instruções do que fazer.

Cria a secção `Triagem de pedidos novos` e copia para lá todos os pedidos, sugestões ou ideias que surgirem depois da decisão de freeze.

Usa esta tabela:

| Pedido | Quem pediu | Relação com MVP | Existe blocker aprovado? | Altera demo? | Altera pacote? | Decisão | Justificação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CHG-001 |  | `DENTRO_DO_MVP`, `FORA_DO_MVP` ou `DUPLICADO` | `SIM` ou `NAO` | `SIM` ou `NAO` | `SIM` ou `NAO` | `BLOQUEAR`, `ACEITAR_COM_APROVACAO`, `ADIAR_POS_PAP` ou `ARQUIVAR` |  |

Aplica estas regras:

- Usa `BLOQUEAR` quando o pedido é feature nova sem blocker aprovado.
- Usa `ACEITAR_COM_APROVACAO` só quando o pedido fecha blocker, corrige erro crítico ou foi exigido pelo orientador.
- Usa `ADIAR_POS_PAP` quando a ideia é útil mas não é necessária para defesa.
- Usa `ARQUIVAR` quando o pedido é duplicado ou já está coberto por item dentro do scope.
- Se o pedido alterar demo ou pacote, atualiza o risco e exige nova prova antes do `BK-MF8-09`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de triagem e decisão: novas features não devem criar alterações técnicas depois do freeze.

5. Explicação do código.

Não há código a explicar neste passo. Bloquear features novas é uma medida de estabilidade. O aluno deve perceber que, no fim da PAP, qualidade significa defender bem o que foi entregue, não aumentar escopo sem validação.

6. Validação do passo.

A validação passa quando todos os pedidos novos têm decisão e justificação. Um pedido sem decisão não pode ficar invisível; deve bloquear o freeze ou ficar explicitamente adiado.

7. Cenário negativo/erro esperado.

Se um pedido fora do MVP estiver marcado como `ACEITAR_COM_APROVACAO` sem decisão do orientador, a validação falha. Muda para `BLOQUEAR` ou `ADIAR_POS_PAP`.

### Passo 6 - Fechar freeze final

1. Objetivo funcional do passo no contexto da app.

Emitir a decisão final sobre o freeze, consolidando blockers, itens dentro do scope, exclusões, riscos e regra de mudança.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Decisão final de freeze`

3. Instruções do que fazer.

Cria a secção `Decisão final de freeze` e preenche este resumo:

| Campo | Valor |
| --- | --- |
| Itens dentro do scope |  |
| Itens dentro do scope com ressalva |  |
| Itens fora do scope |  |
| Blockers corrigidos |  |
| Blockers aceites com ressalva |  |
| Blockers que impedem freeze |  |
| Pedidos novos bloqueados |  |
| Mudanças aceites pós-freeze |  |
| Decisão final | `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR` |

Aplica estas regras:

- Usa `PODE_CONGELAR` apenas se não houver blockers abertos, itens essenciais sem proof ou pedidos novos aceites sem validação.
- Usa `CONGELAR_COM_RESSALVAS` quando existirem riscos aceites, validação incompleta aceite pelo orientador ou limitações com texto de defesa.
- Usa `NAO_CONGELAR` quando houver blocker P0/P1 aberto, risco de segurança/privacidade sem decisão, build/teste obrigatório por provar ou item central sem owner.

Depois escreve três linhas obrigatórias:

```md
Decisão final de freeze: `...`
Motivo: ...
Condição para o `BK-MF8-09`: ...
```

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de decisão final: o artefacto diz se o empacotamento pode começar.

5. Explicação do código.

Não há código a explicar neste passo. A decisão final separa confiança real de confiança falsa. Se a decisão for `NAO_CONGELAR`, o próximo trabalho não é empacotar; é resolver o blocker ou obter decisão do orientador.

6. Validação do passo.

A validação passa quando a decisão final é compatível com os dados das secções anteriores. `PODE_CONGELAR` é inválido se existir blocker aberto, item essencial sem proof ou pedido novo aceite sem validação.

7. Cenário negativo/erro esperado.

Se `Blockers que impedem freeze` for maior que zero e a decisão final estiver `PODE_CONGELAR`, a validação falha. Altera a decisão para `NAO_CONGELAR` ou fecha o blocker com proof.

### Passo 7 - Preparar handoff do pacote

1. Objetivo funcional do passo no contexto da app.

Fechar a passagem de `BK-MF8-08` para `BK-MF8-09`, deixando claro o que o pacote final deve incluir, excluir e validar.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-09-empacotamento-final-de-entrega.md`
    - LOCALIZAÇÃO: secção `Handoff para BK-MF8-09`

3. Instruções do que fazer.

Cria a secção `Handoff para BK-MF8-09` e escreve o resumo que o pacote final deve consumir.

Usa esta tabela:

| Campo | Valor |
| --- | --- |
| Decisão final de freeze | `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR` |
| Artefacto principal para pacote | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` |
| Evidence obrigatória a incluir |  |
| Itens excluídos do pacote |  |
| Riscos a mencionar na defesa |  |
| Comandos que o pacote deve documentar | `backend`, `frontend`, `scripts` ou `docs` conforme evidence existente |
| Owner do pacote | `Kaue` |

Depois cria a tabela de decisões que o `BK-MF8-09` deve respeitar:

| Decisão | Fonte | Ação no `BK-MF8-09` | Bloqueia pacote? | Observação |
| --- | --- | --- | --- | --- |
|  | `DENTRO_DO_SCOPE`, `FORA_DO_SCOPE`, `RISCO_ACEITE`, `MUDANCA_BLOQUEADA` ou `FREEZE_FINAL` | `INCLUIR`, `EXCLUIR`, `MENCIONAR_NA_DEFESA`, `VALIDAR_COM_COMANDO` ou `BLOQUEAR_PACOTE` | `SIM` ou `NAO` |  |

Aplica estas regras:

- Se a decisão final for `NAO_CONGELAR`, a ação principal deve ser `BLOQUEAR_PACOTE`.
- Se a decisão final for `CONGELAR_COM_RESSALVAS`, o pacote deve incluir as ressalvas e o texto de defesa.
- Itens fora do scope não entram no manifesto como entregues.
- Mudanças bloqueadas devem aparecer apenas como exclusão ou nota de defesa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de handoff: o `BK-MF8-09` precisa de uma baseline clara, não de uma conversa oral.

5. Explicação do código.

Não há código a explicar neste passo. O handoff impede que o pacote final inclua ficheiros, features ou promessas que o freeze não aprovou. Também ajuda o avaliador a abrir a entrega sem adivinhar o que está dentro.

6. Validação do passo.

O handoff passa quando outra pessoa consegue abrir `SCOPE-FREEZE-FINAL.md` e decidir imediatamente se o pacote avança, avança com ressalvas ou fica bloqueado.

7. Cenário negativo/erro esperado.

Se o `BK-MF8-09` precisar de saber que comandos executar e o handoff não listar nenhum diretório ou evidence obrigatória, a validação falha. Completa o handoff antes de abrir o empacotamento.

#### Critérios de aceite

- O freeze confirma o estado dos blockers vindos do `BK-MF8-07`.
- O freeze lista itens dentro do scope com fonte, proof, owner e estado.
- O freeze lista itens fora do scope com motivo, risco, texto de defesa e owner.
- A regra de mudança pós-freeze está escrita e impede features novas sem aprovação.
- Pedidos novos ficam bloqueados, aceites com aprovação, adiados ou arquivados.
- A decisão final usa apenas `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR`.
- O `BK-MF8-09` recebe uma baseline clara para empacotar, excluir e validar.

#### Validação final

- Confirmar que `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` tem `Entrada do freeze`, `Estado dos blockers`, `Dentro do scope final`, `Fora do scope final`, `Regra de mudança pós-freeze`, `Triagem de pedidos novos`, `Decisão final de freeze` e `Handoff para BK-MF8-09`.
- Rever todas as linhas `DENTRO_DO_SCOPE` e confirmar fonte, proof e owner.
- Rever todas as linhas `FORA_DO_SCOPE` e confirmar motivo, risco e texto de defesa.
- Confirmar que nenhum blocker aberto permite `PODE_CONGELAR`.
- Confirmar que nenhuma feature nova ficou aceite sem aprovação explícita.
- Executar `bash scripts/validate-planificacao.sh` na raiz.
- Executar `git diff --check` na raiz.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`.
- `neg`: pedido de feature nova após freeze deve ficar bloqueado, adiado ou arquivado.
- `fonte`: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`, `docs/evidence/MF8/RISCOS-RESIDUAIS.md`, matrizes RF/RNF e roteiro de demo.
- `decisao`: `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR`.

#### Handoff

O `BK-MF8-09` deve empacotar apenas o que está dentro do freeze final.

- Entregar `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` preenchido.
- Indicar decisão final de freeze.
- Indicar itens dentro do scope, itens fora do scope, riscos aceites e mudanças bloqueadas.
- Registar se o pacote pode avançar, avançar com ressalvas ou ficar bloqueado.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: passos 2 a 6 reescritos com tabelas, estados permitidos, regra pós-freeze, triagem de pedidos novos e decisão final mensurável.
