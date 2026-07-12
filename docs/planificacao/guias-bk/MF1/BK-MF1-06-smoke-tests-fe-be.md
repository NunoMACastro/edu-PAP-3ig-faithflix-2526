# BK-MF1-06 - Smoke tests FE/BE

## Header

- `doc_id`: `GUIA-BK-MF1-06`
- `bk_id`: `BK-MF1-06`
- `macro`: `MF1`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF1-03,BK-MF1-04,BK-MF1-05`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Fechar a fundação técnica da MF1 com smoke tests backend e frontend. O backend é importado por `createApp()`, recebe um DB double por `setDbForTests()` e abre apenas uma porta efémera; nunca executa `src/server.js` nem liga à DB normal.

Os testes provam as diferenças entre live/ready, os contratos de sessão anónima e autenticada, rotação CSRF, logout, 404 JSON e o build frontend. São um gate rápido, não substituem integração com replica set ou E2E.

#### Importância

Sem isolamento, um “smoke” pode testar o servidor errado ou escrever dados reais. O double torna as dependências determinísticas e comprova que liveness continua verde quando a DB falha, readiness muda para 503 e sessão/CSRF não dependem de dados partilhados.

#### Scope-in

- DB double em memória para `command`, `sessions` e `users`.
- Servidor Express de teste em porta efémera.
- Testes `node:test` de live, ready, API, 404, sessão, CSRF e logout.
- Scripts `smoke` backend/frontend/raiz e evidence classificada.

#### Scope-out

- DB real, seed, migração, `src/server.js` ou porta 3000 durante testes.
- Testes completos de registo, password, catálogo, streaming ou pagamentos.
- Playwright/Cypress e alegações de streaming, carga ou browser real.
- Substituição de testes de integração com replica set.

#### Estado antes e depois

- Estado antes: os contratos existem nos BKs anteriores, mas ainda não têm um gate isolado acumulado.
- Estado depois: a equipa consegue validar a fundação com doubles e build, sem tocar em dados configurados ou depender de processos já abertos.

#### Pré-requisitos

- `BK-MF1-03` concluído, com build frontend e cliente `credentials: "include"`.
- `BK-MF1-04` concluído, incluindo `setDbForTests`, sessão e CSRF.
- `BK-MF1-05` concluído, incluindo live/ready, request ID e composição aditiva.
- Node.js 20 ou superior; nenhuma instância MongoDB é necessária para este smoke.

#### Glossário

- `DB double`: objeto controlado que implementa apenas o contrato usado pelo teste.
- `porta efémera`: porta livre escolhida pelo sistema operativo.
- `smoke test`: gate curto dos contratos técnicos essenciais.
- `isolamento`: ausência de dependência sobre dados, processos ou Internet partilhados.

#### Conceitos teóricos essenciais

Um double não prova MongoDB real nem transações; prova a composição HTTP de forma determinística. A integração real deve ser testada noutro gate com replica set isolado. `createApp()` permite abrir um servidor efémero, enquanto `src/server.js` é deliberadamente excluído porque cria índices, liga a MongoDB e instala sinais do processo principal.

#### Arquitetura do BK

- Endpoint(s): `/health/live`, `/health/ready`, `/health`, `/api`, `/api/session/*` e 404.
- Modelo/schema: estado mínimo de `sessions`/`users` apenas no double.
- Service(s): os services reais recebem o double por `getDb()`.
- Guard/middleware: sessão, auth e CSRF reais; apenas a persistência é simulada.
- Helper: servidor efémero que instala e remove o double.
- Testes: `node:test` e `fetch` loopback.
- Handoff: gate MF1 antes de autenticação funcional em MF2.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/tests/helpers/db-double.js`
- CRIAR: `backend/tests/helpers/test-server.js`
- CRIAR: `backend/tests/smoke/app.smoke.test.js`
- EDITAR: `backend/package.json`
- EDITAR: `frontend/package.json`
- EDITAR/CRIAR: `package.json` na raiz dos alunos, preservando scripts existentes.
- CRIAR, apenas depois da execução: `docs/evidence/student/MF1/README.md`.
- PRESERVAR: `docs/evidence/MF1/README.md`, snapshot histórico da lane `REFERENCE`.

#### Tutorial técnico linear

### Passo 1 - Criar o DB double da fundação

1. Objetivo funcional do passo.

Simular apenas ping, sessão e utilizador necessários ao smoke, mantendo estado observável para provar logout.

2. Ficheiros envolvidos.

- CRIAR: `backend/tests/helpers/db-double.js`.
- LOCALIZAÇÃO: `backend/tests/helpers/`.

3. Instruções do que fazer.

Cria o helper abaixo. Os tokens constantes só existem em memória no processo de teste e nunca entram na app, DB ou evidence. O double deve rejeitar qualquer coleção não prevista para detetar dependências acidentais.

4. Código completo, correto e integrado com a app final.

**`backend/tests/helpers/db-double.js`**

```js
import { createHash } from "node:crypto";

// O valor constante é exclusivo deste processo de teste e nunca representa uma credencial real.
export const TEST_SESSION_TOKEN = "test-session-token-only-in-memory";

function hash(value) {
    return createHash("sha256").update(value, "utf8").digest("hex");
}

function fakeId(value) {
    return { toString: () => value };
}

export function createDbDouble({ healthy = true, authenticated = false } = {}) {
    const userId = fakeId("user-test-1");
    const state = {
        session: authenticated
            ? {
                  _id: fakeId("session-test-1"),
                  tokenHash: hash(TEST_SESSION_TOKEN),
                  userId,
                  expiresAt: new Date(Date.now() + 60_000),
                  csrfTokenHash: null,
                  csrfTokenHashes: [],
                  csrfRotatedAt: null,
              }
            : null,
    };

    const sessions = {
        async findOne(filter) {
            if (!state.session || filter.tokenHash !== state.session.tokenHash) {
                return null;
            }
            return state.session.expiresAt > new Date() ? state.session : null;
        },
        async updateOne(filter, update) {
            const current = state.session;
            const matches =
                current &&
                filter._id === current._id &&
                filter.csrfTokenHash === current.csrfTokenHash;

            if (!matches) return { modifiedCount: 0 };
            Object.assign(current, update.$set);
            return { modifiedCount: 1 };
        },
        async deleteOne(filter) {
            if (state.session?.tokenHash !== filter.tokenHash) {
                return { deletedCount: 0 };
            }
            state.session = null;
            return { deletedCount: 1 };
        },
    };

    const users = {
        async findOne(filter) {
            if (!state.session || filter._id !== userId) return null;
            return {
                _id: userId,
                email: "student-test@example.invalid",
                name: "Utilizador de teste",
                role: "subscriber",
                status: "active",
            };
        },
    };

    return {
        state,
        async command(command) {
            if (!healthy || command?.ping !== 1) {
                throw new Error("DB double indisponivel.");
            }
            return { ok: 1 };
        },
        collection(name) {
            // Recusar coleções desconhecidas torna visível qualquer dependência fora do smoke MF1.
            if (name === "sessions") return sessions;
            if (name === "users") return users;
            throw new Error(`Colecao inesperada no smoke: ${name}`);
        },
    };
}
```

5. Explicação do código.

O double calcula o mesmo hash SHA-256 do service real e implementa compare-and-set para a rotação CSRF. `state.session` permite verificar que logout elimina o estado. A mensagem de erro não representa MongoDB real e não deve aparecer na resposta HTTP de readiness.

6. Validação do passo.

`node --check tests/helpers/db-double.js` termina com exit code 0. Uma instância `healthy: false` deve rejeitar `command({ ping: 1 })`; uma instância autenticada começa com uma única sessão.

7. Cenário negativo/erro esperado.

Um acesso a `payments`, `contents` ou outra coleção não prevista lança `Colecao inesperada no smoke`. Não alargues o double para esconder dependências que não pertencem à fundação MF1.

### Passo 2 - Criar o servidor de teste isolado

1. Objetivo funcional do passo.

Instalar o double antes de construir Express, abrir uma porta efémera e limpar servidor/override no fim.

2. Ficheiros envolvidos.

- CRIAR: `backend/tests/helpers/test-server.js`.
- REVER: `backend/src/config/database.js`, `backend/src/app.js`.

3. Instruções do que fazer.

Importa `createApp()`, nunca `src/server.js`. O helper recebe o double explicitamente, oferece `setDb()` para cenários de readiness e remove sempre o override em `close()`.

4. Código completo, correto e integrado com a app final.

**`backend/tests/helpers/test-server.js`**

```js
import { createApp } from "../../src/app.js";
import { setDbForTests } from "../../src/config/database.js";

async function closeServer(server) {
    if (!server?.listening) return;
    await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
}

export async function startTestServer({ db }) {
    setDbForTests(db);
    let server;

    try {
        // Importamos a factory; o ponto de entrada principal nunca corre no teste.
        server = createApp().listen(0, "127.0.0.1");

        await new Promise((resolve, reject) => {
            server.once("listening", resolve);
            server.once("error", reject);
        });

        const address = server.address();
        if (!address || typeof address === "string") {
            throw new Error("Nao foi possivel obter a porta efemera.");
        }

        let closePromise = null;
        return {
            baseUrl: `http://127.0.0.1:${address.port}`,
            setDb: (nextDb) => setDbForTests(nextDb),
            close() {
                // A mesma promise torna close idempotente também em chamadas concorrentes.
                closePromise ??= (async () => {
                    try {
                        await closeServer(server);
                    } finally {
                        setDbForTests(null);
                    }
                })();
                return closePromise;
            },
        };
    } catch (startupError) {
        let cleanupError = null;
        try {
            await closeServer(server);
        } catch (error) {
            cleanupError = error;
        } finally {
            // Mesmo um listen/close falhado não pode contaminar o teste seguinte.
            setDbForTests(null);
        }

        if (cleanupError) {
            throw new AggregateError(
                [startupError, cleanupError],
                "Falha ao arrancar e limpar o servidor de teste.",
            );
        }
        throw startupError;
    }
}
```

5. Explicação do código.

Porta `0` pede ao sistema operativo uma porta livre e evita testar por engano
um processo na 3000. O override entra antes de `createApp()` e é removido num
`finally`, mesmo se `listen`, leitura da porta ou `server.close` falharem;
chamadas concorrentes a `close()` partilham a mesma promise. Como `env.js` é
importado pela app, o script do Passo 4 fornece apenas
configuração HTTP sintética. Em `NODE_ENV=test`, não define `MONGODB_*` nem
`TEST_MONGODB_*`: `setDbForTests(db)` instala explicitamente o double antes de
qualquer service pedir `getDb()`.

6. Validação do passo.

`node --check tests/helpers/test-server.js` termina com exit code 0. O objeto devolvido contém uma URL loopback, `setDb()` e `close()`; depois de `close()` não fica qualquer socket aberto.

7. Cenário negativo/erro esperado.

O helper deve falhar se `NODE_ENV` não for `test`, por proteção de `setDbForTests()`. É proibido contornar o guard ou importar `src/server.js`.

### Passo 3 - Testar live, ready e sessão

1. Objetivo funcional do passo.

Automatizar os contratos HTTP acumulados, incluindo os negativos de dependência, anonimato e CSRF.

2. Ficheiros envolvidos.

- CRIAR: `backend/tests/smoke/app.smoke.test.js`.
- REVER: os contratos dos BKs MF1-01, MF1-04 e MF1-05.

3. Instruções do que fazer.

Arranca um único servidor com double saudável. Cada teste altera apenas o override controlado. No fim, fecha o servidor mesmo que um assert falhe.

4. Código completo, correto e integrado com a app final.

**`backend/tests/smoke/app.smoke.test.js`**

```js
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
    createDbDouble,
    TEST_SESSION_TOKEN,
} from "../helpers/db-double.js";
import { startTestServer } from "../helpers/test-server.js";

let server;

// Um servidor efémero é partilhado, mas cada cenário substitui apenas o double controlado.
before(async () => {
    server = await startTestServer({ db: createDbDouble() });
});

after(async () => {
    await server.close();
});

test("live fica 200 e ready fica 503 sem DB", async () => {
    server.setDb(createDbDouble({ healthy: false }));

    const live = await fetch(`${server.baseUrl}/health/live`);
    const ready = await fetch(`${server.baseUrl}/health/ready`);
    const alias = await fetch(`${server.baseUrl}/health`);

    assert.equal(live.status, 200);
    assert.equal((await live.json()).dependencies.database, "not_checked");
    assert.equal(ready.status, 503);
    assert.equal((await ready.json()).dependencies.database, "unavailable");
    assert.equal(alias.status, 503);
});

test("ready, API e 404 mantêm contratos JSON", async () => {
    server.setDb(createDbDouble());

    const ready = await fetch(`${server.baseUrl}/health/ready`);
    const api = await fetch(`${server.baseUrl}/api`);
    const missing = await fetch(`${server.baseUrl}/api/nao-existe`);

    assert.equal(ready.status, 200);
    assert.equal((await ready.json()).ready, true);
    assert.equal((await api.json()).name, "FaithFlix API");
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).code, "REQUEST_FAILED");
    assert.ok(missing.headers.get("x-request-id"));
});

test("ausência de sessão e cookie falso mantêm user null", async () => {
    server.setDb(createDbDouble());

    for (const cookie of [null, "faithflix_session=falso"]) {
        const response = await fetch(`${server.baseUrl}/api/session/me`, {
            headers: cookie ? { Cookie: cookie } : {},
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { user: null });
    }

    const csrf = await fetch(`${server.baseUrl}/api/session/csrf-token`);
    assert.equal(csrf.status, 401);
});

test("sessão autenticada roda CSRF e logout exige as duas provas", async () => {
    // O primeiro logout prova que uma mutação sem Origin e CSRF não altera o estado da sessão.
    const db = createDbDouble({ authenticated: true });
    server.setDb(db);
    const cookie = `faithflix_session=${TEST_SESSION_TOKEN}`;

    const csrfResponse = await fetch(
        `${server.baseUrl}/api/session/csrf-token`,
        { headers: { Cookie: cookie } },
    );
    const { csrfToken } = await csrfResponse.json();

    assert.equal(csrfResponse.status, 200);
    assert.equal(csrfResponse.headers.get("cache-control"), "private, no-store");
    assert.ok(csrfToken);

    const rejected = await fetch(`${server.baseUrl}/api/session/logout`, {
        method: "POST",
        headers: { Cookie: cookie },
    });
    assert.equal(rejected.status, 403);
    assert.ok(db.state.session);

    const logout = await fetch(`${server.baseUrl}/api/session/logout`, {
        method: "POST",
        headers: {
            Cookie: cookie,
            Origin: "http://127.0.0.1:5173",
            "X-CSRF-Token": csrfToken,
        },
    });
    assert.equal(logout.status, 204);
    assert.equal(db.state.session, null);
});
```

5. Explicação do código.

O primeiro teste demonstra que live e ready não são aliases falsos. Os testes seguintes mantêm JSON, anonimato e request ID. O último usa os services/middlewares reais: a primeira mutation é rejeitada sem provas e não elimina estado; a segunda apresenta Origin e CSRF, recebe 204 e remove a sessão.

6. Validação do passo.

Depois do script do Passo 4, `npm --prefix backend run smoke` executa quatro testes e termina sem processos pendurados. Os logs podem conter IDs e rotas, nunca os tokens constantes.

7. Cenário negativo/erro esperado.

Se readiness responder 200 com `healthy: false`, se cookie falso autenticar ou se logout sem CSRF apagar o estado, o teste deve falhar. Não mudes os asserts para acomodar um contrato inseguro.

### Passo 4 - Adicionar scripts isolados e evidence classificada

1. Objetivo funcional do passo.

Criar comandos reprodutíveis para smoke backend, build frontend e gate agregado, sem escrever numa DB.

2. Ficheiros envolvidos.

- EDITAR: `backend/package.json`, `frontend/package.json` e `package.json` da raiz.
- CRIAR, apenas após os comandos: `docs/evidence/student/MF1/README.md`.
- NÃO EDITAR: `docs/evidence/MF1/README.md`, que preserva evidence histórica da referência.

3. Instruções do que fazer.

Preserva dependências e scripts existentes; acrescenta apenas `smoke`. No
backend, define somente `NODE_ENV=test`, a origin frontend sintética e o nome
do cookie. Não forneças `MONGODB_URI`, `MONGODB_DB_NAME` nem
`TEST_MONGODB_*`: o helper instala o DB double explicitamente e o guard
fail-closed deve impedir qualquer ligação MongoDB nesta lane.

4. Código completo, correto e integrado com a app final.

**Excerto de `backend/package.json`**

```json
{
    "scripts": {
        "smoke": "NODE_ENV=test FRONTEND_ORIGINS='http://127.0.0.1:5173' SESSION_COOKIE_NAME=faithflix_session node --test tests/smoke/*.test.js"
    }
}
```

**Excerto de `frontend/package.json`**

```json
{
    "scripts": {
        "smoke": "npm run build"
    }
}
```

**Excerto do `package.json` da raiz dos alunos**

```json
{
    "scripts": {
        "smoke": "npm --prefix backend run smoke && npm --prefix frontend run smoke"
    }
}
```

Não alteres `docs/evidence/MF1/README.md`: esse path pertence ao snapshot
`REFERENCE`. Só depois de obter output real, cria o artefacto próprio dos
alunos em **`docs/evidence/student/MF1/README.md`**. O bloco seguinte define a
estrutura e a metadata; a tabela só recebe linhas observadas no mesmo turno da
criação, nunca placeholders ou `PASS` antecipado.

```md
# Evidence STUDENT MF1 - Fundação técnica

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`
- `proof_scope`: smoke isolado MF1; não prova MongoDB real, E2E, streaming ou produção

## Comandos executados

| Data UTC | Cwd | Comando | Exit code | Resultado real |
| --- | --- | --- | ---: | --- |

## Provas negativas observadas

| Cenário executado | Resultado esperado | Exit/resultado real |
| --- | --- | --- |

## Limites da prova

O DB double não valida driver, replica set, transações, carga ou browsers reais.
```

5. Explicação do código.

Os snippets são excertos aditivos: não substituem manifests completos nem
removem dependências como `mongodb`. O namespace `student/` impede que a nova
evidence sobrescreva o snapshot da referência. A metadata separa as lanes e o
ficheiro só nasce depois da execução, já com linhas reais e sem placeholders.

6. Validação do passo.

`npm --prefix backend run smoke`, `npm --prefix frontend run smoke` e
`npm run smoke` são os três comandos do gate. Só depois de os executar se cria
`docs/evidence/student/MF1/README.md`, registando resultados, exit codes, data
e negativos realmente observados.

7. Cenário negativo/erro esperado.

O smoke reprova se o script executar `src/server.js`, receber qualquer
`MONGODB_*`/`TEST_MONGODB_*` ou omitir `NODE_ENV=test`. Evidence criada antes
da execução, com placeholders ou “PASS” sem output real, também reprova.

### Passo 5 - Fechar o gate MF1 sem sobrestimar a prova

1. Objetivo funcional do passo.

Rever a execução acumulada e decidir se MF2 pode começar.

2. Ficheiros envolvidos.

- CRIAR/EDITAR: `docs/evidence/student/MF1/README.md` apenas com resultados observados.
- PRESERVAR: `docs/evidence/MF1/README.md` sem alterações.
- REVER: todos os BKs `MF1-01..06`.

3. Instruções do que fazer.

Executa os três comandos, regista cwd, data, exit code e resumo. Se algum falhar, mantém o BK aberto e regista o blocker; não alteres RF/RNF nem escondas um teste.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O gate confirma composição local com doubles e build. Não autoriza seed, E2E, DB normal, streaming ou produção. Uma suite verde só desbloqueia os trabalhos MF2 que dependem desta fundação.

6. Validação do passo.

Todos os comandos terminam com exit code 0, os quatro testes backend são executados sem skip, o frontend compila e nenhum processo fica a escutar depois do gate.

7. Cenário negativo/erro esperado.

Um comando ausente, skipped ou vermelho impede fechar o BK. Regista honestamente `BLOCKED` quando a falha for ambiental; nunca escrevas “PASS” por intenção.

#### Critérios de aceite

- O smoke importa `createApp()`, usa `setDbForTests()` e nunca importa `src/server.js`.
- O script fornece apenas configuração HTTP sintética loopback, não recebe
  qualquer variável MongoDB e nenhuma ligação MongoDB é criada.
- Live fica 200; ready e alias ficam 503 com double indisponível e 200 com double saudável.
- Sessão ausente/cookie falso devolvem exatamente `200 { "user": null }`.
- CSRF sem auth devolve 401; logout sem CSRF devolve 403; logout válido devolve 204 e elimina a sessão do double.
- API/404 preservam JSON e `x-request-id`.
- Build frontend e gate agregado passam sem servidor de desenvolvimento.
- Evidence contém metadata D0, comandos/resultados reais e limites da prova.

#### Validação final

Executar na raiz, sem MongoDB ou servidor principal:

```bash
npm --prefix backend run smoke
npm --prefix frontend run smoke
npm run smoke
```

#### Evidence para PR/defesa

- `pr`: referência da implementação dos helpers/testes/scripts.
- `proof`: exit codes e resumo dos quatro testes backend e build frontend.
- `neg`: ready 503, cookie falso e logout recusado sem CSRF.
- `fonte`: `RNF29`, BKs MF1-01, MF1-04, MF1-05 e este guia.

#### Handoff

- `BK-MF2-01` acrescenta registo/login/reset reutilizando a mesma sessão, CSRF e doubles.
- Integração MongoDB e concorrência exigem replica set dedicado; este smoke não as fecha.
- Os testes permanecem rápidos, locais e sem Internet para serem executados antes de cada integração MF2.

#### Changelog

- `2026-07-10`: removida qualquer dependência na DB normal/servidor principal; adicionados DB double, `setDbForTests`, live/ready, sessão, CSRF e evidence classificada.
- `2026-05-30`: primeira versão do smoke agregado MF1.
