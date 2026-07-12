/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/taxonomy.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
    assertExpectedVersion,
    assertTaxonomyPayload,
    assertTaxonomyStatusPayload,
    parseAdminTaxonomyQuery,
} from "./catalog.validation.js";

const INITIAL_TAXONOMY_VERSION = 1;

/** @param {string} value Texto de pesquisa literal. @returns {string} Regex escapada. */
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** @param {Record<string, unknown>} taxonomy Documento persistido. @returns {number} Versão normalizada. */
function taxonomyVersion(taxonomy) {
    return Number.isSafeInteger(taxonomy?.version) && taxonomy.version >= 1
        ? taxonomy.version
        : INITIAL_TAXONOMY_VERSION;
}

/** @param {Record<string, unknown>} taxonomy Documento persistido. @returns {"active" | "archived"} Estado normalizado. */
function taxonomyStatus(taxonomy) {
    return taxonomy?.status === "archived" ? "archived" : "active";
}

/** @param {string} id Identificador recebido por HTTP. @returns {ObjectId} Identificador MongoDB seguro. */
function asTaxonomyObjectId(id) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
        throw new HttpError(400, "Taxonomia invalida.");
    }
    return new ObjectId(id);
}

/** @returns {HttpError} Conflito de concorrência editorial. */
function taxonomyVersionConflict() {
    return new HttpError(
        409,
        "A taxonomia foi alterada por outro utilizador. Recarregue e tente novamente.",
        undefined,
        "TAXONOMY_VERSION_CONFLICT",
    );
}

/**
 * Constrói o filtro CAS, incluindo documentos legados sem versão.
 *
 * @param {ObjectId} id Identificador persistido.
 * @param {number} expectedVersion Versão observada pelo cliente.
 * @returns {Record<string, unknown>} Filtro atómico.
 */
function taxonomyVersionFilter(id, expectedVersion) {
    if (expectedVersion === INITIAL_TAXONOMY_VERSION) {
        return {
            _id: id,
            $or: [
                { version: INITIAL_TAXONOMY_VERSION },
                { version: { $exists: false } },
            ],
        };
    }
    return { _id: id, version: expectedVersion };
}

/**
 * Converte um documento de taxonomia para o formato público.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, slug: string, description: string }} taxonomy - Documento de taxonomia.
 * @returns {{ id: string, name: string, slug: string, description: string }} Taxonomia pública.
 */
function publicTaxonomy(taxonomy) {
    return {
        id: String(taxonomy._id),
        name: taxonomy.name,
        slug: taxonomy.slug,
        description: taxonomy.description,
    };
}

/**
 * Converte uma taxonomia para o contrato protegido de administração.
 *
 * @param {Record<string, unknown> & {_id: ObjectId}} taxonomy Documento persistido.
 * @param {number} usageCount Número de conteúdos associados.
 * @returns {Record<string, unknown>} Resumo administrativo seguro.
 */
function adminTaxonomy(taxonomy, usageCount = 0) {
    return {
        ...publicTaxonomy(taxonomy),
        status: taxonomyStatus(taxonomy),
        version: taxonomyVersion(taxonomy),
        usageCount,
        createdAt: taxonomy.createdAt ?? null,
        updatedAt: taxonomy.updatedAt ?? null,
    };
}

/**
 * Garante que existem os índices de taxonomias.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureTaxonomyIndexes() {
    const db = await getDb();
    await db
        .collection("taxonomies")
        .createIndex({ slug: 1 }, { unique: true });
    await db
        .collection("taxonomies")
        .createIndex({ status: 1, name: 1, _id: 1 });
    await db.collection("contents").createIndex({ taxonomyIds: 1 });
}

/**
 * Lista taxonomias alfabeticamente.
 *
 * @returns {Promise<Array<ReturnType<typeof publicTaxonomy>>>} Lista pública de taxonomias.
 */
export async function listTaxonomies() {
    const db = await getDb();
    const taxonomies = await db
        .collection("taxonomies")
        .find({ $or: [{ status: "active" }, { status: { $exists: false } }] })
        .sort({ name: 1 })
        .toArray();

    return taxonomies.map(publicTaxonomy);
}

/**
 * Lista taxonomias para administração com pesquisa, estado e utilização.
 *
 * @param {Record<string, unknown>} queryParams Query params HTTP.
 * @returns {Promise<{items: Record<string, unknown>[], page: number, limit: number, total: number, totalPages: number}>} Página administrativa.
 */
export async function listAdminTaxonomies(queryParams = {}) {
    const { page, limit, search, status } = parseAdminTaxonomyQuery(queryParams);
    const db = await getDb();
    const filter = {};

    if (search) {
        filter.name = { $regex: escapeRegex(search), $options: "i" };
    }
    if (status === "archived") {
        filter.status = "archived";
    } else if (status === "active") {
        filter.$or = [{ status: "active" }, { status: { $exists: false } }];
    }

    const [taxonomies, total] = await Promise.all([
        db.collection("taxonomies")
            .find(filter)
            .sort({ name: 1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("taxonomies").countDocuments(filter),
    ]);
    const usageCounts = await Promise.all(
        taxonomies.map((taxonomy) =>
            db.collection("contents").countDocuments({ taxonomyIds: taxonomy._id }),
        ),
    );

    return {
        items: taxonomies.map((taxonomy, index) =>
            adminTaxonomy(taxonomy, usageCounts[index]),
        ),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Cria uma taxonomia editorial no catálogo.
 *
 * A função valida o payload recebido, garante que os índices únicos existem,
 * persiste o documento com metadados temporais e devolve apenas o formato
 * público usado pelas restantes camadas da aplicação.
 *
 * @param {{ name?: unknown, slug?: unknown, description?: unknown }} input Dados
 * brutos da taxonomia recebidos da camada HTTP.
 * @param {string} userId Editor autenticado.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<ReturnType<typeof publicTaxonomy>>} Taxonomia criada.
 */
export async function createTaxonomy(input, userId, context = {}) {
    await ensureTaxonomyIndexes();

    const payload = assertTaxonomyPayload(input);

    try {
        return await runInTransaction(async ({ db, session }) => {
            const now = new Date();
            const document = {
                ...payload,
                status: "active",
                version: INITIAL_TAXONOMY_VERSION,
                createdAt: now,
                updatedAt: now,
            };
            const result = await db
                .collection("taxonomies")
                .insertOne(document, { session });
            const persisted = { ...document, _id: result.insertedId };
            await writeAdminAudit({
                db,
                session,
                actorUserId: userId,
                action: "catalog.taxonomy.created",
                targetType: "taxonomy",
                targetId: result.insertedId,
                before: null,
                after: persisted,
                requestId: context.requestId,
                operationId: `taxonomy:create:${result.insertedId}`,
            });
            return publicTaxonomy(persisted);
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new HttpError(409, "Slug de taxonomia ja existe.");
        }

        throw error;
    }
}

/**
 * Atualiza metadados de uma taxonomia com CAS e audit log transacional.
 *
 * @param {string} taxonomyId Identificador da taxonomia.
 * @param {Record<string, unknown>} input Payload administrativo.
 * @param {string} userId Utilizador autenticado.
 * @param {{requestId?: string}} context Contexto seguro do pedido.
 * @returns {Promise<Record<string, unknown>>} Taxonomia atualizada.
 */
export async function updateTaxonomy(taxonomyId, input, userId, context = {}) {
    await ensureTaxonomyIndexes();
    const id = asTaxonomyObjectId(taxonomyId);
    const expectedVersion = assertExpectedVersion(input?.expectedVersion);
    const payload = assertTaxonomyPayload(input, { allowExpectedVersion: true });

    try {
        return await runInTransaction(async ({ db, session }) => {
            const before = await db.collection("taxonomies").findOne({ _id: id }, { session });
            if (!before) throw new HttpError(404, "Taxonomia nao encontrada.");
            if (taxonomyVersion(before) !== expectedVersion) throw taxonomyVersionConflict();

            const after = await db.collection("taxonomies").findOneAndUpdate(
                taxonomyVersionFilter(id, expectedVersion),
                { $set: { ...payload, version: expectedVersion + 1, updatedAt: new Date() } },
                { session, returnDocument: "after" },
            );
            if (!after) throw taxonomyVersionConflict();

            await writeAdminAudit({
                db,
                session,
                actorUserId: userId,
                action: "catalog.taxonomy.updated",
                targetType: "taxonomy",
                targetId: id,
                before,
                after,
                requestId: context.requestId,
                operationId: `taxonomy:update:${id}:${expectedVersion + 1}`,
            });
            return adminTaxonomy(after, await db.collection("contents").countDocuments({ taxonomyIds: id }));
        });
    } catch (error) {
        if (error.code === 11000) throw new HttpError(409, "Slug de taxonomia ja existe.");
        throw error;
    }
}

/**
 * Arquiva ou reativa uma taxonomia sem remover ligações existentes.
 *
 * @param {string} taxonomyId Identificador da taxonomia.
 * @param {Record<string, unknown>} input Estado e versão observada.
 * @param {string} userId Utilizador autenticado.
 * @param {{requestId?: string}} context Contexto seguro do pedido.
 * @returns {Promise<Record<string, unknown>>} Taxonomia atualizada.
 */
export async function changeTaxonomyStatus(taxonomyId, input, userId, context = {}) {
    await ensureTaxonomyIndexes();
    const id = asTaxonomyObjectId(taxonomyId);
    const { status, expectedVersion } = assertTaxonomyStatusPayload(input);

    return runInTransaction(async ({ db, session }) => {
        const before = await db.collection("taxonomies").findOne({ _id: id }, { session });
        if (!before) throw new HttpError(404, "Taxonomia nao encontrada.");
        if (taxonomyVersion(before) !== expectedVersion) throw taxonomyVersionConflict();

        const after = await db.collection("taxonomies").findOneAndUpdate(
            taxonomyVersionFilter(id, expectedVersion),
            { $set: { status, version: expectedVersion + 1, updatedAt: new Date() } },
            { session, returnDocument: "after" },
        );
        if (!after) throw taxonomyVersionConflict();
        await writeAdminAudit({
            db,
            session,
            actorUserId: userId,
            action: `catalog.taxonomy.${status}`,
            targetType: "taxonomy",
            targetId: id,
            before,
            after,
            requestId: context.requestId,
            operationId: `taxonomy:status:${id}:${expectedVersion + 1}`,
        });
        return adminTaxonomy(after, await db.collection("contents").countDocuments({ taxonomyIds: id }));
    });
}
