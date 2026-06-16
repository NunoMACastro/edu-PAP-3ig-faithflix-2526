# Auditoria de hidratação e correcção de guias BK - MF5

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF5`
- `project`: `FaithFlix`
- `macro`: `MF5`
- `modo`: `auditar_apenas`
- `data`: `2026-06-16`
- `timezone`: `Europe/Lisbon`
- `area`: `docs/planificacao/guias-bk`
- `implementation_root`: `real_dev`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `run_commands`: `true`
- `status`: `concluido_com_findings`
- `acao_sobre_bks`: nenhuma. Esta execução apenas actualiza o relatório.
- `ficheiro_gerado`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`

## Resultado executivo

Foram auditados os 6 BKs da `MF5 - Operação e privacidade`:

- `BK-MF5-01` - Exportação de dados do utilizador
- `BK-MF5-02` - Eliminação de conta e dados
- `BK-MF5-03` - Gestão de consentimentos
- `BK-MF5-04` - Gestão de utilizadores admin
- `BK-MF5-05` - Painel de métricas admin
- `BK-MF5-06` - Configuração de integrações admin

Contagem desta execução:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 2 | 4 | 0 |

Resumo: os BKs estão globalmente estruturados, autocontidos e coerentes com `RF55..RF60`, `MF4` e `MF6`. A auditoria reabre 4 findings `PARCIAL`: um risco técnico de validação em filtros admin, um desalinhamento de métrica de utilizadores activos com contas eliminadas e duas lacunas pedagógicas em blocos de teste sem comentários didácticos suficientes.

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
| `BK-MF5-01` | OK | Exportação usa `req.user.id`, remove campos sensíveis, inclui `content_comments`, `media_preferences` e contratos relevantes das MFs anteriores. |
| `BK-MF5-02` | OK | Eliminação exige confirmação forte, revoga sessões, limpa dados pessoais e anonimiza conta/comentários sem apagar histórico operacional agregado. |
| `BK-MF5-03` | PARCIAL | O fluxo está correcto, mas o teste final tem 27 linhas e não cumpre a regra rígida de comentários didácticos para blocos de teste com 20+ linhas. |
| `BK-MF5-04` | PARCIAL | A gestão admin cobre roles, estado e auditoria, mas o filtro `search` entra directamente em `$regex` sem escape/limite/validator próprio. |
| `BK-MF5-05` | PARCIAL | As métricas são agregadas e protegidas por admin, mas `users.active` conta contas com `accountStatus: "deleted"` porque usa apenas `{ accountStatus: { $ne: "blocked" } }`. |
| `BK-MF5-06` | PARCIAL | A configuração de integrações está alinhada com o MVP, não guarda segredos e usa lista fechada, mas o teste final tem 27 linhas e não cumpre a regra rígida de comentários didácticos para blocos de teste com 20+ linhas. |

## Findings

| ID | Severidade | BK | Evidência | Impacto | Recomendação | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| `MF5-AUD-01` | MEDIA | `BK-MF5-03` | `BK-MF5-03:603-633` | O teste de consentimentos é executável, mas não ensina a intenção dos asserts nem cumpre a regra de 2 comentários didácticos em blocos com 20+ linhas. | Acrescentar comentários didácticos junto do caso positivo e do cenário negativo. Opcionalmente extrair fixtures nomeadas se melhorar a leitura. | PARCIAL |
| `MF5-AUD-02` | ALTA | `BK-MF5-04` | `BK-MF5-04:214-221` usa `{ $regex: search, $options: "i" }` com `search` vindo de `req.query`. | Um admin pode enviar padrões regex arbitrários ou muito pesados. Mesmo em rota admin, isto enfraquece validação de input e pode causar pesquisa inesperada ou custo desnecessário. | Criar validator de filtros admin: normalizar `search`, impor tamanho máximo, escapar caracteres regex ou usar pesquisa literal segura, e validar `status` contra lista fechada. | PARCIAL |
| `MF5-AUD-03` | MEDIA | `BK-MF5-05` | `BK-MF5-05:280` conta activos com `{ accountStatus: { $ne: "blocked" } }`; `BK-MF5-02:289` cria `accountStatus: "deleted"`. | Contas eliminadas podem ser contadas como activas no painel admin, distorcendo a métrica de operação e a prova de privacidade. | Alterar a métrica para excluir `deleted`, por exemplo `$nin: ["blocked", "deleted"]`, ou definir explicitamente a semântica de `active`. | PARCIAL |
| `MF5-AUD-04` | BAIXA | `BK-MF5-06` | `BK-MF5-06:670-700` | O teste de integrações é executável, mas não cumpre totalmente a regra formal de comentários didácticos para blocos de teste com 20+ linhas. | Acrescentar comentários didácticos no caso válido e nos dois negativos. | PARCIAL |

## Continuidade de findings anteriores

O relatório anterior indicava correcções já aplicadas aos BKs MF5. Esta auditoria confirmou que esses pontos continuam alinhados:

- `content_comments` é usado em exportação e eliminação.
- `media_preferences` está incluído em exportação e limpeza.
- `privacyApi.js` preserva métodos anteriores ao acrescentar consentimentos.
- `BK-MF5-04` preserva compatibilidade com `patchUserRole`/`updateUserRole`.
- `BK-MF5-05` usa `pool_distributions.totalPoolCents`, alinhado com `BK-MF4-05`.

## Mapa de integração da MF

| BK | Ficheiros previstos no guia | Contratos | Endpoints | Segurança/autorização | Dependentes |
| --- | --- | --- | --- | --- | --- |
| `BK-MF5-01` | `privacy.service.js`, `privacy.controller.js`, `privacy.routes.js`, `privacyApi.js`, `PrivacyExportPanel.jsx`, `AccountPage.jsx`, teste unitário | `buildUserDataExport`, `getMyDataExport`, `privacyRouter`, `privacyApi.exportMyData` | `GET /api/privacy/export` | `requireAuth`, ownership por `req.user.id`, minimização de campos sensíveis | `BK-MF5-02`, `BK-MF5-03`, `MF6` |
| `BK-MF5-02` | `privacy.validation.js`, extensões de `privacy.service/controller/routes`, `PrivacyDangerZone.jsx`, teste unitário | `assertDeleteAccountPayload`, `deleteMyAccount`, `deleteMyAccountController` | `DELETE /api/privacy/account` | `requireAuth`, confirmação forte, revogação de sessões, anonimização | `BK-MF5-03`, `MF6` |
| `BK-MF5-03` | extensões de `privacy.validation/service/controller/routes`, `PrivacyConsentsPanel.jsx`, teste unitário | `assertConsentPayload`, `getMyConsents`, `updateMyConsents` | `GET /api/privacy/consents`, `PUT /api/privacy/consents` | `requireAuth`, ownership por sessão, histórico sem dados sensíveis | `BK-MF5-04`, `MF6` |
| `BK-MF5-04` | `user.validation.js`, `user.service.js`, `user.controller.js`, `user.routes.js`, `userApi.js`, `AdminUsersPage.jsx`, teste unitário | `assertAdminUserUpdate`, `listUsers(filters)`, `updateUserByAdmin` | `GET /api/users?search=&status=`, `PATCH /api/users/:id/admin` | `requireRole(["admin"])`, protecção contra auto-bloqueio, `admin_audit_logs` | `BK-MF5-05`, `BK-MF5-06` |
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
| Validação de input | PARCIAL: alteração admin é validada, mas filtros de listagem admin precisam de validator próprio. |
| Métricas coerentes com eliminação | PARCIAL: conta eliminada pode entrar em `users.active`. |
| Preparação para MF6 | PASS_COM_NOTA: MF6 recebe endpoints claros, mas deve incluir regressão para filtros admin e métricas de contas eliminadas. |

## Coerência MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: a MF5 consome subscrições, tentativas de pagamento simuladas, trials, notificações, biblioteca, ratings, comentários, preferências de media e dados de conta criados nas fases anteriores. A auditoria confirmou os nomes críticos contra `real_dev/backend`.
- `MF5 interna`: exportação prepara eliminação; eliminação e consentimentos fecham self-service de privacidade; gestão admin prepara métricas e integrações.
- `MF5 -> MF6`: regressão backend/frontend deve cobrir `GET /api/privacy/export`, `DELETE /api/privacy/account`, consentimentos, `GET/PATCH /api/users`, métricas admin e integrações admin.

## Drift documental

- `_TEMPLATE-BK.md` ainda reflecte contrato pedagógico antigo, enquanto os BKs MF5 seguem a estrutura exigida pela prompt activa.
- `docs/RNF.md` e `mockup/src/app/FAITHFLIX_INTERFACE_SPECS.md` contêm referências evolutivas a tecnologias/serviços fora do contrato final, como Next.js/Axios, Firebase/Supabase, PostgreSQL, Stripe, CDN e qualidade adaptativa. Nesta auditoria foram tratados como drift ou referência visual, não como contrato técnico.
- O mockup usa `/minha-conta` e uma área de configurações/eliminação visualmente útil, mas o contrato real dos BKs usa `real_dev`, sessão por cookie e endpoints Express/MongoDB.

## Riscos restantes

- `PARCIAL`: corrigir `BK-MF5-04` antes de o considerar pronto para alunos, porque a validação de filtros admin é uma fronteira de backend.
- `PARCIAL`: corrigir `BK-MF5-05` para excluir contas eliminadas da métrica `active`.
- `PARCIAL`: hidratar comentários didácticos nos blocos de teste de `BK-MF5-03` e `BK-MF5-06`.
- A implementação real não foi alterada; esta execução apenas audita guias BK e relatório, conforme `STRICT_SCOPE=true`.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Pesquisa obrigatória de termos proibidos nos BKs MF5 | PASS: sem ocorrências. |
| Pesquisa de drift de outras PAPs nos BKs MF5 | PASS_COM_NOTA: apenas falsos positivos de `IVA` dentro de `DERIVADO`; não há domínio fiscal ou outra PAP. |
| Pesquisa estática proporcional em `real_dev/backend` e `real_dev/frontend` | PASS_COM_NOTA: ocorrências de `password`, `token` e `cookie` pertencem a auth/sessão/testes ou documentação; `localStorage`/`sessionStorage` aparecem no README como comportamento fora de scope. |
| Estrutura obrigatória das secções | PASS: os 6 BKs têm as secções de `#### Objetivo` a `#### Changelog`. |
| Passos técnicos | PASS: os 6 BKs têm 5 passos e cada passo contém pontos 1 a 7. |
| Auditoria automática de blocos de código | PARCIAL: detectados blocos de teste com 20+ linhas e comentários didácticos insuficientes em `BK-MF5-03` e `BK-MF5-06`. |
| `git diff --check` | PASS. |
| `bash scripts/validate-planificacao.sh` | PASS: `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |

## Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`

## Ficheiros BK editados nesta execução

Nenhum. `MODO=auditar_apenas`.

## TODOs e blockers restantes

- `TODO`: em próxima execução `hidratar_corrigir`, corrigir `MF5-AUD-01`, `MF5-AUD-02`, `MF5-AUD-03` e `MF5-AUD-04`.
- `BLOCKER`: nenhum blocker documental indispensável dentro do scope `MF5`.
