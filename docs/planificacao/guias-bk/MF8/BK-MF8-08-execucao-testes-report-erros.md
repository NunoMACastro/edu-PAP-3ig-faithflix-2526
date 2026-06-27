# BK-MF8-08 - Execução de testes e report de erros

## Header

- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Davi`
- `apoio`: `Matheus, Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-07`
- `rf_rnf`: `RNF29, RNF21, RNF22`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-execucao-testes-report-erros.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais executar os testes automáticos, manuais e visuais definidos em `BK-MF8-03`, sempre referenciando o `id` da matriz de testes.

O resultado observável é `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`, com estado por `TST-*`, output seguro, primeiro erro relevante, decisão e handoff para `BK-MF8-09`.

#### Importância

A execução final transforma a matriz pedagógica em prova real. Este BK não redesenha testes nem explica de novo a teoria: executa o que foi definido, guarda evidência suficiente e separa falha de código, falha de ambiente, lacuna de teste e risco aceite.

Isto evita relatórios vagos como "falhou" ou "passou tudo" sem ligação ao teste, ao requisito e ao risco.

#### Scope-in

- Executar cada `id` definido em `BK-MF8-03` ou justificar porque não foi executado.
- Registar output seguro, estado, primeiro erro relevante e decisão por teste.
- Executar testes automáticos, build/smoke frontend, testes manuais críticos e testes visuais/responsivos.
- Criar report de erros com relação direta entre `MF8-ERR-*` e `TST-*`.
- Entregar falhas corrigíveis a `BK-MF8-09`.

#### Scope-out

- Criar a teoria ou a matriz de testes; isso pertence a `BK-MF8-03`.
- Corrigir erros neste BK.
- Apagar falhas do report para obter sucesso artificial.
- Executar comandos em diretório diferente do indicado.
- Guardar segredos, cookies reais, tokens, passwords ou dados sensíveis no output.

#### Estado antes e depois

- Antes: `BK-MF8-07` lista riscos totais a observar e `BK-MF8-03` define a matriz de testes.
- Depois: há report de execução por `id`, com erros classificados e prioridade para `BK-MF8-09`.

#### Pre-requisitos

- Ler `BK-MF8-03` e copiar a lista final de `TST-*` antes de executar comandos.
- Ler `BK-MF8-07` antes de iniciar este BK para cruzar falhas com riscos totais.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md` com prova positiva, prova negativa, erros e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `ID de teste`: identificador `TST-*` definido em `BK-MF8-03` e usado para rastrear execução.
- `Output seguro`: excerto mínimo de comando ou screenshot sem segredos, cookies reais, tokens ou dados pessoais.
- `Erro acionável`: falha com teste de origem, passos, esperado, observado, severidade e owner.
- `Primeiro erro relevante`: primeira falha que explica a causa provável sem colar output excessivo.
- `PASS`: o teste cumpriu o expected result.
- `PASS_COM_RESSALVAS`: o teste passou parcialmente ou tem limitação documentada sem bloquear a entrega.
- `FAIL`: o teste falhou por bug, regressão ou contrato quebrado.
- `BLOQUEADO`: o teste não pôde ser executado por ambiente, dependência ou ausência de condição mínima.

#### Conceitos teóricos essenciais

- `CANONICO`: execução de testes vem de `RNF29`; entra como lista de `TST-*` e sai como report de erros por evidência.
- `CANONICO`: build frontend confirma que a aplicação compila; smoke backend confirma que rotas essenciais respondem antes de fluxos mais longos.
- `CANONICO`: outputs não devem expor dados sensíveis; a evidence guarda só o necessário para reproduzir.
- `DERIVADO`: nem toda falha é bug de código; pode ser ambiente, comando ausente, teste incompleto ou dívida documental.
- `DERIVADO`: o report acionável evita "falhou" genérico e permite correção objetiva em `BK-MF8-09`.
- `DERIVADO`: cada erro reportado deve apontar para o `id` do teste que o revelou.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-08-execucao-testes-report-erros.md` | Explica execução, evidence e classificação por `TST-*`. |
| Evidence | `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md` | Guarda resultados, outputs seguros, erros e handoff. |
| Matriz de origem | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Lista os `id` criados em `BK-MF8-03` que devem ser executados aqui. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a executar ou observar quando o teste pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
- REVER: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `backend/package.json`
- REVER: `frontend/package.json`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

Tabela de execução a registar na evidence. Os comandos só contam quando estão ligados ao `id` vindo de `BK-MF8-03`.

| ID de origem | Tipo | Diretório | Comando/procedimento | Resultado a registar |
| --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | Testes backend unitários | raiz | `npm --prefix backend test` | Total de testes, falhas e primeiro erro relevante das validações. |
| `TST-MF8-BE-INT-HTTP` | Integração HTTP | raiz | `npm --prefix backend test` | Rotas/contratos cobertos, falhas e primeiro endpoint afetado. |
| `TST-MF8-BE-SMOKE-HEALTH` | Smoke backend | raiz | `npm --prefix backend run smoke` | Estado do smoke e rota/fluxo que falhou, se houver. |
| `TST-MF8-BE-REG-HARDENING` | Regressão/hardening backend | raiz ou `backend/` | `npm --prefix backend test`; `node backend/scripts/check-security-baseline.mjs` se existir | Primeira regra de regressão ou hardening que falhou. |
| `TST-MF8-FE-BUILD` | Build frontend | raiz | `npm --prefix frontend run build` | Build `PASS` ou erro de compilação. |
| `TST-MF8-FE-SMOKE` | Smoke frontend | raiz | `npm --prefix frontend run smoke` se existir | Estado do smoke frontend e fluxo que falhou. |
| `TST-MF8-FE-REG` | Regressão frontend | raiz ou `frontend/` | `node frontend/scripts/check-frontend-regression.mjs` ou comando documentado se existir | `PASS` ou primeira regra de regressão que falhou. |
| `TST-MF8-MANUAL-CRITICO` | Manual funcional | frontend em execução | Procedimento definido em `BK-MF8-03` | Perfil, rota, ação, expected result, observado e decisão. |
| `TST-MF8-VISUAL-RESP` | Visual/responsivo | `frontend/` | `npm run dev -- --host 127.0.0.1 --port 4174` | URL aberta, viewport, screenshot e observação. |

Modelo de linha de execução:

| id_teste | comando/procedimento | exit code | output seguro | primeiro erro relevante | decisão | erro_id | handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `TST-MF8-BE-SMOKE-HEALTH` | `npm --prefix backend run smoke` | `0` | resumo do smoke | `NAO_APLICAVEL` | `PASS` | `NAO_APLICAVEL` | segue |
| `TST-MF8-FE-BUILD` | `npm --prefix frontend run build` | `1` | primeira mensagem de compilação | componente e linha afetada | `FAIL` | `MF8-ERR-001` | `BK-MF8-09` |

### Passo 1 - Preparar ambiente e lista de IDs

1. Objetivo funcional do passo no contexto da app.

Confirmar branch, dependências, diretórios, matriz de origem e lista de `TST-*` a executar.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Copia de `BK-MF8-03` a lista de IDs e confirma que cada um tem comando ou procedimento. No report, regista data, branch, sistema, diretórios usados, comandos disponíveis e variáveis necessárias apenas pelo nome.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo prepara execução e evidence.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre repetibilidade: outra pessoa deve conseguir ver que IDs foram executados, com que comando e em que contexto.

6. Validação do passo.

A validação passa quando todos os `TST-*` da matriz aparecem no report com estado inicial `PENDENTE`, `NAO_APLICAVEL` ou `BLOQUEADO` justificado.

7. Cenário negativo/erro esperado.

Se faltar dependência ou variável segura, marca o teste afetado como `BLOQUEADO` e não inventes resultado.

### Passo 2 - Executar testes automáticos backend por ID

1. Objetivo funcional do passo no contexto da app.

Executar testes unitários, integração HTTP, smoke, regressão e hardening backend definidos na matriz.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `backend/package.json`, `backend/tests/`, `backend/scripts/`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Executa os comandos backend por `id`. Para cada execução, guarda comando, diretório, exit code, duração aproximada, output seguro, primeiro erro relevante e decisão.

IDs mínimos deste passo:

- `TST-MF8-BE-UNIT-VALIDACAO`
- `TST-MF8-BE-INT-HTTP`
- `TST-MF8-BE-SMOKE-HEALTH`
- `TST-MF8-BE-REG-HARDENING`

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é executar comandos definidos e registar evidência.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre leitura de output: falha de assertion indica comportamento incorreto; comando ausente indica lacuna de setup; erro de ambiente deve ser classificado como `BLOQUEADO`.

6. Validação do passo.

A validação passa quando cada `id` backend tem uma decisão entre `PASS`, `PASS_COM_RESSALVAS`, `FAIL`, `BLOQUEADO` ou `NAO_APLICAVEL`.

7. Cenário negativo/erro esperado.

Não escrevas `PASS` sem guardar comando, exit code e output seguro. Um teste que não correu não passou.

### Passo 3 - Executar build, smoke e regressão frontend por ID

1. Objetivo funcional do passo no contexto da app.

Confirmar que o frontend compila e que os checks definidos para UI continuam válidos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `frontend/package.json`, `frontend/`, `frontend/scripts/`, `scripts/`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Executa os comandos frontend definidos na matriz. Se um comando não existir, não substituas por outro sem registar a diferença; marca `NAO_APLICAVEL`, `BLOQUEADO` ou abre erro de lacuna conforme o impacto.

IDs mínimos deste passo:

- `TST-MF8-FE-BUILD`
- `TST-MF8-FE-SMOKE`
- `TST-MF8-FE-REG`

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é execução e report.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre classificação: erro de compilação é falha técnica; comando não definido é lacuna da matriz ou do projeto; warning sem impacto pode ser `PASS_COM_RESSALVAS` se estiver justificado.

6. Validação do passo.

A validação passa quando cada `id` frontend tem output seguro, primeiro erro ou `NAO_APLICAVEL` justificado.

7. Cenário negativo/erro esperado.

Se o build falhar, não avances para smoke visual como se a aplicação estivesse estável; regista `FAIL` e cria `MF8-ERR-*`.

### Passo 4 - Executar testes manuais críticos por ID

1. Objetivo funcional do passo no contexto da app.

Testar fluxos críticos que não tenham cobertura automática suficiente e guardar evidência objetiva.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, `frontend/`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Para cada teste manual, regista `id`, perfil, rota, ação, expected result, observado, evidence e decisão. Usa os IDs definidos em `BK-MF8-03`, como login, catálogo, detalhe, reprodução, subscrição, admin e privacidade.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Teste manual é procedimento com evidence, não alteração de implementação.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre prova funcional: uma rota visitada sem expected result não é teste; uma screenshot sem contexto não permite reprodução.

6. Validação do passo.

A validação passa quando cada fluxo manual crítico tem `id`, expected result, observado e decisão.

7. Cenário negativo/erro esperado.

Teste manual sem utilizador/perfil ou sem esperado fica incompleto e deve ser `PASS_COM_RESSALVAS` ou `FAIL` conforme o risco.

### Passo 5 - Executar testes visuais e responsivos por ID

1. Objetivo funcional do passo no contexto da app.

Confirmar ecrãs principais com viewport, screenshot e observação, sem duplicar o desenho da matriz.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/screenshots/` se forem recolhidas imagens
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `frontend/`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Executa os testes visuais definidos em `BK-MF8-03`. Para cada viewport, guarda rota, dimensão, screenshot, observado, expected result e decisão.

IDs mínimos deste passo:

- `TST-MF8-VISUAL-RESP`
- IDs derivados como `TST-MF8-VISUAL-RESP-HOME`, `TST-MF8-VISUAL-RESP-CATALOGO` e `TST-MF8-VISUAL-RESP-DETALHE`, se estiverem na matriz.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A tarefa é recolher evidence visual e classificar resultados.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre qualidade visual: sobreposição, scroll impossível, texto cortado, CTA inacessível ou layout quebrado são falhas reportáveis.

6. Validação do passo.

A validação passa quando cada screenshot tem `id`, rota, viewport, data e decisão.

7. Cenário negativo/erro esperado.

Screenshot sem contexto não serve como evidence e deve ser repetida.

### Passo 6 - Criar report de erros acionável

1. Objetivo funcional do passo no contexto da app.

Registar cada falha com ligação direta ao teste que a revelou.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Usa IDs estáveis como `MF8-ERR-001`. Cada erro deve ter:

- `erro_id`.
- `id_teste_origem`.
- Tipo: código, ambiente, lacuna de teste, documentação ou visual.
- Severidade: crítica, alta, média ou baixa.
- Passos de reprodução.
- Expected result.
- Observado.
- Primeiro erro relevante.
- Evidence.
- Owner sugerido.
- Handoff para `BK-MF8-09`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este BK reporta; a correção fica para `BK-MF8-09`.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre rastreabilidade: `BK-MF8-09` só consegue corrigir bem se souber que teste falhou, o que era esperado e onde está a prova.

6. Validação do passo.

A validação passa quando cada `FAIL` tem `MF8-ERR-*` e cada `BLOQUEADO` tem causa, impacto e próximo passo.

7. Cenário negativo/erro esperado.

Erro sem passos de reprodução, sem `id_teste_origem` ou sem expected result fica incompleto.

### Passo 7 - Fechar decisão de execução

1. Objetivo funcional do passo no contexto da app.

Decidir se a execução permite avançar, avançar com ressalvas ou bloquear a sequência final.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.

3. Instruções do que fazer.

Resume totais por decisão, falhas críticas, riscos confirmados e handoff. Usa:

- `PASS`: todos os testes críticos passaram.
- `PASS_COM_RESSALVAS`: há limitações documentadas sem bloqueio crítico.
- `FAIL`: há falha técnica que impede confiança no fluxo.
- `BLOQUEADO`: faltam condições para executar prova essencial.

Se houver `FAIL`, cria handoff explícito para `BK-MF8-09`. Se houver apenas lacuna de criação de teste, referencia `BK-MF8-03` como origem da instrução, mas mantém `BK-MF8-09` focado na correção/classificação dos erros executados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A decisão final é documental e operacional.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre decisão: a equipa deve conseguir justificar porque avançou, avançou com ressalvas ou bloqueou.

6. Validação do passo.

A validação passa quando a decisão cita a matriz de `BK-MF8-03`, os resultados deste BK e os riscos de `BK-MF8-07`.

7. Cenário negativo/erro esperado.

Se houver erro crítico sem destino em `BK-MF8-09`, não avances para freeze.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md` existe e referencia `BK-MF8-08`.
- Todos os `TST-*` definidos em `BK-MF8-03` têm execução, `NAO_APLICAVEL` justificado ou `BLOQUEADO` com causa.
- Cada teste executado guarda output seguro, estado, primeiro erro relevante e decisão.
- Cada decisão usa `PASS`, `PASS_COM_RESSALVAS`, `FAIL`, `BLOQUEADO` ou `NAO_APLICAVEL` com justificação.
- Cada `FAIL` tem `MF8-ERR-*`, `id_teste_origem`, expected result, observado, severidade e owner.
- `BK-MF8-09` recebe apenas erros ou bloqueios classificados, não uma repetição da teoria de criação de testes.
- Os campos `pr`, `proof`, `neg` e `fonte` estão preenchidos ou justificados.
- Erros comuns a evitar: prova sem comando, teste sem `id`, screenshot sem contexto, decisão sem fonte, output com segredo e handoff sem owner.

#### Validação final

- `bash scripts/validate-planificacao.sh` executado na raiz do repositório.
- `git diff --check` sem linhas reportadas.
- Pesquisa sem ocorrências proibidas de caminhos privados ou variáveis internas.
- Pesquisa sem linguagem fraca que adie a execução ou esconda lacunas.
- Evidence principal preenchida com `pr`, `proof`, `neg`, decisão final e handoff.

Resultado esperado: a validação documental fica em `PASS`; se existir falha técnica fora deste BK, ela fica registada com estado, impacto e próximo passo.

#### Evidence para PR/defesa

| Campo | Conteúdo esperado |
| --- | --- |
| `pr` | Link ou identificador da alteração, ou nota `NAO_APLICAVEL` quando for só evidence documental. |
| `proof` | Comando executado, output seguro, screenshot, checklist preenchida ou resumo por `id`. |
| `neg` | Cenário negativo executado ou referência ao negativo definido em `BK-MF8-03`. |
| `fonte` | `BK-MF8-03`, RF/RNF, BK anterior, documento canónico ou evidence que justifica a decisão. |

#### Handoff

- Entrega principal: `docs/evidence/MF8/EXECUCAO-TESTES-REPORT-ERROS.md`.
- Próximo BK: `BK-MF8-09`.
- O handoff deve indicar `MF8-ERR-*`, `id_teste_origem`, severidade, owner, passos de reprodução, decisão e blocker.
- Se não houver `FAIL`, o handoff deve dizer explicitamente que `BK-MF8-09` fica sem correções técnicas obrigatórias vindas desta execução.
- Se houver `BLOQUEADO`, o handoff deve indicar que condição falta para repetir o teste.

#### Changelog

- `2026-06-27`: guia alinhado com a matriz pedagógica de `BK-MF8-03`, exigindo execução por `TST-*`, output seguro, primeiro erro relevante e handoff acionável para `BK-MF8-09`.
