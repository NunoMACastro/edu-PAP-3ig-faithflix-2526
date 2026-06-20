# AUDITORIA-HIDRATACAO-MF6

## Header

- `project`: `FaithFlix`
- `mf_alvo`: `MF6`
- `bk_ids`: `BK-MF6-06`
- `modo`: `corrigir_apenas`
- `implementation_root`: `real_dev`
- `strict_scope`: `true`
- `output_mode`: `relatorio_e_resumo`
- `run_commands`: `true`
- `check_mf_coherence`: `true`
- `data`: `2026-06-20`

## Sumário executivo técnico

Foi executada correção em modo `corrigir_apenas` sobre `BK-MF6-06 - Validação técnica final por gate`, usando o relatório anterior como fonte dos findings confirmados.

O BK alvo foi corrigido dentro do escopo permitido. Não houve alterações em código real da app, documentos canónicos, mockup, prompts legacy ou BKs fora do alvo. A escrita desta execução ficou limitada a:

- `docs/planificacao/guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`

Estado final da correção: `OK`. O guia mantém a estrutura tutorial obrigatória, passa a usar placeholders seguros no gate final, remove sucesso antecipado, explicita diretórios de execução e preserva a coerência `MF5 -> MF6 -> MF7`.

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção atual | 0 | 0 | 1 |
| Depois da correção atual | 1 | 0 | 0 |

## Escopo e notas de worktree

- BK corrigido: `docs/planificacao/guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md`.
- BKs editados nesta execução: apenas `BK-MF6-06`.
- Código real editado nesta execução: nenhum.
- Relatório atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`.
- O worktree já continha alterações em todos os BKs de `MF6` e relatórios MF5/MF6 antes desta execução. Foram tratadas como trabalho existente e não foram revertidas.
- `real_dev/backend` e `real_dev/frontend` foram usados como referência estrutural validada para confirmar scripts e diretórios, não como contrato final nem como prova de execução dos BKs.
- A ausência atual de `docs/evidence/MF6/*.md` e dos scripts MF6 planeados no código real não foi tratada como falha do guia, porque estes ficheiros são outputs dos BKs de MF6.

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
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- Todos os BKs de `MF6`, com foco em `BK-MF6-01`, `BK-MF6-02`, `BK-MF6-03`, `BK-MF6-04`, `BK-MF6-05` e `BK-MF6-06`.
- Handoff MF5/MF7 relevante: `BK-MF5-06`, `BK-MF7-01` e `BK-MF7-02`.
- Packages reais: `package.json`, `real_dev/backend/package.json` e `real_dev/frontend/package.json`.

Documentos obrigatórios em falta: nenhum dos caminhos obrigatórios aplicáveis ficou em falta.

## Auditoria por BK

| BK | Estado antes | Estado depois | Fundamentação |
| --- | --- | --- | --- |
| `BK-MF6-06` | CRITICO | OK | O guia foi corrigido para remover `PASS`/decisão final pré-preenchidos, usar placeholders `PREENCHER_COM_*`, exigir output real, indicar diretórios de execução e bloquear `GO` quando existir `PENDENTE` ou `FAIL`. |

## Findings da auditoria atual

### F-MF6-06-CRIT-01 - Gate final vinha com sucesso pré-preenchido

- Severidade original: `CRITICO`.
- Estado de correção nesta execução: `CORRIGIDO`.
- BK/RF/RNF: `BK-MF6-06`, transversal, gate S12.
- Evidência antes: o template de `GATE-S12-MF6.md` trazia `Decisão: GO_COM_RESSALVAS`, linhas `PASS` para todos os BKs `BK-MF6-01..05` e comandos também marcados como `PASS`.
- Correção aplicada:
  - A decisão passou para `PREENCHER_COM_GO_OU_GO_COM_RESSALVAS_OU_NO_GO`.
  - As linhas de proof, negativos e estado passaram para `PREENCHER_COM_PASS_OU_FAIL_OU_PENDENTE`.
  - O template passou a explicar que `PENDENTE` bloqueia `GO`.
  - O guia passou a proibir explicitamente escrever `PASS`, `GO` ou `GO_COM_RESSALVAS` antes de output real.
- Validação de fecho: pesquisa no BK alvo já não encontra `Decisão: GO_COM_RESSALVAS` nem tabelas preenchidas com `PASS` como resultado final; as ocorrências restantes de `PASS` estão em placeholders ou regras de decisão.

### F-MF6-06-CRIT-02 - Comandos do gate perdiam o diretório correto de execução

- Severidade original: `CRITICO`.
- Estado de correção nesta execução: `CORRIGIDO`.
- BK/RF/RNF: `BK-MF6-06`, transversal, gate S12.
- Evidência antes: o gate listava `node --test tests/regression/mf6-backend-regression.test.js`, `node scripts/check-frontend-regression.mjs` e `npm run build` sem `cd`, `Diretório` ou `npm --prefix`.
- Correção aplicada:
  - A matriz de comandos passou a ter coluna `Diretório`.
  - Comandos backend foram associados a `real_dev/backend`.
  - Comandos frontend foram associados a `real_dev/frontend`.
  - Comandos documentais ficaram associados à raiz do repositório.
  - A validação final passou a mostrar a sequência com `cd real_dev/backend` e `cd ../frontend`.
- Validação de fecho: os comandos agregados no BK alvo aparecem agora com diretório explícito na matriz e no bloco de validação final.

## Observações sem finding aberto

- A estrutura formal do BK alvo está presente: `Objetivo`, `Importância`, `Scope-in`, `Scope-out`, `Estado antes e depois`, `Pre-requisitos`, `Glossário`, `Conceitos teóricos essenciais`, `Arquitetura do BK`, `Ficheiros`, `Tutorial técnico linear`, `Critérios`, `Validação`, `Evidence`, `Handoff` e `Changelog`.
- O tutorial tem 5 passos e cada passo usa os pontos 1 a 7.
- A ausência atual de `docs/evidence/MF6/*.md` no repositório real não é finding do guia, porque estes ficheiros são outputs previstos pelos BKs de MF6.
- `GO_COM_RESSALVAS` permanece como categoria `DERIVADO`, mas já não aparece como decisão final pré-preenchida.

## Evidência objetiva do BK alvo

- Estrutura obrigatória: `PASS`.
- Passos 1 a 7: `PASS`.
- Evidence sem sucesso antecipado: `PASS`. O gate usa placeholders e bloqueia `GO` quando houver `PENDENTE` ou `FAIL`.
- Executabilidade dos comandos: `PASS`. O gate distingue raiz, `real_dev/backend` e `real_dev/frontend`.
- Coerência com BKs anteriores: `PASS`. `BK-MF6-06` consome evidence dos BKs `BK-MF6-01..05` sem fingir resultados.
- Coerência com MF7: `PASS` para o handoff do BK alvo. `BK-MF7-01` e `BK-MF7-02` continuam fora do escopo de correção.
- Dependências novas: `PASS`. O BK não introduz dependências.
- Segurança e privacidade: `PASS`. O gate deixa de poder mascarar falhas de `BK-MF6-03` como sucesso.

## Mapa de integração da MF

### `BK-MF6-06`

- Ficheiros criados pelo guia: `docs/evidence/MF6/GATE-S12-MF6.md`.
- Ficheiros editados pelo guia: nenhum.
- Ficheiros revistos pelo guia: `docs/evidence/MF6/*.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `BK-MF5-06`, BKs de `MF6`, `BK-MF7-01`, `BK-MF7-02`, `real_dev/backend/package.json` e `real_dev/frontend/package.json`.
- Ficheiros editados nesta execução: `docs/planificacao/guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md` e este relatório.
- Exports produzidos: nenhum.
- Imports consumidos: nenhum.
- Endpoints criados: nenhum.
- DTOs/validators criados: nenhum.
- Schemas/modelos criados: nenhum.
- Services criados: nenhum.
- Componentes/páginas frontend criados: nenhum.
- Providers de IA criados ou usados: nenhum.
- Regras de segurança/autorização aplicadas: nenhuma nova; o gate verifica que as regras criadas nas fases anteriores continuam evidenciadas.
- Testes/verificações consumidos pelo guia: regressão backend, regressão frontend, hardening, performance, acessibilidade/UX, `git diff --check` e `scripts/validate-planificacao.sh`.
- BKs seguintes que dependem destes elementos: `BK-MF7-01` e `BK-MF7-02`.

## Decisões técnicas confirmadas

- Backend real: `real_dev/backend`.
- Frontend real: `real_dev/frontend`.
- O `package.json` da raiz não tem `build`; o build Vite está em `real_dev/frontend/package.json`.
- `BK-MF6-01` manda executar regressão backend em `real_dev/backend`.
- `BK-MF6-02` manda executar regressão frontend e build em `real_dev/frontend`.
- `BK-MF6-03`, `BK-MF6-04` e `BK-MF6-05` usam evidence com placeholders, não sucesso antecipado.
- O gate S12 deve consolidar evidence real e não substituir a validação humana do orientador.

## Decisões de domínio confirmadas

- `MF6` é hardening: regressão, segurança, privacidade, performance, acessibilidade e validação técnica final.
- `BK-MF6-06` é transversal e P0, com owner `Nuno`, tal como definido em `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`.
- `BK-MF7-01` depende de `BK-MF6-06` para iniciar matriz RF -> evidência.
- `BK-MF7-02` depende de `BK-MF6-06` para matriz RNF -> validação.
- O gate não cria funcionalidade de produto, endpoints, roles, modelos, pagamentos, streaming avançado, IA ou integrações externas.

## Decisões marcadas como DERIVADO

- `GO_COM_RESSALVAS` como categoria prática entre `GO` e `NO_GO`.
- Uso de uma matriz única `GATE-S12-MF6.md` para consolidar evidence de `BK-MF6-01..05`.
- Uso de coluna `Diretório` no gate para tornar comandos multi-root reproduzíveis.

## Drift documental encontrado

- `docs/planificacao/guias-bk/README.md` ainda descreve contrato legacy com bloco pedagógico/operacional e snippet técnico. Tratamento: fora de scope por `STRICT_SCOPE=true`.
- `BK-MF7-01` e `BK-MF7-02` ainda usam formato legacy com `Bloco pedagogico`, `Snippet tecnico aplicavel` e pseudo-checklists. Tratamento: drift de MF seguinte registado; não editado porque o alvo é `BK-MF6-06`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` marca MF6 como `TODO`/`0/6`, enquanto os BKs de MF6 já existem e estão a ser auditados/corrigidos. Tratamento: drift documental registado, sem edição por scope.
- A pesquisa de claims proibidos encontra `CDN`, `DRM`, `streaming adaptativo` e `IA generativa` apenas no `Scope-out` de `BK-MF6-05`. Tratamento: falso positivo legítimo.
- A pesquisa de drift de outras PAPs encontra `IVA` apenas como substring textual em palavras como `DERIVADO` e `OBJETIVA`. Tratamento: falso positivo textual.

## Riscos restantes

- A evidence real de `MF6` ainda precisa ser criada/validada quando os BKs forem executados pelos alunos.
- `BK-MF7-01` e `BK-MF7-02` continuam em formato legacy, mas estão fora do escopo desta correção.
- O worktree continha alterações prévias em BKs de MF6; esta correção não tentou determinar autoria nem reverter essas alterações.

## Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: coerência de headers preservada. `BK-MF5-06` aponta para `BK-MF6-01` e `BK-MF6-01/02` dependem de `BK-MF5-06`.
- `MF6 interna`: coerência preservada. `BK-MF6-06` consome outputs de `BK-MF6-01..05` e já não afirma sucesso antes de evidence real.
- `MF6 -> MF7`: dependência preservada nos headers (`BK-MF7-01` e `BK-MF7-02` dependem de `BK-MF6-06`); o handoff agora distingue evidence real, `PENDENTE` e `FAIL`.

## Verificações textuais e comandos

| Comando/verificação | Resultado |
| --- | --- |
| `rg` de termos internos/proibidos em `docs/planificacao/guias-bk/MF6/*.md` | FALSO POSITIVO: `CDN`, `DRM`, `streaming adaptativo` e `IA generativa` aparecem apenas no `Scope-out` de `BK-MF6-05` |
| `rg` de drift de outras PAPs em `docs/planificacao/guias-bk/MF6/*.md` | FALSO POSITIVO: `IVA` ocorre apenas como substring em `DERIVADO`/`OBJETIVA` |
| Verificação de estrutura do BK alvo | PASS: secções obrigatórias presentes e 5 passos com pontos 1 a 7 |
| Verificação de `PASS` pré-preenchido no BK alvo | PASS: sem decisão final pré-preenchida; ocorrências restantes estão em placeholders ou regras de decisão |
| Verificação de paths/scripts reais | PASS: comandos do gate têm diretório explícito |
| Verificação de packages | PASS: build associado a `real_dev/frontend` |
| `git diff --check` | PASS: sem whitespace errors reportados |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks=55`, `checked_guides=55`, `errors=[]` |

## Bloqueios ou TODOs restantes

- `TODO (BLOCKER)`: nenhum documento obrigatório em falta impede a correção.
- Findings abertos no BK alvo: nenhum.
- Estado final do BK alvo: `OK`.
- Correção de BKs: executada apenas para `BK-MF6-06`, conforme `MODO=corrigir_apenas` e `STRICT_SCOPE=true`.

## Resumo final obrigatório

- MF processada: `MF6`.
- Número de BKs analisados: 1 alvo (`BK-MF6-06`), com leitura de coerência da MF completa e handoff MF5/MF7.
- Contagem OK/PARCIAL/CRITICO antes: `OK=0`, `PARCIAL=0`, `CRITICO=1`.
- Contagem OK/PARCIAL/CRITICO depois: `OK=1`, `PARCIAL=0`, `CRITICO=0`.
- BKs editados: `BK-MF6-06`.
- Principais lacunas corrigidas: sucesso pré-preenchido no gate, comandos sem diretório, ausência de placeholders seguros e ausência de bloqueio explícito para `PENDENTE`.
- Decisões técnicas confirmadas: `real_dev/backend`, `real_dev/frontend`, build Vite em `real_dev/frontend`, regressão backend em `real_dev/backend` e gate com diretório explícito.
- Decisões de domínio confirmadas: `BK-MF6-06` é gate transversal P0; `MF7` depende deste gate para matrizes RF/RNF.
- Decisões marcadas como `DERIVADO`: `GO_COM_RESSALVAS`, matriz única de gate e coluna `Diretório`.
- Drift documental encontrado: README de guias legacy, MF7 ainda legacy, backlog MF6 ainda `TODO/0/6` e falsos positivos de pesquisas estáticas.
- Riscos restantes: evidence real de MF6 ainda precisa ser preenchida quando os BKs forem executados; MF7 legacy fora de scope.
- Coerência MF anterior -> MF alvo -> MF seguinte: preservada.
- Verificações textuais executadas: pesquisas estáticas obrigatórias, verificação de estrutura, verificação de `PASS` antecipado, verificação de packages, `git diff --check` e `bash scripts/validate-planificacao.sh`.
- Resultado de `git diff --check`: PASS.
- Resultado de `bash scripts/validate-planificacao.sh`: PASS, `checked_bks=55`, `checked_guides=55`, `errors=[]`.
- Bloqueios ou TODOs restantes: sem blocker documental; sem finding aberto no BK alvo.

## Changelog

- `2026-06-19`: relatório anterior centrado em `BK-MF6-04`.
- `2026-06-20`: auditoria anterior em modo `auditar_apenas` sobre `BK-MF6-05`; estado final `OK`; nenhum BK editado.
- `2026-06-20`: auditoria em modo `auditar_apenas` sobre `BK-MF6-06`; estado final `CRITICO`; nenhum BK editado.
- `2026-06-20`: correção em modo `corrigir_apenas` sobre `BK-MF6-06`; estado final `OK`; 2 findings críticos corrigidos.
