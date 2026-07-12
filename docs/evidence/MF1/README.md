# Evidence MF1 - Fundacao tecnica

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-07-09`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: smoke MF1 preservado antes da Fase 2; não constitui prova atual

> **Aviso de validade — Fase 2 (2026-07-09):** este documento é um snapshot histórico anterior à Fase 2 de 2026-07-09. Os resultados e decisões preservados abaixo não provam CP2 nem o estado atual da aplicação.

## Comandos executados

- `npm --prefix real_dev/backend run smoke`
- `npm --prefix real_dev/frontend run smoke`
- `npm run smoke`

## Resultado esperado

- Backend smoke passa.
- Frontend build passa.
- Rotas tecnicas `/health`, `/api` e `/api/session/me` respondem conforme esperado.

## Resultados observados

- Backend: `PASS` com `6/6` testes smoke a passar (`/health`, `/api`, CORS local, 404, sessao sem cookie e cookie falso). No ambiente Codex, o comando precisou de permissao fora do sandbox porque os testes abrem uma porta local aleatoria.
- Frontend: `PASS`; `vite build` concluiu com sucesso e gerou `dist/index.html`, CSS e JS de producao.
- Agregado: `PASS`; `npm run smoke` executou backend smoke e frontend smoke com sucesso.

## Referencia PR/commit

- `pr`: pendente ate existir PR ou commit associado ao fecho da MF1.

## Negativos

- Rota inexistente devolve 404 JSON.
- Sessao sem cookie devolve `200 { "user": null }`.
- Cookie falso devolve `200 { "user": null }`.
- Logout devolve `204` e limpa o cookie sem expor sessão ou token.

## Handoff para MF2

MF2 so deve iniciar se estes smoke tests passarem ou se blockers estiverem registados com owner e prazo.
