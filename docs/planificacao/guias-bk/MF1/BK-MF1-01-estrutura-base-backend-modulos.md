# BK-MF1-01 - Estrutura base backend por modulos

## Header

- `doc_id`: `GUIA-BK-MF1-01`
- `bk_id`: `BK-MF1-01`
- `macro`: `MF1`
- `owner`: `Matheus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-06`
- `rf_rnf`: `RNF27`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md`
- `last_updated`: `2026-05-30`

## Bloco pedagogico (obrigatorio)

Este BK cria a primeira base real do backend FaithFlix. O objetivo e montar uma API Node.js com Express, organizada por modulos, para que os BKs seguintes consigam acrescentar sessao segura, health-check, catalogo, streaming, subscricoes, pool solidaria e privacidade sem refazer a estrutura.

Para alunos do 12.º ano, a ideia principal e esta: antes de criar funcionalidades grandes, precisamos de uma casa arrumada. Neste BK ainda nao ha login real, catalogo, streaming, pagamentos, recomendacoes nem base de dados. Vamos apenas criar a fundacao onde essas partes vao encaixar.

### O que entra

- Criar a pasta `backend/`.
- Criar uma app Express modular com `app.js` separado de `server.js`.
- Criar configuracao de ambiente, rota tecnica inicial, erro 404 e error handler.
- Preparar a base para `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06` e `BK-MF2-03`.

### O que nao entra

- Autenticacao funcional, registo, login ou passwords.
- Base de dados MongoDB ou modelos de dados.
- Catalogo, streaming, favoritos, subscricoes, pool solidaria ou pagamentos.
- Segredos reais no repositorio.

### Check de compreensao

- [ ] Sei explicar porque `app.js` e `server.js` ficam separados.
- [ ] Sei onde entram rotas, controllers, middlewares e utilitarios.
- [ ] Sei provar que a API responde 200 em `/api` e 404 em rotas inexistentes.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF0-06` concluido ou com handoff registado.
- Confirmar em `BACKLOG-MVP.md` que este BK continua com owner `Matheus`, apoio `Davi`, prioridade `P0`, dependencia `BK-MF0-06` e `rf_rnf` `RNF27`.
- Confirmar em `RNF.md` que o backend deve seguir arquitetura modular por dominio.
- Confirmar que ainda nao existe pasta real `backend/`. Se existir, parar e adaptar os passos sem apagar trabalho existente.

### Guia de execucao (passo-a-passo)

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

4. Codigo do ficheiro `backend/package.json`.

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

5. Explicacao didatica do codigo.

- `private: true` evita publicacao acidental no npm.
- `type: module` permite usar `import` e `export`, que e a sintaxe moderna de JavaScript.
- `dev` usa `node --watch` para reiniciar o servidor quando os ficheiros mudam.
- `start` e o comando normal para executar a API.
- `test` fica pronto para `BK-MF1-06`, onde entram smoke tests.
- A unica dependencia neste momento e `express`, porque este BK cria apenas a API base.

6. Codigo do ficheiro `backend/.env.example`.

```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=faithflix-api
```

7. Explicacao didatica do codigo.

`NODE_ENV` indica o ambiente. `PORT` define a porta local. `SERVICE_NAME` identifica a API nos logs e respostas tecnicas. Estes valores sao seguros para exemplo; quando existirem credenciais reais, ficam num `.env` local e nunca entram no Git.

8. Codigo do ficheiro `backend/src/config/env.js`.

```js
const DEFAULT_PORT = 3000;

function parsePort(value) {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error('PORT deve ser um numero inteiro entre 1 e 65535.');
  }

  return parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT),
  serviceName: process.env.SERVICE_NAME ?? 'faithflix-api',
};

export const isProduction = env.nodeEnv === 'production';
```

9. Explicacao didatica do codigo.

Este ficheiro concentra a leitura de variaveis de ambiente. Em vez de chamar `process.env.PORT` em muitos ficheiros, a app passa a usar `env.port`. Isto evita duplicacao e torna erros mais faceis de diagnosticar. A funcao `parsePort` valida a porta antes do servidor arrancar; assim, `PORT=abc` falha logo com uma mensagem clara.

10. Validacao do passo.

Executar dentro de `backend/`:

```bash
npm install
node -e "import('./src/config/env.js').then(({ env }) => console.log(env))"
```

Resultado esperado: aparece um objeto com `nodeEnv`, `port` e `serviceName`.

11. Caso negativo ou erro comum.

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

4. Codigo do ficheiro `backend/src/utils/http-error.js`.

```js
export class HttpError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFound(path) {
  return new HttpError(404, 'Recurso nao encontrado.', { path });
}
```

5. Explicacao didatica do codigo.

`HttpError` e uma classe propria para erros HTTP. Em Express, um erro precisa de duas informacoes importantes: o codigo HTTP e a mensagem para devolver ao cliente. Ao guardar `statusCode`, o error handler consegue responder `404`, `400` ou `500` sem adivinhar. A funcao `notFound` cria um erro padronizado para rotas inexistentes.

6. Codigo do ficheiro `backend/src/modules/system/system.controller.js`.

```js
import { env } from '../../config/env.js';

export function getApiInfo(_req, res) {
  return res.status(200).json({
    service: env.serviceName,
    name: 'FaithFlix API',
    version: '0.1.0',
    status: 'ok',
  });
}
```

7. Explicacao didatica do codigo.

Um controller recebe o pedido e decide a resposta. Aqui devolvemos apenas informacao tecnica basica. Isto nao e catalogo nem streaming; e um ponto simples para provar que a API esta viva e que o frontend consegue falar com ela em `BK-MF1-03`.

8. Codigo do ficheiro `backend/src/modules/system/system.routes.js`.

```js
import { Router } from 'express';
import { getApiInfo } from './system.controller.js';

export const systemRouter = Router();

systemRouter.get('/', getApiInfo);
```

9. Explicacao didatica do codigo.

`Router()` permite agrupar rotas de um modulo. Como este router sera montado em `/api`, a rota `systemRouter.get('/')` fica disponivel como `GET /api`. Esta separacao evita que `app.js` fique cheio de endpoints misturados.

10. Validacao do passo.

Ainda nao ha servidor completo, por isso a validacao final deste passo acontece no Passo 3. Antes disso, confirma que os imports usam extensao `.js`, porque em ES Modules isso e obrigatorio.

11. Caso negativo ou erro comum.

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

4. Codigo do ficheiro `backend/src/middlewares/error.middleware.js`.

```js
import { notFound } from '../utils/http-error.js';

export function notFoundHandler(req, _res, next) {
  next(notFound(req.originalUrl));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode ?? error.status ?? 500;
  const safeStatusCode = statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

  const response = {
    message: safeStatusCode === 500 ? 'Erro interno do servidor.' : error.message,
  };

  if (error.details !== undefined) {
    response.details = error.details;
  }

  return res.status(safeStatusCode).json(response);
}
```

5. Explicacao didatica do codigo.

`notFoundHandler` e executado quando nenhuma rota respondeu. Em vez de deixar Express devolver HTML, criamos um erro 404 em JSON. `errorHandler` e o ultimo middleware da app; ele transforma erros em respostas previsiveis. Para erros internos, a mensagem e generica, porque detalhes tecnicos podem revelar informacao sensivel.

6. Codigo do ficheiro `backend/src/app.js`.

```js
import express from 'express';
import { systemRouter } from './modules/system/system.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.use('/api', systemRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

7. Explicacao didatica do codigo.

`createApp()` devolve uma app Express pronta a usar. A linha `express.json({ limit: '1mb' })` permite receber JSON e limita o tamanho do body para reduzir abuso. Montar `systemRouter` em `/api` faz com que `GET /api` funcione. Os middlewares de erro ficam no fim, porque so devem correr depois das rotas.

8. Validacao do passo.

Executar dentro de `backend/`:

```bash
node -e "import('./src/app.js').then(({ createApp }) => console.log(typeof createApp))"
```

Resultado esperado: `function`.

9. Caso negativo ou erro comum.

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

4. Codigo do ficheiro `backend/src/server.js`.

```js
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'FaithFlix API started',
    service: env.serviceName,
    port: env.port,
  }));
});
```

5. Explicacao didatica do codigo.

`server.js` importa a app ja montada e abre a porta. O log em JSON prepara o caminho para logging estruturado em `BK-MF1-05`. Nesta fase usamos `console.log`, mas ja com campos organizados: `level`, `message`, `service` e `port`.

6. Codigo do ficheiro `backend/README.md`.

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

7. Explicacao didatica do codigo.

O README evita que cada aluno tenha de adivinhar como arrancar o backend. Tambem deixa claro o que ainda nao existe. Isto protege o projeto contra funcionalidades falsas, como inventar catalogo ou login antes dos BKs certos.

8. Validacao do passo.

Executar dentro de `backend/`:

```bash
npm run dev
```

Noutro terminal:

```bash
curl -i http://localhost:3000/api
```

Resultado esperado: HTTP 200 com JSON.

9. Caso negativo ou erro comum.

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

4. Resposta esperada para `GET /api`.

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

5. Explicacao didatica da resposta.

Esta resposta prova que a API arrancou, que Express esta a devolver JSON e que o frontend pode usar este endpoint para validar conectividade em `BK-MF1-03`.

6. Resposta esperada para `GET /api/nao-existe`.

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
```

```json
{
  "message": "Recurso nao encontrado.",
  "details": {
    "path": "/api/nao-existe"
  }
}
```

7. Explicacao didatica da resposta.

Uma API profissional nao deve devolver uma pagina HTML confusa quando o frontend espera JSON. O 404 em JSON permite ao cliente API mostrar uma mensagem clara ao utilizador.

8. Validacao do passo.

- `npm run dev` arranca sem erro.
- `GET /api` devolve 200.
- `GET /api/nao-existe` devolve 404 JSON.
- `PORT=abc node src/server.js` falha com erro claro.

9. Caso negativo ou erro comum.

Erro comum: devolver `200 OK` em rotas inexistentes. Isso engana testes e pode fazer o frontend pensar que uma funcionalidade existe quando ainda nao existe.

## Criterios de aceite (mensuraveis)

- `backend/package.json`, `.env.example`, `src/config/env.js`, `src/app.js`, `src/server.js`, `src/modules/system/*`, `src/middlewares/error.middleware.js` e `src/utils/http-error.js` existem.
- `npm install` termina sem erro dentro de `backend/`.
- `npm run dev` arranca a API na porta configurada.
- `GET /api` devolve HTTP 200 e JSON com `service`, `name`, `version` e `status`.
- `GET /api/nao-existe` devolve HTTP 404 em JSON.
- Nenhuma funcionalidade de auth, catalogo, streaming, pagamentos, subscricoes ou pool solidaria foi criada neste BK.

## Validacao final

Executar dentro de `backend/`:

```bash
npm install
npm run dev
curl -i http://localhost:3000/api
curl -i http://localhost:3000/api/nao-existe
PORT=abc node src/server.js
```

## Evidence para PR/defesa

- `pr`: referencia do PR/commit que cria `backend/`.
- `proof`: output de `npm run dev` e `curl -i http://localhost:3000/api`.
- `neg`: outputs de 404, `PORT=abc` e confirmacao de ausencia de funcionalidades fora de scope.

## Handoff

- `BK-MF1-02` pode assumir que a app backend existira em `backend/`, mas nao depende de codigo backend para criar a base frontend.
- `BK-MF1-04` deve reutilizar `createApp()`, `src/middlewares/` e `src/modules/` para montar sessao segura.
- `BK-MF1-05` deve adicionar `/health` e logging sem substituir `GET /api`.
- `BK-MF1-06` deve importar `createApp()` para smoke tests sem abrir porta fixa.

## Changelog

- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada para o scaffold backend Express, respostas esperadas, negativos e evidence.
