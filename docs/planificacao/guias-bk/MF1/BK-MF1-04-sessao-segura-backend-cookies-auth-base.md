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
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-05`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- `last_updated`: `2026-05-30`

## Bloco pedagogico (obrigatorio)

Este BK prepara a base de sessao segura no backend. Ainda nao cria registo, login, passwords ou utilizadores reais. O objetivo e deixar a app pronta para, em `BK-MF2-01`, criar autenticacao funcional usando cookies HttpOnly em vez de guardar tokens no browser.

Para alunos do 12.º ano, a ideia principal e: uma sessao e a forma de o servidor reconhecer um utilizador depois do login. Mas nesta fase ainda nao ha login. Por isso, criamos o caminho seguro, devolvemos `401` quando nao ha sessao valida e garantimos que cookies falsos nao autenticam ninguem.

### O que entra

- Configuracao de cookie de sessao.
- Parser simples de cookies.
- Middleware `attachSession`.
- Endpoints `GET /api/session/me` e `POST /api/session/logout`.
- Integracao com `createApp()` do backend.

### O que nao entra

- Registo, login ou recuperacao de password.
- Hash de passwords.
- JWT definitivo ou token opaco definitivo.
- Base de dados de utilizadores.
- Perfis reais, papeis administrativos ou consentimentos.

### Check de compreensao

- [ ] Sei explicar porque cookies HttpOnly sao mais seguros que tokens em `localStorage`.
- [ ] Sei explicar porque cookie falso deve devolver `401`.
- [ ] Sei onde `BK-MF2-01` vai reutilizar esta base.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-01` executado, com `backend/src/app.js` e `createApp()` disponiveis.
- `BK-MF1-03` deve usar `credentials: 'include'` no frontend.
- Confirmar `RNF13` e `RNF15` em `docs/RNF.md`.
- Confirmar que nao existe autenticacao real no backend. Se ja existir, adaptar sem apagar.

### Guia de execucao (passo-a-passo)

### Passo 1 - Adicionar configuracao de cookie de sessao

1. Objetivo do passo.

Definir como o cookie de sessao se chama e que flags de seguranca deve ter.

2. Ficheiros envolvidos:
    - EDITAR: `backend/.env.example`
    - CRIAR: `backend/src/config/session.js`
    - LOCALIZACAO: `backend/` e `backend/src/config/`
    - REVER: `backend/src/config/env.js`, `RNF13`, `RNF15`

3. Instrucoes concretas.

Substitui `backend/.env.example` pelo conteudo abaixo para incluir `SESSION_COOKIE_NAME`. Depois cria `session.js`.

4. Codigo do ficheiro `backend/.env.example`.

```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=faithflix-api
SESSION_COOKIE_NAME=faithflix_session
```

5. Explicacao do codigo.

`SESSION_COOKIE_NAME` evita espalhar o nome do cookie pelo codigo. Se o nome mudar, muda num sitio. O valor nao e segredo; e apenas o nome do cookie.

6. Codigo do ficheiro `backend/src/config/session.js`.

```js
import { isProduction } from "./env.js";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const sessionConfig = {
    cookieName: process.env.SESSION_COOKIE_NAME ?? "faithflix_session",
    cookieMaxAgeMs: ONE_DAY_IN_MS,
};

export function getSessionCookieOptions(overrides = {}) {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: sessionConfig.cookieMaxAgeMs,
        ...overrides,
    };
}
```

7. Explicacao do codigo.

`httpOnly: true` impede JavaScript no browser de ler o cookie. `secure: isProduction` exige HTTPS em producao. `sameSite: 'lax'` reduz risco de alguns ataques CSRF sem bloquear navegacao normal. `path: '/'` permite que o cookie seja enviado para toda a API.

8. Validacao do passo.

Executar dentro de `backend/`:

```bash
node -e "import('./src/config/session.js').then(({ sessionConfig }) => console.log(sessionConfig.cookieName))"
```

Resultado esperado: `faithflix_session`.

9. Caso negativo ou erro comum.

Erro comum: criar cookie sem `HttpOnly`. Isso permitiria que scripts no browser lessem o token de sessao.

### Passo 2 - Criar utilitarios de cookie e service de sessao base

1. Objetivo do passo.

Ler cookies de forma defensiva e criar um service que, nesta fase, nunca autentica cookies falsos.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/utils/cookies.js`
    - CRIAR: `backend/src/modules/auth/session.service.js`
    - LOCALIZACAO: `backend/src/utils/` e `backend/src/modules/auth/`
    - REVER: `BK-MF2-01`, porque login real vai substituir a resolucao de sessao

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/auth/`. O service fica intencionalmente conservador: enquanto nao existir login real, nenhum token deve ser considerado valido.

4. Codigo do ficheiro `backend/src/utils/cookies.js`.

```js
import { getSessionCookieOptions, sessionConfig } from "../config/session.js";

export function parseCookies(cookieHeader = "") {
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((cookies, part) => {
            const separatorIndex = part.indexOf("=");

            if (separatorIndex === -1) {
                return cookies;
            }

            const key = part.slice(0, separatorIndex);
            const value = part.slice(separatorIndex + 1);

            try {
                cookies[key] = decodeURIComponent(value);
            } catch {
                cookies[key] = value;
            }

            return cookies;
        }, {});
}

export function readCookie(req, name) {
    return parseCookies(req.headers.cookie)[name];
}

export function clearSessionCookie(res) {
    res.cookie(
        sessionConfig.cookieName,
        "",
        getSessionCookieOptions({ maxAge: 0 }),
    );
}
```

5. Explicacao do codigo.

`parseCookies` transforma o header `Cookie` num objeto JavaScript. O `try/catch` evita que um cookie mal codificado parta a API. `clearSessionCookie` usa as mesmas flags de seguranca do cookie original, garantindo que o browser sabe qual cookie deve expirar.

6. Codigo do ficheiro `backend/src/modules/auth/session.service.js`.

```js
export async function resolveSession(sessionToken) {
    if (!sessionToken) {
        return null;
    }

    return null;
}
```

7. Explicacao do codigo.

Este service parece pequeno, mas e uma decisao de seguranca. Como ainda nao existe login nem base de dados, qualquer token recebido deve ser tratado como invalido. Em `BK-MF2-01`, este ficheiro pode passar a validar tokens assinados ou tokens opacos guardados no servidor.

8. Validacao do passo.

Confirmar que `resolveSession('qualquer-coisa')` devolve `null`.

9. Caso negativo ou erro comum.

Erro comum: aceitar qualquer cookie como utilizador autenticado para "testar mais rapido". Isso cria uma falha grave de seguranca.

### Passo 3 - Criar middleware e controller de sessao

1. Objetivo do passo.

Anexar informacao de sessao a cada pedido e expor endpoints tecnicos para verificar e terminar sessao.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/middlewares/session.middleware.js`
    - CRIAR: `backend/src/modules/auth/session.controller.js`
    - CRIAR: `backend/src/modules/auth/auth.routes.js`
    - LOCALIZACAO: `backend/src/middlewares/` e `backend/src/modules/auth/`
    - REVER: `apiClient.js`, porque o frontend envia cookies com `credentials: 'include'`

3. Instrucoes concretas.

Cria o middleware primeiro, depois controller e routes. O endpoint `me` deve devolver `401` enquanto nao existir sessao valida.

4. Codigo do ficheiro `backend/src/middlewares/session.middleware.js`.

```js
import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import { readCookie } from "../utils/cookies.js";

export async function attachSession(req, _res, next) {
    try {
        const token = readCookie(req, sessionConfig.cookieName);
        const user = await resolveSession(token);

        req.session = {
            token,
            user,
            isAuthenticated: Boolean(user),
        };

        next();
    } catch (error) {
        next(error);
    }
}
```

5. Explicacao do codigo.

O middleware corre antes das rotas. Ele procura o cookie, tenta resolver a sessao e guarda o resultado em `req.session`. Mesmo quando nao existe utilizador, a rota fica com uma estrutura previsivel: `isAuthenticated` sera `false`.

6. Codigo do ficheiro `backend/src/modules/auth/session.controller.js`.

```js
import { clearSessionCookie } from "../../utils/cookies.js";

export function getCurrentSession(req, res) {
    if (!req.session?.isAuthenticated) {
        return res.status(401).json({ message: "Sessao nao autenticada." });
    }

    return res.status(200).json({ user: req.session.user });
}

export function logout(_req, res) {
    clearSessionCookie(res);
    return res.status(200).json({ message: "Sessao terminada." });
}
```

7. Explicacao do codigo.

`getCurrentSession` protege dados do utilizador: se nao ha sessao valida, devolve `401`. `logout` limpa o cookie, mesmo que a sessao ja estivesse invalida. Isto torna o logout seguro e idempotente.

8. Codigo do ficheiro `backend/src/modules/auth/auth.routes.js`.

```js
import { Router } from "express";
import { getCurrentSession, logout } from "./session.controller.js";

export const authRouter = Router();

authRouter.get("/me", getCurrentSession);
authRouter.post("/logout", logout);
```

9. Explicacao do codigo.

As rotas ficam agrupadas no modulo `auth`. Quando montadas em `/api/session`, os endpoints finais ficam `GET /api/session/me` e `POST /api/session/logout`.

10. Validacao do passo.

Ainda falta montar as rotas em `app.js`. Depois do passo seguinte, `GET /api/session/me` deve devolver `401`.

11. Caso negativo ou erro comum.

Erro comum: devolver dados de exemplo em `GET /api/session/me`. Isso faria o frontend pensar que existe utilizador autenticado.

### Passo 4 - Montar sessao na app Express e atualizar README

1. Objetivo do passo.

Integrar o middleware de sessao e as rotas no backend criado em `BK-MF1-01`.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/README.md`
    - LOCALIZACAO: substituir `app.js` pelo conteudo abaixo e acrescentar a seccao ao README
    - REVER: `BK-MF1-01`

3. Instrucoes concretas.

Substitui `backend/src/app.js` pelo ficheiro completo abaixo. Depois acrescenta a seccao de sessao ao README.

4. Codigo do ficheiro `backend/src/app.js`.

```js
import express from "express";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
    const app = express();

    app.use(express.json({ limit: "1mb" }));
    app.use(attachSession);

    app.use("/api", systemRouter);
    app.use("/api/session", authRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
```

5. Explicacao do codigo.

`attachSession` fica antes das rotas para que qualquer controller possa consultar `req.session`. A rota `/api` continua a existir. A rota `/api/session` acrescenta apenas endpoints de sessao base, sem criar login real.

6. Codigo a acrescentar ao fim de `backend/README.md`.

```md
## Sessao base

- `GET /api/session/me` devolve `401` enquanto nao existir login real.
- `POST /api/session/logout` limpa o cookie de sessao.
- Tokens em `localStorage` ou `sessionStorage` continuam fora de scope.
```

7. Explicacao do codigo.

O README deixa claro que este BK nao autentica utilizadores. Isto evita confusao na defesa e no handoff para `BK-MF2-01`.

8. Validacao do passo.

Executar dentro de `backend/`:

```bash
npm run dev
curl -i http://localhost:3000/api/session/me
curl -i -X POST http://localhost:3000/api/session/logout
```

9. Caso negativo ou erro comum.

Erro comum: montar `authRouter` antes de `attachSession`. Nesse caso, as rotas de auth nao recebem `req.session`.

### Passo 5 - Validar negativos de seguranca

1. Objetivo do passo.

Provar que a base de sessao nao aceita cookies falsos e nao expoe tokens.

2. Ficheiros envolvidos:
    - EDITAR: nenhum, se os passos anteriores estiverem corretos
    - LOCALIZACAO: executar comandos dentro de `backend/`
    - REVER: `session.controller.js`, `session.middleware.js`, `cookies.js`

3. Instrucoes concretas.

Executa os pedidos abaixo e guarda outputs.

4. Resultado esperado sem cookie.

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```

```json
{
    "message": "Sessao nao autenticada."
}
```

5. Resultado esperado com cookie falso.

```bash
curl -i http://localhost:3000/api/session/me \
  -H "Cookie: faithflix_session=falso"
```

```json
{
    "message": "Sessao nao autenticada."
}
```

6. Resultado esperado no logout.

```http
HTTP/1.1 200 OK
Set-Cookie: faithflix_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax
```

```json
{
    "message": "Sessao terminada."
}
```

7. Explicacao didatica.

Sem cookie e com cookie falso, a resposta tem de ser igual: `401`. Isto evita fuga de informacao. O logout limpa o cookie mesmo sem sessao valida, para deixar o browser num estado limpo.

8. Validacao do passo.

- Sem cookie devolve `401`.
- Cookie falso devolve `401`.
- Logout devolve `200` e header `Set-Cookie`.
- Em `NODE_ENV=production`, o cookie inclui `Secure`.
- Nenhum token aparece em respostas JSON.

9. Caso negativo ou erro comum.

Erro comum: devolver informacao como "token invalido" ou "utilizador inexistente". Essas mensagens ajudam atacantes a perceber o estado interno.

## Criterios de aceite (mensuraveis)

- `backend/src/config/session.js`, `cookies.js`, `session.middleware.js`, `session.service.js`, `session.controller.js` e `auth.routes.js` existem.
- `backend/src/app.js` monta `attachSession` antes de `/api/session`.
- `GET /api/session/me` devolve `401` sem cookie.
- `GET /api/session/me` devolve `401` com cookie falso.
- `POST /api/session/logout` devolve `200` e limpa o cookie.
- Nenhum token e guardado ou recomendado em `localStorage`/`sessionStorage`.

## Validacao final

Executar dentro de `backend/`:

```bash
npm run dev
curl -i http://localhost:3000/api/session/me
curl -i http://localhost:3000/api/session/me -H "Cookie: faithflix_session=falso"
curl -i -X POST http://localhost:3000/api/session/logout
NODE_ENV=production node src/server.js
```

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `auth/session`.
- `proof`: outputs de `GET /api/session/me` e `POST /api/session/logout`.
- `neg`: sem cookie, cookie falso, `Secure` em producao e ausencia de token no frontend storage.

## Handoff

- `BK-MF1-05` deve logar pedidos sem expor cookies.
- `BK-MF1-06` deve testar `401` sem cookie e com cookie falso.
- `BK-MF2-01` deve reutilizar `sessionConfig.cookieName`, `getSessionCookieOptions()` e `attachSession` para criar login real.
- `BK-MF4-03` pode depender desta base para candidaturas autenticadas quando os utilizadores existirem.

## Changelog

- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada de sessao base, cookies HttpOnly, rotas, app.js, payloads, negativos e handoff para MF2.
- `2026-05-27`: refinado para guia executavel de sessao segura base, sem transformar MF1 em autenticacao funcional completa.
