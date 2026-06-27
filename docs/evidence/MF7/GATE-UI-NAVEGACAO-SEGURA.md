# Gate UI, responsividade e navegação segura - MF7

## Metadados

- BK: BK-MF7-05
- Owner: Nuno
- Data: 2026-06-25
- Fonte: RNF21, RNF22, RNF38, RNF40
- Decisão final: GO_COM_RESSALVAS

## Entradas obrigatórias

| Evidence | Existe | Estado | Observação |
| --- | --- | --- | --- |
| INVENTARIO-UI-MOCKUP.md | Sim | IMPLEMENTADO_COM_EVIDENCIA | Inventário original de UI-01..UI-20 atualizado com estado pós-correção e evidence browser. |
| NAVEGACAO-SEGURA-POR-PERFIL.md | Sim | PASS | Guardas frontend implementadas; backend continua autoridade 401/403; cenários browser por perfil anexados. |
| REFINAMENTO-VISUAL-MOCKUP.md | Sim | PASS_COM_RISCOS | Tokens, header e hero refinados; screenshots representativos anexados; revisão visual total ainda recomendada. |
| USABILIDADE-UX.md | Sim | PASS_COM_RISCOS | Estados principais uniformizados; screenshots e skip link automatizado anexados; revisão humana final continua recomendada. |

## Matriz de gate

| Critério | Resultado esperado | Resultado observado | Estado | Prova |
| --- | --- | --- | --- | --- |
| Visitante | Não vê links admin | Header filtra itens por `visibility` e `roles`; visitante não cumpre `authenticated`. | PASS | `frontend/src/components/layout/AppHeader.jsx` |
| Visitante em rota admin | Vai para login | `AdminRoute` redireciona `anonymous` para `/login`. | PASS | `frontend/src/components/auth/AdminRoute.jsx` |
| User comum | Não vê links admin | `hasRole(["admin"])` falha para `user`. | PASS | `frontend/src/context/SessionContext.jsx` |
| User comum em rota admin | Recebe aviso de permissão | `AdminRoute` mostra mensagem de 403 visual. | PASS | `frontend/src/components/auth/AdminRoute.jsx` |
| Admin | Acede a páginas admin | Rotas admin usam `AdminRoute` e roles admin. | PASS | `frontend/src/routes/AppRoutes.jsx` |
| Moderator | Acede apenas ao catálogo admin | Catálogo preserva `["admin", "moderator"]`; restantes rotas admin usam `["admin"]`. | PASS | `frontend/src/routes/AppRoutes.jsx` |
| Mobile 390px | Sem sobreposição | Browser 390x844 com visitante validou hero, nav pública e ausência de links admin. | PASS | `browser/mf7-mobile-390-anonymous-home.png`; `browser/mf7-browser-validation-results.json` |
| Tablet 768px | Grelhas legíveis | Browser 768x900 com user comum validou bloqueio visual em rota admin. | PASS | `browser/mf7-tablet-768-user-admin-denied.png`; `browser/mf7-browser-validation-results.json` |
| Desktop largo | Conteúdo com largura controlada | Browser 1440x900 com admin validou hero e links admin esperados; 1366x900 validou catálogo moderator. | PASS | `browser/mf7-desktop-1440-admin-home.png`; `browser/mf7-desktop-1366-moderator-catalog.png` |
| Teclado | Foco visível e skip link funcional | Playwright validou `Tab` no skip link e `Enter` com foco final em `main#conteudo-principal`. | PASS | `browser/mf7-keyboard-skip-link.png`; `browser/mf7-browser-validation-results.json` |
| PT-PT | Texto visível com acentuação correta | Páginas principais, erros API, catálogo admin e rating foram corrigidos para PT-PT no scope auditado. | PASS | Build, pesquisa textual e `frontend/src/pages/AdminCatalogPage.jsx`; `frontend/src/components/ratings/RatingBox.jsx` |
| Formatos europeus | Datas e valores em pt-PT | Planos, histórico e dashboards admin da pool usam `Intl.NumberFormat("pt-PT")`; datas usam `toLocaleDateString("pt-PT")`. | PASS | `frontend/src/pages/SubscriptionPage.jsx`, `frontend/src/pages/CharityHistoryPage.jsx`, `frontend/src/pages/AdminPoolDashboardPage.jsx`, `frontend/src/pages/AdminPoolDistributionPage.jsx` |

## Validação browser acrescentada em 2026-06-25

| Cenário | Perfil | Viewport | Resultado | Artefacto |
| --- | --- | --- | --- | --- |
| Home pública mobile | visitante | 390x844 | `PASS`; hero visível e nav sem links admin. | `browser/mf7-mobile-390-anonymous-home.png` |
| Rota admin bloqueada | user | 768x900 | `PASS`; mensagem de permissão insuficiente renderizada. | `browser/mf7-tablet-768-user-admin-denied.png` |
| Catálogo admin | moderator | 1366x900 | `PASS`; acesso ao catálogo admin sem links de gestão de utilizadores/métricas/integrações. | `browser/mf7-desktop-1366-moderator-catalog.png` |
| Home admin | admin | 1440x900 | `PASS`; links admin esperados visíveis. | `browser/mf7-desktop-1440-admin-home.png` |
| Skip link por teclado | visitante | 1280x820 | `PASS`; `Tab` focou o skip link e `Enter` moveu foco para `main#conteudo-principal`. | `browser/mf7-keyboard-skip-link.png` |

Resumo estruturado: `browser/mf7-browser-validation-results.json`.

Notas de execução:

- A validação usou fixtures locais de API apenas para controlar sessão/perfil durante a recolha visual.
- A recolha Playwright validou também o fluxo de teclado do skip link; revisão humana final continua recomendada apenas como controlo de qualidade antes da defesa.

## Regras de decisão

- GO: todos os P0 passam e não há blocker P1.
- GO_COM_RESSALVAS: todos os P0 passam e há apenas ressalvas documentadas.
- NO_GO: qualquer P0 falha ou falta evidence obrigatória.

## Decisão

Decisão final: `GO_COM_RESSALVAS`.

Justificação: os P0 de navegação segura ficaram fechados por código, build, regressão estática e screenshots browser representativos; não há links admin expostos a visitante/user comum pelo header e as rotas `/admin/*` já têm guarda visual. A decisão mantém ressalva apenas pela revisão humana final de UX/defesa, não por finding técnico aberto em screenshots, teclado, PT-PT ou formatos europeus.

## Handoff para BK-MF8-01

- Estado final da MF7: `PASS_COM_RISCOS`, pronto para consolidar evidence em MF8 com ressalvas explícitas.
- Riscos aceites: revisão humana final de UX/defesa ainda recomendada.
- Riscos bloqueantes: nenhum P0 confirmado após build/regressão.
- Evidence que pode entrar na matriz RF: `INVENTARIO-UI-MOCKUP.md`, `NAVEGACAO-SEGURA-POR-PERFIL.md`, `REFINAMENTO-VISUAL-MOCKUP.md`, `USABILIDADE-UX.md`, `GATE-UI-NAVEGACAO-SEGURA.md`, `browser/mf7-browser-validation-results.json` e screenshots em `browser/*.png`.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm run build` no package frontend | PASS, 104 módulos transformados. |
| `node scripts/check-frontend-regression.mjs` no package frontend | PASS, `Regressao frontend MF6: PASS`. |
| Sessão browser MF7 com fixtures locais | PASS, 5/5 cenários representativos com screenshots anexados, incluindo skip link por teclado. |
