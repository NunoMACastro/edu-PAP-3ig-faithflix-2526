# Evidence BK-MF6-02 - Regressao frontend

- Owner: Kaue
- Apoio: Mateus
- Data: 2026-06-22
- Requisito: RNF29
- PR/entrega: Entrega local sem commit/PR (`PERMITIR_COMMITS: nao`)

## Proof

| Comando | Resultado |
| --- | --- |
| `node scripts/check-frontend-regression.mjs` em `referencia_privada_docente/frontend` | `Regressao frontend MF6: PASS` |
| `node --check scripts/check-frontend-regression.mjs` em `referencia_privada_docente/frontend` | `PASS` sem output de erro. |
| `npm run build` em `referencia_privada_docente/frontend` | `vite build` passou; 100 modulos transformados; bundle `dist/assets/index-B2TyK6nP.js` gerado; build em 471 ms. |
| `node --test tests/regression/mf6-backend-regression.test.js` em `referencia_privada_docente/backend` | `PASS`; 5 testes, 5 pass, 0 fail. |

## Negativos

| Cenario | Como executar | Resultado esperado | Resultado obtido |
| --- | --- | --- | --- |
| Rota de login removida de `AppRoutes.jsx` | Copia temporaria de `referencia_privada_docente/frontend` com a linha `path="/login"` removida e execucao de `node scripts/check-frontend-regression.mjs` | Falha com nome da rota em falta | `route-negative-exit=1`; `AssertionError [ERR_ASSERTION]: Rota em falta: path="/login"`. |
| Import inexistente numa pagina | Copia temporaria de `referencia_privada_docente/frontend` com import `../pages/__missing_negative_check__.jsx` em `src/routes/AppRoutes.jsx` e execucao de `npm run build` | Build falha | `import-negative-exit=1`; Vite/Rollup falhou com `Could not resolve "../pages/__missing_negative_check__.jsx" from "src/routes/AppRoutes.jsx"`. |
| Backend desligado em pagina com API | Vite local em `http://127.0.0.1:4173/catalogo`, backend parado em `localhost:3000`, validado com Chromium headless fora da sandbox | Mensagem de erro controlada | `backend-off-alert=Nao foi possivel contactar o servidor. Confirma a ligacao e tenta novamente.` |
| Estado de erro/vazio removido | Copia temporaria com `EmptyState` removido de `AccountPage.jsx` e execucao de `node scripts/check-frontend-regression.mjs` | Suite estatica falha por estado UI em falta | `backend-off-state-negative-exit=1`; `AssertionError [ERR_ASSERTION]: Estado UI em falta em src/pages/AccountPage.jsx: EmptyState`. |

## Observacoes

- A regressao protege rotas, paginas essenciais, `credentials: "include"` e estados minimos de carregamento, erro e vazio sem adicionar dependencias.
- O servidor Vite falhou dentro da sandbox com `listen EPERM: operation not permitted 127.0.0.1:4173`; a validacao browser do negativo de backend desligado foi repetida fora da sandbox e passou.
- A pesquisa estatica de seguranca devolveu apenas falsos positivos ja esperados: filtros defensivos com `secret`, nota anti-`localStorage` no README e `stripe_real` como negativo de teste.
