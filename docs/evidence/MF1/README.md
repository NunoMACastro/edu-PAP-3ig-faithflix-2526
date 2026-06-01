# Evidence MF1 - Fundacao tecnica

## Comandos executados

- `npm --prefix backend run smoke`
- `npm --prefix frontend run smoke`
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
- Sessao sem cookie devolve 401.
- Cookie falso devolve 401.

## Handoff para MF2

MF2 so deve iniciar se estes smoke tests passarem ou se blockers estiverem registados com owner e prazo.
