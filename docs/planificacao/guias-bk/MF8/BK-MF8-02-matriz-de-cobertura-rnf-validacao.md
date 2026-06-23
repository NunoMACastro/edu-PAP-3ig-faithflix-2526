# BK-MF8-02 - Matriz de cobertura RNF -> validacao

## Header

- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Davi`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-01`
- `rf_rnf`: `RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF32, RNF33, RNF35, RNF36, RNF38, RNF39, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-matriz-de-cobertura-rnf-validacao.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK a equipa vai ligar RNF finais a validacao e ressalvas dentro da nova MF8, que concentra consolidacao, evidencia, defesa, buffer e fecho.
Origem semantica: antigo BK-MF7-02. O resultado observavel e docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md.

#### Importância

A MF8 existe para provar, defender e fechar. O foco nao e abrir funcionalidades novas, mas organizar evidence, corrigir bloqueantes aprovados e preparar entrega final.

#### Scope-in

- Consolidar evidence e decisoes.
- Registar prova, riscos e negativos.
- Manter cadeia canonica de BKs.
- Preparar handoff para o proximo BK.

#### Scope-out

- Reabrir escopo funcional sem decisao canonica.
- Mascarar falhas como sucesso.
- Criar evidence sem fonte verificavel.
- Transformar buffer em novas features.

#### Estado antes e depois

- Estado antes: a dependencia `BK-MF8-01` deve estar concluida ou explicitamente validada.
- Estado antes: a equipa ainda nao tem a evidence deste BK fechada.
- Estado depois: existe evidence objetiva em `docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md`.
- Estado depois: o handoff para `BK-MF8-03` fica claro.

#### Pré-requisitos

- Consultar docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md.
- Consultar docs/planificacao/backlogs/BACKLOG-MVP.md, MATRIZ-CANONICA-BK.md, CONTRATO-CAMPOS-BK.md e MF-VIEWS.md.
- Consultar docs/RF.md e docs/RNF.md.
- Usar caminhos publicados: frontend/..., backend/..., docs/... e scripts/... .

#### Glossário

- Evidence: prova objetiva em screenshot, log, teste, request/response ou checklist.
- Gate: decisao formal de avancar, avancar com ressalvas ou bloquear.
- Negativo: cenario em que o sistema deve bloquear, avisar ou falhar de forma controlada.
- Handoff: informacao minima para o BK seguinte continuar sem adivinhar.

#### Conceitos teóricos essenciais

- Consolidacao de evidence organiza prova ja existente e nao inventa maturidade.
- Uma boa defesa liga cada afirmacao a RF/RNF, BK, teste, screenshot ou decisao.
- Risco residual e diferente de bug bloqueante.
- Scope freeze impede que a reta final destrua estabilidade.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Frontend | frontend/src/... | UI, navegacao, estados e validacao visual quando aplicavel. |
| Backend | backend/src/... | Autoridade de sessao, role e codigos 401/403 quando aplicavel. |
| Evidence | docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md | Prova objetiva do BK. |
| Handoff | BK-MF8-03 | Entrada para o BK seguinte. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md
- REVER: docs/RF.md
- REVER: docs/RNF.md
- REVER: docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md

#### Tutorial técnico linear

### Passo 1 - Confirmar entrada do BK

1. Objetivo funcional do passo no contexto da app.

Confirmar dependencia, ficheiros, fonte canonica e criterio de aceite antes de editar ou fechar evidence.

2. Ficheiros envolvidos.

- Usar os ficheiros listados neste guia.

3. Instrucoes do que fazer.

Trabalhar por passos pequenos. Se faltar fonte ou validacao, marcar TODO (BLOCKER) com owner e criterio de fecho.

4. Codigo completo, correto e integrado com a app final.

Sem codigo obrigatorio neste passo; quando houver codigo, deve ser completo, integrado e comentado nos pontos de auth, permissao, estado React ou validacao.

5. Explicacao do codigo.

Explicar o que mudou, porque existe neste BK, que contrato cumpre, que risco evita, como testar e que partes nao devem ser alteradas sem nova decisao.

6. Validacao do passo.

Resultado esperado: passo reproduzivel por outro elemento da equipa e registado na evidence.

7. Cenario negativo/erro esperado.

Registar um caso em que a permissao, responsividade, dado vazio, erro ou falta de evidence deve bloquear fecho.

### Passo 2 - Construir artefacto principal

1. Objetivo funcional do passo no contexto da app.

Executar o trabalho principal do BK de forma incremental, preservando contratos anteriores.

2. Ficheiros envolvidos.

- Usar os ficheiros listados neste guia.

3. Instrucoes do que fazer.

Trabalhar por passos pequenos. Se faltar fonte ou validacao, marcar TODO (BLOCKER) com owner e criterio de fecho.

4. Codigo completo, correto e integrado com a app final.

Sem codigo obrigatorio neste passo; quando houver codigo, deve ser completo, integrado e comentado nos pontos de auth, permissao, estado React ou validacao.

5. Explicacao do codigo.

Explicar o que mudou, porque existe neste BK, que contrato cumpre, que risco evita, como testar e que partes nao devem ser alteradas sem nova decisao.

6. Validacao do passo.

Resultado esperado: passo reproduzivel por outro elemento da equipa e registado na evidence.

7. Cenario negativo/erro esperado.

Registar um caso em que a permissao, responsividade, dado vazio, erro ou falta de evidence deve bloquear fecho.

### Passo 3 - Validar negativos e ressalvas

1. Objetivo funcional do passo no contexto da app.

Validar comportamento esperado e pelo menos os negativos obrigatorios da prioridade.

2. Ficheiros envolvidos.

- Usar os ficheiros listados neste guia.

3. Instrucoes do que fazer.

Trabalhar por passos pequenos. Se faltar fonte ou validacao, marcar TODO (BLOCKER) com owner e criterio de fecho.

4. Codigo completo, correto e integrado com a app final.

Sem codigo obrigatorio neste passo; quando houver codigo, deve ser completo, integrado e comentado nos pontos de auth, permissao, estado React ou validacao.

5. Explicacao do codigo.

Explicar o que mudou, porque existe neste BK, que contrato cumpre, que risco evita, como testar e que partes nao devem ser alteradas sem nova decisao.

6. Validacao do passo.

Resultado esperado: passo reproduzivel por outro elemento da equipa e registado na evidence.

7. Cenario negativo/erro esperado.

Registar um caso em que a permissao, responsividade, dado vazio, erro ou falta de evidence deve bloquear fecho.

### Passo 4 - Fechar handoff

1. Objetivo funcional do passo no contexto da app.

Atualizar evidence, riscos e entrada do proximo BK.

2. Ficheiros envolvidos.

- Usar os ficheiros listados neste guia.

3. Instrucoes do que fazer.

Trabalhar por passos pequenos. Se faltar fonte ou validacao, marcar TODO (BLOCKER) com owner e criterio de fecho.

4. Codigo completo, correto e integrado com a app final.

Sem codigo obrigatorio neste passo; quando houver codigo, deve ser completo, integrado e comentado nos pontos de auth, permissao, estado React ou validacao.

5. Explicacao do codigo.

Explicar o que mudou, porque existe neste BK, que contrato cumpre, que risco evita, como testar e que partes nao devem ser alteradas sem nova decisao.

6. Validacao do passo.

Resultado esperado: passo reproduzivel por outro elemento da equipa e registado na evidence.

7. Cenario negativo/erro esperado.

Registar um caso em que a permissao, responsividade, dado vazio, erro ou falta de evidence deve bloquear fecho.

#### Critérios de aceite

- docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md criado/atualizado.
- Todas as linhas relevantes tem fonte verificavel.
- Negativos minimos por prioridade registados.
- Handoff para BK-MF8-03 claro.

#### Validação final

- Executar bash scripts/validate-planificacao.sh.
- Executar git diff --check.
- Executar pesquisa estatica de caminhos privados nos docs publicados.
- Confirmar pr/proof/neg/fonte na evidence.

#### Evidence para PR/defesa

- pr: referencia da entrega deste BK.
- proof: docs/evidence/MF8/MATRIZ-RNF-VALIDACAO.md.
- neg: negativos proporcionais a P0.
- fonte: RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF32, RNF33, RNF35, RNF36, RNF38, RNF39, RNF40.

#### Handoff

- Entregar evidence preenchida.
- Proximo BK: BK-MF8-03.
- Listar riscos, bloqueios e decisoes aceites.

#### Changelog

- `2026-06-22`: guia criado/reestruturado na reorganizacao documental MF7/MF8.
