/**
 * @file Guardas fail-closed para seeds E2E e de demonstração.
 *
 * Este módulo mantém a validação de ambiente separada da ligação MongoDB para
 * poder ser testado sem rede nem base de dados. Seeds E2E usam exclusivamente
 * as variáveis `TEST_MONGODB_*`; nunca reutilizam a configuração normal da app.
 */

import { assertFormalE2eEnvironment } from "../../../scripts/e2e-environment.mjs";

const LEGACY_DEMO_PASSWORD = "password-segura-123";
const MINIMUM_SEED_PASSWORD_LENGTH = 12;
const FORBIDDEN_DEMO_DATABASE_SEGMENT =
    /(?:prod(?:uction)?|staging|shared|live|main)/iu;

export const DEMO_MARKER_COLLECTION = "__faithflix_demo_meta";
export const DEMO_MARKER_ID = "faithflix-demo";
export const DEMO_FIXTURE_VERSION = "demo-v2";
export const DEFAULT_DEMO_DATA_SEED = "faithflix-demo-v2";

/**
 * Lê uma variável obrigatória sem aceitar valores vazios.
 *
 * @param {Record<string, string | undefined>} source Ambiente a validar.
 * @param {string} name Nome da variável.
 * @returns {string} Valor normalizado.
 * @throws {Error} Quando a variável está ausente ou vazia.
 */
function requireEnvironmentValue(source, name) {
    const value = source[name]?.trim();

    if (!value) {
        throw new Error(`${name} tem de ser definida explicitamente.`);
    }

    return value;
}

/**
 * Valida o ambiente obrigatório de qualquer seed E2E.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {{ mongoUri: string, mongoDbName: string }} Configuração de teste.
 * @throws {Error} Quando o seed não está isolado numa base `_e2e` explícita.
 */
export function assertE2eSeedEnvironment(source = process.env) {
    const isolatedEnvironment = assertFormalE2eEnvironment(source);

    if (source.ALLOW_E2E_SEED !== "true") {
        throw new Error("Seeds E2E exigem ALLOW_E2E_SEED=true.");
    }

    return isolatedEnvironment;
}

/**
 * Recusa userinfo parcial ou ambígua sem impor autenticação ao replica set.
 * Caracteres reservados dentro do utilizador/password têm de ser percent-encoded.
 *
 * @param {string} mongoUri URI MongoDB já não vazia.
 * @returns {void}
 * @throws {Error} Quando existe userinfo incompleta ou ambígua.
 */
function assertUnambiguousMongoCredentials(mongoUri) {
    const schemeEnd = mongoUri.indexOf("://");
    const afterScheme = mongoUri.slice(schemeEnd + 3);
    const authorityEndCandidates = [
        afterScheme.indexOf("/"),
        afterScheme.indexOf("?"),
        afterScheme.indexOf("#"),
    ].filter((index) => index >= 0);
    const authorityEnd = authorityEndCandidates.length > 0
        ? Math.min(...authorityEndCandidates)
        : afterScheme.length;
    const authority = afterScheme.slice(0, authorityEnd);
    const firstAt = authority.indexOf("@");

    if (firstAt < 0) return;
    if (firstAt !== authority.lastIndexOf("@")) {
        throw new Error("DEMO_MONGODB_URI contém credenciais ambíguas.");
    }

    const userInfo = authority.slice(0, firstAt);
    const separator = userInfo.indexOf(":");
    if (
        separator <= 0 ||
        separator === userInfo.length - 1 ||
        separator !== userInfo.lastIndexOf(":")
    ) {
        throw new Error("DEMO_MONGODB_URI contém credenciais ambíguas.");
    }

    try {
        const username = decodeURIComponent(userInfo.slice(0, separator));
        const password = decodeURIComponent(userInfo.slice(separator + 1));
        if (!username || !password) {
            throw new Error("empty credentials");
        }
    } catch {
        throw new Error("DEMO_MONGODB_URI contém credenciais ambíguas.");
    }
}

/**
 * Constrói a identidade canónica de um replica set exclusivamente loopback.
 *
 * @param {string} mongoUri URI `mongodb://` explícita.
 * @returns {{ targetIdentity: string, targetKind: "loopback-replica-set" }} Alvo seguro.
 */
function parseLoopbackReplicaSetTarget(mongoUri) {
    const withoutScheme = mongoUri.slice("mongodb://".length);
    const authorityEndCandidates = [
        withoutScheme.indexOf("/"),
        withoutScheme.indexOf("?"),
        withoutScheme.indexOf("#"),
    ].filter((index) => index >= 0);
    const authorityEnd = authorityEndCandidates.length > 0
        ? Math.min(...authorityEndCandidates)
        : withoutScheme.length;
    const authority = withoutScheme.slice(0, authorityEnd);
    const remainder = withoutScheme.slice(authorityEnd);
    const hostsText = authority.includes("@")
        ? authority.slice(authority.lastIndexOf("@") + 1)
        : authority;
    const authorityParts = authority.split("@");
    const rawHosts = hostsText.split(",");

    if (
        !authority ||
        !hostsText ||
        authorityParts.length > 2 ||
        (authorityParts.length === 2 &&
            (!authorityParts[0] || !authorityParts[0].includes(":"))) ||
        rawHosts.some((host) => !host)
    ) {
        throw new Error("DEMO_MONGODB_URI local tem hosts invalidos.");
    }

    const canonicalHosts = rawHosts.map((host) => {
        let parsedHost;
        try {
            parsedHost = new URL(`mongodb://${host}`);
        } catch {
            throw new Error("DEMO_MONGODB_URI local tem hosts invalidos.");
        }
        const hostname = parsedHost.hostname.toLowerCase();
        if (!["localhost", "127.0.0.1", "[::1]"].includes(hostname)) {
            throw new Error(
                "DEMO_MONGODB_URI mongodb:// aceita exclusivamente hosts loopback.",
            );
        }
        return `${hostname}${parsedHost.port ? `:${parsedHost.port}` : ""}`;
    });

    const queryStart = remainder.indexOf("?");
    const pathname = queryStart >= 0
        ? remainder.slice(0, queryStart)
        : remainder;
    const query = queryStart >= 0 ? remainder.slice(queryStart + 1) : "";
    if (pathname !== "" && pathname !== "/") {
        throw new Error(
            "DEMO_MONGODB_URI não pode incluir o nome da base no pathname.",
        );
    }
    if (remainder.includes("#")) {
        throw new Error("DEMO_MONGODB_URI local nao pode incluir fragmentos.");
    }

    const params = new URLSearchParams(query);
    const queryKeys = [...params.keys()];
    if (
        query.includes("%") ||
        queryKeys.length !== 1 ||
        queryKeys[0] !== "replicaSet" ||
        params.getAll("replicaSet").length !== 1
    ) {
        throw new Error(
            "DEMO_MONGODB_URI local exige apenas replicaSet=<ASCII> explicito.",
        );
    }
    const replicaSet = params.get("replicaSet") ?? "";
    if (!/^[A-Za-z0-9._-]{1,128}$/u.test(replicaSet)) {
        throw new Error(
            "DEMO_MONGODB_URI local exige replicaSet=<ASCII> explicito.",
        );
    }

    return {
        targetIdentity: `local-replica-set:${replicaSet}@${canonicalHosts.join(",")}`,
        targetKind: "loopback-replica-set",
    };
}

/**
 * Valida um alvo demo Atlas SRV ou replica set exclusivamente loopback.
 *
 * @param {Record<string, string | undefined>} source Ambiente.
 * @returns {{ mongoUri: string, mongoDbName: string, atlasHost: string, targetIdentity: string, targetKind: "atlas"|"loopback-replica-set", resetConfirmation: string, referenceDate: Date, dataSeed: string }} Configuração segura.
 */
function parseDemoMongoTarget(source) {
    const mongoUri = requireEnvironmentValue(source, "DEMO_MONGODB_URI");
    const mongoDbName = requireEnvironmentValue(source, "DEMO_MONGODB_DB_NAME");
    assertUnambiguousMongoCredentials(mongoUri);
    let target;
    if (mongoUri.startsWith("mongodb+srv://")) {
        let parsed;
        try {
            parsed = new URL(mongoUri);
        } catch {
            throw new Error("DEMO_MONGODB_URI tem de ser uma URI MongoDB valida.");
        }
        if (!parsed.hostname.toLowerCase().endsWith(".mongodb.net")) {
            throw new Error(
                "DEMO_MONGODB_URI SRV tem de apontar para MongoDB Atlas.",
            );
        }
        if (
            (parsed.pathname !== "" && parsed.pathname !== "/") ||
            parsed.hash
        ) {
            throw new Error(
                "DEMO_MONGODB_URI não pode incluir o nome da base no pathname nem fragmentos.",
            );
        }
        target = {
            targetIdentity: parsed.hostname.toLowerCase(),
            targetKind: "atlas",
        };
    } else if (mongoUri.startsWith("mongodb://")) {
        target = parseLoopbackReplicaSetTarget(mongoUri);
    } else {
        throw new Error(
            "DEMO_MONGODB_URI tem de usar Atlas SRV ou replica set mongodb:// exclusivamente loopback.",
        );
    }

    if (!/^[A-Za-z0-9_-]+$/u.test(mongoDbName) || !mongoDbName.endsWith("_demo")) {
        throw new Error(
            "DEMO_MONGODB_DB_NAME tem de ser ASCII seguro e terminar em _demo.",
        );
    }

    if (FORBIDDEN_DEMO_DATABASE_SEGMENT.test(mongoDbName)) {
        throw new Error(
            "DEMO_MONGODB_DB_NAME não pode identificar produção, staging, live, main ou uma base partilhada.",
        );
    }

    if (source.MONGODB_DB_NAME?.trim() === mongoDbName) {
        throw new Error(
            "DEMO_MONGODB_DB_NAME tem de ser diferente da base normal da aplicação.",
        );
    }

    const resetConfirmation = `${target.targetIdentity}/${mongoDbName}`;
    const referenceDateText = source.DEMO_REFERENCE_DATE?.trim();
    if (
        referenceDateText &&
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u.test(referenceDateText)
    ) {
        throw new Error(
            "DEMO_REFERENCE_DATE tem de ser um instante ISO-8601 UTC completo.",
        );
    }

    const referenceDate = referenceDateText
        ? new Date(referenceDateText)
        : (() => {
              const now = new Date();
              return new Date(Date.UTC(
                  now.getUTCFullYear(),
                  now.getUTCMonth(),
                  now.getUTCDate(),
                  12,
              ));
          })();

    if (Number.isNaN(referenceDate.getTime())) {
        throw new Error("DEMO_REFERENCE_DATE tem de ser uma data ISO-8601 válida.");
    }

    const dataSeed = (source.DEMO_DATA_SEED ?? DEFAULT_DEMO_DATA_SEED).trim();
    if (!/^[A-Za-z0-9._-]{3,80}$/u.test(dataSeed)) {
        throw new Error("DEMO_DATA_SEED tem de ser um identificador ASCII seguro.");
    }

    return {
        mongoUri,
        mongoDbName,
        // Campo legacy preservado para validar marcadores Atlas já existentes.
        atlasHost: target.targetIdentity,
        ...target,
        resetConfirmation,
        referenceDate,
        dataSeed,
    };
}

/**
 * Valida o alvo MongoDB necessário ao verificador read-only da demo.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {{ mongoUri: string, mongoDbName: string, atlasHost: string, resetConfirmation: string, referenceDate: Date, dataSeed: string }} Configuração sanitizada.
 */
export function assertDemoVerifyEnvironment(source = process.env) {
    if (source.NODE_ENV?.trim().toLowerCase() === "production") {
        throw new Error("A verificação demo é proibida em NODE_ENV=production.");
    }
    return parseDemoMongoTarget(source);
}

export function assertDemoSeedEnvironment(source = process.env) {
    if (source.NODE_ENV?.trim().toLowerCase() !== "development") {
        throw new Error("Seeds demo exigem NODE_ENV=development.");
    }

    if (source.ALLOW_DEMO_SEED !== "true") {
        throw new Error("Seeds demo exigem ALLOW_DEMO_SEED=true.");
    }

    if (source.ALLOW_DEMO_RESET !== "true") {
        throw new Error("O reset demo exige ALLOW_DEMO_RESET=true.");
    }

    const adminPassword = requireEnvironmentValue(source, "DEMO_ADMIN_PASSWORD");
    const userPassword = requireEnvironmentValue(source, "DEMO_USER_PASSWORD");

    for (const [name, password] of [
        ["DEMO_ADMIN_PASSWORD", adminPassword],
        ["DEMO_USER_PASSWORD", userPassword],
    ]) {
        if (password.length < MINIMUM_SEED_PASSWORD_LENGTH) {
            throw new Error(`${name} tem de ter pelo menos 12 caracteres.`);
        }

        if (password === LEGACY_DEMO_PASSWORD) {
            throw new Error(`${name} não pode reutilizar a password demo antiga.`);
        }
    }

    if (adminPassword === userPassword) {
        throw new Error(
            "DEMO_ADMIN_PASSWORD e DEMO_USER_PASSWORD têm de ser diferentes.",
        );
    }

    const target = parseDemoMongoTarget(source);
    if (source.DEMO_RESET_CONFIRM !== target.resetConfirmation) {
        throw new Error(
            "DEMO_RESET_CONFIRM tem de corresponder exatamente a <identidade-do-alvo>/<base_demo>.",
        );
    }

    return {
        ...target,
        adminPassword,
        userPassword,
        allowAdoption: source.ALLOW_DEMO_DATABASE_ADOPTION === "true",
    };
}

/**
 * Confirma que uma base não vazia pertence ao dataset demo antes do drop.
 *
 * @param {import("mongodb").Db} db Base demo dedicada.
 * @param {{ mongoDbName: string, atlasHost?: string, targetIdentity?: string, allowAdoption: boolean }} config Configuração validada.
 * @returns {Promise<{ empty: boolean, adopted: boolean }>} Decisão de propriedade.
 */
export async function assertDemoDatabaseOwnership(db, config) {
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    if (collections.length === 0) {
        return { empty: true, adopted: false };
    }

    const marker = await db.collection(DEMO_MARKER_COLLECTION).findOne({
        _id: DEMO_MARKER_ID,
    });
    if (marker) {
        const configuredTarget = config.targetIdentity ?? config.atlasHost;
        const markerTarget = marker.targetIdentity ?? marker.atlasHost;
        if (
            marker.databaseName !== config.mongoDbName ||
            markerTarget !== configuredTarget ||
            marker.fixtureVersion !== DEMO_FIXTURE_VERSION
        ) {
            throw new Error(
                "O marcador da base demo não corresponde ao alvo ou à versão esperada.",
            );
        }
        return { empty: false, adopted: false };
    }

    if (!config.allowAdoption) {
        throw new Error(
            "A base demo não está vazia nem tem marcador. Usa ALLOW_DEMO_DATABASE_ADOPTION=true apenas para a adoção inicial consciente.",
        );
    }

    return { empty: false, adopted: true };
}

/**
 * Elimina a base apenas depois de confirmar integralmente a propriedade.
 *
 * @param {import("mongodb").Db} db Base demo dedicada.
 * @param {{ mongoDbName: string, atlasHost?: string, targetIdentity?: string, allowAdoption: boolean }} config Configuração validada.
 * @returns {Promise<{ empty: boolean, adopted: boolean }>} Estado anterior.
 */
export async function resetOwnedDemoDatabase(db, config) {
    const ownership = await assertDemoDatabaseOwnership(db, config);
    await db.dropDatabase();
    return ownership;
}

/**
 * Exige opt-in explícito para seeds editoriais que usam a base configurada.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {void}
 * @throws {Error} Quando o seed não foi autorizado ou está em produção.
 */
export function assertEditorialSeedEnvironment(source = process.env) {
    if (source.ALLOW_EDITORIAL_SEED !== "true") {
        throw new Error(
            "Seeds editoriais exigem ALLOW_EDITORIAL_SEED=true.",
        );
    }

    if (source.NODE_ENV?.trim().toLowerCase() === "production") {
        throw new Error("Seeds editoriais são proibidos em NODE_ENV=production.");
    }
}

/**
 * Falha antes do cleanup se um identificador reservado pertencer a dados sem
 * o marcador esperado.
 *
 * @param {import("mongodb").Db} db Base de dados já isolada/autorizada.
 * @param {string} collectionName Coleção a verificar.
 * @param {object[]} clauses IDs, emails, slugs ou referências reservadas.
 * @param {{ markerField: string, markerValue: string, label: string }} options Opções.
 * @returns {Promise<void>}
 * @throws {Error} Quando existe uma colisão não-fixture.
 */
export async function assertNoNonFixtureConflicts(
    db,
    collectionName,
    clauses,
    { markerField, markerValue, label },
) {
    if (clauses.length === 0) {
        return;
    }

    const existing = await db.collection(collectionName).findOne({
        $and: [
            { $or: clauses },
            { [markerField]: { $ne: markerValue } },
        ],
    });

    if (existing) {
        throw new Error(
            `${label} colide com dados sem ${markerField}="${markerValue}". Cleanup recusado.`,
        );
    }
}

/**
 * Apaga exclusivamente documentos com o marcador exato da fixture.
 *
 * @param {import("mongodb").Db} db Base de dados já isolada/autorizada.
 * @param {string} collectionName Coleção a limpar.
 * @param {{ markerField: string, markerValue: string }} options Marcador obrigatório.
 * @returns {Promise<number>} Quantidade de documentos removidos.
 */
export async function deleteMarkedFixtureDocuments(
    db,
    collectionName,
    { markerField, markerValue },
) {
    const result = await db.collection(collectionName).deleteMany({
        [markerField]: markerValue,
    });

    return result.deletedCount ?? 0;
}

/**
 * Valida todo um plano de cleanup antes da primeira escrita e remove apenas o marcador.
 *
 * A pré-validação integral impede que uma colisão numa coleção tardia deixe as
 * coleções anteriores parcialmente limpas. Os filtros reservados nunca são
 * reutilizados no `deleteMany`; servem apenas para recusar dados não-fixture.
 *
 * @param {import("mongodb").Db} db Base E2E já autorizada.
 * @param {Array<{ collectionName: string, clauses: object[], label: string }>} plan Plano completo.
 * @param {{ markerField: string, markerValue: string }} options Marcador exato.
 * @returns {Promise<number>} Total de documentos fixture removidos.
 */
export async function cleanupMarkedFixtureCollections(db, plan, options) {
    for (const entry of plan) {
        await assertNoNonFixtureConflicts(
            db,
            entry.collectionName,
            entry.clauses,
            { ...options, label: entry.label },
        );
    }

    let deletedCount = 0;
    for (const entry of plan) {
        deletedCount += await deleteMarkedFixtureDocuments(
            db,
            entry.collectionName,
            options,
        );
    }
    return deletedCount;
}

/**
 * Abre a base E2E explícita e redireciona os services para essa instância.
 *
 * Os imports que carregam MongoDB e a configuração da app são deliberadamente
 * dinâmicos: importar este módulo para testes de guard não lê `.env` nem liga à DB.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {Promise<{ db: import("mongodb").Db, close: () => Promise<void> }>} Contexto E2E.
 */
async function openE2eSeedDatabase(source = process.env) {
    const { mongoUri, mongoDbName } = assertE2eSeedEnvironment(source);
    const [{ MongoClient }, { setDbForTests }] = await Promise.all([
        import("mongodb"),
        import("../src/config/database.js"),
    ]);
    const client = new MongoClient(mongoUri);

    await client.connect();

    const db = client.db(mongoDbName);
    setDbForTests(db);

    return {
        db,
        async close() {
            setDbForTests(null);
            await client.close();
        },
    };
}

/**
 * Executa um seed E2E com configuração explícita e fecha sempre a ligação.
 *
 * @param {(db: import("mongodb").Db) => Promise<unknown>} seedFn Seed a executar.
 * @param {string} label Nome seguro para logs.
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {Promise<void>}
 */
export async function runE2eSeedCli(seedFn, label, source = process.env) {
    let context;

    try {
        context = await openE2eSeedDatabase(source);
        await seedFn(context.db);
    } catch (error) {
        console.error(`${label} falhou: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await context?.close();
    }
}
