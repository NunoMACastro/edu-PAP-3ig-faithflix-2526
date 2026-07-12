# Matriz de browsers manual - FaithFlix

- `document_status`: `CURRENT`
- `snapshot_date`: `2026-07-10`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: estado manual pendente e distinção entre engines automatizadas e browsers reais; não constitui execução manual
- `implementation_root`: `real_dev`
- `scope`: baseline local pós-auditoria
- `estado_global_manual`: `NAO_EXECUTADO`

Esta matriz separa engines automatizadas de produtos branded e de browsers
reais. Não transforma build, unitários, Axe ou fixtures sintéticas em prova
manual de compatibilidade.

## Prova automatizada disponível

| Ambiente | Cobertura executada | Estado | Limite |
| --- | --- | --- | --- |
| Chromium Playwright | Axe em rotas/viewports e media sintética | `PARCIAL_VALIDADO` | Não é Google Chrome branded; não é full E2E com DB. |
| Firefox Playwright | Media sintética progressive/HLS/DASH | `PARCIAL_VALIDADO` | Não houve fluxo funcional completo nem revisão manual. |
| WebKit Playwright | Media sintética progressive/HLS/DASH | `PARCIAL_VALIDADO` | WebKit Playwright não é Safari real num dispositivo Apple. |

## Matriz manual obrigatória

| Browser/produto | Plataforma mínima | Fluxos mínimos | Estado | Evidence |
| --- | --- | --- | --- | --- |
| Google Chrome branded | desktop disponível | login/logout, pesquisa, catálogo, media pendente, player, admin | `NAO_EXECUTADO` | `PENDENTE` |
| Microsoft Edge branded | desktop disponível | login/logout, pesquisa, catálogo, media pendente, player, admin | `NAO_EXECUTADO` | `PENDENTE` |
| Mozilla Firefox real | desktop disponível | login/logout, pesquisa, catálogo, media pendente, player, admin | `NAO_EXECUTADO` | `PENDENTE` |
| Safari real | macOS/iOS disponível | login/logout, pesquisa, catálogo, media pendente, player, reflow/teclado | `NAO_EXECUTADO` | `PENDENTE` |

## Viewports manuais

Executar, no mínimo, `390x844`, `768x900`, `1280x720` e `1440x900`. Registar
browser, versão, sistema, rota, perfil, viewport, data, resultado observado e
captura revista. Uma captura sem esses metadados não fecha a linha.

## Regra de decisão

- Não escrever `PASS` antes da observação real.
- Uma label `4K`, uma fixture 320x180 ou `canplay` não provam 4K/streaming real.
- Chrome/Edge branded e Safari real permanecem pendentes até execução manual.
- Falha de ambiente deve ser `BLOQUEADO_AMBIENTE`, nunca sucesso presumido.
- O estado atual de `RNF21/RNF22` é, no máximo, `PARCIAL_VALIDADO`.
