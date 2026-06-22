# BK-MF7-03 - Roteiro de demo final

## Header

- `doc_id`: `GUIA-BK-MF7-03`
- `bk_id`: `BK-MF7-03`
- `macro`: `MF7`
- `owner`: `Mateus`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF7-01`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-04`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-03-roteiro-de-demo-final.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais transformar a matriz de cobertura funcional num roteiro de demo final claro, realista e treinável.

O resultado observável é o ficheiro `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`, com história de utilizador, sequência de ecrãs, ações, dados preparados, provas a mostrar e negativos a demonstrar ou explicar.

#### Importância

Uma demo final não deve ser uma navegação improvisada. Ela precisa de contar a história do produto, provar requisitos importantes e mostrar que a equipa conhece limites, segurança e riscos.

Este BK cria uma narrativa técnica: visitante descobre conteúdos, utilizador autenticado interage, subscrição/pool solidária entram como domínio de negócio e admin valida operação. A demo passa a ter ritmo, responsáveis e evidence.

#### Scope-in

- Escolher a narrativa principal da demo final.
- Ligar passos da demo à matriz RF criada no `BK-MF7-01`.
- Identificar rotas, ecrãs, dados e contas necessárias.
- Preparar provas visuais e verbais para requisitos transversais.
- Registar negativos mínimos para BK P1.
- Preparar o ensaio técnico do `BK-MF7-04`.

#### Scope-out

- Criar novas funcionalidades para melhorar a demo.
- Alterar rotas ou componentes.
- Escrever dados falsos como se fossem outputs executados.
- Trocar requisitos por uma apresentação comercial.
- Esconder limitações conhecidas.

#### Estado antes e depois

- Estado antes: a matriz RF identifica o que deve ser provado, mas ainda não existe uma ordem de apresentação.
- Estado antes: a equipa tem rotas e funcionalidades implementadas em várias macrofases, mas a defesa precisa de uma narrativa coesa.
- Estado depois: existe um roteiro com início, percurso principal, provas, negativos e fallback.
- Estado depois: `BK-MF7-04` pode ensaiar a defesa com tempos e perguntas técnicas.

#### Pre-requisitos

- `BK-MF7-01` criado ou revisto.
- `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` disponível para consulta pela equipa.
- `docs/planificacao/backlogs/MF-VIEWS.md` consultado para a sequência da MF7.
- `frontend/src/routes/AppRoutes.jsx` revisto para confirmar rotas públicas e privadas existentes.
- Evidence MF6 revista para saber que provas técnicas não precisam de ser demonstradas integralmente durante a demo.

#### Glossário

- Demo final: apresentação guiada do produto com fluxo, dados e prova técnica.
- Narrativa: ordem lógica que explica por que cada ação aparece.
- Cena: bloco curto da demo com ecrã, ação, requisito e resultado.
- Fallback: alternativa controlada caso um serviço, dado ou ambiente falhe.
- Tempo-alvo: duração máxima de cada cena para manter a defesa focada.

#### Conceitos teóricos essenciais

- `CANONICO`: `BK-MF7-03` é transversal e entra no gate S12 como checklist de evidence.
- `CANONICO`: `MF-VIEWS.md` define a MF7 como fecho de matriz RF, matriz RNF, roteiro demo, ensaio e feedback.
- `DERIVADO`: a demo deve seguir uma história de produto, porque a matriz por si só não comunica valor ao júri.
- Uma demo técnica mostra produto e arquitetura ao mesmo tempo. O aluno deve saber dizer que rota, endpoint ou domínio está por trás de cada ação.
- Um negativo numa demo não é para "partir" a apresentação. É para mostrar que erros previsíveis são tratados e que a equipa entende segurança e validação.
- O roteiro deve ser repetível. Outro colega deve conseguir seguir o documento sem depender de memória informal.

#### Arquitetura do BK

| Área | Entrada | Saída |
| --- | --- | --- |
| Cobertura RF | `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` | Requisitos a mostrar |
| Rotas frontend | `frontend/src/routes/AppRoutes.jsx` | Sequência de ecrãs |
| Evidence técnica | `docs/evidence/MF6/` | Provas a anexar ou mencionar |
| Roteiro | `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` | Script da demo |
| Handoff | tempos, riscos e perguntas | Base para ensaio técnico |

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
- REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
- REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
- REVER: `frontend/src/routes/AppRoutes.jsx`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/evidence/MF6/GATE-S12-MF6.md`

#### Tutorial técnico linear

### Passo 1 - Escolher a narrativa da demo

1. Objetivo funcional do passo no contexto da app.

Definir uma história única que mostre o valor do FaithFlix sem saltar entre ecrãs sem ligação.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - LOCALIZAÇÃO: RF principais e sequência da MF7.

3. Instruções do que fazer.

Escolhe uma narrativa com quatro blocos: descoberta pública, conta autenticada, monetização solidária e operação/admin. Cada bloco deve referenciar RF concretos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a narrativa do roteiro.

5. Explicação do código.

Não há código porque este passo organiza comunicação técnica. A narrativa evita uma demo fragmentada e ajuda o aluno a explicar por que cada ecrã existe.

O aluno pode adaptar a ordem dos blocos se o orientador pedir, mas não deve remover provas P0 nem esconder lacunas marcadas nas matrizes.

6. Validação do passo.

Lê a narrativa em voz alta em 2 minutos. Deve ser possível perceber quem é o utilizador, que problema resolve e que prova será mostrada.

7. Cenário negativo/erro esperado.

Se a narrativa começar por admin sem explicar utilizador, catálogo ou subscrição, o júri pode não perceber o produto. Reordena para partir da experiência principal.

### Passo 2 - Mapear cenas, rotas e evidence

1. Objetivo funcional do passo no contexto da app.

Transformar a narrativa numa sequência de cenas executável.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
    - REVER: `frontend/src/routes/AppRoutes.jsx`
    - REVER: `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`
    - LOCALIZAÇÃO: tabela principal do roteiro.

3. Instruções do que fazer.

No roteiro, cria uma tabela com estas colunas:

| Coluna | Conteúdo esperado |
| --- | --- |
| Ordem | número da cena |
| Rota ou artefacto | ecrã, matriz ou evidence |
| Ação | o que a pessoa demonstra |
| RF/RNF provado | requisito ou área transversal |
| Resultado esperado | comportamento observável |
| Evidence | captura, output, matriz ou ficheiro |
| Tempo-alvo | duração máxima da cena |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O artefacto é o roteiro Markdown.

5. Explicação do código.

A tabela transforma a demo num plano executável. Cada linha força a equipa a saber a rota, o requisito e a prova associada.

Rotas como `/catalogo`, `/pesquisa`, `/para-si`, `/biblioteca`, `/planos`, `/associacoes`, `/conta` e `/admin/metricas` só devem entrar se estiverem prontas no ambiente usado para defesa.

6. Validação do passo.

Confirma que cada cena aponta para pelo menos um RF, RNF ou evidence de gate. Cenas sem requisito devem ser removidas ou fundidas.

7. Cenário negativo/erro esperado.

Se uma cena depender de conta admin e não houver credencial preparada, marca a cena como `PENDENTE` e cria fallback documental.

### Passo 3 - Preparar dados, contas e fallback

1. Objetivo funcional do passo no contexto da app.

Evitar que a demo falhe por falta de dados, permissões ou ambiente.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - LOCALIZAÇÃO: secções `Dados preparados`, `Contas`, `Fallback` e `Riscos`.

3. Instruções do que fazer.

Lista as contas necessárias por papel, os dados mínimos de catálogo, subscrição, biblioteca, pool e admin, e a alternativa caso algum serviço não esteja disponível no momento da defesa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a secção operacional do roteiro.

5. Explicação do código.

Preparar dados é parte da engenharia da demo. Uma funcionalidade pode estar correta e ainda assim falhar na defesa se faltar utilizador, conteúdo publicado ou sessão.

O fallback deve ser honesto: usar evidence guardada ou matriz de validação, não inventar sucesso ao vivo.

6. Validação do passo.

Antes do ensaio, confirma que cada cena tem dado de entrada, estado esperado e alternativa documentada.

7. Cenário negativo/erro esperado.

Se a demo depender de rede ou base de dados indisponível, usa evidence guardada e explica a limitação sem declarar execução ao vivo.

### Passo 4 - Registar negativos e tempos da demo

1. Objetivo funcional do passo no contexto da app.

Fechar o roteiro com controlo de tempo e cenários de erro demonstráveis.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`
    - REVER: `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`
    - LOCALIZAÇÃO: secções `Negativos`, `Tempo total` e `Handoff`.

3. Instruções do que fazer.

Regista pelo menos 3 negativos P1: rota desconhecida, ação autenticada sem sessão e operação admin sem papel correto. Define também tempo-alvo por cena e tempo total.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O output é a secção final do roteiro.

5. Explicação do código.

Negativos e tempos tornam a demo defensável. A equipa mostra que conhece falhas esperadas e mantém a apresentação dentro do tempo disponível.

O handoff para o ensaio deve incluir perguntas técnicas prováveis, cenas frágeis e evidence que precisa de estar aberta antes da defesa.

6. Validação do passo.

Executa um ensaio curto seguindo só a tabela. O roteiro está bom se a pessoa não precisar de improvisar ordem, rotas ou requisitos.

7. Cenário negativo/erro esperado.

Se a demo exceder o tempo-alvo, corta explicações repetidas e mantém apenas provas P0/P1 e uma ressalva clara.

#### Critérios de aceite

- O roteiro tem narrativa, cenas, rotas, ações, requisitos e evidence.
- Cada cena tem tempo-alvo e resultado esperado.
- Existem pelo menos 3 negativos P1.
- Dados, contas e fallback estão documentados.
- O roteiro distingue demonstração ao vivo de evidence guardada.
- `BK-MF7-04` recebe perguntas, riscos e tempos para ensaio.

#### Validação final

- Executar `bash scripts/validate-planificacao.sh` na raiz do projeto.
- Executar `git diff --check` na raiz do projeto.
- Fazer leitura cronometrada do roteiro.
- Confirmar que cada cena tem origem em matriz RF/RNF ou evidence.

#### Evidence para PR/defesa

- `pr`: referência da entrega onde `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` foi criado.
- `proof`: roteiro completo com cenas e tempos.
- `neg`: rota desconhecida, ação sem sessão e operação admin sem papel correto.
- `fonte`: `BK-MF7-01`, `BK-MF7-02`, `MF-VIEWS.md` e rotas frontend existentes.

#### Handoff

Este BK entrega o script da demo. `BK-MF7-04` deve ensaiar o roteiro, medir tempos, preparar respostas técnicas e transformar falhas encontradas em ações antes da avaliação final.

#### Changelog

- `2026-06-22`: guia reescrito para roteiro de demo final com narrativa, cenas, dados, fallback, negativos e handoff para ensaio.
