# BK-MF8-02 - Matriz de cobertura RNF -> validação

## Header

- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Davi`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-01`
- `rf_rnf`: `RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF32, RNF33, RNF35, RNF36, RNF38, RNF39, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-matriz-de-cobertura-rnf-validacao.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais consolidar a validação dos RNF finais de compatibilidade, arquitetura, testes, observabilidade, operação e governação. A saída deve dizer que comando, evidence ou decisão valida cada RNF.

#### Importância

Os RNF protegem a qualidade da aplicação. Uma funcionalidade pode parecer pronta, mas falhar em segurança, testes, compatibilidade ou operação. A matriz RNF impede uma defesa baseada apenas em “parece funcionar”.

#### Scope-in

- Mapear os RNF atribuídos à MF8.
- Associar cada RNF a comando, ficheiro de evidence ou decisão documentada.
- Separar validação executada, validação pendente e risco residual.
- Preparar o roteiro de demo final com limites técnicos claros.

#### Scope-out

- Alterar a definição de RNF sem fonte canónica.
- Substituir testes técnicos por opinião visual.
- Declarar conformidade sem comando ou evidence.
- Adicionar ferramentas externas de qualidade sem decisão registada.

#### Estado antes e depois

- Estado antes: os resultados de regressão, hardening e UI existem em evidence separada.
- Estado antes: a dependência `BK-MF8-01` tem de estar concluída, validada ou registada com ressalva.
- Estado depois: existe uma matriz RNF que mostra validação técnica, lacunas e ressalvas aceites.
- Estado depois: o handoff para `BK-MF8-03` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-01` está disponível ou tem ressalva registada.
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

- `CANONICO`: os RNF listados no header pertencem ao fecho S12.
- `CANONICO`: o validador oficial é `bash scripts/validate-planificacao.sh`.
- `DERIVADO`: comandos de backend correm em `backend` e comandos de frontend correm em `frontend` para evitar provas no diretório errado.
- Validação RNF combina comando técnico, evidence documental e decisão humana rastreável.
- Risco residual é uma limitação aceite; blocker é falha que impede defesa honesta.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| RNF | `docs/RNF.md` | Define a qualidade esperada. |
| Comandos | `backend/package.json`, `frontend/package.json`, `scripts/validate-planificacao.sh` | Fornecem validação reproduzível. |
| Evidence | `docs/evidence/MF6/`, `docs/evidence/MF7/` | Fornece resultados já executados. |
| Saída | `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` | Consolida RNF, comando, resultado e risco. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
- REVER: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`

#### Tutorial técnico linear

### Passo 1 - Confirmar matriz RF anterior

1. Objetivo funcional do passo no contexto da app.

Usar a matriz RF como entrada para saber que funcionalidades precisam de garantias não funcionais.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - LOCALIZAÇÃO: linhas com risco técnico

3. Instruções do que fazer.

Identifica RF com risco de teste, compatibilidade, segurança, operação ou observabilidade. Leva esses riscos para a matriz RNF.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A entrada passa quando todos os riscos técnicos de RF têm destino RNF.

7. Cenário negativo/erro esperado.

Se um risco técnico ficar sem RNF associado, regista `PENDENTE_MAPEAMENTO`.

### Passo 2 - Listar RNF do fecho S12

1. Objetivo funcional do passo no contexto da app.

Garantir que todos os RNF do header entram no artefacto.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: RNF21..RNF40 listados no header

3. Instruções do que fazer.

Copia cada RNF com descrição curta, owner e prioridade. Não agrupes RNF diferentes numa única linha sem manter IDs individuais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A lista passa quando todos os IDs do header aparecem.

7. Cenário negativo/erro esperado.

Se faltar RNF, o validador humano não consegue provar cobertura.

### Passo 3 - Associar comando ou evidence

1. Objetivo funcional do passo no contexto da app.

Dar a cada RNF uma prova operacional concreta.

2. Ficheiros envolvidos:
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - REVER: `docs/evidence/MF6/`
    - LOCALIZAÇÃO: scripts, gates e outputs

3. Instruções do que fazer.

Indica diretório, comando, artefacto e resultado esperado. Para backend usa `backend`; para frontend usa `frontend`; para planificação usa a raiz.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando cada RNF tem comando, evidence ou decisão documentada.

7. Cenário negativo/erro esperado.

Se um comando não existir, marca `PENDENTE_SCRIPT` e não inventes script novo.

### Passo 4 - Registar execução e resultado

1. Objetivo funcional do passo no contexto da app.

Distinguir comando executado de comando apenas previsto.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: colunas `Comando`, `Resultado`, `Data`

3. Instruções do que fazer.

Preenche resultado com `PASS`, `FAIL`, `PENDENTE` ou `BLOQUEADO`. Copia a mensagem essencial de falhas técnicas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A linha passa quando tem resultado e fonte.

7. Cenário negativo/erro esperado.

Se alguém executou o comando no diretório errado, o resultado correto é `FAIL_EXECUCAO`.

### Passo 5 - Classificar falhas técnicas

1. Objetivo funcional do passo no contexto da app.

Separar falhas críticas de ressalvas aceitáveis.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: colunas `Impacto` e `Decisão`

3. Instruções do que fazer.

Classifica falhas como blocker, risco residual ou pendência de ambiente. Justifica qualquer aceitação de risco.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando falhas P0 têm decisão explícita.

7. Cenário negativo/erro esperado.

Se uma falha de segurança ficar como ressalva sem decisão, bloqueia a matriz.

### Passo 6 - Fechar matriz RNF

1. Objetivo funcional do passo no contexto da app.

Consolidar totais e decisão técnica.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: sumário e decisão

3. Instruções do que fazer.

Calcula totais por estado e escreve decisão global: `VALIDADO`, `VALIDADO_COM_RESSALVAS` ou `BLOQUEADO`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A matriz passa quando o sumário bate certo com as linhas.

7. Cenário negativo/erro esperado.

Se o sumário disser validado mas houver blocker, corrige a decisão.

### Passo 7 - Preparar handoff para demo

1. Objetivo funcional do passo no contexto da app.

Entregar à demo apenas fluxos sustentados por qualidade técnica.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - REVER: guia `BK-MF8-03`
    - LOCALIZAÇÃO: handoff

3. Instruções do que fazer.

Lista limitações que o roteiro deve evitar e provas técnicas que podem ser citadas na defesa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

O handoff passa quando o BK-MF8-03 sabe que fluxos pode mostrar.

7. Cenário negativo/erro esperado.

Se uma limitação técnica não for comunicada ao roteiro, a demo pode prometer mais do que foi validado.

#### Critérios de aceite

- Todos os RNF do header aparecem na matriz.
- Cada RNF tem fonte, comando/evidence, resultado e owner.
- Comandos indicam diretório de execução.
- Falhas ficam classificadas sem mascarar estado.
- O roteiro de demo recebe apenas RNF validados ou ressalvas explícitas.

#### Validação final

- Confirmar cobertura contra `docs/RNF.md` e matriz canónica.
- Executar `npm test` dentro de `backend` se o ambiente estiver preparado.
- Executar `npm run build` dentro de `frontend`.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` na raiz.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`.
- `neg`: comandos ausentes, falhados ou executados em diretório errado ficam `PENDENTE` ou `FAIL`.
- `fonte`: `docs/RNF.md`, package scripts e gates MF6/MF7.

#### Handoff

O BK-MF8-03 deve usar esta matriz para mostrar só fluxos demonstráveis, com ressalvas técnicas já conhecidas.

- Entregar `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` preenchido.
- Registar blockers com owner, impacto e critério de fecho.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
