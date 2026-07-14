/**
 * @file Provas transacionais das cinco mutações administrativas bíblicas.
 *
 * O double local preserva ObjectIds/datas, aplica rollback por snapshot e
 * regista a sessão recebida por cada operação. Não abre sockets nem liga a DB.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    deleteCatalogBiblicalPassage,
    patchBiblicalPassage,
    patchBiblicalPassageStatus,
    postBiblicalPassage,
    postCatalogBiblicalPassage,
} from "../../src/modules/biblical-passages/biblical-passages.controller.js";

const ACTOR_ID = new ObjectId();
const CONTENT_ID = new ObjectId();
const PASSAGE_ID = new ObjectId();
const REQUEST_ID = "req-biblical-transaction";
const INITIAL_TEXT = "Texto biblico inicial que nao pode entrar no audit log.";
const UPDATED_TEXT = "Texto biblico atualizado que tambem fica fora do audit log.";
const PRIVATE_NOTE = "Nota privada com contacto pessoa@example.test.";
const CREATED_AT = new Date("2026-07-10T09:00:00.000Z");

const initialPayload = {
    book: "Joao",
    chapterStart: 3,
    verseStart: 16,
    chapterEnd: 3,
    verseEnd: 16,
    translation: "Parafrase",
    text: INITIAL_TEXT,
    theme: "amor",
    reflection: "Reflexao inicial privada do editor.",
};

const updatedPayload = {
    ...initialPayload,
    verseEnd: 17,
    text: UPDATED_TEXT,
    theme: "esperanca",
    reflection: "Reflexao atualizada privada do editor.",
};

/**
 * Copia documentos sem perder os tipos usados pelo driver MongoDB.
 *
 * @param {unknown} value Valor a copiar.
 * @returns {unknown} Cópia independente.
 */
function cloneValue(value) {
    if (value instanceof ObjectId) {
        return new ObjectId(value.toHexString());
    }

    if (value instanceof Date) {
        return new Date(value);
    }

    if (Array.isArray(value)) {
        return value.map(cloneValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [
                key,
                cloneValue(nested),
            ]),
        );
    }

    return value;
}

/**
 * Compara o subset de filtros usado pelo serviço bíblico.
 *
 * @param {Record<string, unknown>} row Documento candidato.
 * @param {Record<string, unknown>} query Filtro plano.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (expected instanceof ObjectId) {
            return String(row[key]) === String(expected);
        }

        return row[key] === expected;
    });
}

/**
 * Aplica os operadores de escrita necessários aos cenários.
 *
 * @param {Record<string, unknown>} row Documento a alterar.
 * @param {Record<string, Record<string, unknown>>} update Update MongoDB.
 * @param {boolean} isInsert Indica um upsert novo.
 * @returns {void}
 */
function applyUpdate(row, update, isInsert = false) {
    if (isInsert) {
        Object.assign(row, cloneValue(update.$setOnInsert ?? {}));
    }

    Object.assign(row, cloneValue(update.$set ?? {}));
}

/**
 * Cria uma base transacional in-memory com fault injection no audit.
 *
 * @param {Record<string, Record<string, unknown>[]>} initialState Estado inicial.
 * @returns {{ db: object, state: Record<string, Record<string, unknown>[]>, control: { failAuditWrites: boolean, operations: object[] } }} Harness.
 */
function createTransactionalDb(initialState = {}) {
    const state = cloneValue(initialState);
    const control = {
        failAuditWrites: false,
        operations: [],
    };

    /**
     * Obtém a lista atual de uma coleção.
     *
     * @param {string} name Nome da coleção.
     * @returns {Record<string, unknown>[]} Documentos atuais.
     */
    function rowsFor(name) {
        state[name] ??= [];
        return state[name];
    }

    /**
     * Restaura o snapshot integral depois de uma falha.
     *
     * @param {Record<string, Record<string, unknown>[]>} snapshot Estado anterior.
     * @returns {void}
     */
    function restore(snapshot) {
        for (const name of Object.keys(state)) {
            if (!(name in snapshot)) delete state[name];
        }

        for (const [name, rows] of Object.entries(snapshot)) {
            state[name] = cloneValue(rows);
        }
    }

    /**
     * Regista a sessão observada sem incluir payloads.
     *
     * @param {string} collection Coleção acedida.
     * @param {string} operation Operação realizada.
     * @param {Record<string, unknown>} options Opções MongoDB.
     * @returns {void}
     */
    function record(collection, operation, options = {}) {
        control.operations.push({
            collection,
            operation,
            session: options.session,
        });
    }

    const db = {
        /**
         * Executa o trabalho e restaura todas as coleções quando existe erro.
         *
         * @param {(context: { db: object, session: object }) => Promise<unknown>} work Unidade atómica.
         * @returns {Promise<unknown>} Resultado confirmado.
         */
        async runInTransaction(work) {
            const snapshot = cloneValue(state);
            const session = { transaction: new ObjectId() };

            try {
                return await work({ db, session });
            } catch (error) {
                restore(snapshot);
                throw error;
            }
        },

        /**
         * Implementa apenas o subset MongoDB exigido pelo serviço sob teste.
         *
         * @param {string} name Nome da coleção.
         * @returns {object} Collection double.
         */
        collection(name) {
            return {
                async createIndex() {
                    return `${name}_index`;
                },

                async findOne(query = {}, options = {}) {
                    record(name, "findOne", options);
                    const row = rowsFor(name).find((entry) =>
                        matches(entry, query),
                    );
                    return row ? cloneValue(row) : null;
                },

                async insertOne(document, options = {}) {
                    record(name, "insertOne", options);

                    if (name === "admin_audit_logs" && control.failAuditWrites) {
                        throw new Error("injected biblical audit failure");
                    }

                    const insertedId = document._id ?? new ObjectId();
                    rowsFor(name).push(
                        cloneValue({ ...document, _id: insertedId }),
                    );
                    return { insertedId };
                },

                async findOneAndUpdate(filter, update, options = {}) {
                    record(name, "findOneAndUpdate", options);
                    const row = rowsFor(name).find((entry) =>
                        matches(entry, filter),
                    );

                    if (!row) return null;

                    const before = cloneValue(row);
                    applyUpdate(row, update);
                    return options.returnDocument === "before"
                        ? before
                        : cloneValue(row);
                },

                async updateOne(filter, update, options = {}) {
                    record(name, "updateOne", options);
                    let row = rowsFor(name).find((entry) =>
                        matches(entry, filter),
                    );

                    if (row) {
                        applyUpdate(row, update);
                        return { matchedCount: 1, modifiedCount: 1 };
                    }

                    if (!options.upsert) {
                        return { matchedCount: 0, modifiedCount: 0 };
                    }

                    row = cloneValue(filter);
                    applyUpdate(row, update, true);
                    rowsFor(name).push(row);
                    return {
                        matchedCount: 0,
                        modifiedCount: 0,
                        upsertedId: row._id,
                    };
                },

                async deleteOne(filter, options = {}) {
                    record(name, "deleteOne", options);
                    const index = rowsFor(name).findIndex((entry) =>
                        matches(entry, filter),
                    );

                    if (index === -1) return { deletedCount: 0 };

                    rowsFor(name).splice(index, 1);
                    return { deletedCount: 1 };
                },
            };
        },
    };

    return { db, state, control };
}

/**
 * Cria um documento completo de passagem já persistida.
 *
 * @param {Record<string, unknown>} [overrides] Alterações do cenário.
 * @returns {Record<string, unknown>} Documento inicial.
 */
function passageDocument(overrides = {}) {
    return {
        _id: PASSAGE_ID,
        ...initialPayload,
        status: "draft",
        createdBy: ACTOR_ID,
        updatedBy: ACTOR_ID,
        publishedAt: null,
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        ...overrides,
    };
}

/**
 * Cria uma associação existente para os cenários de remoção.
 *
 * @returns {Record<string, unknown>} Associação inicial.
 */
function associationDocument() {
    return {
        _id: new ObjectId(),
        contentId: CONTENT_ID,
        passageId: PASSAGE_ID,
        note: PRIVATE_NOTE,
        sortOrder: 2,
        createdBy: ACTOR_ID,
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
    };
}

/**
 * Simula apenas a parte encadeável de uma resposta Express.
 *
 * @returns {{ statusCode: number, body: unknown, status: Function, json: Function }} Resposta observável.
 */
function responseDouble() {
    return {
        statusCode: 0,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

/**
 * Cria o pedido administrativo comum aos controllers.
 *
 * @param {Record<string, unknown>} values Campos específicos do cenário.
 * @returns {Record<string, unknown>} Request double.
 */
function requestDouble(values = {}) {
    return {
        id: REQUEST_ID,
        user: { id: String(ACTOR_ID), role: "admin" },
        params: {},
        body: {},
        ...values,
    };
}

/**
 * Garante que a mutação e o audit receberam a mesma sessão transacional.
 *
 * @param {{ operations: object[] }} control Registo do harness.
 * @param {string} domainCollection Coleção de domínio.
 * @param {string} domainOperation Operação mutável.
 * @returns {void}
 */
function assertSharedSession(control, domainCollection, domainOperation) {
    const domainWrite = control.operations.find(
        (entry) =>
            entry.collection === domainCollection &&
            entry.operation === domainOperation,
    );
    const auditWrite = control.operations.find(
        (entry) =>
            entry.collection === "admin_audit_logs" &&
            entry.operation === "insertOne",
    );

    assert.ok(domainWrite?.session, "a mutacao deve receber uma sessao");
    assert.ok(auditWrite?.session, "o audit deve receber uma sessao");
    assert.strictEqual(domainWrite.session, auditWrite.session);

    for (const operation of control.operations.filter(
        (entry) => entry.session !== undefined,
    )) {
        assert.strictEqual(operation.session, auditWrite.session);
    }
}

/**
 * Confirma actor/requestId e ausência de conteúdo livre no audit.
 *
 * @param {Record<string, unknown>} audit Evento persistido.
 * @returns {void}
 */
function assertSafeAudit(audit) {
    assert.equal(String(audit.actorUserId), String(ACTOR_ID));
    assert.equal(audit.requestId, REQUEST_ID);

    const serialized = JSON.stringify(audit);
    assert.equal(serialized.includes(INITIAL_TEXT), false);
    assert.equal(serialized.includes(UPDATED_TEXT), false);
    assert.equal(serialized.includes(PRIVATE_NOTE), false);
    assert.equal(serialized.includes("pessoa@example.test"), false);
}

/**
 * Confirma que os snapshots usam apenas a allowlist mínima do domínio.
 *
 * @param {Record<string, unknown>} audit Evento persistido.
 * @param {"passage" | "association"} kind Tipo de alvo auditado.
 * @returns {void}
 */
function assertMinimalAuditSnapshots(audit, kind) {
    const allowedKeys =
        kind === "passage"
            ? [
                  "hasTheme",
                  "id",
                  "reference",
                  "reflectionLength",
                  "status",
                  "textLength",
                  "translation",
              ]
            : ["contentId", "hasNote", "passageId", "sortOrder"];

    for (const snapshot of [audit.before, audit.after].filter(Boolean)) {
        assert.deepEqual(Object.keys(snapshot).sort(), allowedKeys);
    }
}

/**
 * Constrói cenários frescos para evitar partilha de estado entre testes.
 *
 * @returns {Array<object>} Cinco mutações administrativas.
 */
function mutationScenarios() {
    return [
        {
            label: "create",
            initialState: { biblical_passages: [], admin_audit_logs: [] },
            domainCollection: "biblical_passages",
            domainOperation: "insertOne",
            auditAction: "biblical_passage.created",
            auditTargetType: "biblical_passage",
            auditKind: "passage",
            expectedStatus: 201,
            invoke: (res) =>
                postBiblicalPassage(
                    requestDouble({ body: initialPayload }),
                    res,
                ),
        },
        {
            label: "update",
            initialState: {
                biblical_passages: [passageDocument()],
                admin_audit_logs: [],
            },
            domainCollection: "biblical_passages",
            domainOperation: "findOneAndUpdate",
            auditAction: "biblical_passage.updated",
            auditTargetType: "biblical_passage",
            auditKind: "passage",
            expectedStatus: 200,
            invoke: (res) =>
                patchBiblicalPassage(
                    requestDouble({
                        params: { id: String(PASSAGE_ID) },
                        body: updatedPayload,
                    }),
                    res,
                ),
        },
        {
            label: "status",
            initialState: {
                biblical_passages: [passageDocument()],
                admin_audit_logs: [],
            },
            domainCollection: "biblical_passages",
            domainOperation: "findOneAndUpdate",
            auditAction: "biblical_passage.status_changed",
            auditTargetType: "biblical_passage",
            auditKind: "passage",
            expectedStatus: 200,
            invoke: (res) =>
                patchBiblicalPassageStatus(
                    requestDouble({
                        params: { id: String(PASSAGE_ID) },
                        body: { status: "published" },
                    }),
                    res,
                ),
        },
        {
            label: "link",
            initialState: {
                contents: [{ _id: CONTENT_ID, status: "draft" }],
                biblical_passages: [passageDocument()],
                content_biblical_passages: [],
                admin_audit_logs: [],
            },
            domainCollection: "content_biblical_passages",
            domainOperation: "updateOne",
            auditAction: "biblical_passage.association_linked",
            auditTargetType: "content_biblical_passage",
            auditKind: "association",
            expectedStatus: 200,
            invoke: (res) =>
                postCatalogBiblicalPassage(
                    requestDouble({
                        params: { contentId: String(CONTENT_ID) },
                        body: {
                            passageId: String(PASSAGE_ID),
                            note: PRIVATE_NOTE,
                            sortOrder: 2,
                        },
                    }),
                    res,
                ),
        },
        {
            label: "unlink",
            initialState: {
                content_biblical_passages: [associationDocument()],
                admin_audit_logs: [],
            },
            domainCollection: "content_biblical_passages",
            domainOperation: "deleteOne",
            auditAction: "biblical_passage.association_unlinked",
            auditTargetType: "content_biblical_passage",
            auditKind: "association",
            expectedStatus: 200,
            invoke: (res) =>
                deleteCatalogBiblicalPassage(
                    requestDouble({
                        params: {
                            contentId: String(CONTENT_ID),
                            passageId: String(PASSAGE_ID),
                        },
                    }),
                    res,
                ),
        },
    ];
}

afterEach(() => {
    setDbForTests(null);
});

for (const definition of mutationScenarios()) {
    test(`${definition.label}: commit inclui audit na mesma sessao`, async () => {
        const harness = createTransactionalDb(definition.initialState);
        setDbForTests(harness.db);
        const res = responseDouble();

        await definition.invoke(res);

        assert.equal(res.statusCode, definition.expectedStatus);
        assert.equal(harness.state.admin_audit_logs.length, 1);
        assert.ok(res.body?.passage ?? res.body?.association);
        assertSharedSession(
            harness.control,
            definition.domainCollection,
            definition.domainOperation,
        );
        const audit = harness.state.admin_audit_logs[0];
        assert.equal(audit.action, definition.auditAction);
        assert.equal(audit.targetType, definition.auditTargetType);
        assertSafeAudit(audit);
        assertMinimalAuditSnapshots(audit, definition.auditKind);
    });

    test(`${definition.label}: falha do audit reverte toda a mutacao`, async () => {
        const harness = createTransactionalDb(definition.initialState);
        const before = cloneValue(harness.state);
        harness.control.failAuditWrites = true;
        setDbForTests(harness.db);

        await assert.rejects(
            () => definition.invoke(responseDouble()),
            /injected biblical audit failure/,
        );

        assert.deepEqual(harness.state, before);
        assertSharedSession(
            harness.control,
            definition.domainCollection,
            definition.domainOperation,
        );
    });
}

test("link repetido e idempotente e nao duplica associacao ou audit", async () => {
    const harness = createTransactionalDb({
        contents: [{ _id: CONTENT_ID, status: "draft" }],
        biblical_passages: [passageDocument()],
        content_biblical_passages: [],
        admin_audit_logs: [],
    });
    setDbForTests(harness.db);
    const req = requestDouble({
        params: { contentId: String(CONTENT_ID) },
        body: {
            passageId: String(PASSAGE_ID),
            note: PRIVATE_NOTE,
            sortOrder: 2,
        },
    });

    await postCatalogBiblicalPassage(req, responseDouble());
    const firstAssociation = cloneValue(
        harness.state.content_biblical_passages[0],
    );
    await postCatalogBiblicalPassage(req, responseDouble());

    assert.equal(harness.state.content_biblical_passages.length, 1);
    assert.equal(harness.state.admin_audit_logs.length, 1);
    assert.deepEqual(
        harness.state.content_biblical_passages[0],
        firstAssociation,
    );
});

test("unlink inexistente preserva resposta idempotente sem criar audit", async () => {
    const harness = createTransactionalDb({
        content_biblical_passages: [],
        admin_audit_logs: [],
    });
    setDbForTests(harness.db);
    const res = responseDouble();

    await deleteCatalogBiblicalPassage(
        requestDouble({
            params: {
                contentId: String(CONTENT_ID),
                passageId: String(PASSAGE_ID),
            },
        }),
        res,
    );

    assert.deepEqual(res.body.association, {
        contentId: String(CONTENT_ID),
        passageId: String(PASSAGE_ID),
        removed: false,
    });
    assert.equal(harness.state.admin_audit_logs.length, 0);
});
