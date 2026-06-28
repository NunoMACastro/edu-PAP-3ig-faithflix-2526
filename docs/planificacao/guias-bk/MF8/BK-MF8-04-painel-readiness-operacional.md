# BK-MF8-04 - Painel de readiness operacional

## Header

- `doc_id`: `GUIA-BK-MF8-04`
- `bk_id`: `BK-MF8-04`
- `macro`: `MF8`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-03`
- `rf_rnf`: `RNF30, RNF31, RNF32, RNF33`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-05`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-04-painel-readiness-operacional.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais construir a visão operacional de readiness do FaithFlix. A palavra painel aqui significa um artefacto de decisão: uma tabela de sinais que mostra se a aplicação está pronta, pronta com ressalvas ou não pronta.

O resultado observável é `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`, com sinais técnicos, riscos, ambiente, configuração, evidence e decisão final.

#### Importância

Readiness evita uma decisão final baseada em sensação. Este BK concentra sinais de build, testes, segurança, configuração e documentação antes da auditoria administrativa final.

#### Scope-in

- Criar matriz de readiness operacional.
- Ligar sinais técnicos a comandos e evidence.
- Classificar decisão `GO`, `GO_COM_RESSALVAS` ou `NO_GO`.
- Preparar entrada para auditoria administrativa.

#### Scope-out

- Corrigir implementação fora de scope.
- Ignorar falhas críticas para obter `GO`.
- Expor segredos ou valores sensíveis.
- Substituir testes finais por opinião manual.

#### Estado antes e depois

- Antes: `BK-MF8-03` deixa a suite final preparada.
- Depois: existe decisão operacional rastreável para `BK-MF8-05`.

#### Pre-requisitos

- Ler `BK-MF8-03` antes de iniciar este BK.
- Confirmar que a MF8 ativa tem exatamente `10` guias formais, de `BK-MF8-01` a `BK-MF8-10`.
- Consultar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Criar ou atualizar `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md` com prova positiva, prova negativa e decisão final.
- Executar `bash scripts/validate-planificacao.sh` e `git diff --check` antes de fechar o BK.

#### Glossário

- `Readiness`: estado de preparação técnica e operacional para entrega.
- `Sinal operacional`: evidência objetiva como build, teste, hardening ou checklist.
- `GO`: decisão de avanço sem bloqueios críticos.
- `GO_COM_RESSALVAS`: avanço aceite com riscos documentados.

#### Conceitos teóricos essenciais

- `CANONICO`: readiness vem dos RNF de operação e observabilidade; segue para auditoria e evita entrega sem prova.
- `CANONICO`: logs e configuração devem ser revistos sem expor dados sensíveis; entram como checklist e evitam fuga de informação.
- `DERIVADO`: uma decisão `GO_COM_RESSALVAS` é honesta quando há riscos controlados; evita forçar falso sucesso.
- `DERIVADO`: sinais técnicos devem apontar para comando, ficheiro ou screenshot; evitam decisões sem rastreabilidade.
- `CANONICO`: ambiente e CI/CD documentados reduzem risco de a aplicação só funcionar numa máquina.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Guia | `docs/planificacao/guias-bk/MF8/BK-MF8-04-painel-readiness-operacional.md` | Explica o trabalho, os passos e os critérios deste BK. |
| Evidence | `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md` | Guarda prova positiva, prova negativa, decisão e handoff. |
| App | `frontend/`, `backend/`, `tests/`, `scripts/` | Locais públicos a rever ou executar quando o passo pedir validação técnica. |
| Planeamento | `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | Fontes de owner, dependências, prioridade e RF/RNF. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- REVER: `frontend/`, `backend/`, `tests/` ou `scripts/` quando o passo pedir validação técnica.

#### Tutorial técnico linear

### Passo 1 - Definir fonte do readiness

1. Objetivo funcional do passo no contexto da app.

Identificar que documentos, comandos e evidências alimentam a decisão operacional.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 1 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Usa `BK-MF8-03`, evidence MF6/MF7/MF8 e scripts existentes como fontes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada fonte tem caminho e motivo.

7. Cenário negativo/erro esperado.

Fonte sem caminho ou dono não pode sustentar decisão.

### Passo 2 - Criar matriz de estados

1. Objetivo funcional do passo no contexto da app.

Definir estados para cada sinal: `PASS`, `PASS_COM_RESSALVAS`, `FAIL` e `NAO_APLICAVEL`.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 2 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Regista regras para mudar cada estado e impacto na decisão final.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando estados e decisão final ficam ligados.

7. Cenário negativo/erro esperado.

Se um `FAIL` crítico permitir `GO` sem justificação, a matriz está errada.

### Passo 3 - Definir indicador simples

1. Objetivo funcional do passo no contexto da app.

Calcular a decisão final com base nos sinais críticos e ressalvas.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 3 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Usa regra clara: sem bloqueios críticos para `GO`; riscos controlados para `GO_COM_RESSALVAS`; bloqueio P0/P1 para `NO_GO`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando outro aluno consegue aplicar a regra.

7. Cenário negativo/erro esperado.

Se a regra depender de opinião verbal, falta contrato.

### Passo 4 - Ligar checks técnicos

1. Objetivo funcional do passo no contexto da app.

Associar build, testes, smoke, hardening e regressão aos sinais da matriz.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 4 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Não reexecutes tudo neste passo; aponta para comandos e evidence de `BK-MF8-03` e `BK-MF8-08`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando cada check tem comando e output esperado.

7. Cenário negativo/erro esperado.

Check sem comando ou evidence fica como ressalva.

### Passo 5 - Validar configuração e ambiente

1. Objetivo funcional do passo no contexto da app.

Confirmar que variáveis, scripts e ficheiros sensíveis estão descritos sem valores privados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 5 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Lista nomes de variáveis necessárias e onde são documentadas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando não há segredo escrito na evidence.

7. Cenário negativo/erro esperado.

Se um valor sensível aparecer no documento, remove e marca falha de privacidade.

### Passo 6 - Registar estado de riscos

1. Objetivo funcional do passo no contexto da app.

Ligar riscos técnicos, visuais, dados e defesa à decisão de readiness.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 6 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Cada risco deve ter severidade, owner, mitigação e estado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando riscos sem mitigação impedem `GO`.

7. Cenário negativo/erro esperado.

Risco sem owner não pode ser aceite.

### Passo 7 - Entregar decisão de readiness

1. Objetivo funcional do passo no contexto da app.

Fechar decisão e handoff para auditoria administrativa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro novo neste passo.
    - EDITAR: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: secção do passo 7 em `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.

3. Instruções do que fazer.

Escreve decisão, provas principais, ressalvas e ações antes de `BK-MF8-05`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental, analítico ou de validação final; por isso, o trabalho técnico é preencher a evidence com dados observáveis e não criar implementação nova.

5. Explicação do código.

Como não há código neste passo, a explicação incide sobre a decisão técnica: que prova foi recolhida, que risco evita, que contrato do BK protege e que informação fica preparada para o próximo passo.

6. Validação do passo.

A validação passa quando o handoff permite auditar admin sem reler todos os BKs.

7. Cenário negativo/erro esperado.

Se a decisão final não citar evidence, fica inválida.

#### Critérios de aceite

- O artefacto `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md` existe e referencia `BK-MF8-04`.
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

- Entrega principal: `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`.
- Próximo BK: `BK-MF8-05`.
- O handoff deve indicar decisões fechadas, ressalvas, riscos, blockers e owner da próxima ação.
- Se houver `FAIL`, o próximo BK só pode avançar com decisão explícita do orientador ou com correção registada.

#### Changelog

- `2026-06-27`: frase dos passos sem código uniformizada com acentuação portuguesa correta.
- `2026-06-27`: guia corrigido para a MF8 final de 10 BKs, com estrutura obrigatória, conceitos específicos, passos sem código declarados e critérios de evidence mais concretos.
