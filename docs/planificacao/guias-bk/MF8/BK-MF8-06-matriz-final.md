# BK-MF8-06 - Matriz final

## Header

- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-05`
- `rf_rnf`: `RF_ATIVOS_MVP`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-matriz-final.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais consolidar a matriz final de cobertura do FaithFlix, ligando RF/RNF, BKs, implementação, testes, evidence e decisão.

O resultado observável é `docs/evidence/MF8/MATRIZ-FINAL.md`, que deve servir como prova central de rastreabilidade para defesa PAP.

#### Importância

A matriz final mostra que a aplicação não é um conjunto solto de tarefas. Ela liga requisitos, guias, implementação e validação, permitindo defender o que está completo, o que tem ressalvas e o que ficou fora do scope.

#### Scope-in

- Criar matriz final de RF/RNF ativos.
- Relacionar cada requisito com BK, evidence e estado.
- Separar gap, ressalva e risco.
- Preparar entrada para lista de riscos totais.

#### Scope-out

- Alterar RF/RNF ativos.
- Declarar requisito validado sem prova.
- Reabrir implementação fora dos BKs anteriores.
- Apagar ressalvas documentadas.

#### Estado antes e depois

- Antes: `BK-MF8-05` fecha auditoria administrativa.
- Depois: requisitos e evidências ficam consolidados para `BK-MF8-07`.

#### Pré-requisitos

- Ler `BK-MF8-05` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/MATRIZ-FINAL.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Rastreabilidade`: ligação entre requisito, BK, implementação e evidence.
- `Gap`: parte esperada que falta ou não está provada.
- `Ressalva`: limitação aceite e documentada.
- `Estado final`: decisão sobre cada requisito no fecho da PAP.

#### Conceitos teóricos essenciais

- `CANONICO`: RF/RNF ativos vêm dos documentos oficiais; entram na matriz e evitam inventar requisitos na defesa.
- `CANONICO`: evidence objetiva sustenta estado final; vem de testes, screenshots, logs seguros e checks.
- `DERIVADO`: gap não é automaticamente falha crítica; precisa de impacto, owner e decisão.
- `DERIVADO`: uma matriz boa permite responder “onde está provado?” sem procurar em toda a PAP.
- `CANONICO`: a matriz final deve preservar ressalvas da MF7/MF8 para não transformar risco em sucesso absoluto.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-06-matriz-final.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/MATRIZ-FINAL.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Recolher fontes finais

1. Objetivo funcional do passo no contexto da app.

Juntar documentos canónicos, BKs, reports e evidence final.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Lista fonte, caminho, data e uso na matriz.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada fonte é rastreável.

7. Cenário negativo/erro esperado.

Fonte sem caminho ou data fica como ressalva.

### Passo 2 - Criar matriz RF/RNF final

1. Objetivo funcional do passo no contexto da app.

Construir tabela com requisito, BK, owner, evidence, estado e observação.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Usa RF/RNF ativos sem renumerar nem criar novos requisitos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando todos os requisitos ativos têm linha.

7. Cenário negativo/erro esperado.

Requisito ativo sem linha bloqueia a matriz.

### Passo 3 - Relacionar implementação, testes e documentação

1. Objetivo funcional do passo no contexto da app.

Ligar cada requisito à prova técnica ou documental que o sustenta.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Preenche campos de implementação, teste, proof e negativo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada estado positivo, como `PASS` ou `PASS_COM_RESSALVAS`, tem proof e negativo proporcionais.

7. Cenário negativo/erro esperado.

Estado validado sem negativo deve ser revisto.

### Passo 4 - Separar gaps assumidos

1. Objetivo funcional do passo no contexto da app.

Identificar lacunas, ressalvas e decisões fora do scope.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Regista impacto, motivo, owner e destino: risco, correção ou aceitação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando nenhum gap fica sem decisão.

7. Cenário negativo/erro esperado.

Gap sem owner não pode seguir para freeze.

### Passo 5 - Validar ordem pedagógica

1. Objetivo funcional do passo no contexto da app.

Confirmar que a sequência de BKs explica como a app foi construída e fechada.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Verifica dependências de MF7 para MF8 e da cadeia `BK-MF8-01` a `BK-MF8-10`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há salto lógico na cadeia.

7. Cenário negativo/erro esperado.

Se um BK depender de artefacto inexistente, marca blocker.

### Passo 6 - Fechar estado final por requisito

1. Objetivo funcional do passo no contexto da app.

Atribuir estado final coerente a cada requisito.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Usa apenas os estados finais definidos nos critérios de aceite: `PASS`, `PASS_COM_RESSALVAS`, `FAIL` ou `NAO_APLICAVEL`. Assim, a matriz final e a evidence usam o mesmo vocabulário.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando estado e prova concordam.

7. Cenário negativo/erro esperado.

Não uses estado positivo para requisito sem proof.

### Passo 7 - Preparar handoff para riscos totais

1. Objetivo funcional do passo no contexto da app.

Enviar para `BK-MF8-07` gaps, ressalvas e riscos agregados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/MATRIZ-FINAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/MATRIZ-FINAL.md`.

3. Instruções do que fazer.

Cria lista de riscos candidatos com origem na matriz final.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando riscos têm requisito, impacto e origem.

7. Cenário negativo/erro esperado.

Risco sem origem documental não entra na lista final.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/MATRIZ-FINAL.md` existe e referencia `BK-MF8-06`.
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

- Entrega principal: `docs/evidence/MF8/MATRIZ-FINAL.md`.
- Próximo BK: `BK-MF8-07`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: corrigida a acentuação dos passos sem código e normalizado o vocabulário de estados finais para `PASS`, `PASS_COM_RESSALVAS`, `FAIL` e `NAO_APLICAVEL`.
- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
