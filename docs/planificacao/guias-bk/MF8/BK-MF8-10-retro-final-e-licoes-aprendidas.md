# BK-MF8-10 - Retro final e lições aprendidas

## Header

- `doc_id`: `GUIA-BK-MF8-10`
- `bk_id`: `BK-MF8-10`
- `macro`: `MF8`
- `owner`: `Nuno`
- `apoio`: `Matheus, Mateus, Davi, Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-09`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `FIM`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-10-retro-final-e-licoes-aprendidas.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais fechar a retro final da equipa FaithFlix. O resultado é o artefacto `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`, com a síntese do que foi entregue, que decisões técnicas funcionaram, que falhas foram assumidas, que riscos ficaram aceites e que recomendações ficam para projetos futuros.

Este BK não altera backend, frontend, RF, RNF, backlog ou escopo. A retro final usa o pacote de `BK-MF8-09`, o freeze de `BK-MF8-08`, os scorecards e a evidence final para transformar a entrega em aprendizagem defendível.

#### Importância

A PAP não termina apenas com o pacote pronto. A defesa também avalia maturidade: a equipa sabe explicar o que construiu, porque tomou certas decisões, onde falhou, como validou, que riscos assumiu e que faria melhor numa próxima iteração.

Uma retro vaga, baseada em memória informal, fragiliza a defesa. Uma retro com evento, causa, impacto, decisão e melhoria mostra domínio técnico, responsabilidade e capacidade de evolução.

#### Scope-in

- Confirmar o estado final recebido de `BK-MF8-09`.
- Criar ou atualizar `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`.
- Recolher contributos dos owners principais.
- Registar lições técnicas, lições de processo e recomendações futuras.
- Fechar decisão final da retro com evidence, ressalvas e estado de arquivo.
- Arquivar o fecho da PAP sem criar novo backlog de produto.

#### Scope-out

- Reabrir correções depois do pacote final.
- Alterar requisitos, prioridades, owners, sprints ou dependências.
- Criar novas funcionalidades.
- Apagar riscos, falhas ou comandos falhados para melhorar a narrativa.
- Culpar pessoas em vez de analisar processo, decisão técnica e evidência.
- Usar prints, logs ou textos com dados pessoais sem anonimização.

#### Estado antes e depois

- Estado antes: `BK-MF8-09` entregou ou deve entregar `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`.
- Estado antes: `BK-MF8-08` entregou ou deve entregar a decisão de freeze em `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`.
- Estado antes: scorecards, matrizes, roteiro, ensaio, feedback, riscos e bugs já têm evidence ou ressalvas.
- Estado depois: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` fecha contributos, lições, recomendações, decisão final e arquivo.
- Estado depois: o handoff para `FIM` fica explícito e não depende de explicação oral.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Ler `docs/planificacao/sprints/SCORECARD-SPRINTS.md`.
- Rever `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` e `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`.
- Rever as principais evidências de MF6, MF7 e MF8 referidas no manifesto.
- Confirmar contributos de Matheus, Mateus, Davi e Kaue, ou registar ausência de contributo com motivo e impacto.
- Usar apenas caminhos públicos do repositório do aluno: `backend/`, `frontend/`, `docs/`, `scripts/` e `tests/`.

#### Glossário

- Retro final: análise final da equipa sobre entrega, processo, decisões, falhas e aprendizagens.
- Lição aprendida: conclusão prática ligada a um evento, causa, impacto e melhoria futura.
- Evidence: prova objetiva em ficheiro, comando, log, captura, matriz ou decisão assinável.
- Proof: referência concreta que confirma uma afirmação.
- Ressalva: limitação conhecida, aceite e preparada para defesa.
- Ação futura: recomendação para projeto semelhante ou evolução pós-PAP, sem reabrir a entrega atual.
- Arquivo da PAP: fecho documental que indica que não existe BK seguinte e que a entrega fica pronta para avaliação.
- Handoff final: nota terminal que permite a qualquer pessoa abrir a entrega e perceber o estado final.

#### Conceitos teóricos essenciais

- `CANONICO`: a MF8 fecha consolidação, evidência, defesa, buffer e fecho da PAP.
- `CANONICO`: `BK-MF8-10` depende de `BK-MF8-09` e termina em `FIM`.
- `DERIVADO`: a retro final deve usar factos da entrega, não memória informal.
- Retrospetiva técnica: análise do que funcionou ou falhou em arquitetura, validação, segurança, UI, documentação e gestão de evidence. Vem do manifesto e dos scorecards, serve para defender escolhas e evita respostas vagas na apresentação.
- Lição técnica: aprendizagem ligada a uma decisão concreta, por exemplo validar comandos por diretório ou manter evidence com proof. Entra na retro a partir de problemas e decisões observadas no pacote.
- Lição de processo: aprendizagem sobre coordenação, comunicação, revisão, gestão de tempo e handoff entre BKs. Vem dos owners e dos scorecards, e evita repetir falhas de organização.
- Recomendação futura: melhoria que faria sentido num projeto posterior, sem reabrir o escopo da PAP. Deve ter benefício, custo, risco e condição de adoção.
- Fecho documental: decisão final que liga estado do pacote, ressalvas, evidence e arquivo. Serve para mostrar que a equipa terminou a cadeia de BKs de forma honesta.
- Anonimização: remoção de nomes, emails, cookies, tokens, identificadores ou dados pessoais em prints e logs usados como proof. Protege privacidade e evita expor informação sensível na defesa.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Pacote final | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` | Fonte principal do estado final, comandos, evidence, exclusões e problemas para retro. |
| Freeze | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` | Fonte das decisões aceites, ressalvas e bloqueios finais. |
| Scorecards | `docs/planificacao/sprints/SCORECARD-SPRINTS.md` | Fonte de execução por sprint e indicadores de processo. |
| Plano total | `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md` | Fonte da cadeia MF0..MF8 e do gate S12. |
| Retro | `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` | Artefacto criado neste BK para fechar aprendizagens e arquivo. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
- REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
- REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
- REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar pacote final

1. Objetivo funcional do passo no contexto da app.

Confirmar que a retro começa a partir do pacote final certo, sem saltar a decisão de freeze nem transformar uma entrega bloqueada em fecho artificial.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - LOCALIZAÇÃO: secção `Entrada da retro`

3. Instruções do que fazer.

Cria a secção `Entrada da retro` em `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`.

Preenche esta tabela:

| Campo | Valor |
| --- | --- |
| BK de origem | `BK-MF8-09` |
| Artefacto do pacote | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` |
| Artefacto de freeze | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` |
| Owner da retro | `Nuno` |
| Data de fecho |  |
| Estado final do pacote | `PRONTO_PARA_ENTREGA`, `PRONTO_COM_RESSALVAS` ou `BLOQUEADO` |
| Condição para fechar retro |  |
| Proof principal |  |
| Ressalvas que entram na retro |  |

Aplica estas regras:

- Se o pacote estiver `PRONTO_PARA_ENTREGA`, a retro pode fechar sem ressalvas obrigatórias.
- Se o pacote estiver `PRONTO_COM_RESSALVAS`, copia as ressalvas para a retro e explica que aprendizagem resulta de cada uma.
- Se o pacote estiver `BLOQUEADO`, a retro não deve fingir conclusão total; regista o bloqueio, owner, impacto e critério de saída.
- Não substituas a decisão do manifesto por opinião da equipa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de validação operacional: a retro consome o estado do pacote, não altera a aplicação.

5. Explicação do código.

Não há código a explicar neste passo. A entrada da retro protege a rastreabilidade: o último BK só pode fechar a PAP se o pacote final e o freeze estiverem claros. Isto evita uma retro bonita, mas desligada da evidence real.

6. Validação do passo.

A validação passa quando o estado final do pacote, o proof principal e a condição para fechar a retro estão preenchidos. Se o pacote estiver `BLOQUEADO`, a retro deve manter esse estado visível.

7. Cenário negativo/erro esperado.

Se `EMPACOTAMENTO-FINAL-ENTREGA.md` indicar `BLOQUEADO` e a retro disser "PAP fechada sem ressalvas", a validação falha. Corrige a entrada da retro para mostrar bloqueio, owner e critério de saída.

### Passo 2 - Recolher contributos dos owners

1. Objetivo funcional do passo no contexto da app.

Recolher contributos de cada owner principal para que a retro represente a equipa inteira, e não apenas uma síntese genérica do orientador.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
    - LOCALIZAÇÃO: secções `Contributos dos owners` e `Ausências de contributo`

3. Instruções do que fazer.

Cria a secção `Contributos dos owners`.

Preenche esta matriz:

| Owner | BKs ou área principal | Contributo recebido? | O que correu bem | O que falhou ou ficou difícil | Evidence/proof | Lição candidata | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Matheus | bugs bloqueantes, defesa técnica ou área atribuída | `SIM` ou `NAO` |  |  |  |  | `VALIDO`, `PENDENTE_CONTRIBUTO` ou `SEM_IMPACTO` |
| Mateus | demo, empacotamento ou área atribuída | `SIM` ou `NAO` |  |  |  |  | `VALIDO`, `PENDENTE_CONTRIBUTO` ou `SEM_IMPACTO` |
| Davi | RNF, validação ou área atribuída | `SIM` ou `NAO` |  |  |  |  | `VALIDO`, `PENDENTE_CONTRIBUTO` ou `SEM_IMPACTO` |
| Kaue | matrizes, riscos, pacote ou área atribuída | `SIM` ou `NAO` |  |  |  |  | `VALIDO`, `PENDENTE_CONTRIBUTO` ou `SEM_IMPACTO` |
| Nuno | fecho, avaliação e governance | `SIM` |  |  |  |  | `VALIDO` |

Depois cria a secção `Ausências de contributo`:

| Owner sem contributo | Motivo conhecido | Impacto na retro | Como foi compensado | Estado |
| --- | --- | --- | --- | --- |
|  |  |  |  | `SEM_IMPACTO`, `RESSALVA` ou `BLOQUEIA_FECHO` |

Aplica estas regras:

- Um contributo válido deve apontar para pelo menos um ficheiro, comando, scorecard, decisão ou evento concreto.
- Se um owner não responder, não inventes a opinião dele. Regista ausência e usa evidence documental para cobrir a área.
- Se faltar contributo de uma área central do pacote, marca `RESSALVA` ou `BLOQUEIA_FECHO`.
- Escreve falhas como problemas de processo ou decisão técnica, não como ataque pessoal.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e colaborativa: recolhe contributos e transforma-os em evidence para a retro.

5. Explicação do código.

Não há código a explicar neste passo. A matriz evita que a retro seja uma lista de opiniões soltas. Cada contributo fica ligado a owner, área, proof e lição candidata, o que ajuda a equipa a defender que aprendeu com trabalho real.

6. Validação do passo.

A validação passa quando todos os owners têm uma linha preenchida e cada contributo `VALIDO` tem proof. Ausências devem ter motivo, impacto e compensação.

7. Cenário negativo/erro esperado.

Se a retro disser "todos concordaram que correu bem" sem registar owner, área e proof, a validação falha. Substitui a frase por linhas concretas na matriz de contributos.

### Passo 3 - Registar lições técnicas

1. Objetivo funcional do passo no contexto da app.

Registar aprendizagens sobre arquitetura, validação, segurança, UI, documentação técnica e evidence, sempre ligadas a eventos observados no projeto.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/evidence/MF6/`
    - REVER: `docs/evidence/MF7/`
    - LOCALIZAÇÃO: secção `Lições técnicas`

3. Instruções do que fazer.

Cria a secção `Lições técnicas`.

Preenche esta matriz:

| ID | Tema | Evento observado | Causa provável | Impacto no projeto | Decisão tomada | Evidence/proof | Lição aprendida | Recomendação futura | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LT-001 | `ARQUITETURA`, `VALIDACAO`, `SEGURANCA`, `UI`, `DOCUMENTACAO`, `EVIDENCE` ou `OPERACAO` |  |  |  |  |  |  |  | `VALIDADA`, `COM_RESSALVA` ou `DESCARTADA` |

Aplica estas regras:

- Usa `VALIDADA` apenas se a lição tiver evento, causa, impacto e proof.
- Usa `COM_RESSALVA` se a lição for plausível, mas faltar uma prova total.
- Usa `DESCARTADA` se a frase for opinião sem ligação a evidence.
- Inclui pelo menos uma lição sobre validação ou evidence, porque MF8 fecha o gate S12.
- Inclui uma lição sobre segurança ou privacidade se o pacote tiver exclusões, logs, capturas ou dados sensíveis.
- Não transformes desejo futuro em lição técnica; desejo futuro entra no passo 5.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é analítica: a equipa interpreta evidence técnica, não escreve novas funcionalidades.

5. Explicação do código.

Não há código a explicar neste passo. A matriz força raciocínio causal: evento, causa, impacto, decisão e aprendizagem. Isto evita frases vagas como "aprendemos a trabalhar melhor" e ajuda a defesa a responder com factos.

6. Validação do passo.

A validação passa quando cada lição técnica tem ID, tema, evento, causa, impacto, decisão, proof e recomendação futura. Linhas sem proof devem ficar `COM_RESSALVA` ou `DESCARTADA`.

7. Cenário negativo/erro esperado.

Se uma linha disser "aprendemos que testes são importantes" sem indicar comando, ficheiro, falha, gate ou evidence, a validação falha. Reescreve a linha com o evento concreto que demonstrou essa aprendizagem.

### Passo 4 - Registar lições de processo

1. Objetivo funcional do passo no contexto da app.

Registar aprendizagens sobre organização da equipa, handoff entre BKs, gestão de tempo, revisão, comunicação e preparação da defesa.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - LOCALIZAÇÃO: secção `Lições de processo`

3. Instruções do que fazer.

Cria a secção `Lições de processo`.

Preenche esta matriz:

| ID | Processo observado | Sprint/BK relacionado | Sinal observado | Consequência | Ajuste feito durante a PAP | Lição aprendida | Como evitar repetição | Proof | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LP-001 | `PLANEAMENTO`, `HANDOFF`, `REVISAO`, `COMUNICACAO`, `TEMPO`, `DEFESA` ou `EVIDENCE` |  |  |  |  |  |  |  | `VALIDADA`, `COM_RESSALVA` ou `ACAO_FUTURA` |

Depois cria a tabela `Erros comuns a evitar em projetos futuros`:

| Erro comum | Porque aconteceu | Sinal de alerta | Prevenção futura |
| --- | --- | --- | --- |
|  |  |  |  |

Aplica estas regras:

- Uma lição de processo deve nascer de scorecard, atraso, revisão, handoff, falha de comunicação ou decisão de gestão.
- Não escrevas nomes de pessoas como causa única de falha. Analisa método, falta de proof, ausência de revisão ou decisão tardia.
- Se a equipa corrigiu o processo durante a PAP, regista o ajuste feito.
- Se o problema só pode melhorar num projeto futuro, marca `ACAO_FUTURA`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de análise de processo e fecho pedagógico.

5. Explicação do código.

Não há código a explicar neste passo. A matriz separa problema de processo de problema técnico. Isto é importante porque a defesa deve mostrar como a equipa trabalhou, não apenas o que entregou.

6. Validação do passo.

A validação passa quando cada lição de processo tem sinal observado, consequência, ajuste ou prevenção futura e proof. A tabela de erros comuns deve ter pelo menos três entradas úteis.

7. Cenário negativo/erro esperado.

Se a retro culpar um colega por uma falha sem explicar processo, sinal de alerta e prevenção futura, a validação falha. Reescreve como problema de organização ou revisão com ação concreta.

### Passo 5 - Definir recomendações futuras

1. Objetivo funcional do passo no contexto da app.

Transformar aprendizagens em recomendações futuras sem reabrir a entrega final nem prometer funcionalidades fora do escopo da PAP.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - REVER: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - LOCALIZAÇÃO: secção `Recomendações futuras`

3. Instruções do que fazer.

Cria a secção `Recomendações futuras`.

Preenche esta matriz:

| ID | Recomendação | Origem | Benefício esperado | Custo ou esforço | Risco se for ignorada | Condição para adotar | Entra na entrega atual? | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REC-001 |  | `LT-001`, `LP-001`, `RESSALVA`, `SCORECARD` ou `FEEDBACK` |  | `BAIXO`, `MEDIO` ou `ALTO` |  |  | `NAO` | `GUARDAR_POS_PAP`, `DESCARTAR` ou `EXIGE_DECISAO_ORIENTADOR` |

Aplica estas regras:

- A coluna `Entra na entrega atual?` deve ficar `NAO`; este BK fecha a PAP, não abre nova entrega.
- Não prometas integração externa, serviço pago, nova arquitetura ou automação avançada sem decisão documental.
- Recomendações devem nascer de lições ou ressalvas, não de ideias soltas.
- Se uma recomendação for indispensável para a entrega atual, ela não pertence aqui: deve regressar ao estado do pacote como bloqueio ou ressalva.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de fecho e planeamento futuro, sem alteração de produto.

5. Explicação do código.

Não há código a explicar neste passo. A matriz impede que a retro vire novo backlog escondido. Uma recomendação futura deve explicar origem, benefício, custo, risco e condição de adoção.

6. Validação do passo.

A validação passa quando todas as recomendações têm origem, benefício, custo, risco e estado. Nenhuma recomendação pode contradizer o freeze final.

7. Cenário negativo/erro esperado.

Se a retro disser "na próxima versão vamos adicionar nova funcionalidade" sem origem, custo, risco e decisão, a validação falha. Reescreve como recomendação futura condicionada ou remove a linha.

### Passo 6 - Fechar retro final

1. Objetivo funcional do passo no contexto da app.

Emitir a decisão final da retro, consolidando contributos, lições, recomendações, ressalvas e estado de defesa.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - LOCALIZAÇÃO: secções `Resumo final da retro` e `Decisão final`

3. Instruções do que fazer.

Cria a secção `Resumo final da retro`.

Preenche esta tabela:

| Campo | Valor |
| --- | --- |
| Owners com contributo válido |  |
| Owners com contributo em falta |  |
| Lições técnicas validadas |  |
| Lições de processo validadas |  |
| Recomendações futuras registadas |  |
| Ressalvas herdadas do pacote |  |
| Riscos ainda a mencionar na defesa |  |
| Proof principal da retro | `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` |

Depois cria a secção `Decisão final`:

| Campo | Valor |
| --- | --- |
| Estado final da PAP | `FECHADA_PARA_DEFESA`, `FECHADA_COM_RESSALVAS` ou `NAO_FECHADA` |
| Motivo |  |
| Condição de defesa |  |
| Proof principal |  |
| Owner que confirma | `Nuno` |
| Data |  |

Aplica estas regras:

- Usa `FECHADA_PARA_DEFESA` apenas se o pacote estiver pronto e a retro tiver contributos, lições e recomendações com proof suficiente.
- Usa `FECHADA_COM_RESSALVAS` se existirem limitações aceites e descritas.
- Usa `NAO_FECHADA` se o pacote estiver bloqueado ou se faltar evidence central da retro.
- Escreve um parágrafo curto para cada ressalva que a defesa deve mencionar.
- Confirma que nenhuma linha da retro expõe dados pessoais, cookies, tokens, passwords ou logs sensíveis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental e de decisão final.

5. Explicação do código.

Não há código a explicar neste passo. A decisão final evita sucesso artificial: se existem ressalvas, elas ficam visíveis; se a PAP não pode ser fechada, o artefacto explica porquê.

6. Validação do passo.

A validação passa quando o estado final é coerente com o pacote, as ressalvas, os contributos e a existência de proof. `FECHADA_PARA_DEFESA` é inválido se houver pacote bloqueado ou retro sem contributos.

7. Cenário negativo/erro esperado.

Se a retro marcar `FECHADA_PARA_DEFESA` enquanto existe uma ressalva central sem explicação, a validação falha. Muda para `FECHADA_COM_RESSALVAS` e escreve o texto de defesa correspondente.

### Passo 7 - Arquivar fecho da PAP

1. Objetivo funcional do passo no contexto da app.

Fechar a cadeia `BK-MF8-10 -> FIM`, deixando claro que não existe BK seguinte e que a entrega está pronta para defesa, defesa com ressalvas ou bloqueio documentado.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`
    - REVER: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`
    - REVER: `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`
    - LOCALIZAÇÃO: secções `Arquivo final da PAP` e `Handoff para FIM`

3. Instruções do que fazer.

Cria a secção `Arquivo final da PAP`.

Preenche esta tabela:

| Item de arquivo | Caminho ou referência | Estado | Observação |
| --- | --- | --- | --- |
| Pacote final | `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md` | `ARQUIVADO`, `ARQUIVADO_COM_RESSALVA` ou `BLOQUEADO` |  |
| Freeze final | `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md` | `ARQUIVADO`, `ARQUIVADO_COM_RESSALVA` ou `BLOQUEADO` |  |
| Retro final | `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` | `ARQUIVADO`, `ARQUIVADO_COM_RESSALVA` ou `BLOQUEADO` |  |
| Scorecards | `docs/planificacao/sprints/SCORECARD-SPRINTS.md` | `REVISTO` ou `COM_RESSALVA` |  |
| Estado terminal | `FIM` | `FECHADO`, `FECHADO_COM_RESSALVAS` ou `NAO_FECHADO` |  |

Depois cria a secção `Handoff para FIM`:

| Campo | Valor |
| --- | --- |
| Existe BK seguinte? | `NAO` |
| Estado terminal | `FECHADO`, `FECHADO_COM_RESSALVAS` ou `NAO_FECHADO` |
| O que defender primeiro |  |
| Ressalvas a declarar |  |
| Evidence de abertura rápida |  |
| Ações futuras fora da entrega |  |
| Contacto/owner de fecho | `Nuno` |

Aplica estas regras:

- `FIM` não cria novo trabalho dentro da PAP; apenas arquiva estado e recomendações.
- Se o estado terminal for `NAO_FECHADO`, escreve o motivo e o critério de saída.
- Se existirem ações futuras, marca-as como pós-PAP e liga-as às recomendações do passo 5.
- Confirma que paths e nomes batem certo com o manifesto e o freeze.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é de arquivo documental e encerramento da cadeia de BKs.

5. Explicação do código.

Não há código a explicar neste passo. O arquivo final impede que a PAP termine com informação espalhada. O avaliador consegue abrir o pacote, a retro e o freeze e perceber o estado terminal sem pedir contexto adicional.

6. Validação do passo.

O handoff passa quando a tabela de arquivo e o handoff para `FIM` têm estado, proof e ressalvas coerentes. O campo `Existe BK seguinte?` deve ficar `NAO`.

7. Cenário negativo/erro esperado.

Se o arquivo final disser `FECHADO` mas a decisão final estiver `NAO_FECHADA`, a validação falha. Alinha o estado terminal com a decisão do passo 6.

#### Critérios de aceite

- `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` existe e tem `Entrada da retro`, `Contributos dos owners`, `Ausências de contributo`, `Lições técnicas`, `Lições de processo`, `Erros comuns a evitar em projetos futuros`, `Recomendações futuras`, `Resumo final da retro`, `Decisão final`, `Arquivo final da PAP` e `Handoff para FIM`.
- Cada contributo de owner tem área, proof, lição candidata e estado.
- Cada lição técnica tem evento, causa, impacto, decisão, proof e recomendação futura.
- Cada lição de processo tem sinal observado, consequência, ajuste ou prevenção e proof.
- Recomendações futuras têm origem, benefício, custo, risco, condição e estado.
- A decisão final usa apenas `FECHADA_PARA_DEFESA`, `FECHADA_COM_RESSALVAS` ou `NAO_FECHADA`.
- O arquivo final indica que não existe BK seguinte.
- A retro não reabre escopo, não apaga falhas reais e não expõe dados sensíveis.

#### Validação final

- Confirmar que `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` contém todas as secções listadas nos critérios de aceite.
- Rever contributos dos owners e confirmar que ausências estão registadas sem inventar opiniões.
- Confirmar que cada lição tem evento, causa, impacto, decisão, proof e melhoria.
- Cruzar estado final da retro com `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`.
- Confirmar que recomendações futuras não entram na entrega atual.
- Confirmar que prints, logs e notas citadas não expõem dados pessoais, cookies, tokens, passwords ou credenciais.
- Executar `bash scripts/validate-planificacao.sh` na raiz.
- Executar `git diff --check` na raiz.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md`.
- `neg`: retro sem contributos, lição sem proof, recomendação que reabre escopo ou arquivo incoerente bloqueia o fecho.
- `fonte`: `docs/evidence/MF8/EMPACOTAMENTO-FINAL-ENTREGA.md`, `docs/evidence/MF8/SCOPE-FREEZE-FINAL.md`, `docs/planificacao/sprints/SCORECARD-SPRINTS.md` e `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
- `decisao`: `FECHADA_PARA_DEFESA`, `FECHADA_COM_RESSALVAS` ou `NAO_FECHADA`.

#### Handoff

Este BK fecha a cadeia. O resultado deve ficar pronto para defesa, avaliação e arquivo da PAP.

- Entregar `docs/evidence/MF8/RETRO-FINAL-LICOES-APRENDIDAS.md` preenchido.
- Indicar estado final: `FECHADA_PARA_DEFESA`, `FECHADA_COM_RESSALVAS` ou `NAO_FECHADA`.
- Indicar ressalvas, contributos ausentes, lições principais e recomendações futuras.
- Indicar que `proximo_bk` é `FIM` e que não existe nova entrega dentro da PAP.
- Não apagar falhas históricas; atualizar estado, decisão e aprendizagem.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: passos 2 a 6 corrigidos com matrizes concretas para contributos, lições, recomendações, decisão final e arquivo.
