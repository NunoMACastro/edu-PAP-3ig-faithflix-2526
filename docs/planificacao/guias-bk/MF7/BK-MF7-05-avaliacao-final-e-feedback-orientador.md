# BK-MF7-05 - Avaliação final e feedback orientador

## Header

- `doc_id`: `GUIA-BK-MF7-05`
- `bk_id`: `BK-MF7-05`
- `macro`: `MF7`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF7-02,BK-MF7-04`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-01`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-05-avaliacao-final-e-feedback-orientador.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais consolidar a avaliação final da MF7 e registar feedback do orientador com base nas matrizes, roteiro e ensaio técnico.

O resultado observável é o ficheiro `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`, com decisão, score, comentários, ações aceites, bloqueios e handoff para `BK-MF8-01`.

#### Importância

A avaliação final protege o fecho da PAP contra duas falhas comuns: considerar a defesa pronta sem evidência ou empurrar riscos críticos para a fase de buffer sem decisão explícita.

Este BK cria o momento formal em que o orientador cruza produto, documentação, qualidade técnica, demo e maturidade da equipa. O resultado deve ser claro: seguir, seguir com ressalvas ou corrigir antes de avançar.

#### Scope-in

- Rever matriz RF, matriz RNF, roteiro e ensaio técnico.
- Aplicar critérios de score e feedback do orientador.
- Registar decisão final da MF7.
- Separar riscos residuais de bloqueios.
- Preparar handoff para `BK-MF8-01`.
- Registar pelo menos 3 negativos P0 de avaliação.

#### Scope-out

- Alterar avaliação para esconder falhas.
- Corrigir produto dentro deste BK.
- Reabrir requisitos sem decisão canónica.
- Fechar MF7 com evidence obrigatória em falta.
- Substituir a decisão humana do orientador por score automático.

#### Estado antes e depois

- Estado antes: existem ou estão em revisão as matrizes RF/RNF, roteiro e ensaio técnico.
- Estado antes: a equipa ainda não tem decisão final do orientador registada.
- Estado depois: existe avaliação final com decisão, comentários, ações e riscos.
- Estado depois: `BK-MF8-01` recebe uma lista objetiva de riscos residuais para buffer e fecho.

#### Pre-requisitos

- `BK-MF7-02` concluído ou revisto.
- `BK-MF7-04` concluído ou revisto.
- `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` disponível.
- `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` disponível.
- `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` disponível.
- `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md` disponível.
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md` consultado.

#### Glossário

- Avaliação final: decisão formal de prontidão da MF7.
- Feedback do orientador: comentários técnicos e pedagógicos que orientam correções finais.
- Score: classificação estruturada por critérios definidos.
- Risco residual: risco aceite e acompanhado na MF8.
- Bloqueio: falha que impede avançar sem correção.
- Handoff: entrega objetiva para o próximo BK.

#### Conceitos teóricos essenciais

- `CANONICO`: `BK-MF7-05` depende de `BK-MF7-02` e `BK-MF7-04`.
- `CANONICO`: `BK-MF8-01` depende de `BK-MF7-05`, por isso a avaliação final alimenta diretamente a lista de riscos residuais.
- `CANONICO`: `BACKLOG-MVP.md` exige evidence `pr`, `proof` e `neg` para fecho de BK.
- `DERIVADO`: a decisão final usa estados `GO`, `GO_COM_RESSALVAS` e `NO_GO` para separar avanço limpo, avanço com risco aceite e bloqueio.
- Feedback útil é específico. "Melhorar demo" é vago; "reduzir cena admin para 2 minutos e citar matriz RNF na pergunta de API" é acionável.
- Um risco residual só pode seguir para MF8 se não bloquear a defesa. Falhas críticas de evidence, segurança, privacidade ou ownership não devem ser tratadas como detalhe.

#### Arquitetura do BK

| Área | Entrada | Saída |
| --- | --- | --- |
| RF/RNF | matrizes MF7 | Cobertura e lacunas |
| Demo | roteiro e ensaio | Prontidão de apresentação |
| Score | `SCORECARD-SPRINTS.md` | Avaliação estruturada |
| Feedback | revisão do orientador | Ações e decisão |
| Handoff | riscos e bloqueios | Base para `BK-MF8-01` |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`
- REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- REVER: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-lista-de-riscos-residuais.md`

#### Tutorial técnico linear

### Passo 1 - Consolidar pacote de avaliação

1. Objetivo funcional do passo no contexto da app.

Juntar todos os artefactos que o orientador precisa de rever antes da decisão.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`
    - REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - REVER: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
    - LOCALIZAÇÃO: secção `Pacote revisto`.

3. Instruções do que fazer.

Cria uma lista de artefactos com estado, owner, última revisão, bloqueios e decisão de aceitar ou devolver. Nenhum artefacto obrigatório pode ficar sem estado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é o pacote de avaliação.

5. Explicação do código.

Não há código porque a tarefa é de governação. A avaliação começa por garantir que todos os documentos de evidence existem e são rastreáveis.

Isto evita aprovar MF7 com uma matriz incompleta, uma demo sem ensaio ou feedback sem ligação a provas.

6. Validação do passo.

Confirma que os quatro artefactos centrais da MF7 têm estado explícito: matriz RF, matriz RNF, roteiro e ensaio.

7. Cenário negativo/erro esperado.

Se a matriz RNF estiver ausente, a decisão final não pode ser `GO`.

### Passo 2 - Aplicar score e feedback

1. Objetivo funcional do passo no contexto da app.

Transformar a revisão do orientador em avaliação estruturada e acionável.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
    - LOCALIZAÇÃO: secções `Score` e `Feedback`.

3. Instruções do que fazer.

Avalia cobertura, coerência, pedagogia, adequação ao 12.º ano, governação, carga planeada, carga real, desvio, risco e ação corretiva. Para cada item fraco, escreve feedback com owner e evidência afetada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é o score final e feedback.

5. Explicação do código.

O score organiza a conversa. Ele não substitui julgamento técnico, mas obriga a justificar a decisão com critérios comuns.

O feedback deve ser útil para agir. Comentários vagos geram ansiedade e não melhoram a entrega.

6. Validação do passo.

Confirma que cada ação corretiva tem owner, prazo e critério de fecho.

7. Cenário negativo/erro esperado.

Se o feedback disser "melhorar documentação" sem indicar ficheiro, secção ou critério, reescreve até ficar acionável.

### Passo 3 - Decidir GO, GO_COM_RESSALVAS ou NO_GO

1. Objetivo funcional do passo no contexto da app.

Emitir uma decisão final honesta sobre a prontidão da MF7.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`
    - REVER: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
    - LOCALIZAÇÃO: secção `Decisão final`.

3. Instruções do que fazer.

Usa `GO` se não houver bloqueios críticos. Usa `GO_COM_RESSALVAS` se houver riscos aceites e não críticos. Usa `NO_GO` se falta evidence obrigatória, se há falha crítica de segurança/privacidade ou se a demo não é defensável.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a decisão final.

5. Explicação do código.

A decisão final deve ser compreensível para a equipa. Ela responde: podemos avançar, avançamos com riscos explícitos, ou precisamos corrigir antes?

Esta decisão prepara MF8. Riscos aceites seguem para a lista de riscos residuais; bloqueios ficam para correção antes de avançar.

6. Validação do passo.

Confirma que a decisão cita evidence e não apenas opinião do orientador.

7. Cenário negativo/erro esperado.

Se existir falha crítica de sessão, privacidade ou ownership, a decisão não deve ser `GO_COM_RESSALVAS`; deve ser `NO_GO` até corrigir.

### Passo 4 - Preparar handoff para MF8

1. Objetivo funcional do passo no contexto da app.

Entregar a MF8 uma lista clara de riscos residuais, bugs bloqueantes e decisões aceites.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-01-lista-de-riscos-residuais.md`
    - LOCALIZAÇÃO: secções `Riscos residuais`, `Bloqueios` e `Handoff`.

3. Instruções do que fazer.

Separa riscos residuais de bloqueios. Para cada item, regista origem, impacto, owner, próxima ação e BK de MF8 que o deve tratar.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é o handoff para MF8.

5. Explicação do código.

Handoff bom evita que a fase de buffer comece às cegas. A equipa sabe o que é risco aceite, o que é bug bloqueante e o que já está decidido.

O aluno não deve empurrar falhas críticas para "risco residual". A diferença entre risco e bloqueio é decisiva para a defesa.

6. Validação do passo.

Confirma que todos os riscos com impacto na defesa têm ação ou decisão explícita.

7. Cenário negativo/erro esperado.

Se um bloqueio não tiver owner, `BK-MF8-01` não consegue começar com segurança.

#### Critérios de aceite

- O pacote de avaliação inclui matriz RF, matriz RNF, roteiro e ensaio.
- O score usa critérios definidos nos documentos de sprint.
- O feedback é específico, acionável e ligado a evidence.
- Existem pelo menos 3 negativos P0 de avaliação.
- A decisão final é `GO`, `GO_COM_RESSALVAS` ou `NO_GO` com justificação.
- O handoff para `BK-MF8-01` separa riscos residuais de bloqueios.

#### Validação final

- Executar `bash scripts/validate-planificacao.sh` na raiz do projeto.
- Executar `git diff --check` na raiz do projeto.
- Confirmar que todos os artefactos obrigatórios da MF7 têm estado.
- Confirmar que a decisão final cita evidence e ações.

#### Evidence para PR/defesa

- `pr`: referência da entrega onde `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md` foi criado.
- `proof`: score, decisão final e feedback do orientador.
- `neg`: matriz ausente impede `GO`; feedback vago é rejeitado; falha crítica impede ressalva simples.
- `fonte`: matrizes MF7, roteiro, ensaio, scorecard e backlog.

#### Handoff

Este BK fecha a MF7 e entrega a `BK-MF8-01` uma lista objetiva de riscos residuais, bloqueios e decisões aceites. A MF8 deve usar este material para priorizar buffer, fecho e empacotamento final.

#### Changelog

- `2026-06-22`: guia reescrito para avaliação final com score, feedback, decisão, negativos e handoff para MF8.
