/**
 * @file Guardas e workflows seguros para backup e verificação local de restore.
 *
 * O módulo não lê a configuração normal da aplicação. As operações exigem uma
 * URI e uma base dedicadas a ferramentas, opt-in explícito e ficheiros
 * absolutos. A URI é entregue a `mongodump`/`mongorestore` através de um ficheiro
 * temporário `0600`; nunca aparece nos argumentos do processo ou nos resumos.
 */

import { spawn as nodeSpawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import {
    chmod,
    link,
    lstat,
    mkdtemp,
    readFile,
    rm,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";
import { MongoClient } from "mongodb";

const INTERNAL_DATABASES = new Set(["admin", "config", "local"]);
const MANIFEST_SUFFIX = ".manifest.json";
const MANIFEST_KIND = "faithflix-mongodb-backup";
const MANIFEST_VERSION = 1;
const MAX_MANIFEST_BYTES = 1024 * 1024;
const RESTORE_MARKER_COLLECTION = "__faithflix_restore_verification_control";
const RESTORE_MARKER_ID = "ownership";
const SAFE_TOOL_ENVIRONMENT_NAMES = [
    "HOME",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "PATH",
    "PATHEXT",
    "SSL_CERT_DIR",
    "SSL_CERT_FILE",
    "SYSTEMROOT",
    "TEMP",
    "TMP",
    "TMPDIR",
    "WINDIR",
];

const defaultFileSystem = {
    chmod,
    link,
    lstat,
    mkdtemp,
    readFile,
    rm,
    writeFile,
};

/**
 * Erro operacional seguro, com código estável e sem segredos.
 */
export class DatabaseToolsError extends Error {
    /**
     * @param {string} code Código público estável.
     * @param {string} message Mensagem segura para o operador.
     * @param {ErrorOptions} [options] Causa interna, nunca serializada pelo CLI.
     */
    constructor(code, message, options) {
        super(message, options);
        this.name = "DatabaseToolsError";
        this.code = code;
    }
}

/**
 * Resolve dependências substituíveis para unit tests sem processos ou MongoDB.
 *
 * @param {object} [overrides] Doubles opcionais.
 * @returns {object} Dependências completas.
 */
function resolveDependencies(overrides = {}) {
    return {
        ...overrides,
        createReadStream: overrides.createReadStream ?? createReadStream,
        fileSystem: {
            ...defaultFileSystem,
            ...overrides.fileSystem,
        },
        mongoClientFactory:
            overrides.mongoClientFactory ??
            ((uri) => new MongoClient(uri, { appName: "faithflix-database-tools" })),
        now: overrides.now ?? (() => new Date()),
        randomRunId:
            overrides.randomRunId ??
            (() => randomBytes(8).toString("hex")),
        spawn: overrides.spawn ?? nodeSpawn,
        tempRoot: overrides.tempRoot ?? tmpdir(),
    };
}

/**
 * Cria um erro seguro e uniforme.
 *
 * @param {string} code Código.
 * @param {string} message Mensagem.
 * @param {unknown} [cause] Causa interna.
 * @returns {DatabaseToolsError} Erro.
 */
function safetyError(code, message, cause) {
    const options = cause instanceof Error ? { cause } : undefined;
    return new DatabaseToolsError(code, message, options);
}

/**
 * Exige uma variável não vazia sem revelar o respetivo valor.
 *
 * @param {Record<string, string | undefined>} environment Ambiente.
 * @param {string} name Nome da variável.
 * @returns {string} Valor sem whitespace periférico.
 */
function requireEnvironmentValue(environment, name) {
    const raw = environment[name];
    const value = typeof raw === "string" ? raw.trim() : "";

    if (!value) {
        throw safetyError(
            "DATABASE_TOOLS_ENV_REQUIRED",
            `${name} tem de ser definida explicitamente.`,
        );
    }

    return value;
}

/**
 * Valida o nome de uma DB passada às ferramentas e aos namespaces MongoDB.
 *
 * A allowlist ASCII evita nomes ambíguos nos padrões `--nsFrom/--nsTo`. As DBs
 * internas MongoDB nunca são alvos válidos destes scripts.
 *
 * @param {string} databaseName Nome a validar.
 * @returns {string} Nome seguro.
 */
export function assertSafeDatabaseName(databaseName) {
    if (
        typeof databaseName !== "string" ||
        databaseName.trim() !== databaseName ||
        !/^[A-Za-z0-9_-]+$/u.test(databaseName)
    ) {
        throw safetyError(
            "DATABASE_TOOLS_DATABASE_INVALID",
            "DATABASE_TOOLS_MONGODB_DB_NAME tem de usar apenas letras ASCII, números, '_' ou '-'.",
        );
    }

    if (INTERNAL_DATABASES.has(databaseName.toLowerCase())) {
        throw safetyError(
            "DATABASE_TOOLS_DATABASE_PROTECTED",
            "As bases internas MongoDB não podem ser usadas por estas ferramentas.",
        );
    }

    return databaseName;
}

/**
 * Lê exclusivamente a configuração dedicada às ferramentas de base de dados.
 *
 * Não existe fallback para `MONGODB_URI` ou `MONGODB_DB_NAME`.
 *
 * @param {Record<string, string | undefined>} [environment=process.env] Ambiente.
 * @returns {{ mongoUri: string, databaseName: string }} Configuração explícita.
 */
export function assertDatabaseToolsEnvironment(environment = process.env) {
    const mongoUri = requireEnvironmentValue(
        environment,
        "DATABASE_TOOLS_MONGODB_URI",
    );
    const databaseName = assertSafeDatabaseName(
        requireEnvironmentValue(
            environment,
            "DATABASE_TOOLS_MONGODB_DB_NAME",
        ),
    );

    if (!/^mongodb(?:\+srv)?:\/\//u.test(mongoUri) || /[\u0000-\u001f\u007f]/u.test(mongoUri)) {
        throw safetyError(
            "DATABASE_TOOLS_URI_INVALID",
            "DATABASE_TOOLS_MONGODB_URI não contém uma URI MongoDB válida.",
        );
    }

    return { mongoUri, databaseName };
}

/**
 * Exige o opt-in exato da operação que pode escrever ficheiros ou uma DB temp.
 *
 * @param {"backup" | "restore"} operation Operação.
 * @param {Record<string, string | undefined>} [environment=process.env] Ambiente.
 * @returns {void}
 */
export function assertDatabaseToolsWriteAllowed(
    operation,
    environment = process.env,
) {
    const variable = operation === "backup"
        ? "ALLOW_DATABASE_BACKUP"
        : operation === "restore"
            ? "ALLOW_DATABASE_RESTORE_VERIFY"
            : null;

    if (!variable) {
        throw safetyError(
            "DATABASE_TOOLS_OPERATION_INVALID",
            "Operação de base de dados desconhecida.",
        );
    }

    if (environment[variable] !== "true") {
        throw safetyError(
            "DATABASE_TOOLS_WRITE_NOT_ALLOWED",
            `${variable}=true é obrigatório para esta operação.`,
        );
    }
}

/**
 * Processa o único argumento público dos CLIs. Não existe argumento de target.
 *
 * @param {string[]} argv Argumentos sem `node`/script.
 * @returns {{ help: boolean, archivePath?: string }} Argumentos normalizados.
 */
export function parseDatabaseToolArguments(argv) {
    if (argv.length === 1 && ["--help", "-h"].includes(argv[0])) {
        return { help: true };
    }

    let archivePath;

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        if (argument === "--archive") {
            if (archivePath !== undefined || index + 1 >= argv.length) {
                throw safetyError(
                    "DATABASE_TOOLS_ARGUMENT_INVALID",
                    "O argumento --archive tem de ser fornecido exatamente uma vez.",
                );
            }
            archivePath = argv[index + 1];
            index += 1;
            continue;
        }

        if (argument.startsWith("--archive=")) {
            if (archivePath !== undefined) {
                throw safetyError(
                    "DATABASE_TOOLS_ARGUMENT_INVALID",
                    "O argumento --archive tem de ser fornecido exatamente uma vez.",
                );
            }
            archivePath = argument.slice("--archive=".length);
            continue;
        }

        throw safetyError(
            "DATABASE_TOOLS_ARGUMENT_INVALID",
            "Argumento inválido. Apenas --archive /caminho/absoluto é aceite.",
        );
    }

    if (!archivePath) {
        throw safetyError(
            "DATABASE_TOOLS_ARCHIVE_REQUIRED",
            "É obrigatório indicar --archive com um caminho absoluto.",
        );
    }

    if (!isAbsolute(archivePath)) {
        throw safetyError(
            "DATABASE_TOOLS_ARCHIVE_NOT_ABSOLUTE",
            "O caminho de --archive tem de ser absoluto.",
        );
    }

    return { help: false, archivePath };
}

/**
 * Constrói o nome exclusivo da DB temporária de verificação.
 *
 * @param {string} sourceDatabase Base declarada no manifest.
 * @param {string} runId ID aleatório interno, nunca recebido pelo CLI.
 * @returns {string} Target `<source>_restore_verify_<runId>`.
 */
export function buildRestoreVerificationTarget(sourceDatabase, runId) {
    const source = assertSafeDatabaseName(sourceDatabase);

    if (typeof runId !== "string" || !/^[a-f0-9]{12,32}$/u.test(runId)) {
        throw safetyError(
            "DATABASE_TOOLS_RUN_ID_INVALID",
            "Não foi possível gerar um identificador seguro para o restore.",
        );
    }

    const target = `${source}_restore_verify_${runId}`;
    if (Buffer.byteLength(target, "utf8") >= 64) {
        throw safetyError(
            "DATABASE_TOOLS_TARGET_TOO_LONG",
            "O nome da base de origem é demasiado longo para gerar um target temporário seguro.",
        );
    }

    return target;
}

/**
 * Confirma antes de qualquer cleanup que o target é o derivado esperado.
 *
 * @param {string} sourceDatabase DB de origem.
 * @param {string} runId ID interno.
 * @param {string} targetDatabase DB a eliminar.
 * @returns {void}
 */
function assertGeneratedRestoreTarget(sourceDatabase, runId, targetDatabase) {
    if (targetDatabase !== buildRestoreVerificationTarget(sourceDatabase, runId)) {
        throw safetyError(
            "DATABASE_TOOLS_TARGET_NOT_OWNED",
            "Cleanup recusado porque o target não pertence a esta verificação.",
        );
    }
}

/**
 * Obtém metadata de ficheiro, distinguindo ausência de outros erros de I/O.
 *
 * @param {string} path Caminho.
 * @param {object} fileSystem API de filesystem.
 * @returns {Promise<import("node:fs").Stats | null>} Stats ou null.
 */
async function optionalLstat(path, fileSystem) {
    try {
        return await fileSystem.lstat(path);
    } catch (error) {
        if (error?.code === "ENOENT") return null;
        throw safetyError(
            "DATABASE_TOOLS_FILE_ACCESS_FAILED",
            "Não foi possível validar os ficheiros da operação.",
            error,
        );
    }
}

/**
 * Recusa publicação sobre archive ou manifest existentes.
 *
 * @param {string} archivePath Caminho final.
 * @param {object} fileSystem API de filesystem.
 * @returns {Promise<void>}
 */
async function assertBackupPathsAvailable(archivePath, fileSystem) {
    const manifestPath = `${archivePath}${MANIFEST_SUFFIX}`;
    const [archiveStats, manifestStats] = await Promise.all([
        optionalLstat(archivePath, fileSystem),
        optionalLstat(manifestPath, fileSystem),
    ]);

    if (archiveStats || manifestStats) {
        throw safetyError(
            "DATABASE_TOOLS_ARCHIVE_EXISTS",
            "O archive ou o respetivo manifest já existe; overwrite recusado.",
        );
    }
}

/**
 * Valida um ficheiro regular existente, recusando symlinks.
 *
 * @param {string} path Caminho absoluto.
 * @param {object} fileSystem API de filesystem.
 * @param {string} label Nome seguro.
 * @returns {Promise<import("node:fs").Stats>} Stats.
 */
async function assertRegularFile(path, fileSystem, label) {
    const stats = await optionalLstat(path, fileSystem);
    if (!stats || !stats.isFile() || stats.isSymbolicLink()) {
        throw safetyError(
            "DATABASE_TOOLS_FILE_INVALID",
            `${label} tem de ser um ficheiro regular existente e não pode ser symlink.`,
        );
    }
    return stats;
}

/**
 * Calcula SHA-256 por streaming para não carregar archives em memória.
 *
 * @param {string} path Ficheiro.
 * @param {(path: string) => import("node:fs").ReadStream} streamFactory Factory.
 * @returns {Promise<string>} Digest hexadecimal.
 */
export async function calculateFileSha256(path, streamFactory = createReadStream) {
    const hash = createHash("sha256");
    const stream = streamFactory(path);

    for await (const chunk of stream) {
        hash.update(chunk);
    }

    return hash.digest("hex");
}

/**
 * Lista coleções/views e respetivas contagens de documentos de modo estável.
 *
 * @param {import("mongodb").Db} db Base MongoDB ou double.
 * @param {{ excludeRestoreMarker?: boolean }} [options] Exclusões internas.
 * @returns {Promise<Array<{ name: string, type: string, documentCount: number }>>} Inventário.
 */
export async function collectDatabaseInventory(
    db,
    { excludeRestoreMarker = false } = {},
) {
    const definitions = await db.listCollections({}, { nameOnly: false }).toArray();
    const inventory = [];

    for (const definition of [...definitions].sort((left, right) =>
        String(left.name).localeCompare(String(right.name)))) {
        const name = String(definition.name ?? "");
        if (!name) {
            throw safetyError(
                "DATABASE_TOOLS_INVENTORY_INVALID",
                "A base devolveu uma coleção sem nome válido.",
            );
        }
        if (excludeRestoreMarker && name === RESTORE_MARKER_COLLECTION) continue;
        if (!excludeRestoreMarker && name === RESTORE_MARKER_COLLECTION) {
            throw safetyError(
                "DATABASE_TOOLS_RESERVED_COLLECTION",
                "A base de origem usa uma coleção reservada pela verificação de restore.",
            );
        }

        const documentCount = await db.collection(name).countDocuments({});
        if (!Number.isSafeInteger(documentCount) || documentCount < 0) {
            throw safetyError(
                "DATABASE_TOOLS_INVENTORY_INVALID",
                "A base devolveu uma contagem de documentos inválida.",
            );
        }

        inventory.push({
            name,
            type: typeof definition.type === "string"
                ? definition.type
                : "collection",
            documentCount,
        });
    }

    return inventory;
}

/**
 * Compara inventários já ordenados sem expor nomes em mensagens de erro.
 *
 * @param {object[]} expected Inventário esperado.
 * @param {object[]} actual Inventário observado.
 * @param {string} code Código em caso de drift.
 * @param {string} message Mensagem segura.
 * @returns {void}
 */
function assertInventoryEqual(expected, actual, code, message) {
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        throw safetyError(code, message);
    }
}

/**
 * Cria e remove um config MongoDB Tools privado em torno da callback.
 *
 * @template T
 * @param {string} mongoUri URI secreta.
 * @param {object} dependencies Dependências resolvidas.
 * @param {(configPath: string) => Promise<T>} work Trabalho.
 * @returns {Promise<T>} Resultado.
 */
async function withPrivateMongoToolsConfig(mongoUri, dependencies, work) {
    const { fileSystem, tempRoot } = dependencies;
    const directory = await fileSystem.mkdtemp(
        join(tempRoot, "faithflix-mongo-tools-"),
    );
    const configPath = join(directory, "mongo-tools.yml");

    try {
        await fileSystem.chmod(directory, 0o700);
        await fileSystem.writeFile(
            configPath,
            `uri: ${JSON.stringify(mongoUri)}\n`,
            { encoding: "utf8", flag: "wx", mode: 0o600 },
        );
        await fileSystem.chmod(configPath, 0o600);
        return await work(configPath);
    } finally {
        await fileSystem.rm(directory, { force: true, recursive: true });
    }
}

/**
 * Executa uma MongoDB Database Tool sem shell e sem herdar output potencialmente
 * sensível. A ausência do binário é classificada como bloqueio de ambiente.
 *
 * @param {{ binary: "mongodump" | "mongorestore", args: string[], environment?: Record<string, string | undefined>, spawnImpl?: typeof nodeSpawn }} input Configuração.
 * @returns {Promise<void>}
 */
export async function runMongoDatabaseTool({
    binary,
    args,
    environment = process.env,
    spawnImpl = nodeSpawn,
}) {
    if (!["mongodump", "mongorestore"].includes(binary)) {
        throw safetyError(
            "DATABASE_TOOL_BINARY_INVALID",
            "Ferramenta MongoDB não autorizada.",
        );
    }

    if (args.some((argument) => /mongodb(?:\+srv)?:\/\//u.test(argument))) {
        throw safetyError(
            "DATABASE_TOOL_SECRET_IN_ARGUMENTS",
            "A execução recusou uma URI MongoDB nos argumentos do processo.",
        );
    }

    // O subprocesso recebe apenas o mínimo operacional. Em particular, não
    // herda URI, peppers, tokens, passwords ou `NODE_OPTIONS` do processo pai.
    const childEnvironment = Object.fromEntries(
        SAFE_TOOL_ENVIRONMENT_NAMES.flatMap((name) =>
            typeof environment[name] === "string"
                ? [[name, environment[name]]]
                : []),
    );

    await new Promise((resolve, reject) => {
        let settled = false;
        const child = spawnImpl(binary, args, {
            env: childEnvironment,
            shell: false,
            stdio: "ignore",
        });

        const settle = (callback) => {
            if (settled) return;
            settled = true;
            callback();
        };

        child.once("error", (error) => {
            settle(() => {
                if (error?.code === "ENOENT") {
                    reject(safetyError(
                        "DATABASE_TOOL_UNAVAILABLE",
                        `${binary} não está instalado ou não está disponível no PATH.`,
                        error,
                    ));
                    return;
                }
                reject(safetyError(
                    "DATABASE_TOOL_START_FAILED",
                    `Não foi possível iniciar ${binary}.`,
                    error,
                ));
            });
        });

        child.once("close", (code, signal) => {
            settle(() => {
                if (code === 0 && signal === null) {
                    resolve();
                    return;
                }
                reject(safetyError(
                    "DATABASE_TOOL_FAILED",
                    `${binary} terminou com erro; o output potencialmente sensível foi omitido.`,
                ));
            });
        });
    });
}

/**
 * Valida e normaliza um manifest lido do disco.
 *
 * @param {unknown} input JSON já processado.
 * @param {string} expectedDatabase DB explicitamente configurada.
 * @param {string} expectedArchiveFile Nome do archive recebido.
 * @returns {object} Manifest seguro.
 */
function validateManifest(input, expectedDatabase, expectedArchiveFile) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw safetyError(
            "DATABASE_TOOLS_MANIFEST_INVALID",
            "O manifest de backup é inválido.",
        );
    }

    const manifest = input;
    if (
        manifest.kind !== MANIFEST_KIND ||
        manifest.schemaVersion !== MANIFEST_VERSION ||
        manifest.database !== expectedDatabase ||
        manifest.archiveFile !== expectedArchiveFile ||
        !/^[a-f0-9]{64}$/u.test(manifest.sha256) ||
        !Number.isSafeInteger(manifest.sizeBytes) ||
        manifest.sizeBytes <= 0 ||
        !Array.isArray(manifest.collections)
    ) {
        throw safetyError(
            "DATABASE_TOOLS_MANIFEST_INVALID",
            "O manifest não corresponde ao archive ou à base explicitamente configurada.",
        );
    }

    const collections = manifest.collections.map((entry) => {
        if (
            !entry ||
            typeof entry !== "object" ||
            typeof entry.name !== "string" ||
            !entry.name ||
            entry.name === RESTORE_MARKER_COLLECTION ||
            typeof entry.type !== "string" ||
            !Number.isSafeInteger(entry.documentCount) ||
            entry.documentCount < 0
        ) {
            throw safetyError(
                "DATABASE_TOOLS_MANIFEST_INVALID",
                "O inventário de coleções no manifest é inválido.",
            );
        }
        return {
            name: entry.name,
            type: entry.type,
            documentCount: entry.documentCount,
        };
    });

    const sorted = [...collections].sort((left, right) =>
        left.name.localeCompare(right.name));
    if (JSON.stringify(collections) !== JSON.stringify(sorted)) {
        throw safetyError(
            "DATABASE_TOOLS_MANIFEST_INVALID",
            "O inventário de coleções no manifest não está normalizado.",
        );
    }

    return { ...manifest, collections };
}

/**
 * Abre um cliente MongoDB injetável e garante encerramento pelo chamador.
 *
 * @param {string} mongoUri URI explícita.
 * @param {object} dependencies Dependências.
 * @returns {Promise<import("mongodb").MongoClient>} Cliente ligado.
 */
async function openMongoClient(mongoUri, dependencies) {
    const client = dependencies.mongoClientFactory(mongoUri);
    try {
        await client.connect();
        return client;
    } catch (error) {
        await client.close?.().catch(() => {});
        throw safetyError(
            "DATABASE_TOOLS_CONNECTION_FAILED",
            "Não foi possível ligar à base dedicada às ferramentas.",
            error,
        );
    }
}

/**
 * Cria um archive gzip, checksum e inventário sem substituir ficheiros.
 *
 * O dump é produzido numa diretoria privada no mesmo filesystem e publicado
 * através de hard links exclusivos. Se a origem mudar em nomes/contagens durante
 * o dump, a operação falha e não publica artefactos.
 *
 * @param {{ archivePath: string, environment?: Record<string, string | undefined>, dependencies?: object }} input Opções.
 * @returns {Promise<{ archivePath: string, manifestPath: string, database: string, sha256: string, sizeBytes: number, collectionCount: number }>} Resumo sem segredos.
 */
export async function runDatabaseBackup({
    archivePath,
    environment = process.env,
    dependencies: overrides,
}) {
    const dependencies = resolveDependencies(overrides);
    const { fileSystem } = dependencies;
    const { mongoUri, databaseName } = assertDatabaseToolsEnvironment(environment);
    assertDatabaseToolsWriteAllowed("backup", environment);

    if (typeof archivePath !== "string" || !isAbsolute(archivePath)) {
        throw safetyError(
            "DATABASE_TOOLS_ARCHIVE_NOT_ABSOLUTE",
            "O caminho do archive tem de ser absoluto.",
        );
    }

    await assertBackupPathsAvailable(archivePath, fileSystem);

    const manifestPath = `${archivePath}${MANIFEST_SUFFIX}`;
    const workDirectory = await fileSystem.mkdtemp(
        join(dirname(archivePath), ".faithflix-backup-"),
    );
    const temporaryArchive = join(workDirectory, "database.archive.gz");
    const temporaryManifest = join(workDirectory, "database.manifest.json");
    let archivePublished = false;
    let manifestPublished = false;
    let client;

    try {
        await fileSystem.chmod(workDirectory, 0o700);
        client = await openMongoClient(mongoUri, dependencies);
        const database = client.db(databaseName);
        const inventoryBefore = await collectDatabaseInventory(database);

        await withPrivateMongoToolsConfig(
            mongoUri,
            dependencies,
            async (configPath) => runMongoDatabaseTool({
                binary: "mongodump",
                args: [
                    `--config=${configPath}`,
                    `--db=${databaseName}`,
                    `--archive=${temporaryArchive}`,
                    "--gzip",
                ],
                environment,
                spawnImpl: dependencies.spawn,
            }),
        );

        const archiveStats = await assertRegularFile(
            temporaryArchive,
            fileSystem,
            "O archive temporário",
        );
        if (archiveStats.size <= 0) {
            throw safetyError(
                "DATABASE_TOOLS_ARCHIVE_EMPTY",
                "mongodump produziu um archive vazio.",
            );
        }
        await fileSystem.chmod(temporaryArchive, 0o600);

        const inventoryAfter = await collectDatabaseInventory(database);
        assertInventoryEqual(
            inventoryBefore,
            inventoryAfter,
            "DATABASE_TOOLS_SOURCE_CHANGED",
            "A origem mudou durante o dump; o backup foi recusado.",
        );

        const sha256 = await calculateFileSha256(
            temporaryArchive,
            dependencies.createReadStream,
        );
        const manifest = {
            kind: MANIFEST_KIND,
            schemaVersion: MANIFEST_VERSION,
            database: databaseName,
            archiveFile: basename(archivePath),
            createdAt: dependencies.now().toISOString(),
            sha256,
            sizeBytes: archiveStats.size,
            collections: inventoryAfter,
        };

        await fileSystem.writeFile(
            temporaryManifest,
            `${JSON.stringify(manifest, null, 2)}\n`,
            { encoding: "utf8", flag: "wx", mode: 0o600 },
        );
        await fileSystem.chmod(temporaryManifest, 0o600);

        await fileSystem.link(temporaryArchive, archivePath);
        archivePublished = true;
        await fileSystem.link(temporaryManifest, manifestPath);
        manifestPublished = true;

        return {
            archivePath,
            manifestPath,
            database: databaseName,
            sha256,
            sizeBytes: archiveStats.size,
            collectionCount: inventoryAfter.length,
        };
    } catch (error) {
        if (manifestPublished) {
            await fileSystem.rm(manifestPath, { force: true });
        }
        if (archivePublished) {
            await fileSystem.rm(archivePath, { force: true });
        }
        throw error;
    } finally {
        try {
            await fileSystem.rm(workDirectory, { force: true, recursive: true });
        } finally {
            await client?.close();
        }
    }
}

/**
 * Lê e valida o manifest sidecar sem aceitar ficheiros grandes ou symlinks.
 *
 * @param {string} archivePath Archive.
 * @param {string} databaseName DB esperada.
 * @param {object} dependencies Dependências.
 * @returns {Promise<object>} Manifest validado.
 */
async function readBackupManifest(archivePath, databaseName, dependencies) {
    const manifestPath = `${archivePath}${MANIFEST_SUFFIX}`;
    const stats = await assertRegularFile(
        manifestPath,
        dependencies.fileSystem,
        "O manifest",
    );
    if (stats.size > MAX_MANIFEST_BYTES) {
        throw safetyError(
            "DATABASE_TOOLS_MANIFEST_TOO_LARGE",
            "O manifest excede o limite de segurança.",
        );
    }

    let parsed;
    try {
        parsed = JSON.parse(
            await dependencies.fileSystem.readFile(manifestPath, "utf8"),
        );
    } catch (error) {
        throw safetyError(
            "DATABASE_TOOLS_MANIFEST_INVALID",
            "O manifest de backup não contém JSON válido.",
            error,
        );
    }

    return validateManifest(parsed, databaseName, basename(archivePath));
}

/**
 * Confirma a propriedade do target através do marcador criado antes do restore.
 *
 * @param {import("mongodb").Db} database DB temporária.
 * @param {string} sourceDatabase Origem.
 * @param {string} targetDatabase Target.
 * @param {string} runId ID interno.
 * @returns {Promise<void>}
 */
async function dropOwnedRestoreTarget(
    database,
    sourceDatabase,
    targetDatabase,
    runId,
) {
    assertGeneratedRestoreTarget(sourceDatabase, runId, targetDatabase);
    const marker = await database.collection(RESTORE_MARKER_COLLECTION).findOne({
        _id: RESTORE_MARKER_ID,
    });

    if (
        marker?.runId !== runId ||
        marker?.sourceDatabase !== sourceDatabase ||
        marker?.targetDatabase !== targetDatabase
    ) {
        throw safetyError(
            "DATABASE_TOOLS_CLEANUP_OWNERSHIP_LOST",
            "Cleanup recusado porque o marcador de propriedade não corresponde.",
        );
    }

    await database.dropDatabase();
}

/**
 * Restaura para uma DB temporária gerada, verifica checksum/inventário e elimina
 * exclusivamente esse target num `finally`.
 *
 * @param {{ archivePath: string, environment?: Record<string, string | undefined>, dependencies?: object }} input Opções.
 * @returns {Promise<{ archivePath: string, database: string, targetDatabase: string, sha256: string, collectionCount: number, verified: true, cleanedUp: true }>} Resumo seguro.
 */
export async function runDatabaseRestoreVerification({
    archivePath,
    environment = process.env,
    dependencies: overrides,
}) {
    const dependencies = resolveDependencies(overrides);
    const { fileSystem } = dependencies;
    const { mongoUri, databaseName } = assertDatabaseToolsEnvironment(environment);
    assertDatabaseToolsWriteAllowed("restore", environment);

    if (typeof archivePath !== "string" || !isAbsolute(archivePath)) {
        throw safetyError(
            "DATABASE_TOOLS_ARCHIVE_NOT_ABSOLUTE",
            "O caminho do archive tem de ser absoluto.",
        );
    }

    const archiveStats = await assertRegularFile(
        archivePath,
        fileSystem,
        "O archive",
    );
    if (archiveStats.size <= 0) {
        throw safetyError(
            "DATABASE_TOOLS_ARCHIVE_EMPTY",
            "O archive está vazio.",
        );
    }

    const manifest = await readBackupManifest(
        archivePath,
        databaseName,
        dependencies,
    );
    if (manifest.sizeBytes !== archiveStats.size) {
        throw safetyError(
            "DATABASE_TOOLS_CHECKSUM_MISMATCH",
            "O tamanho do archive não corresponde ao manifest.",
        );
    }

    const actualSha256 = await calculateFileSha256(
        archivePath,
        dependencies.createReadStream,
    );
    if (actualSha256 !== manifest.sha256) {
        throw safetyError(
            "DATABASE_TOOLS_CHECKSUM_MISMATCH",
            "O checksum do archive não corresponde ao manifest.",
        );
    }

    const runId = dependencies.randomRunId();
    const targetDatabase = buildRestoreVerificationTarget(databaseName, runId);
    let client;
    let target;
    let targetOwned = false;

    try {
        client = await openMongoClient(mongoUri, dependencies);
        target = client.db(targetDatabase);
        const existing = await target.listCollections({}, { nameOnly: true }).toArray();
        if (existing.length > 0) {
            throw safetyError(
                "DATABASE_TOOLS_TARGET_EXISTS",
                "A base temporária gerada já existe; restore recusado.",
            );
        }

        await target.collection(RESTORE_MARKER_COLLECTION).insertOne({
            _id: RESTORE_MARKER_ID,
            runId,
            sourceDatabase: databaseName,
            targetDatabase,
            createdAt: dependencies.now(),
        });
        targetOwned = true;

        await withPrivateMongoToolsConfig(
            mongoUri,
            dependencies,
            async (configPath) => runMongoDatabaseTool({
                binary: "mongorestore",
                args: [
                    `--config=${configPath}`,
                    `--archive=${archivePath}`,
                    "--gzip",
                    `--nsInclude=${databaseName}.*`,
                    `--nsFrom=${databaseName}.*`,
                    `--nsTo=${targetDatabase}.*`,
                    "--drop",
                ],
                environment,
                spawnImpl: dependencies.spawn,
            }),
        );

        const restoredInventory = await collectDatabaseInventory(target, {
            excludeRestoreMarker: true,
        });
        assertInventoryEqual(
            manifest.collections,
            restoredInventory,
            "DATABASE_TOOLS_RESTORE_INVENTORY_MISMATCH",
            "As coleções restauradas não correspondem ao manifest.",
        );

        return {
            archivePath,
            database: databaseName,
            targetDatabase,
            sha256: actualSha256,
            collectionCount: restoredInventory.length,
            verified: true,
            cleanedUp: true,
        };
    } finally {
        try {
            if (targetOwned) {
                await dropOwnedRestoreTarget(
                    target,
                    databaseName,
                    targetDatabase,
                    runId,
                );
            }
        } finally {
            await client?.close();
        }
    }
}
