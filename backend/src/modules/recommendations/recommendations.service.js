/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { env } from "../../config/env.js";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    averageWeightedEmbedding,
    cosineSimilarity,
    ensureContentEmbeddingIndexes,
} from "./content-embeddings.js";
import { buildRecommendationExplanation } from "./recommendation-explanations.js";

const RECOMMENDATION_STRATEGY = "weighted-baseline-v2";
const EMBEDDING_RECOMMENDATION_STRATEGY = `${RECOMMENDATION_STRATEGY}+content-embeddings`;
const DEFAULT_GROUP_LIMIT = 8;
const CANDIDATE_POOL_LIMIT = 48;
const EMBEDDING_SCORE_WEIGHT = 4;
const MAX_EVENT_BATCH = 30;

const FEEDBACK_ACTIONS = new Set([
    "more_like_this",
    "less_like_this",
    "not_interested",
    "seen",
]);
const NEGATIVE_FEEDBACK_ACTIONS = new Set([
    "less_like_this",
    "not_interested",
    "seen",
]);
const RECOMMENDATION_EVENT_TYPES = new Set(["shown", "clicked"]);

/**
 * Converte um id público num ObjectId MongoDB.
 *
 * @param {string | import("mongodb").ObjectId} id - Id bruto vindo da sessão ou dos dados.
 * @param {string} label - Portuguese domain label used in errors.
 * @returns {import("mongodb").ObjectId} ObjectId seguro.
 */
function asObjectId(id, label) {
    if (id instanceof ObjectId) {
        return id;
    }

    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Converte uma lista de ids em ObjectIds válidos.
 *
 * @param {Iterable<string>} ids - Ids públicos.
 * @returns {import("mongodb").ObjectId[]} Lista segura para queries MongoDB.
 */
function objectIdsFromStrings(ids) {
    return [...ids]
        .filter((id) => ObjectId.isValid(id))
        .map((id) => ObjectId.createFromHexString(id));
}

/**
 * Converte um documento de conteúdo num cartão compacto de recomendação.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo MongoDB.
 * @returns {Record<string, unknown>} Cartão público de recomendação.
 */
function publicCard(content) {
    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        type: content.type,
        posterUrl: content.assets?.posterUrl ?? "",
    };
}

/**
 * Incrementa um score acumulado.
 *
 * @param {Map<string, number>} map - Mapa de scores.
 * @param {unknown} key - Chave a pontuar.
 * @param {number} weight - Peso a somar.
 * @returns {void}
 */
function addScore(map, key, weight) {
    if (!key || weight <= 0) {
        return;
    }

    const normalizedKey = String(key);
    map.set(normalizedKey, (map.get(normalizedKey) ?? 0) + weight);
}

/**
 * Devolve as chaves com maior score de um mapa.
 *
 * @param {Map<string, number>} map - Mapa de scores.
 * @param {number} limit - Maximum number of keys.
 * @returns {string[]} Chaves mais fortes.
 */
function topKeys(map, limit = 5) {
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
        .map(([key]) => key);
}

/**
 * Extrai os segundos de progresso de formatos históricos existentes.
 *
 * @param {Record<string, unknown>} progress - Documento de progresso.
 * @returns {number} Segundos vistos.
 */
function progressSeconds(progress) {
    return Number(progress.currentTimeSeconds ?? progress.progressSeconds ?? 0);
}

/**
 * Devolve o peso de um rating positivo.
 *
 * @param {number} value - Rating de 1 a 5.
 * @returns {number} Peso do rating.
 */
function ratingWeight(value) {
    if (value >= 5) return 5;
    if (value >= 4) return 3;
    return 0;
}

/**
 * Calcula um bónus pequeno de recência para desempate.
 *
 * @param {unknown} publishedAt - Data de publicação.
 * @returns {number} Bónus entre 0 e 1.
 */
function recencyBonus(publishedAt) {
    const date = new Date(publishedAt);

    if (Number.isNaN(date.getTime())) {
        return 0;
    }

    const ageDays = Math.max(0, (Date.now() - date.getTime()) / 86_400_000);
    return Math.max(0, 1 - Math.min(ageDays, 365) / 365);
}

/**
 * Carrega o contexto mínimo de elegibilidade do utilizador.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId} userObjectId - Authenticated user ObjectId.
 * @returns {Promise<{ parentalMaxAgeRating: number }>} Contexto seguro.
 */
async function loadUserContext(db, userObjectId) {
    const user = await db.collection("users").findOne({ _id: userObjectId });

    return {
        parentalMaxAgeRating: Number.isInteger(user?.parentalMaxAgeRating)
            ? user.parentalMaxAgeRating
            : 18,
    };
}

/**
 * Carrega sinais de recomendação permitidos para o utilizador autenticado.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId} userObjectId - Authenticated user ObjectId.
 * @returns {Promise<Record<string, unknown>>} Resumo agregado de sinais.
 */
async function loadUserSignals(db, userObjectId) {
    const [lists, history, ratings, feedback] = await Promise.all([
        db.collection("user_content_lists").find({ userId: userObjectId }).toArray(),
        db.collection("playback_progress").find({ userId: userObjectId }).toArray(),
        db
            .collection("content_ratings")
            .find({ userId: userObjectId, value: { $gte: 4 } })
            .toArray(),
        db
            .collection("recommendation_feedback")
            .find({ userId: userObjectId })
            .toArray(),
    ]);

    const contentWeights = new Map();
    const signalContentIds = new Set();
    const excludedContentIds = new Set();
    const signalsUsed = new Set();

    for (const item of lists) {
        const contentId = String(item.contentId);
        const weight = item.type === "favorite" ? 5 : 3;
        addScore(contentWeights, contentId, weight);
        signalContentIds.add(contentId);
        signalsUsed.add(item.type === "favorite" ? "favorites" : "watchlist");
    }

    for (const progress of history) {
        const contentId = String(progress.contentId);
        const weight = progress.completed ? 3 : progressSeconds(progress) >= 60 ? 2 : 0;

        if (weight > 0) {
            addScore(contentWeights, contentId, weight);
            signalContentIds.add(contentId);
            signalsUsed.add("history");
        }
    }

    for (const rating of ratings) {
        const contentId = String(rating.contentId);
        const weight = ratingWeight(Number(rating.value));

        if (weight > 0) {
            addScore(contentWeights, contentId, weight);
            signalContentIds.add(contentId);
            signalsUsed.add("ratings");
        }
    }

    for (const row of feedback) {
        const contentId = String(row.contentId);

        if (row.action === "more_like_this") {
            addScore(contentWeights, contentId, 4);
            signalContentIds.add(contentId);
            signalsUsed.add("feedback");
        }

        if (NEGATIVE_FEEDBACK_ACTIONS.has(row.action)) {
            excludedContentIds.add(contentId);
        }
    }

    const validSignalIds = objectIdsFromStrings(signalContentIds);
    const contents =
        validSignalIds.length > 0
            ? await db
                  .collection("contents")
                  .find({
                      _id: { $in: validSignalIds },
                      status: "published",
                  })
                  .toArray()
            : [];

    const taxonomyScores = new Map();
    const typeScores = new Map();

    for (const content of contents) {
        const contentId = String(content._id);
        const weight = contentWeights.get(contentId) ?? 1;
        addScore(typeScores, content.type, weight);

        for (const taxonomyId of content.taxonomyIds ?? []) {
            addScore(taxonomyScores, taxonomyId, weight);
        }
    }

    return {
        excludedContentIds: new Set([...signalContentIds, ...excludedContentIds]),
        hasPositiveSignals: contents.length > 0,
        contentWeights,
        embeddingScores: new Map(),
        taxonomyIds: topKeys(taxonomyScores),
        taxonomyScores,
        types: topKeys(typeScores, 3),
        typeScores,
        signalsUsed: [...signalsUsed],
    };
}

/**
 * Constrói o perfil semântico temporário do utilizador a partir de conteúdos positivos.
 *
 * O perfil não é persistido e nunca envia histórico bruto para fora da app. Usa apenas
 * embeddings de conteúdos já existentes em `content_embeddings`.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>} signals - Sinais agregados do utilizador.
 * @returns {Promise<{ profile: number[] } | null>} Perfil semântico temporário.
 */
async function loadEmbeddingContext(db, signals) {
    const signalContentIds = objectIdsFromStrings(signals.contentWeights.keys());

    if (signalContentIds.length === 0) {
        return null;
    }

    const embeddings = await db
        .collection("content_embeddings")
        .find({
            contentId: { $in: signalContentIds },
            model: env.embeddings.model,
            dimensions: env.embeddings.dimensions,
        })
        .toArray();
    const profile = averageWeightedEmbedding(
        embeddings.map((embedding) => ({
            vector: embedding.vector,
            weight: signals.contentWeights.get(String(embedding.contentId)) ?? 1,
        })),
        env.embeddings.dimensions,
    );

    return profile ? { profile } : null;
}

/**
 * Calcula similaridades semânticas dos candidatos elegíveis.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {{ profile: number[] } | null} embeddingContext - Perfil semântico temporário.
 * @param {Record<string, unknown>[]} candidates - Candidatos já filtrados.
 * @param {Record<string, unknown>} signals - Sinais agregados a enriquecer.
 * @returns {Promise<boolean>} Verdadeiro quando pelo menos um candidato recebeu score semântico.
 */
async function addEmbeddingScores(db, embeddingContext, candidates, signals) {
    if (!embeddingContext || candidates.length === 0) {
        return false;
    }

    const contentIds = objectIdsFromStrings(candidates.map((content) => String(content._id)));

    if (contentIds.length === 0) {
        return false;
    }

    const embeddings = await db
        .collection("content_embeddings")
        .find({
            contentId: { $in: contentIds },
            model: env.embeddings.model,
            dimensions: env.embeddings.dimensions,
        })
        .toArray();
    let used = false;

    for (const embedding of embeddings) {
        const similarity = Math.max(
            0,
            cosineSimilarity(embeddingContext.profile, embedding.vector),
        );

        if (similarity > 0) {
            signals.embeddingScores.set(String(embedding.contentId), similarity);
            used = true;
        }
    }

    return used;
}

/**
 * Carrega documentos candidatos publicados e elegíveis.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {{ match?: Record<string, unknown>, excludedIds: Set<string>, userContext: { parentalMaxAgeRating: number }, limit?: number }} options - Opções da query.
 * @returns {Promise<Record<string, unknown>[]>} Documentos candidatos com rating médio.
 */
async function loadCandidateDocuments(
    db,
    { match = {}, excludedIds, userContext, limit = CANDIDATE_POOL_LIMIT },
) {
    return db
        .collection("contents")
        .aggregate([
            {
                $match: {
                    status: "published",
                    ageRating: { $lte: userContext.parentalMaxAgeRating },
                    _id: { $nin: objectIdsFromStrings(excludedIds) },
                    ...match,
                },
            },
            {
                $lookup: {
                    from: "content_ratings",
                    localField: "_id",
                    foreignField: "contentId",
                    as: "ratings",
                },
            },
            {
                $addFields: {
                    ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] },
                },
            },
            { $sort: { ratingAverage: -1, publishedAt: -1, title: 1 } },
            { $limit: limit },
        ])
        .toArray();
}

/**
 * Calcula o score de um candidato conforme afinidade e sinais agregados.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo.
 * @param {Record<string, unknown>} signals - Sinais agregados.
 * @returns {{ score: number, taxonomyAffinity: number, typeAffinity: number, semanticAffinity: number }} Score do candidato.
 */
function scoreCandidate(content, signals) {
    const taxonomyAffinity = (content.taxonomyIds ?? []).reduce(
        (sum, taxonomyId) => sum + (signals.taxonomyScores.get(String(taxonomyId)) ?? 0),
        0,
    );
    const typeAffinity = signals.typeScores.get(String(content.type)) ?? 0;
    const semanticAffinity = signals.embeddingScores.get(String(content._id)) ?? 0;
    const ratingAverage = Number(content.ratingAverage ?? 0);
    const score =
        taxonomyAffinity * 3 +
        typeAffinity * 2 +
        semanticAffinity * EMBEDDING_SCORE_WEIGHT +
        Math.min(Math.max(ratingAverage, 0), 5) +
        recencyBonus(content.publishedAt);

    return { score, taxonomyAffinity, typeAffinity, semanticAffinity };
}

/**
 * Ordena e limita candidatos por score, mantendo desempates estáveis.
 *
 * @param {Record<string, unknown>[]} candidates - Documentos candidatos.
 * @param {Record<string, unknown>} signals - Sinais agregados.
 * @param {(score: { score: number, taxonomyAffinity: number, typeAffinity: number, semanticAffinity: number }) => boolean} keep - Predicado de inclusão.
 * @param {number} limit - Máximo de cartões.
 * @returns {Record<string, unknown>[]} Cartões públicos.
 */
function rankCandidateCards(candidates, signals, keep, limit = DEFAULT_GROUP_LIMIT) {
    return candidates
        .map((content) => ({ content, ...scoreCandidate(content, signals) }))
        .filter(keep)
        .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;

            const leftDate = new Date(left.content.publishedAt).getTime() || 0;
            const rightDate = new Date(right.content.publishedAt).getTime() || 0;

            if (rightDate !== leftDate) return rightDate - leftDate;
            return String(left.content.title).localeCompare(String(right.content.title));
        })
        .slice(0, limit)
        .map(({ content }) => publicCard(content));
}

/**
 * Constrói um grupo de recomendações com a explicação MF3.
 *
 * @param {string} id - Id público do grupo.
 * @param {string} title - Título público do grupo.
 * @param {string} reasonCode - Internal reason code.
 * @param {Record<string, unknown>[]} items - Cartões de recomendação.
 * @returns {Record<string, unknown>} Grupo público.
 */
function group(id, title, reasonCode, items) {
    return {
        id,
        title,
        reasonCode,
        explanation: buildRecommendationExplanation(reasonCode),
        items,
    };
}

/**
 * Constrói a resposta cold-start para utilizadores sem sinais suficientes.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {{ parentalMaxAgeRating: number }} userContext - Contexto de elegibilidade.
 * @param {Set<string>} excludedIds - Ids excluídos por feedback.
 * @returns {Promise<Record<string, unknown>>} Resposta de recomendação.
 */
async function buildColdStart(db, userContext, excludedIds) {
    const popular = (
        await loadCandidateDocuments(db, {
            excludedIds,
            userContext,
            limit: DEFAULT_GROUP_LIMIT,
        })
    ).map(publicCard);
    popular.forEach((item) => excludedIds.add(item.id));

    const recent = (
        await loadCandidateDocuments(db, {
            excludedIds,
            userContext,
            limit: DEFAULT_GROUP_LIMIT,
        })
    )
        .toSorted((left, right) => {
            const leftDate = new Date(left.publishedAt).getTime() || 0;
            const rightDate = new Date(right.publishedAt).getTime() || 0;
            return rightDate - leftDate || String(left.title).localeCompare(String(right.title));
        })
        .map(publicCard);
    recent.forEach((item) => excludedIds.add(item.id));

    const catalog = (
        await loadCandidateDocuments(db, {
            excludedIds,
            userContext,
            limit: DEFAULT_GROUP_LIMIT,
        })
    )
        .toSorted((left, right) => String(left.title).localeCompare(String(right.title)))
        .map(publicCard);

    return {
        coldStart: true,
        generatedAt: new Date().toISOString(),
        signalsUsed: [],
        strategy: RECOMMENDATION_STRATEGY,
        groups: [
            group(
                "popular-start",
                "Populares para comecar",
                "cold-start-popular",
                popular,
            ),
            group(
                "recent-start",
                "Novidades do catalogo",
                "cold-start-recent",
                recent,
            ),
            group(
                "catalog-start",
                "Selecao geral",
                "cold-start-catalog",
                catalog,
            ),
        ],
    };
}

/**
 * Garante índices usados pela recomendação ponderada, feedback e eventos.
 *
 * @returns {Promise<void>} Termina depois da criação dos índices.
 */
export async function ensureRecommendationIndexes() {
    const db = await getDb();

    await db
        .collection("recommendation_feedback")
        .createIndex({ userId: 1, contentId: 1 }, { unique: true });
    await db
        .collection("recommendation_feedback")
        .createIndex({ userId: 1, action: 1, updatedAt: -1 });
    await db
        .collection("recommendation_events")
        .createIndex({ userId: 1, createdAt: -1 });
    await db
        .collection("recommendation_events")
        .createIndex({ contentId: 1, eventType: 1, createdAt: -1 });
    await db.collection("contents").createIndex({
        status: 1,
        taxonomyIds: 1,
        publishedAt: -1,
    });
    await db.collection("contents").createIndex({
        status: 1,
        type: 1,
        publishedAt: -1,
    });
    await db.collection("content_ratings").createIndex({ userId: 1, value: 1 });
    await db.collection("content_ratings").createIndex({ contentId: 1, value: 1 });
    await ensureContentEmbeddingIndexes();
}

/**
 * Constrói recomendações ponderadas para o utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<Record<string, unknown>>} Resposta de recomendação.
 */
export async function getRecommendationsForUser(userId) {
    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const [userContext, signals] = await Promise.all([
        loadUserContext(db, userObjectId),
        loadUserSignals(db, userObjectId),
    ]);
    const excludedIds = new Set(signals.excludedContentIds);

    if (!signals.hasPositiveSignals) {
        return buildColdStart(db, userContext, excludedIds);
    }

    const embeddingContext = await loadEmbeddingContext(db, signals);
    let embeddingsUsed = false;

    const taxonomyIds = objectIdsFromStrings(signals.taxonomyIds);
    const themeCandidates =
        taxonomyIds.length > 0
            ? await loadCandidateDocuments(db, {
                  match: { taxonomyIds: { $in: taxonomyIds } },
                  excludedIds,
                  userContext,
              })
            : [];
    embeddingsUsed =
        (await addEmbeddingScores(db, embeddingContext, themeCandidates, signals)) ||
        embeddingsUsed;
    const themeItems = rankCandidateCards(
        themeCandidates,
        signals,
        (score) => score.taxonomyAffinity > 0,
    );
    themeItems.forEach((item) => excludedIds.add(item.id));

    const activityCandidates =
        signals.types.length > 0
            ? await loadCandidateDocuments(db, {
                  match: { type: { $in: signals.types } },
                  excludedIds,
                  userContext,
              })
            : [];
    embeddingsUsed =
        (await addEmbeddingScores(db, embeddingContext, activityCandidates, signals)) ||
        embeddingsUsed;
    const activityItems = rankCandidateCards(
        activityCandidates,
        signals,
        (score) => score.typeAffinity > 0,
    );
    activityItems.forEach((item) => excludedIds.add(item.id));

    const fallbackCandidates = await loadCandidateDocuments(db, {
        excludedIds,
        userContext,
    });
    embeddingsUsed =
        (await addEmbeddingScores(db, embeddingContext, fallbackCandidates, signals)) ||
        embeddingsUsed;
    const fallbackItems = rankCandidateCards(
        fallbackCandidates,
        signals,
        () => true,
    );
    const signalsUsed = embeddingsUsed
        ? [...new Set([...signals.signalsUsed, "embeddings"])]
        : signals.signalsUsed;

    return {
        coldStart: false,
        generatedAt: new Date().toISOString(),
        signalsUsed,
        strategy: embeddingsUsed
            ? EMBEDDING_RECOMMENDATION_STRATEGY
            : RECOMMENDATION_STRATEGY,
        groups: [
            group(
                "because-your-themes",
                "Com temas que acompanhas",
                "themes-from-user-signals",
                themeItems,
            ),
            group(
                "because-your-activity",
                "Com base na tua atividade",
                "activity-types",
                activityItems,
            ),
            group(
                "popular-start",
                embeddingsUsed ? "Semelhantes ao que aprecias" : "Tambem podes gostar",
                embeddingsUsed ? "semantic-similarity" : "popular-fallback",
                fallbackItems,
            ),
        ],
    };
}

/**
 * Valida feedback explícito de recomendação.
 *
 * @param {unknown} input - Corpo recebido da API.
 * @returns {{ contentId: import("mongodb").ObjectId, publicContentId: string, action: string }} Feedback seguro.
 */
function assertFeedbackInput(input) {
    const publicContentId = String(input?.contentId ?? "").trim();
    const action = String(input?.action ?? "").trim();

    if (!ObjectId.isValid(publicContentId)) {
        throw new HttpError(400, "Conteudo invalido.");
    }

    if (!FEEDBACK_ACTIONS.has(action)) {
        throw new HttpError(400, "Acao de feedback invalida.");
    }

    return {
        contentId: ObjectId.createFromHexString(publicContentId),
        publicContentId,
        action,
    };
}

/**
 * Guarda feedback explícito do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @param {unknown} input - Corpo recebido da API.
 * @returns {Promise<{ feedback: { contentId: string, action: string, saved: boolean } }>} Feedback público.
 */
export async function saveRecommendationFeedback(userId, input) {
    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const feedback = assertFeedbackInput(input);
    const content = await db.collection("contents").findOne({
        _id: feedback.contentId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const now = new Date();
    await db.collection("recommendation_feedback").updateOne(
        { userId: userObjectId, contentId: feedback.contentId },
        {
            $set: { action: feedback.action, updatedAt: now },
            $setOnInsert: {
                userId: userObjectId,
                contentId: feedback.contentId,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return {
        feedback: {
            contentId: feedback.publicContentId,
            action: feedback.action,
            saved: true,
        },
    };
}

/**
 * Valida um evento agregado de recomendação.
 *
 * @param {unknown} event - Evento bruto.
 * @returns {{ eventType: string, contentId: import("mongodb").ObjectId, groupId: string, reasonCode: string }} Evento seguro.
 */
function assertRecommendationEvent(event) {
    const eventType = String(event?.eventType ?? "").trim();
    const contentId = String(event?.contentId ?? "").trim();

    if (!RECOMMENDATION_EVENT_TYPES.has(eventType)) {
        throw new HttpError(400, "Tipo de evento de recomendacao invalido.");
    }

    if (!ObjectId.isValid(contentId)) {
        throw new HttpError(400, "Conteudo invalido.");
    }

    return {
        eventType,
        contentId: ObjectId.createFromHexString(contentId),
        groupId: String(event?.groupId ?? "").slice(0, 80),
        reasonCode: String(event?.reasonCode ?? "").slice(0, 80),
    };
}

/**
 * Regista eventos agregados de recomendação sem bloquear a experiência.
 *
 * @param {string} userId - Authenticated user id.
 * @param {unknown} input - Corpo recebido da API.
 * @returns {Promise<{ accepted: number }>} Quantidade aceite.
 */
export async function recordRecommendationEvents(userId, input) {
    const events = Array.isArray(input?.events) ? input.events : [];

    if (events.length === 0 || events.length > MAX_EVENT_BATCH) {
        throw new HttpError(400, "Lista de eventos invalida.");
    }

    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const now = new Date();

    for (const event of events.map(assertRecommendationEvent)) {
        await db.collection("recommendation_events").insertOne({
            userId: userObjectId,
            ...event,
            strategy: RECOMMENDATION_STRATEGY,
            createdAt: now,
        });
    }

    return { accepted: events.length };
}
