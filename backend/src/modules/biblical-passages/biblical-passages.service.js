/**
 * @file Serviço editorial de passagens bíblicas e respetivas associações a conteúdos.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
    asObjectId,
    assertBiblicalPassageAssociationPayload,
    assertBiblicalPassagePayload,
    assertBiblicalPassageStatus,
    parseAdminBiblicalPassageFilters,
    parseBiblicalPassagePagination,
} from "./biblical-passages.validation.js";

/**
 * Escapa uma pesquisa literal antes de a usar no MongoDB.
 *
 * @param {string} value Texto normalizado.
 * @returns {string} Texto seguro para `RegExp`.
 */
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Cria os índices usados pelo módulo de passagens.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureBiblicalPassageIndexes() {
    const db = await getDb();

    await db
        .collection("biblical_passages")
        .createIndex({ status: 1, book: 1, chapterStart: 1, verseStart: 1 });
    await db
        .collection("biblical_passages")
        .createIndex({ status: 1, updatedAt: -1, _id: 1 });
    await db
        .collection("content_biblical_passages")
        .createIndex({ contentId: 1, sortOrder: 1 });
    await db
        .collection("content_biblical_passages")
        .createIndex({ contentId: 1, passageId: 1 }, { unique: true });
}

/**
 * Formata uma referência bíblica curta para a API pública.
 *
 * @param {Record<string, unknown>} passage Documento da passagem.
 * @returns {string} Referência legível.
 */
export function formatBiblicalReference(passage) {
    const start = `${passage.book} ${passage.chapterStart}:${passage.verseStart}`;

    if (
        passage.chapterEnd === passage.chapterStart &&
        passage.verseEnd === passage.verseStart
    ) {
        return start;
    }

    if (passage.chapterEnd === passage.chapterStart) {
        return `${start}-${passage.verseEnd}`;
    }

    return `${start}-${passage.chapterEnd}:${passage.verseEnd}`;
}

/**
 * Converte uma passagem interna numa resposta pública sem metadados editoriais.
 *
 * @param {Record<string, unknown>} passage Documento interno.
 * @param {Record<string, unknown>} [association={}] Associação opcional.
 * @returns {Record<string, unknown>} Passagem pública.
 */
export function publicBiblicalPassage(passage, association = {}) {
    const text = passage.demoFixture
        ? String(passage.text ?? "")
            .replace(/^Paráfrase de demonstração sobre /u, "Paráfrase editorial sobre ")
            .replace(
                /, preparada para contextualização editorial FaithFlix\.$/u,
                ", preparada para contextualização FaithFlix.",
            )
        : passage.text;
    const note = association.demoFixture
        ? String(association.note ?? "").replace(
            /^Associação bíblica de demonstração (\d+)\.$/u,
            "Associação bíblica editorial $1.",
        )
        : association.note ?? "";

    return {
        id: String(passage._id),
        reference: formatBiblicalReference(passage),
        book: passage.book,
        chapterStart: passage.chapterStart,
        verseStart: passage.verseStart,
        chapterEnd: passage.chapterEnd,
        verseEnd: passage.verseEnd,
        translation: passage.translation,
        text,
        theme: passage.theme ?? "",
        reflection: passage.reflection ?? "",
        note,
        sortOrder: association.sortOrder ?? 0,
    };
}

/**
 * Converte uma passagem para resposta administrativa.
 *
 * @param {Record<string, unknown>} passage Documento interno.
 * @returns {Record<string, unknown>} Passagem admin.
 */
function adminBiblicalPassage(passage) {
    return {
        ...publicBiblicalPassage(passage),
        status: passage.status,
        createdAt: passage.createdAt,
        updatedAt: passage.updatedAt,
        publishedAt: passage.publishedAt ?? null,
    };
}

/**
 * Converte uma associação para gestão editorial.
 *
 * @param {Record<string, unknown>} passage Passagem associada.
 * @param {Record<string, unknown>} association Documento de associação.
 * @param {import("mongodb").ObjectId} contentId Conteúdo consultado.
 * @returns {Record<string, unknown>} Associação admin.
 */
function adminBiblicalPassageAssociation(passage, association, contentId) {
    if (!passage) {
        return {
            id: String(association.passageId),
            passageId: String(association.passageId),
            contentId: String(contentId),
            reference: "Passagem removida",
            status: "missing",
            note: association.note ?? "",
            sortOrder: association.sortOrder ?? 0,
            createdAt: association.createdAt,
        };
    }

    return {
        ...publicBiblicalPassage(passage, association),
        passageId: String(passage._id),
        contentId: String(contentId),
        status: passage.status,
        createdAt: association.createdAt,
    };
}

/**
 * Reduz uma passagem ao mínimo necessário para auditoria editorial.
 *
 * O texto bíblico e a reflexão nunca são copiados para o ledger. Os respetivos
 * comprimentos permitem observar uma alteração sem duplicar conteúdo integral.
 *
 * @param {Record<string, unknown> | null} passage Documento interno.
 * @returns {Record<string, unknown> | null} Snapshot seguro para auditoria.
 */
function biblicalPassageAuditSnapshot(passage) {
    if (!passage) return null;

    return {
        id: String(passage._id),
        reference: formatBiblicalReference(passage),
        translation: passage.translation,
        status: passage.status,
        textLength: typeof passage.text === "string" ? passage.text.length : 0,
        hasTheme: Boolean(passage.theme),
        reflectionLength:
            typeof passage.reflection === "string"
                ? passage.reflection.length
                : 0,
    };
}

/**
 * Reduz uma associação ao estado operacional necessário para auditoria.
 *
 * A nota editorial pode conter texto livre e, por isso, apenas se regista se
 * está preenchida. Não são copiados texto bíblico, nota, nomes ou outros PII.
 *
 * @param {Record<string, unknown> | null} association Associação interna.
 * @returns {Record<string, unknown> | null} Snapshot seguro para auditoria.
 */
function biblicalAssociationAuditSnapshot(association) {
    if (!association) return null;

    return {
        contentId: String(association.contentId),
        passageId: String(association.passageId),
        sortOrder: association.sortOrder ?? 0,
        hasNote: Boolean(association.note),
    };
}

/**
 * Cria a chave estável usada como alvo de auditoria de uma associação.
 *
 * @param {ObjectId} contentId Conteúdo associado.
 * @param {ObjectId} passageId Passagem associada.
 * @returns {string} Identificador composto sem PII.
 */
function biblicalAssociationTargetId(contentId, passageId) {
    return `${contentId}:${passageId}`;
}

/**
 * Constrói uma query pública por ObjectId ou slug de conteúdo.
 *
 * @param {unknown} idOrSlug Identificador de conteúdo.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
function publishedContentQuery(idOrSlug) {
    if (typeof idOrSlug !== "string") {
        throw new HttpError(400, "Conteudo invalido.");
    }

    const value = idOrSlug.trim();

    if (ObjectId.isValid(value)) {
        return { _id: new ObjectId(value), status: "published" };
    }

    return { slug: value, status: "published" };
}

/**
 * Lista passagens bíblicas já publicadas para consumo público.
 *
 * A função aplica paginação, ordena as passagens pela posição bíblica e converte
 * cada documento MongoDB para o formato seguro exposto ao frontend, sem campos
 * editoriais internos.
 *
 * @param {{ page?: unknown, limit?: unknown }} queryParams Parâmetros opcionais
 * de paginação recebidos da camada HTTP.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Página de passagens públicas.
 */
export async function listPublishedBiblicalPassages(queryParams = {}) {
    const { page, limit } = parseBiblicalPassagePagination(queryParams);
    const db = await getDb();
    const filter = { status: "published" };
    const [passages, total] = await Promise.all([
        db
            .collection("biblical_passages")
            .find(filter)
            .sort({ book: 1, chapterStart: 1, verseStart: 1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("biblical_passages").countDocuments(filter),
    ]);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items: passages.map((passage) => publicBiblicalPassage(passage)),
    };
}

/**
 * Obtém uma passagem publicada por id.
 *
 * @param {string} passageId Id público.
 * @returns {Promise<Record<string, unknown>>} Passagem pública.
 */
export async function getPublishedBiblicalPassage(passageId) {
    const db = await getDb();
    const passage = await db.collection("biblical_passages").findOne({
        _id: asObjectId(passageId, "Passagem biblica"),
        status: "published",
    });

    if (!passage) {
        throw new HttpError(404, "Passagem biblica nao encontrada.");
    }

    return publicBiblicalPassage(passage);
}

/**
 * Lista passagens bíblicas para a área administrativa.
 *
 * Ao contrário da listagem pública, inclui todos os estados editoriais e devolve
 * dados preparados para revisão, edição e publicação pela equipa de gestão.
 *
 * @param {{ page?: unknown, limit?: unknown }} queryParams Parâmetros opcionais
 * de paginação recebidos da camada HTTP.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Página de passagens administrativas.
 */
export async function listAdminBiblicalPassages(queryParams = {}) {
    const { page, limit } = parseBiblicalPassagePagination(queryParams);
    const { search, status } = parseAdminBiblicalPassageFilters(queryParams);
    const db = await getDb();
    const filter = {};

    if (status) filter.status = status;
    if (search) {
        const literal = { $regex: escapeRegex(search), $options: "i" };
        filter.$or = [{ book: literal }, { translation: literal }, { theme: literal }];
    }
    const [passages, total] = await Promise.all([
        db
            .collection("biblical_passages")
            .find(filter)
            .sort({ updatedAt: -1, createdAt: -1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("biblical_passages").countDocuments(filter),
    ]);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items: passages.map(adminBiblicalPassage),
    };
}

/**
 * Cria uma passagem bíblica como rascunho editorial.
 *
 * @param {Record<string, unknown>} input Payload recebido.
 * @param {string} userId Editor autenticado.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Passagem criada.
 */
export async function createBiblicalPassage(input, userId, context = {}) {
    await ensureBiblicalPassageIndexes();

    const payload = assertBiblicalPassagePayload(input);
    const editorId = asObjectId(userId, "Utilizador");

    return runInTransaction(async ({ db, session }) => {
        const now = new Date();
        const document = {
            ...payload,
            status: "draft",
            createdBy: editorId,
            updatedBy: editorId,
            publishedAt: null,
            createdAt: now,
            updatedAt: now,
        };
        const result = await db
            .collection("biblical_passages")
            .insertOne(document, { session });
        const persisted = { ...document, _id: result.insertedId };

        await writeAdminAudit({
            db,
            session,
            actorUserId: editorId,
            action: "biblical_passage.created",
            targetType: "biblical_passage",
            targetId: result.insertedId,
            before: null,
            after: biblicalPassageAuditSnapshot(persisted),
            requestId: context.requestId,
        });

        return adminBiblicalPassage(persisted);
    });
}

/**
 * Atualiza os campos editoriais de uma passagem existente.
 *
 * @param {string} passageId Id da passagem.
 * @param {Record<string, unknown>} input Payload recebido.
 * @param {string} userId Editor autenticado.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Passagem atualizada.
 */
export async function updateBiblicalPassage(
    passageId,
    input,
    userId,
    context = {},
) {
    const _id = asObjectId(passageId, "Passagem biblica");
    const payload = assertBiblicalPassagePayload(input);
    const editorId = asObjectId(userId, "Utilizador");

    return runInTransaction(async ({ db, session }) => {
        const existing = await db
            .collection("biblical_passages")
            .findOne({ _id }, { session });

        if (!existing) {
            throw new HttpError(404, "Passagem biblica nao encontrada.");
        }

        const updated = await db.collection("biblical_passages").findOneAndUpdate(
            { _id },
            {
                $set: {
                    ...payload,
                    updatedBy: editorId,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: "after", session },
        );

        await writeAdminAudit({
            db,
            session,
            actorUserId: editorId,
            action: "biblical_passage.updated",
            targetType: "biblical_passage",
            targetId: _id,
            before: biblicalPassageAuditSnapshot(existing),
            after: biblicalPassageAuditSnapshot(updated),
            requestId: context.requestId,
        });

        return adminBiblicalPassage(updated);
    });
}

/**
 * Altera o estado editorial de uma passagem.
 *
 * @param {string} passageId Id da passagem.
 * @param {unknown} status Estado recebido.
 * @param {string} userId Editor autenticado.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Passagem atualizada.
 */
export async function changeBiblicalPassageStatus(
    passageId,
    status,
    userId,
    context = {},
) {
    const _id = asObjectId(passageId, "Passagem biblica");
    const nextStatus = assertBiblicalPassageStatus(status);
    const editorId = asObjectId(userId, "Utilizador");

    return runInTransaction(async ({ db, session }) => {
        const existing = await db
            .collection("biblical_passages")
            .findOne({ _id }, { session });

        if (!existing) {
            throw new HttpError(404, "Passagem biblica nao encontrada.");
        }

        const now = new Date();
        const updated = await db.collection("biblical_passages").findOneAndUpdate(
            { _id },
            {
                $set: {
                    status: nextStatus,
                    updatedBy: editorId,
                    updatedAt: now,
                    publishedAt:
                        nextStatus === "published"
                            ? existing.publishedAt ?? now
                            : existing.publishedAt ?? null,
                },
            },
            { returnDocument: "after", session },
        );

        await writeAdminAudit({
            db,
            session,
            actorUserId: editorId,
            action: "biblical_passage.status_changed",
            targetType: "biblical_passage",
            targetId: _id,
            before: biblicalPassageAuditSnapshot(existing),
            after: biblicalPassageAuditSnapshot(updated),
            requestId: context.requestId,
            metadata: { previousStatus: existing.status, nextStatus },
        });

        return adminBiblicalPassage(updated);
    });
}

/**
 * Lista passagens publicadas associadas a um conteúdo publicado.
 *
 * @param {string} idOrSlug Id ou slug público do conteúdo.
 * @returns {Promise<Record<string, unknown>[]>} Passagens associadas.
 */
export async function listBiblicalPassagesForPublishedContent(idOrSlug) {
    const contentQuery = publishedContentQuery(idOrSlug);
    const db = await getDb();
    const content = await db
        .collection("contents")
        .findOne(contentQuery);

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const associations = await db
        .collection("content_biblical_passages")
        .find({ contentId: content._id })
        .sort({ sortOrder: 1, createdAt: 1 })
        .toArray();

    if (associations.length === 0) {
        return [];
    }

    const passages = await db
        .collection("biblical_passages")
        .find({
            _id: { $in: associations.map((association) => association.passageId) },
            status: "published",
        })
        .toArray();
    const passageById = new Map(
        passages.map((passage) => [String(passage._id), passage]),
    );

    return associations
        .map((association) => {
            const passage = passageById.get(String(association.passageId));
            return passage ? publicBiblicalPassage(passage, association) : null;
        })
        .filter(Boolean);
}

/**
 * Lista todas as associações de passagens de um conteúdo para administração.
 *
 * @param {string} contentId Id do conteúdo.
 * @returns {Promise<Record<string, unknown>[]>} Associações admin.
 */
export async function listAdminBiblicalPassagesForContent(contentId) {
    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const content = await db.collection("contents").findOne({ _id: contentObjectId });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const associations = await db
        .collection("content_biblical_passages")
        .find({ contentId: contentObjectId })
        .sort({ sortOrder: 1, createdAt: 1 })
        .toArray();

    if (associations.length === 0) {
        return [];
    }

    const passages = await db
        .collection("biblical_passages")
        .find({
            _id: { $in: associations.map((association) => association.passageId) },
        })
        .toArray();
    const passageById = new Map(
        passages.map((passage) => [String(passage._id), passage]),
    );

    return associations.map((association) =>
        adminBiblicalPassageAssociation(
            passageById.get(String(association.passageId)),
            association,
            contentObjectId,
        ),
    );
}

/**
 * Associa uma passagem a um conteúdo existente de forma idempotente.
 *
 * @param {string} contentId Id do conteúdo.
 * @param {Record<string, unknown>} input Payload recebido.
 * @param {string} userId Editor autenticado.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Associação pública.
 */
export async function linkBiblicalPassageToContent(
    contentId,
    input,
    userId,
    context = {},
) {
    await ensureBiblicalPassageIndexes();

    const contentObjectId = asObjectId(contentId, "Conteudo");
    const payload = assertBiblicalPassageAssociationPayload(input);
    const editorId = asObjectId(userId, "Utilizador");

    return runInTransaction(async ({ db, session }) => {
        const associationFilter = {
            contentId: contentObjectId,
            passageId: payload.passageId,
        };
        // O driver MongoDB não suporta operações paralelas dentro da mesma
        // transação; estas leituras têm de permanecer sequenciais.
        const content = await db.collection("contents").findOne(
            { _id: contentObjectId },
            { session },
        );
        const passage = await db.collection("biblical_passages").findOne(
            { _id: payload.passageId },
            { session },
        );
        const existingAssociation = await db
            .collection("content_biblical_passages")
            .findOne(associationFilter, { session });

        if (!content) {
            throw new HttpError(404, "Conteudo nao encontrado.");
        }

        if (!passage) {
            throw new HttpError(404, "Passagem biblica nao encontrada.");
        }

        if (
            existingAssociation?.note === payload.note &&
            existingAssociation?.sortOrder === payload.sortOrder
        ) {
            return publicBiblicalPassage(passage, existingAssociation);
        }

        const now = new Date();
        await db.collection("content_biblical_passages").updateOne(
            associationFilter,
            {
                $set: {
                    note: payload.note,
                    sortOrder: payload.sortOrder,
                    updatedBy: editorId,
                    updatedAt: now,
                },
                $setOnInsert: {
                    ...associationFilter,
                    createdBy: editorId,
                    createdAt: now,
                },
            },
            { upsert: true, session },
        );
        const persistedAssociation = {
            ...existingAssociation,
            ...associationFilter,
            note: payload.note,
            sortOrder: payload.sortOrder,
            updatedBy: editorId,
            updatedAt: now,
            createdBy: existingAssociation?.createdBy ?? editorId,
            createdAt: existingAssociation?.createdAt ?? now,
        };

        await writeAdminAudit({
            db,
            session,
            actorUserId: editorId,
            action: "biblical_passage.association_linked",
            targetType: "content_biblical_passage",
            targetId: biblicalAssociationTargetId(
                contentObjectId,
                payload.passageId,
            ),
            before: biblicalAssociationAuditSnapshot(existingAssociation),
            after: biblicalAssociationAuditSnapshot(persistedAssociation),
            requestId: context.requestId,
        });

        return publicBiblicalPassage(passage, persistedAssociation);
    });
}

/**
 * Remove uma associação entre conteúdo e passagem.
 *
 * @param {string} contentId Id do conteúdo.
 * @param {string} passageId Id da passagem.
 * @param {string} userId Editor autenticado.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<{ contentId: string, passageId: string, removed: boolean }>} Resultado.
 */
export async function unlinkBiblicalPassageFromContent(
    contentId,
    passageId,
    userId,
    context = {},
) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const passageObjectId = asObjectId(passageId, "Passagem biblica");
    const editorId = asObjectId(userId, "Utilizador");

    return runInTransaction(async ({ db, session }) => {
        const associationFilter = {
            contentId: contentObjectId,
            passageId: passageObjectId,
        };
        const existingAssociation = await db
            .collection("content_biblical_passages")
            .findOne(associationFilter, { session });

        if (!existingAssociation) {
            return { contentId, passageId, removed: false };
        }

        const result = await db
            .collection("content_biblical_passages")
            .deleteOne(associationFilter, { session });

        if (result.deletedCount > 0) {
            await writeAdminAudit({
                db,
                session,
                actorUserId: editorId,
                action: "biblical_passage.association_unlinked",
                targetType: "content_biblical_passage",
                targetId: biblicalAssociationTargetId(
                    contentObjectId,
                    passageObjectId,
                ),
                before: biblicalAssociationAuditSnapshot(existingAssociation),
                after: null,
                requestId: context.requestId,
            });
        }

        return {
            contentId,
            passageId,
            removed: result.deletedCount > 0,
        };
    });
}
