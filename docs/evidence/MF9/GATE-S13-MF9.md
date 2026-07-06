# Gate S13 - MF9

Data da avaliacao: 2026-07-04
Responsavel pelo gate: Kaue
Raiz validada: `real_dev`
Decisao: `GO_COM_RESSALVAS`

Esta evidencia fecha o `BK-MF9-06` sem alterar guias canonicos. A decisao fica com ressalvas porque os testes automatizados, build, seed e E2E Chromium passaram, mas nao houve revisao manual completa em Firefox, Safari, Edge e em todos os viewports pedidos por `RNF21`/`RNF22`.

## Matriz RF/RNF

| Requisito | BK fonte | Prova positiva obrigatoria | Prova negativa obrigatoria | Resultado | Responsavel |
| --- | --- | --- | --- | --- | --- |
| RF61 | BK-MF9-01 | `GET /api/subscriptions/plans` lista Pro/Familia com entitlements | Plano inexistente rejeitado no checkout simulado | `PASS` - suite MF9 direta validou planos e checkout inexistente | Matheus |
| RF62 | BK-MF9-03/04 | Owner Familia convida membro real e membro aceita | Owner Pro bloqueado, membro pago/duplicado rejeitado e acesso removido apos remocao | `PASS` - suite MF9 e E2E Chromium validaram o ciclo owner -> membro -> remocao | Matheus/Mateus |
| RF63 | BK-MF9-02 | Membro Familia consegue selecionar 4K | Utilizador Pro ve 4K bloqueado sem URL reproduzivel | `PASS` - suite MF9 e E2E Chromium validaram 4K permitido/bloqueado | Mateus |
| RNF21 | BK-MF9-06 | E2E Chromium passa e browser usado fica registado | Falha de browser fica registada com ambiente e impacto | `PASS_COM_RISCOS` - Chromium passou; restantes browsers ficam como revisao manual pendente | Kaue |
| RNF22 | BK-MF9-06 | Fluxo revisto em viewport mobile e desktop | Overlap ou quebra visual fica registado com captura | `PASS_COM_RISCOS` - build e E2E cobrem render principal; revisao visual mobile/desktop completa fica pendente | Kaue |
| RNF29 | BK-MF9-06 | Testes backend MF9, build frontend e E2E MF9 executados | Suite backend sem teste MF9 e recusada como falso verde | `PASS` - ficheiro MF9 executado diretamente, build passou, E2E passou fora da sandbox | Kaue |
| RNF38 | BK-MF9-06 | UI e evidence final em portugues de Portugal | Texto sem acentuacao em UI/evidence fica registado | `PASS_COM_RISCOS` - UI principal tem copy PT-PT; seed/scripts mantem algum texto ASCII tecnico nao visivel | Kaue |
| RNF40 | BK-MF9-06 | Datas e numeros visiveis seguem formato europeu | Formato fora do padrao europeu fica registado | `PASS` - UI usa `Intl.NumberFormat("pt-PT")` e `toLocaleDateString("pt-PT")` | Kaue |

## Negativos obrigatorios

| Negativo | Resultado esperado | Resultado obtido | Evidencia |
| --- | --- | --- | --- |
| Plano inexistente no checkout simulado | Erro de plano nao encontrado | `PASS` | `node --test tests/unit/mf9-subscriptions.test.js`, teste "checkout simulado aceita plano Familia ativo e rejeita plano inexistente" |
| Owner Pro tenta convidar membro | Bloqueio por falta de plano Familia ativo | `PASS` | Suite MF9, teste "bloqueia owner sem Familia, membro pago, duplicado, auto-convite e email inexistente" |
| Membro com subscricao paga tenta aceitar Familia | Bloqueio por subscricao paga ativa | `PASS` | Suite MF9, teste de membro pago |
| Membro duplicado tenta entrar noutra Familia | Bloqueio por partilha ativa ou pendente | `PASS` | Suite MF9, teste de duplicado |
| Utilizador Pro tenta reproduzir 4K | 4K bloqueado sem URL 4K | `PASS` | Suite MF9 e E2E Chromium validaram `4K - Plano Familia` disabled e `src` 1080p |
| User comum tenta abrir metricas admin | HTTP 403 | `PASS` | Suite backend completa fora da sandbox: `GET /api/admin/metrics` devolveu 403 para utilizador comum |
| E2E sem seed MF9 | Teste falha antes do gate | `NAO_EXECUTADO` | O seed foi executado antes do E2E para preservar o fluxo reprodutivel; risco registado como ressalva operacional |

## Revisao RNF21/RNF22/RNF38/RNF40

| Area | Prova minima | Resultado |
| --- | --- | --- |
| Browser moderno | Chromium E2E + browser manual registado | `PASS_COM_RISCOS` - Chromium automatizado passou; Firefox/Safari/Edge pendentes |
| Mobile | `/planos` e `/ver/:id` sem overlap em largura movel | `PENDENTE_MANUAL` |
| Desktop | `/planos` e `/ver/:id` sem regressao visual evidente | `PASS_COM_RISCOS` - E2E desktop Chromium validou fluxo e elementos principais |
| Portugues de Portugal | Mensagens visiveis com acentuacao correta | `PASS_COM_RISCOS` - UI principal validada por selectors/texto; seed tecnico permanece ASCII |
| Formato europeu | Datas e numeros visiveis em formato PT/EU | `PASS` |

## Decisao final

- Decisao: `GO_COM_RESSALVAS`
- Data: 2026-07-04
- Responsavel: Kaue
- Evidencia backend: `node --test tests/unit/mf9-subscriptions.test.js` passou com 14/14; `npm --prefix real_dev/backend test` passou fora da sandbox com 65/65.
- Evidencia frontend: `npm --prefix real_dev/frontend run build` passou, com 104 modulos transformados.
- Evidencia E2E: `npm --prefix real_dev/backend run seed:e2e:mf9` passou fora da sandbox; `npx playwright test tests/e2e/mf9-family-subscription.spec.js` passou fora da sandbox com 1/1.
- Evidencia de planificacao: `bash scripts/validate-planificacao.sh` passou com `checked_bks=66` e `checked_guides=66`.
- Riscos aceites: falta revisao manual multi-browser completa; falta revisao visual mobile/desktop com capturas; negativo "E2E sem seed" nao foi executado diretamente.
- Proxima acao: executar revisao manual em Chrome/Edge/Firefox/Safari e guardar capturas mobile/desktop antes de trocar a decisao para `GO`.
