# BK-MF8-05 - Auditoria administrativa final

## Header

- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-04`
- `rf_rnf`: `RNF19, RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-auditoria-administrativa-final.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais auditar a superfície administrativa final do FaithFlix: rotas protegidas, permissões, logs, configuração pública e exposição indevida de dados.

O resultado observável é `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`, com matriz de verificação administrativa e decisão para avançar para a matriz final.

#### Importância

A administração concentra ações sensíveis, dados agregados e configuração. Uma falha nesta área pode comprometer privacidade, governança e defesa técnica mesmo quando o frontend parece correto.

#### Scope-in

- Inventariar páginas, rotas e endpoints administrativos.
- Validar permissões e estados sem sessão.
- Rever logs e dados expostos.
- Separar falha bloqueante de ressalva controlada.

#### Scope-out

- Criar novas capacidades admin.
- Alterar roles sem contrato documental.
- Consultar dados de uma associação como se fossem dados globais.
- Registar dados sensíveis na evidence.

#### Estado antes e depois

- Antes: `BK-MF8-04` fecha readiness operacional.
- Depois: a área administrativa tem decisão auditável para alimentar `BK-MF8-06`.

#### Pre-requisitos

- Ler `BK-MF8-04` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Superfície administrativa`: conjunto de páginas, rotas e ações reservadas a admin.
- `Permissão`: regra que define quem pode executar uma ação.
- `Exposição indevida`: dado sensível ou restrito mostrado a quem não deve ver.
- `Auditoria`: registo controlado de ação relevante sem dados sensíveis.

#### Conceitos teóricos essenciais

- `CANONICO`: admin não elimina autorização; vem dos RF/RNF e evita acesso transversal indevido.
- `CANONICO`: logs devem ajudar a investigar sem guardar passwords, cookies ou dados sensíveis; seguem para evidence como resultado, não como conteúdo privado.
- `DERIVADO`: uma matriz de rotas permite provar que visitante, utilizador comum, associação e admin têm limites claros.
- `CANONICO`: associações veem apenas os dados da sua entidade salvo autorização admin documentada; evita fuga de dados entre entidades.
- `DERIVADO`: configuração pública pode ser auditada, mas segredos nunca entram no documento.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-05-auditoria-administrativa-final.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Inventariar superfície administrativa

1. Objetivo funcional do passo no contexto da app.

Listar páginas, rotas e endpoints admin existentes e a sua finalidade.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Revê `frontend/`, `backend/` e docs anteriores. Cada item deve ter owner, permissão esperada e evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há rota admin sem classificação.

7. Cenário negativo/erro esperado.

Rota admin sem permissão esperada fica como `FAIL`.

### Passo 2 - Validar permissões e rotas protegidas

1. Objetivo funcional do passo no contexto da app.

Confirmar comportamento para visitante, utilizador comum, associação e admin.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Regista expected result por perfil, incluindo HTTP status ou estado UI.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando há prova positiva e negativa por superfície crítica.

7. Cenário negativo/erro esperado.

Se utilizador comum conseguir ação admin, a auditoria falha.

### Passo 3 - Rever logs e auditoria aplicável

1. Objetivo funcional do passo no contexto da app.

Confirmar que ações sensíveis geram registo útil sem dados privados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Lista evento, origem, campos seguros e campos proibidos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando logs citados não expõem valores sensíveis.

7. Cenário negativo/erro esperado.

Log com password, cookie ou token deve ser bloqueante.

### Passo 4 - Rever configuração administrativa

1. Objetivo funcional do passo no contexto da app.

Validar integrações, flags e configuração visível sem revelar segredos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Regista só nomes de variáveis ou chaves públicas permitidas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando a configuração é compreensível e segura.

7. Cenário negativo/erro esperado.

Valor secreto escrito na evidence invalida o passo.

### Passo 5 - Registar checks de dados sensíveis

1. Objetivo funcional do passo no contexto da app.

Provar que dados pessoais, pagamento simulado e associação ficam limitados ao perfil correto.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Cria uma matriz de campo, origem, visibilidade e motivo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há campo sensível sem regra.

7. Cenário negativo/erro esperado.

Campo sensível sem owner ou permissão deve ser tratado como falha.

### Passo 6 - Fechar critérios de segurança administrativa

1. Objetivo funcional do passo no contexto da app.

Transformar observações em decisão `PASS`, `PASS_COM_RESSALVAS` ou `FAIL`.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Liga cada critério a RNF, prova e negativo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando critérios P0/P1 têm negativos.

7. Cenário negativo/erro esperado.

Critério sem negativo em rota protegida fica incompleto.

### Passo 7 - Entregar entrada para matriz final

1. Objetivo funcional do passo no contexto da app.

Preparar resumo administrativo para `BK-MF8-06`.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.

3. Instruções do que fazer.

Inclui rotas validadas, falhas, ressalvas e decisões aceites.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando a matriz final consegue usar os resultados sem reauditar tudo.

7. Cenário negativo/erro esperado.

Se houver falha sem classificação, a matriz final fica bloqueada.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md` existe e referencia `BK-MF8-05`.
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

- Entrega principal: `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md`.
- Próximo BK: `BK-MF8-06`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: frase dos passos sem código uniformizada com acentuação portuguesa correta.
- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
