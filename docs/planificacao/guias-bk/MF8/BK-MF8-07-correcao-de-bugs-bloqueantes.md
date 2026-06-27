# BK-MF8-07 - Correção de bugs bloqueantes

## Header

- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-06`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-correcao-de-bugs-bloqueantes.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais corrigir apenas bugs bloqueantes aprovados no registo de riscos. Cada correção deve ter causa raiz, ficheiro exato, alteração mínima, teste de regressão e prova antes/depois.

#### Importância

A reta final é perigosa: uma correção grande pode criar regressões. Este BK existe para corrigir blockers reais sem abrir features novas nem mexer em áreas estáveis por gosto.

#### Scope-in

- Selecionar bugs marcados como bloqueantes em `docs/evidence/MF8/RISCOS-RESIDUAIS.md`.
- Reproduzir a falha antes de alterar ficheiros.
- Isolar causa raiz, ficheiro afetado e contrato quebrado.
- Aplicar correção mínima em `backend/`, `frontend/`, `tests/` ou `docs/` conforme o bug aprovado.
- Executar validação focada e registar prova antes/depois.

#### Scope-out

- Corrigir melhorias estéticas sem blocker aprovado.
- Reescrever módulos inteiros.
- Alterar contratos públicos sem validar dependências.
- Mexer em código sem caso de reprodução.
- Criar funcionalidade nova durante o buffer final.

#### Estado antes e depois

- Estado antes: existe uma lista de riscos com eventuais bugs promovidos a bloqueantes.
- Estado antes: a dependência `BK-MF8-06` tem de estar concluída, validada ou registada com ressalva.
- Estado depois: cada bug bloqueante fica corrigido, validado ou bloqueado com motivo concreto.
- Estado depois: o handoff para `BK-MF8-08` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-06` está disponível ou tem ressalva registada.
- Confirmar que cada bug selecionado tem origem, severidade, owner e caso de reprodução.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.
- Não alterar RF, RNF, owner, prioridade, sprint ou dependência sem decisão documentada do orientador.

#### Glossário

- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação da equipa.
- Negativo: cenário em que a entrega deve bloquear, avisar ou falhar de forma controlada.
- Risco residual: limitação conhecida, avaliada e aceite para defesa.
- Bug bloqueante: falha que impede entrega honesta ou defesa segura.
- Causa raiz: motivo técnico ou documental que explica por que o bug acontece.
- Regressão: erro que volta a aparecer depois de uma correção.
- Scope freeze: ponto em que novas alterações passam a exigir aprovação explícita.
- Handoff: informação mínima para o próximo BK continuar sem adivinhar contexto.

#### Conceitos teóricos essenciais

- `CANONICO`: MF8 permite correção de bugs bloqueantes, não abertura de novas features.
- `DERIVADO`: cada bug recebe estado `CORRIGIDO`, `CORRIGIDO_SEM_VALIDACAO_TOTAL`, `BLOQUEADO` ou `BLOQUEADO_POR_SCOPE`.
- Bug bloqueante é diferente de melhoria: blocker impede defesa, segurança, privacidade, build, prova central ou demo honesta.
- Causa raiz explica porque o erro acontece, não apenas onde aparece.
- Teste de regressão confirma que o mesmo erro não volta no caminho crítico.
- Correção mínima reduz risco de quebrar funcionalidades já validadas.
- Evidence antes/depois permite defender a correção sem depender de explicação oral.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Entrada | `RISCOS-RESIDUAIS.md` | Lista blockers aprovados e respetivo caso de reprodução. |
| Diagnóstico | `CORRECAO-BUGS-BLOQUEANTES.md` | Regista sintoma, causa raiz, contrato quebrado e decisão. |
| Código | `backend/`, `frontend/`, `tests/` ou `docs/` | Recebe alteração mínima só no ficheiro afetado. |
| Validação | scripts existentes | Confirma regressão focada e ausência do bug original. |
| Saída | `CORRECAO-BUGS-BLOQUEANTES.md` | Regista antes/depois, teste, proof, negativo e estado final. |
| Freeze | `BK-MF8-08` | Consome blockers fechados, bloqueados ou aceites pelo orientador. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
- REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
- REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`
- EDITAR: ficheiro exato em `backend/`, `frontend/`, `tests/` ou `docs/` apenas se o bug aprovado exigir

#### Tutorial técnico linear

### Passo 1 - Selecionar bug aprovado

1. Objetivo funcional do passo no contexto da app.

Escolher apenas bugs que já foram promovidos a bloqueantes no `BK-MF8-06`, para impedir correções tardias sem autorização.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secções `Entrada de blockers aprovados` e `Seleção para correção`

3. Instruções do que fazer.

Cria a secção `Entrada de blockers aprovados` em `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`. Copia apenas itens de `RISCOS-RESIDUAIS.md` cujo estado seja `BUG_BLOQUEANTE`, `PROMOVER_A_BUG`, `PROMOVER_A_BUG_BLOQUEANTE` ou `BUGS_BLOQUEANTES_ABERTOS`.

Usa esta tabela:

| Bug ID | Origem no risco | Severidade | Área afetada | Owner | Sintoma observável | Critério que torna blocker | Estado de entrada |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | `RSK-001` | `P0` ou `P1` | `SEGURANCA`, `PRIVACIDADE`, `BUILD`, `TESTE_OBRIGATORIO`, `DEMO_CENTRAL`, `PROVA_CENTRAL` ou `DOCUMENTACAO_CRITICA` |  |  |  | `APROVADO_PARA_CORRECAO` |

Aplica estas regras:

- Não seleciones itens sem origem no registo de riscos.
- Não seleciones sugestões estéticas, melhorias opcionais ou funcionalidades novas.
- Não seleciones risco residual aceite com fallback honesto.
- Se o bug não tiver owner, mantém `Estado de entrada` como `BLOQUEADO_SEM_OWNER`.
- Se o bug não tiver sintoma observável, mantém `Estado de entrada` como `BLOQUEADO_SEM_REPRODUCAO`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de triagem: ainda não há alteração técnica segura enquanto o bug aprovado, o owner e o critério de blocker não estiverem explícitos.

5. Explicação do código.

Não há código a explicar neste passo. A seleção protege a estabilidade da entrega final. Se a equipa corrigir itens sem blocker aprovado, pode criar regressões, atrasar o pacote final e quebrar o scope freeze que será fechado no `BK-MF8-08`.

6. Validação do passo.

A validação passa quando todos os bugs listados têm origem em `RISCOS-RESIDUAIS.md`, severidade, owner, sintoma observável e critério de blocker. Nenhum item sem origem documentada pode avançar para reprodução.

7. Cenário negativo/erro esperado.

Se alguém tentar corrigir "melhorar o aspeto do botão" sem estar promovido a blocker, rejeita a entrada. Regista o item como `RECUSADO_FORA_DO_ESCOPO` e não alteres `frontend/`.

### Passo 2 - Reproduzir a falha

1. Objetivo funcional do passo no contexto da app.

Provar que o bug existe antes da correção e guardar um resultado que possa ser comparado com o depois.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - LOCALIZAÇÃO: secção `Reprodução antes da correção`

3. Instruções do que fazer.

Para cada bug com `Estado de entrada` igual a `APROVADO_PARA_CORRECAO`, cria uma entrada na secção `Reprodução antes da correção`.

Usa esta tabela:

| Bug ID | Pré-condição | Passos de reprodução | Comando ou ação | Resultado esperado | Resultado observado antes | Proof antes | Negativo obrigatório | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 |  | 1. 2. 3. | `npm test`, `npm run build`, teste manual documentado ou passo de demo |  |  |  |  | `REPRODUZIDO` |

Aplica estas regras:

- Usa comando real do `backend/package.json` ou `frontend/package.json` se o bug tiver validação automatizável.
- Usa passo manual apenas para falha de demo, prova visual, defesa oral ou documento que não tenha script.
- Escreve o resultado esperado antes de escrever o observado.
- O proof antes deve ser log, captura, excerto de teste, ficheiro de evidence ou linha da matriz.
- O negativo obrigatório deve explicar o que não pode acontecer após a correção.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de prova antes da correção: alterar código sem reproduzir a falha tornaria impossível demonstrar que a alteração resolveu o problema certo.

5. Explicação do código.

Não há código a explicar neste passo. A reprodução é a primeira defesa contra correções por palpite. Se o bug não for reproduzido, a equipa pode mexer num ficheiro errado, criar regressões e continuar sem prova de que o blocker existia.

6. Validação do passo.

A validação passa quando cada bug aprovado tem pré-condição, passos, comando ou ação, resultado esperado, resultado observado antes, proof antes, negativo obrigatório e estado. Usa `REPRODUZIDO` apenas se a falha apareceu de forma objetiva.

7. Cenário negativo/erro esperado.

Se o bug não for reproduzido, não avances para alteração técnica. Marca o estado como `NAO_REPRODUZIDO`, acrescenta o motivo e pede nova evidence ao owner do risco.

### Passo 3 - Isolar causa raiz

1. Objetivo funcional do passo no contexto da app.

Descobrir a causa real do bug antes de alterar ficheiros, separando sintoma, contrato quebrado e ponto exato de correção.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: ficheiro afetado em `backend/`, `frontend/`, `tests/` ou `docs/`
    - REVER: BK anterior que criou o contrato afetado
    - LOCALIZAÇÃO: secção `Causa raiz`

3. Instruções do que fazer.

Cria a secção `Causa raiz` e analisa apenas bugs com estado `REPRODUZIDO`.

Usa esta tabela:

| Bug ID | Ficheiro ou artefacto afetado | Unidade afetada | Contrato quebrado | Causa raiz | Tipo de falha | Correção mínima proposta | Risco de regressão |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | `backend/...`, `frontend/...`, `tests/...` ou `docs/...` | rota, service, componente, teste, matriz ou secção |  |  | `VALIDACAO`, `AUTORIZACAO`, `PRIVACIDADE`, `BUILD`, `TESTE`, `DEMO`, `EVIDENCE` ou `DOCUMENTACAO` |  |  |

Aplica estas regras:

- O ficheiro afetado deve existir ou ser o artefacto que este BK vai criar.
- A unidade afetada deve ser específica: função, rota, componente, teste, secção documental ou matriz.
- O contrato quebrado deve apontar para RF/RNF, BK anterior, matriz, critério de aceite ou handoff.
- A causa raiz deve explicar o motivo, não repetir o sintoma.
- A correção mínima proposta deve alterar a menor unidade que fecha o bug.
- O risco de regressão deve dizer que fluxo pode quebrar com a alteração.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é análise técnica e documental: o código só deve ser alterado no passo 4, depois de existir causa raiz e unidade mínima de correção.

5. Explicação do código.

Não há código a explicar neste passo. A causa raiz impede correções superficiais. Por exemplo, se a demo falha porque uma rota devolve `403`, a causa pode estar numa role, num guard, num seed, numa sessão ou num passo de evidence; cada causa exige correção diferente.

6. Validação do passo.

A validação passa quando cada bug reproduzido tem ficheiro ou artefacto afetado, unidade afetada, contrato quebrado, causa raiz, tipo de falha, correção mínima proposta e risco de regressão.

7. Cenário negativo/erro esperado.

Se a equipa só escrever "o botão não funciona" como causa raiz, a validação falha. Isso é sintoma. A causa raiz deve explicar por que o botão não funciona e que contrato ficou quebrado.

### Passo 4 - Aplicar correção mínima

1. Objetivo funcional do passo no contexto da app.

Alterar apenas a unidade necessária para fechar o blocker reproduzido e diagnosticado.

2. Ficheiros envolvidos:
    - EDITAR: ficheiro afetado em `backend/`, `frontend/`, `tests/` ou `docs/`
    - EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: BK anterior que criou o contrato afetado
    - LOCALIZAÇÃO: função, teste, rota, service, componente, matriz ou secção documental afetada pelo bug

3. Instruções do que fazer.

Aplica a menor alteração que remove a causa raiz do bug aprovado. Depois regista a alteração na secção `Correção aplicada`.

Usa esta tabela:

| Bug ID | Ficheiro editado | Unidade substituída ou ajustada | Tipo de alteração | Justificação da alteração mínima | Contrato preservado | Precisa de teste novo? |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-001 |  |  | `CODIGO`, `TESTE`, `DOCUMENTACAO` ou `EVIDENCE` |  |  | `SIM` ou `NAO` |

Se o bug tocar código, aplica estas regras:

- Substitui a função, rota, service, componente ou teste completo afetado.
- Mantém imports reais e caminhos existentes.
- Usa JSDoc nos elementos principais adicionados ou alterados.
- Acrescenta comentários didáticos junto de validação, autorização, sessão, dados pessoais, query, chamada assíncrona, estado React ou teste.
- Não cries helpers sem mostrar onde ficam.
- Não alteres módulos não envolvidos na causa raiz.

Se o bug tocar só documentação ou evidence, aplica estas regras:

- Edita a secção exata que contém a falha.
- Preserva histórico e decisão anterior.
- Acrescenta proof, negativo, owner e critério de fecho.
- Não apagues falhas históricas; atualiza estado e decisão.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este guia não inventa um bug concreto. Se o blocker aprovado tocar código, a equipa deve registar em `CORRECAO-BUGS-BLOQUEANTES.md` a unidade mínima completa que foi alterada e a respetiva explicação.

5. Explicação do código.

A correção de código só entra porque há um bug bloqueante aprovado, reproduzido e diagnosticado. A explicação deve indicar causa raiz, contrato preservado, risco evitado, teste executado e razão para a alteração ser mínima. Isto impede que o buffer final vire refatoração ampla.

6. Validação do passo.

A validação passa quando cada alteração tem ficheiro editado, unidade afetada, justificação de alteração mínima, contrato preservado e indicação de teste. Se a alteração tocar código sem teste ou sem motivo, mantém o bug como `CORRIGIDO_SEM_VALIDACAO_TOTAL` até existir prova.

7. Cenário negativo/erro esperado.

Se a equipa alterar três componentes para corrigir um texto de erro que vive num único componente, a correção é demasiado ampla. Reverte a parte não necessária e mantém apenas a alteração ligada à causa raiz.

### Passo 5 - Validar regressão

1. Objetivo funcional do passo no contexto da app.

Executar a prova que confirma que o bug desapareceu e que o fluxo crítico continua seguro.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - REVER: ficheiro alterado no passo 4
    - LOCALIZAÇÃO: secção `Validação de regressão`

3. Instruções do que fazer.

Cria a secção `Validação de regressão` e regista uma linha por bug corrigido ou bloqueado.

Usa esta tabela:

| Bug ID | Comando ou validação | Resultado esperado depois | Resultado obtido depois | Negativo executado | Proof depois | Estado de validação |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-001 |  |  |  |  |  | `PASS`, `FAIL`, `BLOQUEADO_AMBIENTE` ou `NAO_EXECUTADO_COM_MOTIVO` |

Escolhe a validação assim:

- Se o bug tocar backend, executa o teste focado disponível e, se fizer sentido, `npm test` em `backend`.
- Se o bug tocar frontend, executa o teste focado disponível e `npm run build` em `frontend`.
- Se o bug tocar documentação, executa pesquisa textual, validação de planificação e revisão do proof.
- Se o bug tocar demo, executa o passo de demo que falhava e regista captura, log ou observação verificável.
- Se o bug tocar segurança ou privacidade, inclui negativo que prove que a falha não ficou aberta.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é validação: o resultado fica no artefacto de correção e deve ser repetível por outro elemento da equipa.

5. Explicação do código.

Não há código a explicar neste passo. A regressão prova que a correção não é apenas uma alteração visual ou textual. Para bugs P0/P1, a validação precisa de mostrar que o erro original falha antes, passa depois e continua protegido no cenário negativo.

6. Validação do passo.

A validação passa quando cada bug tem comando ou validação, resultado esperado depois, resultado obtido depois, negativo executado, proof depois e estado. Usa `PASS` apenas quando a prova foi realmente executada.

7. Cenário negativo/erro esperado.

Se o comando falhar por ambiente, não marques o bug como validado. Usa `BLOQUEADO_AMBIENTE`, copia o erro essencial e indica que prova falta para fechar.

### Passo 6 - Registar antes/depois

1. Objetivo funcional do passo no contexto da app.

Consolidar a prova final de cada correção, separando estado técnico, evidence e decisão de defesa.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: ficheiro alterado no passo 4
    - LOCALIZAÇÃO: secção `Antes e depois`

3. Instruções do que fazer.

Cria a secção `Antes e depois` e resume cada bug numa linha.

Usa esta tabela:

| Bug ID | Antes | Correção aplicada | Depois | Proof antes | Proof depois | Estado final | Decisão para defesa |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 |  |  |  |  |  | `CORRIGIDO`, `CORRIGIDO_SEM_VALIDACAO_TOTAL`, `BLOQUEADO`, `BLOQUEADO_POR_SCOPE` ou `NAO_REPRODUZIDO` |  |

Aplica estas regras:

- Usa `CORRIGIDO` só com proof antes, proof depois e validação de regressão em `PASS`.
- Usa `CORRIGIDO_SEM_VALIDACAO_TOTAL` quando a correção foi aplicada, mas falta uma prova relevante.
- Usa `BLOQUEADO` quando falta ambiente, credencial, decisão do orientador ou artefacto de entrada.
- Usa `BLOQUEADO_POR_SCOPE` quando a correção exigiria feature nova, alteração de RF/RNF ou mudança fora de MF8.
- Usa `NAO_REPRODUZIDO` quando a falha não apareceu seguindo os passos definidos.
- A decisão para defesa deve explicar em linguagem curta o que a equipa pode dizer honestamente.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de consolidação: a linha antes/depois é a prova que o orientador pode rever sem reler toda a investigação.

5. Explicação do código.

Não há código a explicar neste passo. O antes/depois evita confundir "alterei um ficheiro" com "fechei um blocker". Um bug só fica fechado se a equipa consegue mostrar o estado inicial, a alteração mínima, o estado final e a prova repetível.

6. Validação do passo.

A validação passa quando nenhum bug tem estado final incompatível com a prova. Um bug sem proof depois não pode ficar `CORRIGIDO`.

7. Cenário negativo/erro esperado.

Se o bug estiver marcado como `CORRIGIDO`, mas `Proof depois` estiver vazio, a validação falha. Altera o estado para `CORRIGIDO_SEM_VALIDACAO_TOTAL` ou executa a prova em falta.

### Passo 7 - Preparar handoff do freeze

1. Objetivo funcional do passo no contexto da app.

Fechar a passagem de `BK-MF8-07` para `BK-MF8-08`, deixando claro se o scope freeze pode avançar.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`
    - REVER: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-08-scope-freeze-final.md`
    - LOCALIZAÇÃO: secção `Handoff para BK-MF8-08`

3. Instruções do que fazer.

Cria a secção `Handoff para BK-MF8-08` e resume o estado de freeze.

Usa esta tabela:

| Campo | Valor |
| --- | --- |
| Total de blockers recebidos |  |
| Blockers corrigidos |  |
| Blockers corrigidos sem validação total |  |
| Blockers bloqueados |  |
| Blockers fora do scope |  |
| Decisão para freeze | `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR` |

Depois cria a tabela de itens que o próximo BK deve consumir:

| Bug ID | Estado final | Evidence para freeze | Ação esperada no `BK-MF8-08` | Owner | Observação |
| --- | --- | --- | --- | --- | --- |
| BUG-001 |  |  | `CONGELAR`, `CONGELAR_COM_RESSALVA`, `BLOQUEAR_FREEZE` ou `PEDIR_DECISAO_ORIENTADOR` |  |  |

Aplica estas regras:

- Usa `PODE_CONGELAR` apenas se todos os blockers estiverem `CORRIGIDO` ou `NAO_REPRODUZIDO` com justificação.
- Usa `CONGELAR_COM_RESSALVAS` se houver `CORRIGIDO_SEM_VALIDACAO_TOTAL` aceite pelo orientador.
- Usa `NAO_CONGELAR` se houver `BLOQUEADO` sem decisão ou blocker de segurança/privacidade aberto.
- O handoff deve indicar exatamente que prova o `BK-MF8-08` deve rever.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de handoff: o próximo BK precisa de uma decisão clara para congelar, congelar com ressalvas ou impedir o freeze.

5. Explicação do código.

Não há código a explicar neste passo. O handoff impede que o `BK-MF8-08` congele escopo com blockers escondidos. Também impede o inverso: se os blockers foram corrigidos e provados, a equipa não deve continuar a mexer no produto por insegurança ou preferência.

6. Validação do passo.

O handoff passa quando outra pessoa consegue abrir `CORRECAO-BUGS-BLOQUEANTES.md` e decidir imediatamente se o freeze avança, avança com ressalva ou fica bloqueado.

7. Cenário negativo/erro esperado.

Se existir um bug `BLOQUEADO` por falta de prova e a decisão para freeze estiver `PODE_CONGELAR`, a validação falha. Corrige a decisão para `NAO_CONGELAR` ou obtém decisão explícita do orientador.

#### Critérios de aceite

- Nenhum bug é corrigido sem origem em `RISCOS-RESIDUAIS.md`.
- Nenhum bug é corrigido sem caso de reprodução ou justificação `NAO_REPRODUZIDO`.
- Cada correção tem ficheiro exato, causa raiz e validação.
- Mudanças de código ficam mínimas e ligadas ao blocker.
- Falhas de validação ficam registadas sem esconder estado.
- Bugs de segurança, privacidade, build, teste obrigatório ou demo central não ficam escondidos como risco residual.
- O freeze só avança sem blockers abertos ou com decisão explícita do orientador.

#### Validação final

- Confirmar que `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md` tem entrada, reprodução, causa raiz, correção, regressão, antes/depois e handoff.
- Rever todas as linhas com estado `CORRIGIDO` e confirmar proof antes/depois.
- Executar teste ou comando focado após cada correção.
- Executar `npm test` em `backend` se o bug tocar backend.
- Executar `npm run build` em `frontend` se o bug tocar frontend.
- Executar `bash scripts/validate-planificacao.sh` na raiz.
- Executar `git diff --check` na raiz.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md`.
- `neg`: tentativa de corrigir item não bloqueante deve ser rejeitada.
- `fonte`: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`.
- `antes`: proof de reprodução antes da correção.
- `depois`: proof de validação depois da correção.

#### Handoff

O BK-MF8-08 só deve congelar escopo depois de blockers ficarem corrigidos, bloqueados por contexto externo ou aceites pelo orientador.

- Entregar `docs/evidence/MF8/CORRECAO-BUGS-BLOQUEANTES.md` preenchido.
- Registar blockers com owner, impacto e critério de fecho.
- Indicar decisão de freeze: `PODE_CONGELAR`, `CONGELAR_COM_RESSALVAS` ou `NAO_CONGELAR`.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: passos 1 a 7 corrigidos com seleção de blocker, reprodução, causa raiz, correção mínima, regressão, antes/depois e handoff para freeze.
