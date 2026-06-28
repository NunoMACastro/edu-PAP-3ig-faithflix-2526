/**
 * @file Suite de regressao backend da MF6.
 *
 * Protege os contratos minimos de RNF29 usando validators, services e routers
 * reais da aplicacao, mas com uma base de dados em memoria controlada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { createApp } from "../../src/app.js";
import { setDbForTests } from "../../src/config/database.js";
import { requireRole } from "../../src/modules/auth/auth.middleware.js";
import {
    assertValidEmail,
    assertValidPassword,
} from "../../src/modules/auth/auth.validation.js";
import { listPublishedCatalog } from "../../src/modules/catalog/catalog.service.js";
import { runMonthlyDistribution } from "../../src/modules/charities/pool-distribution.service.js";
import { createSimulatedCheckout } from "../../src/modules/payments/payments.service.js";
import { assertProgressPayload } from "../../src/modules/playback/playback.validation.js";
import { cancelRenewal } from "../../src/modules/subscriptions/subscriptions.service.js";

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
 * Le um campo simples ou aninhado de um documento em memoria.
 *
 * @param {Record<string, unknown>} row Documento consultado.
 * @param {string} path Caminho no formato `campo.subcampo`.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
    return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Compara um valor real com uma condicao MongoDB usada nos services testados.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condicao esperada.
 * @returns {boolean} Resultado da comparacao.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return sameId(actual, expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$gt" in expected && actual <= expected.$gt) return false;
        if ("$gte" in expected && actual < expected.$gte) return false;
        if ("$lte" in expected && actual > expected.$lte) return false;
        if ("$exists" in expected) {
            return (actual !== undefined) === expected.$exists;
        }

        return true;
    }

    return actual === expected;
}

/**
 * Aplica uma query simples aos documentos guardados em memoria.
 *
 * @param {Record<string, unknown>} row Documento consultado.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} `true` quando o documento cumpre a query.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        const actual = valueForPath(row, key);

        if (Array.isArray(actual)) {
            return actual.some((entry) => matchesValue(entry, expected));
        }

        return matchesValue(actual, expected);
    });
}

/**
 * Cria comparador para a subset de `sort` usada pelos services.
 *
 * @param {Record<string, 1 | -1>} sort Ordenacao simplificada.
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
 * Aplica operadores de atualizacao MongoDB suficientes para esta regressao.
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
 * Cria uma colecao em memoria compativel com a subset MongoDB usada na suite.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, unknown>} Colecao de teste.
 */
function collection(rows = []) {
    return {
        rows,

        async createIndex() {},

        /**
         * Procura o primeiro documento que cumpre a query.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @param {{ sort?: Record<string, 1 | -1> }} options Opcoes simplificadas.
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
         * @returns {{ sort: Function, limit: Function, toArray: Function }} Cursor fake.
         */
        find(query = {}) {
            let result = rows.filter((row) => matches(row, query));

            return {
                /**
                 * Ordena os documentos em memoria.
                 *
                 * @param {Record<string, 1 | -1>} sort Ordenacao simplificada.
                 * @returns {object} Cursor fake.
                 */
                sort(sort = {}) {
                    result = [...result].sort(compareBySort(sort));
                    return this;
                },

                /**
                 * Avanca documentos para simular paginacao MongoDB.
                 *
                 * @param {number} skip Numero de documentos a ignorar.
                 * @returns {object} Cursor fake.
                 */
                skip(skip) {
                    result = result.slice(skip);
                    return this;
                },

                /**
                 * Limita o numero de documentos devolvidos.
                 *
                 * @param {number} limit Limite pretendido.
                 * @returns {object} Cursor fake.
                 */
                limit(limit) {
                    result = result.slice(0, limit);
                    return this;
                },

                /**
                 * Materializa o cursor em array.
                 *
                 * @returns {Promise<Record<string, unknown>[]>} Documentos encontrados.
                 */
                async toArray() {
                    return result;
                },
            };
        },

        /**
         * Conta documentos que cumprem a query.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {Promise<number>} Total de documentos encontrados.
         */
        async countDocuments(query = {}) {
            return rows.filter((row) => matches(row, query)).length;
        },

        /**
         * Insere um documento e devolve o id gerado.
         *
         * @param {Record<string, unknown>} document Documento a inserir.
         * @returns {Promise<{ insertedId: ObjectId }>} Resultado de insercao.
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
         * @param {{ upsert?: boolean }} options Opcoes de update.
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
 * Instala colecoes em memoria atraves do helper oficial de testes.
 *
 * @param {Record<string, ReturnType<typeof collection>>} collections Colecoes iniciais.
 * @returns {Record<string, ReturnType<typeof collection>>} Colecoes instaladas.
 */
function setCollectionsForRegression(collections) {
    setDbForTests({
        /**
         * Devolve uma colecao existente ou cria uma vazia para o service real.
         *
         * @param {string} name Nome da colecao pedida.
         * @returns {ReturnType<typeof collection>} Colecao fake.
         */
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });

    return collections;
}

/**
 * Confirma que uma funcao lanca erro HTTP previsivel.
 *
 * @param {() => unknown} action Acao que deve falhar.
 * @param {number} statusCode Codigo HTTP esperado.
 * @returns {void}
 */
function assertHttpFailure(action, statusCode) {
    assert.throws(action, (error) => {
        assert.equal(error.statusCode ?? error.status, statusCode);
        return true;
    });
}

/**
 * Simula uma resposta Express para testar middlewares de autorizacao.
 *
 * @returns {{ response: object, state: { statusCode: number, body: unknown } }} Duplo de resposta.
 */
function createResponseDouble() {
    const state = { statusCode: 200, body: null };
    const response = {
        status(code) {
            state.statusCode = code;
            return response;
        },
        json(body) {
            state.body = body;
            return response;
        },
    };

    return { response, state };
}

afterEach(() => {
    setDbForTests(null);
});

test("auth mantem email normalizado e password minima", () => {
    assert.equal(
        assertValidEmail("  ALUNO@FAITHFLIX.TEST "),
        "aluno@faithflix.test",
    );
    assert.equal(
        assertValidPassword("palavra-passe-segura"),
        "palavra-passe-segura",
    );

    assertHttpFailure(() => assertValidEmail("email-invalido"), 400);
    assertHttpFailure(() => assertValidPassword("curta"), 400);
});

test("subscricoes cobrem criacao por checkout simulado e cancelamento de renovacao", async () => {
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
    // O cancelamento preserva o acesso do ciclo atual e bloqueia renovacao automatica.
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

test("playback limita progresso ao tamanho real do conteudo", () => {
    const progress = assertProgressPayload({ currentTimeSeconds: 130 }, 120);

    assert.deepEqual(progress, {
        currentTimeSeconds: 120,
        durationSeconds: 120,
        completed: true,
    });

    assertHttpFailure(
        () => assertProgressPayload({ currentTimeSeconds: -1 }, 120),
        400,
    );
});

test("catalogo publico pagina itens publicados sem expor rascunhos", async () => {
    setCollectionsForRegression({
        contents: collection([
            {
                _id: new ObjectId(),
                title: "Primeiro publicado",
                slug: "primeiro-publicado",
                synopsis: "Conteudo publicado usado para medir paginação.",
                type: "movie",
                status: "published",
                publishedAt: new Date("2026-06-01T00:00:00.000Z"),
            },
            {
                _id: new ObjectId(),
                title: "Segundo publicado",
                slug: "segundo-publicado",
                synopsis: "Outro conteudo publicado usado na segunda pagina.",
                type: "movie",
                status: "published",
                publishedAt: new Date("2026-06-02T00:00:00.000Z"),
            },
            {
                _id: new ObjectId(),
                title: "Rascunho interno",
                slug: "rascunho-interno",
                synopsis: "Conteudo que nao pode entrar no catalogo publico.",
                type: "movie",
                status: "draft",
                publishedAt: null,
            },
        ]),
    });

    const page = await listPublishedCatalog({ page: "1", limit: "1" });

    assert.equal(page.page, 1);
    assert.equal(page.limit, 1);
    assert.equal(page.total, 2);
    assert.equal(page.items.length, 1);
    assert.equal(page.items[0].slug, "segundo-publicado");

    await assert.rejects(
        () => listPublishedCatalog({ limit: "100" }),
        /Limite invalido/,
    );
});

test("pool solidaria executa distribuicao mensal e roda associacoes", async () => {
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
                name: "Associacao Vida",
                status: "active",
                poolStatus: "eligible",
                approvedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            {
                _id: secondCharityId,
                name: "Associacao Esperanca",
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
    // A segunda distribuicao comeca na associacao seguinte, provando rotacao real.
    assert.equal(july.distribution.items[0].charityId, String(secondCharityId));

    await assert.rejects(
        () => runMonthlyDistribution("2026-07", String(new ObjectId())),
        /Distribuição deste mês já existe/,
    );
});

test("endpoints admin herdados da MF5 continuam montados e exigem role admin", () => {
    const mountedRouters = createApp()._router.stack.filter((layer) => layer.regexp);

    assert.ok(
        mountedRouters.some((layer) => layer.regexp.test("/api/admin/metrics")),
    );
    assert.ok(
        mountedRouters.some((layer) =>
            layer.regexp.test("/api/admin/integrations"),
        ),
    );

    const adminOnly = requireRole(["admin"]);
    const anonymous = createResponseDouble();
    adminOnly({}, anonymous.response, () => {
        assert.fail("Anonimo nao pode avancar");
    });
    assert.equal(anonymous.state.statusCode, 401);

    const normalUser = createResponseDouble();
    adminOnly({ user: { role: "user" } }, normalUser.response, () => {
        assert.fail("Utilizador comum nao pode avancar");
    });
    assert.equal(normalUser.state.statusCode, 403);
});
