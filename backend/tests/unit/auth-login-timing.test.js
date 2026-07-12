/**
 * @file Testes unitários do trabalho criptográfico uniforme no login.
 *
 * A persistência é integralmente in-memory. O verifier é envolvido por um spy
 * explícito para provar quantas derivações são pedidas sem medir wall-clock,
 * que seria uma evidência instável e dependente da máquina.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { verifyPassword } from "../../src/modules/auth/auth.password.js";
import { loginUser } from "../../src/modules/auth/auth.service.js";

const ACTIVE_PASSWORD_HASH =
    "6163746976652d746573742d73616c74:01924885b082e4627ab4b45b9aa95683c20f5fdd9cf1269667a65be8a1599601fd1acf0ebecaca79fa2fcffb8db9a70d6f0cc711df99d5519f3ac86b2dee60f4";
const DUMMY_PASSWORD = "faithflix-login-dummy-not-a-credential";
const PASSWORD_HASH_PATTERN = /^[a-f0-9]{32}:[a-f0-9]{128}$/i;

/**
 * Cria a persistência mínima exigida pelo login e pela criação de sessão.
 *
 * @param {Record<string, unknown> | null} user Utilizador devolvido pela pesquisa.
 * @returns {{ db: { collection: (name: string) => object }, sessions: Array<Record<string, unknown>> }} DB fake e sessões persistidas.
 */
function createLoginDb(user) {
    const sessions = [];
    const indexableCollection = {
        async createIndex() {
            return "test_index";
        },
    };

    return {
        sessions,
        db: {
            collection(name) {
                if (name === "users") {
                    return {
                        ...indexableCollection,
                        async findOne(query) {
                            return user?.email === query.email ? user : null;
                        },
                    };
                }

                if (name === "sessions") {
                    return {
                        ...indexableCollection,
                        async insertOne(document) {
                            const persisted = {
                                _id: new ObjectId(),
                                ...document,
                            };
                            sessions.push(persisted);
                            return { insertedId: persisted._id };
                        },
                    };
                }

                if (
                    name === "password_reset_tokens" ||
                    name === "password_reset_dev_outbox"
                ) {
                    return indexableCollection;
                }

                throw new Error(`Coleção inesperada no teste de login: ${name}`);
            },
        },
    };
}

/**
 * Cria um utilizador com hash real válido para distinguir o caminho ativo do
 * hash dummy escolhido pelo serviço.
 *
 * @param {string} accountStatus Estado operacional a testar.
 * @returns {Record<string, unknown>} Documento de utilizador in-memory.
 */
function userWithStatus(accountStatus) {
    return {
        _id: new ObjectId(),
        name: "Utilizador de Teste",
        email: `${accountStatus}@example.test`,
        passwordHash: ACTIVE_PASSWORD_HASH,
        role: "user",
        accountStatus,
    };
}

afterEach(() => {
    setDbForTests(null);
});

test("login executa uma derivação dummy para utilizador inexistente, inativo e bloqueado", async () => {
    const cases = [
        { label: "inexistente", user: null, email: "missing@example.test" },
        {
            label: "inativo",
            user: userWithStatus("inactive"),
            email: "inactive@example.test",
        },
        {
            label: "bloqueado",
            user: userWithStatus("blocked"),
            email: "blocked@example.test",
        },
    ];

    for (const scenario of cases) {
        const harness = createLoginDb(scenario.user);
        const verifierCalls = [];
        setDbForTests(harness.db);

        await assert.rejects(
            () =>
                loginUser(
                    { email: scenario.email, password: DUMMY_PASSWORD },
                    {
                        async passwordVerifier(password, storedHash) {
                            const result = await verifyPassword(
                                password,
                                storedHash,
                            );
                            verifierCalls.push({
                                password,
                                storedHash,
                                result,
                            });
                            return result;
                        },
                    },
                ),
            (error) =>
                error?.statusCode === 401 &&
                error?.code === "AUTH_INVALID_CREDENTIALS",
            `O cenário ${scenario.label} deve falhar fechado.`,
        );

        assert.equal(verifierCalls.length, 1, scenario.label);
        assert.match(verifierCalls[0].storedHash, PASSWORD_HASH_PATTERN);
        assert.notEqual(verifierCalls[0].storedHash, ACTIVE_PASSWORD_HASH);
        assert.equal(
            verifierCalls[0].result,
            true,
            "Mesmo uma correspondência com o hash dummy não pode autenticar.",
        );
        assert.equal(harness.sessions.length, 0);
    }
});

test("login ativo verifica exatamente uma vez o hash persistido e preserva a autenticação", async () => {
    const user = userWithStatus("active");
    const harness = createLoginDb(user);
    const verifierCalls = [];
    setDbForTests(harness.db);

    const result = await loginUser(
        { email: user.email, password: "password1234" },
        {
            async passwordVerifier(password, storedHash) {
                verifierCalls.push({ password, storedHash });
                return verifyPassword(password, storedHash);
            },
        },
    );

    assert.equal(verifierCalls.length, 1);
    assert.equal(verifierCalls[0].password, "password1234");
    assert.equal(verifierCalls[0].storedHash, ACTIVE_PASSWORD_HASH);
    assert.equal(result.user.id, String(user._id));
    assert.equal(result.user.accountStatus, "active");
    assert.equal(typeof result.token, "string");
    assert.equal(harness.sessions.length, 1);
    assert.equal(String(harness.sessions[0].userId), String(user._id));
});
