# Auditoria end-to-end e UI/UX — Autenticação e sessões

- Data: 2026-07-12
- Sistema: Autenticação e sessões
- Slug: `AUTENTICACAO-SESSOES`
- Implementação auditada: `real_dev/backend` e `real_dev/frontend`
- Modo: auditoria seguida de correção autorizada
- Decisão final: `PASS`
- Findings abertos: `P0=0`, `P1=0`, `P2=0`, `P3=0`
- Findings fechados/reclassificados: `1 P1` reclassificado + `2 P3` corrigidos
- Contexto operacional: demonstração PAP; não existe lane de produção

## 1. Resumo executivo

O registo, o login, a resolução de sessão, a autorização, o CSRF, o logout e a
alteração de password a partir de um token válido estão implementados e ligados
entre frontend, API e persistência. As fronteiras de segurança usam sessão
server-side, cookie `HttpOnly`, token opaco persistido apenas por hash, TTL
absoluto de 24 horas, `SameSite=Lax`, `Secure` quando HTTPS é obrigatório,
validação fechada, rate limiting distribuído e revogação de sessões.

Os gates executados passaram: backend completo `366/366`, frontend completo
`295/295`, contratos `6 + 15 + 31`, segurança `12/12`, lint, build e Axe/reflow
`35/35`. A UI de identidade foi ainda inspecionada no browser em desktop,
tablet e mobile com API sintética exclusivamente local e sem persistência.

A clarificação do responsável do projeto confirmou que a FaithFlix não terá
lane de produção: o produto será executado exclusivamente como demonstração na
apresentação final da PAP. Nesse âmbito, `password_reset_dev_outbox` e a página
`/caixa-demo` são o canal operacional deliberado. O antigo P1 comparava a PAP
com uma infraestrutura de produção inexistente e foi reclassificado como falso
positivo de âmbito, sem introduzir SMTP, providers ou dependências externas.

Os dois P3 foram corrigidos: o E2E procura agora “Já tenho um código”, a copy
pública usa acentuação PT-PT e o teste backend prova que o código criado pelo
pedido é exatamente o apresentado na caixa demo. Uma validação limitada na DB
`_demo` confirmou também a cadeia real sem expor token, password ou URI.

## 2. Scope incluído e excluído

### Incluído

- requisitos `RF01`, `RF02`, `RF05`, `RNF15`, `RNF16` e `RNF29`;
- registo, login, bootstrap de sessão, expiração/invalidação e logout;
- recuperação e reset de password;
- cookies, CORS, CSRF, rate limits, headers, erros e logging HTTP;
- contas `active`, `blocked`, `deleted` e estados desconhecidos;
- redirects internos, landings por role e guardas de frontend;
- coleções, índices, TTL, atomicidade e concorrência;
- UI/UX, responsividade, teclado, foco e acessibilidade;
- testes unitários, integração HTTP, contratos, build, lint, segurança e Axe;
- consumidores diretos da sessão e revogação por gestão de conta/privacidade.

### Excluído

- alterações a requisitos, BKs, planos ou evidência histórica;
- autenticação federada/MFA, que não é requisito atual;
- SMTP, providers de email e qualquer infraestrutura de produção;
- browser E2E formal com MongoDB real, por falta de replica set local isolado;
- browsers branded e dispositivos físicos.

O `README.md` já estava modificado antes da auditoria e foi preservado sem
alterações desta execução.

## 3. Fontes e ficheiros consultados

### Contratos e arquitetura

- `README.md`
- `ARCHITECTURE.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`

### Backend

- `real_dev/backend/src/app.js`
- `real_dev/backend/src/config/env.js`
- `real_dev/backend/src/config/cors.js`
- `real_dev/backend/src/config/session.js`
- `real_dev/backend/src/middlewares/{session,csrf,cors,rate-limit,security,error,request-logger}.middleware.js`
- `real_dev/backend/src/modules/auth/*`
- `real_dev/backend/src/modules/demo-mailbox/*`
- `real_dev/backend/src/modules/users/user.service.js`
- `real_dev/backend/src/modules/privacy/privacy.service.js`
- `real_dev/backend/src/modules/notifications/notifications.service.js`

### Frontend

- `real_dev/frontend/src/services/api/{apiClient,apiErrors,authApi}.js`
- `real_dev/frontend/src/context/SessionContext.jsx`
- `real_dev/frontend/src/components/auth/*`
- `real_dev/frontend/src/components/layout/SessionActionButton.jsx`
- `real_dev/frontend/src/pages/LoginPage.jsx`
- `real_dev/frontend/src/routes/AppRoutes.jsx`
- `real_dev/frontend/src/utils/authRedirect.js`
- `real_dev/frontend/src/styles/global.css`

### Testes e tooling

- testes de auth/security do backend e frontend;
- `tests/e2e/mf2-flow.spec.js`
- `tests/fixtures/mf2-auth.js`
- `real_dev/backend/scripts/seed-mf2-e2e.js`
- `scripts/e2e-environment.mjs`
- `playwright.config.js`
- `playwright.a11y.config.js`
- `real_dev/frontend/tests/a11y/accessibility.spec.js`

## 4. Mapa do sistema

### 4.1 Objetivo e atores

O sistema cria e autentica contas, mantém uma identidade server-side durante 24
horas, protege operações privadas e permite recuperar acesso através de um
token de uso único. Os atores são visitante, utilizador autenticado,
moderador e administrador. O backend é sempre a autoridade sobre identidade,
estado da conta e role.

### 4.2 Elementos e classificação

| Elemento | Localização/contrato | Classificação |
| --- | --- | --- |
| Página única de identidade | `/login`, `LoginPage`, `AuthForms` | `IMPLEMENTADO_E_LIGADO` |
| Guardas de rotas | `AnonymousRoute`, `AuthenticatedRoute`, `AdminRoute` | `IMPLEMENTADO_E_LIGADO` |
| Estado global de sessão | `SessionContext` | `IMPLEMENTADO_E_LIGADO` |
| Cliente HTTP | `apiClient`, `authApi`, `credentials: include` | `IMPLEMENTADO_E_LIGADO` |
| Registo/login | `POST /api/auth/register`, `POST /api/auth/login` | `IMPLEMENTADO_E_LIGADO` |
| Recuperação | `POST /api/auth/forgot-password` | `IMPLEMENTADO_E_LIGADO` |
| Reset | `POST /api/auth/reset-password` | `IMPLEMENTADO_E_LIGADO` |
| Sessão atual | `GET /api/session/me` | `IMPLEMENTADO_E_LIGADO` |
| CSRF | `GET /api/session/csrf-token` e middleware global | `IMPLEMENTADO_E_LIGADO` |
| Logout | `POST /api/session/logout` | `IMPLEMENTADO_E_LIGADO` |
| Utilizadores | `users` | `IMPLEMENTADO_E_LIGADO` |
| Sessões | `sessions` | `IMPLEMENTADO_E_LIGADO` |
| Tokens de reset | `password_reset_tokens` | `IMPLEMENTADO_E_LIGADO` |
| Outbox de código de reset | `password_reset_dev_outbox` | `SIMULADO_OU_DEMO` |
| Caixa de email local | `/api/demo/mailbox` | `SIMULADO_OU_DEMO` |
| Rate limiting | `rate_limit_counters` | `INTERNO_OPERACIONAL` |
| Logs/correlação | request logger e error handler | `INTERNO_OPERACIONAL` |
| Jobs/cron de autenticação | TTL nativo MongoDB, sem worker próprio | `NAO_APLICAVEL` |
| E2E MF2 | seed + Playwright | `IMPLEMENTADO_PARCIAL` |
| Entrega do código na apresentação | outbox + `/caixa-demo` | `SIMULADO_OU_DEMO` |
| Entrega de produção | fora do produto PAP | `NAO_APLICAVEL` |

### 4.3 Dependências e consumidores

- todas as rotas privadas consomem `attachSession`, `requireAuth` ou
  `requireRole`;
- a gestão administrativa de utilizadores revoga sessões ao bloquear contas;
- reset de password e eliminação de conta revogam sessões;
- CSRF depende da sessão atual e da coleção `sessions`;
- o frontend depende de `/api/session/me` para não inventar identidade ou role;
- a recuperação usa deliberadamente a outbox e a caixa de email da demo local.

Não existe tenancy nem isolamento por organização aplicável ao sistema de
identidade atual.

## 5. Matriz de jornadas

| Jornada | Ator | Frontend | API/backend | Dados/efeitos | Negativos | UI/UX | Testes | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Criar conta e iniciar sessão | Visitante | Formulário ligado | Registo `201` | `users` + `sessions` na mesma transação | email repetido, payload inválido | loading, foco e feedback | unit/component; E2E formal bloqueado | `PASS` |
| Login e bootstrap | Utilizador | Login + refresh `/me` | Login `200` e sessão opaca | nova sessão com TTL | credenciais erradas, conta inativa, rate limit | erro acessível e valores preservados | unit, HTTP security, browser sintético | `PASS` |
| Aceder a rota privada | Utilizador | guarda preserva `next` | backend exige sessão/role | sem escrita | anónimo, role errada, sessão indisponível | loading/retry sem falso logout | unit e backend completo | `PASS` |
| Refresh e sessão expirada | Utilizador | `/me` recompõe estado | `/me` devolve `user|null` | sessão expirada não autentica | cookie inválido, conta bloqueada/deleted | estado `unavailable` distinto de anonymous | unit e regressão | `PASS` |
| Logout | Utilizador | busy, erro e redirect | CSRF + `204` | sessão apagada e cookie limpo | sessão já expirada e CSRF inválido | ação acessível | HTTP security e component | `PASS` |
| Pedir recuperação | Utilizador demo | “Enviar instruções” | resposta genérica `200` | hash + outbox demo com TTL | email inexistente e rate limit | feedback anunciado | unit/HTTP + validação DB `_demo` | `PASS` |
| Receber código | Utilizador demo | `/caixa-demo` | mailbox limitada a loopback/DB `_demo` | código temporário sem `userId` público | ambiente/socket inválido devolve `404` | página e componente testados | prova causal pedido→mailbox | `PASS` |
| Usar token e alterar password | Utilizador demo | formulário de reset | token single-use | password + revogação de tokens/sessões em transação | expirado, repetido e concorrente | ajuda, limites e foco | unit + E2E MF2 separado | `PASS` |
| Landing por role e `next` seguro | Qualquer role | redirect interno | role vem do backend | sem escrita | open redirect recusado | destino coerente | unit | `PASS` |

## 6. Contratos entre camadas

| Método e path | Input | Sucesso | Erros/observações |
| --- | --- | --- | --- |
| `POST /api/auth/register` | `{name,email,password}` | `201 {user}` + cookie | `400`, `409`; allowlist implícita pelos campos lidos |
| `POST /api/auth/login` | `{email,password}` | `200 {user}` + cookie | `400`, `401 AUTH_INVALID_CREDENTIALS`, `429` |
| `POST /api/auth/forgot-password` | `{email}` | `200 {message}` genérico | `400`, `429`; não devolve token |
| `POST /api/auth/reset-password` | `{token,password}` | `200 {message}` | `400 RESET_TOKEN_INVALID`, `429` |
| `GET /api/session/me` | cookie opcional | `200 {user|null}` | sem `401` para ausência normal |
| `GET /api/session/csrf-token` | sessão válida | `200 {csrfToken}` | `401 AUTH_REQUIRED`; `no-store` |
| `POST /api/session/logout` | cookie + CSRF quando autenticado | `204` | cookie limpo; idempotente para ausência de sessão |

O utilizador público contém `id`, `name`, `email`, `role`, `accountStatus` e
`parentalMaxAgeRating`; nunca contém `passwordHash`, hashes de token ou cookie.
Os erros usam `{code,message,requestId}` e `details` apenas em 4xx quando
aplicável. O cliente usa timeout de 10 segundos, cancelamento e uma única
renovação de CSRF.

Cookies e transporte:

- `HttpOnly`, `SameSite=Lax`, path `/`, TTL 24 horas;
- `Secure` em produção/HTTPS obrigatório;
- CORS com origin explícita e credenciais, nunca wildcard;
- mutações autenticadas exigem Origin/Fetch Metadata válido e token CSRF;
- redirects recusam outra origin, protocolo relativo, backslash e controlos.

## 7. Segurança e privacidade

### Controlo confirmado

- tokens opacos de 256 bits e apenas hashes SHA-256 na base;
- passwords com `scrypt`, salt aleatório e comparação em tempo constante;
- login executa derivação dummy para conta inexistente/inativa e mensagem
  genérica para reduzir enumeração;
- contas bloqueadas, eliminadas ou com estado desconhecido falham fechadas;
- rate limiting por IP, email ou token com chaves HMAC pseudonimizadas;
- a configuração conserva hardening de produção, embora essa lane não faça parte da PAP;
- validação de email, nome, password e token com limites fechados;
- registo faz commit de utilizador e sessão na mesma transação;
- reset reclama o token atomicamente e revoga tokens/sessões na transação;
- respostas de sessão são privadas/`no-store` e variam por cookie;
- erros 5xx e logs não expõem URI, password, token ou cookie;
- RBAC/ownership são decididos server-side pelos consumidores da sessão.

### Limite confirmado

Não existe audit trail específico para sucessos/falhas de login. Os requisitos
atuais exigem audit trail para ações administrativas críticas, não para cada
login, pelo que isto é uma possível evolução pós-PAP e não um finding.

## 8. Dados, transações e operação

| Coleção | Campos principais | Constraints/índices |
| --- | --- | --- |
| `users` | email normalizado, hash, role, status, timestamps | `email` único |
| `sessions` | `userId`, `tokenHash`, CSRF hashes, `createdAt`, `expiresAt` | token único + TTL |
| `password_reset_tokens` | `userId`/dummy, `tokenHash`, `usedAt`, `expiresAt` | token único + TTL |
| `password_reset_dev_outbox` | email, userId, token bruto, timestamps | email/data + TTL; apenas dev/demo |
| `rate_limit_counters` | scope, key HMAC, janela, count, expiry | composto único + TTL |

O TTL da sessão é absoluto e não desliza com atividade, conforme arquitetura.
O reset concorrente consome o token apenas uma vez. O registo reconcilia
explicitamente `UnknownTransactionCommitResult` sem aceitar um utilizador
anterior com o mesmo email.

Health separa liveness e readiness; logs têm `requestId`. Não há cache, ficheiros,
media, worker ou integração externa obrigatória no núcleo de sessão. A entrega
do reset é local, temporária e deliberadamente limitada à demonstração.

## 9. UI/UX e acessibilidade

`UI_UX: APLICAVEL`.

### Revisão estática

- uma rota `/login` reúne login, registo, pedido e reset sem multiplicar páginas;
- labels nativas, `autocomplete`, limites HTML e botão de mostrar password;
- loading desativa controlos e `submittingRef` impede duplo submit;
- mudança de modo limpa password/token e foca o primeiro campo relevante;
- alertas usam `role=alert`; sucessos usam `role=status`/`aria-live`;
- guardas distinguem loading, anonymous, authenticated e unavailable;
- skip link, landmarks, headings e reduced motion estão presentes;
- layout tem breakpoints a 900/720/390 px.

### Browser manual com API local sintética

A API sintética temporária respondeu apenas a contratos existentes, sem DB,
sessões reais ou persistência. Não constitui prova E2E do backend.

| Viewport | Resultado |
| --- | --- |
| `1366x900` | sem overflow; painel 1160 px dentro do viewport; submit 50 px e toggle 44 px de altura |
| `768x900` | sem overflow; painel 707 px dentro do viewport |
| `390x844` | sem overflow; inputs 358x50 px; scroll apenas vertical esperado |

Foram observados erro de credenciais, preservação do passo atual, limpeza de
password ao mudar de modo, foco em email/token e feedback genérico de
recuperação. O modo de reset apresenta “Já tenho um código”, não “token”.

### Axe/reflow automatizado

`npm run test:a11y` passou `35/35` em Chromium com fixtures exclusivamente
locais. Incluiu login a `2048x1152`, `1366x900`, `768x900` e `390x844`, alvos
mínimos, overflow, rotas públicas/privadas, Escape/foco e reflow equivalente a
200%.

## 10. Testes e comandos executados

| Comando | Diretório | Exit | Resultado |
| --- | --- | ---: | --- |
| `node --test tests/unit/auth-registration-transaction.test.js tests/unit/auth-login-timing.test.js tests/unit/security-controls.test.js` | `real_dev/backend` | 0 | `14/14` |
| frontend unit focado em auth/session/API/redirect | `real_dev/frontend` | 0 | `8` ficheiros, `54/54` |
| `node --test tests/integration/security-http.test.js` | `real_dev/backend` sandbox | 1 | bloqueio `listen EPERM`, não defeito |
| mesmo teste fora da sandbox | `real_dev/backend` | 0 | `3/3` |
| `npm test` | `real_dev/backend` fora da sandbox | 0 | `366/366` |
| `npm run test:unit -- --reporter=dot` | `real_dev/frontend` | 0 | `65` ficheiros, `295/295` |
| `npm run lint` | `real_dev/frontend` | 0 | zero warnings |
| `npm run build:check` | `real_dev/frontend` | 0 | PASS; warnings de chunks `dashjs`/`hls` |
| contratos root | raiz | 0 | `6/6` |
| contratos backend | `real_dev/backend` | 0 | `15/15` |
| contratos frontend | `real_dev/frontend` | 0 | `7` ficheiros, `31/31` |
| `npm run test:security` | raiz, fora da sandbox | 0 | `12/12`; baseline `PASS` |
| Playwright MF2 `--list` com DB formal fictícia loopback | raiz | 0 | `3` testes descobertos |
| `npm run test:a11y` | raiz, fora da sandbox | 0 | `35/35` |
| browser manual local | frontend + stub sem persistência | — | desktop/tablet/mobile validados |
| backend focado após correção | `real_dev/backend` | 0 | `17/17` |
| `AuthForms.test.jsx` após correção | `real_dev/frontend` | 0 | `11/11` |
| `node --check` dos ficheiros backend alterados | `real_dev/backend` | 0 | PASS |
| Playwright MF2 `--list` após correção | raiz | 0 | `3` testes descobertos com locator atual |
| validação causal na DB `_demo` | `real_dev/backend`, fora da sandbox | 0 | resposta sem token; mailbox com código temporário válido |
| `npm test` após correção | `real_dev/backend`, fora da sandbox | 0 | `366/366` |
| frontend completo após correção | `real_dev/frontend` | 0 | `65` ficheiros, `295/295` |
| segurança após correção | raiz, fora da sandbox | 0 | `12/12`; baseline `PASS` |
| lint + build após correção | `real_dev/frontend` | 0 | PASS |
| `npm run test:e2e:demo` | raiz, fora da sandbox | 1 | login demo passou; falha posterior por copy stale de recomendações, fora do sistema auditado |
| `git diff --check` | raiz | 0 | sem whitespace inválido antes do relatório |

O build emite avisos não bloqueantes de chunks grandes e de uma variável
CommonJS interna ao `dashjs`; não são defeitos do sistema de autenticação.

## 11. Fecho dos findings

| Finding original | Severidade original | Estado final | Resolução |
| --- | --- | --- | --- |
| `AUTENTICACAO-SESSOES-E2E-001` | P1 | `RECLASSIFICADO_NAO_APLICAVEL` | A ausência de email de produção não é defeito: a PAP é exclusivamente demo e a outbox/caixa local é o canal pedido. A cadeia foi confirmada na DB `_demo`. |
| `AUTENTICACAO-SESSOES-TEST-001` | P3 | `CORRIGIDO_CONFIRMADO` | Locator alinhado com “Já tenho um código”; o teste backend liga agora o hash persistido ao código devolvido pela caixa demo. O reset continua isolado e cobre replay/concorrência. |
| `AUTENTICACAO-SESSOES-UIUX-001` | P3 | `CORRIGIDO_CONFIRMADO` | Mensagens públicas alteradas para “Credenciais inválidas.” e “pedido de recuperação.”; testes focados e regressões passaram. |

### Evidência de reclassificação do antigo P1

O contexto fornecido pelo responsável em 2026-07-12 é vinculativo: não haverá
produção, apenas uma apresentação final. O mecanismo existente está desenhado
precisamente para isso:

- só é montado em desenvolvimento, demo ativa, DB `*_demo` e socket loopback;
- a resposta pública nunca contém o token;
- a outbox tem TTL e a mailbox remove `userId` do DTO;
- a validação real criou um pedido para uma persona reservada da demo e confirmou
  a presença do código sem o imprimir nem alterar a password.

Adicionar um provider externo não resolveria um requisito atual e aumentaria
configuração, risco e dependências sem valor para a apresentação.

### Evidência de correção dos P3

- `tests/e2e/mf2-flow.spec.js` usa a accessible name atual;
- `mf2-validation.test.js` prova `hashToken(código da mailbox) === tokenHash` do
  pedido criado nessa execução;
- o token pré-seeded mantém-se apenas para o subfluxo de reset E2E isolado, sem
  fingir que representa entrega;
- backend focado `17/17`, frontend focado `11/11`, backend completo `366/366`,
  frontend completo `295/295`, segurança `12/12`, lint e build passaram.

## 12. Riscos e validações bloqueadas

- O E2E formal MF2 não foi executado: não existe `mongod` instalado nem serviço
  na porta local 27017. Esta ausência não bloqueou a prova da demo: a base
  explicitamente marcada `*_demo` foi usada apenas para criar um pedido de
  recuperação temporário e consultar a respetiva mailbox.
- A integração HTTP inicialmente falhou com `listen EPERM` na sandbox; passou
  `3/3` fora da sandbox, confirmando bloqueio ambiental.
- O browser manual usou API sintética local e o Axe usou fixtures locais; estas
  provas validam UI, não a cadeia browser→backend→MongoDB.
- Axe/reflow correu em Chromium. Firefox, WebKit, dispositivos físicos e
  leitores de ecrã reais ficaram pendentes.
- `npm run test:e2e:demo` confirmou o primeiro percurso browser e o login da
  persona Pro, mas falhou depois numa expectativa stale de copy de recomendações
  (`As sugestões usam sinais agregados`). A página mostrou recomendações e
  sessão autenticada; o desvio pertence a recomendações, não a autenticação, e
  ficou fora desta correção strict-scope.
- Infraestrutura de produção e email externo são `NAO_APLICAVEL` à PAP.

## 13. Conclusão

O núcleo de sessão e as fronteiras de segurança são sólidos e proporcionais à
PAP. Registo, login, autorização, CSRF, expiração, logout e reset a partir de um
token válido têm implementação e testes fortes.

No único ambiente que constitui o produto — a demonstração PAP — o pedido de
recuperação cria um código temporário, não o expõe na resposta pública e torna-o
consultável na caixa demo protegida por ambiente, DB e loopback. A copy e os
testes ficaram alinhados sem adicionar complexidade de produção.

## 14. Decisão final

`PASS`

Fundamento: não existem findings P0–P3 abertos no âmbito real da PAP. O antigo
P1 foi reclassificado por contexto de produto e os dois P3 foram corrigidos e
revalidados. O bloqueio do E2E formal local e o drift de recomendações não
invalidam as jornadas de autenticação confirmadas nesta execução.
