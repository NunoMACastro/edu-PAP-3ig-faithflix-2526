# BK-MF1-04 - Sessao segura backend (cookies e auth base)

## Header

- `doc_id`: `GUIA-BK-MF1-04`
- `bk_id`: `BK-MF1-04`
- `macro`: `MF1`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-01`
- `rf_rnf`: `RNF13, RNF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-05`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- `last_updated`: `2026-05-27`

## Bloco pedagogico (obrigatorio)

Este BK ensina a preparar a base de sessao segura no backend FaithFlix. A equipa vai criar helpers de cookies, middleware de sessao e rotas tecnicas minimas para verificar o estado da sessao, sem implementar ainda registo, login, passwords ou roles.

O objetivo pedagogico e perceber porque cookies HttpOnly sao mais seguros do que guardar tokens em `localStorage`, e como o backend deve preparar a sessao antes de construir autenticação funcional em `MF2`.

## Bloco operacional (obrigatorio)

O trabalho operacional e adicionar ao backend a estrutura `auth/session`, com configuracao de cookie, leitura segura do cookie de sessao, resposta 401 controlada e logout idempotente. O BK fecha contratos para `BK-MF2-01`, mas nao entrega login real.

#### BK-MF1-04 - Sessao segura backend (cookies e auth base)

##### O que vamos fazer neste BK

Neste BK vamos preparar a base de sessao autenticada do backend. A aplicacao passara a saber qual e o nome do cookie de sessao, que flags deve usar, como ler o cookie recebido e como responder quando nao existe sessao valida.

Tambem vamos criar rotas tecnicas de sessao: `GET /api/session/me`, que devolve 401 enquanto nao houver sessao real, e `POST /api/session/logout`, que limpa o cookie de forma segura. Estes endpoints sao derivados de `RNF15` e da preparacao para `RF01/RF02`, mas nao implementam registo nem login.

`RNF13` exige comunicacao segura. Em local pode usar `http://localhost`, mas em producao os cookies devem usar `Secure` e o deploy deve estar atras de HTTPS. Este BK documenta e prepara essa diferenca.

##### Porque e que isto e importante

- Evita que a equipa guarde tokens no frontend.
- Cria contrato de sessao para `BK-MF2-01`.
- Permite ao cliente API de `BK-MF1-03` enviar cookies com `credentials: include`.
- Define comportamento claro para utilizador nao autenticado.
- Reduz risco de XSS roubar tokens de sessao.

##### O que entra (scope)

- Configurar nome e flags do cookie de sessao.
- Criar helper `getSessionCookieOptions()`.
- Criar middleware para ler cookie de sessao.
- Criar `GET /api/session/me` com resposta 401 quando nao autenticado.
- Criar `POST /api/session/logout` para limpar cookie.
- Documentar contrato para login futuro.
- Validar negativos de cookie ausente, falso e configuracao insegura.

##### O que nao entra (scope-out)

- Nao entra registo de utilizadores.
- Nao entra login com email/password.
- Nao entra hashing de passwords.
- Nao entra base de dados de sessoes ou utilizadores.
- Nao entra roles `admin`, `editor`, `moderador` ou `utilizador`.
- Nao entra CSRF completo, embora fique registado como follow-up de seguranca.

##### Como saber que isto ficou bem

- Rotas de sessao existem e respondem JSON.
- Sem cookie, `GET /api/session/me` responde 401.
- Cookie falso nao autentica utilizador.
- Logout limpa o cookie com as mesmas flags base.
- O contrato esta pronto para `BK-MF2-01` criar login real.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF1` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Matheus` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF1-01` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: backend Express modular criado e `src/app.js` disponivel para montar rotas auth (DERIVADO)
- Ref. Plano: `MF-VIEWS > MF1`, `PLANO-SPRINTS > Sprint 2`, `MATRIZ-CANONICA-BK > RNF13/RNF15` (CANONICO)
- Flow ID: `MF1-backend-secure-session-04` (DERIVADO)
- Fonte de verdade: `docs/RNF.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Descricao: preparar sessao segura backend com cookies HttpOnly e contrato base de auth, sem autenticação funcional completa (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Criar configuracao de cookie de sessao.
- Criar parser simples e controlado para cookies recebidos.
- Criar middleware `attachSession`.
- Criar service base de sessao sem persistencia.
- Criar controller e routes de sessao.
- Montar rotas `auth/session` em `src/app.js`.
- Documentar handoff para registo/login em `MF2`.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: backend modular existe, mas nao ha base de sessao.
- Estado esperado depois do BK: backend sabe lidar com cookie de sessao, responde 401 controlado e consegue limpar cookie.
- Ficheiros a criar: `backend/src/config/session.js`, `backend/src/utils/cookies.js`, `backend/src/middlewares/session.middleware.js`, `backend/src/modules/auth/auth.routes.js`, `backend/src/modules/auth/session.controller.js`, `backend/src/modules/auth/session.service.js`.
- Ficheiros a editar: `backend/src/app.js`, `backend/.env.example`, `backend/README.md`.
- Ficheiros a rever: `frontend/src/services/api/apiClient.js`, `docs/RNF.md`, guia `BK-MF1-03`.
- Dependencias de BK anteriores e uso: reutiliza `BK-MF1-01` para estrutura Express e middlewares; considera `BK-MF1-03` para compatibilidade de cookies, sem ser dependencia canonica deste BK.
- Impacto na arquitetura da app: cria modulo `auth` base para `MF2`.
- Impacto frontend: o cliente API deve continuar com `credentials: include`.
- Impacto backend: adiciona camada de sessao, cookie options, middleware e rotas.
- Impacto dados: nenhum armazenamento persistente ainda.
- Impacto seguranca: melhora postura contra roubo de tokens por XSS; prepara HTTPS/secure cookies.
- Impacto testes: fornece negativos para `BK-MF1-06`.
- Impacto UI: nenhum direto.
- Handoff para o proximo BK: `BK-MF1-05` deve logar pedidos sem expor cookies; `BK-MF2-01` deve criar login reutilizando estes helpers.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/RNF.md`: `RNF13`, `RNF15`, `RNF30`.
- Guia `BK-MF1-01`: estrutura backend e middleware de erro.
- Guia `BK-MF1-03`: cliente API com `credentials: include`.
- `docs/RF.md`: contexto futuro de registo/login/recuperacao, sem implementar ainda.
- `backend/src/app.js`: ponto onde as rotas auth serao montadas.

#### Glossario (rapido) (DERIVADO):

- Sessao: estado que identifica um utilizador autenticado entre pedidos.
- Cookie: pequeno valor guardado pelo browser e enviado ao servidor.
- HttpOnly: flag que impede JavaScript de ler o cookie.
- Secure: flag que so envia cookie por HTTPS.
- SameSite: flag que limita envio de cookies em navegacao cross-site.
- XSS: ataque em que JavaScript malicioso corre no browser da vitima.
- CSRF: ataque que tenta usar cookies da vitima para submeter pedidos indesejados.
- Middleware de sessao: codigo que lê cookie e prepara `req.session`.
- 401 Unauthorized: resposta para utilizador nao autenticado.
- Logout idempotente: chamar logout varias vezes tem o mesmo resultado seguro.

#### Conceitos teoricos essenciais (DERIVADO):

**Cookies HttpOnly vs localStorage.** Tokens em `localStorage` podem ser lidos por JavaScript se houver XSS. Cookies HttpOnly nao podem ser lidos por JavaScript, reduzindo o impacto desse ataque. Ainda assim, cookies exigem cuidados com CSRF.

**Flags de cookie.** `httpOnly: true` protege contra leitura por JS. `secure: true` deve estar ativo em producao com HTTPS. `sameSite: 'lax'` e um equilibrio razoavel para apps web sem integrações externas complexas nesta fase.

**Sessao base nao e login.** Este BK prepara o caminho da sessao. Login real precisa validar credenciais, fazer hash de passwords, criar token/sessao e persistir dados, o que pertence a `BK-MF2-01`.

**Middleware de auth.** Um middleware pode ler o cookie antes do controller. Se a sessao for valida, adiciona `req.session`. Se nao for, deixa `req.session = null` e controllers protegidos respondem 401.

**CSRF.** Cookies sao enviados automaticamente pelo browser. Em fases futuras, pedidos que alteram dados devem considerar token CSRF, `SameSite` adequado e validacao de origem.

**Erros comuns.** Criar endpoint `dev-login`, aceitar qualquer cookie como autenticado, colocar segredo de sessao no repo, ou devolver o valor do cookie em logs/respostas.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar backend base**
   - Descricao detalhada do objetivo: garantir que a app Express modular de `BK-MF1-01` existe.
   - Justificacao: este BK monta rotas e middlewares nessa base, nao cria backend do zero.
   - Como fazer (0.1): abrir `backend/src/app.js`.
   - Como fazer (0.2): confirmar que existem `middlewares/` e `modules/`.
   - Ficheiro a rever: `backend/src/app.js`
   - Ficheiro alvo: nenhum ainda.
   - Snippet de referencia: `export function createApp()`
   - O que verificar: existe ponto claro para `app.use('/api/session', authRouter)`.

1. **Objetivo (~20 min): Definir configuracao de sessao**
   - Descricao detalhada do objetivo: centralizar nome do cookie e comportamento por ambiente.
   - Justificacao: flags de cookie nao devem ser repetidas em controllers.
   - Como fazer (1.1): atualizar `.env.example` com `SESSION_COOKIE_NAME=faithflix_session`.
   - Como fazer (1.2): criar `backend/src/config/session.js`.
   - Ficheiro a rever: `backend/src/config/env.js`
   - Ficheiro alvo: `backend/src/config/session.js`
   - Snippet de referencia:
     ```js
     export function getSessionCookieOptions() {
       return {
         httpOnly: true,
         secure: env.nodeEnv === 'production',
         sameSite: 'lax',
         path: '/',
       };
     }
     ```
   - O que verificar: `secure` fica true em producao e false apenas em local.

2. **Objetivo (~20 min): Criar utilitario para ler cookies**
   - Descricao detalhada do objetivo: extrair o valor de um cookie a partir do header `Cookie`.
   - Justificacao: evitar dependencia nova se o caso e simples e controlado.
   - Como fazer (2.1): criar `backend/src/utils/cookies.js`.
   - Como fazer (2.2): implementar `getCookieValue(cookieHeader, cookieName)`.
   - Ficheiro a rever: nenhum.
   - Ficheiro alvo: `backend/src/utils/cookies.js`
   - Snippet de referencia:
     ```js
     export function getCookieValue(cookieHeader = '', name) {
       return cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.split('=')[1] ?? null;
     }
     ```
   - O que verificar: cookie ausente devolve `null`, nao erro.

3. **Objetivo (~25 min): Criar service base de sessao**
   - Descricao detalhada do objetivo: preparar funcoes de sessao sem persistencia real.
   - Justificacao: separa contrato de auth da futura base de dados.
   - Como fazer (3.1): criar `session.service.js`.
   - Como fazer (3.2): implementar `getSessionUser(sessionToken)` a devolver `null` ate `MF2`.
   - Ficheiro a rever: `docs/RF.md`
   - Ficheiro alvo: `backend/src/modules/auth/session.service.js`
   - Snippet de referencia:
     ```js
     export async function getSessionUser(_sessionToken) {
       // MF2: validar token/sessao contra store real.
       return null;
     }
     ```
   - O que verificar: nao ha user fake autenticado.

4. **Objetivo (~30 min): Criar middleware de sessao**
   - Descricao detalhada do objetivo: ler cookie e anexar resultado ao request.
   - Justificacao: controllers futuros nao devem parsear cookies manualmente.
   - Como fazer (4.1): criar `attachSession`.
   - Como fazer (4.2): montar middleware antes das rotas protegidas.
   - Ficheiro a rever: `backend/src/middlewares/error.middleware.js`
   - Ficheiro alvo: `backend/src/middlewares/session.middleware.js`
   - Snippet de referencia:
     ```js
     export async function attachSession(req, _res, next) {
       const token = getCookieValue(req.headers.cookie, sessionConfig.cookieName);
       req.session = { token, user: await getSessionUser(token) };
       next();
     }
     ```
   - O que verificar: cookie falso nao cria `user`.

5. **Objetivo (~30 min): Criar controller de sessao**
   - Descricao detalhada do objetivo: responder ao estado da sessao e limpar cookie no logout.
   - Justificacao: o frontend precisa de comportamento previsivel para 401/logout.
   - Como fazer (5.1): criar `getCurrentSession`.
   - Como fazer (5.2): criar `logout` usando `res.clearCookie` com as mesmas options.
   - Ficheiro a rever: `frontend/src/services/api/apiClient.js`
   - Ficheiro alvo: `backend/src/modules/auth/session.controller.js`
   - Snippet de referencia:
     ```js
     if (!req.session?.user) {
       return res.status(401).json({ message: 'Sessao nao autenticada.' });
     }
     ```
   - O que verificar: sem cookie responde 401, nao 500.

6. **Objetivo (~25 min): Montar rotas de sessao**
   - Descricao detalhada do objetivo: expor endpoints tecnicos de sessao.
   - Justificacao: `MF2` precisa de rotas e nomes estaveis para auth.
   - Como fazer (6.1): criar `auth.routes.js`.
   - Como fazer (6.2): montar em `app.use('/api/session', authRouter)`.
   - Ficheiro a rever: `backend/src/app.js`
   - Ficheiro alvo: `backend/src/modules/auth/auth.routes.js`
   - Snippet de referencia:
     ```js
     router.get('/me', getCurrentSession);
     router.post('/logout', logout);
     ```
   - O que verificar: `GET /api/session/me` e `POST /api/session/logout` respondem JSON.

7. **Objetivo (~20 min): Documentar contrato para MF2**
   - Descricao detalhada do objetivo: explicar o que login futuro deve reutilizar.
   - Justificacao: evita que `BK-MF2-01` crie outro cookie ou outro formato de sessao.
   - Como fazer (7.1): atualizar `backend/README.md` com secao "Sessao".
   - Como fazer (7.2): listar cookie name, flags, endpoints e scope-out.
   - Ficheiro a rever: `backend/README.md`
   - Ficheiro alvo: `backend/README.md`
   - Snippet de referencia:
     ```md
     Login real entra em BK-MF2-01 e deve reutilizar `getSessionCookieOptions()`.
     ```
   - O que verificar: README nao promete autenticação completa.

8. **Objetivo (~25 min): Validar seguranca e handoff**
   - Descricao detalhada do objetivo: executar smoke e negativos de sessao.
   - Justificacao: sessao e uma area critica; P0 exige prova e negativos.
   - Como fazer (8.1): testar `GET /api/session/me` sem cookie e com cookie falso.
   - Como fazer (8.2): testar `POST /api/session/logout` e registar headers `Set-Cookie`.
   - Ficheiro a rever: `backend/src/config/session.js`
   - Ficheiro alvo: evidence do PR/defesa
   - Snippet de referencia:
     ```bash
     curl -i http://localhost:3000/api/session/me
     curl -i --cookie "faithflix_session=falso" http://localhost:3000/api/session/me
     ```
   - O que verificar: 401 controlado, cookie falso rejeitado, flags documentadas, sem logs de cookie.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] Backend arranca.
- [ ] `GET /api/session/me` responde 401 sem cookie.
- [ ] `POST /api/session/logout` responde sucesso/idempotente.
- [ ] Configuracao de cookie esta centralizada.

**Negativos**
- [ ] Passo: 8; input/acao: sem cookie em `/api/session/me`; resultado esperado: 401 JSON; risco que cobre: utilizador anonimo tratado como autenticado.
- [ ] Passo: 8; input/acao: cookie falso `faithflix_session=falso`; resultado esperado: 401 JSON; risco que cobre: confiar em token nao validado.
- [ ] Passo: 1; input/acao: simular `NODE_ENV=production`; resultado esperado: `secure: true`; risco que cobre: cookie enviado sem HTTPS em producao.

**Tecnico**
- [ ] Helpers de cookie ficam em `config/session.js` e `utils/cookies.js`.
- [ ] Controllers nao repetem flags de cookie.
- [ ] `session.service.js` nao cria utilizador fake.
- [ ] Nao existem passwords, roles ou BD neste BK.

**Regressao das fases anteriores**
- [ ] Estrutura de `BK-MF1-01` foi preservada.
- [ ] Cliente API de `BK-MF1-03` continua compativel com cookies.
- [ ] Metadados canonicos nao foram alterados.

**UI/mockup**
- [ ] Nao aplicavel diretamente; login visual do mockup continua placeholder.

**Seguranca**
- [ ] Cookie configurado com `httpOnly`.
- [ ] `secure` ativo em producao.
- [ ] `sameSite` definido.
- [ ] Logs/respostas nao incluem valor do cookie.

#### Criterios de aceite:

**Outputs:**
- Modulo `auth/session` criado.
- Middleware de sessao criado.
- Rotas `GET /api/session/me` e `POST /api/session/logout` disponiveis.
- Cookie options centralizadas.

**Verificacoes:**
- Sem cookie: 401.
- Cookie falso: 401.
- Logout: limpa cookie sem erro.
- Em producao: cookie `secure`.

**Qualidade:**
- Sem autenticação falsa.
- Sem segredos no repositorio.
- Sem armazenamento inseguro no frontend.

**Continuidade:**
- `BK-MF2-01` reutiliza cookie name, options e middleware.
- `BK-MF1-05` adiciona logs sem expor cookies.
- `BK-MF1-06` consegue testar 401 e logout.

**Evidencia:**
- PR/commit com modulo auth.
- Outputs `curl` dos casos validos/negativos.
- Nota de configuracao `NODE_ENV=production`.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `backend/src/config/session.js`, `backend/src/utils/cookies.js`, `backend/src/middlewares/session.middleware.js`, `backend/src/modules/auth/`, `backend/src/app.js`
- `commands`: `npm run dev`, `curl -i http://localhost:3000/api/session/me`, `curl -i --cookie "faithflix_session=falso" http://localhost:3000/api/session/me`
- `screenshots`: `Nao aplicavel; usar headers/respostas de terminal`
- `notes`: `Sessao base criada sem login real; login entra em BK-MF2-01`

#### TODOs

- TODO: decidir em `MF2` se a sessao usa JWT assinado ou token opaco guardado no servidor.
- TODO: implementar hashing de passwords apenas no BK de autenticação funcional.
- TODO: avaliar protecao CSRF antes de formularios autenticados que alteram dados.
- TODO (BLOCKER): se o deploy final nao suportar HTTPS, `RNF13/RNF15` ficam bloqueados para producao.
- FOLLOW-UP: `BK-MF2-01` deve criar login usando `res.cookie(sessionConfig.cookieName, token, getSessionCookieOptions())`.
- FOLLOW-UP: `BK-MF1-05` deve mascarar cookies em logs.
- Assuncao tecnica: `SameSite=Lax` e suficiente para MVP sem integrações externas complexas; rever se houver gateway/SSO.
- Decisoes dependentes de mockup: nenhuma neste BK.
- Decisoes dependentes de app/codigo ainda inexistente: store real de sessao e modelo de utilizador.

## Snippet tecnico aplicavel

```js
// backend/src/modules/auth/session.controller.js
import { sessionConfig, getSessionCookieOptions } from '../../config/session.js';

export function getCurrentSession(req, res) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Sessao nao autenticada.' });
  }

  return res.json({ user: req.session.user });
}

export function logout(_req, res) {
  res.clearCookie(sessionConfig.cookieName, getSessionCookieOptions());
  return res.json({ message: 'Sessao terminada.' });
}
```

## Proximo BK recomendado

`BK-MF1-05`, para health-check e logging estruturado sem expor cookies ou dados sensiveis. Handoff funcional forte para `BK-MF2-01`.

## Changelog

- `2026-05-27`: refinado para guia executavel de sessao segura base, sem transformar MF1 em autenticação funcional completa.
