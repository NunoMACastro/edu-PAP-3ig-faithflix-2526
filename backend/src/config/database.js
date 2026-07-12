/**
 * @file Ficheiro `real_dev/backend/src/config/database.js` da implementação real_dev.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

let clientPromise;
let testDb;
const transactionContext = new AsyncLocalStorage();
const DEFAULT_TRANSACTION_ATTEMPTS = 3;

/**
 * Abre e memoriza o cliente MongoDB, limpando a cache quando a ligação falha.
 *
 * @returns {Promise<MongoClient>} Cliente ligado.
 */
export async function getMongoClient() {
    if (!clientPromise) {
        const client = new MongoClient(env.mongoUri);
        clientPromise = client.connect().catch((error) => {
            clientPromise = undefined;
            throw error;
        });
    }

    return clientPromise;
}

/**
 * Identifica erros que justificam repetir toda a unidade transacional.
 *
 * `UnknownTransactionCommitResult` nunca repete a callback: o estado do commit
 * é incerto e o driver já trata retries de commit dentro de `withTransaction`.
 * Reexecutar todo o domínio nesse caso poderia duplicar efeitos.
 *
 * @param {unknown} error Erro devolvido pelo driver ou por um double.
 * @returns {boolean} Verdadeiro apenas para labels transientes MongoDB.
 */
function isTransientTransactionError(error) {
    if (typeof error?.hasErrorLabel !== "function") return false;
    if (error.hasErrorLabel("UnknownTransactionCommitResult")) return false;
    return error.hasErrorLabel("TransientTransactionError");
}

/**
 * Executa uma única tentativa com sessão MongoDB real ou double injetado.
 *
 * @template T
 * @param {(context: { db: import("mongodb").Db, session?: import("mongodb").ClientSession }) => Promise<T>} work Trabalho.
 * @param {import("mongodb").TransactionOptions} transactionOptions Opções do driver.
 * @returns {Promise<T>} Resultado da tentativa.
 */
async function executeTransactionAttempt(work, transactionOptions) {
    if (testDb) {
        if (typeof testDb.runInTransaction === "function") {
            return testDb.runInTransaction(work);
        }

        return work({ db: testDb, session: undefined });
    }

    const client = await getMongoClient();
    const db = client.db(env.mongoDbName);
    const session = client.startSession();

    try {
        let result;
        await session.withTransaction(async () => {
            result = await work({ db, session });
        }, transactionOptions);
        return result;
    } finally {
        await session.endSession();
    }
}

/**
 * Devolve a base de dados MongoDB configurada, reutilizando uma ligação de cliente.
 *
 * @returns {Promise<import("mongodb").Db>} Base de dados MongoDB usada pelo backend FaithFlix.
 */
export async function getDb() {
    if (testDb) {
        return testDb;
    }

    const client = await getMongoClient();
    return client.db(env.mongoDbName);
}

/**
 * Exige que a chamada atual pertença a uma unidade aberta por
 * `runInTransaction`.
 *
 * A verificação usa o contexto assíncrono em vez de depender da presença de um
 * `ClientSession`: doubles locais podem não fornecer uma sessão MongoDB, mas
 * continuam a atravessar `runInTransaction` e, por isso, preservam o mesmo
 * contrato fail-closed dos caminhos reais.
 *
 * @returns {void}
 * @throws {Error & { code: string }} Quando a operação corre fora de uma transação.
 */
export function assertActiveTransaction() {
    if (transactionContext.getStore()?.active) {
        return;
    }

    const error = new Error(
        "A operacao exige um contexto transacional ativo.",
    );
    error.code = "TRANSACTION_CONTEXT_REQUIRED";
    throw error;
}

/**
 * Executa uma unidade de trabalho numa transação MongoDB real.
 *
 * Doubles de teste podem fornecer `runInTransaction`; quando não fornecem, a
 * callback recebe a DB injetada sem sessão para manter os unitários isolados.
 * A aplicação real nunca faz fallback não transacional.
 *
 * @template T
 * @param {(context: { db: import("mongodb").Db, session?: import("mongodb").ClientSession }) => Promise<T>} work Trabalho atómico.
 * @param {import("mongodb").TransactionOptions & { maxAttempts?: number }} [options] Opções do driver e máximo de tentativas externas.
 * @returns {Promise<T>} Resultado devolvido pela callback depois do commit.
 */
export async function runInTransaction(work, options = {}) {
    if (transactionContext.getStore()?.active) {
        const error = new Error("Transacoes MongoDB aninhadas nao sao permitidas.");
        error.code = "NESTED_TRANSACTION";
        throw error;
    }

    const maxAttempts = Number.isInteger(options.maxAttempts)
        ? Math.min(Math.max(options.maxAttempts, 1), 5)
        : DEFAULT_TRANSACTION_ATTEMPTS;
    const { maxAttempts: _maxAttempts, ...transactionOptions } = options;

    return transactionContext.run({ active: true }, async () => {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                return await executeTransactionAttempt(work, transactionOptions);
            } catch (error) {
                lastError = error;
                if (
                    attempt === maxAttempts ||
                    !isTransientTransactionError(error)
                ) {
                    throw error;
                }
            }
        }

        throw lastError;
    });
}

/**
 * Confirma que a topologia suporta transações multi-documento.
 *
 * Produção chama este guard antes de criar índices ou aceitar tráfego. O método
 * não revela URI, hostname ou credenciais nas mensagens de erro.
 *
 * @param {number} [maxTimeMS=1000] Budget do comando `hello`.
 * @returns {Promise<void>}
 */
export async function assertTransactionSupport(maxTimeMS = 1000) {
    if (testDb) {
        await testDb.assertTransactionSupport?.(maxTimeMS);
        return;
    }

    const client = await getMongoClient();
    const hello = await client
        .db("admin")
        .command({ hello: 1, maxTimeMS });
    const supportsSessions = Number.isFinite(
        hello.logicalSessionTimeoutMinutes,
    );
    const supportsTransactions =
        typeof hello.setName === "string" || hello.msg === "isdbgrid";

    if (!supportsSessions || !supportsTransactions) {
        const error = new Error(
            "A topologia MongoDB configurada nao suporta transacoes obrigatorias.",
        );
        error.code = "MONGODB_TRANSACTIONS_REQUIRED";
        throw error;
    }
}

/**
 * Verifica a dependência MongoDB com um budget curto.
 *
 * @param {number} [maxTimeMS=500] Tempo máximo do ping.
 * @returns {Promise<void>}
 */
export async function pingDatabase(maxTimeMS = 500) {
    const db = await getDb();
    await db.command({ ping: 1, maxTimeMS });
}

/**
 * Fecha a ligação real do processo; doubles de teste não são afetados.
 *
 * @returns {Promise<void>}
 */
export async function closeDatabase() {
    if (!clientPromise) {
        return;
    }

    const client = await clientPromise;
    clientPromise = undefined;
    await client.close();
}

/**
 * Substitui a base de dados usada pelos serviços durante suites node:test.
 *
 * @param {import("mongodb").Db | null} db - Duplo de teste, ou null para restaurar MongoDB.
 * @returns {void}
 */
export function setDbForTests(db) {
    testDb = db;
}
