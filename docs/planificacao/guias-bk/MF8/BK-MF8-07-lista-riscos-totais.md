# BK-MF8-07 - Lista de riscos totais

## Header

- `doc_id`: `GUIA-BK-MF8-07`
- `bk_id`: `BK-MF8-07`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-06`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-08`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-07-lista-riscos-totais.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais reunir todos os riscos relevantes da PAP FaithFlix: técnicos, produto, UX, segurança, dados, demonstração e manutenção.

O resultado observável é `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`, com uma lista priorizada, mitigável e preparada para a execução de testes e correção de erros.

#### Importância

A lista de riscos evita surpresas no fim. Em vez de esconder limitações, a equipa mostra que sabe identificar impacto, probabilidade, mitigação e decisão de aceitação.

#### Scope-in

- Agregar riscos vindos da matriz final, readiness, auditoria e testes.
- Classificar severidade, probabilidade, owner e mitigação.
- Separar riscos aceites de erros a corrigir.
- Preparar entrada para report de testes.

#### Scope-out

- Corrigir erros neste BK.
- Transformar todo risco em falha bloqueante.
- Aceitar risco sem mitigação.
- Criar requisitos novos para resolver risco.

#### Estado antes e depois

- Antes: `BK-MF8-06` identifica gaps e ressalvas por requisito.
- Depois: riscos totais ficam priorizados para `BK-MF8-08`.

#### Pre-requisitos

- Ler `BK-MF8-06` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Risco técnico`: possível falha de implementação, build, teste ou segurança.
- `Risco de produto`: limitação funcional ou de scope que pode afetar a defesa.
- `Mitigação`: ação ou explicação que reduz impacto ou probabilidade.
- `Risco aceite`: risco conhecido, documentado e aprovado para seguir.

#### Conceitos teóricos essenciais

- `CANONICO`: riscos finais vêm de evidence, testes e matriz; seguem para report de erros e freeze.
- `DERIVADO`: impacto e probabilidade ajudam a priorizar; evitam gastar tempo em risco pequeno enquanto há risco crítico.
- `CANONICO`: riscos de segurança, privacidade e dados precisam de tratamento mais rigoroso que riscos visuais.
- `DERIVADO`: risco aceite não é risco ignorado; precisa de owner, motivo e plano de comunicação.
- `DERIVADO`: a lista total prepara a defesa, porque mostra maturidade técnica e honestidade sobre limites.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-07-lista-riscos-totais.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Recolher riscos de todas as fontes

1. Objetivo funcional do passo no contexto da app.

Juntar riscos da matriz final, readiness, auditoria administrativa, MF7 e evidence MF8.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Regista origem, descrição curta e requisito ou BK associado.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada risco tem fonte.

7. Cenário negativo/erro esperado.

Risco sem fonte deve ser removido ou marcado como hipótese não aceite.

### Passo 2 - Classificar categorias de risco

1. Objetivo funcional do passo no contexto da app.

Separar riscos técnicos, produto, UX, segurança, dados, demonstração e manutenção.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Usa categorias fechadas para facilitar leitura e priorização.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando todos os riscos têm categoria.

7. Cenário negativo/erro esperado.

Categoria genérica como “outro” só entra com justificação.

### Passo 3 - Atribuir impacto e probabilidade

1. Objetivo funcional do passo no contexto da app.

Dar severidade e probabilidade a cada risco.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Usa escala simples: baixo, médio, alto, crítico. Explica o motivo.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando severidade combina com impacto real.

7. Cenário negativo/erro esperado.

Risco de dados sensíveis nunca pode ficar baixo sem prova.

### Passo 4 - Definir mitigação e owner

1. Objetivo funcional do passo no contexto da app.

Atribuir ação, responsável e prazo ou decisão de aceitação.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Owner deve ser pessoa ou papel já usado no planeamento.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando risco alto tem mitigação clara.

7. Cenário negativo/erro esperado.

Risco sem owner não pode avançar.

### Passo 5 - Separar riscos aceites e por corrigir

1. Objetivo funcional do passo no contexto da app.

Decidir que riscos seguem como ressalva e que riscos viram erro para `BK-MF8-09`.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Regista critério de decisão e evidence.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando riscos bloqueantes não ficam aceites por conveniência.

7. Cenário negativo/erro esperado.

Se um risco crítico for aceite sem orientador, marca `FAIL`.

### Passo 6 - Confirmar riscos de demonstração

1. Objetivo funcional do passo no contexto da app.

Identificar riscos que podem aparecer durante apresentação ou defesa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Inclui falhas de ambiente, login, dados seed, navegação e tempo.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada risco de defesa tem plano de fallback honesto.

7. Cenário negativo/erro esperado.

Fallback que promete funcionalidade inexistente não é aceite.

### Passo 7 - Entregar contexto ao report de testes

1. Objetivo funcional do passo no contexto da app.

Preparar lista de riscos que `BK-MF8-08` deve observar durante execução.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.

3. Instruções do que fazer.

Liga riscos a comandos, páginas ou ações manuais.

4. Código completo, correto e integrado com a app final.

Sem codigo neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando report de erros sabe que riscos confirmar.

7. Cenário negativo/erro esperado.

Risco sem forma de observação fica mal definido.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md` existe e referencia `BK-MF8-07`.
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

- Entrega principal: `docs/evidence/MF8/LISTA-RISCOS-TOTAIS.md`.
- Próximo BK: `BK-MF8-08`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
