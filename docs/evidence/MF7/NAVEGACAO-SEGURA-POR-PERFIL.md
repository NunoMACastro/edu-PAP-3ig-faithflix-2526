# Navegação segura por sessão e perfil - MF7

## Metadados

- BK: BK-MF7-02
- Owner: Matheus
<<<<<<< HEAD
- Fonte: RF02, RF04, RNF13, RNF15, RNF16, RNF19
- Decisão: EM_REVISAO
=======
- Data: 2026-06-25
- Fonte: RF02, RF04, RNF13, RNF15, RNF16, RNF19
- Decisão: PASS_COM_RISCOS

## Alterações verificadas

| Área | Resultado observado | Estado |
| --- | --- | --- |
| Sessão frontend | `frontend/src/context/SessionContext.jsx` centraliza `authApi.me()` e expõe `loading`, `anonymous`, `authenticated`, `isAdmin`, `hasRole` e `refreshSession`. | PASS |
| Provider | `frontend/src/main.jsx` envolve a aplicação com `SessionProvider` acima de `App`. | PASS |
| Login/registo | `AuthForms` chama `refreshSession()` depois de `login` e `register`, evitando header obsoleto até refresh manual. | PASS |
| Header público | `AppHeader` mantém links públicos para início, catálogo, pesquisa, associações e planos. | PASS |
| Header autenticado | `AppHeader` só mostra `Para si`, `Biblioteca` e `Conta` quando a sessão está autenticada. | PASS |
| Header admin | Links administrativos só aparecem quando `hasRole(...)` permite a role; catálogo preserva `admin` e `moderator`, restantes links usam `admin`. | PASS |
| Rotas admin | Todas as rotas `/admin/*` passam por `AdminRoute`. | PASS |
| Backend como autoridade | `backend/src/modules/auth/auth.middleware.js` mantém `requireRole`; o frontend não substitui 401/403 do backend. | PASS |
>>>>>>> dc94538 (Update: MF8)

## Verificações

| Perfil | Ação | Resultado esperado | Resultado observado | Estado |
| --- | --- | --- | --- | --- |
<<<<<<< HEAD
| Visitante | Abrir header | Não vê links admin | A preencher | A preencher |
| Visitante | Abrir /admin/metricas | Redireciona para /login | A preencher | A preencher |
| Utilizador comum | Abrir header | Não vê links admin | A preencher | A preencher |
| Utilizador comum | Abrir /admin/metricas | Mostra aviso de permissão | A preencher | A preencher |
| Admin | Abrir header | Vê links admin | A preencher | A preencher |
| Admin | Abrir /admin/metricas | Vê página de métricas | A preencher | A preencher |
| Backend | Chamar rota admin sem sessão | 401 | A preencher | A preencher |
| Backend | Chamar rota admin como user | 403 | A preencher | A preencher |

## Handoff para BK-MF7-03

- Header filtrado por sessão:
- Links públicos confirmados:
- Links admin confirmados:
- Riscos visuais que passam para tokens/layout:
=======
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
| `npm run build` no package frontend | PASS, 104 módulos transformados. |
| `node scripts/check-frontend-regression.mjs` no package frontend | PASS, `Regressao frontend MF6: PASS`. |

## Ressalvas

- Não foram executados screenshots autenticados reais com contas `user`, `admin` e `moderator`; o gate usa prova estática + build/regressão e recomenda confirmação visual manual antes da defesa.
>>>>>>> dc94538 (Update: MF8)
