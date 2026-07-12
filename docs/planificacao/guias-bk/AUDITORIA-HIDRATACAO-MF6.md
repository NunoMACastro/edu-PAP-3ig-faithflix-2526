# Auditoria de hidratação e correção de guias BK - MF6

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-20`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: auditoria pedagógica dos seis guias MF6 da lane STUDENT e comparação estática datada com `real_dev` na lane REFERENCE, observadas em 2026-06-20; não prova o estado atual nem promove os BK dos alunos

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF6`
- `project`: `FaithFlix`
- `macro`: `MF6`
- `modo`: `auditar_apenas`
- `data`: `2026-06-20`
- `timezone`: `Europe/Lisbon`
- `area`: `docs/planificacao/guias-bk`
- `implementation_root`: `real_dev`
- `comparison_lane`: `REFERENCE`
- `target_lane`: `STUDENT`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `run_commands`: `true`
- `status`: `concluido_auditado`
- `acao_sobre_bks`: nenhuma. Esta execução apenas cria o relatório.
- `ficheiro_gerado`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`

## Fronteira entre lanes neste snapshot

A lane `STUDENT` é o alvo pedagógico desta auditoria de hidratação. Todas as
menções a `real_dev`, aos respetivos ficheiros, comandos ou resultados são uma
comparação auxiliar da lane `REFERENCE`; não representam a implementação dos
alunos, não alteram o estado dos seus BK e não constituem prova atual.

## Resultado executivo

Foram auditados os 6 BKs da `MF6 - Hardening técnico`:

- `BK-MF6-01` - Suite de regressão backend
- `BK-MF6-02` - Suite de regressão frontend
- `BK-MF6-03` - Hardening segurança e privacidade
- `BK-MF6-04` - Otimização de performance crítica
- `BK-MF6-05` - Acessibilidade e UX final
- `BK-MF6-06` - Validação técnica final por gate

Contagem observada no início desta execução:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 6 | 0 | 0 |

Contagem depois desta execução:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 6 | 0 | 0 |

Resumo: os BKs da `MF6` já seguem a estrutura pedagógica exigida pela prompt ativa, têm headers completos, secções obrigatórias em ordem, passos com pontos 1 a 7, código real quando aplicável, validação por passo, negativos e evidence sem sucesso antecipado. Esta execução não editou guias BK por estar em `MODO=auditar_apenas`.

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
- `docs/planificacao/guias-bk/MF0/`
- `docs/planificacao/guias-bk/MF1/`
- `docs/planificacao/guias-bk/MF2/`
- `docs/planificacao/guias-bk/MF3/`
- `docs/planificacao/guias-bk/MF4/`
- `docs/planificacao/guias-bk/MF5/`
- `docs/planificacao/guias-bk/MF6/`
- `docs/planificacao/guias-bk/MF7/`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `real_dev/backend`
- `real_dev/frontend`

Observações:

- `MATRIZ-RF-RNF-POR-BK.md` e `SCORECARD-OFICIAL-POR-SPRINT.md` são aliases de compatibilidade. A fonte operacional real permanece `MATRIZ-CANONICA-BK.md` e `SCORECARD-SPRINTS.md`.
- Nenhum documento obrigatório esteve em falta.

## Base canónica confirmada

- `CANONICO`: `MF6` cobre hardening técnico, regressão backend/frontend, segurança, privacidade, performance, acessibilidade e validação técnica final.
- `CANONICO`: `BK-MF6-01` cobre regressão backend e cobertura secundária de `RNF29`.
- `CANONICO`: `BK-MF6-02` cobre regressão frontend e cobertura secundária de `RNF29`.
- `CANONICO`: `BK-MF6-03` cobre `RNF14`, `RNF16`, `RNF17`, `RNF18`, `RNF19`, `RNF20` e `RNF37`.
- `CANONICO`: `BK-MF6-04` cobre `RNF09`, `RNF10`, `RNF11` e `RNF12`.
- `CANONICO`: `BK-MF6-05` cobre `RNF01`, `RNF02`, `RNF03`, `RNF04` e `RNF06`.
- `CANONICO`: `BK-MF6-06` é transversal e fecha o gate técnico antes de `MF7`.
- `CANONICO`: `Sprint 10` inclui `BK-MF5-06`, `BK-MF6-01` e `BK-MF6-02`.
- `CANONICO`: `Sprint 11` inclui `BK-MF6-03..06`, `BK-MF7-01` e `BK-MF7-02`.
- `CANONICO`: `BK-MF6-06` entrega handoff para `BK-MF7-01`; `BK-MF7-01` e `BK-MF7-02` dependem de `BK-MF6-06`.
- `CANONICO`: a stack real validável nesta execução é `real_dev/backend` e `real_dev/frontend`.

## Decisões DERIVADO observadas

- `BK-MF6-01`: usar base em memória para regressão backend, preservando services reais e evitando dependência de MongoDB real durante a suite.
- `BK-MF6-02`: usar leitura estática de rotas/ficheiros porque não existe E2E browser configurado nesta fase.
- `BK-MF6-03`: usar scanner estático simples sem dependências novas porque a PAP não define ferramenta externa obrigatória de security scanning.
- `BK-MF6-04`: usar rajada local de 20 pedidos e P95 como aproximação escolar para degradação evidente, sem a apresentar como prova de 100 utilizadores em produção.
- `BK-MF6-05`: usar `SkipLink` e larguras `390px`, `768px` e `1280px` como baseline prático de acessibilidade/responsividade.
- `BK-MF6-06`: permitir `GO_COM_RESSALVAS` para diferenciar falhas não críticas de bloqueios reais no gate.

## Auditoria por BK

| BK | Estado | Justificação |
| --- | --- | --- |
| `BK-MF6-01` | OK | Guia completo para regressão backend: cria suite `node --test` com base em memória, cobre autenticação, subscrições, reprodução, rotação da pool e endpoints admin herdados de `MF5`. Tem evidence sem `PASS` antecipado e negativos objetivos. |
| `BK-MF6-02` | OK | Guia completo para regressão frontend: cria script estático, valida rotas principais, páginas críticas, `credentials: "include"` e build Vite. Os passos documentais sem código dizem explicitamente `Sem código neste passo.` e justificam a validação. |
| `BK-MF6-03` | OK | Guia completo de segurança/privacidade: cria scanner sem dependências novas, exige revisão manual de módulos críticos, inclui política de backups para `RNF20`, protege segredos e recomendações, e regista evidence com placeholders seguros. |
| `BK-MF6-04` | OK | Guia completo de performance: adiciona paginação ao catálogo, mede catálogo, pesquisa, recomendações autenticadas e P95 local, mantém validações/guards, não imprime cookie e documenta o limite da aproximação local. |
| `BK-MF6-05` | OK | Guia completo de acessibilidade/UX: cria `SkipLink`, liga layout principal, adiciona estilos, normaliza navegação/textos/player e exige validação manual com teclado, larguras e evidence real. |
| `BK-MF6-06` | OK | Guia completo de gate: consolida evidence dos BKs `BK-MF6-01..05`, obriga diretórios corretos para comandos, cria matriz `GATE-S12-MF6.md`, valida cadeia `MF5 -> MF6 -> MF7` e impede decisão final sem output real. |

## Findings

Não existem findings abertos nesta execução.

## Observações não bloqueantes

- Os placeholders `PREENCHER_COM_*` aparecem apenas em templates de evidence ou gate e são acompanhados por instruções explícitas para não escrever `PASS`, `GO` ou resultados finais antes da execução real. Foram classificados como desenho correto, não como lacuna.
- Alguns passos não têm código porque são revisão, validação, execução de comandos ou consolidação documental. Esses passos declaram `Sem código neste passo.` e explicam o motivo.
- `BK-MF6-04` inclui um bloco curto só para imports de `catalog.service.js`; não precisa de JSDoc próprio porque não define função, classe, service ou componente.
- `BK-MF6-05` inclui uma zona exata de `PlaybackPage.jsx` em vez do componente inteiro. A localização está explícita e o bloco preserva handlers, `data-testid`, tracks e `controls`; por isso não foi classificado como snippet solto.

## Mapa de integração da MF

| BK | Ficheiros criados/editados/revistos | Contratos/exports | Endpoints/comandos | Segurança/autorização | Dependentes |
| --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | Cria `real_dev/backend/tests/regression/mf6-backend-regression.test.js` e `docs/evidence/MF6/BK-MF6-01-regressao-backend.md`; revê `package.json`, smoke e testes MF5. | Suite de regressão com helpers de base em memória e uso de services reais. | `node --test tests/regression/mf6-backend-regression.test.js`, `npm test`, `npm run smoke`. | Testa auth, role admin, validações, subscrição, playback e rotação sem serviços externos. | `BK-MF6-02`, `BK-MF6-03`, `BK-MF6-06`. |
| `BK-MF6-02` | Cria `real_dev/frontend/scripts/check-frontend-regression.mjs` e `docs/evidence/MF6/BK-MF6-02-regressao-frontend.md`; revê rotas, páginas, `apiClient` e build. | Verificação de rotas, páginas essenciais e `credentials: "include"`. | `node scripts/check-frontend-regression.mjs`, `npm run build`. | Protege sessão por cookie no frontend e evita rotas/imports partidos. | `BK-MF6-03`, `BK-MF6-04`, `BK-MF6-05`, `BK-MF6-06`. |
| `BK-MF6-03` | Cria `real_dev/backend/scripts/check-security-baseline.mjs` e `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md`; revê auth, users, privacy, integrations, recommendations, logger e `apiClient`. | Scanner estático, revisão manual e evidence de backups/recuperação. | `node scripts/check-security-baseline.mjs`, regressão backend. | Cobre hashing, injection/XSS/CSRF/brute force por revisão/negativos, segredos fora do código, logs de auditoria, backups e uso de dados de recomendação. | `BK-MF6-04`, `BK-MF6-06`, `BK-MF7-02`. |
| `BK-MF6-04` | Edita validação/controller/service de catálogo; cria `real_dev/backend/scripts/measure-performance-baseline.mjs` e evidence de performance; revê pesquisa, recomendações e páginas frontend. | `parseCatalogPagination`, `listPublishedCatalog(queryParams)` e medidor local. | `GET /api/catalog?limit=12`, `GET /api/search?q=fe&limit=12`, `GET /api/recommendations/me`, P95 local. | Mantém filtro `published`, valida limites, exige cookie para recomendações e não regista sessão. | `BK-MF6-05`, `BK-MF6-06`, `BK-MF7-02`. |
| `BK-MF6-05` | Cria `SkipLink.jsx` e evidence UX; edita `AppLayout.jsx`, `global.css`, `AppHeader.jsx` e zona do player; revê `BaseButton`. | Skip link, `main#conteudo-principal`, foco visível, navegação PT-PT e player acessível. | `npm run build` e validação manual por teclado/responsividade. | Não altera auth, endpoints, cookies ou permissões; evita screenshots/evidence com dados sensíveis. | `BK-MF6-06`, `BK-MF7-02`. |
| `BK-MF6-06` | Cria `docs/evidence/MF6/GATE-S12-MF6.md`; revê evidence MF6, backlog, matriz, sprints e package scripts. | Matriz final de gate com `PASS`, `FAIL`, `PENDENTE`, `GO`, `GO_COM_RESSALVAS` ou `NO_GO`. | `git diff --check`, `bash scripts/validate-planificacao.sh`, comandos backend e frontend da MF6. | Bloqueia sucesso sem output real; separa diretórios corretos; consolida negativos e riscos residuais. | `BK-MF7-01`, `BK-MF7-02`. |

## Confirmação de integração

| Check | Resultado |
| --- | --- |
| Dois endpoints para a mesma ação | PASS: MF6 não cria endpoints duplicados; mede e valida endpoints existentes. |
| Dois schemas/modelos para a mesma entidade | PASS: MF6 não cria schemas concorrentes; consome contratos de MF2..MF5. |
| Nomes diferentes para o mesmo conceito | PASS: regressão, hardening, performance, UX e gate têm nomes estáveis e handoff claro. |
| Frontend chama endpoint inexistente | PASS documental: `BK-MF6-02` e `BK-MF6-04` validam rotas/API e preservam `items` no catálogo. |
| Service importa ficheiro não criado | PASS documental: imports novos são criados no próprio BK ou já existem em `real_dev`. |
| BK seguinte dependente de algo não entregue | PASS: `BK-MF6-06` consome evidence dos BKs anteriores e entrega matriz para `MF7`. |
| Regras de segurança aplicadas no backend | PASS documental: regressão e hardening validam auth, roles, validação, logs, segredos e minimização. |
| Evidence sem sucesso antecipado | PASS: placeholders existem para impedir `PASS`/`GO` fictício e são explicitamente rejeitados no gate. |

## Coerência MF anterior -> MF alvo -> MF seguinte

- `MF5 -> MF6`: `BK-MF5-06` entrega integrações admin, métricas e contratos administrativos que `BK-MF6-01`, `BK-MF6-02` e `BK-MF6-03` validam por regressão/hardening. A cadeia de `proximo_bk` está correta.
- `MF6 interna`: regressão backend e frontend abrem a macro; hardening usa regressão como base; performance e UX consolidam qualidade; `BK-MF6-06` fecha o gate com evidence real.
- `MF6 -> MF7`: `BK-MF6-06` entrega matriz de gate para `BK-MF7-01` e `BK-MF7-02`. `MF7` deve consumir estes resultados como evidence, não recriar provas sem comando.

## Drift documental encontrado

- `BACKLOG-MVP.md` ainda mostra `MF6` como `TODO 0/6`, apesar de os 6 guias existirem e estarem auditados. Isto é drift de tracking/gate, não falha dos guias MF6.
- `_TEMPLATE-BK.md` e `docs/planificacao/guias-bk/README.md` ainda contêm linguagem de contrato antigo (`Bloco pedagógico`, `Bloco operacional`, snippet obrigatório), enquanto MF6 segue a estrutura ativa de `#### Objetivo` até `#### Changelog`.
- `docs/RNF.md` mantém sugestões evolutivas como Next.js/Axios, Stripe, CDN/CloudFront e embeddings. Nesta auditoria foram tratadas como referência histórica/evolutiva, não como contrato técnico final para os BKs MF6.
- `BK-MF5-06` ainda referencia caminhos `apps/...` em alguns blocos, enquanto a execução atual usa `PRIVATE_IMPL_ALIAS=real_dev` e os BKs MF6 apontam para `real_dev/...`. Como `BK-MF5-06` está fora do alvo, o drift fica registado e não corrigido.
- `BK-MF7-01` e `BK-MF7-02` ainda estão no formato pedagógico antigo e genérico. A cadeia de dependências está correta, mas MF7 deverá ser hidratada antes de execução real.

## Riscos restantes

- A implementação real não foi alterada; esta execução apenas auditou guias BK e criou relatório, conforme `STRICT_SCOPE=true`.
- O fecho real de `MF6` depende dos alunos criarem as evidence em `docs/evidence/MF6/` e substituírem `PREENCHER_COM_*` por outputs reais.
- Os scripts previstos pelos BKs (`mf6-backend-regression`, `check-frontend-regression`, `check-security-baseline`, `measure-performance-baseline`) são contratos dos guias; esta auditoria não os criou em `real_dev`.
- O drift adjacente em `MF5-06`, template/README dos guias e MF7 permanece fora do scope desta execução.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Pesquisa obrigatória de termos proibidos nos BKs MF6 | PASS_COM_NOTA: única ocorrência foi em `BK-MF6-05` dentro de `Scope-out` para proibir CDN, DRM, streaming adaptativo real e IA generativa. |
| Pesquisa de drift de outras PAPs nos BKs MF6 | PASS_COM_NOTA: ocorrências são falsos positivos de `sala` dentro de palavras como `ressalvas` ou linhas `DERIVADO`; não há domínio OPSA/Orelle/StudyFlow. |
| Pesquisa estática proporcional em `real_dev/backend` e `real_dev/frontend` | PASS_COM_NOTA: ocorrências de `password`, `token`, `cookie`, `secret` e `mongodb://127.0.0.1` pertencem a auth/sessão, fixtures/testes, sanitização, README ou fallback local; não foi confirmado segredo real hardcoded nesta auditoria textual. |
| Estrutura obrigatória das secções | PASS: os 6 BKs têm as secções de `#### Objetivo` a `#### Changelog` em ordem. |
| Passos técnicos | PASS: os 6 BKs têm passos com pontos 1 a 7; passos sem código justificam `Sem código neste passo.` |
| Auditoria automática de blocos de código | PASS_COM_NOTA: os avisos mecânicos foram falsos positivos em bloco de imports e zona exata de JSX; blocos funcionais relevantes têm JSDoc/comentários didáticos. |
| `git diff --check` | PASS: sem erros de whitespace no diff. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |

## Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`

## Ficheiros BK editados nesta execução

Nenhum. `MODO=auditar_apenas`.

## TODOs e blockers restantes

- `TODO`: nenhum dentro dos BKs MF6 auditados.
- `BLOCKER`: nenhum documento obrigatório em falta para auditar `MF6`.
- `TODO fora de scope`: corrigir drift adjacente de `MF5-06`, atualizar `_TEMPLATE-BK.md`/README dos guias e hidratar `MF7` quando essa macrofase for alvo.
