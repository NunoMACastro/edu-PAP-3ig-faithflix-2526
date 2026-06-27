# BK-MF8-09 - Correção de erros do report anterior

## Header

- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-08`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-10`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-correcao-erros-report.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais tratar o report de erros criado em `BK-MF8-08`. O objetivo é triagem, correção ou classificação honesta de cada erro antes do scope freeze.

O resultado observável é `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`, com estado por erro, prova de revalidação e lista final de ressalvas.

#### Importância

Sem este BK, a equipa teria uma lista de erros sem decisão. A correção final precisa de causa raiz, validação e prova de que a solução não quebrou outros fluxos.

#### Scope-in

- Ler todos os erros do report anterior.
- Priorizar P0/P1 antes de erros menores.
- Corrigir, revalidar ou classificar cada erro.
- Atualizar evidence e riscos restantes.

#### Scope-out

- Criar novas features.
- Alterar scope congelado sem aprovação.
- Corrigir erro sem reproduzir ou sem prova.
- Apagar erro por conveniência.

#### Estado antes e depois

- Antes: `BK-MF8-08` entrega erros reproduzíveis.
- Depois: erros ficam corrigidos, aceites com ressalva ou bloqueados com motivo para `BK-MF8-10`.

#### Pre-requisitos

- Ler `BK-MF8-08` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Causa raiz`: motivo técnico ou documental que explica a falha.
- `Revalidação`: execução do teste ou verificação depois da correção.
- `Erro bloqueante`: falha que impede entrega ou defesa segura.
- `Ressalva final`: limitação aceite depois de decisão explícita.

#### Conceitos teóricos essenciais

- `CANONICO`: correções devem preservar RF/RNF e segurança; vêm do report e seguem para scope freeze.
- `DERIVADO`: causa raiz evita corrigir só o sintoma e reduz regressão.
- `CANONICO`: erros de autenticação, autorização, dados e privacidade têm prioridade sobre estética menor.
- `DERIVADO`: uma correção sem revalidação fica incompleta, mesmo que pareça resolvida.
- `DERIVADO`: erro fora do scope pode ser aceite, mas precisa de impacto e comunicação clara.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-09-correcao-erros-report.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Ler report anterior

1. Objetivo funcional do passo no contexto da app.

Importar todos os erros de `BK-MF8-08` sem perder ids, severidade e evidence.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

Cria tabela de triagem com id, tipo, severidade, owner e estado inicial.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando todos os erros aparecem na tabela.

7. Cenário negativo/erro esperado.

Erro omitido sem justificação invalida o BK.

### Passo 2 - Triar e priorizar

1. Objetivo funcional do passo no contexto da app.

Ordenar erros por impacto em segurança, dados, autenticação, build, testes e defesa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

Define prioridade de correção e motivo.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando P0/P1 têm destino claro.

7. Cenário negativo/erro esperado.

Erro crítico enviado para fim da fila sem motivo fica errado.

### Passo 3 - Corrigir ou classificar

1. Objetivo funcional do passo no contexto da app.

Aplicar correção permitida ou classificar como bloqueado, aceite ou fora do scope.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

Regista ficheiros afetados ou motivo da não correção. Não descrevas alteração que não foi feita.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada erro tem estado final provisório.

7. Cenário negativo/erro esperado.

Erro marcado corrigido sem alteração ou prova não é aceite.

### Passo 4 - Registar alterações feitas

1. Objetivo funcional do passo no contexto da app.

Documentar mudanças com caminho público, objetivo e risco evitado.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

Usa apenas caminhos `backend/`, `frontend/`, `docs/`, `scripts/` ou `tests/`.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada alteração tem ligação ao erro.

7. Cenário negativo/erro esperado.

Alteração sem erro associado é scope creep.

### Passo 5 - Reexecutar testes afetados

1. Objetivo funcional do passo no contexto da app.

Executar o menor conjunto de testes que prova a correção e não quebra fluxo principal.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

Regista comando, output resumido e estado.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada erro corrigido tem revalidação.

7. Cenário negativo/erro esperado.

Sem revalidação, estado máximo é `CORRIGIDO_SEM_VALIDACAO_TOTAL`.

### Passo 6 - Atualizar evidence e riscos

1. Objetivo funcional do passo no contexto da app.

Mover erros resolvidos para histórico e erros restantes para risco ou blocker.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

Atualiza `LISTA-RISCOS-TOTAIS.md` se o risco continuar ativo.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há erro sem destino.

7. Cenário negativo/erro esperado.

Erro restante sem risco ou blocker fica perdido.

### Passo 7 - Entregar estado limpo ao freeze

1. Objetivo funcional do passo no contexto da app.

Preparar handoff com erros corrigidos, ressalvas aceites e bloqueios restantes.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.

3. Instruções do que fazer.

A decisão final deve dizer se `BK-MF8-10` pode congelar o scope.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando o freeze recebe lista fechada.

7. Cenário negativo/erro esperado.

Se houver erro crítico aberto, o handoff deve bloquear freeze.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md` existe e referencia `BK-MF8-09`.
- Todos os 7 passos têm prova, decisão e negativo associado.
- Cada decisão usa `PASS`, `PASS_COM_RESSALVAS`, `FAIL` ou `NAO_APLICAVEL` com justificação.
- Os campos `pr`, `proof`, `neg` e `fonte` estão preenchidos ou justificados.
- Erros comuns a evitar: prova sem comando, screenshot sem contexto, decisão sem fonte e handoff sem owner.

#### Validação final

- `bash scripts/validate-planificacao.sh` executado na raiz do repositório.
- `git diff --check` sem linhas reportadas.
- Evidence principal preenchida com `pr`, `proof`, `neg`, decisão final e handoff.
- Nenhum caminho privado ou nota interna aparece no guia nem no artefacto de aluno.

Resultado esperado: a validação documental fica em `PASS`; se existir falha técnica fora deste BK, ela fica registada com estado, impacto e próximo passo.

#### Evidence para PR/defesa

| Campo | Conteúdo esperado |
| --- | --- |
| `pr` | Link ou identificador da alteração, ou nota `NAO_APLICAVEL` quando for só evidence documental. |
| `proof` | Comando, screenshot, checklist preenchida ou output seguro que prova o fluxo principal. |
| `neg` | Cenário negativo com expected result e resultado observado. |
| `fonte` | RF/RNF, BK anterior, documento canónico ou evidence que justifica a decisão. |

#### Handoff

- Entrega principal: `docs/evidence/MF8/CORRECAO-ERROS-REPORT.md`.
- Próximo BK: `BK-MF8-10`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
