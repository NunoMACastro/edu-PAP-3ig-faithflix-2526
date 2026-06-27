# BK-MF8-03 - Roteiro de demo final

## Header

- `doc_id`: `GUIA-BK-MF8-03`
- `bk_id`: `BK-MF8-03`
- `macro`: `MF8`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-02`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-04`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-03-roteiro-de-demo-final.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais preparar o roteiro de demonstração final da FaithFlix. O roteiro deve indicar ordem, perfil usado, objetivo, proof esperado, fallback e tempo previsto para cada momento da apresentação.

#### Importância

Uma demo final não é improviso. Ela deve contar a história do produto, provar os RF/RNF principais e evitar bloqueios por falta de login, dados, tempo ou sequência.

#### Scope-in

- Ordenar o fluxo da demo por valor funcional.
- Definir perfil, página, ação, proof e tempo por bloco.
- Ligar cada bloco da demo às matrizes RF/RNF.
- Definir fallback honesto para falhas de ambiente.

#### Scope-out

- Criar nova funcionalidade para tornar a demo mais bonita.
- Esconder limitações conhecidas.
- Mostrar dados sensíveis ou credenciais reais.
- Depender de passos que não tenham evidence.

#### Estado antes e depois

- Estado antes: existem matrizes de RF/RNF com cobertura e ressalvas.
- Estado antes: a dependência `BK-MF8-02` tem de estar concluída, validada ou registada com ressalva.
- Estado depois: existe uma demo ensaiável, cronometrada e alinhada com a defesa técnica.
- Estado depois: o handoff para `BK-MF8-04` fica explícito no artefacto.

#### Pré-requisitos

- Ler `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Ler `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Confirmar que a evidence da dependência `BK-MF8-02` está disponível ou tem ressalva registada.
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

- `CANONICO`: a MF8 concentra demo, defesa e fecho.
- `DERIVADO`: cada bloco de demo precisa de tempo máximo para caber na apresentação PAP.
- Roteiro é uma sequência de prova, não uma lista de funcionalidades soltas.
- Fallback honesto permite continuar a defesa com screenshot, log ou evidence se o ambiente falhar.
- Dados de demonstração devem evitar dados pessoais reais.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Matrizes | `docs/evidence/MF8/MATRIZ-*.md` | Selecionam o que é demonstrável. |
| Rotas | `frontend/src/routes/AppRoutes.jsx` | Confirmam o caminho visível da demo. |
| Roteiro | `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` | Define ordem, tempo, perfil e proof. |
| Ensaio | `BK-MF8-04` | Vai testar o roteiro em condições semelhantes à defesa. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `frontend/src/routes/AppRoutes.jsx`

#### Tutorial técnico linear

### Passo 1 - Definir objetivos da demo

1. Objetivo funcional do passo no contexto da app.

Criar a estrutura base do roteiro final antes de escolher os blocos da demo.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Definir objetivos da demo"

3. Instruções do que fazer.

Confirma que `BK-MF8-02` existe ou tem ressalva explícita. Depois cria `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` com estas secções mínimas:

- `Estado de entrada`: decisão da matriz RF, decisão da matriz RNF e ressalvas herdadas da MF7.
- `Resumo da demo`: duração máxima, perfis necessários e decisão global.
- `Blocos da demo`: tabela principal do roteiro.
- `Fallbacks`: prova alternativa para falha de ambiente.
- `Leitura seca`: tempos medidos antes do ensaio técnico.
- `Handoff para BK-MF8-04`: dados que o ensaio deve consumir.

Na tabela `Blocos da demo`, usa esta estrutura:

| Ordem | Bloco | Perfil | Rota | Ação | Fonte RF/RNF | Proof | Negativo | Fallback | Tempo máximo | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| 1 | Abertura técnica | Visitante | `/` | Mostrar estado inicial da app | Matriz RF/RNF | Gate ou screenshot | Sem app acessível | Screenshot validado | 1 min | `ENTRA` |

Os estados permitidos são `ENTRA`, `ENTRA_COM_RESSALVA` e `FICA_FORA`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A entrada passa quando o ficheiro existe, tem as secções mínimas e a tabela contém as colunas obrigatórias.

7. Cenário negativo/erro esperado.

Se `BK-MF8-02` não tiver decisão nem ressalva, marca a decisão global do roteiro como `DEMO_BLOQUEADA` e não avances para seleção de blocos.

### Passo 2 - Selecionar blocos e perfis

1. Objetivo funcional do passo no contexto da app.

Escolher apenas blocos demonstráveis, ligados a perfis e rotas públicas existentes.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Selecionar blocos e perfis"

3. Instruções do que fazer.

Começa por confirmar as rotas em `frontend/src/routes/AppRoutes.jsx`. Depois preenche a tabela do roteiro com blocos candidatos, usando estes blocos orientadores:

| Ordem sugerida | Bloco | Perfil principal | Rotas públicas | Prova mínima |
| --- | --- | --- | --- | --- |
| 1 | Abertura e estado técnico | Visitante | `/` | Gate MF7 ou screenshot da home |
| 2 | Catálogo e detalhe | Visitante ou utilizador | `/catalogo`, `/catalogo/:idOrSlug` | Linha RF validada na matriz |
| 3 | Player e biblioteca | Utilizador autenticado | `/ver/:contentId`, `/biblioteca` | Evidence funcional ou ressalva |
| 4 | Pesquisa e recomendações | Utilizador autenticado | `/pesquisa`, `/para-si` | Matriz RF/RNF com decisão |
| 5 | Subscrição e área solidária | Utilizador ou associação | `/planos`, `/associacoes`, `/associacoes/candidatura` | Proof de UI ou evidence documental |
| 6 | Conta e administração | Utilizador ou admin | `/conta`, `/admin/catalogo`, `/admin/utilizadores`, `/admin/metricas` | Prova de autorização por perfil |
| 7 | Fecho técnico | Equipa | `docs/evidence/MF6/`, `docs/evidence/MF7/`, `docs/evidence/MF8/` | Lista de gates e ressalvas |

Para cada bloco, decide:

- `ENTRA`: a rota existe, a matriz RF/RNF tem decisão positiva e há proof repetível.
- `ENTRA_COM_RESSALVA`: a funcionalidade pode ser mostrada, mas a ressalva está escrita e tem fallback.
- `FICA_FORA`: falta rota, falta proof, há bloqueio de segurança, ou a matriz está pendente.

Não uses dados pessoais reais, credenciais reais, contas de terceiros ou exemplos que exponham informação sensível.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando todos os blocos escolhidos têm perfil, rota, fonte RF/RNF, proof, fallback, tempo e estado.

7. Cenário negativo/erro esperado.

Se um bloco exigir um perfil sem acesso preparado, marca esse bloco como `FICA_FORA` ou `ENTRA_COM_RESSALVA` com fallback documental.

### Passo 3 - Ordenar narrativa da apresentação

1. Objetivo funcional do passo no contexto da app.

Transformar os blocos escolhidos numa história de produto coerente para a defesa.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Ordenar narrativa da apresentação"

3. Instruções do que fazer.

Ordena a demo por narrativa, não por ordem técnica dos ficheiros. Usa esta sequência como base:

1. Problema e proposta: explicar rapidamente o que a FaithFlix resolve.
2. Exploração inicial: mostrar home, catálogo e detalhe.
3. Valor principal: mostrar visualização, biblioteca ou continuidade de utilização.
4. Descoberta: mostrar pesquisa ou recomendações se estiverem com proof.
5. Sustentabilidade do produto: mostrar planos, associações ou área solidária se tiverem estado demonstrável.
6. Confiança e controlo: mostrar conta, privacidade, autorização por perfil e administração.
7. Fecho técnico: mostrar evidence, gates, ressalvas e próximos passos.

Define uma duração alvo entre 12 e 15 minutos. Se a soma dos tempos passar o limite, move primeiro blocos `ENTRA_COM_RESSALVA` para anexo. Mantém no roteiro apenas blocos que ajudam a provar RF/RNF centrais.

No fim da secção, escreve uma frase de transição por bloco. Exemplo: "Depois de mostrar o catálogo, a demo passa para a experiência autenticada para provar continuidade de utilização."

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando outra pessoa consegue ler a sequência e perceber por que razão cada bloco vem antes do seguinte.

7. Cenário negativo/erro esperado.

Se a ordem saltar de uma área pública para uma área admin sem contexto, reordena ou acrescenta uma transição curta.

### Passo 4 - Definir proof e fallback

1. Objetivo funcional do passo no contexto da app.

Garantir que cada afirmação da demo tem prova principal e alternativa honesta.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Definir proof e fallback"

3. Instruções do que fazer.

Para cada linha da tabela, preenche `Proof`, `Negativo` e `Fallback` com conteúdo verificável:

- `Proof`: screenshot, log, comando, matriz, gate, rota funcional ou ficheiro de evidence.
- `Negativo`: condição que impede o bloco de entrar na demo.
- `Fallback`: forma honesta de continuar se o ambiente falhar, sem fingir que a app funcionou.

Usa estas regras:

- Se a rota falhar ao abrir, o fallback pode ser screenshot recente, log de validação ou linha da matriz com decisão.
- Se o login falhar, o fallback pode ser evidence autenticada já validada, mas a falha deve ser dita na defesa.
- Se o proof não existir, o bloco fica `FICA_FORA`.
- Se a falha revelar risco de segurança, o bloco fica fora da demo principal e passa para riscos residuais.
- Se o bloco depende de dados preparados, escreve exatamente que dados são necessários, sem incluir dados reais sensíveis.

Regista também onde cada proof está guardado. Exemplo: `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`, `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md` ou screenshot em `docs/evidence/MF8/`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando nenhum bloco `ENTRA` fica sem proof principal e fallback.

7. Cenário negativo/erro esperado.

Se um bloco tiver fallback que contradiz a matriz RF/RNF, corrige o estado para `FICA_FORA` e explica o motivo.

### Passo 5 - Cronometrar leitura seca

1. Objetivo funcional do passo no contexto da app.

Medir o roteiro sem abrir a aplicação para confirmar se cabe na defesa.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Cronometrar leitura seca"

3. Instruções do que fazer.

Cria uma secção `Leitura seca` com esta tabela:

| Bloco | Tempo previsto | Tempo real | Resultado | Ajuste |
| --- | ---: | ---: | --- | --- |
| Abertura e estado técnico | 1 min |  |  |  |

Lê o roteiro em voz alta como se estivesses na defesa. Mede cada bloco e aplica estas regras:

- Se um bloco ultrapassar o tempo previsto em mais de 30 segundos, encurta a fala ou move detalhe para anexo.
- Se dois blocos repetirem a mesma prova, mantém apenas o bloco com maior valor para RF/RNF.
- Se a demo ultrapassar 15 minutos, corta primeiro blocos `ENTRA_COM_RESSALVA`.
- Se um bloco exigir explicação longa para ser entendido, escreve uma transição mais simples.
- Se o bloco não puder ser demonstrado sem improviso, muda o estado para `FICA_FORA`.

No final da leitura seca, escreve o tempo total previsto e o tempo total real.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando o tempo total está dentro do limite definido e cada bloco tem ajuste registado ou confirmação de que não precisa de ajuste.

7. Cenário negativo/erro esperado.

Se a leitura seca ultrapassar o tempo máximo, o roteiro não está pronto para `BK-MF8-04`.

### Passo 6 - Fechar roteiro final

1. Objetivo funcional do passo no contexto da app.

Fechar a decisão final do roteiro antes do ensaio técnico.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Fechar roteiro final"

3. Instruções do que fazer.

No fim de `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`, adiciona um resumo com:

- Total de blocos `ENTRA`.
- Total de blocos `ENTRA_COM_RESSALVA`.
- Total de blocos `FICA_FORA`.
- Tempo total previsto.
- Perfis necessários para a defesa.
- Lista de dados de demonstração necessários.
- Riscos que passam para `BK-MF8-06`.
- Decisão final.

A decisão final só pode ser uma destas:

- `DEMO_PRONTA`: todos os blocos principais têm proof, fallback e tempo dentro do limite.
- `DEMO_PRONTA_COM_RESSALVAS`: a demo pode avançar, mas há ressalvas explícitas e controladas.
- `DEMO_BLOQUEADA`: falta proof essencial, rota essencial ou perfil essencial.

Antes de fechar, verifica esta checklist:

- Nenhum bloco usa dados sensíveis reais.
- Nenhum bloco promete funcionalidade sem proof.
- Nenhum bloco depende de rota inexistente.
- Todos os blocos têm fallback.
- A demo respeita a ordem RF/RNF e o handoff para `BK-MF8-04`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

A validação passa quando a decisão final é compatível com os estados dos blocos e com o tempo medido.

7. Cenário negativo/erro esperado.

Se existir um bloco essencial sem proof, a decisão final deve ser `DEMO_BLOQUEADA`.

### Passo 7 - Preparar handoff do ensaio

1. Objetivo funcional do passo no contexto da app.

Fechar a passagem de BK-MF8-03 para BK-MF8-04.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secção ligada a "Preparar handoff do ensaio"

3. Instruções do que fazer.

Escreve uma secção final chamada `Handoff para BK-MF8-04` com:

- Decisão final do roteiro.
- Lista ordenada dos blocos que entram no ensaio.
- Perfis e acessos necessários.
- Rotas que devem ser abertas no ensaio.
- Dados de demonstração a preparar.
- Proof principal de cada bloco.
- Fallback de cada bloco.
- Tempo previsto por bloco e tempo total.
- Perguntas técnicas prováveis para a defesa.
- Blockers, se existirem, com owner e critério de fecho.

O `BK-MF8-04` deve receber apenas blocos `ENTRA` ou `ENTRA_COM_RESSALVA`. Blocos `FICA_FORA` ficam registados para transparência, mas não entram no ensaio principal.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é documental, analítica ou de validação operacional; o resultado fica registado em `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` ou nos ficheiros revistos.

5. Explicação do código.

Não há código a explicar neste passo. A explicação relevante é a decisão de rastreabilidade: cada afirmação deve apontar para fonte, prova, owner e resultado observável. Isto evita fechar a MF8 com confiança falsa ou com passos que outra pessoa não consegue repetir.

6. Validação do passo.

O handoff passa quando outra pessoa consegue executar o ensaio sem explicação oral e sem pedir a lista de rotas, perfis ou proofs.

7. Cenário negativo/erro esperado.

Se o próximo BK precisar de dado em falta, declara blocker no handoff com owner, impacto e critério de fecho.

#### Critérios de aceite

- O roteiro tem abertura, fluxo principal, administração, monetização solidária, privacidade, UI segura e fecho.
- Cada bloco tem perfil, rota, ação, fonte RF/RNF, proof, negativo, fallback, tempo e estado.
- Há fallback definido para falha de ambiente.
- A demo não usa dados sensíveis reais.
- A decisão final é `DEMO_PRONTA`, `DEMO_PRONTA_COM_RESSALVAS` ou `DEMO_BLOQUEADA`.
- O handoff deixa rotas, perfis, proofs, tempos, dados necessários e perguntas prováveis para o ensaio.

#### Validação final

- Percorrer o roteiro em leitura seca sem abrir a app.
- Confirmar que cada rota existe na aplicação.
- Cruzar cada bloco com pelo menos uma linha RF/RNF validada.
- Confirmar que blocos sem proof ficam `FICA_FORA`.
- Confirmar que blocos com ressalva ficam marcados como `ENTRA_COM_RESSALVA`.
- Executar `git diff --check` após editar o ficheiro de evidence.

#### Evidence para PR/defesa

- `pr`: referência da entrega deste BK.
- `proof`: `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md`.
- `neg`: bloco sem rota, proof ou fallback não entra na demo.
- `fonte`: matrizes RF/RNF, rotas frontend e gates MF6/MF7/MF8.

#### Handoff

O BK-MF8-04 deve usar o roteiro como guião obrigatório do ensaio técnico.

- Entregar `docs/evidence/MF8/ROTEIRO-DEMO-FINAL.md` preenchido.
- Entregar lista final de blocos, perfis, rotas, proofs, fallbacks e tempos.
- Registar blockers com owner, impacto e critério de fecho.
- Não apagar falhas históricas; atualizar estado e decisão.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganização documental MF7/MF8.
- `2026-06-26`: guia revisto com passos executáveis, critérios objetivos, negativos e handoff específico.
- `2026-06-26`: roteiro corrigido para remover instruções genéricas e acrescentar modelo concreto de demo, perfis, rotas, proof, fallback e tempo.
