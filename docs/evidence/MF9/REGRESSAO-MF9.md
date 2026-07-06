<!-- docs/evidence/MF9/REGRESSAO-MF9.md -->
# Regressão MF9

<!-- Cada linha deve receber data, comando e resultado real. Não apagues falhas: documenta-as. -->
| Área | Comando/prova | Resultado | Observações |
| --- | --- | --- | --- |
| Backend MF9 | `cd backend && node --test tests/unit/mf9-subscriptions.test.js` | PENDENTE | Deve executar testes MF9 reais. |
| Frontend | `cd frontend && npm run build` | PENDENTE | Deve compilar sem erros. |
| Planificação | `bash scripts/validate-planificacao.sh` | PENDENTE | Esperado: `checked_bks=66`, `checked_guides=66`. |
| E2E MF9 | `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | PENDENTE | Deve provar owner, membro, Pro e 4K. |
| Revisão manual | Mobile + desktop + PT-PT | PENDENTE | Registar resolução, browser e ressalvas. |