# BK-MF8-06 - Lista de riscos residuais

## Header

- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-05`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-lista-de-riscos-residuais.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais criar a lista final de riscos residuais da entrega. Cada risco deve ter causa, impacto, probabilidade, mitigação, owner, decisão e relação com bugs bloqueantes.

#### Importância

Um risco residual não é uma desculpa; é uma limitação conhecida, avaliada e aceite. Esta lista impede que a equipa esconda problemas ou trate blockers como simples ressalvas.

#### Scope-in

- Recolher riscos das matrizes, ensaio e feedback.
- Classificar severidade, probabilidade e impacto.
- Definir mitigação e owner.
- Separar risco residual de bug bloqueante.

#### Scope-out

- Aceitar falha crítica como risco residual.
- Criar riscos genéricos sem evidência.
- Resolver bugs dentro deste BK.
- Apagar histórico de decisões anteriores.

#### Estado antes e depois

- Estado antes: o feedback final já separou pontos obrigatórios e ressalvas.
- Estado antes: a dependência `BK-MF8-05` tem de estar concluída, validada ou registada com ressalva.
- Estado depois: existe registo de riscos aceites e lista de candidatos a bug bloqueante.
- Estado depois: o handoff para `BK-MF8-07` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-05` está disponível ou tem ressalva registada.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.
- Não alterar RF, RNF, owner, prioridade, sprint ou dependência sem decisão documentada do orientador.

#### Glossário

- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação da equipa.
- Negativo: cenário em que a entrega deve bloquear, avisar ou falhar de forma controlada.
- Risco residual: limitação conhecida, avaliada e aceite para defesa.
- Bug bloqueante: falha que impede entrega honesta ou defesa segura.
- Scope freeze: ponto em que novas alterações passam a exigir aprovação explícita.
- Handoff: informação mínima para o próximo BK continuar sem adivinhar contexto.

#### Conceitos teóricos essenciais

- `CANONICO`: a MF8 inclui riscos residuais e buffer final.
- `DERIVADO`: risco residual precisa de decisão `ACEITE`, `MITIGAR_ANTES_DA_ENTREGA` ou `PROMOVER_A_BUG_BLOQUEANTE`.
- Bug bloqueante impede entrega; risco residual é conhecido e aceite.
- Mitigação é ação concreta, não frase vaga.
- Owner garante acompanhamento durante freeze e entrega.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Feedback | `FEEDBACK-ORIENTADOR-FINAL.md` | Fornece riscos e sugestões. |
| Matrizes | `MATRIZ-RF-EVIDENCIA.md`, `MATRIZ-RNF-VALIDACAO.md` | Mostram lacunas técnicas. |
| Riscos | `RISCOS-RESIDUAIS.md` | Classifica decisão e mitigação. |
| Bugs | `BK-MF8-07` | Recebe apenas blockers aprovados. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
- REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
- REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`

#### Tutorial técnico linear

### Passo 1 - Agregar fontes de risco

1. Objetivo funcional do passo no contexto da app.

Reunir todas as fontes que podem originar riscos residuais antes de escrever decisões no artefacto final.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md`
    - LOCALIZAÇÃO: secções `Fontes consultadas` e `Entrada para riscos`

3. Instruções do que fazer.

Cria ou atualiza `docs/evidence/MF8/RISCOS-RESIDUAIS.md` com a secção `Fontes consultadas`. Regista uma linha por fonte, mesmo que a fonte não tenha riscos. Usa esta tabela:

| Fonte | Tipo de entrada | Estado da fonte | Riscos encontrados | Observação |
| --- | --- | --- | ---: | --- |
| `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md` | feedback | `VALIDA`, `COM_RESSALVAS` ou `BLOQUEADA` |  |  |
| `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` | cobertura RF | `VALIDA`, `COM_RESSALVAS` ou `BLOQUEADA` |  |  |
| `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` | validação RNF | `VALIDA`, `COM_RESSALVAS` ou `BLOQUEADA` |  |  |
| `docs/evidence/MF8/ENSAIO-TECNICO-DEFESA.md` | ensaio | `VALIDA`, `COM_RESSALVAS` ou `BLOQUEADA` |  |  |

Depois cria a secção `Entrada para riscos` e copia apenas itens que tenham impacto real na defesa, entrega, validação, segurança, privacidade, dados, build, demo ou scorecard. Não copies sugestões estéticas já arquivadas no `BK-MF8-05`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e operacional: o resultado é a lista verificável das fontes que alimentam `docs/evidence/MF8/RISCOS-RESIDUAIS.md`.

5. Explicação do código.

Não há código a explicar neste passo. A rastreabilidade começa nas fontes: se um risco não aponta para um ficheiro, comando, captura, matriz ou decisão, a equipa não consegue defendê-lo. Esta triagem evita transformar memória oral em decisão final.

6. Validação do passo.

A validação passa quando todas as fontes obrigatórias têm estado, contagem de riscos encontrados e observação curta. Uma fonte bloqueada deve indicar o motivo e o owner que a vai esclarecer.

7. Cenário negativo/erro esperado.

Se o feedback final ainda não existir ou estiver sem decisão, não inventes riscos. Marca a fonte como `BLOQUEADA` e escreve que `BK-MF8-05` ainda não entregou entrada suficiente.

### Passo 2 - Classificar severidade

1. Objetivo funcional do passo no contexto da app.

Transformar cada risco encontrado numa linha mensurável com causa, impacto, probabilidade, severidade e decisão inicial.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Matriz de riscos residuais`

3. Instruções do que fazer.

Cria a secção `Matriz de riscos residuais` e regista uma linha por risco. Usa esta tabela:

| ID | Fonte | Descrição do risco | Causa provável | Impacto na defesa/entrega | Probabilidade | Severidade | Proof | Negativo associado | Decisão inicial |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RSK-001 |  |  |  |  | `BAIXA`, `MEDIA` ou `ALTA` | `P0`, `P1`, `P2` ou `P3` |  |  | `ACEITAR`, `MITIGAR` ou `PROMOVER_A_BUG` |

Usa estas regras:

- `P0`: impede defesa honesta, expõe dados pessoais, quebra autenticação/autorização, falha build ou invalida requisito central.
- `P1`: afeta demo, prova principal, scorecard ou fluxo importante, mas tem fallback honesto e controlado.
- `P2`: limita qualidade, clareza, UX ou documentação sem comprometer a defesa principal.
- `P3`: melhoria menor, sem impacto direto na entrega final.
- `PROMOVER_A_BUG` é obrigatório se o risco for `P0` ou se não existir fallback honesto.
- `MITIGAR` é adequado quando existe ação concreta antes da entrega.
- `ACEITAR` só é válido quando existe proof, impacto conhecido e texto de defesa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e analítica: a tabela é o contrato que separa risco residual de bug bloqueante.

5. Explicação do código.

Não há código a explicar neste passo. A classificação impede que todos os problemas pareçam iguais. Um risco `P0` não pode ser tratado como ressalva; já um risco `P2` com fallback pode ser aceite se estiver bem explicado e ligado a prova.

6. Validação do passo.

A validação passa quando cada linha tem `ID`, `Fonte`, causa, impacto, probabilidade, severidade, proof, negativo associado e decisão inicial. Nenhum risco pode ficar sem fonte ou sem critério de severidade.

7. Cenário negativo/erro esperado.

Se um risco for classificado como `ACEITAR` sem proof ou sem negativo associado, a decisão falha. Altera a decisão para `MITIGAR` ou `PROMOVER_A_BUG` até existir prova verificável.

### Passo 3 - Definir mitigação e owner

1. Objetivo funcional do passo no contexto da app.

Dar a cada risco uma mitigação concreta, uma pessoa responsável e um critério objetivo de fecho.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - LOCALIZAÇÃO: secção `Plano de mitigação`

3. Instruções do que fazer.

Cria a secção `Plano de mitigação` e copia todos os riscos com decisão inicial `ACEITAR` ou `MITIGAR`. Usa esta tabela:

| ID | Owner | Apoio | Mitigação concreta | Critério de fecho | Evidence esperada | Prazo | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RSK-001 |  |  |  |  |  | antes de `BK-MF8-08` | `POR_TRATAR` |

Aplica estas regras:

- O owner deve ser uma pessoa, não "equipa".
- A mitigação deve começar por um verbo concreto: rever, validar, anexar, justificar, reduzir, remover, documentar ou promover.
- O critério de fecho deve dizer que prova fecha o risco: ficheiro preenchido, comando executado, captura anexada, scorecard revisto ou decisão assinável.
- Riscos aceites sem ação técnica ainda precisam de texto de defesa e owner.
- Riscos com `PROMOVER_A_BUG` não entram nesta tabela; vão para o passo 4.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de gestão de risco: o resultado é uma lista de ações que a equipa consegue executar ou defender.

5. Explicação do código.

Não há código a explicar neste passo. Mitigação não é uma intenção vaga; é uma ação verificável. O owner e o critério de fecho impedem que uma limitação conhecida avance para a entrega final sem acompanhamento.

6. Validação do passo.

A validação passa quando todos os riscos aceites ou mitigáveis têm owner individual, ação concreta, evidence esperada e prazo ligado à MF8.

7. Cenário negativo/erro esperado.

Se um risco `P1` não tiver owner ou critério de fecho, não o marques como aceite. Mantém o estado `BLOQUEADO_SEM_OWNER` até existir responsável.

### Passo 4 - Promover blockers reais

1. Objetivo funcional do passo no contexto da app.

Separar riscos aceitáveis de falhas que devem seguir para `BK-MF8-07` como bugs bloqueantes.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-correcao-de-bugs-bloqueantes.md`
    - LOCALIZAÇÃO: secção `Candidatos a bug bloqueante`

3. Instruções do que fazer.

Cria a secção `Candidatos a bug bloqueante` e regista todos os riscos com decisão inicial `PROMOVER_A_BUG` ou severidade `P0`. Usa esta tabela:

| ID do risco | Sintoma observável | Critério que torna blocker | Ficheiro/fluxo afetado | Caso de reprodução | Destino |
| --- | --- | --- | --- | --- | --- |
| RSK-001 |  | `SEGURANCA`, `PRIVACIDADE`, `BUILD`, `TESTE_OBRIGATORIO`, `DEMO_CENTRAL` ou `PROVA_CENTRAL` |  |  | `BK-MF8-07` |

Promove para `BK-MF8-07` quando se verificar pelo menos uma destas condições:

- falha de autenticação, autorização, roles ou permissões;
- exposição de dados pessoais, credenciais ou informação sensível;
- build, teste obrigatório ou comando de validação final falha sem explicação aceitável;
- demo central não funciona e não existe fallback honesto;
- requisito P0/P1 fica sem proof;
- o orientador exige correção antes da defesa.

Não promovas para bug uma melhoria estética, uma sugestão fora do escopo ou uma limitação já aceite com fallback e texto de defesa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de triagem: o código só entra no `BK-MF8-07`, depois de existir bug bloqueante aprovado.

5. Explicação do código.

Não há código a explicar neste passo. Esta separação protege a entrega final: um bug bloqueante não pode ficar escondido como risco residual, mas uma sugestão pequena também não deve abrir trabalho técnico de última hora.

6. Validação do passo.

A validação passa quando todos os riscos `P0` têm destino `BK-MF8-07` ou justificação assinável do orientador. Todos os candidatos a bug devem ter sintoma observável e caso de reprodução.

7. Cenário negativo/erro esperado.

Se uma falha de segurança for mantida como risco residual, a validação falha. Promove a falha para `BK-MF8-07` e impede o freeze até existir correção, bloqueio justificado ou decisão explícita do orientador.

### Passo 5 - Validar risco residual

1. Objetivo funcional do passo no contexto da app.

Confirmar que cada risco aceite pode ser explicado de forma honesta na defesa e não esconde um blocker.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Validação de aceitação`

3. Instruções do que fazer.

Cria a secção `Validação de aceitação` e revê todos os riscos que ficaram como `ACEITAR` ou `MITIGAR`. Usa esta tabela:

| ID | Tem proof? | Tem fallback honesto? | Afeta segurança/privacidade? | Afeta demo central? | Texto de defesa | Resultado |
| --- | --- | --- | --- | --- | --- | --- |
| RSK-001 | `SIM` ou `NAO` | `SIM` ou `NAO` | `SIM` ou `NAO` | `SIM` ou `NAO` |  | `ACEITE`, `MITIGAR_ANTES_DA_ENTREGA` ou `PROMOVER_A_BUG_BLOQUEANTE` |

Aplica estas regras:

- Usa `ACEITE` apenas se houver proof, fallback honesto e texto de defesa.
- Usa `MITIGAR_ANTES_DA_ENTREGA` se o risco for controlável, mas ainda exigir ação antes do pacote final.
- Usa `PROMOVER_A_BUG_BLOQUEANTE` se o risco afetar segurança, privacidade, demo central, build, teste obrigatório ou requisito P0/P1 sem prova.
- O texto de defesa deve ser curto e honesto: explica a limitação, impacto real, mitigação e razão para não bloquear a entrega.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de decisão: o artefacto deve permitir defender cada risco sem depender de explicação oral.

5. Explicação do código.

Não há código a explicar neste passo. Validar aceitação é diferente de ignorar problemas. A equipa assume a limitação, mostra prova, explica impacto e deixa claro por que a defesa continua honesta.

6. Validação do passo.

A validação passa quando nenhum risco fica `ACEITE` com `Tem proof?` igual a `NAO`, `Afeta segurança/privacidade?` igual a `SIM` ou `Afeta demo central?` igual a `SIM` sem fallback.

7. Cenário negativo/erro esperado.

Se um risco sem proof estiver marcado como `ACEITE`, altera o resultado para `MITIGAR_ANTES_DA_ENTREGA` ou `PROMOVER_A_BUG_BLOQUEANTE`. Um risco sem prova não é aceitável para defesa final.

### Passo 6 - Fechar registo de riscos

1. Objetivo funcional do passo no contexto da app.

Produzir uma decisão final sobre o registo de riscos e preparar a passagem para bugs, freeze e pacote final.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Decisão final dos riscos`

3. Instruções do que fazer.

Cria a secção `Decisão final dos riscos` com este resumo:

| Campo | Valor |
| --- | --- |
| Total de riscos analisados |  |
| Riscos aceites |  |
| Riscos a mitigar antes da entrega |  |
| Bugs promovidos para `BK-MF8-07` |  |
| Riscos bloqueados por falta de prova |  |
| Decisão final | `RISCOS_ACEITES`, `MITIGAR_ANTES_DO_FREEZE` ou `BUGS_BLOQUEANTES_ABERTOS` |

Aplica estas regras:

- Usa `RISCOS_ACEITES` apenas se não houver bugs bloqueantes nem riscos sem proof.
- Usa `MITIGAR_ANTES_DO_FREEZE` quando existirem ações com owner e prazo antes de `BK-MF8-08`.
- Usa `BUGS_BLOQUEANTES_ABERTOS` quando houver pelo menos um item promovido para `BK-MF8-07`.

No fim da secção, escreve três linhas:

```md
Decisão final dos riscos: `...`
Motivo: ...
Próximo passo obrigatório: ...
```

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de fecho: a decisão final orienta `BK-MF8-07`, `BK-MF8-08` e o pacote de entrega.

5. Explicação do código.

Não há código a explicar neste passo. A decisão final evita ambiguidade: se há bug bloqueante, a equipa corrige no `BK-MF8-07`; se há mitigação, fecha antes do freeze; se todos os riscos estão aceites, a entrega pode avançar com ressalvas explícitas.

6. Validação do passo.

A validação passa quando os totais do resumo batem certo com a matriz de riscos e com a validação de aceitação. A decisão final não pode contradizer as linhas anteriores.

7. Cenário negativo/erro esperado.

Se o resumo disser `RISCOS_ACEITES` mas existir uma linha com resultado `PROMOVER_A_BUG_BLOQUEANTE`, a validação falha. Corrige a decisão final para `BUGS_BLOQUEANTES_ABERTOS`.

### Passo 7 - Preparar handoff de bugs

1. Objetivo funcional do passo no contexto da app.

Entregar ao `BK-MF8-07` apenas bugs bloqueantes aprovados e deixar os riscos aceites prontos para o freeze final.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`
    - REVER: `docs/evidence/MF8/FEEDBACK-ORIENTADOR-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-07-correcao-de-bugs-bloqueantes.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-08-scope-freeze-final.md`
    - LOCALIZAÇÃO: secção `Handoff para BK-MF8-07`

3. Instruções do que fazer.

Cria a secção `Handoff para BK-MF8-07` com esta tabela:

| Item | Tipo | Origem | Owner | Evidence | Ação esperada no próximo BK | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `BUG_BLOQUEANTE` ou `RISCO_ACEITE` | `RSK-001` |  |  |  | `ENVIAR_BK_MF8_07`, `MANTER_PARA_FREEZE` ou `ARQUIVAR` |

Usa estas regras:

- Apenas itens `BUG_BLOQUEANTE` entram em `BK-MF8-07`.
- Riscos aceites seguem para `BK-MF8-08` como ressalvas do freeze, não como correções de código.
- Itens arquivados devem indicar motivo: duplicado, fora do escopo aprovado ou sem impacto na defesa.
- O handoff deve incluir owner, evidence e ação esperada para cada item.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de handoff: o próximo BK recebe uma lista limpa de bugs, e o freeze recebe apenas riscos aceites.

5. Explicação do código.

Não há código a explicar neste passo. O handoff impede que o `BK-MF8-07` corrija itens que não são bloqueantes e impede que um bug real desapareça no freeze. A cadeia final fica clara: riscos aceites para `BK-MF8-08`, bugs para `BK-MF8-07`.

6. Validação do passo.

O handoff passa quando outra pessoa consegue abrir `docs/evidence/MF8/RISCOS-RESIDUAIS.md` e separar imediatamente o que vai para `BK-MF8-07`, o que fica como ressalva de freeze e o que foi arquivado.

7. Cenário negativo/erro esperado.

Se um item enviado para `BK-MF8-07` não tiver caso de reprodução ou proof, o próximo BK fica bloqueado. Corrige o handoff antes de fechar este BK.

#### Critérios de aceite

- Cada risco tem causa, impacto, probabilidade, severidade, owner e decisão.
- Blockers não ficam marcados como risco residual.
- Riscos aceites têm mitigação e texto de defesa.
- A lista aponta para evidence real.
- O handoff para bugs bloqueantes está limpo.

#### Validação final

- Rever todas as linhas com owner.
- Confirmar que severidade P0 não fica aceite sem justificação explícita.
- Cruzar riscos com feedback e matrizes.
- Executar `git diff --check` após editar a lista.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/RISCOS-RESIDUAIS.md`.
- `neg`: risco sem owner, fonte ou decisão não pode ser aceite.
- `fonte`: feedback, ensaio e matrizes.

#### Handoff

O BK-MF8-07 deve corrigir apenas os itens promovidos a bug bloqueante por esta lista.

- Entregar `docs/evidence/MF8/RISCOS-RESIDUAIS.md` preenchido.
- Registar blockers com owner, impacto e critério de fecho.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: passos 1 a 7 concretizados com matriz de riscos, plano de mitigação, promoção de blockers, validação de aceitação, decisão final e handoff para bugs/freeze.
