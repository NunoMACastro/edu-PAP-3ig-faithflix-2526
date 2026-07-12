/**
 * @file Provas locais da atomicidade entre comentários e audit administrativo.
 *
 * A suite usa um double MongoDB estritamente in-memory com snapshot e rollback.
 * Não abre sockets nem toca na base configurada; observa ainda a sessão entregue
 * a cada escrita para garantir que a alteração de domínio e o audit partilham a
 * mesma unidade transacional.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    deleteCommentController,
    patchCommentModeration,
} from "../../src/modules/comments/comments.controller.js";
import { deleteComment } from "../../src/modules/comments/comments.service.js";

const ACTOR_ID = new ObjectId("64f100000000000000000001");
const OWNER_ID = new ObjectId("64f100000000000000000002");
const OTHER_USER_ID = new ObjectId("64f100000000000000000003");
const COMMENT_ID = new ObjectId("64f200000000000000000001");
const CONTENT_ID = new ObjectId("64f300000000000000000001");

/**
 * Clona documentos sem perder os tipos MongoDB e Date usados nas asserções.
 *
 * @param {unknown} value Valor original.
 * @returns {unknown} Cópia independente do valor.
 */
function cloneValue(value) {
    if (value instanceof ObjectId) {
        return new ObjectId(value.toHexString());
    }

    if (value instanceof Date) {
        return new Date(value.getTime());
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
 * Compara ObjectIds pelo valor e escalares por identidade estrita.
 *
 * @param {unknown} actual Valor persistido.
 * @param {unknown} expected Valor do filtro.
 * @returns {boolean} Verdadeiro quando os valores correspondem.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return String(actual) === String(expected);
    }

    return actual === expected;
}

/**
 * Avalia a subset de filtros simples usada pelo serviço de comentários.
 *
 * @param {Record<string, unknown>} row Documento candidato.
 * @param {Record<string, unknown>} filter Filtro MongoDB simplificado.
 * @returns {boolean} Verdadeiro quando todos os campos correspondem.
 */
function matches(row, filter = {}) {
    return Object.entries(filter).every(([key, expected]) =>
        matchesValue(row[key], expected),
    );
}

/**
 * Cria a forma canónica de um comentário usado pelos cenários da suite.
 *
 * @param {Partial<Record<string, unknown>>} [overrides] Campos a substituir.
 * @returns {Record<string, unknown>} Documento completo de comentário.
 */
function commentFixture(overrides = {}) {
    return {
        _id: COMMENT_ID,
        contentId: CONTENT_ID,
        userId: OWNER_ID,
        body: "Corpo privado que nunca pode entrar no audit.",
        status: "visible",
        moderationReason: null,
        createdAt: new Date("2026-07-10T09:00:00.000Z"),
        updatedAt: new Date("2026-07-10T09:00:00.000Z"),
        ...overrides,
    };
}

/**
 * Double transacional mínimo com rollback integral e fault injection no audit.
 */
class TransactionalCommentsDb {
    /**
     * Inicializa coleções isoladas e o controlo observável das escritas.
     *
     * @param {Record<string, Record<string, unknown>[]>} initialState Estado inicial.
     */
    constructor(initialState = {}) {
        this.state = Object.fromEntries(
            Object.entries(initialState).map(([name, rows]) => [
                name,
                cloneValue(rows),
            ]),
        );
        this.session = { commentsTransaction: true };
        this.operations = [];
        this.failAuditWrites = false;
        this.transactionCount = 0;
    }

    /**
     * Obtém a coleção mutável, criando-a apenas dentro deste double.
     *
     * @param {string} name Nome da coleção.
     * @returns {Record<string, unknown>[]} Documentos atuais.
     */
    rows(name) {
        this.state[name] ??= [];
        return this.state[name];
    }

    /**
     * Executa o trabalho com uma sessão única e restaura o snapshot se falhar.
     *
     * @template T
     * @param {(context: { db: TransactionalCommentsDb, session: object }) => Promise<T>} work Unidade de trabalho.
     * @returns {Promise<T>} Resultado confirmado da transação simulada.
     */
    async runInTransaction(work) {
        const snapshot = cloneValue(this.state);
        this.transactionCount += 1;

        try {
            return await work({ db: this, session: this.session });
        } catch (error) {
            this.state = snapshot;
            throw error;
        }
    }

    /**
     * Expõe somente os métodos MongoDB necessários ao serviço e ao audit log.
     *
     * @param {string} name Nome da coleção.
     * @returns {Record<string, Function>} Coleção in-memory observável.
     */
    collection(name) {
        return {
            findOne: async (filter, options = {}) => {
                const row = this.rows(name).find((candidate) =>
                    matches(candidate, filter),
                );
                this.operations.push({
                    collection: name,
                    operation: "findOne",
                    session: options.session,
                });
                return row ? cloneValue(row) : null;
            },
            findOneAndUpdate: async (filter, update, options = {}) => {
                const row = this.rows(name).find((candidate) =>
                    matches(candidate, filter),
                );

                if (!row) return null;

                const before = cloneValue(row);
                Object.assign(row, cloneValue(update.$set ?? {}));
                this.operations.push({
                    collection: name,
                    operation: "findOneAndUpdate",
                    session: options.session,
                });
                return options.returnDocument === "before"
                    ? before
                    : cloneValue(row);
            },
            deleteOne: async (filter, options = {}) => {
                const index = this.rows(name).findIndex((candidate) =>
                    matches(candidate, filter),
                );
                this.operations.push({
                    collection: name,
                    operation: "deleteOne",
                    session: options.session,
                });

                if (index === -1) return { deletedCount: 0 };

                this.rows(name).splice(index, 1);
                return { deletedCount: 1 };
            },
            insertOne: async (document, options = {}) => {
                this.operations.push({
                    collection: name,
                    operation: "insertOne",
                    session: options.session,
                });

                if (name === "admin_audit_logs" && this.failAuditWrites) {
                    throw new Error("fault injection: audit unavailable");
                }

                const insertedId = document._id ?? new ObjectId();
                this.rows(name).push(
                    cloneValue({ ...document, _id: insertedId }),
                );
                return { insertedId };
            },
        };
    }
}

/**
 * Cria um response Express mínimo e conserva status e payload para asserções.
 *
 * @returns {{ res: object, result: { statusCode?: number, payload?: unknown } }} Recorder.
 */
function createResponseRecorder() {
    const result = {};
    const res = {
        status(statusCode) {
            result.statusCode = statusCode;
            return this;
        },
        json(payload) {
            result.payload = payload;
            return payload;
        },
    };

    return { res, result };
}

/**
 * Devolve uma operação observada, falhando com mensagem útil se não existir.
 *
 * @param {TransactionalCommentsDb} db Double em observação.
 * @param {string} collection Nome da coleção.
 * @param {string} operation Nome da operação.
 * @returns {Record<string, unknown>} Operação encontrada.
 */
function observedOperation(db, collection, operation) {
    const observed = db.operations.find(
        (entry) =>
            entry.collection === collection && entry.operation === operation,
    );
    assert.ok(observed, `${collection}.${operation} deveria ter sido observado`);
    return observed;
}

afterEach(() => {
    setDbForTests(null);
});

test("moderação e audit usam a mesma sessão e recebem actor/requestId do controller", async () => {
    const db = new TransactionalCommentsDb({
        content_comments: [commentFixture()],
    });
    setDbForTests(db);
    const { res, result } = createResponseRecorder();

    await patchCommentModeration(
        {
            id: "req-comment-moderation",
            user: { id: String(ACTOR_ID), role: "moderator" },
            params: { commentId: String(COMMENT_ID) },
            body: {
                status: "rejected",
                moderationReason: "Motivo privado@example.test",
            },
        },
        res,
    );

    assert.equal(result.statusCode, 200);
    assert.equal(result.payload.comment.status, "rejected");
    assert.equal(db.rows("content_comments")[0].status, "rejected");
    const update = observedOperation(
        db,
        "content_comments",
        "findOneAndUpdate",
    );
    const auditInsert = observedOperation(
        db,
        "admin_audit_logs",
        "insertOne",
    );
    assert.strictEqual(update.session, db.session);
    assert.strictEqual(auditInsert.session, db.session);

    const [audit] = db.rows("admin_audit_logs");
    assert.equal(String(audit.actorUserId), String(ACTOR_ID));
    assert.equal(audit.requestId, "req-comment-moderation");
    assert.equal(audit.action, "comment.moderated");
    assert.deepEqual(audit.before, { status: "visible" });
    assert.deepEqual(audit.after, { status: "rejected" });
    assert.equal("body" in audit.before, false);
    assert.equal("moderationReason" in audit.after, false);
    assert.equal(JSON.stringify(audit).includes("privado@example.test"), false);
});

test("falha do audit reverte integralmente a moderação", async () => {
    const original = commentFixture();
    const db = new TransactionalCommentsDb({ content_comments: [original] });
    db.failAuditWrites = true;
    setDbForTests(db);

    await assert.rejects(
        patchCommentModeration(
            {
                id: "req-comment-rollback",
                user: { id: String(ACTOR_ID), role: "admin" },
                params: { commentId: String(COMMENT_ID) },
                body: {
                    status: "pending_review",
                    moderationReason: "Decisão que deve reverter",
                },
            },
            createResponseRecorder().res,
        ),
        /fault injection: audit unavailable/,
    );

    assert.deepEqual(db.rows("content_comments"), [original]);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("delete privilegiado audita na mesma sessão mesmo quando o admin é autor", async () => {
    const db = new TransactionalCommentsDb({
        content_comments: [commentFixture({ userId: ACTOR_ID })],
    });
    setDbForTests(db);
    const { res, result } = createResponseRecorder();

    await deleteCommentController(
        {
            id: "req-comment-delete",
            user: { id: String(ACTOR_ID), role: "admin" },
            params: { commentId: String(COMMENT_ID) },
        },
        res,
    );

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.payload.comment, {
        id: String(COMMENT_ID),
        deleted: true,
    });
    assert.equal(db.rows("content_comments").length, 0);
    const deletion = observedOperation(db, "content_comments", "deleteOne");
    const auditInsert = observedOperation(
        db,
        "admin_audit_logs",
        "insertOne",
    );
    assert.strictEqual(deletion.session, db.session);
    assert.strictEqual(auditInsert.session, db.session);

    const [audit] = db.rows("admin_audit_logs");
    assert.equal(String(audit.actorUserId), String(ACTOR_ID));
    assert.equal(audit.requestId, "req-comment-delete");
    assert.equal(audit.action, "comment.privileged_delete");
    assert.deepEqual(audit.before, { status: "visible" });
    assert.equal(audit.after, null);
    assert.equal(JSON.stringify(audit).includes("Corpo privado"), false);
});

test("falha do audit reverte o delete privilegiado", async () => {
    const original = commentFixture();
    const db = new TransactionalCommentsDb({ content_comments: [original] });
    db.failAuditWrites = true;
    setDbForTests(db);

    await assert.rejects(
        deleteComment(
            String(ACTOR_ID),
            "moderator",
            String(COMMENT_ID),
            { requestId: "req-delete-rollback" },
        ),
        /fault injection: audit unavailable/,
    );

    assert.deepEqual(db.rows("content_comments"), [original]);
    assert.equal(db.rows("admin_audit_logs").length, 0);
    const deletion = observedOperation(db, "content_comments", "deleteOne");
    const auditInsert = observedOperation(
        db,
        "admin_audit_logs",
        "insertOne",
    );
    assert.strictEqual(deletion.session, db.session);
    assert.strictEqual(auditInsert.session, db.session);
});

test("delete do autor mantém ownership e não cria audit administrativo", async () => {
    const db = new TransactionalCommentsDb({
        content_comments: [commentFixture()],
    });
    setDbForTests(db);

    const result = await deleteComment(
        String(OWNER_ID),
        "user",
        String(COMMENT_ID),
        { requestId: "req-owner-delete" },
    );

    assert.deepEqual(result, { id: String(COMMENT_ID), deleted: true });
    assert.equal(db.rows("content_comments").length, 0);
    assert.equal(db.rows("admin_audit_logs").length, 0);
    assert.equal(db.transactionCount, 0);
    const deletion = observedOperation(db, "content_comments", "deleteOne");
    assert.equal(deletion.session, undefined);
});

test("utilizador comum continua impedido de apagar comentário alheio", async () => {
    const original = commentFixture();
    const db = new TransactionalCommentsDb({ content_comments: [original] });
    setDbForTests(db);

    await assert.rejects(
        deleteComment(
            String(OTHER_USER_ID),
            "user",
            String(COMMENT_ID),
            { requestId: "req-forbidden-delete" },
        ),
        (error) => error.statusCode === 403,
    );

    assert.deepEqual(db.rows("content_comments"), [original]);
    assert.equal(db.rows("admin_audit_logs").length, 0);
    assert.equal(db.transactionCount, 0);
});
