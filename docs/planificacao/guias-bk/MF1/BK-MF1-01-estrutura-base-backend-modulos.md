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
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md`
- `last_updated`: `2026-05-27`

## Bloco pedagogico (obrigatorio)

Este BK ensina a criar a primeira fundacao tecnica real do backend FaithFlix. Ao contrario da `MF0`, que foi governance/kickoff, aqui a equipa ja cria pastas, ficheiros, scripts e uma aplicacao Express minima, mas ainda sem implementar catalogo, streaming, pagamentos, roles ou base de dados.

O foco pedagogico e perceber porque um backend deve ser modular: cada dominio da aplicacao deve ter responsabilidades separadas, para que os BKs seguintes possam adicionar autenticação, catalogo, health-checks e testes sem reescrever a base.

## Bloco operacional (obrigatorio)

O trabalho operacional e criar a pasta `backend/`, configurar Node.js com ES Modules, montar Express, definir uma organizacao por modulos e preparar middlewares basicos de parsing, 404 e erro. A entrega deve ser pequena, executavel e verificavel por outro colega.

#### BK-MF1-01 - Estrutura base backend por modulos

##### O que vamos fazer neste BK

Neste BK vamos criar o backend inicial da FaithFlix. A aplicacao fica preparada para receber rotas por dominio, começando com um modulo tecnico `system` e pontos de extensao para `auth` e restantes modulos futuros. Esta base responde a um endpoint tecnico simples em `/api` apenas para provar que o servidor arranca.

Vamos seguir a decisao documental vinda da `MF0`: o FaithFlix usa uma arquitetura backend modular, alinhada com `RNF27`. A stack inferida dos documentos e Node.js LTS com Express e JavaScript moderno em ES Modules. Como o `APP_STATE` e `sem_codigo`, este BK cria a estrutura inicial de raiz, sem tentar reaproveitar app inexistente.

O BK nao constrói funcionalidades de produto. Nao ha registo, login, catalogo, streaming, subscricoes, pool solidaria, administracao ou base de dados. Esses temas aparecem em macros seguintes. Aqui fica apenas a fundacao tecnica para os receber com menos risco.

##### Porque e que isto e importante

- Dá à equipa um ponto de arranque real para os BKs de backend.
- Evita que cada funcionalidade futura crie a sua propria estrutura isolada.
- Prepara `BK-MF1-04` para sessao segura e `BK-MF1-05` para health/logging.
- Ensina separacao de responsabilidades: app, server, rotas, modulos, middlewares e configuracao.
- Reduz o risco de misturar regras de negocio com detalhes de infraestrutura.

##### O que entra (scope)

- Criar `backend/` como aplicacao Node.js isolada.
- Configurar `package.json` com `type: module` e scripts minimos.
- Criar `src/server.js`, `src/app.js`, `src/config/env.js`.
- Criar estrutura modular em `src/modules/`.
- Criar middleware de erro e resposta 404 em JSON.
- Criar endpoint tecnico `GET /api` para smoke inicial.
- Documentar no `backend/README.md` como arrancar e validar.

##### O que nao entra (scope-out)

- Nao entra autenticação real, registo, login, logout funcional ou recuperacao de password.
- Nao entra MongoDB Atlas, modelos de dados, migrations ou seeds.
- Nao entra catalogo, streaming, pesquisa, planos, pagamentos ou pool solidaria.
- Nao entra deploy, CI/CD, observabilidade completa ou testes automatizados finais.
- Nao entra instalar dependencias pesadas sem justificacao.

##### Como saber que isto ficou bem

- `npm run dev` arranca o backend sem erro.
- `GET /api` responde JSON com nome do servico e estado tecnico.
- Uma rota inexistente responde 404 em JSON, nao HTML.
- Erros sao devolvidos com formato previsivel.
- Os ficheiros estao separados por responsabilidade e prontos para os BKs seguintes.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF1` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Matheus` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Davi` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF0-06` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: MF0 encerrada, handoff de `BK-MF0-06` confirmado e app ainda sem codigo funcional (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL > MF1`, `MF-VIEWS > MF1`, `PLANO-SPRINTS > Sprint 1` (CANONICO)
- Flow ID: `MF1-foundation-backend-01` (DERIVADO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Fonte de verdade: `docs/RNF.md`
- Descricao: criar a estrutura base do backend modular, alinhada com `RNF27`, para suportar os BKs tecnicos e funcionais seguintes (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Criar a aplicacao backend em `backend/`.
- Definir scripts de desenvolvimento, arranque e teste futuro.
- Criar a separacao `server -> app -> routes -> middleware`.
- Criar um modulo tecnico `system` com rota base de verificacao.
- Preparar o sitio onde `auth`, `catalog`, `subscriptions` e outros modulos vao entrar nas fases seguintes.
- Criar respostas JSON consistentes para sucesso, 404 e erro.
- Registar comandos e ficheiros para evidence.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: existem documentos de planificacao e mockup, mas nao existe aplicacao backend real.
- Estado esperado depois do BK: existe um backend Express minimo, modular e executavel localmente.
- Ficheiros a criar: `backend/package.json`, `backend/README.md`, `backend/.env.example`, `backend/src/server.js`, `backend/src/app.js`, `backend/src/config/env.js`, `backend/src/modules/system/system.routes.js`, `backend/src/modules/system/system.controller.js`, `backend/src/middlewares/error.middleware.js`, `backend/src/utils/http-error.js`.
- Ficheiros a editar: nenhum ficheiro de planificacao canónica, salvo evidence do BK.
- Ficheiros a rever: `docs/RNF.md`, `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Dependencias de BK anteriores e uso: reutiliza o handoff de `BK-MF0-06`, que confirmou que a fundacao tecnica comeca em `MF1` e que `RNF27` guia o backend modular.
- Impacto na arquitetura da app: cria o contrato inicial para backend modular por dominios, sem regras de negocio ainda.
- Impacto frontend: nenhum direto; `BK-MF1-02` criara a base frontend em paralelo.
- Impacto backend: cria a primeira app Express e a convencao de estrutura.
- Impacto dados: nenhum armazenamento persistente neste BK.
- Impacto seguranca: prepara tratamento de erro sem expor stack traces em producao.
- Impacto testes: prepara scripts e estrutura para smoke posterior em `BK-MF1-06`.
- Impacto UI: nenhum.
- Handoff para o proximo BK: `BK-MF1-02` pode assumir que o backend existira em `backend/`; `BK-MF1-04` deve reutilizar `src/app.js`, `src/middlewares/` e a estrutura modular.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/RNF.md`: `RNF27` e seccao de stack backend.
- `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`: handoff para MF1.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linha `BK-MF1-01`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: mapeamento `RNF27 -> BK-MF1-01`.
- `README.md`: arquitetura geral e dominio FaithFlix.
- Mockup: nao e necessario para este BK, porque nao ha UI.
- Codigo: confirmar que nao existe backend real antes de criar `backend/`.

#### Glossario (rapido) (DERIVADO):

- Backend: parte da app que corre no servidor e responde a pedidos HTTP.
- Node.js: runtime que permite executar JavaScript no servidor.
- Express: framework Node.js para criar rotas HTTP, middlewares e APIs.
- ES Modules: formato moderno de imports/exports em JavaScript.
- App Express: configuracao da aplicacao, rotas e middlewares.
- Server: ficheiro que abre a porta e fica a escutar pedidos.
- Middleware: funcao que passa entre pedido e resposta para validar, transformar ou tratar erros.
- Router: conjunto de rotas agrupadas por tema.
- Modulo: pasta com rotas, controllers e services de uma area.
- Controller: camada que recebe o pedido e prepara a resposta.
- Service: camada onde entram regras e operacoes de negocio quando existirem.
- Smoke test: verificacao rapida para confirmar que a app arranca e responde.

#### Conceitos teoricos essenciais (DERIVADO):

**Express.** Express e uma biblioteca que simplifica a criacao de APIs HTTP em Node.js. Em vez de escrever manualmente todo o tratamento de pedidos, definimos rotas como `GET /api` e middlewares como `express.json()`.

**Separar `server.js` de `app.js`.** `server.js` deve abrir a porta. `app.js` deve construir a aplicacao. Esta separacao permite testar a app sem ter sempre uma porta fixa aberta, o que sera importante em `BK-MF1-06`.

**Router, controller e service.** O router decide que controller recebe o pedido. O controller valida o pedido e devolve resposta. O service guarda regras reutilizaveis. Neste BK o service ainda quase nao aparece, porque nao existem regras de negocio reais.

**Middleware.** O fluxo normal e `request -> middleware -> route/controller -> response`. Um middleware de erro recebe excecoes e transforma-as numa resposta JSON clara. Isto evita respostas HTML inesperadas e ajuda o frontend a tratar erros.

**Erros comuns.** Misturar tudo em `server.js`, criar rotas de catalogo antes da fase correta, guardar segredos no codigo e devolver `error.stack` em producao sao erros que criam divida tecnica e riscos de seguranca.

**Sem base de dados ainda.** MongoDB Atlas esta indicado nos documentos como base de dados principal, mas este BK nao liga a base de dados. A persistencia so deve aparecer quando o BK funcional pedir entidades, modelos e validacoes.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar ponto de partida**
   - Descricao detalhada do objetivo: verificar que a MF0 esta encerrada e que nao existe backend real a preservar.
   - Justificacao: como `APP_STATE` e `sem_codigo`, a equipa pode criar a base; se encontrar codigo, deve le-lo antes de mexer.
   - Como fazer (0.1): executar `ls` na raiz e confirmar se existe `backend/`.
   - Como fazer (0.2): rever o handoff de `BK-MF0-06` e a linha `BK-MF1-01` no backlog.
   - Ficheiro a rever: `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
   - Ficheiro alvo: nenhum ainda.
   - Snippet de referencia: `dependencias: BK-MF0-06`
   - O que verificar: nao ha ficheiros de backend existentes que possam ser sobrescritos.

1. **Objetivo (~15 min): Criar pacote Node.js do backend**
   - Descricao detalhada do objetivo: criar `backend/package.json` com Node.js, ES Modules e scripts minimos.
   - Justificacao: o backend deve ser uma unidade executavel e validavel sem depender do frontend.
   - Como fazer (1.1): criar a pasta `backend/` e iniciar `npm init -y`.
   - Como fazer (1.2): ajustar `package.json` para `type: module` e scripts `dev`, `start` e `test`.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `backend/package.json`
   - Snippet de referencia:
     ```json
     {
       "type": "module",
       "scripts": {
         "dev": "node --watch src/server.js",
         "start": "node src/server.js",
         "test": "node --test"
       }
     }
     ```
   - O que verificar: `npm run dev` ainda pode falhar ate existirem os ficheiros `src/`, mas os scripts devem estar definidos.

2. **Objetivo (~15 min): Instalar dependencia minima**
   - Descricao detalhada do objetivo: instalar apenas Express nesta fase.
   - Justificacao: Express e suficiente para rotas, middlewares e JSON. Evita-se adicionar dependencias que ainda nao sao necessarias.
   - Como fazer (2.1): dentro de `backend/`, executar `npm install express`.
   - Como fazer (2.2): confirmar que `package-lock.json` foi criado e que `express` aparece em `dependencies`.
   - Ficheiro a rever: `backend/package.json`
   - Ficheiro alvo: `backend/package.json`
   - Snippet de referencia: `"express": "..."`
   - O que verificar: nao foram instaladas dependencias de BD, auth, pagamentos ou UI.

3. **Objetivo (~20 min): Criar configuracao de ambiente**
   - Descricao detalhada do objetivo: centralizar porta, ambiente e nome do servico.
   - Justificacao: configuracao espalhada torna deploy e testes mais dificeis.
   - Como fazer (3.1): criar `backend/.env.example` com valores nao secretos.
   - Como fazer (3.2): criar `backend/src/config/env.js` lendo `process.env` e aplicando defaults seguros.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `backend/src/config/env.js`
   - Snippet de referencia:
     ```js
     export const env = {
       nodeEnv: process.env.NODE_ENV ?? 'development',
       port: Number(process.env.PORT ?? 3000),
       serviceName: process.env.SERVICE_NAME ?? 'faithflix-api',
     };
     ```
   - O que verificar: nenhum segredo fica hardcoded; `.env.example` nao contem passwords nem tokens reais.

4. **Objetivo (~25 min): Criar app Express separada do servidor**
   - Descricao detalhada do objetivo: criar `createApp()` em `src/app.js` e usar `src/server.js` apenas para escutar a porta.
   - Justificacao: esta separacao facilita testes e evita acoplamento entre configuracao e arranque.
   - Como fazer (4.1): criar `src/app.js` com `express.json()` e montagem de rotas.
   - Como fazer (4.2): criar `src/server.js` que importa `createApp()` e `env`.
   - Ficheiro a rever: nenhum codigo anterior.
   - Ficheiro alvo: `backend/src/app.js`
   - Snippet de referencia:
     ```js
     import express from 'express';
     import systemRouter from './modules/system/system.routes.js';

     export function createApp() {
       const app = express();
       app.use(express.json({ limit: '1mb' }));
       app.use('/api', systemRouter);
       return app;
     }
     ```
   - O que verificar: `server.js` nao contem controllers, regras de negocio ou rotas inline.

5. **Objetivo (~25 min): Criar primeiro modulo tecnico `system`**
   - Descricao detalhada do objetivo: criar uma rota tecnica simples para provar que o backend esta vivo.
   - Justificacao: um endpoint minimo permite smoke antes de existir catalogo ou login.
   - Como fazer (5.1): criar `backend/src/modules/system/system.routes.js`.
   - Como fazer (5.2): criar `backend/src/modules/system/system.controller.js` com resposta JSON.
   - Ficheiro a rever: `docs/planificacao/backlogs/MF-VIEWS.md`
   - Ficheiro alvo: `backend/src/modules/system/system.routes.js`
   - Snippet de referencia:
     ```js
     import { Router } from 'express';
     import { getApiInfo } from './system.controller.js';

     const router = Router();
     router.get('/', getApiInfo);
     export default router;
     ```
   - O que verificar: `GET /api` responde algo como `{ "service": "faithflix-api", "status": "ok" }`.

6. **Objetivo (~25 min): Adicionar 404 e middleware de erro**
   - Descricao detalhada do objetivo: garantir que erros e rotas inexistentes devolvem JSON previsivel.
   - Justificacao: o frontend de `BK-MF1-03` precisa de um formato de erro coerente.
   - Como fazer (6.1): criar `backend/src/utils/http-error.js` com helper `createHttpError`.
   - Como fazer (6.2): criar `backend/src/middlewares/error.middleware.js` com `notFound` e `errorHandler`.
   - Ficheiro a rever: `docs/RNF.md` (`RNF05`, `RNF30` como contexto futuro)
   - Ficheiro alvo: `backend/src/middlewares/error.middleware.js`
   - Snippet de referencia:
     ```js
     export function notFound(req, _res, next) {
       next(createHttpError(404, `Rota nao encontrada: ${req.method} ${req.originalUrl}`));
     }
     ```
   - O que verificar: rota inexistente devolve status 404 e JSON, sem stack trace em producao.

7. **Objetivo (~20 min): Documentar a estrutura criada**
   - Descricao detalhada do objetivo: explicar no `backend/README.md` como correr e onde colocar modulos futuros.
   - Justificacao: a equipa vai alternar owners; documentacao curta evita dependencia verbal.
   - Como fazer (7.1): listar comandos `npm run dev`, `npm start`, `npm test`.
   - Como fazer (7.2): explicar que `auth` entra em `BK-MF1-04` e catalogo em `MF2`.
   - Ficheiro a rever: este guia.
   - Ficheiro alvo: `backend/README.md`
   - Snippet de referencia:
     ```md
     ## Estrutura
     - `src/app.js`: configura Express.
     - `src/server.js`: abre a porta.
     - `src/modules/`: modulos por dominio.
     ```
   - O que verificar: README nao promete funcionalidades que ainda nao existem.

8. **Objetivo (~20 min): Validar smoke, negativos e handoff**
   - Descricao detalhada do objetivo: executar a app, testar casos validos e invalidos, e registar evidence.
   - Justificacao: BK P0 so deve fechar com prova objetiva e negativos.
   - Como fazer (8.1): correr `npm run dev` em `backend/` e testar `GET /api`.
   - Como fazer (8.2): testar rota inexistente e JSON invalido, depois registar `pr/proof/neg`.
   - Ficheiro a rever: `backend/README.md`
   - Ficheiro alvo: evidence do PR/defesa
   - Snippet de referencia:
     ```bash
     curl -i http://localhost:3000/api
     curl -i http://localhost:3000/api/nao-existe
     ```
   - O que verificar: servidor arranca, `GET /api` responde 200, 404 devolve JSON e o handoff para `BK-MF1-04` fica claro.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `backend/package.json` existe com `type: module`.
- [ ] `npm run dev` arranca sem erro.
- [ ] `GET /api` responde 200 com JSON.
- [ ] `backend/README.md` explica comandos e estrutura.

**Negativos**
- [ ] Passo: 8; input/acao: `GET /api/nao-existe`; resultado esperado: 404 JSON; risco que cobre: frontend receber HTML inesperado.
- [ ] Passo: 8; input/acao: enviar JSON malformado para rota com body; resultado esperado: erro JSON controlado; risco que cobre: crash por input invalido.
- [ ] Passo: 3; input/acao: definir `PORT=abc`; resultado esperado: app falha de forma clara ou usa validacao explicita; risco que cobre: configuracao invalida silenciosa.

**Tecnico**
- [ ] `server.js` apenas abre a porta.
- [ ] `app.js` monta middlewares e rotas.
- [ ] Modulos estao dentro de `src/modules/`.
- [ ] Nao ha logica de catalogo, streaming ou pagamento neste BK.

**Regressao das fases anteriores**
- [ ] A decisao de `MF0` como governance esta preservada.
- [ ] Owner, apoio, prioridade, dependencias e `rf_rnf` nao foram alterados.
- [ ] O DoD/evidence definido em `MF0` e respeitado.

**UI/mockup**
- [ ] Nao aplicavel diretamente; o mockup foi considerado irrelevante para backend base.

**Seguranca**
- [ ] Nao existem segredos no codigo.
- [ ] Respostas de erro nao expõem stack trace em producao.
- [ ] Limite de JSON body esta definido.

#### Criterios de aceite:

**Outputs:**
- `backend/` criado com package, app, server, config, middleware e modulo tecnico.
- `GET /api` responde 200 com JSON.
- `backend/README.md` documenta a estrutura.

**Verificacoes:**
- `npm run dev` arranca.
- Rota inexistente responde 404 JSON.
- JSON invalido nao derruba o processo.

**Qualidade:**
- Estrutura separa app, server, modulos, middlewares e config.
- Nao existe codigo de funcionalidade futura fora de scope.
- Dependencias novas limitadas ao necessario para este BK.

**Continuidade:**
- `BK-MF1-04` consegue adicionar `auth` sem alterar a base.
- `BK-MF1-05` consegue adicionar `/health` e logging sem reestruturar Express.
- `BK-MF1-06` consegue importar `createApp()` para smoke tests.

**Evidencia:**
- PR/commit com ficheiros do backend.
- Output de `npm run dev`.
- Output de `curl` para caso valido e negativos.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `backend/package.json`, `backend/src/app.js`, `backend/src/server.js`, `backend/src/modules/system/`, `backend/src/middlewares/`, `backend/README.md`
- `commands`: `npm install`, `npm run dev`, `curl -i http://localhost:3000/api`
- `screenshots`: `Nao aplicavel; usar output de terminal`
- `notes`: `Confirmar se a equipa validou a stack Node.js + Express com o orientador`

#### TODOs

- TODO: confirmar com o orientador se a stack final fica `Node.js + Express + React/Vite` ou se o frontend deve seguir literalmente `Next.js` como sugerido em `RNF.md`.
- TODO: decidir mais tarde a estrategia de base de dados MongoDB Atlas quando o BK de dados/modelos pedir persistencia.
- TODO (BLOCKER): se ja existir backend real fora deste caminho, parar e adaptar o guia sem sobrescrever trabalho existente.
- FOLLOW-UP: `BK-MF1-04` deve reutilizar a estrutura de middlewares para sessao segura.
- FOLLOW-UP: `BK-MF1-05` deve adicionar `/health` sem substituir `GET /api`.
- Assuncao tecnica: usar JavaScript ES Modules para reduzir complexidade face a TypeScript nesta PAP, salvo decisao contraria do orientador.
- Decisoes dependentes de mockup: nenhuma neste BK.
- Decisoes dependentes de app/codigo ainda inexistente: caminhos finais podem ajustar se a equipa ja tiver criado estrutura antes de executar.

## Snippet tecnico aplicavel

```js
// backend/src/server.js
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

## Proximo BK recomendado

`BK-MF1-02` em paralelo na Sprint 1. Para backend, o proximo consumidor direto desta base e `BK-MF1-04`.

## Changelog

- `2026-05-27`: refinado para guia executavel de fundacao tecnica backend, mantendo metadados canonicos e preservando MF0 como governance/kickoff.
