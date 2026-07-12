# Navegação segura por sessão e perfil - MF7

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-25`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: validação de sessão/perfil observada em 2026-06-25; não substitui o contrato atual

## Metadados

- BK: BK-MF7-02
- Owner: Matheus
- Data: 2026-06-25
- Fonte: RF02, RF04, RNF13, RNF15, RNF16, RNF19
- Decisão: PASS_COM_RISCOS

> **Snapshot histórico de 2026-06-25:** resultados preservados sem
> reexecução; os adendos datados posteriores são provas separadas.

## Alterações verificadas

| Área | Resultado observado | Estado |
| --- | --- | --- |
| Sessão frontend | `real_dev/frontend/src/context/SessionContext.jsx` centraliza `authApi.me()` e expõe `loading`, `anonymous`, `authenticated`, `isAdmin`, `hasRole` e `refreshSession`. | PASS |
| Provider | `real_dev/frontend/src/main.jsx` envolve a aplicação com `SessionProvider` acima de `App`. | PASS |
| Login/registo | `AuthForms` chama `refreshSession()` depois de `login` e `register`, evitando header obsoleto até refresh manual. | PASS |
| Header público | `AppHeader` mantém links públicos para início, catálogo, pesquisa, associações e planos. | PASS |
| Header autenticado | `AppHeader` só mostra `Para si`, `Biblioteca` e `Conta` quando a sessão está autenticada. | PASS |
| Header admin | Links administrativos só aparecem quando `hasRole(...)` permite a role; catálogo preserva `admin` e `moderator`, restantes links usam `admin`. | PASS |
| Rotas admin | Todas as rotas `/admin/*` passam por `AdminRoute`. | PASS |
| Backend como autoridade | `real_dev/backend/src/modules/auth/auth.middleware.js` mantém `requireRole`; o frontend não substitui 401/403 do backend. | PASS |

## Verificações

| Perfil | Ação | Resultado esperado | Resultado observado | Estado |
| --- | --- | --- | --- | --- |
| Visitante | Abrir header | Não vê links admin | Header filtra por `visibility`/`roles`; visitante não cumpre `authenticated`. | PASS |
| Visitante | Abrir `/admin/metricas` | Redireciona para `/login` | `AdminRoute` devolve `<Navigate to="/login" replace />` quando `status === "anonymous"`. | PASS |
| Utilizador comum | Abrir header | Não vê links admin | `hasRole(["admin"])` falha para `user`; links admin não entram em `visibleItems`. | PASS |
| Utilizador comum | Abrir `/admin/metricas` | Mostra aviso de permissão | `AdminRoute` mostra `Não tem permissão para aceder a esta área.` se a role não for permitida. | PASS |
| Admin | Abrir header | Vê links admin | `hasRole(["admin"])` permite utilizadores `admin`. | PASS |
| Admin | Abrir `/admin/metricas` | Vê página de métricas | Rota envolve `AdminMetricsPage` com `AdminRoute` default `["admin"]`. | PASS |
| Moderator | Abrir `/admin/catalogo` | Acede apenas ao catálogo admin | Rota e header preservam `["admin", "moderator"]`, alinhado com o backend. | PASS |
| Backend | Chamar rota admin sem sessão | 401 | `requireRole` devolve 401 sem `req.user`; regressão MF6 mantém este contrato. | PASS |
| Backend | Chamar rota admin como user | 403 | `requireRole` devolve 403 quando a role não está em `allowedRoles`; regressão MF6 mantém este contrato. | PASS |

## Handoff para BK-MF7-03

- Header filtrado por sessão: `SessionProvider`, `useSession`, `hasRole` e `AdminRoute`.
- Links públicos confirmados: `/`, `/catalogo`, `/pesquisa`, `/associacoes`, `/planos`.
- Links autenticados confirmados: `/para-si`, `/biblioteca`, `/conta`.
- Links administrativos confirmados: `/admin/catalogo`, `/admin/utilizadores`, `/admin/metricas`, `/admin/integracoes`.
- Risco visual que passa para tokens/layout: header admin pode ter muitos links, mas agora só aparece a perfis permitidos.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/frontend run build` | PASS, 104 módulos transformados. |
| `cd real_dev/frontend && node scripts/check-frontend-regression.mjs` | PASS, `Regressao frontend MF6: PASS`. |

## Ressalvas

- Não foram executados screenshots autenticados reais com contas `user`, `admin` e `moderator`; o gate usa prova estática + build/regressão e recomenda confirmação visual manual antes da defesa.

## Adendo da referência docente - Fase 5 (2026-07-10)

Este adendo não reescreve nem promove a decisão `PASS_COM_RISCOS` do snapshot
de 2026-06-25. Regista apenas a prova local atual da referência docente para o
estado operacional de sessão acrescentado depois desse snapshot.

| Cenário atual | Resultado observado na referência | Estado local |
| --- | --- | --- |
| `GET /api/session/me` falha por rede/`5xx` | `SessionContext` usa `unavailable`, conserva erro seguro e não assume `anonymous`. | PASS |
| Detalhe com media pronta e sessão `unavailable` | CTA privado fica bloqueado, não aparece `Entrar para reproduzir` e existe `Tentar confirmar sessão`. | PASS |
| Nova confirmação | A ação chama `refreshSession()` uma vez e não inventa sessão nem role no browser. | PASS |

Comando atual, executado em `real_dev/frontend`:

```bash
npm run test:unit -- src/context/SessionContext.test.jsx src/pages/CatalogPage.test.jsx src/pages/SearchPage.test.jsx src/pages/ContentDetailPage.test.jsx src/pages/AccountPage.test.jsx src/services/api/catalogCharityApis.test.js
```

Resultado real: `6` ficheiros, `25` testes, `25 pass`, exit code `0`.

Limite de prova: são testes Vitest com APIs simuladas. Não constituem sessão
browser real, E2E com persistência, nem prova do estado das implementações dos
alunos.
