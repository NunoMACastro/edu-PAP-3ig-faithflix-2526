# BK-MF8-10 - Scope Freeze

## Header

- `doc_id`: `GUIA-BK-MF8-10`
- `bk_id`: `BK-MF8-10`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-09`
- `rf_rnf`: `transversal`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF9-01`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-10-scope-freeze.md`
- `last_updated`: `2026-06-30`

#### Objetivo

Neste BK vais congelar o scope final da baseline MF8 FaithFlix antes da extensao MF9. O foco é declarar o que está dentro, o que ficou fora, que riscos foram aceites e que estado MF8 pode ser defendido.

O resultado observável é `docs/evidence/MF8/SCOPE-FREEZE.md`, com checklist final, decisão de entrega MF8 e handoff claro para `BK-MF9-01`.

#### Importância

Scope freeze protege a equipa contra mudanças de última hora. Também torna a defesa mais honesta: o aluno sabe o que a MF8 entrega, o que não entrega e como justificar o avanço para a MF9.

#### Scope-in

- Congelar funcionalidades entregues.
- Listar exclusões e riscos aceites.
- Confirmar estado final da app e evidence.
- Indicar trabalho pós-MF8 ou pós-PAP sem misturar com a entrega MF8.

#### Scope-out

- Criar funcionalidades novas da MF9.
- Reabrir bugs já classificados sem decisão.
- Alterar RF/RNF ou owners.
- Prometer evolução futura como se estivesse entregue.

#### Estado antes e depois

- Antes: `BK-MF8-09` fecha correção/classificação dos erros.
- Depois: a baseline MF8 tem decisão final, cadeia MF8 terminada e handoff para `BK-MF9-01`.

#### Pre-requisitos

- Ler `BK-MF8-09` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/SCOPE-FREEZE.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Scope freeze`: congelamento formal do âmbito entregue.
- `Exclusão`: funcionalidade ou melhoria fora da entrega final.
- `Trabalho pós-MF8`: melhoria ou extensão futura que não conta como entrega MF8.
- `Decisão final`: estado de entrega com ou sem ressalvas.

#### Conceitos teóricos essenciais

- `CANONICO`: o scope final vem do backlog, matriz, evidence e correções; evita prometer trabalho não entregue.
- `DERIVADO`: exclusões bem escritas protegem a equipa, porque explicam limite sem parecer esquecimento.
- `CANONICO`: riscos aceites precisam de origem e mitigação; seguem para defesa como decisão consciente.
- `DERIVADO`: trabalho pós-MF8 ou pós-PAP é futuro e não deve ser usado para validar requisito atual da MF8.
- `CANONICO`: checklist final confirma que segredos, dados sensíveis e outputs privados não entram na entrega.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-10-scope-freeze.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/SCOPE-FREEZE.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Confirmar funcionalidades congeladas

1. Objetivo funcional do passo no contexto da app.

Listar funcionalidades e requisitos que entram na entrega final.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Usa matriz final, correções e evidence para decidir estado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada funcionalidade tem proof ou ressalva.

7. Cenário negativo/erro esperado.

Funcionalidade sem proof não pode ser apresentada como concluída.

### Passo 2 - Registar exclusões

1. Objetivo funcional do passo no contexto da app.

Escrever o que fica fora do scope final e porquê.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Separa exclusão por falta de contrato, tempo, risco ou decisão pedagógica.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando exclusões não contradizem RF/RNF ativos.

7. Cenário negativo/erro esperado.

Exclusão que remove requisito ativo sem decisão deve ser bloqueada.

### Passo 3 - Consolidar riscos aceites

1. Objetivo funcional do passo no contexto da app.

Trazer riscos finais da lista total e das correções.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Cada risco aceito deve ter impacto, mitigação e owner.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando riscos críticos sem mitigação bloqueiam freeze.

7. Cenário negativo/erro esperado.

Risco aceite sem mitigação não é válido.

### Passo 4 - Confirmar estado final da app

1. Objetivo funcional do passo no contexto da app.

Fechar decisão geral da aplicação: pronta, pronta com ressalvas ou bloqueada.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Cita builds, testes, readiness, auditoria, matriz e report de erros.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando a decisão final é compatível com evidence.

7. Cenário negativo/erro esperado.

Se a evidence contradiz a decisão, corrige a decisão.

### Passo 5 - Verificar segredos e ficheiros sensíveis

1. Objetivo funcional do passo no contexto da app.

Confirmar que pacote, evidence e docs não expõem valores privados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Revê outputs, screenshots, logs e nomes de ficheiros sensíveis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há segredo ou dado pessoal indevido.

7. Cenário negativo/erro esperado.

Se aparece valor sensível, remove e regista falha.

### Passo 6 - Fechar checklist final de entrega

1. Objetivo funcional do passo no contexto da app.

Criar checklist curta para orientador e equipa validarem o fecho.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Inclui docs, evidence, testes, riscos, exclusões e estado final.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada item tem `OK`, `RESSALVA` ou `BLOQUEADO`.

7. Cenário negativo/erro esperado.

Checklist só com caixas vazias não prova fecho.

### Passo 7 - Indicar trabalho pós-PAP

1. Objetivo funcional do passo no contexto da app.

Separar melhorias futuras da entrega avaliada.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/SCOPE-FREEZE.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/SCOPE-FREEZE.md`.

3. Instruções do que fazer.

Regista melhorias como futuras, com motivo e impacto, sem as vender como entregues.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando trabalho futuro está claramente separado.

7. Cenário negativo/erro esperado.

Se uma melhoria futura for necessária para requisito ativo, volta à matriz de riscos.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/SCOPE-FREEZE.md` existe e referencia `BK-MF8-10`.
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

- Entrega principal: `docs/evidence/MF8/SCOPE-FREEZE.md`.
- Próximo BK: `BK-MF9-01`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
- `2026-06-30`: handoff atualizado para `BK-MF9-01` após criação da MF9 canónica.
