# BK-MF6-01 - Suite de regressão backend

## Header

- `doc_id`: `GUIA-BK-MF6-01`
- `bk_id`: `BK-MF6-01`
- `macro`: `MF6`
- `owner`: `Kaue`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-06`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-02`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-01-suite-de-regressao-backend.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais separar a regressão backend em duas lanes: uma suite unitária para contratos puros e services não transacionais, e uma integração dedicada para checkout, rollback e rotação mensal em MongoDB replica set. `RNF29` só fica integralmente provado quando existem resultados atuais das duas lanes.

Este guia fornece integralmente o ficheiro unitário `backend/tests/regression/mf6-backend-regression.test.js`, executado com `node --test`. A evidence `docs/evidence/MF6/BK-MF6-01-regressao-backend.md` separa esse resultado da integração transacional; não pode declarar checkout, rollback ou rotação como provados apenas com o snippet fornecido aqui.

#### Importância

Uma regressão acontece quando uma funcionalidade que já funcionava deixa de funcionar depois de uma alteração nova. Na MF6, a aplicação já tem identidade, streaming, subscrições, pagamentos simulados, pool solidária, privacidade, métricas e integrações admin. Um pequeno ajuste num validator, service ou router pode quebrar um fluxo antigo sem que a equipa repare durante a implementação.

`RNF29` não pede apenas testes de funções isoladas. O requisito pede testes automatizados para fluxos que representam valor real da aplicação: autenticar, criar/cancelar subscrição, registar progresso de reprodução e distribuir a pool por associações. A lane unitária deste guia protege validação, cancelamento, progresso e autorização; criação, atomicidade e rotação pertencem exclusivamente à lane de integração transacional.

#### Scope-in

- Criar uma suite de regressão backend com `node:test`.
- Validar autenticação por validators reais de email/password.
- Definir a prova separada de criação de subscrição através do checkout simulado aprovado, sem a confundir com a suite unitária fornecida.
- Validar cancelamento de renovação através do service real de subscrições.
- Validar reprodução básica através do payload real de progresso.
- Exigir integração em replica set para provar distribuição mensal e rotação real entre associações elegíveis.
- Confirmar que os endpoints admin herdados de `BK-MF5-06` continuam montados para regressão futura.
- Executar regressão, testes existentes e smoke backend.
- Registar evidence objetiva com comandos, resultados reais e negativos.

#### Scope-out

- Criar motor novo de testes.
- Reescrever services de domínio.
- Alterar contratos RF/RNF, owners, prioridades, esforço, sprint ou dependências.
- Criar testes end-to-end com browser.
- Ligar pagamentos ou streaming a fornecedores externos.
- Criar gateway real de pagamento, infraestrutura externa de vídeo ou IA avançada.

#### Estado antes e depois

Antes deste BK, o backend já tem testes unitários, testes de integração e smoke tests espalhados por macrofase. Falta uma regressão MF6 que separe claramente o que pode ser provado sem MongoDB do que exige uma sessão transacional real.

Depois deste BK, a equipa passa a ter uma lane unitária copiável e um contrato explícito para a lane de integração. A evidence só agrega as cinco áreas quando o ficheiro transacional existir e o respetivo comando tiver resultado atual; até lá, criação de subscrição e rotação permanecem `NAO_PROVADO`.

#### Pré-requisitos

- `BK-MF1-06` criou a base de smoke tests FE/BE.
- `BK-MF2-01` criou validação de identidade e sessão.
- `BK-MF2-05` criou regras de progresso de reprodução.
- `BK-MF4-01` e `BK-MF4-02` criaram contratos de subscrição e pagamento simulado.
- `BK-MF4-05` criou distribuição mensal e rotação da pool solidária.
- `BK-MF5-06` fechou integrações admin e entregou para MF6 os endpoints `/api/admin/integrations` e `/api/admin/metrics`.
- O package `backend/package.json` já tem `"test": "node --test"` e `"smoke": "node --test tests/smoke/*.test.js"`.

#### Glossário

- Regressão: erro que aparece numa funcionalidade antiga depois de uma alteração nova.
- Suite de regressão: conjunto de testes repetível focado em proteger contratos já entregues.
- Contrato backend: comportamento esperado entre route, controller, service, validator e dados persistidos.
- Base em memória: duplo de teste que simula a parte do MongoDB usada pela suite, sem ligar ao Atlas.
- Smoke test: teste curto que confirma que a aplicação arranca e responde ao essencial.
- Negativo: cenário de erro esperado que prova que a aplicação falha de forma controlada.
- Evidence: prova técnica com comando executado, resultado real e negativos testados.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF29` pede testes automatizados para autenticação, criação e cancelamento de subscrições, reprodução básica de conteúdo e rotação de associações.
- `CANONICO`: a matriz canónica regista `BK-MF6-01` como cobertura complementar de `RNF29` no gate S12.
- `CANONICO`: `BK-MF5-06` entrega para `BK-MF6-01` a regressão backend de `/api/admin/integrations` e `/api/admin/metrics`.
- `DERIVADO`: a lane unitária usa base em memória apenas para services
  compatíveis; checkout/pool chamam os services reais exclusivamente na lane
  de integração com replica set dedicado.
- Um teste de regressão deve ser curto, estável e repetível. Não serve para testar tudo; serve para bloquear quebras em pontos de alto risco.
- `node:test` é o runner nativo do Node.js. Nesta app evita dependências novas e mantém a suite no mesmo runtime usado pelo backend.
- Um service não transacional pode usar arrays controlados. Um service que
  exige `runInTransaction` nunca recebe uma sessão fictícia: a prova de commit,
  rollback e concorrência requer MongoDB transacional.
- Em segurança e privacidade, negativos são tão importantes como positivos: validar rejeições evita aceitar input inseguro, estado impossível ou operação sem autorização.
- A regressão de endpoints admin não substitui testes de negócio de métricas e integrações. Ela garante que os routers continuam montados e que a barreira de role admin continua documentada para o gate.

#### Arquitetura do BK

| Camada | Decisão |
| --- | --- |
| Backend | `backend` |
| Test runner | `node --test` |
| Novo ficheiro | `tests/regression/mf6-backend-regression.test.js` |
| Dados de teste | Unitários puros/base em memória; transações apenas em replica set `TEST_MONGODB_*` |
| Lane unitária fornecida | auth validators, cancelamento, progresso, mês da pool, admin RBAC |
| Lane transacional exigida | checkout/idempotência/rollback e distribuição/rotação; não fornecida neste guia |
| Evidence | `docs/evidence/MF6/BK-MF6-01-regressao-backend.md` |
| Handoff | `BK-MF6-02` valida cliente API, rotas frontend e estados visuais sobre estes contratos backend |

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/tests/regression/mf6-backend-regression.test.js`
- CRIAR: `docs/evidence/MF6/BK-MF6-01-regressao-backend.md`
- REVER: `backend/package.json`
- REVER: `backend/tests/smoke/app.smoke.test.js`
- REVER: `backend/tests/unit/mf5-validation.test.js`
- REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md`

#### Tutorial técnico linear

### Passo 1 - Criar a suite de regressão backend

1. Objetivo funcional do passo no contexto da app.

Criar o teste unitário automatizado que protege contratos não transacionais de `RNF29` e confirma o handoff backend de `BK-MF5-06`, sem o apresentar como prova de checkout, rollback ou rotação.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/regression/mf6-backend-regression.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `backend/tests/regression/` se ainda não existir. Depois cria o ficheiro abaixo exatamente com este conteúdo.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/regression/mf6-backend-regression.test.js
/**
 * @file Suite de regressão backend da MF6.
 *
 * Protege a subset unitária de RNF29 usando validators, services não
 * transacionais e routers reais, com uma base de dados em memória controlada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { createApp } from "../../src/app.js";
import { setDbForTests } from "../../src/config/database.js";
import {
  assertValidEmail,
  assertValidPassword,
} from "../../src/modules/auth/auth.validation.js";
import { requireRole } from "../../src/middlewares/auth.middleware.js";
import {
  assertCheckoutPayload,
  assertIdempotencyKey,
} from "../../src/modules/payments/payments.validation.js";
import { cancelRenewal } from "../../src/modules/subscriptions/subscriptions.service.js";
import { assertProgressPayload } from "../../src/modules/playback/playback.validation.js";
import { assertDistributionMonth } from "../../src/modules/charities/pool-distribution.validation.js";

/**
 * Compara identificadores MongoDB pelo seu valor textual.
 *
 * @param {unknown} left Identificador esquerdo.
 * @param {unknown} right Identificador direito.
 * @returns {boolean} `true` quando representam o mesmo id.
 */
function sameId(left, right) {
  return String(left) === String(right);
}

/**
 * Lê um campo simples ou aninhado de um documento em memória.
 *
 * @param {Record<string, unknown>} row Documento consultado.
 * @param {string} path Caminho no formato `campo.subcampo`.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
  return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Compara um valor real com uma condição MongoDB usada nos services testados.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condição esperada.
 * @returns {boolean} Resultado da comparação.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) {
    return sameId(actual, expected);
  }

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$gt" in expected && actual <= expected.$gt) return false;
    if ("$gte" in expected && actual < expected.$gte) return false;
    if ("$lte" in expected && actual > expected.$lte) return false;
    return true;
  }

  return actual === expected;
}

/**
 * Aplica uma query simples aos documentos guardados em memória.
 *
 * @param {Record<string, unknown>} row Documento consultado.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} `true` quando o documento cumpre a query.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([key, expected]) => {
    const actual = valueForPath(row, key);

    if (expected instanceof ObjectId) {
      return sameId(actual, expected);
    }

    return matchesValue(actual, expected);
  });
}

/**
 * Cria comparador para a subset de `sort` usada pelos services.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação simplificada.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
  return (left, right) => {
    for (const [key, direction] of Object.entries(sort)) {
      const leftValue = valueForPath(left, key);
      const rightValue = valueForPath(right, key);

      if (leftValue < rightValue) return -1 * direction;
      if (leftValue > rightValue) return 1 * direction;
    }

    return 0;
  };
}

/**
 * Aplica operadores de atualização MongoDB suficientes para esta regressão.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, unknown>} update Operadores `$set` e `$setOnInsert`.
 * @param {boolean} isInsert Indica se o documento nasceu por upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
  Object.assign(row, update.$set ?? {});

  if (isInsert) {
    Object.assign(row, update.$setOnInsert ?? {});
  }

  if (!row._id) {
    row._id = new ObjectId();
  }

  return row;
}

/**
 * Converte filtros simples em documento inicial para upsert.
 *
 * @param {Record<string, unknown>} filter Filtro usado no update.
 * @returns {Record<string, unknown>} Documento base.
 */
function rowFromFilter(filter = {}) {
  return Object.fromEntries(
    Object.entries(filter).filter(
      ([key, value]) =>
        !key.startsWith("$") &&
        !(value && typeof value === "object" && !Array.isArray(value)),
    ),
  );
}

/**
 * Cria uma coleção em memória compatível com a subset MongoDB usada na suite.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, unknown>} Coleção de teste.
 */
function collection(rows = []) {
  return {
    rows,

    async createIndex() {},

    /**
     * Procura o primeiro documento que cumpre a query.
     *
     * @param {Record<string, unknown>} query Query simplificada.
     * @param {{ sort?: Record<string, 1 | -1> }} options Opções simplificadas.
     * @returns {Promise<Record<string, unknown> | null>} Documento encontrado.
     */
    async findOne(query = {}, options = {}) {
      const result = rows.filter((row) => matches(row, query));

      if (options.sort) {
        result.sort(compareBySort(options.sort));
      }

      return result[0] ?? null;
    },

    /**
     * Lista documentos que cumprem a query com `sort().toArray()`.
     *
     * @param {Record<string, unknown>} query Query simplificada.
     * @returns {{ sort: Function, toArray: Function }} Cursor fake.
     */
    find(query = {}) {
      const result = rows.filter((row) => matches(row, query));

      return {
        sort(sort = {}) {
          result.sort(compareBySort(sort));
          return this;
        },
        async toArray() {
          return result;
        },
      };
    },

    /**
     * Insere um documento e devolve o id gerado.
     *
     * @param {Record<string, unknown>} document Documento a inserir.
     * @returns {Promise<{ insertedId: ObjectId }>} Resultado de inserção.
     */
    async insertOne(document) {
      const insertedId = document._id ?? new ObjectId();
      rows.push({ ...document, _id: insertedId });
      return { insertedId };
    },

    /**
     * Atualiza ou cria um documento.
     *
     * @param {Record<string, unknown>} filter Filtro simplificado.
     * @param {Record<string, unknown>} update Operadores de update.
     * @param {{ upsert?: boolean }} options Opções de update.
     * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Resultado.
     */
    async updateOne(filter, update, options = {}) {
      const existing = rows.find((row) => matches(row, filter));

      if (existing) {
        applyUpdate(existing, update, false);
        return { matchedCount: 1, modifiedCount: 1 };
      }

      if (options.upsert) {
        rows.push(applyUpdate(rowFromFilter(filter), update, true));
      }

      return { matchedCount: 0, modifiedCount: 0 };
    },

    /**
     * Atualiza o primeiro documento encontrado e devolve o documento final.
     *
     * @param {Record<string, unknown>} filter Filtro simplificado.
     * @param {Record<string, unknown>} update Operadores de update.
     * @returns {Promise<Record<string, unknown> | null>} Documento atualizado.
     */
    async findOneAndUpdate(filter, update) {
      const existing = rows.find((row) => matches(row, filter));

      if (!existing) {
        return null;
      }

      return applyUpdate(existing, update, false);
    },
  };
}

/**
 * Instala coleções em memória através do helper oficial de testes.
 *
 * @param {Record<string, ReturnType<typeof collection>>} collections Coleções iniciais.
 * @returns {Record<string, ReturnType<typeof collection>>} Coleções instaladas.
 */
function setCollectionsForRegression(collections) {
  setDbForTests({
    collection(name) {
      collections[name] ??= collection([]);
      return collections[name];
    },
  });

  return collections;
}

/**
 * Confirma que uma função lança erro HTTP previsível.
 *
 * @param {() => unknown} action Ação que deve falhar.
 * @param {number} statusCode Código HTTP esperado.
 * @returns {void}
 */
function assertHttpFailure(action, statusCode) {
  assert.throws(
    action,
    (error) => {
      assert.equal(error.statusCode ?? error.status, statusCode);
      return true;
    },
  );
}

/**
 * Simula uma resposta Express para testar middlewares de autorização.
 *
 * @returns {{ response: object, state: { statusCode: number, body: unknown } }} Duplo de resposta.
 */
function createResponseDouble() {
  const state = { statusCode: 200, body: null };

  return {
    state,
    response: {
      status(code) {
        state.statusCode = code;
        return this;
      },
      json(body) {
        state.body = body;
        return this;
      },
    },
  };
}

afterEach(() => {
  setDbForTests(null);
});

test("auth mantém email normalizado e password mínima", () => {
  assert.equal(assertValidEmail("  ALUNO@FAITHFLIX.TEST "), "aluno@faithflix.test");
  assert.equal(assertValidPassword("palavra-passe-segura"), "palavra-passe-segura");

  assertHttpFailure(() => assertValidEmail("email-invalido"), 400);
  assertHttpFailure(() => assertValidPassword("curta"), 400);
});

test("subscrições validam payload/chave e cancelamento de renovação", async () => {
  const userId = new ObjectId();
  const collections = setCollectionsForRegression({
    subscription_plans: collection([
      {
        _id: new ObjectId(),
        code: "faithflix-monthly",
        name: "FaithFlix Mensal",
        interval: "monthly",
        priceCents: 1000,
        currency: "EUR",
        solidaritySharePercent: 20,
        active: true,
      },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
        cancelAtPeriodEnd: false,
      },
    ]),
  });

  const payload = assertCheckoutPayload({
    planCode: "faithflix-monthly",
    paymentMethod: "card_test",
    simulateOutcome: "approved",
  });
  const idempotencyKey = assertIdempotencyKey(
    "mf6-contract-checkout-00000001",
  );
  assert.equal(payload.paymentMethod, "card_test");
  assert.equal(idempotencyKey, "mf6-contract-checkout-00000001");

  const canceled = await cancelRenewal(String(userId));
  // O cancelamento mantém acesso até ao fim do ciclo, mas impede renovação automática.
  assert.equal(canceled.subscription.cancelAtPeriodEnd, true);

  assert.throws(
    () => assertCheckoutPayload({
        planCode: "faithflix-monthly",
        paymentMethod: "cartao-real",
        simulateOutcome: "approved",
      }),
    /Método de pagamento inválido/,
  );
});

test("playback limita progresso ao tamanho real do conteúdo", () => {
  const progress = assertProgressPayload({ currentTimeSeconds: 130 }, 120);

  assert.deepEqual(progress, {
    currentTimeSeconds: 120,
    durationSeconds: 120,
    completed: true,
  });

  assertHttpFailure(() => assertProgressPayload({ currentTimeSeconds: -1 }, 120), 400);
});

test("pool solidária fecha o contrato de mês sem fingir transações", () => {
  assert.equal(assertDistributionMonth("2026-06"), "2026-06");
  assertHttpFailure(() => assertDistributionMonth("2026-13"), 400);
});

test("endpoints admin herdados da MF5 continuam montados e exigem role admin", () => {
  const mountedRouters = createApp()._router.stack.map((layer) => String(layer.regexp));

  assert.ok(mountedRouters.some((route) => route.includes("\\/api\\/admin\\/metrics")));
  assert.ok(mountedRouters.some((route) => route.includes("\\/api\\/admin\\/integrations")));

  const adminOnly = requireRole(["admin"]);
  const anonymous = createResponseDouble();
  adminOnly({}, anonymous.response, () => assert.fail("Anónimo não pode avançar"));
  assert.equal(anonymous.state.statusCode, 401);

  const normalUser = createResponseDouble();
  adminOnly({ user: { role: "user" } }, normalUser.response, () =>
    assert.fail("Utilizador comum não pode avançar"),
  );
  assert.equal(normalUser.state.statusCode, 403);
});
```

A suite acima não chama `runInTransaction` com o DB double. Ela fecha contratos
puros e services não transacionais. Este guia não fornece o conteúdo de
`backend/tests/integration/mf6-billing-pool-transaction.integration.test.js`;
logo, a existência ou cobertura desse ficheiro nunca pode ser inferida deste
snippet. Antes de fechar `RNF29`, a equipa tem de implementar e rever essa lane
separadamente. Só então executa o teste com services canónicos,
`Idempotency-Key` nova e sem `MONGODB_*`:

```bash
NODE_ENV=test \
E2E_SUITE_ID='mf4' \
E2E_RUN_ID='20260710t120000' \
RATE_LIMIT_PEPPER='faithflix-e2e-test-only-pepper-20260710' \
FRONTEND_ORIGINS='http://127.0.0.1:5173' \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME='faithflix_mf4_20260710t120000_e2e' \
node --test tests/integration/mf6-billing-pool-transaction.integration.test.js
```

Quando estiver implementado, o teste de integração deve chamar, entre outros casos,
`createSimulatedCheckout(userId, payload,
"mf6-checkout-20260710t120000")`, verificar replay sem duplicação e fazer fault
injection nas transações de checkout/pool. O ficheiro valida a lane com
`assertE2eRuntimeEnvironment(process.env)` antes de ligar, usa fixtures marcadas
e limpa apenas o run atual. Se o ficheiro não existir, regista `NAO_IMPLEMENTADO`;
se existir mas não houver replica set local, regista `BLOQUEADO_AMBIENTE`. Em
nenhum caso substituas a prova por DB double ou pela DB normal.

5. Explicação do código.

Este ficheiro usa validators e services compatíveis com a lane unitária.
`assertValidEmail`, `assertValidPassword`, `assertCheckoutPayload` e
`assertIdempotencyKey` fecham input; `cancelRenewal` prova o cancelamento sem
apagar o ciclo; `assertProgressPayload` limita a retoma. Checkout e pool
transacionais ficam exclusivamente na integração com replica set acima.

A base em memória implementa apenas a subset usada por services não
transacionais. Nunca finge `ClientSession`, `withTransaction` ou rollback; essa
prova pertence ao teste de integração real.

O teste final da lane unitária fecha o handoff de `BK-MF5-06`: confirma que `/api/admin/metrics` e `/api/admin/integrations` continuam montados na aplicação e que o middleware `requireRole(["admin"])` rejeita pedidos anónimos ou de utilizadores comuns. Assim, a regressão unitária não ignora os últimos endpoints admin entregues antes da MF6.

Na lane unitária, os dados entram como objetos controlados para validators,
cancelamento, progresso e guards. Checkout, associação e distribuição só entram
na prova depois de existir a lane transacional. As validações acontecem nos
validators e nos services; a regra de segurança principal é nunca aceitar
ownership ou role vindos do frontend como autoridade final.

6. Validação do passo.

```bash
cd backend
node --test tests/regression/mf6-backend-regression.test.js
```

Só depois de executar regista o total observado. Não escrevas `5/5` ou `PASS`
por antecipação; a componente transacional fica `NAO_IMPLEMENTADO` sem o
ficheiro e `BLOQUEADO_AMBIENTE` se apenas faltar o replica set.

7. Cenário negativo/erro esperado.

Altera temporariamente `paymentMethod: "cartao-real"` para `paymentMethod: "card_test"` no negativo de subscrição. O teste deve falhar, porque o cenário deixou de representar um método inválido. Reverte a alteração antes de fechar o BK.

### Passo 2 - Executar a regressão backend completa

1. Objetivo funcional do passo no contexto da app.

Confirmar que a nova suite convive com os testes já existentes e que o backend continua operacional.

2. Ficheiros envolvidos:
    - REVER: `backend/package.json`
    - REVER: `backend/tests/smoke/app.smoke.test.js`
    - LOCALIZAÇÃO: comandos executados na raiz `backend`

3. Instruções do que fazer.

Executa os comandos abaixo por ordem. Se um comando falhar, lê a primeira falha real antes de abrir novos testes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O passo é de validação operacional e usa os scripts já definidos no package do backend.

Não existe código novo porque a app já expõe `npm test` e `npm run smoke`. A decisão correta é reutilizar os scripts oficiais, para a equipa não criar dois caminhos diferentes de validação.

`npm test` confirma apenas as suites realmente descobertas pelo script atual. Não
prova a lane transacional se o ficheiro estiver ausente ou se o output não o
identificar; por isso, o respetivo comando explícito e o seu estado continuam
obrigatórios. `npm run smoke` confirma que a app Express ainda arranca e responde
ao essencial. Se o ambiente local bloquear abertura de portas, regista o erro
exato e volta a correr o smoke num terminal com permissão de rede local.

6. Validação do passo.

```bash
cd backend
npm test
npm run smoke
```

Resultado esperado: a lane unitária e o smoke terminam sem falhas. A lane
transacional recebe separadamente `PASS` com output atual, `NAO_IMPLEMENTADO`
quando o ficheiro ainda não existe, ou `BLOQUEADO_AMBIENTE` quando só falta o
replica set; `npm test` não altera esse estado por inferência.

7. Cenário negativo/erro esperado.

Executa `node --test tests/regression/ficheiro-inexistente.test.js`. O Node deve devolver erro de ficheiro inexistente. Este negativo confirma que a evidence deve apontar para o caminho real da suite.

### Passo 3 - Registar evidence de regressão

1. Objetivo funcional do passo no contexto da app.

Guardar prova objetiva para o gate S12, sem depender de memória oral da equipa nem de resultados preenchidos antes da execução.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF6/BK-MF6-01-regressao-backend.md`
    - LOCALIZAÇÃO: ficheiro completo de evidence do BK

3. Instruções do que fazer.

Cria a pasta `docs/evidence/MF6/` se ainda não existir. Depois cria o ficheiro abaixo e substitui todos os campos `PREENCHER_COM_OUTPUT_REAL` pelo resultado real obtido no teu terminal.

4. Código completo, correto e integrado com a app final.

```md
# Evidence BK-MF6-01 - Regressão backend

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF6/BK-MF6-01-suite-de-regressao-backend.md`
- `proof_scope`: comandos e resultados backend realmente observados pelos alunos; não prova browser, produção ou referência privada

- Owner: Kaue
- Apoio: Matheus
- Data da execução: PREENCHER_COM_DATA_REAL
- Requisito: RNF29
- Branch/entrega: PREENCHER_COM_REFERENCIA_REAL

## Proof

| Comando | Resultado real |
| --- | --- |
| `node --test tests/regression/mf6-backend-regression.test.js` | PREENCHER_COM_OUTPUT_REAL |
| `node --test tests/integration/mf6-billing-pool-transaction.integration.test.js` com lane `TEST_MONGODB_*` | PREENCHER_COM_OUTPUT_REAL_OU_NAO_IMPLEMENTADO_OU_BLOQUEADO_AMBIENTE |
| `npm test` | PREENCHER_COM_OUTPUT_REAL |
| `npm run smoke` | PREENCHER_COM_OUTPUT_REAL |

## Cobertura

| Área RNF29 | Lane | Prova esperada | Estado observado |
| --- | --- | --- | --- |
| Autenticação | Unitária fornecida | Email normalizado, password mínima e rejeições HTTP 400 | PREENCHER_COM_RESULTADO_REAL |
| Criação de subscrição | Integração não fornecida | Checkout com chave explícita cria subscrição, replay não duplica e fault injection faz rollback | PREENCHER_COM_PASS_OU_NAO_IMPLEMENTADO_OU_BLOQUEADO_AMBIENTE |
| Cancelamento de subscrição | Unitária fornecida | `cancelRenewal` mantém o ciclo atual e marca `cancelAtPeriodEnd=true` | PREENCHER_COM_RESULTADO_REAL |
| Reprodução básica | Unitária fornecida | Progresso é limitado à duração e negativo é rejeitado | PREENCHER_COM_RESULTADO_REAL |
| Rotação de associações | Integração não fornecida | Segunda distribuição começa na associação seguinte, sem duplicar o mês | PREENCHER_COM_PASS_OU_NAO_IMPLEMENTADO_OU_BLOQUEADO_AMBIENTE |
| Handoff MF5 | Unitária fornecida | `/api/admin/metrics` e `/api/admin/integrations` continuam montados e protegidos | PREENCHER_COM_RESULTADO_REAL |

## Negativos

| Cenário | Lane | Resultado esperado |
| --- | --- | --- |
| Email inválido | Unitária fornecida | Erro HTTP 400 |
| Password curta | Unitária fornecida | Erro HTTP 400 |
| Método de pagamento não documentado | Unitária fornecida | Erro de validação |
| Progresso negativo | Unitária fornecida | Erro HTTP 400 |
| Distribuição duplicada no mesmo mês | Integração não fornecida | Erro de conflito, apenas com prova transacional atual |
| Pedido admin anónimo | Unitária fornecida | HTTP 401 |
| Pedido admin com role comum | Unitária fornecida | HTTP 403 |

## Observações

A suite unitária usa base em memória. A integração, quando existir, usa apenas a
DB `_e2e` dedicada declarada na evidence. `NAO_IMPLEMENTADO` e
`BLOQUEADO_AMBIENTE` não contam como prova de checkout, rollback ou rotação. Não
foram usados cartões reais, tokens externos, gateways de pagamento, serviços
externos de vídeo ou IA avançada.
```

5. Explicação do código.

Este ficheiro não é código executável; é evidence. Ele liga requisito, owner, comandos, cobertura, negativos e resultados reais. A diferença importante é que o ficheiro não vem com `PASS` preenchido: o aluno só pode fechar a evidence depois de executar os comandos.

A tabela de cobertura mapeia cada parte de `RNF29` para uma lane e uma prova
observável. Isto impede que validators unitários sejam apresentados como
checkout ou rotação reais e permite ao orientador distinguir `PASS`,
`NAO_IMPLEMENTADO` e `BLOQUEADO_AMBIENTE`.

6. Validação do passo.

Confirma que os comandos unitário, `npm test` e smoke têm output real. Para a
integração, regista output real ou exatamente um estado honesto com motivo. A
data corresponde à execução e o ficheiro não contém passwords, cookies, dados
pessoais, valores de ambiente ou segredos.

7. Cenário negativo/erro esperado.

Se algum comando ficar com placeholder, o BK não pode ser fechado como `DONE`.
`NAO_IMPLEMENTADO` mantém a cobertura transacional aberta;
`BLOQUEADO_AMBIENTE` só é válido quando o ficheiro existe e a única ausência
demonstrada é o replica set.

### Passo 4 - Preparar handoff para regressão frontend

1. Objetivo funcional do passo no contexto da app.

Entregar ao owner do próximo BK uma lista clara do que o frontend deve proteger com base na regressão backend.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suite-de-regressao-frontend.md`
    - LOCALIZAÇÃO: secção `Handoff`

3. Instruções do que fazer.

No fecho do PR ou entrega local, comunica separadamente o que a lane unitária
validou e o resultado real da integração. Só declara checkout, subscrição ativa
e distribuição transacional quando o comando em replica set tiver output atual;
caso contrário, regista `NAO_IMPLEMENTADO` ou `BLOQUEADO_AMBIENTE` conforme a
causa real.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O passo é de coordenação técnica entre BKs.

O handoff evita duplicação. O frontend não precisa repetir detalhes internos que
tenham prova backend atual, mas a rotação da pool e o checkout só podem ser
dados como protegidos se a lane transacional estiver verde. O frontend deve
confirmar que as páginas chamam as rotas certas, usam `credentials: "include"`
quando há sessão por cookie e apresentam estados de loading, erro, vazio e
sucesso.

Este handoff também prepara `BK-MF6-03`: segurança e privacidade devem rever
sessão, roles admin, dados de subscrição e progresso protegidos pela lane
unitária, e manter checkout/pool explicitamente pendentes da integração quando
essa prova não existir.

6. Validação do passo.

O handoff está completo quando `BK-MF6-02` consegue listar as páginas e chamadas API que dependem destes contratos backend: login/sessão, planos, reprodução, associações, métricas admin e integrações admin.

7. Cenário negativo/erro esperado.

Se a equipa não souber dizer que fluxo backend protege cada página frontend, existe risco de regressão cruzada. Regista a lacuna na evidence antes de avançar.

#### Critérios de aceite

- A suite `tests/regression/mf6-backend-regression.test.js` existe e executa com `node --test`.
- A lane unitária fornecida cobre validators de autenticação e checkout,
  cancelamento de renovação, validação de progresso, validação do mês e guards
  admin; não prova criação, commit/rollback financeiro nem rotação mensal.
- Criação de subscrição, idempotência persistida, fault injection e rotação só
  ficam `VALIDADO` quando
  `tests/integration/mf6-billing-pool-transaction.integration.test.js` existir e
  passar num replica set dedicado com output atual.
- A suite confirma que `/api/admin/metrics` e `/api/admin/integrations` continuam montados e protegidos por role admin.
- A lane unitária usa apenas base em memória; a transacional usa apenas
  `TEST_MONGODB_*` numa DB fresca `_e2e` com replica set e nunca a DB normal.
- Ausência do ficheiro transacional é `NAO_IMPLEMENTADO`; ficheiro presente sem
  replica set é `BLOQUEADO_AMBIENTE`. Nenhum desses estados conta como cobertura.
- `npm test`, `npm run smoke` e o comando unitário foram executados e registados;
  o comando transacional tem output real ou um dos estados explícitos acima.
- Existem negativos unitários para autenticação, payload de checkout,
  reprodução e autorização admin; os negativos de duplicação/rollback da pool
  pertencem à integração e não são inferidos pelo validator do mês.
- A evidence inclui `pr`, `proof` e `neg` com resultados reais, sem `PASS` pré-preenchido.

#### Validação final

```bash
cd backend
node --test tests/regression/mf6-backend-regression.test.js

NODE_ENV=test \
E2E_SUITE_ID='mf4' \
E2E_RUN_ID='20260710t120000' \
RATE_LIMIT_PEPPER='faithflix-e2e-test-only-pepper-20260710' \
FRONTEND_ORIGINS='http://127.0.0.1:5173' \
TEST_MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0' \
TEST_MONGODB_DB_NAME='faithflix_mf4_20260710t120000_e2e' \
node --test tests/integration/mf6-billing-pool-transaction.integration.test.js

npm test
npm run smoke
```

Se o segundo ficheiro não existir, não executes um substituto: regista
`NAO_IMPLEMENTADO`. Se existir e o replica set não estiver disponível, regista
`BLOQUEADO_AMBIENTE` com o erro sanitizado.

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com o ficheiro de regressão.
- `proof-unit`: output real da regressão unitária, `npm test` e smoke.
- `proof-integration`: output atual da integração transacional, ou
  `NAO_IMPLEMENTADO`/`BLOQUEADO_AMBIENTE` sem os converter em `PASS`.
- `neg-unit`: email inválido, password curta, método de pagamento não
  documentado, progresso negativo, pedido admin anónimo e pedido admin comum.
- `neg-integration`: distribuição duplicada, rollback sob fault injection e
  replay idempotente, apenas quando a lane transacional existir.
- `coverage`: autenticação/cancelamento/reprodução/admin na lane unitária;
  criação/rollback/rotação exclusivamente na lane transacional.

#### Handoff

`BK-MF6-02` deve usar esta base para validar cliente API, rotas frontend, navegação principal, página de reprodução, conta, planos, associações, métricas admin e integrações admin.

`BK-MF6-03` deve rever segurança e privacidade sobre os mesmos fluxos, garantindo que sessão, roles, ownership, logs e dados sensíveis continuam protegidos.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com suite de regressão backend executável, comandos reais e evidence de gate S12.
- `2026-06-19`: versão anterior juntava na mesma alegação contratos unitários e
  cobertura transacional ainda não fornecida pelo guia.
- `2026-07-10`: separadas as lanes unitária e transacional; checkout, rollback e
  rotação exigem ficheiro de integração, replica set e output atual, permanecendo
  `NAO_IMPLEMENTADO` ou `BLOQUEADO_AMBIENTE` sem essa prova.
