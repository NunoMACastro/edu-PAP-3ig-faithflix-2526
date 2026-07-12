# Auditoria de hidratação e correcção de guias BK - MF5

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-16`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: auditoria pedagógica dos seis guias MF5 da lane STUDENT e comparação estática datada com `real_dev` na lane REFERENCE, observadas em 2026-06-16; não prova o estado atual nem promove os BK dos alunos

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF5`
- `project`: `FaithFlix`
- `macro`: `MF5`
- `modo`: `auditar_apenas`
- `data`: `2026-06-16`
- `timezone`: `Europe/Lisbon`
- `area`: `docs/planificacao/guias-bk`
- `implementation_root`: `real_dev`
- `comparison_lane`: `REFERENCE`
- `target_lane`: `STUDENT`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `run_commands`: `true`
- `status`: `concluido_auditado`
- `acao_sobre_bks`: nenhuma. Esta execução apenas actualiza o relatório.
- `ficheiro_gerado`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`

## Fronteira entre lanes neste snapshot

A lane `STUDENT` é o alvo pedagógico desta auditoria de hidratação. Todas as
menções a `real_dev`, aos respetivos ficheiros, comandos ou resultados são uma
comparação auxiliar da lane `REFERENCE`; não representam a implementação dos
alunos, não alteram o estado dos seus BK e não constituem prova atual.

## Resultado executivo

Foram auditados os 6 BKs da `MF5 - Operação e privacidade`:

- `BK-MF5-01` - Exportação de dados do utilizador
- `BK-MF5-02` - Eliminação de conta e dados
- `BK-MF5-03` - Gestão de consentimentos
- `BK-MF5-04` - Gestão de utilizadores admin
- `BK-MF5-05` - Painel de métricas admin
- `BK-MF5-06` - Configuração de integrações admin

Contagem observada no início desta execução:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 6 | 0 | 0 |

Contagem depois desta execução:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 6 | 0 | 0 |

Resumo: o estado actual dos BKs MF5 está pedagogicamente estruturado, autocontido e coerente com `RF55..RF60`, `MF4` e `MF6`. Esta execução não editou guias BK por estar em `MODO=auditar_apenas`; apenas confirmou que os 4 findings que existiam no relatório anterior já se encontram fechados no conteúdo actual.

Nota de workspace: antes desta auditoria já existiam alterações não commitadas em `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06` e neste relatório. Foram tratadas como estado actual do repositório e não foram revertidas.

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
- `docs/planificacao/guias-bk/MF0/`
- `docs/planificacao/guias-bk/MF1/`
- `docs/planificacao/guias-bk/MF2/`
- `docs/planificacao/guias-bk/MF3/`
- `docs/planificacao/guias-bk/MF4/`
- `docs/planificacao/guias-bk/MF5/`
- `docs/planificacao/guias-bk/MF6/`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- `real_dev/backend`
- `real_dev/frontend`
- `mockup/README.md`
- `mockup/src/app/pages/MinhaContaPage.tsx`
- `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md`

## Base canónica confirmada

- `CANONICO`: `MF5` cobre operação e privacidade com `RF55..RF60`.
- `CANONICO`: `BK-MF5-01` cobre exportação de dados (`RF55`).
- `CANONICO`: `BK-MF5-02` cobre eliminação de conta (`RF56`).
- `CANONICO`: `BK-MF5-03` cobre consentimentos (`RF57`).
- `CANONICO`: `BK-MF5-04` cobre gestão de utilizadores (`RF58`).
- `CANONICO`: `BK-MF5-05` cobre painel de métricas (`RF59`).
- `CANONICO`: `BK-MF5-06` cobre configuração de integrações (`RF60`).
- `CANONICO`: `BK-MF6-01` e `BK-MF6-02` dependem de contratos entregues por `BK-MF5-06`.
- `CANONICO`: operações administrativas críticas devem ter auditoria (`RNF19`).
- `CANONICO`: segredos devem ficar fora do código fonte e fora da base de dados (`RNF17`).
- `CANONICO`: a stack real validada usa Express 4, ES Modules, MongoDB driver oficial, React 18, Vite 5 e `fetch/apiClient`.

## Decisões DERIVADO observadas

- Exportação em JSON estruturado para `RF55`.
- Anonimização controlada da conta em vez de apagar a linha `users`.
- Categorias opcionais de consentimento: recomendações personalizadas, notificações operacionais e métricas anónimas.
- Reutilização do módulo `users` para `RF58`.
- Métricas admin apenas agregadas.
- Integrações controladas: notificações internas, pagamentos simulados e exportação analítica agregada.

## Auditoria por BK

| BK | Estado | Justificação |
| --- | --- | --- |
| `BK-MF5-01` | OK | Exportação usa `req.user.id`, remove campos sensíveis, inclui `content_comments`, `media_preferences` e contratos relevantes das MFs anteriores. O guia tem estrutura completa, passos 1 a 7 e teste de minimização. |
| `BK-MF5-02` | OK | Eliminação exige confirmação forte, revoga sessões, limpa dados pessoais e anonimiza conta/comentários sem apagar histórico operacional agregado. O fluxo prepara consentimentos e métricas sem expor dados pessoais. |
| `BK-MF5-03` | OK | Consentimentos usam sessão, validação booleana, histórico versionado e UI com loading/erro/sucesso. O teste final tem comentários didácticos suficientes no estado actual. |
| `BK-MF5-04` | OK | Gestão admin valida roles, estados e filtros; a pesquisa é escapada antes de `$regex`; a acção exige `requireRole(["admin"])` e regista `admin_audit_logs`. |
| `BK-MF5-05` | OK | Métricas são agregadas, protegidas por admin e excluem contas `blocked` e `deleted` da métrica `users.active`. A soma solidária usa `pool_distributions.totalPoolCents`. |
| `BK-MF5-06` | OK | Integrações usam lista fechada, não guardam segredos, exigem admin e preparam regressão MF6. O teste final tem comentários didácticos suficientes no estado actual. |

## Findings

Não existem findings abertos nesta execução.

## Findings anteriores reavaliados

| ID | Severidade | BK | Evidência actual | Impacto | Estado |
| --- | --- | --- | --- | --- | --- |
| `MF5-AUD-01` | MEDIA | `BK-MF5-03` | `BK-MF5-03:610` e `BK-MF5-03:624` explicam caso positivo e cenário negativo. | Lacuna pedagógica de comentários didácticos deixou de se reproduzir. | CORRIGIDO_SEM_VALIDACAO_TOTAL |
| `MF5-AUD-02` | ALTA | `BK-MF5-04` | `BK-MF5-04:127-198`, `BK-MF5-04:219-251`, `BK-MF5-04:692-707` validam filtros com `assertAdminUserFilters`, limite de 80 caracteres, escape literal para `$regex` e estado fechado. | Risco de regex arbitrária e filtros fora do contrato deixou de se reproduzir. | CORRIGIDO_SEM_VALIDACAO_TOTAL |
| `MF5-AUD-03` | MEDIA | `BK-MF5-05` | `BK-MF5-05:281-282` usa `{ accountStatus: { $nin: ["blocked", "deleted"] } }`. | Contas eliminadas deixam de aparecer como activas no painel admin. | CORRIGIDO_SEM_VALIDACAO_TOTAL |
| `MF5-AUD-04` | BAIXA | `BK-MF5-06` | `BK-MF5-06:680`, `BK-MF5-06:683`, `BK-MF5-06:697` explicam chave válida, configuração pública e negativos fora do MVP. | Lacuna pedagógica de comentários didácticos deixou de se reproduzir. | CORRIGIDO_SEM_VALIDACAO_TOTAL |

## Continuidade de contratos anteriores

- `content_comments` é usado em exportação e eliminação, alinhado com MF3.
- `media_preferences` está incluído em exportação e limpeza, alinhado com MF2.
- `privacyApi.js` preserva métodos de exportação e eliminação ao acrescentar consentimentos.
- `BK-MF5-04` preserva compatibilidade com `patchUserRole`/`updateUserRole`, mas define o contrato novo `PATCH /api/users/:id/admin`.
- `BK-MF5-05` usa `pool_distributions.totalPoolCents`, alinhado com `BK-MF4-05`.

## Mapa de integração da MF

| BK | Ficheiros previstos no guia | Contratos | Endpoints | Segurança/autorização | Dependentes |
| --- | --- | --- | --- | --- | --- |
| `BK-MF5-01` | `privacy.service.js`, `privacy.controller.js`, `privacy.routes.js`, `privacyApi.js`, `PrivacyExportPanel.jsx`, `AccountPage.jsx`, teste unitário | `buildUserDataExport`, `getMyDataExport`, `privacyRouter`, `privacyApi.exportMyData` | `GET /api/privacy/export` | `requireAuth`, ownership por `req.user.id`, minimização de campos sensíveis | `BK-MF5-02`, `BK-MF5-03`, `MF6` |
| `BK-MF5-02` | `privacy.validation.js`, extensões de `privacy.service/controller/routes`, `PrivacyDangerZone.jsx`, teste unitário | `assertDeleteAccountPayload`, `deleteMyAccount`, `deleteMyAccountController` | `DELETE /api/privacy/account` | `requireAuth`, confirmação forte, revogação de sessões, anonimização | `BK-MF5-03`, `MF6` |
| `BK-MF5-03` | extensões de `privacy.validation/service/controller/routes`, `PrivacyConsentsPanel.jsx`, teste unitário | `assertConsentPayload`, `getMyConsents`, `updateMyConsents` | `GET /api/privacy/consents`, `PUT /api/privacy/consents` | `requireAuth`, ownership por sessão, histórico sem dados sensíveis | `BK-MF5-04`, `MF6` |
| `BK-MF5-04` | `user.validation.js`, `user.service.js`, `user.controller.js`, `user.routes.js`, `userApi.js`, `AdminUsersPage.jsx`, teste unitário | `assertAdminUserUpdate`, `assertAdminUserFilters`, `listUsers(filters)`, `updateUserByAdmin` | `GET /api/users?search=&status=`, `PATCH /api/users/:id/admin` | `requireRole(["admin"])`, validação de filtros, protecção contra auto-bloqueio, `admin_audit_logs` | `BK-MF5-05`, `BK-MF5-06` |
| `BK-MF5-05` | `admin-metrics.*`, `metricsApi.js`, `AdminMetricsPage.jsx`, `AppRoutes.jsx`, teste unitário | `assertMetricsRange`, `getAdminMetrics`, `adminMetricsRouter` | `GET /api/admin/metrics` | `requireRole(["admin"])`, métricas agregadas sem dados pessoais | `BK-MF5-06`, `BK-MF6-01`, `BK-MF6-02` |
| `BK-MF5-06` | `integrations.*`, `integrationsApi.js`, `AdminIntegrationsPage.jsx`, `AppRoutes.jsx`, teste unitário | `assertIntegrationKey`, `assertIntegrationUpdate`, `listIntegrationSettings`, `updateIntegrationSetting` | `GET /api/admin/integrations`, `PATCH /api/admin/integrations/:key` | `requireRole(["admin"])`, lista fechada, sem segredos em BD, `admin_audit_logs` | `BK-MF6-01`, `BK-MF6-02`, `BK-MF6-03` |

## Confirmação de integração

| Check | Resultado |
| --- | --- |
| Endpoints duplicados para a mesma acção | PASS: endpoints têm responsabilidades separadas. |
| Nomes de colecções críticos | PASS: `content_comments`, `media_preferences`, `pool_distributions.totalPoolCents` e `trials` existem em `real_dev/backend`. |
| Frontend chama endpoints declarados no guia | PASS: cada cliente API novo aponta para endpoint declarado no respectivo BK. |
| Ownership em fluxos privados | PASS documental: exportação, eliminação e consentimentos usam `req.user.id`. |
| Roles admin | PASS documental: gestão de utilizadores, métricas e integrações exigem `requireRole(["admin"])`. |
| Validação de input | PASS: alteração admin e filtros de listagem admin têm validators documentados. |
| Métricas coerentes com eliminação | PASS: conta `deleted` fica excluída de `users.active`. |
| Preparação para MF6 | PASS: MF6 recebe endpoints claros e regressões específicas para filtros admin, métricas e integrações. |
| Mockup UI | PASS_COM_NOTA: `/minha-conta`, preferências de notificações e zona destrutiva foram usados apenas como referência visual/fluxo. |

## Coerência MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: a MF5 consome subscrições, tentativas de pagamento simuladas, trials, notificações, biblioteca, ratings, comentários, preferências de media e dados de conta criados nas fases anteriores. A auditoria confirmou os nomes críticos contra `real_dev/backend`.
- `MF5 interna`: exportação prepara eliminação; eliminação e consentimentos fecham self-service de privacidade; gestão admin prepara métricas e integrações.
- `MF5 -> MF6`: regressão backend/frontend deve cobrir `GET /api/privacy/export`, `DELETE /api/privacy/account`, consentimentos, `GET/PATCH /api/users`, métricas admin e integrações admin.

## Drift documental

- `_TEMPLATE-BK.md` ainda reflecte contrato pedagógico antigo, enquanto os BKs MF5 seguem a estrutura exigida pela prompt activa.
- `docs/RNF.md` e `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md` contêm referências evolutivas a tecnologias/serviços fora do contrato final, como Next.js/Axios, Firebase/Supabase, PostgreSQL, Stripe, CDN e qualidade adaptativa. Nesta auditoria foram tratados como drift ou referência visual, não como contrato técnico.
- O mockup usa `/minha-conta` e uma área de configurações/eliminação visualmente útil, mas o contrato real dos BKs usa `real_dev`, sessão por cookie e endpoints Express/MongoDB.

## Riscos restantes

- A implementação real não foi alterada; esta execução apenas auditou guias BK e actualizou o relatório, conforme `STRICT_SCOPE=true`.
- As alterações não commitadas nos BKs MF5-03..06 já existiam no início desta execução e permanecem no workspace.
- O drift documental de `_TEMPLATE-BK.md`, `docs/RNF.md` e `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md` permanece fora do scope desta auditoria.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Pesquisa obrigatória de termos proibidos nos BKs MF5 | PASS: sem ocorrências. |
| Pesquisa de drift de outras PAPs nos BKs MF5 | PASS_COM_NOTA: apenas falsos positivos de `IVA` dentro de `DERIVADO`; não há domínio fiscal ou outra PAP. |
| Pesquisa estática proporcional em `real_dev/backend` e `real_dev/frontend` | PASS_COM_NOTA: ocorrências de `password`, `token` e `cookie` pertencem a auth/sessão/testes ou documentação; `localStorage`/`sessionStorage` aparecem no README como comportamento fora de scope. |
| Estrutura obrigatória das secções | PASS: os 6 BKs têm as secções de `#### Objetivo` a `#### Changelog`. |
| Passos técnicos | PASS: os 6 BKs têm 5 passos e cada passo contém pontos 1 a 7. |
| Auditoria automática de blocos de código | PASS: todos os blocos com 8+ e 20+ linhas não vazias cumprem a regra mínima de comentários didácticos. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |

## Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`

## Ficheiros BK editados nesta execução

Nenhum. `MODO=auditar_apenas`.

## TODOs e blockers restantes

- `TODO`: nenhum dentro do scope desta execução.
- `BLOCKER`: nenhum blocker documental indispensável dentro do scope `MF5`.
