/**
 * @file Regressao MF8 para auditoria administrativa final.
 *
 * A suite valida a superficie administrativa sem criar novas capacidades:
 * visitantes e utilizadores comuns continuam bloqueados, enquanto operacoes
 * administrativas criticas ja existentes mantem auditoria segura.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { sessionConfig } from "../../src/config/session.js";
import { hashToken } from "../../src/modules/auth/token.js";
import { updateIntegrationSetting } from "../../src/modules/integrations/integrations.service.js";
import { updateUserByAdmin } from "../../src/modules/users/user.service.js";
import { startTestServer } from "../helpers/test-server.js";

const userSessionToken = "a".repeat(64);

const testIds = {
    regularUser: new ObjectId("64f800000000000000000001"),
    adminUser: new ObjectId("64f800000000000000000002"),
    targetUser: new ObjectId("64f800000000000000000003"),
};

let collections;
let testServer;

/**
 * Compara ids MongoDB por valor textual.
 *
 * @param {unknown} left Primeiro id.
 * @param {unknown} right Segundo id.
 * @returns {boolean} Verdadeiro quando representam o mesmo id.
 */
function sameId(left, right) {
    return String(left) === String(right);
}

/**
 * Le valores aninhados atraves de caminhos `campo.subcampo`.
 *
 * @param {Record<string, unknown>} row Documento em memoria.
 * @param {string} path Caminho a consultar.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
    return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Aplica operadores MongoDB usados pelos services administrativos.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, unknown>} update Operadores de update.
 * @param {boolean} isInsert Indica se e um upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
    Object.assign(row, update.$set ?? {});

    if (isInsert) {
        Object.assign(row, update.$setOnInsert ?? {});
    }

    return row;
}

/**
 * Converte um filtro simples na base de documento de upsert.
 *
 * @param {Record<string, unknown>} filter Filtro MongoDB simplificado.
 * @returns {Record<string, unknown>} Campos seguros para documento novo.
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
 * Compara um valor com os operadores usados nesta suite.
 *
 * @param {unknown} actual Valor real.
 * @param {unknown} expected Condicao esperada.
 * @returns {boolean} Resultado da comparacao.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return sameId(actual, expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$gt" in expected && actual <= expected.$gt) return false;
        if ("$ne" in expected && actual === expected.$ne) return false;
        if ("$exists" in expected) {
            return (actual !== undefined) === expected.$exists;
        }

        return true;
    }

    return actual === expected;
}

/**
 * Verifica se um documento satisfaz uma query MongoDB minima.
 *
 * @param {Record<string, unknown>} row Documento em memoria.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} Verdadeiro quando corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") {
            return expected.some((nested) => matches(row, nested));
        }

        return matchesValue(valueForPath(row, key), expected);
    });
}

/**
 * Cria uma colecao fake com a subset MongoDB necessaria para os checks MF8.
 *
 * @param {Record<string, unknown>[]} initialRows Documentos iniciais.
 * @returns {Record<string, Function> & { rows: Record<string, unknown>[] }} Colecao fake.
 */
function collection(initialRows = []) {
    let rows = initialRows;

    return {
        rows,

        /**
         * Procura um documento por query.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {Promise<Record<string, unknown> | null>} Documento encontrado.
         */
        async findOne(query = {}) {
            return rows.find((row) => matches(row, query)) ?? null;
        },

        /**
         * Atualiza o primeiro documento e devolve o estado final.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @returns {Promise<Record<string, unknown> | null>} Documento final.
         */
        async findOneAndUpdate(filter, update) {
            const existing = rows.find((row) => matches(row, filter));

            if (!existing) {
                return null;
            }

            return applyUpdate(existing, update, false);
        },

        /**
         * Atualiza ou cria documento quando o service pede upsert.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @param {{ upsert?: boolean }} options Opcoes MongoDB.
         * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Resultado fake.
         */
        async updateOne(filter, update, options = {}) {
            const existing = rows.find((row) => matches(row, filter));

            if (existing) {
                applyUpdate(existing, update, false);
                return { matchedCount: 1, modifiedCount: 1 };
            }

            if (options.upsert) {
                rows.push(applyUpdate(rowFromFilter(filter), update, true));
                this.rows = rows;
            }

            return { matchedCount: 0, modifiedCount: 0 };
        },

        /**
         * Insere documento novo.
         *
         * @param {Record<string, unknown>} document Documento a inserir.
         * @returns {Promise<{ insertedId: ObjectId }>} Resultado fake.
         */
        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            this.rows = rows;
            return { insertedId };
        },

        /**
         * Remove documentos que correspondam ao filtro.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @returns {Promise<{ deletedCount: number }>} Resultado fake.
         */
        async deleteMany(filter) {
            const before = rows.length;
            rows = rows.filter((row) => !matches(row, filter));
            this.rows = rows;
            return { deletedCount: before - rows.length };
        },

        /**
         * Lista documentos com cursor simplificado.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {{ toArray: () => Promise<Record<string, unknown>[]> }} Cursor fake.
         */
        find(query = {}) {
            const result = rows.filter((row) => matches(row, query));

            return {
                async toArray() {
                    return result;
                },
            };
        },
    };
}

/**
 * Instala DB fake com utilizador comum, admin e alvo administrativo.
 *
 * @returns {Record<string, ReturnType<typeof collection>>} Colecoes instaladas.
 */
function installTestDatabase() {
    collections = {
        users: collection([
            {
                _id: testIds.regularUser,
                name: "Utilizador comum",
                email: "user@example.test",
                role: "user",
                accountStatus: "active",
            },
            {
                _id: testIds.adminUser,
                name: "Admin",
                email: "admin@example.test",
                role: "admin",
                accountStatus: "active",
            },
            {
                _id: testIds.targetUser,
                name: "Conta auditada",
                email: "target@example.test",
                role: "user",
                accountStatus: "active",
            },
        ]),
        sessions: collection([
            {
                _id: new ObjectId("64f800000000000000000010"),
                userId: testIds.regularUser,
                tokenHash: hashToken(userSessionToken),
                expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            },
        ]),
        admin_audit_logs: collection([]),
        integration_settings: collection([]),
    };

    setDbForTests({
        /**
         * Devolve a colecao pedida e cria uma vazia quando nao existe.
         *
         * @param {string} name Nome da colecao.
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
 * Executa pedido HTTP contra o servidor de teste.
 *
 * @param {{ method?: string, path: string, userCookie?: boolean, body?: Record<string, unknown> }} input Pedido.
 * @returns {Promise<Response>} Resposta fetch.
 */
function requestAdminSurface({ method = "GET", path, userCookie = false, body }) {
    const headers = {
        "content-type": "application/json",
    };

    if (userCookie) {
        headers.cookie = `${sessionConfig.cookieName}=${userSessionToken}`;
    }

    return fetch(`${testServer.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

before(async () => {
    installTestDatabase();
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }

    setDbForTests(null);
});

test("MF8 auditoria admin bloqueia visitantes e utilizadores comuns", async () => {
    const surfaces = [
        { method: "GET", path: "/api/users" },
        { method: "GET", path: "/api/admin/metrics" },
        { method: "GET", path: "/api/admin/integrations" },
        { method: "GET", path: "/api/catalog/admin" },
        { method: "GET", path: "/api/charities/applications" },
        { method: "GET", path: "/api/charities/pool/dashboard" },
        {
            method: "POST",
            path: "/api/charities/pool/distributions",
            body: { month: "2026-06" },
        },
        {
            method: "PATCH",
            path: "/api/admin/integrations/simulated_payments",
            body: { enabled: false, mode: "disabled", publicConfig: {} },
        },
    ];

    for (const surface of surfaces) {
        const anonymous = await requestAdminSurface(surface);
        assert.equal(
            anonymous.status,
            401,
            `${surface.method} ${surface.path} deve exigir sessao`,
        );

        const regularUser = await requestAdminSurface({
            ...surface,
            userCookie: true,
        });
        assert.equal(
            regularUser.status,
            403,
            `${surface.method} ${surface.path} deve recusar role user`,
        );
    }
});

test("MF8 operacoes admin criticas mantem logs sem segredos", async () => {
    const updatedUser = await updateUserByAdmin(
        String(testIds.adminUser),
        String(testIds.targetUser),
        { role: "moderator" },
    );
    const integration = await updateIntegrationSetting(
        String(testIds.adminUser),
        "simulated_payments",
        {
            enabled: false,
            mode: "disabled",
            publicConfig: { label: "MVP auditado" },
        },
    );

    assert.equal(updatedUser.role, "moderator");
    assert.equal(integration.enabled, false);
    assert.equal(collections.admin_audit_logs.rows.length, 2);
    assert.deepEqual(
        collections.admin_audit_logs.rows.map((row) => row.action),
        ["user.admin_update", "integration.update"],
    );

    const serializedLogs = JSON.stringify(collections.admin_audit_logs.rows);
    const forbiddenFragments = [
        "passwordHash",
        "authorization",
        "cookie",
        "Bearer ",
        "sk_live",
        "mongodb://",
    ];

    for (const fragment of forbiddenFragments) {
        assert.equal(
            serializedLogs.includes(fragment),
            false,
            `admin_audit_logs nao deve expor ${fragment}`,
        );
    }
});
