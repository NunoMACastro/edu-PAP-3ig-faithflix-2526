# Auditoria de hidratação - MF7 FaithFlix

## Execução atual - auditoria apenas de `BK-MF7-03`

- Data: 2026-06-22
- Modo: `auditar_apenas`
- Escopo efetivo: `docs/planificacao/guias-bk/MF7/BK-MF7-03-roteiro-de-demo-final.md`
- BKs lidos para coerência de MF: `BK-MF7-01`, `BK-MF7-02`, `BK-MF7-04`, `BK-MF7-05`, `BK-MF6-06` e handoff para `BK-MF8-01`
- Output: atualização deste relatório e resumo executivo
- Política de caminhos nos BKs: apenas caminhos públicos de aluno; sem referências a `real_dev`
- BKs editados nesta execução: 0

### Documentos consultados nesta execução

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-03-roteiro-de-demo-final.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-04-ensaio-tecnico-da-defesa.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-05-avaliacao-final-e-feedback-orientador.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-lista-de-riscos-residuais.md`
- `docs/evidence/MF6/GATE-S12-MF6.md`
- `frontend/src/routes/AppRoutes.jsx`
- `real_dev/frontend/src/routes/AppRoutes.jsx`, apenas como validação interna de equivalência técnica

### Resumo executivo da execução atual

`BK-MF7-03` foi auditado em modo read-only e está `OK` no estado atual do workspace. O guia segue a estrutura pedagógica exigida, é corretamente documental e orienta a criação de `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` com narrativa, cenas, rotas, ações, requisitos, evidence, tempos, dados preparados, contas, fallback e negativos.

O BK não cria funcionalidades, rotas, componentes ou dados fictícios. Esta restrição está correta para a MF7: o objetivo é transformar a matriz RF e a matriz RNF num roteiro de defesa repetível, sem mascarar limitações nem declarar execução ao vivo quando só houver evidence guardada.

A coerência documental está preservada:

- `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MATRIZ-CANONICA-BK.md` confirmam `BK-MF7-03` como `P1`, owner `Mateus`, apoio `Kaue`, dependência `BK-MF7-01` e cobertura `transversal`.
- `MF-VIEWS.md` confirma a sequência `BK-MF7-01` -> `BK-MF7-02` -> `BK-MF7-03` -> `BK-MF7-04` -> `BK-MF7-05`.
- `PLANO-SPRINTS.md` coloca `BK-MF7-03..05` na Sprint 12, juntamente com o buffer/fecho de MF8.
- `frontend/src/routes/AppRoutes.jsx` confirma as rotas usadas como cenas potenciais da demo: `/catalogo`, `/pesquisa`, `/para-si`, `/biblioteca`, `/planos`, `/associacoes`, `/conta` e `/admin/metricas`.
- `real_dev/frontend/src/routes/AppRoutes.jsx` espelha a mesma árvore de rotas, validando internamente que o guia não referencia ecrãs inexistentes.
- `GATE-S12-MF6.md` mantém decisão `GO_COM_RESSALVAS`; por isso o roteiro deve preservar fallback, evidence guardada e linguagem honesta sobre limites técnicos.

### Classificação da execução atual

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

| BK | Antes | Depois | Ação nesta execução |
| --- | --- | --- | --- |
| `BK-MF7-03` | OK | OK | Auditado apenas; sem edição do BK |

### Resultado por critérios obrigatórios

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Estrutura obrigatória | PASS | O BK contém as secções `#### Objetivo` até `#### Changelog` na ordem esperada. |
| Passos técnicos 1..7 | PASS | Os 4 passos têm objetivo, ficheiros envolvidos, instruções, código/sem código, explicação, validação e cenário negativo. |
| Código completo | NAO_APLICAVEL | O BK é documental; cada passo declara `Sem código neste passo.` com justificação. |
| Coerência de demo e rotas | PASS | As rotas sugeridas no guia existem em `frontend/src/routes/AppRoutes.jsx` e no espelho técnico interno. |
| Dados, contas e fallback | PASS_COM_RISCO | O BK exige preparação operacional e fallback honesto; a criação real dos dados fica para a execução pedagógica do BK. |
| Negativos P1 | PASS | O guia exige pelo menos rota desconhecida, ação autenticada sem sessão e operação admin sem papel correto. |
| Caminhos públicos | PASS | O BK usa caminhos públicos `docs/...`, `frontend/...` e evidence; não publica caminhos internos. |
| Handoff | PASS | `BK-MF7-04` consome o roteiro, tempos, riscos e perguntas técnicas para o ensaio. |
| Linguagem interna proibida | PASS | Pesquisa obrigatória sem ocorrências reais no BK alvo. |

### Findings da execução atual

Não foram confirmados findings `CRITICO`, `PARCIAL`, `P0`, `P1`, `P2` ou `P3` em `BK-MF7-03`.

Notas de auditoria:

- O roteiro deve continuar a distinguir demonstração ao vivo de evidence guardada, sobretudo quando a base de dados, sessão ou serviços externos não estiverem disponíveis durante a defesa.
- O gate MF6 está em `GO_COM_RESSALVAS`; `BK-MF7-03` trata corretamente essa nuance ao exigir fallback e não permitir sucesso inventado.
- `BK-MF7-02` fornece a matriz RNF como fonte de ressalvas para a demo, embora a dependência canónica direta de `BK-MF7-03` seja `BK-MF7-01`.

### Mapa de integração da execução atual

| BK auditado | Ficheiros criados pelo guia | Ficheiros editados pelo guia | Exports | Imports consumidos | Endpoints | DTOs/validators | Schemas/models | Services | Componentes/páginas | IA | Segurança/autorização | Testes/evidence | BKs seguintes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF7-03` | `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` | nenhum código | não aplicável | `MATRIZ-RF-EVIDENCIA`, `MATRIZ-RNF-VALIDACAO`, `MF-VIEWS`, `AppRoutes`, evidence MF6 | nenhum endpoint novo | nenhum | nenhum | nenhum | usa rotas frontend existentes como cenas de demo | nenhuma nova; explicabilidade só por evidence/matriz | negativos de sessão, permissão, admin e rota desconhecida; fallback sem esconder limites | roteiro, tempos, fallback, leitura cronometrada, `git diff --check`, `validate-planificacao` | `BK-MF7-04`, `BK-MF7-05` |

### Decisões confirmadas

- `CANONICO`: `BK-MF7-03` é transversal e entra no gate S12 como checklist de evidence.
- `CANONICO`: `BK-MF7-03` depende de `BK-MF7-01`, tem `proximo_bk` `BK-MF7-04` e pertence à Sprint 12.
- `CANONICO`: `BK-MF7-04` deve ensaiar o roteiro produzido neste BK e transformar falhas em ações antes da avaliação final.
- `DERIVADO`: organizar a demo em quatro blocos, descoberta pública, conta autenticada, monetização solidária e operação/admin, é compatível com o domínio FaithFlix e com as rotas existentes.
- `DERIVADO`: usar evidence guardada quando o ambiente falhar é aceitável desde que o roteiro não declare execução ao vivo falsa.

### Drift documental encontrado

- Sem drift bloqueante no BK alvo.
- Risco não bloqueante: a demo ao vivo depende de dados, contas, sessão e ambiente preparados; o BK mitiga isto ao exigir fallback documental.
- Drift histórico/não bloqueante: relatório MF6 com nota antiga sobre formato de MF7; o conteúdo atual de `BK-MF7-03` já está hidratado e não corresponde a essa nota.

### Verificações executadas nesta execução

| Verificação | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibida em `docs/planificacao/guias-bk/MF7/*.md` | PASS, sem ocorrências |
| Pesquisa de caminhos internos em `docs/planificacao/guias-bk/MF7/*.md` | PASS, sem ocorrências |
| Pesquisa de drift de outras PAPs em `docs/planificacao/guias-bk/MF7/*.md` | PASS_COM_FALSOS_POSITIVOS; apenas `IVA` dentro de `DERIVADO` |
| Pesquisa focada no BK alvo para placeholders, caminhos internos, storage/token e claims indevidos | PASS, sem ocorrências |
| `git diff --check` | PASS, sem output |
| `bash scripts/validate-planificacao.sh` | PASS |

Output do validador:

```json
{
  "project": "faithflix",
  "status": "PASS",
  "checked_bks": 55,
  "checked_guides": 55,
  "errors": []
}
```

### Riscos e TODOs restantes da execução atual

- A criação real de `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` fica para a execução pedagógica do BK pelos alunos/equipa.
- Antes da defesa, a equipa deve confirmar dados mínimos, contas por papel, estado da sessão e evidence aberta para cada cena.
- Se houver falha de serviço, rede ou base de dados, o roteiro deve usar evidence guardada e declarar a limitação sem transformar fallback em sucesso ao vivo.
- Sem TODO blocker no texto atual de `BK-MF7-03`.

## Execução anterior - auditoria apenas de `BK-MF7-02`

- Data: 2026-06-22
- Modo: `auditar_apenas`
- Escopo efetivo: `docs/planificacao/guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md`
- BKs lidos para coerência de MF: `BK-MF6-06`, `BK-MF7-01`, `BK-MF7-03`, `BK-MF7-05` e handoff para `BK-MF8-01`
- Output: atualização deste relatório e resumo executivo
- Política de caminhos nos BKs: apenas caminhos públicos de aluno; sem referências a `real_dev`
- BKs editados nesta execução: 0

### Documentos consultados nesta execução

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- BKs MF0 a MF8 relevantes para dependências, estrutura e handoff
- Relatórios `AUDITORIA-HIDRATACAO-MF3.md`, `AUDITORIA-HIDRATACAO-MF4.md`, `AUDITORIA-HIDRATACAO-MF5.md`, `AUDITORIA-HIDRATACAO-MF6.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` e `IMPLEMENTACAO-REAL_DEV-MF6.md`
- Evidence MF6 em `docs/evidence/MF6/`
- `backend/package.json`, `frontend/package.json`, `real_dev/backend/package.json` e `real_dev/frontend/package.json` para confirmar scripts reais e equivalência de validação
- Estrutura consolidada em `real_dev/backend` e `real_dev/frontend`, apenas como validação interna do estado técnico anterior à MF7

### Resumo executivo da execução atual

`BK-MF7-02` foi auditado em modo read-only e está `OK` no estado atual do workspace. O guia segue a estrutura pedagógica exigida, valida exatamente os 13 RNF atribuídos a `BK-MF7-02`, não cria código de produto, não troca stack, não inventa fornecedores externos e orienta a criação de `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`.

O ponto mais importante desta auditoria é a forma como o BK trata RNF ambiciosos ou dependentes de operação real. `docs/RNF.md` inclui requisitos como HLS/DASH (`RNF23`), gateway internacional de pagamento (`RNF24`), rollback (`RNF32`) e i18n futuro (`RNF39`). O BK não promete maturidade de produção sem prova: manda classificar cada linha como `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` ou `FALHA`, e obriga a justificar evidence, negativo e decisão.

A coerência documental está preservada:

- `docs/RNF.md` confirma `RNF21`, `RNF22`, `RNF23`, `RNF24`, `RNF25`, `RNF26`, `RNF32`, `RNF33`, `RNF35`, `RNF36`, `RNF38`, `RNF39` e `RNF40`.
- `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MATRIZ-CANONICA-BK.md` confirmam `BK-MF7-02` como `P0`, owner `Davi`, dependência `BK-MF6-06` e cobertura desses 13 RNF.
- `GATE-S12-MF6.md` entrega evidence técnica em `GO_COM_RESSALVAS`, com `PASS` nos comandos essenciais e riscos residuais assumidos.
- `BK-MF6-06` e `docs/evidence/MF6/` confirmam que `BK-MF7-02` deve reutilizar regressão frontend, hardening, performance, UX e gate como evidence de entrada.
- `BK-MF7-03` consome a matriz RNF na preparação da demo; `BK-MF7-05` depende de `BK-MF7-02` para avaliação final.

### Classificação da execução atual

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

| BK | Antes | Depois | Ação nesta execução |
| --- | --- | --- | --- |
| `BK-MF7-02` | OK | OK | Auditado apenas; sem edição do BK |

### Resultado por critérios obrigatórios

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Estrutura obrigatória | PASS | O BK contém as secções `#### Objetivo` até `#### Changelog` na ordem esperada. |
| Passos técnicos 1..7 | PASS | Os 4 passos têm objetivo, ficheiros envolvidos, instruções, código/sem código, explicação, validação e cenário negativo. |
| Código completo | NAO_APLICAVEL | O BK é documental; cada passo declara `Sem código neste passo.` com justificação. |
| Cobertura RNF | PASS | Lista contém exatamente os 13 RNF atribuídos a `BK-MF7-02` na matriz canónica. |
| HLS/DASH, gateway, rollback e i18n | PASS_COM_RISCO | O BK manda tratar por evidence/ressalva/pendência, sem declarar produção sem prova. |
| Caminhos públicos | PASS | O BK usa `docs/...`, `backend/` e `frontend/`; não publica caminhos internos. |
| Coerência com scripts | PASS | `backend/package.json` e `frontend/package.json` existem e coincidem com as raízes internas validadas. |
| Handoff | PASS | `BK-MF7-03` consome a matriz RNF para demo e `BK-MF7-05` depende de `BK-MF7-02`. |
| Linguagem interna proibida | PASS | Pesquisa obrigatória sem ocorrências reais no BK alvo. |

### Findings da execução atual

Não foram confirmados findings `CRITICO`, `PARCIAL`, `P0`, `P1`, `P2` ou `P3` em `BK-MF7-02`.

Notas de auditoria:

- A tensão entre `docs/RNF.md` e a maturidade real da PAP é esperada e está bem tratada no guia: requisitos operacionais amplos devem ficar `VALIDADO_COM_RESSALVA`, `PENDENTE` ou `FALHA` quando não houver proof real.
- O gate MF6 está em `GO_COM_RESSALVAS`; `BK-MF7-02` deve herdar essa nuance quando reutilizar evidence MF6.
- `AUDITORIA-HIDRATACAO-MF6.md` ainda contém uma nota histórica dizendo que `BK-MF7-01` e `BK-MF7-02` estavam no formato antigo. Essa observação está desatualizada pelo conteúdo atual dos BKs MF7 e não é blocker atual.

### Mapa de integração da execução atual

| BK auditado | Ficheiros criados pelo guia | Ficheiros editados pelo guia | Exports | Imports consumidos | Endpoints | DTOs/validators | Schemas/models | Services | Componentes/páginas | IA | Segurança/autorização | Testes/evidence | BKs seguintes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF7-02` | `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` | nenhum código | não aplicável | `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `GATE-S12-MF6.md`, evidence MF6, scripts backend/frontend | nenhum | nenhum | nenhum | nenhum | nenhum | valida recomendação baseline/ética por evidence e ressalvas, sem IA generativa | ressalvas de compatibilidade, API, operação, localização, segurança e privacidade herdadas da MF6 | matriz RNF, negativos P0, `git diff --check`, `validate-planificacao` | `BK-MF7-03`, `BK-MF7-05`, `BK-MF8-01` |

### Decisões confirmadas

- `CANONICO`: `BK-MF7-02` cobre os 13 RNF listados no header e na matriz canónica.
- `CANONICO`: `BK-MF7-02` depende de `BK-MF6-06`.
- `CANONICO`: `BK-MF7-03` usa a matriz RNF para demo e `BK-MF7-05` depende de `BK-MF7-02`.
- `CANONICO`: `RNF21..RNF26`, `RNF32`, `RNF33`, `RNF35`, `RNF36`, `RNF38..RNF40` continuam ativos como contrato de qualidade.
- `DERIVADO`: classificar RNF operacionais por `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` ou `FALHA` é a forma segura de evitar sucesso antecipado.

### Drift documental encontrado

- Sem drift bloqueante no BK alvo.
- Drift/tensão não bloqueante: `docs/RNF.md` descreve capacidades de produção ou operação futura, enquanto a app PAP valida parte delas por MVP local, evidence técnica e ressalvas. O BK trata esta tensão corretamente.
- Drift histórico/não bloqueante: relatório MF6 com nota antiga sobre formato de MF7; o conteúdo atual de `BK-MF7-02` já não corresponde a essa nota.

### Verificações executadas nesta execução

| Verificação | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibida em `docs/planificacao/guias-bk/MF7/*.md` | PASS, sem ocorrências |
| Pesquisa de caminhos internos em `docs/planificacao/guias-bk/MF7/*.md` | PASS, sem ocorrências |
| Pesquisa de drift de outras PAPs em `docs/planificacao/guias-bk/MF7/*.md` | PASS_COM_FALSOS_POSITIVOS; apenas `IVA` dentro de `DERIVADO` |
| Pesquisa focada no BK alvo para placeholders, caminhos internos, storage/token e claims indevidos | PASS, sem ocorrências |
| `git diff --check` | PASS, sem output |
| `bash scripts/validate-planificacao.sh` | PASS |

Output do validador:

```json
{
  "project": "faithflix",
  "status": "PASS",
  "checked_bks": 55,
  "checked_guides": 55,
  "errors": []
}
```

### Riscos e TODOs restantes da execução atual

- A criação real de `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` fica para a execução pedagógica do BK pelos alunos/equipa.
- RNF dependentes de operação externa ou infraestrutura real devem ficar com ressalva/pendência se não houver proof: especialmente `RNF23`, `RNF24`, `RNF32`, `RNF36` e `RNF39`.
- A matriz RNF deve herdar a ressalva da MF6: validação humana formal do orientador ainda deve confirmar o `GO_COM_RESSALVAS`.
- Sem TODO blocker no texto atual de `BK-MF7-02`.

## Execução anterior - auditoria apenas de `BK-MF7-01`

- Data: 2026-06-22
- Modo: `auditar_apenas`
- Escopo efetivo: `docs/planificacao/guias-bk/MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md`
- BKs lidos para coerência de MF: `BK-MF6-06`, `BK-MF7-02`, `BK-MF7-03`, `BK-MF7-04`, `BK-MF7-05` e handoff para `BK-MF8-01`
- Output: atualização deste relatório e resumo executivo
- Política de caminhos nos BKs: apenas caminhos públicos de aluno; sem referências a `real_dev`
- BKs editados nesta execução: 0

### Documentos consultados nesta execução

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- BKs MF0 a MF8 relevantes para dependências, estrutura e handoff
- Relatórios `AUDITORIA-HIDRATACAO-MF3.md`, `AUDITORIA-HIDRATACAO-MF4.md`, `AUDITORIA-HIDRATACAO-MF5.md`, `AUDITORIA-HIDRATACAO-MF6.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` e `IMPLEMENTACAO-REAL_DEV-MF6.md`
- Evidence MF6 em `docs/evidence/MF6/`
- Estrutura consolidada em `real_dev/backend` e `real_dev/frontend`, apenas como validação interna do estado técnico anterior à MF7

### Resumo executivo da execução atual

`BK-MF7-01` foi auditado em modo read-only e está `OK` no estado atual do workspace. O guia já segue a estrutura pedagógica exigida, tem objetivo, importância, scope-in/out, estado antes/depois, pré-requisitos, glossário, conceitos teóricos, arquitetura, ficheiros a criar/rever, tutorial técnico linear com passos 1..7, critérios de aceite, validação final, evidence e handoff.

O BK não implementa código de produto e isso é correto para a MF7: o output esperado é `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`, uma matriz documental que liga RF ativos a BK responsável, evidence, proof, negativos, estado e observação. A auditoria confirmou que o guia não inventa endpoints, modelos, dependências, gateways, CDN, DRM, IA generativa, RAG ou providers externos.

A coerência documental está preservada:

- `docs/RF.md` confirma os RF ativos como `RF01..RF28`, `RF35..RF48`, `RF52..RF60`.
- `PLANO-IMPLEMENTACAO-TOTAL.md` confirma `MF7` como fase de evidências PAP e gate S12 com `91/91` requisitos e `55/55` BK.
- `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MATRIZ-CANONICA-BK.md` confirmam `BK-MF7-01` como `P0`, owner `Kaue`, dependência `BK-MF6-06` e cobertura `RF_ATIVOS_MVP`.
- `GATE-S12-MF6.md` confirma que a MF6 entrega evidence real com decisão técnica `GO_COM_RESSALVAS`.
- A ressalva principal para `BK-MF7-01` é consumir a decisão `GO_COM_RESSALVAS` com honestidade, sem transformar a validação humana formal pendente da MF6 em `GO` absoluto.

### Classificação da execução atual

| Estado | Antes | Depois |
| --- | ---: | ---: |
| OK | 1 | 1 |
| PARCIAL | 0 | 0 |
| CRITICO | 0 | 0 |

| BK | Antes | Depois | Ação nesta execução |
| --- | --- | --- | --- |
| `BK-MF7-01` | OK | OK | Auditado apenas; sem edição do BK |

### Resultado por critérios obrigatórios

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Estrutura obrigatória | PASS | O BK contém as secções `#### Objetivo` até `#### Changelog` na ordem esperada. |
| Passos técnicos 1..7 | PASS | Os 4 passos têm objetivo, ficheiros envolvidos, instruções, código/sem código, explicação, validação e cenário negativo. |
| Código completo | NAO_APLICAVEL | O BK é documental; cada passo declara `Sem código neste passo.` com justificação. |
| Caminhos públicos | PASS | O BK usa `docs/...`, `backend/`/`frontend/` apenas quando aplicável e não publica caminhos internos. |
| Coerência RF | PASS | Lista ativa alinhada com `docs/RF.md`: `RF01..RF28`, `RF35..RF48`, `RF52..RF60`. |
| Coerência com matriz/backlog | PASS | `BK-MF7-01` é `P0`, depende de `BK-MF6-06` e cobre `RF_ATIVOS_MVP`. |
| Handoff | PASS_COM_RISCO | Handoff para `BK-MF7-02` está correto; risco residual é a confirmação humana formal do gate MF6. |
| Linguagem interna proibida | PASS | Pesquisa obrigatória sem ocorrências reais no BK alvo. |

### Findings da execução atual

Não foram confirmados findings `CRITICO`, `PARCIAL`, `P0`, `P1`, `P2` ou `P3` em `BK-MF7-01`.

Notas de auditoria:

- `AUDITORIA-HIDRATACAO-MF6.md` ainda contém uma nota histórica dizendo que `BK-MF7-01` e `BK-MF7-02` estavam no formato antigo. Essa observação ficou desatualizada pelo conteúdo atual dos BKs MF7 no workspace e não é blocker atual.
- A decisão técnica da MF6 é `GO_COM_RESSALVAS`, não `GO` sem ressalvas. O BK alvo trata evidence e ressalvas de forma compatível com esse estado.

### Mapa de integração da execução atual

| BK auditado | Ficheiros criados pelo guia | Ficheiros editados pelo guia | Exports | Imports consumidos | Endpoints | DTOs/validators | Schemas/models | Services | Componentes/páginas | IA | Segurança/autorização | Testes/evidence | BKs seguintes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF7-01` | `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` | nenhum código | não aplicável | `docs/RF.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, evidence MF6 e BKs anteriores | nenhum | nenhum | nenhum | nenhum | nenhum | nenhuma nova; apenas rastreabilidade de recomendações baseline já documentadas | validação documental de proof, negativos e ownership por RF | matriz RF, revisão manual, `git diff --check`, `validate-planificacao` | `BK-MF7-02`, `BK-MF7-03`, `BK-MF7-05` |

### Decisões confirmadas

- `CANONICO`: `MF7` é uma fase de evidências PAP, matriz RF/RNF, demo e ensaio; não altera código de produto.
- `CANONICO`: `BK-MF7-01` cobre `RF_ATIVOS_MVP` e depende de `BK-MF6-06`.
- `CANONICO`: os RF ativos do MVP são `RF01..RF28`, `RF35..RF48`, `RF52..RF60`.
- `CANONICO`: `BK-MF6-06` entrega o gate S12 e handoff para `BK-MF7-01`.
- `DERIVADO`: os estados `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` e `FALHA` são adequados para impedir evidence sem proof.

### Drift documental encontrado

- Sem drift bloqueante no BK alvo.
- Drift histórico/não bloqueante: relatório MF6 com nota antiga sobre formato de MF7; o conteúdo atual dos BKs MF7 já não corresponde a essa nota.
- Risco de interpretação: `GO_COM_RESSALVAS` da MF6 deve continuar explicitado na matriz RF quando for usada como evidence de entrada.

### Verificações executadas nesta execução

| Verificação | Resultado |
| --- | --- |
| Pesquisa de linguagem interna/proibida em `docs/planificacao/guias-bk/MF7/*.md` | PASS, sem ocorrências |
| Pesquisa de caminhos internos em `docs/planificacao/guias-bk/MF7/*.md` | PASS, sem ocorrências |
| Pesquisa de drift de outras PAPs em `docs/planificacao/guias-bk/MF7/*.md` | PASS_COM_FALSOS_POSITIVOS; apenas `IVA` dentro de `DERIVADO` |
| Pesquisa focada no BK alvo para placeholders, caminhos internos, storage/token e claims indevidos | PASS, sem ocorrências |
| `git diff --check` | PASS, sem output |
| `bash scripts/validate-planificacao.sh` | PASS |

Output do validador:

```json
{
  "project": "faithflix",
  "status": "PASS",
  "checked_bks": 55,
  "checked_guides": 55,
  "errors": []
}
```

### Riscos e TODOs restantes da execução atual

- A criação real de `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` fica para a execução pedagógica do BK pelos alunos/equipa.
- A matriz RF deve herdar a ressalva da MF6: validação humana formal do orientador ainda deve confirmar o `GO_COM_RESSALVAS`.
- Sem TODO blocker no texto atual de `BK-MF7-01`.

## Histórico preservado - hidratação anterior da MF7

- Data: 2026-06-22
- Modo: `hidratar_corrigir`
- Escopo: todos os BKs em `docs/planificacao/guias-bk/MF7/`
- Output: relatório e resumo executivo
- Política de caminhos nos BKs: apenas caminhos públicos de aluno

## Documentos consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- BKs MF0 a MF8 relevantes para dependências e handoff
- Relatórios `AUDITORIA-HIDRATACAO-MF3.md`, `AUDITORIA-HIDRATACAO-MF4.md`, `AUDITORIA-HIDRATACAO-MF5.md` e `AUDITORIA-HIDRATACAO-MF6.md`
- Evidence MF6 em `docs/evidence/MF6/`
- Estrutura consolidada em `real_dev/backend` e `real_dev/frontend`, apenas para confirmar estado técnico anterior à MF7

## Resumo executivo

Os cinco BKs da MF7 estavam em formato genérico herdado, com `Bloco pedagogico`, `Bloco operacional` e pseudo-checklist. A estrutura não cumpria a prompt atual: faltavam `#### Objetivo`, `#### Importância`, `Scope-in`, `Scope-out`, `Estado antes e depois`, `Glossário`, `Conceitos teóricos essenciais`, `Arquitetura do BK`, `Ficheiros a criar/editar/rever`, tutorial técnico linear com passos 1..7, negativos concretos, critérios de aceite mensuráveis e handoff operacional.

Classificação inicial:

| Estado | Contagem |
| --- | ---: |
| OK | 0 |
| PARCIAL | 0 |
| CRITICO | 5 |

Classificação após correção:

| Estado | Contagem |
| --- | ---: |
| OK | 5 |
| PARCIAL | 0 |
| CRITICO | 0 |

## Findings

### MF7-F01 - Guias MF7 estavam genéricos e não executáveis

- Severidade: P0
- Estado final: CORRIGIDO
- BKs afetados: `BK-MF7-01` a `BK-MF7-05`
- Evidência observada: todos tinham 185 linhas, estrutura antiga e bloco técnico abstrato.
- Expected: guias autocontidos, lineares e alinhados com a estrutura exigida pela prompt.
- Impacto pedagógico: o aluno teria de inventar artefactos, tabelas, negativos e critérios de fecho.
- Correção: os cinco BKs foram reescritos com estrutura completa e passos executáveis.
- Validação: pesquisas textuais, `git diff --check` e `bash scripts/validate-planificacao.sh`.

### MF7-F02 - Faltavam artefactos concretos de evidence da MF7

- Severidade: P1
- Estado final: CORRIGIDO
- BKs afetados: todos os BKs MF7
- Evidência observada: os guias falavam em `pr/proof/neg`, mas não nomeavam ficheiros finais nem colunas obrigatórias.
- Expected: cada BK deve dizer que ficheiro criar, que secções preencher e que negativos provar.
- Correção:
  - `BK-MF7-01`: define `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md`.
  - `BK-MF7-02`: define `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md`.
  - `BK-MF7-03`: define `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md`.
  - `BK-MF7-04`: define `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md`.
  - `BK-MF7-05`: define `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`.

### MF7-F03 - Handoff MF7 -> MF8 não estava operacional

- Severidade: P1
- Estado final: CORRIGIDO
- BKs afetados: `BK-MF7-05`
- Expected: `BK-MF8-01` deve receber riscos residuais, bloqueios e decisões aceites.
- Correção: o guia final separa riscos residuais de bloqueios e cria handoff direto para `BK-MF8-01`.

## Classificação por BK

| BK | Antes | Depois | Ação |
| --- | --- | --- | --- |
| `BK-MF7-01` | CRITICO | OK | Reescrito para matriz RF -> evidence |
| `BK-MF7-02` | CRITICO | OK | Reescrito para matriz RNF -> validação |
| `BK-MF7-03` | CRITICO | OK | Reescrito para roteiro de demo final |
| `BK-MF7-04` | CRITICO | OK | Reescrito para ensaio técnico da defesa |
| `BK-MF7-05` | CRITICO | OK | Reescrito para avaliação final e feedback |

## Mapa de integração da MF

| BK editado | Ficheiros criados pelo guia | Ficheiros editados pelo guia | Exports | Imports consumidos | Endpoints | DTOs/validators | Schemas/models | Services | Componentes/páginas | IA | Segurança/autorização | Testes/evidence | BKs seguintes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF7-01` | `docs/evidence/MF7/MATRIZ-RF-EVIDENCIA.md` | nenhum código | não aplicável | RF, backlog, matriz canónica e evidence MF6 | nenhum | nenhum | nenhum | nenhum | nenhum | nenhuma | validação documental de ownership/evidence por RF | matriz RF, negativos P0 | `BK-MF7-02`, `BK-MF7-03` |
| `BK-MF7-02` | `docs/evidence/MF7/MATRIZ-RNF-VALIDACAO.md` | nenhum código | não aplicável | RNF, evidence MF6, scripts backend/frontend | nenhum | nenhum | nenhum | nenhum | nenhum | recomendação baseline apenas como RNF ético | ressalvas de compatibilidade, API, operação e localização | matriz RNF, negativos P0 | `BK-MF7-03`, `BK-MF7-05` |
| `BK-MF7-03` | `docs/evidence/MF7/ROTEIRO-DEMO-FINAL.md` | nenhum código | não aplicável | matrizes RF/RNF e rotas frontend existentes | nenhum | nenhum | nenhum | nenhum | rotas existentes confirmadas | nenhuma | cenas negativas de sessão/permissão | roteiro, tempos, fallback | `BK-MF7-04` |
| `BK-MF7-04` | `docs/evidence/MF7/ENSAIO-TECNICO-DEFESA.md` | nenhum código | não aplicável | roteiro, matrizes e evidence MF6/MF7 | nenhum | nenhum | nenhum | nenhum | nenhum | nenhuma | perguntas sobre sessão, ownership, privacidade e permissões | ensaio, perguntas, negativos P1 | `BK-MF7-05` |
| `BK-MF7-05` | `docs/evidence/MF7/AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md` | nenhum código | não aplicável | matrizes, roteiro, ensaio e scorecards | nenhum | nenhum | nenhum | nenhum | nenhum | nenhuma | decisão final bloqueia falhas críticas | score, feedback, decisão | `BK-MF8-01` |

## Coerência MF anterior -> MF alvo -> MF seguinte

- MF6 entrega gate técnico e evidence de regressão, hardening, performance, UX e validação final.
- MF7 usa essa evidence para produzir matrizes RF/RNF, roteiro, ensaio e feedback final.
- MF8 recebe riscos residuais, bloqueios e decisões aceites a partir de `BK-MF7-05`.
- Não foram adicionados endpoints, modelos, dependências ou regras de negócio.
- Drift documentado: `docs/RNF.md` ainda contém sugestões amplas de stack/integrações; os BKs MF7 tratam esses pontos como validação, ressalva ou pendência, sem prometer maturidade não provada.

## Decisões técnicas confirmadas

- Backend público dos BKs permanece em `backend/`.
- Frontend público dos BKs permanece em `frontend/`.
- A stack operacional validável continua Express modular, MongoDB oficial, React 18, Vite e cliente API baseado em `fetch`.
- MF7 é uma macrofase documental/operacional de evidências e defesa; não altera código de produto.
- Os artefactos de MF7 vivem em `docs/evidence/MF7/`.

## Decisões de domínio confirmadas

- FaithFlix mantém domínio de streaming cristão, catálogo curado, subscrições, pool solidária, privacidade, administração e evidências PAP.
- Recomendações continuam baseline/regras simples e não foram apresentadas como sistema avançado.
- Pagamentos continuam no escopo de MVP/simulação quando a documentação o exigir.
- Limitações de infraestrutura devem ser registadas como ressalvas, pendências ou riscos, não como proof.

## Decisões DERIVADO

- Uso dos estados `VALIDADO`, `VALIDADO_COM_RESSALVA`, `PENDENTE` e `FALHA` nas matrizes MF7.
- Criação dos artefactos `MATRIZ-RF-EVIDENCIA.md`, `MATRIZ-RNF-VALIDACAO.md`, `ROTEIRO-DEMO-FINAL.md`, `ENSAIO-TECNICO-DEFESA.md` e `AVALIACAO-FINAL-FEEDBACK-ORIENTADOR.md`.
- Uso de `GO`, `GO_COM_RESSALVAS` e `NO_GO` na avaliação final para separar avanço limpo, avanço com risco aceite e bloqueio.

## Verificações textuais

Resultados finais registados após execução:

- Pesquisa de linguagem interna/proibida nos BKs MF7: PASS, sem ocorrências.
- Pesquisa de caminhos internos nos BKs MF7: PASS, sem ocorrências.
- Pesquisa de drift de outras PAPs nos BKs MF7: PASS_COM_FALSOS_POSITIVOS. A expressão `IVA` apanha o marcador obrigatório `DERIVADO`; as ocorrências foram analisadas e não indicam drift de OPSA, Orelle, StudyFlow ou domínio externo.
- `git diff --check`: PASS, sem output.
- `bash scripts/validate-planificacao.sh`: PASS.

Output do validador:

```json
{
  "project": "faithflix",
  "status": "PASS",
  "checked_bks": 55,
  "checked_guides": 55,
  "errors": []
}
```

## Riscos restantes

- Os guias criam instruções para artefactos MF7, mas não executam a entrega real desses artefactos; isso pertence ao aluno/equipa ao seguir os BKs.
- Alguns RNF dependem de evidence operacional que pode ficar `PENDENTE` ou `VALIDADO_COM_RESSALVA` até haver execução real no ambiente de defesa.
- A documentação RNF contém sugestões amplas que devem continuar a ser tratadas com cuidado para não virar promessa indevida nos BKs.

## Bloqueios ou TODOs restantes

- Sem bloqueios documentais para os BKs MF7 após correção.
- A criação real dos ficheiros em `docs/evidence/MF7/` fica para execução pedagógica dos BKs pelos alunos.
