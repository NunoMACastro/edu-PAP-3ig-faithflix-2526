/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    CONTENT_EMBEDDING_DIMENSIONS,
    CONTENT_EMBEDDING_MODEL,
    cosineSimilarity,
    normalizeVector,
} from "./content-embeddings.service.js";
import { buildRecommendationExplanation } from "./recommendation-explanations.js";

/**
 * Converte um id público num ObjectId MongoDB.
 *
 * @param {string} id - Id bruto vindo da sessão ou dos dados.
 * @param {string} label - Portuguese domain label used in errors.
 * @returns {import("mongodb").ObjectId} ObjectId seguro.
 */
function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
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
 * Increments one occurrence counter.
 *
 * @param {Map<string, number>} map - Counter map.
 * @param {unknown} key - Key to count.
 * @returns {void}
 */
function addCount(map, key) {
    if (!key) {
        return;
    }

    map.set(String(key), (map.get(String(key)) ?? 0) + 1);
}

/**
 * Soma peso semântico a um conteúdo sinalizado pelo utilizador.
 *
 * @param {Map<string, number>} map Mapa contentId -> peso.
 * @param {unknown} contentId Id de conteúdo.
 * @param {number} weight Peso a somar.
 * @returns {void}
 */
function addWeightedContent(map, contentId, weight) {
    if (!contentId || !ObjectId.isValid(String(contentId))) {
        return;
    }

    const key = String(contentId);
    map.set(key, (map.get(key) ?? 0) + weight);
}

/**
 * Devolve as chaves com maior frequência de um mapa de contadores.
 *
 * @param {Map<string, number>} map - Counter map.
 * @param {number} limit - Maximum number of keys.
 * @returns {string[]} Chaves mais frequentes.
 */
function topKeys(map, limit = 5) {
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key]) => key);
}

/**
 * Carrega sinais de recomendação permitidos para o utilizador autenticado.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId} userObjectId - Authenticated user ObjectId.
 * @returns {Promise<Record<string, unknown>>} Resumo agregado de sinais.
 */
async function loadUserSignals(db, userObjectId) {
    const [lists, history, ratings] = await Promise.all([
        db.collection("user_content_lists").find({ userId: userObjectId }).toArray(),
        db.collection("playback_progress").find({ userId: userObjectId }).toArray(),
        db
            .collection("content_ratings")
            .find({ userId: userObjectId })
            .toArray(),
    ]);
    const positiveRatings = ratings.filter((row) => Number(row.value) >= 4);

    const contentIds = [
        ...new Set(
            [...lists, ...history, ...ratings].map((row) =>
                String(row.contentId),
            ),
        ),
    ];
    const signalContentIds = [
        ...new Set(
            [...lists, ...history, ...positiveRatings].map((row) =>
                String(row.contentId),
            ),
        ),
    ];
    const weightedContentIds = new Map();

    for (const row of lists) {
        addWeightedContent(
            weightedContentIds,
            row.contentId,
            row.type === "favorite" ? 3 : 2,
        );
    }

    for (const row of positiveRatings) {
        addWeightedContent(weightedContentIds, row.contentId, 3);
    }

    for (const row of history) {
        addWeightedContent(weightedContentIds, row.contentId, 1);
    }

    if (contentIds.length === 0) {
        return {
            contentIds: [],
            taxonomyIds: [],
            types: [],
            signalsUsed: [],
            weightedContentIds: [],
        };
    }

    const contents = await db
        .collection("contents")
        .find({
            _id: {
                $in: signalContentIds
                    .filter((id) => ObjectId.isValid(id))
                    .map((id) => ObjectId.createFromHexString(id)),
            },
            status: "published",
        })
        .toArray();

    const taxonomyCounts = new Map();
    const typeCounts = new Map();

    for (const content of contents) {
        addCount(typeCounts, content.type);
        for (const taxonomyId of content.taxonomyIds ?? []) {
            addCount(taxonomyCounts, taxonomyId);
        }
    }

    const signalsUsed = [];
    if (history.length > 0) signalsUsed.push("history");
    if (lists.some((item) => item.type === "favorite")) {
        signalsUsed.push("favorites");
    }
    if (lists.some((item) => item.type === "watchlist")) {
        signalsUsed.push("watchlist");
    }
    if (positiveRatings.length > 0) signalsUsed.push("ratings");

    return {
        contentIds,
        taxonomyIds: topKeys(taxonomyCounts),
        types: topKeys(typeCounts, 3),
        signalsUsed,
        weightedContentIds: [...weightedContentIds.entries()].map(
            ([contentId, weight]) => ({ contentId, weight }),
        ),
    };
}

/**
 * Converte ids públicos válidos em ObjectIds.
 *
 * @param {Iterable<string>} ids Ids textuais.
 * @returns {import("mongodb").ObjectId[]} ObjectIds válidos.
 */
function objectIdsFromStrings(ids) {
    return [...ids]
        .filter((id) => ObjectId.isValid(id))
        .map((id) => ObjectId.createFromHexString(id));
}

/**
 * Constrói o vetor temporário do utilizador a partir de embeddings de conteúdos sinalizados.
 *
 * @param {{ contentId: string, weight: number }[]} weightedContentIds Sinais ponderados.
 * @param {Record<string, unknown>[]} embeddings Embeddings encontrados.
 * @returns {number[]} Vetor normalizado ou lista vazia quando não há base suficiente.
 */
export function buildSemanticProfileVector(weightedContentIds, embeddings) {
    const weightsByContent = new Map(
        weightedContentIds.map((entry) => [String(entry.contentId), entry.weight]),
    );
    const vector = Array.from(
        { length: CONTENT_EMBEDDING_DIMENSIONS },
        () => 0,
    );
    let usedEmbeddings = 0;

    for (const embedding of embeddings) {
        const weight = weightsByContent.get(String(embedding.contentId)) ?? 0;

        if (weight <= 0 || !Array.isArray(embedding.vector)) {
            continue;
        }

        usedEmbeddings += 1;

        for (let index = 0; index < CONTENT_EMBEDDING_DIMENSIONS; index += 1) {
            vector[index] += Number(embedding.vector[index] ?? 0) * weight;
        }
    }

    return usedEmbeddings === 0 ? [] : normalizeVector(vector);
}

/**
 * Carrega recomendações por similaridade semântica de embeddings de conteúdo.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {Record<string, unknown>} signals Sinais agregados do utilizador.
 * @param {Set<string>} excludedIds Conteúdos já usados ou já consumidos.
 * @param {number} [limit=8] Limite de itens.
 * @returns {Promise<Record<string, unknown>[]>} Cartões recomendados.
 */
export async function loadSemanticRecommendationItems(
    db,
    signals,
    excludedIds,
    limit = 8,
) {
    if (!Array.isArray(signals.weightedContentIds) || signals.weightedContentIds.length === 0) {
        return [];
    }

    const sourceObjectIds = objectIdsFromStrings(
        signals.weightedContentIds.map((entry) => entry.contentId),
    );

    if (sourceObjectIds.length === 0) {
        return [];
    }

    const sourceEmbeddings = await db
        .collection("content_embeddings")
        .find({
            model: CONTENT_EMBEDDING_MODEL,
            contentId: { $in: sourceObjectIds },
        })
        .toArray();
    const profileVector = buildSemanticProfileVector(
        signals.weightedContentIds,
        sourceEmbeddings,
    );

    if (profileVector.length === 0) {
        return [];
    }

    const excludedObjectIds = objectIdsFromStrings(excludedIds);
    const candidateEmbeddings = await db
        .collection("content_embeddings")
        .find({
            model: CONTENT_EMBEDDING_MODEL,
            contentId: { $nin: excludedObjectIds },
        })
        .toArray();
    const candidateIds = candidateEmbeddings.map((embedding) => embedding.contentId);

    if (candidateIds.length === 0) {
        return [];
    }

    const contents = await db
        .collection("contents")
        .find({ _id: { $in: candidateIds }, status: "published" })
        .toArray();
    const contentById = new Map(contents.map((content) => [String(content._id), content]));

    return candidateEmbeddings
        .map((embedding) => {
            const content = contentById.get(String(embedding.contentId));

            if (!content || !Array.isArray(embedding.vector)) {
                return null;
            }

            return {
                content,
                score: cosineSimilarity(profileVector, embedding.vector),
            };
        })
        .filter((entry) => entry && entry.score > 0)
        .sort((left, right) => right.score - left.score || left.content.title.localeCompare(right.content.title, "pt-PT"))
        .slice(0, limit)
        .map((entry) => publicCard(entry.content));
}

/**
 * Carrega cartões publicados com filtro e exclui cartões já vistos.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>} match - Filtro match MongoDB.
 * @param {Set<string>} excludedIds - Ids already used or part of user signals.
 * @param {Record<string, 1 | -1>} sort - Ordenação MongoDB.
 * @param {number} limit - Maximum number of cards.
 * @returns {Promise<Record<string, unknown>[]>} Cartões de recomendação.
 */
async function loadCandidateCards(db, match, excludedIds, sort, limit = 8) {
    const rows = await db
        .collection("contents")
        .aggregate([
            {
                $match: {
                    status: "published",
                    _id: {
                        $nin: [...excludedIds]
                            .filter((id) => ObjectId.isValid(id))
                            .map((id) => ObjectId.createFromHexString(id)),
                    },
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
            { $sort: sort },
            { $limit: limit },
        ])
        .toArray();

    return rows.map(publicCard);
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
 * Combina conteúdos populares, recentes e de catálogo geral, evitando repetir
 * itens já escolhidos noutras secções da mesma resposta.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Set<string>} initialExcludedIds Identificadores que já não devem ser
 * sugeridos nesta resposta.
 * @returns {Promise<Record<string, unknown>>} Resposta de recomendação.
 */
async function buildColdStart(db, initialExcludedIds = new Set()) {
    const excludedIds = new Set(initialExcludedIds);
    const popular = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { ratingAverage: -1, publishedAt: -1, title: 1 },
        8,
    );
    popular.forEach((item) => excludedIds.add(item.id));

    const recent = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { publishedAt: -1, title: 1 },
        8,
    );
    recent.forEach((item) => excludedIds.add(item.id));

    const catalog = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { title: 1 },
        8,
    );

    return {
        coldStart: true,
        signalsUsed: [],
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
 * Constrói recomendações base para o utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<Record<string, unknown>>} Resposta de recomendação.
 */
export async function getRecommendationsForUser(userId) {
    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const signals = await loadUserSignals(db, userObjectId);

    if (
        signals.contentIds.length === 0 ||
        (signals.weightedContentIds.length === 0 &&
            signals.taxonomyIds.length === 0 &&
            signals.types.length === 0)
    ) {
        return buildColdStart(db, new Set(signals.contentIds));
    }

    const excludedIds = new Set(signals.contentIds);
    const semanticItems = await loadSemanticRecommendationItems(
        db,
        signals,
        excludedIds,
    );
    semanticItems.forEach((item) => excludedIds.add(item.id));

    const taxonomyIds = signals.taxonomyIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => ObjectId.createFromHexString(id));

    const themeItems =
        taxonomyIds.length > 0
            ? await loadCandidateCards(
                  db,
                  { taxonomyIds: { $in: taxonomyIds } },
                  excludedIds,
                  { publishedAt: -1, title: 1 },
              )
            : [];
    themeItems.forEach((item) => excludedIds.add(item.id));

    const activityItems =
        signals.types.length > 0
            ? await loadCandidateCards(
                  db,
                  { type: { $in: signals.types } },
                  excludedIds,
                  { publishedAt: -1, title: 1 },
              )
            : [];
    activityItems.forEach((item) => excludedIds.add(item.id));

    const fallbackItems = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { ratingAverage: -1, publishedAt: -1, title: 1 },
    );
    const groups = [];

    if (semanticItems.length > 0) {
        groups.push(
            group(
                "semantic-similar",
                "Parecidos com o que acompanhas",
                "semantic-similar",
                semanticItems,
            ),
        );
    }

    groups.push(
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
            "Tambem podes gostar",
            "popular-fallback",
            fallbackItems,
        ),
    );

    return {
        coldStart: false,
        signalsUsed: signals.signalsUsed,
        groups,
    };
}
