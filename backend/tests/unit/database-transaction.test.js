/**
 * @file Testes do contrato transversal de transações e topologia.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
    assertTransactionSupport,
    runInTransaction,
    setDbForTests,
} from "../../src/config/database.js";

afterEach(() => {
    setDbForTests(null);
});

test("runInTransaction repete apenas erros transientes", async () => {
    let attempts = 0;
    const db = {
        async runInTransaction(work) {
            attempts += 1;
            if (attempts === 1) {
                const error = new Error("transient");
                error.hasErrorLabel = (label) =>
                    label === "TransientTransactionError";
                throw error;
            }

            return work({ db: this, session: { attempt: attempts } });
        },
    };
    setDbForTests(db);

    const result = await runInTransaction(
        async ({ session }) => session.attempt,
        { maxAttempts: 2 },
    );

    assert.equal(result, 2);
    assert.equal(attempts, 2);
});

test("runInTransaction não repete a callback quando o commit é incerto", async () => {
    let attempts = 0;
    const unknownCommit = new Error("unknown commit");
    unknownCommit.hasErrorLabel = (label) =>
        label === "UnknownTransactionCommitResult";
    setDbForTests({
        async runInTransaction() {
            attempts += 1;
            throw unknownCommit;
        },
    });

    await assert.rejects(
        () => runInTransaction(async () => "nao deve repetir", { maxAttempts: 3 }),
        (error) => error === unknownCommit,
    );
    assert.equal(attempts, 1);
});

test("runInTransaction rejeita transações aninhadas", async () => {
    const db = {
        async runInTransaction(work) {
            return work({ db: this, session: { test: true } });
        },
    };
    setDbForTests(db);

    await assert.rejects(
        () =>
            runInTransaction(() =>
                runInTransaction(async () => "nao deve executar"),
            ),
        (error) => {
            assert.equal(error.code, "NESTED_TRANSACTION");
            return true;
        },
    );
});

test("assertTransactionSupport delega no double sem abrir Mongo real", async () => {
    let checked = false;
    setDbForTests({
        async assertTransactionSupport() {
            checked = true;
        },
    });

    await assertTransactionSupport();
    assert.equal(checked, true);
});
