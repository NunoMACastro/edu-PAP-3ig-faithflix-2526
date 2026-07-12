# BK-MF1-01 - Estrutura base backend por modulos

## Header

- `doc_id`: `GUIA-BK-MF1-01`
- `bk_id`: `BK-MF1-01`
- `macro`: `MF1`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF0-06`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Este BK cria a primeira base real do backend FaithFlix. O objetivo e montar uma API Node.js com Express, organizada por modulos, para que os BKs seguintes consigam acrescentar sessao segura, health-check, catalogo, streaming, subscricoes, pool solidaria e privacidade sem refazer a estrutura.

Para alunos do 12.º ano, a ideia principal e esta: antes de criar funcionalidades grandes, precisamos de uma casa arrumada. Neste BK ainda nao ha login real, catalogo, streaming, pagamentos, recomendacoes nem base de dados. Vamos apenas criar a fundacao onde essas partes vao encaixar.

#### Importância

Este BK materializa os RF/RNF indicados no Header e entrega ao próximo BK uma base verificável. Sem esta etapa, os passos seguintes não têm um contrato técnico estável para reutilizar.

#### Scope-in

- Criar a pasta `backend/`.
- Criar uma app Express modular com `app.js` separado de `server.js`.
- Criar configuracao de ambiente, rota tecnica inicial, erro 404 e error handler.
- Preparar a base para `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06` e `BK-MF2-03`.

#### Scope-out

- Autenticacao funcional, registo, login ou passwords.
- Base de dados MongoDB ou modelos de dados.
- Catalogo, streaming, favoritos, subscricoes, pool solidaria ou pagamentos.
- Segredos reais no repositorio.

### Check de compreensao

- [ ] Sei explicar porque `app.js` e `server.js` ficam separados.
- [ ] Sei onde entram rotas, controllers, middlewares e utilitarios.
- [ ] Sei provar que a API responde 200 em `/api` e 404 em rotas inexistentes.

#### Estado antes e depois

- Estado antes: aplicam-se as dependências e os RF/RNF declarados no Header; não se assume funcionalidade além dos BKs anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados do `Scope-in`, mantendo integralmente o `Scope-out`.

#### Pré-requisitos

- `BK-MF0-06` concluido ou com handoff registado.
- Confirmar em `BACKLOG-MVP.md` que este BK continua com owner `Matheus`, apoio `Davi`, prioridade `P0`, dependencia `BK-MF0-06` e `rf_rnf` `RNF27`.
- Confirmar em `RNF.md` que o backend deve seguir arquitetura modular por dominio.
- Confirmar que ainda nao existe pasta real `backend/`. Se existir, parar e adaptar os passos sem apagar trabalho existente.

#### Glossário

- `módulo`: unidade de código agrupada por responsabilidade.
- `middleware`: função executada durante o tratamento de um pedido HTTP.
- `app/server split`: separação entre configurar Express e abrir a porta HTTP.
- `handoff`: contrato entregue ao BK seguinte.

#### Conceitos teóricos essenciais

Uma fundação modular separa configuração, transporte HTTP, regras de domínio e erros. A separação entre `app.js` e `server.js` permite testar a aplicação sem abrir uma porta fixa e evita acoplamento prematuro.

#### Arquitetura do BK

- Endpoint(s): rota técnica inicial e fallback `404` descritos nos passos.
- Modelo/schema: não aplicável neste BK; MongoDB fica fora do scope.
- Service(s): não aplicável; a fundação prepara services futuros.
- Controller/route: router técnico modular.
- Guard/middleware: JSON parser e error handler.
- Cliente API/página: não aplicável neste BK backend.
- Testes: validação técnica e negativos descritos no tutorial.
- Handoff: base backend para sessão, health e módulos de domínio.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/package.json`
- CRIAR: `backend/.env.example`
- CRIAR: `backend/src/config/env.js`
- REVER: `docs/RNF.md`, seccoes `RNF17` e `RNF27`
- CRIAR: `backend/src/utils/http-error.js`
- CRIAR: `backend/src/modules/system/system.controller.js`
- CRIAR: `backend/src/modules/system/system.routes.js`
- REVER: `BK-MF1-03`, porque o frontend vai consumir respostas e erros desta API
- CRIAR: `backend/src/middlewares/error.middleware.js`
- CRIAR: `backend/src/app.js`
- REVER: `BK-MF1-04`, `BK-MF1-05` e `BK-MF1-06`, porque todos vao reutilizar `createApp()`
- CRIAR: `backend/src/server.js`
- CRIAR: `backend/README.md`
- REVER: `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- EDITAR: nenhum ficheiro novo se os passos anteriores estiverem corretos
- REVER: `backend/src/app.js`, `backend/src/middlewares/error.middleware.js`, `backend/README.md`

#### Tutorial técnico linear

### Passo 1 - Criar o pacote backend e a configuracao de ambiente

1. Objetivo do passo.

Criar a pasta `backend/`, declarar a app Node.js como projeto independente e preparar variaveis de ambiente sem guardar segredos reais no repositorio.

2. Ficheiros envolvidos:
    - CRIAR: `backend/package.json`
    - CRIAR: `backend/.env.example`
    - CRIAR: `backend/src/config/env.js`
    - LOCALIZACAO: raiz do repositorio FaithFlix, dentro da nova pasta `backend/`
    - REVER: `docs/RNF.md`, seccoes `RNF17` e `RNF27`

3. Instrucoes concretas.

Cria a pasta `backend/` e depois cria os ficheiros abaixo. O ficheiro `.env.example` serve como modelo seguro: mostra que variaveis existem, mas nao contem passwords, tokens, chaves privadas nem dados reais.

4. Codigo completo do passo.

**`backend/package.json`**

```json
{
    "name": "faithflix-backend",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "node --watch src/server.js",
        "start": "node src/server.js",
        "test": "node --test"
    },
    "dependencies": {
        "express": "^4.19.2"
    },
    "engines": {
        "node": ">=20"
    }
}
```

**`backend/.env.example`**

```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=faithflix-api
```

**`backend/src/config/env.js`**

```js
const DEFAULT_PORT = 3000;

// Validar a porta no arranque evita que uma configuração inválida falhe mais tarde sem contexto.
function parsePort(value) {
    if (value === undefined || value === "") {
        return DEFAULT_PORT;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error("PORT deve ser um numero inteiro entre 1 e 65535.");
    }

    return parsed;
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: parsePort(process.env.PORT),
    serviceName: process.env.SERVICE_NAME ?? "faithflix-api",
};

export const isProduction = env.nodeEnv === "production";
```

5. Explicacao do codigo.

- `private: true` evita publicacao acidental no npm.
- `type: module` permite usar `import` e `export`, que e a sintaxe moderna de JavaScript.
- `dev` usa `node --watch` para reiniciar o servidor quando os ficheiros mudam.
- `start` e o comando normal para executar a API.
- `test` fica pronto para `BK-MF1-06`, onde entram smoke tests.
- A unica dependencia neste momento e `express`, porque este BK cria apenas a API base.
- `NODE_ENV`, `PORT` e `SERVICE_NAME` documentam o ambiente sem publicar segredos.
- `env.js` concentra a leitura de `process.env`; `parsePort` faz a app falhar cedo perante uma porta inválida.

6. Validacao do passo.

Executar dentro de `backend/`:

```bash
npm install
node -e "import('./src/config/env.js').then(({ env }) => console.log(env))"
```

Resultado esperado: aparece um objeto com `nodeEnv`, `port` e `serviceName`.

7. Cenario negativo/erro esperado.

Executar:

```bash
PORT=abc node src/server.js
```

Resultado esperado depois de criares o servidor nos passos seguintes: a app deve falhar com a mensagem `PORT deve ser um numero inteiro entre 1 e 65535.`. O erro comum seria aceitar uma porta invalida e depois deixar a app falhar de forma confusa.

### Passo 2 - Criar utilitario de erros e rota tecnica inicial

1. Objetivo do passo.

Criar uma primeira rota tecnica `GET /api`, com resposta JSON previsivel, e um utilitario de erro reutilizavel pelos BKs seguintes.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/utils/http-error.js`
    - CRIAR: `backend/src/modules/system/system.controller.js`
    - CRIAR: `backend/src/modules/system/system.routes.js`
    - LOCALIZACAO: `backend/src/utils/` e `backend/src/modules/system/`
    - REVER: `BK-MF1-03`, porque o frontend vai consumir respostas e erros desta API

3. Instrucoes concretas.

Cria primeiro `utils/`, depois `modules/system/`. O nome `system` e usado para endpoints tecnicos simples da API base. Mais tarde podem existir modulos como `auth`, `catalog`, `streaming`, `subscriptions` e `charities`, mas ainda nao entram neste BK.

4. Codigo completo do passo.

**`backend/src/utils/http-error.js`**

```js
export class HttpError extends Error {
    constructor(
        statusCode,
        message,
        details = undefined,
        code = "REQUEST_FAILED",
    ) {
        // Guardar o estado HTTP no erro permite ao middleware responder sem depender da mensagem.
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.details = details;
        // O quarto argumento é aditivo: chamadas antigas com dois/três argumentos continuam válidas.
        this.code =
            typeof code === "string" && code.trim()
                ? code
                : "REQUEST_FAILED";
    }
}

export function notFound(path) {
    return new HttpError(
        404,
        "Recurso nao encontrado.",
        { path },
        "NOT_FOUND",
    );
}
```

**`backend/src/modules/system/system.controller.js`**

```js
import { env } from "../../config/env.js";

export function getApiInfo(_req, res) {
    // A resposta expõe apenas metadados técnicos não sensíveis definidos pelo contrato da rota.
    return res.status(200).json({
        service: env.serviceName,
        name: "FaithFlix API",
        version: "0.1.0",
        status: "ok",
    });
}
```

**`backend/src/modules/system/system.routes.js`**

```js
import { Router } from "express";
import { getApiInfo } from "./system.controller.js";

export const systemRouter = Router();

systemRouter.get("/", getApiInfo);
```

5. Explicacao do codigo.

`HttpError` guarda estado, mensagem, detalhes e um `code` estável. O quarto
argumento não altera o significado do terceiro: `new HttpError(400, message,
details)` continua válido e usa `REQUEST_FAILED`; quem precisa de um código de
domínio usa `new HttpError(status, message, details, code)`. `notFound`
normaliza rotas inexistentes. O controller devolve apenas informação técnica da
API. `Router()` agrupa o módulo e, quando for montado em `/api`, disponibiliza
`GET /api` sem encher `app.js` de endpoints.

6. Validacao do passo.

Ainda nao ha servidor completo, por isso a validacao final deste passo acontece no Passo 3. Antes disso, confirma que os imports usam extensao `.js`, porque em ES Modules isso e obrigatorio.

7. Cenario negativo/erro esperado.

Erro comum: escrever `import { getApiInfo } from './system.controller'` sem `.js`. Em Node.js com ES Modules, isto pode partir o arranque da app.

### Passo 3 - Montar a app Express com JSON, rotas, 404 e error handler

1. Objetivo do passo.

Criar a aplicacao Express reutilizavel pelos testes, montar a rota `/api` e garantir respostas JSON tambem quando ha erro.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/middlewares/error.middleware.js`
    - CRIAR: `backend/src/app.js`
    - LOCALIZACAO: `backend/src/middlewares/` e `backend/src/`
    - REVER: `BK-MF1-04`, `BK-MF1-05` e `BK-MF1-06`, porque todos vao reutilizar `createApp()`

3. Instrucoes concretas.

Cria a pasta `middlewares/` e adiciona o error handler. Depois cria `app.js`. A regra importante e: `app.js` constroi a aplicacao, mas nao abre porta. Abrir porta fica para `server.js`.

4. Codigo completo do passo.

**`backend/src/middlewares/error.middleware.js`**

```js
import { notFound } from "../utils/http-error.js";

export function notFoundHandler(req, _res, next) {
    next(notFound(req.originalUrl));
}

export function errorHandler(error, req, res, _next) {
    const statusCode = error.statusCode ?? error.status ?? 500;
    // Estados fora do intervalo HTTP de erro são normalizados para não produzir respostas inválidas.
    const safeStatusCode =
        statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

    const isServerError = safeStatusCode >= 500;
    const response = {
        code: isServerError
            ? "INTERNAL_ERROR"
            : (error.code ?? "REQUEST_FAILED"),
        // Mensagens internas são substituídas para não revelar detalhes de uma falha 500.
        message:
            isServerError
                ? "Erro interno do servidor."
                : error.message,
        // O request logger da MF1-05 torna este campo não-null em todas as respostas.
        requestId: typeof req.id === "string" ? req.id : null,
    };

    if (!isServerError && error.details !== undefined) {
        response.details = error.details;
    }

    return res.status(safeStatusCode).json(response);
}
```

**`backend/src/app.js`**

```js
import express from "express";
import { systemRouter } from "./modules/system/system.routes.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";

export function createApp() {
    const app = express();

    app.use(express.json({ limit: "1mb" }));

    app.use("/api", systemRouter);

    // Os handlers de erro ficam no fim para receber pedidos que nenhuma rota resolveu.
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
```

5. Explicacao do codigo.

`notFoundHandler` converte uma rota sem resposta num 404 JSON e `errorHandler` esconde detalhes de erros internos. `createApp()` configura o limite do body, monta `GET /api` e coloca os handlers de erro no fim. A função não chama `listen()`, por isso é reutilizável em testes.

6. Validacao do passo.

Executar dentro de `backend/`:

```bash
node -e "import('./src/app.js').then(({ createApp }) => console.log(typeof createApp))"
```

Resultado esperado: `function`.

7. Cenario negativo/erro esperado.

Erro comum: chamar `app.listen()` dentro de `app.js`. Isso dificulta testes, porque cada teste abriria uma porta fixa. O `BK-MF1-06` precisa de importar `createApp()` sem arrancar o servidor principal.

### Passo 4 - Criar o servidor e documentar a base backend

1. Objetivo do passo.

Criar o ponto de entrada que abre a porta e deixar um README curto para qualquer colega conseguir arrancar o backend.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/server.js`
    - CRIAR: `backend/README.md`
    - LOCALIZACAO: `backend/src/` e `backend/`
    - REVER: `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`

3. Instrucoes concretas.

Cria `server.js` apenas depois de `app.js`. Depois cria o README com comandos e limites de escopo.

4. Codigo completo do passo.

**`backend/src/server.js`**

```js
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// Apenas o entrypoint abre a porta; createApp continua importável sem efeitos laterais nos testes.
app.listen(env.port, () => {
    console.log(
        JSON.stringify({
            level: "info",
            message: "FaithFlix API started",
            service: env.serviceName,
            port: env.port,
        }),
    );
});
```

**`backend/README.md`**

```md
# FaithFlix Backend

Backend Node.js/Express da app FaithFlix.

## Comandos

- `npm install`
- `npm run dev`
- `npm start`

## Rotas tecnicas nesta fase

- `GET /api` devolve informacao tecnica basica da API.

## Fora de scope nesta fase

- Sem login real.
- Sem catalogo real.
- Sem streaming.
- Sem base de dados.
- Sem pagamentos.
```

5. Explicacao do codigo.

`server.js` abre a porta apenas depois de importar a app já montada e produz um primeiro log JSON com campos estáveis. O README torna os comandos e o limite funcional explícitos, evitando que alguém invente catálogo ou login antes dos BKs correspondentes.

6. Validacao do passo.

Executar dentro de `backend/`:

```bash
npm run dev
```

Noutro terminal:

```bash
curl -i http://localhost:3000/api
```

Resultado esperado: HTTP 200 com JSON.

7. Cenario negativo/erro esperado.

Erro comum: colocar rotas funcionais de catalogo ou auth neste BK. Isso cria drift, porque esses dominios entram mais tarde.

### Passo 5 - Validar respostas, negativos e handoff tecnico

1. Objetivo do passo.

Confirmar que a base backend funciona, que erros usam JSON e que a estrutura esta pronta para os BKs seguintes.

2. Ficheiros envolvidos:
    - EDITAR: nenhum ficheiro novo se os passos anteriores estiverem corretos
    - LOCALIZACAO: executar comandos dentro de `backend/`
    - REVER: `backend/src/app.js`, `backend/src/middlewares/error.middleware.js`, `backend/README.md`

3. Instrucoes concretas.

Com o servidor ligado, executa os pedidos abaixo e guarda os outputs em evidence.

4. Respostas completas esperadas.

**`GET /api`**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
{
    "service": "faithflix-api",
    "name": "FaithFlix API",
    "version": "0.1.0",
    "status": "ok"
}
```

**`GET /api/nao-existe`**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
```

```json
{
    "code": "NOT_FOUND",
    "message": "Recurso nao encontrado.",
    "requestId": null,
    "details": {
        "path": "/api/nao-existe"
    }
}
```

5. Explicacao das respostas.

O 200 prova que Express arrancou e oferece um contrato JSON ao frontend. O 404
também em JSON evita uma página HTML inesperada e permite ao cliente API mostrar
um erro previsível. Nesta fundação, `requestId` ainda pode ser `null`; o
`BK-MF1-05` monta o request logger antes das rotas e passa a fornecer uma string
validada em todas as respostas.

6. Validacao do passo.

- `npm run dev` arranca sem erro.
- `GET /api` devolve 200.
- `GET /api/nao-existe` devolve 404 JSON.
- `PORT=abc node src/server.js` falha com erro claro.

7. Cenario negativo/erro esperado.

Erro comum: devolver `200 OK` em rotas inexistentes. Isso engana testes e pode fazer o frontend pensar que uma funcionalidade existe quando ainda nao existe.

#### Critérios de aceite

- `backend/package.json`, `.env.example`, `src/config/env.js`, `src/app.js`, `src/server.js`, `src/modules/system/*`, `src/middlewares/error.middleware.js` e `src/utils/http-error.js` existem.
- `npm install` termina sem erro dentro de `backend/`.
- `npm run dev` arranca a API na porta configurada.
- `GET /api` devolve HTTP 200 e JSON com `service`, `name`, `version` e `status`.
- `GET /api/nao-existe` devolve HTTP 404 em JSON.
- `HttpError(status, message, details)` mantém compatibilidade e
  `HttpError(status, message, details, code)` preserva o código de domínio.
- Erros seguem `{ code, message, requestId, details? }`; `5xx` usa
  `INTERNAL_ERROR` e nunca expõe `details`.
- Nenhuma funcionalidade de auth, catalogo, streaming, pagamentos, subscricoes ou pool solidaria foi criada neste BK.

#### Validação final

Executar dentro de `backend/`:

```bash
npm install
npm run dev
curl -i http://localhost:3000/api
curl -i http://localhost:3000/api/nao-existe
PORT=abc node src/server.js
```

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit que cria `backend/`.
- `proof`: output de `npm run dev` e `curl -i http://localhost:3000/api`.
- `neg`: outputs de 404, `PORT=abc` e confirmacao de ausencia de funcionalidades fora de scope.

#### Handoff

- `BK-MF1-02` pode assumir que a app backend existira em `backend/`, mas nao depende de codigo backend para criar a base frontend.
- `BK-MF1-04` deve reutilizar `createApp()`, `src/middlewares/` e `src/modules/` para montar sessao segura.
- `BK-MF1-05` deve adicionar `/health` e logging sem substituir `GET /api`.
- `BK-MF1-06` deve importar `createApp()` para smoke tests sem abrir porta fixa.

#### Changelog

- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada para o scaffold backend Express, respostas esperadas, negativos e evidence.
