# BK-MF8-01 - Matriz de cobertura RF -> evidência

## Header

- `doc_id`: `GUIA-BK-MF8-01`
- `bk_id`: `BK-MF8-01`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF7-05`
- `rf_rnf`: `RF_ATIVOS_MVP`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-02`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-01-matriz-de-cobertura-rf-evidencia.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais construir a matriz final que liga cada RF ativo do MVP a prova objetiva. A matriz deve mostrar que funcionalidades existem, onde foram validadas, que negativos foram testados e que risco fica aberto para a defesa.

#### Importância

A defesa da PAP precisa de rastreabilidade: uma afirmação como “o catálogo funciona” só é forte quando aponta para RF, BK, evidence, comando ou captura. Este BK transforma documentação dispersa numa visão única, auditável e pronta para o orientador.

#### Scope-in

- Identificar todos os RF ativos do MVP.
- Ligar cada RF ao BK responsável e à evidence disponível.
- Registar estado, prova, negativo, owner e risco por RF.
- Preparar entrada direta para a matriz RNF do BK seguinte.

#### Scope-out

- Reescrever RF ou alterar prioridade sem decisão do orientador.
- Criar funcionalidades novas para tapar lacunas da matriz.
- Declarar prova sem fonte verificável.
- Fechar RF com evidence emprestada de outro requisito.

#### Estado antes e depois

- Estado antes: existem RF, BKs e evidence por macrofase, mas a leitura transversal ainda está dispersa.
- Estado antes: a dependência `BK-MF7-05` tem de estar concluída, validada ou registada com ressalva.
- Estado depois: existe uma matriz RF com prova, negativos, lacunas e handoff para a validação RNF.
- Estado depois: o handoff para `BK-MF8-02` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF7-05` está disponível ou tem ressalva registada.
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

- `CANONICO`: `RF_ATIVOS_MVP` entra na matriz canónica como cobertura funcional final.
- `CANONICO`: o backlog exige evidence mínima `pr`, `proof` e `neg` por BK.
- `DERIVADO`: uma linha RF só pode ficar `VALIDADO` quando aponta para evidence e negativo proporcionais à prioridade.
- Rastreabilidade funcional significa conseguir seguir a cadeia RF -> BK -> ficheiro -> prova -> risco.
- Uma lacuna de evidence não é automaticamente bug; pode ser prova em falta, risco residual ou blocker, conforme impacto.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| RF | `docs/RF.md` | Define o que deve existir funcionalmente. |
| Matriz canónica | `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Liga RF a BK, owner, prioridade e evidence. |
| Evidence | `docs/evidence/MF2..MF7/` | Guarda prova técnica ou visual já produzida. |
| Saída | `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` | Consolida estado final por RF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/RF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
- REVER: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar gate visual de entrada

1. Objetivo funcional do passo no contexto da app.

Garantir que a UI e navegação segura da MF7 já têm decisão antes de consolidar RF.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
    - REVER: guia `BK-MF7-05`
    - LOCALIZAÇÃO: decisão final e ressalvas

3. Instruções do que fazer.

Confirma se o gate MF7 está `GO`, `GO_COM_RESSALVAS` ou `NO_GO`. Se estiver `NO_GO`, a matriz RF pode ser criada, mas fica com decisão final bloqueada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A entrada passa quando existe decisão explícita do gate MF7 ou blocker registado.

7. Cenário negativo/erro esperado.

Se a decisão MF7 estiver ausente, regista `PENDENTE_GATE_MF7` e não declares RF fechado.

### Passo 2 - Extrair RF ativos

1. Objetivo funcional do passo no contexto da app.

Construir a lista de RF que entram na cobertura final.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: linhas com `RF` e `RF_ATIVOS_MVP`

3. Instruções do que fazer.

Percorre a matriz canónica e copia para o artefacto todos os RF associados ao MVP. Mantém ID, BK, owner e prioridade sem alterar grafia.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A lista passa quando cada RF ativo tem BK e owner.

7. Cenário negativo/erro esperado.

Se um RF aparecer em `docs/RF.md` mas não na matriz, regista drift documental.

### Passo 3 - Localizar proof por RF

1. Objetivo funcional do passo no contexto da app.

Encontrar prova real para cada requisito funcional.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF2/`
    - REVER: `docs/evidence/MF6/`
    - REVER: `docs/evidence/MF7/`
    - LOCALIZAÇÃO: proof, comando, captura ou log

3. Instruções do que fazer.

Para cada RF, aponta para evidence já existente ou marca `PENDENTE_EVIDENCIA`. Não uses uma prova visual para validar regra de backend que exige autorização ou ownership.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A linha passa quando o proof é específico e verificável.

7. Cenário negativo/erro esperado.

Se o proof for apenas uma frase sem ficheiro ou comando, muda o estado para pendente.

### Passo 4 - Registar negativos por prioridade

1. Objetivo funcional do passo no contexto da app.

Confirmar que os RF críticos têm falhas controladas associadas.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - LOCALIZAÇÃO: secção `Negativos e falhas controladas`

3. Instruções do que fazer.

Regista pelo menos três negativos para RF P0/P1 e pelo menos um para RF P2. O negativo deve indicar entrada, resultado esperado e fonte.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando os negativos são mensuráveis.

7. Cenário negativo/erro esperado.

Se um RF P0 não tiver negativo, o RF não pode ficar `VALIDADO`.

### Passo 5 - Classificar estado e risco

1. Objetivo funcional do passo no contexto da app.

Separar requisitos validados, pendentes e com risco residual.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - LOCALIZAÇÃO: colunas `Estado` e `Risco`

3. Instruções do que fazer.

Usa estados fechados: `VALIDADO`, `PENDENTE`, `RISCO_RESIDUAL`, `BLOCKER` ou `NAO_APLICAVEL`. Justifica qualquer `NAO_APLICAVEL` com fonte canónica.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A matriz passa quando nenhum estado depende de interpretação oral.

7. Cenário negativo/erro esperado.

Se houver blocker sem owner, a linha fica incompleta.

### Passo 6 - Fechar matriz RF

1. Objetivo funcional do passo no contexto da app.

Criar a versão final do artefacto com resumo executivo.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Acrescenta sumário com totais por estado, principais blockers e decisão da matriz. Mantém histórico de lacunas em vez de apagar linhas difíceis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

O artefacto passa quando outra pessoa consegue rever cobertura sem abrir todos os BKs.

7. Cenário negativo/erro esperado.

Se o sumário contradisser linhas da matriz, corrige o sumário.

### Passo 7 - Preparar handoff RNF

1. Objetivo funcional do passo no contexto da app.

Entregar ao BK seguinte os pontos técnicos que precisam de validação não funcional.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: guia `BK-MF8-02`
    - LOCALIZAÇÃO: secção `Handoff`

3. Instruções do que fazer.

Lista RF com risco técnico, comandos usados e evidence que deve ser reaproveitada na matriz RNF.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

O handoff passa quando o BK-MF8-02 tem entradas claras.

7. Cenário negativo/erro esperado.

Se uma lacuna de RF exigir validação RNF, mas não estiver no handoff, o próximo BK fica bloqueado por omissão.

#### Critérios de aceite

- A matriz contém todos os RF ativos do MVP.
- Cada RF tem BK, owner, prioridade, proof, negativo, estado e risco.
- Nenhuma linha usa `VALIDADO` sem fonte verificável.
- Lacunas ficam classificadas como `PENDENTE`, `RISCO_RESIDUAL` ou `BLOCKER`.
- O handoff identifica o que o BK-MF8-02 deve reaproveitar.

#### Validação final

- Comparar RF da matriz com `docs/RF.md` e `MATRIZ-CANONICA-BK.md`.
- Confirmar que cada proof aponta para ficheiro, comando, captura ou log real.
- Executar `bash scripts/validate-planificacao.sh` na raiz do projeto.
- Executar `git diff --check` na raiz do projeto.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` preenchido.
- `neg`: pelo menos três RF P0/P1 sem fonte devem ficar bloqueados ou justificados.
- `fonte`: `docs/RF.md` e `MATRIZ-CANONICA-BK.md`.

#### Handoff

O BK-MF8-02 deve reutilizar os estados e lacunas desta matriz para cruzar requisitos não funcionais sem duplicar prova.

- Entregar `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md` preenchido.
- Registar blockers com owner, impacto e critério de fecho.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
