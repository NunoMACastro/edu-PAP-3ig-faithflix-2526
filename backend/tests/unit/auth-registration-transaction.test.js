/**
 * @file Provas locais da unidade transacional entre registo e sessão inicial.
 *
 * O double usa staging/rollback e não abre MongoDB. Uma falha tardia no insert
 * da sessão deve deixar tanto `users` como `sessions` sem qualquer documento.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { registerUser } from "../../src/modules/auth/auth.service.js";
import { hashToken } from "../../src/modules/auth/token.js";

/**
 * Cria uma DB transacional mínima para autenticação.
 *
 * @returns {{ db: object, state: { users: object[], sessions: object[] }, control: { failSessionInsert: boolean, unknownCommitAfterCommit: boolean, userSessions: unknown[], authSessions: unknown[] } }} Harness observável.
 */
function createRegistrationDb() {
    const state = { users: [], sessions: [] };
    const control = {
        failSessionInsert: false,
        unknownCommitAfterCommit: false,
        userSessions: [],
        authSessions: [],
    };
    let transactionState = null;

    function rows(name) {
        const active = transactionState ?? state;
        if (!(name in active)) active[name] = [];
        return active[name];
    }

    const db = {
        async runInTransaction(work) {
            const session = { id: "registration-session" };
            transactionState = {
                users: state.users.map((row) => ({ ...row })),
                sessions: state.sessions.map((row) => ({ ...row })),
            };

            try {
                const result = await work({ db, session });
                state.users = transactionState.users;
                state.sessions = transactionState.sessions;
                if (control.unknownCommitAfterCommit) {
                    const error = new Error("unknown commit result");
                    error.hasErrorLabel = (label) =>
                        label === "UnknownTransactionCommitResult";
                    throw error;
                }
                return result;
            } finally {
                transactionState = null;
            }
        },

        collection(name) {
            return {
                async createIndex() {
                    return `${name}_index`;
                },

                async insertOne(document, options = {}) {
                    if (name === "users") {
                        control.userSessions.push(options.session);
                    }
                    if (name === "sessions") {
                        control.authSessions.push(options.session);
                        if (control.failSessionInsert) {
                            throw new Error("fault injection: session unavailable");
                        }
                    }

                    const persisted = { _id: new ObjectId(), ...document };
                    rows(name).push(persisted);
                    return { insertedId: persisted._id };
                },

                async findOne(query = {}) {
                    return (
                        rows(name).find((row) =>
                            Object.entries(query).every(([key, expected]) => {
                                if (
                                    expected &&
                                    typeof expected === "object" &&
                                    "$gt" in expected
                                ) {
                                    return row[key] > expected.$gt;
                                }
                                return String(row[key]) === String(expected);
                            }),
                        ) ?? null
                    );
                },
            };
        },
    };

    return { db, state, control };
}

afterEach(() => {
    setDbForTests(null);
});

test("falha da sessão inicial reverte integralmente o utilizador", async () => {
    const harness = createRegistrationDb();
    harness.control.failSessionInsert = true;
    setDbForTests(harness.db);

    await assert.rejects(
        () =>
            registerUser({
                name: "Conta Atómica",
                email: "atomic@example.test",
                password: "password1234",
            }),
        /fault injection: session unavailable/u,
    );

    assert.equal(harness.state.users.length, 0);
    assert.equal(harness.state.sessions.length, 0);
    assert.equal(harness.control.userSessions.length, 1);
    assert.equal(harness.control.authSessions.length, 1);
    assert.ok(harness.control.userSessions[0]);
    assert.equal(
        harness.control.userSessions[0],
        harness.control.authSessions[0],
    );
});

test("registo e sessão inicial fazem commit na mesma sessão", async () => {
    const harness = createRegistrationDb();
    setDbForTests(harness.db);

    const result = await registerUser({
        name: "Conta Atómica",
        email: "atomic@example.test",
        password: "password1234",
    });

    assert.equal(result.user.email, "atomic@example.test");
    assert.equal(result.user.accountStatus, "active");
    assert.equal(typeof result.token, "string");
    assert.equal(harness.state.users.length, 1);
    assert.equal(harness.state.users[0].accountStatus, "active");
    assert.equal(harness.state.sessions.length, 1);
    assert.equal(
        harness.control.userSessions[0],
        harness.control.authSessions[0],
    );
    assert.equal(
        String(harness.state.sessions[0].userId),
        String(harness.state.users[0]._id),
    );
});

test("commit desconhecido é reconciliado pelo utilizador e token desta tentativa", async () => {
    const harness = createRegistrationDb();
    harness.control.unknownCommitAfterCommit = true;
    setDbForTests(harness.db);

    const result = await registerUser({
        name: "Conta Reconciliada",
        email: "reconciled@example.test",
        password: "password1234",
    });

    assert.equal(result.user.email, "reconciled@example.test");
    assert.equal(typeof result.token, "string");
    assert.equal(harness.state.users.length, 1);
    assert.equal(harness.state.sessions.length, 1);
    assert.equal(
        harness.state.sessions[0].tokenHash,
        hashToken(result.token),
    );
});
