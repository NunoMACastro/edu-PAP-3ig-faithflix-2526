# BK-MF1-06 - Smoke tests FE/BE

## Header

- `doc_id`: `GUIA-BK-MF1-06`
- `bk_id`: `BK-MF1-06`
- `macro`: `MF1`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-03,BK-MF1-04`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`
- `last_updated`: `2026-05-30`

## Bloco pedagogico (obrigatorio)

Este BK fecha a fundacao tecnica da `MF1` com smoke tests. Smoke tests sao testes pequenos que confirmam que a app arranca e que os fluxos tecnicos mais basicos continuam vivos. Eles nao substituem testes completos, mas evitam entrar na `MF2` sobre uma base partida.

Para alunos do 12.º ano, a ideia principal e: antes de construir login, catalogo e streaming, precisamos de provar que backend, frontend, sessao base, health-check e erros principais ainda funcionam.

### O que entra

- Testes backend com `node:test`.
- Helper para arrancar Express em porta aleatoria.
- Scripts `smoke` no backend, frontend e raiz.
- Evidence de fecho da MF1.

### O que nao entra

- Testes completos de autenticacao real.
- Testes de catalogo, streaming, subscricoes ou pool solidaria.
- Playwright/Cypress E2E.
- Mocks de pagamentos, DRM ou integrações externas.

### Check de compreensao

- [ ] Sei explicar a diferenca entre smoke test e teste funcional completo.
- [ ] Sei explicar porque os testes usam porta aleatoria.
- [ ] Sei correr smoke backend, frontend e agregado.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-03` executado, com cliente API frontend e build funcional.
- `BK-MF1-04` executado, com sessao base em `/api/session`.
- `BK-MF1-05` executado antes de fechar este BK, porque os smoke tests validam `/health` por sequencia operacional da MF1.
- Confirmar que `backend/src/app.js` exporta `createApp()`.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar helper de servidor de teste

1. Objetivo do passo.

Arrancar a app Express em porta aleatoria durante testes, sem depender da porta 3000.

2. Ficheiros envolvidos:
   - CRIAR: `backend/tests/helpers/test-server.js`
   - LOCALIZACAO: `backend/tests/helpers/`
   - REVER: `backend/src/app.js`

3. Instrucoes concretas.

Cria a pasta `backend/tests/helpers/` e adiciona o ficheiro abaixo. Este helper sera usado pelos testes smoke.

4. Codigo do ficheiro `backend/tests/helpers/test-server.js`.

```js
import { createApp } from '../../src/app.js';

export async function startTestServer() {
  const app = createApp();
  const server = app.listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : null;

  if (port === null) {
    throw new Error('Nao foi possivel obter a porta do servidor de teste.');
  }

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }),
  };
}
```

5. Explicacao didatica do codigo.

`app.listen(0)` pede ao sistema operativo uma porta livre. Isto evita conflitos com o servidor de desenvolvimento. A funcao devolve `baseUrl` para os testes chamarem a API e `close()` para fechar o servidor no fim. Fechar o servidor e importante para os testes nao ficarem pendurados.

6. Validacao do passo.

Depois de criar os testes no passo seguinte, eles devem conseguir arrancar e fechar o servidor sem erro.

7. Caso negativo ou erro comum.

Erro comum: usar sempre porta 3000 nos testes. Se outro servidor estiver ligado, os testes podem falhar ou testar a app errada.

### Passo 2 - Criar smoke tests backend

1. Objetivo do passo.

Automatizar os checks principais da fundacao backend: `/health`, `/api`, 404 e sessao sem autenticacao.

2. Ficheiros envolvidos:
   - CRIAR: `backend/tests/smoke/app.smoke.test.js`
   - LOCALIZACAO: `backend/tests/smoke/`
   - REVER: `BK-MF1-01`, `BK-MF1-04`, `BK-MF1-05`

3. Instrucoes concretas.

Cria a pasta `backend/tests/smoke/` e adiciona o teste abaixo.

4. Codigo do ficheiro `backend/tests/smoke/app.smoke.test.js`.

```js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startTestServer } from '../helpers/test-server.js';

let testServer;

before(async () => {
  testServer = await startTestServer();
});

after(async () => {
  await testServer.close();
});

test('GET /health devolve estado operacional basico', async () => {
  const response = await fetch(`${testServer.baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(response.headers.get('x-request-id'));
  assert.equal(body.status, 'ok');
  assert.equal(body.dependencies.api, 'ok');
  assert.equal(body.dependencies.database, 'not_configured');
});

test('GET /api devolve informacao da API FaithFlix', async () => {
  const response = await fetch(`${testServer.baseUrl}/api`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.name, 'FaithFlix API');
  assert.equal(body.status, 'ok');
});

test('rota inexistente devolve 404 em JSON', async () => {
  const response = await fetch(`${testServer.baseUrl}/api/nao-existe`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.message, 'Recurso nao encontrado.');
  assert.equal(body.details.path, '/api/nao-existe');
});

test('sessao sem cookie devolve 401', async () => {
  const response = await fetch(`${testServer.baseUrl}/api/session/me`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, 'Sessao nao autenticada.');
});

test('sessao com cookie falso continua a devolver 401', async () => {
  const response = await fetch(`${testServer.baseUrl}/api/session/me`, {
    headers: {
      Cookie: 'faithflix_session=falso',
    },
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.message, 'Sessao nao autenticada.');
});
```

5. Explicacao didatica do codigo.

`before` arranca o servidor uma vez. `after` fecha o servidor no fim. Cada `test` valida um contrato importante. Os testes de sessao garantem que ausencia de cookie e cookie falso nao autenticam ninguem. O teste de `/health` confirma que ainda nao estamos a fingir base de dados configurada.

6. Validacao do passo.

Depois de adicionar scripts no passo seguinte, `npm --prefix backend run smoke` deve passar.

7. Caso negativo ou erro comum.

Erro comum: testar apenas o status HTTP e ignorar o corpo JSON. O corpo tambem faz parte do contrato com o frontend.

### Passo 3 - Adicionar scripts smoke ao backend e frontend

1. Objetivo do passo.

Criar comandos simples para correr smoke backend e validar build frontend.

2. Ficheiros envolvidos:
   - EDITAR: `backend/package.json`
   - EDITAR: `frontend/package.json`
   - LOCALIZACAO: substituir os ficheiros pelo conteudo abaixo, preservando scripts anteriores
   - REVER: `BK-MF1-01`, `BK-MF1-02`

3. Instrucoes concretas.

Atualiza os `package.json` para incluir `smoke`.

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
    "test": "node --test",
    "smoke": "node --test tests/smoke/*.test.js"
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

`smoke` corre apenas os testes de fumo. `test` pode continuar a correr todos os testes quando a suite crescer. Esta separacao ajuda em gates rapidos.

6. Codigo do ficheiro `frontend/package.json`.

```json
{
  "name": "faithflix-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "smoke": "npm run build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {}
}
```

7. Explicacao didatica do codigo.

O smoke frontend nesta fase e o build. Como ainda nao ha E2E, o build garante que imports, JSX, rotas e CSS compilam.

8. Validacao do passo.

Executar:

```bash
npm --prefix backend run smoke
npm --prefix frontend run smoke
```

9. Caso negativo ou erro comum.

Erro comum: fazer smoke frontend depender de backend ligado. Nesta fase, o build deve validar estrutura, nao disponibilidade da API.

### Passo 4 - Criar comando agregado e evidence MF1

1. Objetivo do passo.

Permitir correr smoke da MF1 a partir da raiz e preparar evidence para PR/defesa.

2. Ficheiros envolvidos:
   - CRIAR: `package.json`
   - CRIAR: `docs/evidence/MF1/README.md`
   - LOCALIZACAO: raiz do repositorio e `docs/evidence/MF1/`
   - REVER: DoD/evidence definido em `MF0`

3. Instrucoes concretas.

Se ainda nao existir `package.json` na raiz, cria o ficheiro abaixo. Depois cria a pasta `docs/evidence/MF1/` e o README de evidence.

4. Codigo do ficheiro `package.json` na raiz.

```json
{
  "name": "faithflix",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "smoke": "npm --prefix backend run smoke && npm --prefix frontend run smoke"
  }
}
```

5. Explicacao didatica do codigo.

O comando da raiz nao substitui os comandos de cada app. Ele apenas agrega backend e frontend para facilitar gate. `private: true` evita publicacao acidental.

6. Codigo do ficheiro `docs/evidence/MF1/README.md`.

```md
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

- Backend: [colar resumo do output]
- Frontend: [colar resumo do output]
- Agregado: [colar resumo do output]

## Negativos

- Rota inexistente devolve 404 JSON.
- Sessao sem cookie devolve 401.
- Cookie falso devolve 401.

## Handoff para MF2

MF2 so deve iniciar se estes smoke tests passarem ou se blockers estiverem registados com owner e prazo.
```

7. Explicacao didatica do codigo.

Evidence e prova objetiva. Este ficheiro nao substitui testes; organiza os resultados para PR e defesa PAP. Os campos entre parenteses retos devem ser preenchidos com outputs reais da execucao.

8. Validacao do passo.

Executar na raiz:

```bash
npm run smoke
```

9. Caso negativo ou erro comum.

Erro comum: criar evidence sem executar comandos. Evidence deve refletir resultados observados, nao intencoes.

### Passo 5 - Executar smoke completo e fechar a MF1

1. Objetivo do passo.

Provar que a fundacao tecnica esta pronta para a `MF2`.

2. Ficheiros envolvidos:
   - EDITAR: `docs/evidence/MF1/README.md` com resultados reais
   - LOCALIZACAO: raiz, `backend/`, `frontend/`
   - REVER: todos os BKs `MF1-01..06`

3. Instrucoes concretas.

Executa os comandos e regista resultados. Se algum falhar, nao fechar este BK como `DONE`; registar blocker.

4. Comandos esperados.

```bash
npm --prefix backend run smoke
npm --prefix frontend run smoke
npm run smoke
```

5. Explicacao didatica.

O primeiro comando testa backend. O segundo valida build frontend. O terceiro prova que a equipa consegue correr o gate pela raiz. Isto cria uma rotina simples para evitar regressao.

6. Validacao do passo.

Resultado esperado:

```text
Backend smoke: PASS
Frontend smoke: PASS
Agregado MF1: PASS
```

7. Caso negativo ou erro comum.

Erro comum: iniciar `BK-MF2-01` com smoke vermelho. Isso faz a equipa construir login em cima de uma base instavel.

## Criterios de aceite (mensuraveis)

- `backend/tests/helpers/test-server.js` e `backend/tests/smoke/app.smoke.test.js` existem.
- `npm --prefix backend run smoke` passa.
- `npm --prefix frontend run smoke` passa.
- `npm run smoke` passa se o `package.json` de raiz for criado.
- Testes cobrem `/health`, `/api`, 404, sessao sem cookie e cookie falso.
- Evidence MF1 inclui comandos, resultados observados e negativos.

## Validacao final

Executar na raiz:

```bash
npm --prefix backend run smoke
npm --prefix frontend run smoke
npm run smoke
```

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com testes smoke e scripts.
- `proof`: output de `npm --prefix backend run smoke`, `npm --prefix frontend run smoke` e `npm run smoke`.
- `neg`: resumo dos testes 404/401 e confirmacao de que servidor de teste fecha no fim.

## Handoff

- `BK-MF2-01` deve iniciar apenas com smoke MF1 verde ou blockers registados.
- `BK-MF2-01` deve acrescentar testes de registo, login, logout e recuperacao de password sem remover os smoke desta MF.
- `BK-MF2-03` deve reutilizar a base modular backend para catalogo.

## Changelog

- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada com smoke tests, scripts backend/frontend/raiz, evidence MF1, negativos e bloqueio de sequencia para `/health`.
- `2026-05-27`: refinado para guia executavel de smoke tests FE/BE, com handoff explicito para a primeira feature funcional da MF2.
