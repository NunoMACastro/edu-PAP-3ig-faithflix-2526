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
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais criar uma suite de regressão backend para garantir que a API FaithFlix continua a cumprir os contratos críticos de `RNF29`: autenticação, criação e cancelamento de subscrições, reprodução básica de conteúdo e rotação mensal de associações.

O resultado final é o ficheiro `backend/tests/regression/mf6-backend-regression.test.js`, executado com `node --test`, e a evidence `docs/evidence/MF6/BK-MF6-01-regressao-backend.md` pronta para o gate S12.

#### Importância

Uma regressão acontece quando uma funcionalidade que já funcionava deixa de funcionar depois de uma alteração nova. Na MF6, a aplicação já tem identidade, streaming, subscrições, pagamentos simulados, pool solidária, privacidade, métricas e integrações admin. Um pequeno ajuste num validator, service ou router pode quebrar um fluxo antigo sem que a equipa repare durante a implementação.

`RNF29` não pede apenas testes de funções isoladas. O requisito pede testes automatizados para fluxos que representam valor real da aplicação: autenticar, criar/cancelar subscrição, registar progresso de reprodução e distribuir a pool por associações. Esta suite junta esses pontos num único ficheiro para o owner responder com segurança: "a regressão backend principal continua verde?".

#### Scope-in

- Criar uma suite de regressão backend com `node:test`.
- Validar autenticação por validators reais de email/password.
- Validar criação de subscrição através do checkout simulado aprovado.
- Validar cancelamento de renovação através do service real de subscrições.
- Validar reprodução básica através do payload real de progresso.
- Validar distribuição mensal com rotação real entre associações elegíveis.
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

Antes deste BK, o backend já tem testes unitários, testes de integração e smoke tests espalhados por macrofase. Falta uma suite de regressão MF6 que prove, num ponto único, que os fluxos mínimos de `RNF29` ainda funcionam depois das entregas de MF4 e MF5.

Depois deste BK, a equipa passa a ter uma regressão backend com cinco áreas: autenticação, subscrições, reprodução, pool solidária e endpoints admin entregues pela MF5. Esta prova alimenta `BK-MF6-02`, `BK-MF6-03` e o gate final de `BK-MF6-06`.

#### Pre-requisitos

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
- `DERIVADO`: a suite usa uma base em memória porque a regressão deve correr sem depender de MongoDB real, mas continua a chamar os services reais da app.
- Um teste de regressão deve ser curto, estável e repetível. Não serve para testar tudo; serve para bloquear quebras em pontos de alto risco.
- `node:test` é o runner nativo do Node.js. Nesta app evita dependências novas e mantém a suite no mesmo runtime usado pelo backend.
- Um service testado com base em memória continua a testar lógica real. A diferença é que os dados ficam em arrays controlados, para o teste ser rápido e determinístico.
- Em segurança e privacidade, negativos são tão importantes como positivos: validar rejeições evita aceitar input inseguro, estado impossível ou operação sem autorização.
- A regressão de endpoints admin não substitui testes de negócio de métricas e integrações. Ela garante que os routers continuam montados e que a barreira de role admin continua documentada para o gate.

#### Arquitetura do BK

| Camada | Decisão |
| --- | --- |
| Backend | `backend` |
| Test runner | `node --test` |
| Novo ficheiro | `tests/regression/mf6-backend-regression.test.js` |
| Dados de teste | Base em memória ligada por `setDbForTests` |
| Domínios cobertos | auth, payments/subscriptions, playback, charities/pool, admin metrics/integrations |
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

Criar um teste automatizado que protege os fluxos mínimos de `RNF29` e confirma o handoff backend de `BK-MF5-06`, sem ligar a serviços externos.

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
 * Protege os contratos mínimos de RNF29 usando validators, services e routers
 * reais da aplicação, mas com uma base de dados em memória controlada.
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
import { requireRole } from "../../src/modules/auth/auth.middleware.js";
import { createSimulatedCheckout } from "../../src/modules/payments/payments.service.js";
import { cancelRenewal } from "../../src/modules/subscriptions/subscriptions.service.js";
import { assertProgressPayload } from "../../src/modules/playback/playback.validation.js";
import { runMonthlyDistribution } from "../../src/modules/charities/pool-distribution.service.js";

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

test("subscrições cobrem criação por checkout simulado e cancelamento de renovação", async () => {
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
    subscriptions: collection([]),
    payment_attempts: collection([]),
    notification_preferences: collection([]),
    notifications: collection([]),
  });

  const checkout = await createSimulatedCheckout(String(userId), {
    planCode: "faithflix-monthly",
    paymentMethod: "card_test",
    simulateOutcome: "approved",
  });

  assert.equal(checkout.status, "approved");
  assert.equal(checkout.subscription.status, "active");
  assert.equal(collections.payment_attempts.rows.length, 1);
  assert.equal(collections.subscriptions.rows.length, 1);

  const canceled = await cancelRenewal(String(userId));
  // O cancelamento mantém acesso até ao fim do ciclo, mas impede renovação automática.
  assert.equal(canceled.subscription.cancelAtPeriodEnd, true);

  await assert.rejects(
    () =>
      createSimulatedCheckout(String(userId), {
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

test("pool solidária executa distribuição mensal e roda associações", async () => {
  const firstCharityId = new ObjectId();
  const secondCharityId = new ObjectId();
  setCollectionsForRegression({
    subscription_plans: collection([
      {
        _id: new ObjectId(),
        code: "faithflix-monthly",
        interval: "monthly",
        priceCents: 1000,
        solidaritySharePercent: 20,
        active: true,
      },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: new ObjectId(),
        planCode: "faithflix-monthly",
        status: "active",
        currentPeriodEnd: new Date("2099-01-01T00:00:00.000Z"),
      },
    ]),
    charities: collection([
      {
        _id: firstCharityId,
        name: "Associação Vida",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        _id: secondCharityId,
        name: "Associação Esperança",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-02-01T00:00:00.000Z"),
      },
    ]),
    pool_distributions: collection([]),
  });

  const june = await runMonthlyDistribution("2026-06", String(new ObjectId()));
  const july = await runMonthlyDistribution("2026-07", String(new ObjectId()));

  assert.equal(june.distribution.totalPoolCents, 200);
  assert.equal(june.distribution.items[0].charityId, String(firstCharityId));
  // A segunda distribuição começa na associação seguinte, provando rotação real.
  assert.equal(july.distribution.items[0].charityId, String(secondCharityId));

  await assert.rejects(
    () => runMonthlyDistribution("2026-07", String(new ObjectId())),
    /Distribuição deste mês já existe/,
  );
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

5. Explicação do código.

Este ficheiro usa código real da app, não contratos inventados. `assertValidEmail` e `assertValidPassword` validam a entrada de autenticação. `createSimulatedCheckout` cria uma tentativa de pagamento simulado e ativa a subscrição quando o resultado é aprovado. `cancelRenewal` prova o cancelamento de renovação sem apagar o acesso do ciclo atual. `assertProgressPayload` protege a reprodução básica, limitando o progresso à duração real. `runMonthlyDistribution` executa a distribuição mensal e prova que a rotação muda a primeira associação entre meses.

A base em memória existe para substituir o MongoDB real durante a suite. Ela implementa apenas a subset usada pelos services: `findOne`, `find`, `insertOne`, `updateOne` e `findOneAndUpdate`. Isto evita dependência externa, mas continua a chamar os services reais, que são os pontos onde regressões de domínio normalmente aparecem.

O teste final fecha o handoff de `BK-MF5-06`: confirma que `/api/admin/metrics` e `/api/admin/integrations` continuam montados na aplicação e que o middleware `requireRole(["admin"])` rejeita pedidos anónimos ou de utilizadores comuns. Assim, a regressão não ignora os últimos endpoints admin entregues antes da MF6.

Os dados entram como objetos de teste controlados: `userId`, plano mensal, subscrições, associações e pedidos de checkout. Os dados saem como objetos públicos dos services. As validações acontecem nos validators e nos services; a regra de segurança principal é nunca aceitar ownership ou role vindos do frontend como autoridade final.

6. Validação do passo.

```bash
cd backend
node --test tests/regression/mf6-backend-regression.test.js
```

Resultado esperado: 5 testes passados e zero falhas.

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

Sem código neste passo. O passo é de validação operacional e usa os scripts já definidos no package do backend.

5. Explicação do código.

Não existe código novo porque a app já expõe `npm test` e `npm run smoke`. A decisão correta é reutilizar os scripts oficiais, para a equipa não criar dois caminhos diferentes de validação.

`npm test` confirma que a regressão nova não entrou em conflito com testes unitários e de integração anteriores. `npm run smoke` confirma que a app Express ainda arranca e responde ao essencial. Se o ambiente local bloquear abertura de portas, regista o erro exato e volta a correr o smoke num terminal com permissão de rede local.

6. Validação do passo.

```bash
cd backend
npm test
npm run smoke
```

Resultado esperado: os testes unitários, integração, regressão e smoke existentes passam sem falhas.

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

- Owner: Kaue
- Apoio: Matheus
- Data da execução: PREENCHER_COM_DATA_REAL
- Requisito: RNF29
- Branch/entrega: PREENCHER_COM_REFERENCIA_REAL

## Proof

| Comando | Resultado real |
| --- | --- |
| `node --test tests/regression/mf6-backend-regression.test.js` | PREENCHER_COM_OUTPUT_REAL |
| `npm test` | PREENCHER_COM_OUTPUT_REAL |
| `npm run smoke` | PREENCHER_COM_OUTPUT_REAL |

## Cobertura

| Área RNF29 | Prova esperada |
| --- | --- |
| Autenticação | Email normalizado, password mínima e rejeições HTTP 400 |
| Criação de subscrição | Checkout simulado aprovado cria subscrição ativa |
| Cancelamento de subscrição | `cancelRenewal` mantém o ciclo atual e marca `cancelAtPeriodEnd=true` |
| Reprodução básica | Progresso é limitado à duração e negativo é rejeitado |
| Rotação de associações | Segunda distribuição começa na associação seguinte |
| Handoff MF5 | `/api/admin/metrics` e `/api/admin/integrations` continuam montados e protegidos |

## Negativos

| Cenário | Resultado esperado |
| --- | --- |
| Email inválido | Erro HTTP 400 |
| Password curta | Erro HTTP 400 |
| Método de pagamento não documentado | Erro de validação |
| Progresso negativo | Erro HTTP 400 |
| Distribuição duplicada no mesmo mês | Erro de conflito |
| Pedido admin anónimo | HTTP 401 |
| Pedido admin com role comum | HTTP 403 |

## Observações

A suite usa base em memória e não grava dados reais. Não foram usados cartões reais, tokens externos, gateways de pagamento, serviços externos de vídeo ou IA avançada.
```

5. Explicação do código.

Este ficheiro não é código executável; é evidence. Ele liga requisito, owner, comandos, cobertura, negativos e resultados reais. A diferença importante é que o ficheiro não vem com `PASS` preenchido: o aluno só pode fechar a evidence depois de executar os comandos.

A tabela de cobertura mapeia cada parte de `RNF29` para uma prova observável. Isto evita uma evidência vaga como "regressão feita" e ajuda o orientador a confirmar se subscrições, reprodução e pool solidária ficaram realmente cobertas.

6. Validação do passo.

Confirma que os três comandos têm output real, que a data corresponde à execução e que o ficheiro não contém passwords, cookies, dados pessoais, valores de ambiente ou segredos.

7. Cenário negativo/erro esperado.

Se algum comando ficar com `PREENCHER_COM_OUTPUT_REAL`, o BK não pode ser fechado como `DONE`. O estado correto é manter o BK aberto até existir proof reproduzível.

### Passo 4 - Preparar handoff para regressão frontend

1. Objetivo funcional do passo no contexto da app.

Entregar ao owner do próximo BK uma lista clara do que o frontend deve proteger com base na regressão backend.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-02-suite-de-regressao-frontend.md`
    - LOCALIZAÇÃO: secção `Handoff`

3. Instruções do que fazer.

No fecho do PR ou entrega local, comunica que o backend validou autenticação, checkout simulado, subscrição ativa, cancelamento de renovação, progresso de reprodução, distribuição da pool e endpoints admin de métricas/integrações.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O passo é de coordenação técnica entre BKs.

5. Explicação do código.

O handoff evita duplicação. O frontend não precisa voltar a testar a rotação interna da pool nem o cálculo de subscrição, mas deve confirmar que as páginas chamam as rotas certas, usam `credentials: "include"` quando há sessão por cookie e apresentam estados de loading, erro, vazio e sucesso.

Este handoff também prepara `BK-MF6-03`: segurança e privacidade devem rever os mesmos fluxos protegidos pela regressão, sobretudo sessão, roles admin, dados de subscrição, progresso de reprodução e pool solidária.

6. Validação do passo.

O handoff está completo quando `BK-MF6-02` consegue listar as páginas e chamadas API que dependem destes contratos backend: login/sessão, planos, reprodução, associações, métricas admin e integrações admin.

7. Cenário negativo/erro esperado.

Se a equipa não souber dizer que fluxo backend protege cada página frontend, existe risco de regressão cruzada. Regista a lacuna na evidence antes de avançar.

#### Critérios de aceite

- A suite `tests/regression/mf6-backend-regression.test.js` existe e executa com `node --test`.
- A suite cobre autenticação, criação/cancelamento de subscrições, reprodução básica e rotação mensal.
- A suite confirma que `/api/admin/metrics` e `/api/admin/integrations` continuam montados e protegidos por role admin.
- A base de dados usada na suite é em memória e não toca em MongoDB real.
- `npm test` e `npm run smoke` foram executados e registados.
- Existem negativos para autenticação, subscrição, reprodução, pool e autorização admin.
- A evidence inclui `pr`, `proof` e `neg` com resultados reais, sem `PASS` pré-preenchido.

#### Validação final

```bash
cd backend
node --test tests/regression/mf6-backend-regression.test.js
npm test
npm run smoke
```

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega local com o ficheiro de regressão.
- `proof`: output real dos três comandos de validação.
- `neg`: email inválido, password curta, método de pagamento não documentado, progresso negativo, distribuição duplicada, pedido admin anónimo e pedido admin com role comum.
- `coverage`: autenticação, subscrições, reprodução, rotação de associações e endpoints admin herdados de `BK-MF5-06`.

#### Handoff

`BK-MF6-02` deve usar esta base para validar cliente API, rotas frontend, navegação principal, página de reprodução, conta, planos, associações, métricas admin e integrações admin.

`BK-MF6-03` deve rever segurança e privacidade sobre os mesmos fluxos, garantindo que sessão, roles, ownership, logs e dados sensíveis continuam protegidos.

#### Changelog

- `2026-04-13`: guia inicial criado em formato genérico.
- `2026-06-18`: guia revisto com suite de regressão backend executável, comandos reais e evidence de gate S12.
- `2026-06-19`: suite corrigida para cobrir criação/cancelamento real de subscrições, rotação real da pool, endpoints admin herdados de MF5 e evidence sem resultados pré-preenchidos.
