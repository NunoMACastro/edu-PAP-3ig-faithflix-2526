# BK-MF7-04 - Ensaio técnico da defesa

## Header

- `doc_id`: `GUIA-BK-MF7-04`
- `bk_id`: `BK-MF7-04`
- `macro`: `MF7`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF7-03`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-05`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-04-ensaio-tecnico-da-defesa.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais ensaiar a defesa técnica do FaithFlix usando o roteiro final, as matrizes RF/RNF e a evidence produzida nas macrofases anteriores.

O resultado observável é o ficheiro `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`, com tempos reais, perguntas prováveis, respostas técnicas, falhas encontradas e ações de correção antes da avaliação final.

#### Importância

O ensaio técnico reduz risco na defesa. Ele mostra se a equipa consegue explicar arquitetura, decisões de segurança, limites do MVP, validação e evidence sem depender de improviso.

Este BK transforma o roteiro numa simulação de defesa. A equipa pratica não só a navegação, mas também as respostas sobre backend, frontend, dados, sessão, privacidade, recomendações, subscrições e pool solidária.

#### Scope-in

- Ensaiar o roteiro de `BK-MF7-03`.
- Medir tempos por cena e tempo total.
- Criar mapa de perguntas técnicas prováveis.
- Preparar respostas com base em RF, RNF, BKs e evidence.
- Registar falhas, riscos e ações antes do feedback final.
- Preparar handoff para `BK-MF7-05`.

#### Scope-out

- Alterar funcionalidades durante o ensaio.
- Criar nova demo.
- Corrigir documentos canónicos sem orientação.
- Esconder falhas encontradas.
- Marcar como resolvida uma ação que ainda não foi validada.

#### Estado antes e depois

- Estado antes: existe roteiro de demo, mas ainda não há prova de que a equipa o consegue defender tecnicamente.
- Estado antes: as matrizes RF/RNF existem ou estão em revisão, mas as perguntas do júri ainda não foram treinadas.
- Estado depois: há um registo de ensaio com tempos, perguntas, respostas, falhas e ações.
- Estado depois: `BK-MF7-05` tem material objetivo para avaliação e feedback do orientador.

#### Pre-requisitos

- `BK-MF7-03` concluído ou revisto.
- `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` disponível.
- `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` disponível.
- `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` disponível.
- Evidence MF6 revista para responder a perguntas de hardening, performance e UX.
- Responsáveis presentes para cobrir domínio funcional, backend, frontend e operação.

#### Glossário

- Ensaio técnico: simulação da defesa com perguntas, tempos e validações.
- Pergunta crítica: pergunta que pode revelar falha de arquitetura, segurança, domínio ou evidence.
- Resposta rastreável: resposta ligada a ficheiro, BK, RF/RNF ou output.
- Ação corretiva: trabalho concreto antes da avaliação final.
- Semáforo: classificação `VERDE`, `AMARELO` ou `VERMELHO` do risco encontrado.

#### Conceitos teóricos essenciais

- `CANONICO`: `BK-MF7-04` é transversal e entra no gate S12 como evidence de preparação da defesa.
- `CANONICO`: a MF7 exige ensaio técnico antes de avaliação final.
- `DERIVADO`: perguntas prováveis devem cobrir produto, arquitetura, segurança, privacidade, testes e limitações.
- Uma resposta técnica boa tem três partes: decisão, evidência e impacto. Exemplo: "usamos sessão por cookie; está no BK de sessão; isto reduz exposição de credenciais no frontend".
- Um ensaio não é uma apresentação perfeita. É uma ferramenta para encontrar falhas antes do júri.
- Falhas de tempo, dados, permissões ou explicação devem virar ações com owner e data.

#### Arquitetura do BK

| Área | Entrada | Saída |
| --- | --- | --- |
| Demo | `ROTEIRO-DEMO-FINAL.md` | Tempo real por cena |
| RF/RNF | matrizes MF7 | Perguntas e respostas rastreáveis |
| Evidence | `docs/evidence/MF6/` e `docs/evidence/MF7/` | Provas a citar |
| Ensaio | sessão cronometrada | `ENSAIO-TECNICO-DEFESA.md` |
| Handoff | ações e riscos | Base para feedback do orientador |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
- REVER: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- REVER: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`

#### Tutorial técnico linear

### Passo 1 - Executar ensaio cronometrado

1. Objetivo funcional do passo no contexto da app.

Medir se a demo cabe no tempo e se a sequência é clara.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
    - LOCALIZAÇÃO: secções `Tempos por cena` e `Observações`.

3. Instruções do que fazer.

Executa a demo uma vez sem interrupções. Regista tempo planeado, tempo real, responsável e nota curta por cena.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é o registo cronometrado do ensaio.

5. Explicação do código.

Não há código porque o ensaio valida comunicação e prontidão operacional. O tempo real mostra se a equipa consegue defender o produto com foco.

Se uma cena demora demasiado, o problema pode estar no roteiro, na falta de dados ou numa explicação confusa. O aluno deve corrigir a causa, não apenas falar mais depressa.

6. Validação do passo.

Compara o tempo total com o limite definido pelo orientador. Se passar do limite, marca as cenas com maior desvio.

7. Cenário negativo/erro esperado.

Se uma cena bloquear por falta de conta ou dado, regista `VERMELHO` e cria ação corretiva antes de repetir o ensaio.

### Passo 2 - Criar mapa de perguntas técnicas

1. Objetivo funcional do passo no contexto da app.

Preparar respostas para perguntas prováveis do júri com base em evidence e contratos do projeto.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Perguntas técnicas`.

3. Instruções do que fazer.

Cria uma tabela com pergunta, tema, resposta curta, evidence citada, responsável e risco se a resposta for fraca. Inclui perguntas sobre sessão, ownership, validação backend, recomendações, subscrições, pool solidária, privacidade e limitações do MVP.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é o mapa de perguntas.

5. Explicação do código.

O mapa obriga a equipa a responder com base em factos, não em intenção. Uma resposta rastreável usa documentação ou evidence; uma resposta vaga vira risco.

O aluno pode ajustar a formulação para falar melhor, mas não pode retirar a fonte técnica da resposta.

6. Validação do passo.

Cada pergunta deve apontar para pelo menos uma fonte: BK, RF/RNF, matriz, evidence ou ficheiro de código referido no roteiro.

7. Cenário negativo/erro esperado.

Se a resposta a "como protegem dados de outro utilizador?" não citar sessão, ownership ou validação backend, marca `AMARELO` ou `VERMELHO`.

### Passo 3 - Ensaiar negativos e limitações

1. Objetivo funcional do passo no contexto da app.

Garantir que a equipa sabe explicar falhas esperadas e limitações sem comprometer a defesa.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção `Negativos e limitações`.

3. Instruções do que fazer.

Treina pelo menos 3 negativos P1: ação sem sessão, rota inexistente e operação sem permissão. Para cada um, regista resultado esperado, explicação técnica e evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é o registo dos negativos treinados.

5. Explicação do código.

Negativos treinados dão confiança. Eles mostram que a aplicação não depende apenas do caminho feliz e que a equipa sabe explicar validação, permissões e limites.

Limitação não é desculpa: deve ter estado, impacto e decisão. Se for crítica para defesa, vira ação antes do feedback final.

6. Validação do passo.

Outra pessoa da equipa deve escolher um negativo e explicar o resultado esperado sem ler notas extensas.

7. Cenário negativo/erro esperado.

Se a pessoa não souber diferenciar falta de sessão de falta de permissão, volta à matriz RNF e aos BKs de autenticação/admin.

### Passo 4 - Fechar ações para avaliação final

1. Objetivo funcional do passo no contexto da app.

Transformar falhas do ensaio em tarefas objetivas antes da avaliação do orientador.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
    - REVER: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
    - LOCALIZAÇÃO: secções `Ações corretivas` e `Handoff`.

3. Instruções do que fazer.

Para cada falha, regista owner, prioridade, evidência afetada, ação, critério de fecho e data-limite. Classifica com semáforo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é uma lista de ações corretivas.

5. Explicação do código.

A avaliação final precisa de factos. Uma ação sem owner não é plano; uma ação sem critério de fecho não é verificável.

Este passo prepara `BK-MF7-05` para decidir se a equipa segue para MF8 com riscos residuais ou se precisa de correção antes.

6. Validação do passo.

Confirma que toda ação `VERMELHO` tem impacto descrito e dono explícito.

7. Cenário negativo/erro esperado.

Se uma falha crítica ficar sem owner, a avaliação final deve bloquear o fecho da MF7.

#### Critérios de aceite

- O ensaio tem tempos reais por cena.
- O mapa de perguntas cobre produto, arquitetura, segurança, privacidade, testes e limitações.
- Existem pelo menos 3 negativos P1 ensaiados.
- Falhas têm semáforo, owner e critério de fecho.
- O handoff para `BK-MF7-05` distingue risco residual de bloqueio.

#### Validação final

- Executar `bash scripts/validate-planificacao.sh` na raiz do projeto.
- Executar `git diff --check` na raiz do projeto.
- Repetir pelo menos uma parte crítica da demo após ações `VERMELHO`.
- Confirmar que cada resposta técnica tem fonte.

#### Evidence para PR/defesa

- `pr`: referência da entrega onde `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md` foi criado.
- `proof`: registo cronometrado do ensaio e mapa de perguntas.
- `neg`: ação sem sessão, rota inexistente e operação sem permissão.
- `fonte`: roteiro final, matrizes RF/RNF, evidence MF6 e scorecard.

#### Handoff

Este BK entrega ao orientador um ensaio auditável. `BK-MF7-05` deve usar tempos, perguntas, falhas e ações para emitir feedback final e preparar a lista de riscos residuais de MF8.

#### Changelog

- `2026-06-22`: guia reescrito para ensaio técnico com tempos, perguntas, negativos, ações corretivas e handoff para avaliação final.
