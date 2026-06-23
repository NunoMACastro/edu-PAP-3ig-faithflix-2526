# Auditoria de implementacao - referencia_privada_docente - MF2

## Resultado geral

- Estado: FAIL
- MF auditada: MF2
- BKs auditados: BK-MF2-01, BK-MF2-02, BK-MF2-03, BK-MF2-04, BK-MF2-05, BK-MF2-06, BK-MF2-07, BK-MF2-08
- Implementacao auditada: `referencia_privada_docente`
- Coerencia entre MFs: adjacentes
- Fronteiras auditadas: `MF1 -> MF2`, `MF2 -> MF3`
- Resumo: a implementacao real cobre a maior parte do core streaming MVP: autenticacao por cookie HttpOnly, perfil, roles base, catalogo, detalhe, playback, progresso, preferencias media, favoritos, watchlist, historico, seed E2E e teste Playwright. A auditoria nao deve fechar a MF2 como pronta porque a recuperacao de password nao fecha um fluxo auditavel de ponta a ponta sem email real nem canal dev-only controlado, e porque o E2E principal nao foi executado com sucesso neste ambiente.
- Pode avancar para a proxima MF: Nao

## Escopo auditado

- Documentos consultados: `README.md`; `docs/RF.md`; `docs/RNF.md`; `docs/planificacao/README.md`; `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`; `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`; `docs/planificacao/backlogs/BACKLOG-MVP.md`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`; `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`; `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`; `docs/planificacao/backlogs/MF-VIEWS.md`; `docs/planificacao/sprints/PLANO-SPRINTS.md`; `docs/planificacao/sprints/SCORECARD-SPRINTS.md`; `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`; `docs/planificacao/guias-bk/README.md`; todos os guias `docs/planificacao/guias-bk/MF2/*.md`; `BK-MF1-06`; `BK-MF3-01`.
- BKs incluidos: todos os BKs da MF2.
- BKs excluidos: nenhum BK da MF2 foi excluido.
- MFs implementadas detetadas: `MF1` IMPLEMENTADA; `MF2` IMPLEMENTADA com falhas; `MF3` PARCIAL/placeholder; `MF4` PARCIAL/placeholder; `MF5` PARCIAL por presenca de gestao admin de utilizadores.
- MFs usadas para coerencia: `MF1`, `MF2`, `MF3`.
- Limitacoes: nao foi encontrado glossario tecnico PAP; nao havia relatorios existentes `AUDITORIA-HIDRATACAO-MF*.md`, `IMPLEMENTACAO-REAL_DEV-MF*.md` ou `AUDITORIA-IMPLEMENTACAO-*.md`; comandos que abrem servidor falharam no sandbox com `listen EPERM`; o E2E completo nao foi executado para nao correr seed persistente; o build/frontend smoke nao foi executado porque escreve em `referencia_privada_docente/frontend/dist`.

## Matriz por BK

| BK | Estado | Cumpre | Falhas | Fora de scope | Evidencia |
| --- | --- | --- | --- | --- | --- |
| `BK-MF2-01` | PARCIAL | Registo, login, logout, sessao atual, hash de password, cookie HttpOnly e reset por token no backend existem. | Recuperacao de password nao fecha fluxo auditavel para o utilizador sem email real nem canal dev-only controlado. | Nao detetado. | `authApi`, `auth.service`, `session.service`, `AuthForms`, testes unitarios. |
| `BK-MF2-02` | CONFORME_COM_RISCOS | Perfil, limite parental, roles base e endpoints admin protegidos por role existem. | Validacao final ficou incompleta por falha ambiental dos smoke. | UI mostra area admin sem filtragem por sessao/role. | `user.routes.js`, `user.service.js`, `AccountPage.jsx`, `AdminUsersPage.jsx`. |
| `BK-MF2-03` | CONFORME_COM_RISCOS | Catalogo, taxonomias, estados, revisoes, roles admin/moderator e validacao backend existem. | Sem execucao completa de build/E2E. | Nao detetado como bloqueante. | `catalog.routes.js`, `catalog.service.js`, `catalog.validation.js`, `AdminCatalogPage.jsx`. |
| `BK-MF2-04` | CONFORME_COM_RISCOS | Pagina de detalhe por slug/id, metadados e acoes de biblioteca existem. | Validacao E2E nao confirmada. | Nao detetado. | `ContentDetailPage.jsx`, `catalogApi.js`. |
| `BK-MF2-05` | CONFORME_COM_RISCOS | Playback autenticado, progresso, continuar a ver e historico tecnico existem. | E2E/performance RNF08 nao executado. | Nao detetado. | `playback.routes.js`, `playback.service.js`, `PlaybackPage.jsx`, `ContinueWatchingStrip.jsx`. |
| `BK-MF2-06` | CONFORME_COM_RISCOS | Preferencias de audio, legendas, qualidade e limite parental existem. | Sem validacao browser real. | Nao detetado. | `media-preferences.service.js`, `PlaybackPage.jsx`, `AccountPage.jsx`. |
| `BK-MF2-07` | CONFORME_COM_RISCOS | Favoritos, watchlist e historico usam utilizador autenticado e ownership por `req.user.id`. | Sem E2E executado neste ambiente. | Nao detetado. | `library.routes.js`, `library.service.js`, `MyLibraryPage.jsx`, `LibraryActions.jsx`. |
| `BK-MF2-08` | PARCIAL | Existe seed E2E, media local, config Playwright e teste do fluxo principal. | Teste E2E nao foi executado; `npx playwright test --list` tentou rede e falhou por `ENOTFOUND`. | Nao detetado. | `playwright.config.js`, `tests/e2e/mf2-flow.spec.js`, `seed-mf2-e2e.js`, `piloto.mp4`. |

## Matriz de coerencia entre MFs

| Fronteira | Estado | Contratos verificados | Falhas | Evidencia |
| --- | --- | --- | --- | --- |
| `MF1 -> MF2` | COERENTE_COM_RISCOS | `createApp`, `/health`, `/api`, CORS com credentials, cookie de sessao, `apiClient` com `credentials: "include"`, smoke tests preservados. | Smoke nao validado por bloqueio de ambiente; drift entre BK-MF1-06 antigo que esperava 401 em sessao anonima e implementacao atual que aceita 200 com `user: null`. | `app.js`, `session.middleware.js`, `apiClient.js`, `tests/smoke/app.smoke.test.js`. |
| `MF2 -> MF3` | COERENTE_COM_RISCOS | `users`, `contents`, `user_content_lists`, `playback_progress`, ownership e IDs de conteudo/utilizador para ratings futuros. | `BK-MF3-01` esta documentalmente generico e nao fixa endpoints/modelo/payload para ratings; ha navegacao de pesquisa futura em placeholder. | `BK-MF3-01`, `catalog.service.js`, `library.service.js`, `playback.service.js`, `AppHeader.jsx`. |

## Validacao detalhada por BK

### BK-MF2-01 - Registo, login e recuperacao de password

- Estado: PARCIAL
- Esperado: persistencia MongoDB para `users`, `sessions`, `password_reset_tokens`; password com hash seguro; sessao com token opaco em cookie HttpOnly; `req.user`; endpoints `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/session/me`, `POST /api/session/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`; cliente frontend e rota `/login`.
- Observado: os contratos principais existem. A camada de sessao usa cookie `HttpOnly`, token opaco e hash de token; o frontend usa `credentials: "include"`. O teste unitario confirma que o pedido de reset nao revela se o email existe e devolve apenas `message`.
- Cumpre: parcialmente.
- Falhas: o fluxo de recuperacao nao e auditavel end-to-end por um utilizador ou avaliador sem acesso direto a base de dados, porque nao ha envio de email real nem canal dev-only documentado para obter o token bruto.
- Negativos: ha testes para password fraca e reset generico.
- Evidencia: `referencia_privada_docente/backend/src/modules/auth/auth.service.js:97`; `referencia_privada_docente/backend/tests/unit/mf2-validation.test.js:68`; `referencia_privada_docente/frontend/src/components/auth/AuthForms.jsx:63`.
- Riscos: RF05 fica demonstravel apenas por inspecao interna, nao por fluxo funcional.
- Handoff: BK-MF2-02 recebe `req.user` e roles base; esse handoff esta presente.

### BK-MF2-02 - Edicao de perfil e papeis base

- Estado: CONFORME_COM_RISCOS
- Esperado: edicao de perfil, papel base, autorizacao admin para roles, ownership via sessao.
- Observado: existem endpoints de perfil proprio e endpoints admin protegidos por `requireRole(["admin"])`; frontend tem pagina de conta e pagina admin de utilizadores.
- Cumpre: sim, com risco menor.
- Falhas: a navegacao mostra links admin a qualquer visitante; o backend protege, mas a UX e a superficie visivel ficam pouco alinhadas.
- Negativos: teste unitario rejeita role invalida.
- Evidencia: `referencia_privada_docente/backend/src/modules/users/user.routes.js:21`; `referencia_privada_docente/frontend/src/components/layout/AppHeader.jsx:11`.
- Riscos: confusao pedagogica/UX e pedidos 401/403 previsiveis para utilizadores sem role.
- Handoff: catalogo administrativo pode depender de roles admin/moderator.

### BK-MF2-03 - CRUD de catalogo e taxonomias

- Estado: CONFORME_COM_RISCOS
- Esperado: CRUD de conteudo, taxonomias, estados publicados, revisoes, roles admin/moderator, validacao backend.
- Observado: rotas de catalogo estao montadas em `/api/catalog`, com caminhos publicos e admin; frontend tem cliente e pagina admin de catalogo; ha validacao de payload, media, estados e taxonomias.
- Cumpre: sim, com validacao dinamica incompleta.
- Falhas: sem build/E2E executados nesta auditoria.
- Negativos: teste unitario rejeita estado invalido e valida media.
- Evidencia: `referencia_privada_docente/backend/src/app.js:40`; `referencia_privada_docente/frontend/src/services/api/catalogApi.js:3`; `referencia_privada_docente/backend/tests/unit/mf2-validation.test.js:74`.
- Riscos: baixo, desde que comandos passem fora do sandbox.
- Handoff: detalhe e pesquisa futura usam `contents` publicado por slug/id.

### BK-MF2-04 - Pagina de detalhe de conteudo

- Estado: CONFORME_COM_RISCOS
- Esperado: rota frontend de detalhe, chamada real ao backend, estados loading/error/empty/success, link para reproducao.
- Observado: existem cliente `getDetail`, rota de detalhe e teste E2E com `/catalogo/piloto-faithflix`.
- Cumpre: sim, mas sem validacao executada.
- Falhas: E2E nao executado.
- Negativos: nao confirmados por comando nesta auditoria.
- Evidencia: `referencia_privada_docente/frontend/src/services/api/catalogApi.js:7`; `tests/e2e/mf2-flow.spec.js:23`.
- Riscos: baixo.
- Handoff: playback recebe `contentId`.

### BK-MF2-05 - Reproducao e continuar a ver

- Estado: CONFORME_COM_RISCOS
- Esperado: playback autenticado, URL simplificada de media, retoma de progresso, listagem "continuar a ver".
- Observado: ha endpoints `/api/playback/:contentId`, progresso, continue-watching e componente frontend.
- Cumpre: sim, com risco por validacao incompleta.
- Falhas: RNF08 nao foi medido.
- Negativos: teste unitario valida progresso negativo.
- Evidencia: `referencia_privada_docente/frontend/src/services/api/playbackApi.js:3`; `tests/e2e/mf2-flow.spec.js:33`; `referencia_privada_docente/backend/tests/unit/mf2-validation.test.js:107`.
- Riscos: performance real do player nao confirmada nesta auditoria.
- Handoff: historico e favoritos/watchlist podem reutilizar `contentId` e `userId`.

### BK-MF2-06 - Legendas/audio, parental e qualidade

- Estado: CONFORME_COM_RISCOS
- Esperado: opcoes de legendas/audio/qualidade no conteudo, preferencias por utilizador, limite parental.
- Observado: seed inclui tracks/audio/qualityOptions; backend tem servico de preferencias media; frontend tem controlos no player e configuracao parental na conta.
- Cumpre: sim, com risco de validacao browser.
- Falhas: nao foi confirmado em browser real.
- Negativos: teste unitario valida parental e media.
- Evidencia: `referencia_privada_docente/backend/scripts/seed-mf2-e2e.js:83`; `referencia_privada_docente/backend/tests/unit/mf2-validation.test.js:118`.
- Riscos: baixo/medio por falta de E2E executado.
- Handoff: recomendacao futura pode usar preferencias e historico.

### BK-MF2-07 - Favoritos/watchlist/historico

- Estado: CONFORME_COM_RISCOS
- Esperado: dados por utilizador autenticado, ownership no backend, favoritos, watchlist, historico.
- Observado: endpoints em `/api/me`, servico usa `userId` vindo de `req.user.id`, frontend tem acoes e pagina de biblioteca.
- Cumpre: sim, com validacao dinamica incompleta.
- Falhas: E2E nao executado.
- Negativos: teste unitario rejeita tipo de lista invalido.
- Evidencia: `referencia_privada_docente/backend/src/app.js:42`; `referencia_privada_docente/frontend/src/services/api/libraryApi.js:3`; `referencia_privada_docente/backend/tests/unit/mf2-validation.test.js:126`.
- Riscos: baixo/medio por falta de prova E2E.
- Handoff: `BK-MF3-01` depende destes contratos para ratings por utilizador/conteudo.

### BK-MF2-08 - Teste E2E do fluxo principal

- Estado: PARCIAL
- Esperado: Playwright, seed `backend/scripts/seed-mf2-e2e.js`, media local, teste `tests/e2e/mf2-flow.spec.js`, medicoes RNF07/RNF08 inferiores a 3000 ms e evidence.
- Observado: os ficheiros existem e o teste cobre login, catalogo, detalhe, favoritos, watchlist, player e biblioteca. A media local existe com cerca de 1.7 MB.
- Cumpre: parcialmente.
- Falhas: a execucao nao foi confirmada. `npx playwright test --list` tentou aceder a `https://registry.npmjs.org/playwright` e falhou com `ENOTFOUND`; o E2E completo nao foi executado para nao modificar dados via seed.
- Negativos: seed tem protecao contra apagar conteudo por slug sem fixture.
- Evidencia: `tests/e2e/mf2-flow.spec.js:1`; `playwright.config.js:26`; `referencia_privada_docente/backend/scripts/seed-mf2-e2e.js:38`; `referencia_privada_docente/frontend/public/media/piloto.mp4`.
- Riscos: a MF2 nao tem prova operacional do fluxo principal no ambiente auditado.
- Handoff: MF3 nao deve assumir MF2 fechada sem E2E verde.

## Findings

### P0

Sem findings P0.

### P1

### P1 - BK-MF2-01 - Recuperacao de password nao fecha fluxo auditavel

- Area: Backend/Frontend/Testes
- Ficheiro: `referencia_privada_docente/backend/src/modules/auth/auth.service.js:97`; `referencia_privada_docente/backend/tests/unit/mf2-validation.test.js:68`; `referencia_privada_docente/frontend/src/components/auth/AuthForms.jsx:63`
- Evidencia observada: o backend cria token de reset e guarda hash, e o teste confirma que a resposta publica contem apenas `message`; nao foi encontrada entrega de email real, canal dev-only controlado, endpoint administrativo seguro ou evidence que permita ao utilizador obter o token bruto para completar `reset-password`.
- Esperado pelo BK/documento: `BK-MF2-01` cobre `RF05` e exige recuperacao de password; email real esta fora de scope, mas o fluxo deve ser demonstravel sem expor o token na resposta publica.
- Impacto: o fluxo RF05 fica incompleto para validacao PAP e para o utilizador final do MVP; a funcionalidade so e testavel por acesso interno a base de dados.
- Correcao recomendada: adicionar mecanismo dev-only seguro e documentado para evidence, ou uma simulacao controlada de entrega de reset fora da resposta publica, com teste de ponta a ponta que demonstre `forgot -> obter token por canal controlado -> reset -> login`.

### P2

### P2 - BK-MF2-08 - E2E principal existe mas nao foi executado nesta auditoria

- Area: Testes
- Ficheiro: `tests/e2e/mf2-flow.spec.js:1`; `playwright.config.js:26`
- Evidencia observada: existe teste Playwright e seed, mas a auditoria nao executou `npm run e2e:mf2`; `npx playwright test --list` tentou rede e falhou com `ENOTFOUND registry.npmjs.org`.
- Esperado pelo BK/documento: `BK-MF2-08` exige `npm run e2e:mf2`, medicoes `RNF07` e `RNF08` e evidence do relatorio Playwright.
- Impacto: nao ha prova objetiva de que o fluxo principal MF2 passa no ambiente auditado.
- Correcao recomendada: garantir dependencias instaladas na raiz, correr E2E em ambiente com MongoDB controlado e anexar output com `RNF07 catalogLoadMs` e `RNF08 playStartMs`.

### P2 - MF2 - Navegacao expoe areas futuras/placeholder

- Area: Scope/Frontend
- Ficheiro: `referencia_privada_docente/frontend/src/components/layout/AppHeader.jsx:7`
- Evidencia observada: a navegacao inclui `Pesquisa`, `Associacoes` e `Planos`, que pertencem a MFs posteriores; tambem inclui links admin visiveis antes de a sessao/role ser considerada.
- Esperado pelo BK/documento: MF2 deve focar identidade, catalogo, detalhe, playback, media controls e biblioteca pessoal; funcionalidades futuras nao devem substituir contratos de BK nem criar promessa funcional.
- Impacto: risco de drift pedagogico e UX, sobretudo se utilizadores interpretarem placeholders como funcionalidades fechadas.
- Correcao recomendada: esconder links futuros atras de feature flags, remover da navegacao principal ate aos BKs correspondentes, ou marcar explicitamente como area futura sem impacto no fluxo MF2.

### P2 - MF1 -> MF2 - Contrato de sessao anonima diverge entre BK-MF1-06 e implementacao atual

- Area: Coerencia entre MFs
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md:186`; `referencia_privada_docente/backend/tests/smoke/app.smoke.test.js:64`
- Evidencia observada: o guia MF1 esperava 401 para `/api/session/me` sem cookie, mas a suite atual espera 200 com `user: null`.
- Esperado pelo BK/documento: contratos entre MFs devem ser preservados ou o drift deve ser documentado.
- Impacto: nao bloqueia a MF2 se o contrato atual for deliberado, mas cria ambiguidade para alunos e auditores.
- Correcao recomendada: documentar a decisao canonica para `/api/session/me` anonimo e alinhar BK/relatorio de MF1 ou testes.

### P2 - MF2 -> MF3 - BK-MF3-01 e demasiado generico para handoff tecnico forte

- Area: Documentacao/Coerencia entre MFs
- Ficheiro: `docs/planificacao/guias-bk/MF3/BK-MF3-01-ratings-e-agregacao.md:125`
- Evidencia observada: o BK seguinte usa pseudo-checklist e nao fixa endpoints, payloads, modelo de dados, agregacao ou ownership de ratings.
- Esperado pelo BK/documento: handoff de MF2 para MF3 deve permitir reutilizar contratos de conteudo/utilizador sem ambiguidades.
- Impacto: risco de a MF3 criar contratos incompatíveis com `contents`, `users` e ownership ja implementados.
- Correcao recomendada: antes de implementar ratings, hidratar `BK-MF3-01` com contrato concreto de endpoints/modelos e negativos.

## Fora de scope detetado

- Links de navegacao para `Pesquisa`, `Associacoes` e `Planos` aparecem em `AppHeader.jsx`; parecem placeholders e nao substituem funcionalidades de MF3/MF4.
- Gestao admin de utilizadores ja existe; pode ser aceitavel como extensao de roles base (`RF04`), mas tambem toca parcialmente em `RF58`/MF5. Como os endpoints estao protegidos por role, foi tratado como risco de scope/UX, nao como falha bloqueante.

## Coerencia entre MFs

- MFs implementadas consideradas: `MF1`, `MF2`, sinais parciais de `MF3`, `MF4` e `MF5`.
- Fronteiras auditadas: `MF1 -> MF2`; `MF2 -> MF3`.
- Contratos coerentes: cookie HttpOnly, `credentials: "include"`, `req.user`, roles, catalogo publicado, `contentId`, `userId`, listas pessoais e progresso.
- Incoerencias: drift documental sobre resposta anonima de `/api/session/me`; handoff MF3 generico; evidence E2E ausente.
- Risco para a app completa: medio enquanto `BK-MF2-08` nao estiver verde e `BK-MF3-01` nao tiver contrato concreto.

## Drift documental/codigo

- `BK-MF1-06` descreve 401 para sessao anonima; implementacao/teste atual aceita 200 com `user: null`.
- `BK-MF3-01` nao tem especificidade tecnica proporcional para depender de `BK-MF2-07`.
- Nao foi detetado drift na lista oficial de BKs da MF2: guias, backlog, matriz e sprints apontam para `BK-MF2-01..08`.

## Seguranca e privacidade

- Sem evidencia de tokens em `localStorage` ou `sessionStorage`.
- Sessao usa cookie `HttpOnly`, `sameSite: "lax"` e `secure` em producao.
- Passwords sao guardadas como hash, nao texto claro.
- Logs estruturados redigem chaves sensiveis como `authorization`, `cookie`, `password`, `token`, `secret` e `set-cookie`.
- Rotas admin observadas usam `requireRole(["admin"])` ou `requireRole(["admin", "moderator"])`.
- Recursos pessoais observados usam `req.user.id` no backend e nao confiam num `userId` enviado pelo frontend.
- Principal risco de seguranca/privacidade encontrado: recuperacao de password precisa de canal de demonstracao que nao exponha token publicamente nem obrigue acesso manual inseguro a dados internos.

## Testes e comandos

- Comando: `bash scripts/validate-planificacao.sh`
- Diretoria: raiz
- Resultado: PASS
- Observacoes: `checked_bks: 55`, `checked_guides: 55`, `errors: []`.

- Comando: `npm --prefix pasta_privada_do_professor/backend run test`
- Diretoria: raiz
- Resultado: FAIL por ambiente
- Observacoes: 7 testes passaram; 6 smoke falharam com `listen EPERM: operation not permitted 127.0.0.1`, antes de validar comportamento funcional.

- Comando: `npm --prefix pasta_privada_do_professor/backend run smoke`
- Diretoria: raiz
- Resultado: FAIL por ambiente
- Observacoes: 6/6 smoke falharam com `listen EPERM` ao abrir servidor local no sandbox.

- Comando: `npx playwright test --list`
- Diretoria: raiz
- Resultado: FAIL por ambiente/dependencias
- Observacoes: tentou aceder a `https://registry.npmjs.org/playwright` e falhou com `ENOTFOUND`; nao foi repetido com rede porque a auditoria proibe instalar dependencias.

- Comando nao executado: `npm --prefix pasta_privada_do_professor/frontend run smoke`
- Motivo: `smoke` executa `vite build` e pode atualizar `referencia_privada_docente/frontend/dist`, o que criaria artefactos de build durante uma auditoria sem alteracao de codigo.

- Comando nao executado: `npm run smoke`
- Motivo: agrega frontend smoke/build e herdaria o risco de escrita em `dist`.

- Comando nao executado: `npm run e2e:mf2`
- Motivo: executa seed persistente em MongoDB e Playwright; sem ambiente controlado de dados, seria inadequado para uma auditoria read-only.

## Conclusao

- A MF pode fechar? Nao.
- A MF encaixa com as MFs ja implementadas? Encaixa no essencial com riscos.
- O que falta corrigir? Fechar fluxo auditavel de recuperacao de password, executar E2E MF2 com evidence, alinhar drift de sessao anonima MF1/MF2 e clarificar/remover navegacao futura/placeholder.
- Risco para a proxima MF: medio; `MF3` depende de contratos de conteudo/utilizador/listas/historico que existem, mas nao deve iniciar ratings sem MF2 E2E verde e sem contrato tecnico concreto para `BK-MF3-01`.
