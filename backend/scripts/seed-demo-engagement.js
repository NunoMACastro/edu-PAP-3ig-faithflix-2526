/** @file Geração interna de atividade representativa FaithFlix demo-v2. */

import {
    DEMO_FIXTURE,
    addDays,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

const TASTE_PROFILES = Object.freeze({
    balanced: {
        taxonomyKeys: ["family", "bible"],
        preferredTypes: ["movie", "documentary"],
    },
    biblical: {
        taxonomyKeys: ["bible", "testimonies"],
        preferredTypes: ["documentary", "series"],
    },
    community: {
        taxonomyKeys: ["service", "testimonies"],
        preferredTypes: ["documentary", "movie"],
    },
    documentary: {
        taxonomyKeys: ["documentaries", "bible"],
        preferredTypes: ["documentary", "series"],
    },
    family: {
        taxonomyKeys: ["family", "service"],
        preferredTypes: ["series", "movie"],
    },
    youth: {
        taxonomyKeys: ["youth", "family"],
        preferredTypes: ["series", "movie"],
    },
});

const NAMED_USER_PROFILES = Object.freeze({
    admin: "balanced",
    adminBackup: "documentary",
    moderator: "documentary",
    pro: "biblical",
    familyOwner: "family",
    familyMember: "youth",
    familyInvitee: "family",
    trial: "youth",
    charityRepresentative: "community",
});

/** @param {object} user Utilizador. @param {object} content Conteúdo. @returns {string} Chave única. */
function userContentKey(user, content) {
    return `${user._id}:${content._id}`;
}

/**
 * Produz uma fração estável sem consumir o PRNG global do manifesto.
 *
 * @param {string} namespace Contexto lógico da ordenação.
 * @param {string} key Chave semântica.
 * @param {object} ctx Contexto demo.
 * @returns {number} Valor no intervalo [0, 1].
 */
function deterministicFraction(namespace, key, ctx) {
    const hex = String(deterministicId(namespace, key, ctx.dataSeed)).slice(-6);
    return Number.parseInt(hex, 16) / 0xffffff;
}

/**
 * Resolve o perfil editorial estável de uma persona ou utilizador gerado.
 *
 * @param {object} user Utilizador demo.
 * @returns {{taxonomyKeys: string[], preferredTypes: string[]}} Perfil de gosto.
 */
function tasteProfileForUser(user) {
    const namedProfile = NAMED_USER_PROFILES[user.key];
    if (namedProfile) return TASTE_PROFILES[namedProfile];

    const generatedNumber = Number(String(user.key).replace(/\D/gu, "")) || 1;
    const profileNames = Object.keys(TASTE_PROFILES);
    return TASTE_PROFILES[profileNames[(generatedNumber - 1) % profileNames.length]];
}

/**
 * Confirma que um conteúdo não ultrapassa o limite parental da conta.
 *
 * @param {object} user Utilizador demo.
 * @param {object} content Conteúdo publicado.
 * @returns {boolean} `true` quando a interação é permitida.
 */
function isAllowedForUser(user, content) {
    return Number(content.ageRating) <= Number(user.parentalMaxAgeRating);
}

/**
 * Calcula afinidade editorial usando apenas taxonomias, tipo e desempate estável.
 *
 * @param {object} user Utilizador demo.
 * @param {object} content Conteúdo publicado.
 * @param {object} ctx Contexto demo.
 * @returns {number} Score interno; valores maiores representam maior afinidade.
 */
function affinityScore(user, content, ctx) {
    if (!isAllowedForUser(user, content)) return Number.NEGATIVE_INFINITY;

    const profile = tasteProfileForUser(user);
    const taxonomyIds = new Set((content.taxonomyIds ?? []).map(String));
    const taxonomyMatches = profile.taxonomyKeys.filter((taxonomyKey) =>
        taxonomyIds.has(String(ctx.taxonomyIds[taxonomyKey]))).length;
    const preferredTypeIndex = profile.preferredTypes.indexOf(content.type);
    const typeScore = preferredTypeIndex < 0 ? 0 : 2 - preferredTypeIndex * 0.75;
    const stableVariation = deterministicFraction(
        "engagement-affinity",
        `${user.key}:${content._id}`,
        ctx,
    );

    return taxonomyMatches * 4 + typeScore + stableVariation;
}

/**
 * Ordena o catálogo permitido de acordo com o perfil do utilizador.
 *
 * @param {object} user Utilizador demo.
 * @param {object[]} contents Conteúdos candidatos.
 * @param {object} ctx Contexto demo.
 * @param {Set<string>} [excluded=new Set()] Pares user/content já ocupados.
 * @returns {object[]} Conteúdos permitidos, do mais para o menos relevante.
 */
function rankedContentsForUser(user, contents, ctx, excluded = new Set()) {
    return contents
        .filter(
            (content) =>
                isAllowedForUser(user, content) &&
                !excluded.has(userContentKey(user, content)),
        )
        .toSorted(
            (left, right) =>
                affinityScore(user, right, ctx) - affinityScore(user, left, ctx) ||
                String(left._id).localeCompare(String(right._id)),
        );
}

/**
 * Seleciona pares únicos equilibrando primeiro atividade por utilizador e
 * cobertura por conteúdo; afinidade apenas decide entre candidatos equivalentes.
 *
 * @param {object} input Opções de seleção.
 * @param {object[]} input.users Utilizadores elegíveis.
 * @param {object[]} input.contents Conteúdos candidatos.
 * @param {number} input.count Quantidade exata pretendida.
 * @param {object} input.ctx Contexto demo.
 * @param {Set<string>} [input.used] Pares indisponíveis, mutados durante a seleção.
 * @param {Map<string, number>} [input.userCounts] Contagens por utilizador.
 * @param {Map<string, number>} [input.contentCounts] Contagens por conteúdo.
 * @param {number} [input.maxPerContent] Limite por conteúdo.
 * @param {Set<string>} [input.preferredPairs] Pares reais prévios a privilegiar.
 * @returns {Array<[object, object]>} Pares selecionados.
 */
function selectBalancedPairs({
    users,
    contents,
    count,
    ctx,
    used = new Set(),
    userCounts = new Map(),
    contentCounts = new Map(),
    maxPerContent = Number.POSITIVE_INFINITY,
    preferredPairs = new Set(),
}) {
    const pairs = [];

    while (pairs.length < count) {
        let best;

        for (const user of users) {
            const userId = String(user._id);
            const currentUserCount = userCounts.get(userId) ?? 0;

            for (const content of contents) {
                const key = userContentKey(user, content);
                const contentId = String(content._id);
                const currentContentCount = contentCounts.get(contentId) ?? 0;
                if (
                    used.has(key) ||
                    !isAllowedForUser(user, content) ||
                    currentContentCount >= maxPerContent
                ) continue;

                const candidate = {
                    user,
                    content,
                    key,
                    currentUserCount,
                    currentContentCount,
                    preferred: preferredPairs.has(key) ? 1 : 0,
                    affinity: affinityScore(user, content, ctx),
                };
                const candidateWins =
                    !best ||
                    candidate.currentUserCount < best.currentUserCount ||
                    (candidate.currentUserCount === best.currentUserCount &&
                        candidate.currentContentCount < best.currentContentCount) ||
                    (candidate.currentUserCount === best.currentUserCount &&
                        candidate.currentContentCount === best.currentContentCount &&
                        candidate.preferred > best.preferred) ||
                    (candidate.currentUserCount === best.currentUserCount &&
                        candidate.currentContentCount === best.currentContentCount &&
                        candidate.preferred === best.preferred &&
                        candidate.affinity > best.affinity) ||
                    (candidate.currentUserCount === best.currentUserCount &&
                        candidate.currentContentCount === best.currentContentCount &&
                        candidate.preferred === best.preferred &&
                        candidate.affinity === best.affinity &&
                        candidate.key.localeCompare(best.key) < 0);

                if (candidateWins) best = candidate;
            }
        }

        if (!best) {
            const error = new Error(
                `Nao existem pares demo coerentes suficientes: ${pairs.length}/${count}.`,
            );
            error.code = "DEMO_ENGAGEMENT_CAPACITY_EXCEEDED";
            throw error;
        }

        used.add(best.key);
        userCounts.set(
            String(best.user._id),
            (userCounts.get(String(best.user._id)) ?? 0) + 1,
        );
        contentCounts.set(
            String(best.content._id),
            (contentCounts.get(String(best.content._id)) ?? 0) + 1,
        );
        pairs.push([best.user, best.content]);
    }

    return pairs;
}

/**
 * Transforma atividade num conteúdo público agregador para ratings e perfis.
 *
 * @param {object} content Conteúdo reproduzido.
 * @param {Map<string, object>} contentById Catálogo indexado.
 * @returns {object|null} Filme/documentário/série equivalente.
 */
function publicSignalContent(content, contentById) {
    if (content.type !== "episode") return content;
    return contentById.get(String(content.seriesId)) ?? null;
}

/**
 * Atribui a distribuição contratual de ratings aos pares com base em qualidade
 * editorial simulada e afinidade da persona.
 *
 * @param {Array<[object, object]>} pairs Pares únicos user/content.
 * @param {object} ctx Contexto demo.
 * @returns {Map<string, number>} Rating por par.
 */
function buildRatingValues(pairs, ctx) {
    const ratingBands = [
        [5, 80],
        [4, 100],
        [3, 70],
        [2, 30],
        [1, 20],
    ];
    const popularBonuses = [2.5, 2, 1.6, 1.2];
    const scoredPairs = pairs.map(([user, content]) => {
        const contentIndex = ctx.contents.findIndex(
            (candidate) => String(candidate._id) === String(content._id),
        );
        const quality =
            2.4 +
            deterministicFraction("engagement-quality", String(content._id), ctx) * 1.4 +
            (popularBonuses[contentIndex] ?? 0);
        const personalVariation =
            (deterministicFraction(
                "engagement-rating",
                `${user.key}:${content._id}`,
                ctx,
            ) - 0.5) * 0.4;
        return {
            key: userContentKey(user, content),
            score: quality + affinityScore(user, content, ctx) * 0.28 + personalVariation,
        };
    }).toSorted(
        (left, right) =>
            right.score - left.score || left.key.localeCompare(right.key),
    );
    const values = new Map();
    let offset = 0;

    for (const [value, count] of ratingBands) {
        for (const pair of scoredPairs.slice(offset, offset + count)) {
            values.set(pair.key, value);
        }
        offset += count;
    }

    return values;
}

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoEngagement() {
    const db = await getDemoDb();
    const ctx = getDemoContext();
    const users = ctx.users.filter(
        (user) => user.accountStatus === "active" && user.key !== "coldStart",
    );
    // Engagement editorial pertence a filmes/documentários/séries. Episódios
    // são usados apenas em progresso de playback até o seed de hierarquia ser
    // estendido explicitamente pelo módulo de séries.
    const contents = ctx.publicEngagementContents;
    const playableContents = ctx.playablePublishedContents;

    const pro = ctx.users.find((user) => user.key === "pro");
    const favoritePairs = rankedContentsForUser(pro, contents, ctx)
        .slice(0, 13)
        .map((content) => [pro, content]);
    const favoriteUsed = new Set(
        favoritePairs.map(([user, content]) => userContentKey(user, content)),
    );
    const favoriteUserCounts = new Map([[String(pro._id), favoritePairs.length]]);
    const favoriteContentCounts = new Map();
    for (const [, content] of favoritePairs) {
        const contentId = String(content._id);
        favoriteContentCounts.set(
            contentId,
            (favoriteContentCounts.get(contentId) ?? 0) + 1,
        );
    }
    favoritePairs.push(...selectBalancedPairs({
        users,
        contents,
        count: 47,
        ctx,
        used: favoriteUsed,
        userCounts: favoriteUserCounts,
        contentCounts: favoriteContentCounts,
    }));

    const familyOwner = ctx.users.find((user) => user.key === "familyOwner");
    const watchlistPairs = rankedContentsForUser(
        familyOwner,
        contents,
        ctx,
        favoriteUsed,
    )
        .slice(0, 13)
        .map((content) => [familyOwner, content]);
    const watchlistUsed = new Set(favoriteUsed);
    const watchlistUserCounts = new Map([
        [String(familyOwner._id), watchlistPairs.length],
    ]);
    const watchlistContentCounts = new Map();
    for (const [user, content] of watchlistPairs) {
        watchlistUsed.add(userContentKey(user, content));
        const contentId = String(content._id);
        watchlistContentCounts.set(
            contentId,
            (watchlistContentCounts.get(contentId) ?? 0) + 1,
        );
    }
    watchlistPairs.push(...selectBalancedPairs({
        users,
        contents,
        count: 47,
        ctx,
        used: watchlistUsed,
        userCounts: watchlistUserCounts,
        contentCounts: watchlistContentCounts,
    }));
    const listEntries = [
        ...favoritePairs.map((pair) => [...pair, "favorite"]),
        ...watchlistPairs.map((pair) => [...pair, "watchlist"]),
    ]
        .map(([user, content, type], index) => ({
            _id: deterministicId("list-entry", index + 1, ctx.dataSeed),
            userId: user._id,
            contentId: content._id,
            type,
            demoFixture: DEMO_FIXTURE,
            createdAt: addDays(ctx.referenceDate, -(1 + (index % 120))),
            updatedAt: addDays(ctx.referenceDate, -(index % 20)),
        }));

    const progressPairs = [];
    const progressUsed = new Set();
    const progressUserCounts = new Map();
    const progressContentCounts = new Map();
    const popularityCounts = [24, 18, 12, 8];
    popularityCounts.forEach((count, contentIndex) => {
        const content = playableContents[contentIndex];
        const eligibleUsers = users
            .filter((user) => isAllowedForUser(user, content))
            .toSorted(
                (left, right) =>
                    (progressUserCounts.get(String(left._id)) ?? 0) -
                        (progressUserCounts.get(String(right._id)) ?? 0) ||
                    affinityScore(right, content, ctx) -
                        affinityScore(left, content, ctx) ||
                    String(left._id).localeCompare(String(right._id)),
            );
        if (eligibleUsers.length < count) {
            const error = new Error(
                `Popularidade demo incompatível com parental control: ${eligibleUsers.length}/${count}.`,
            );
            error.code = "DEMO_ENGAGEMENT_CAPACITY_EXCEEDED";
            throw error;
        }

        eligibleUsers.slice(0, count).forEach((user) => {
            progressUsed.add(userContentKey(user, content));
            progressPairs.push([user, content]);
            const userId = String(user._id);
            progressUserCounts.set(
                userId,
                (progressUserCounts.get(userId) ?? 0) + 1,
            );
        });
        progressContentCounts.set(String(content._id), count);
    });
    const reservedPopularIds = new Set(
        playableContents.slice(0, popularityCounts.length).map((content) =>
            String(content._id)),
    );
    progressPairs.push(...selectBalancedPairs({
        users,
        contents: playableContents.filter(
            (content) => !reservedPopularIds.has(String(content._id)),
        ),
        count: 240 - progressPairs.length,
        ctx,
        used: progressUsed,
        userCounts: progressUserCounts,
        contentCounts: progressContentCounts,
        maxPerContent: 7,
    }));
    const playbackProgress = progressPairs.map(([user, content], index) => {
        const completed = index % 3 === 0;
        const durationSeconds = content.durationSeconds;
        const lastWatchedAt = addDays(ctx.referenceDate, -(index % 90));
        const watchedFraction =
            0.18 +
            deterministicFraction(
                "engagement-progress",
                `${user.key}:${content._id}`,
                ctx,
            ) * 0.68;
        return {
            _id: deterministicId("playback", index + 1, ctx.dataSeed),
            userId: user._id,
            contentId: content._id,
            currentTimeSeconds: completed
                ? durationSeconds
                : Math.max(60, Math.floor(durationSeconds * watchedFraction)),
            durationSeconds,
            completed,
            lastWatchedAt,
            demoFixture: DEMO_FIXTURE,
            createdAt: addDays(lastWatchedAt, -(1 + (index % 10))),
            updatedAt: lastWatchedAt,
        };
    });

    const contentById = new Map(
        ctx.contents.map((content) => [String(content._id), content]),
    );
    const preferredRatingPairs = new Set(
        [...favoritePairs, ...watchlistPairs].map(([user, content]) =>
            userContentKey(user, content)),
    );
    for (const [user, content] of progressPairs) {
        const signalContent = publicSignalContent(content, contentById);
        if (signalContent) {
            preferredRatingPairs.add(userContentKey(user, signalContent));
        }
    }
    const ratingPairs = selectBalancedPairs({
        users,
        contents,
        count: 300,
        ctx,
        maxPerContent: 12,
        preferredPairs: preferredRatingPairs,
    });
    const ratingValues = buildRatingValues(ratingPairs, ctx);
    const ratings = ratingPairs.map(([user, content], index) => {
        const createdAt = addDays(ctx.referenceDate, -(1 + (index % 180)));
        return {
            _id: deterministicId("rating", index + 1, ctx.dataSeed),
            userId: user._id,
            contentId: content._id,
            value: ratingValues.get(userContentKey(user, content)),
            demoFixture: DEMO_FIXTURE,
            createdAt,
            updatedAt: createdAt,
        };
    });

    const visibleCommentTemplates = [
        (title) => `Gostei da forma como “${title}” fala de esperança sem simplificar as dificuldades.`,
        (title) => `“${title}” deu uma boa conversa cá em casa depois de vermos o final.`,
        (title) => `A história de “${title}” tem um ritmo calmo, mas vale a pena acompanhar até ao fim.`,
        (title) => `Recomendo “${title}” para ver em família e conversar sobre as escolhas das personagens.`,
        (title) => `A mensagem de serviço em “${title}” ficou comigo depois de terminar.`,
        (title) => `Gostei especialmente da música e do ambiente de comunidade em “${title}”.`,
        (title) => `“${title}” apresenta a fé de forma próxima e com personagens credíveis.`,
        (title) => `Foi uma surpresa positiva; “${title}” equilibra bem emoção e reflexão.`,
        (title) => `Vi “${title}” com o nosso grupo e surgiram perspetivas muito diferentes.`,
        (title) => `A fotografia de “${title}” ajuda bastante a entrar nesta história.`,
        (title) => `“${title}” mostra bem como pequenos gestos podem mudar uma comunidade.`,
        (title) => `Voltaria a ver “${title}”, sobretudo pelas relações entre as personagens.`,
    ];
    const commentStatuses = [
        ...Array(42).fill("visible"),
        ...Array(10).fill("pending_review"),
        ...Array(8).fill("rejected"),
    ];
    const positivePairs = ratingPairs.filter(([user, content]) =>
        ratingValues.get(userContentKey(user, content)) >= 4);
    const commentPairs = [
        ...positivePairs.slice(0, 42),
        ...ratingPairs.slice(42, 60),
    ];
    const comments = commentStatuses.map((status, index) => {
        const [user, content] = commentPairs[index];
        const createdAt = addDays(ctx.referenceDate, -(1 + (index % 120)));
        const body = status === "visible"
            ? visibleCommentTemplates[index % visibleCommentTemplates.length](
                content.title,
            )
            : status === "pending_review"
                ? `Gostei de “${content.title}”. Deixei também uma ligação em www.exemplo.test com mais informação.`
                : index % 2 === 0
                    ? `VEJAM O MEU CANAL sobre “${content.title}” e partilhem com toda a gente.`
                    : `A mesma mensagem promocional foi repetida várias vezes em “${content.title}”.`;
        return {
            _id: deterministicId("comment", index + 1, ctx.dataSeed),
            userId: user._id,
            contentId: content._id,
            body,
            status,
            moderationReason: status === "visible"
                ? null
                : status === "pending_review"
                    ? "Comentário com link aguarda revisão."
                    : index % 2 === 0
                        ? "Spam promocional rejeitado pela moderação."
                        : "Comentário promocional repetido.",
            demoFixture: DEMO_FIXTURE,
            createdAt,
            updatedAt: createdAt,
        };
    });

    const preferenceUsers = users.slice(0, 12);
    const mediaPreferences = preferenceUsers.map((user, index) => ({
        _id: deterministicId("media-preference", index + 1, ctx.dataSeed),
        userId: user._id,
        values: {
            subtitleLanguage: index % 3 === 0 ? "" : "pt",
            audioLanguage: index % 2 === 0 ? "pt" : "en",
            quality:
                user.key === "familyOwner"
                    ? "2160p"
                    : ["720p", "1080p", "2160p"][index % 3],
        },
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -60),
        updatedAt: addDays(ctx.referenceDate, -1),
    }));
    const notificationPreferences = preferenceUsers.map((user, index) => ({
        _id: deterministicId("notification-preference", index + 1, ctx.dataSeed),
        userId: user._id,
        settings: { inApp: true, email: index % 4 === 0, continueWatching: index % 3 !== 0 },
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -60),
        updatedAt: addDays(ctx.referenceDate, -1),
    }));
    const incompleteProgressPairs = progressPairs.filter(
        (_pair, index) => index % 3 !== 0,
    );
    const notificationSpecs = [
        ...incompleteProgressPairs.slice(0, 28).map(([user, content]) => ({
            user,
            type: "continue_watching",
            title: "Continua a ver",
            message: `Retoma “${content.title}” a partir de onde ficaste.`,
            dedupeKey: `continue:${content._id}`,
        })),
        ...[
            ["pro", 8],
            ["familyOwner", 12],
            ["trial", 1],
            ["charityRepresentative", 40],
            ["generated1", 90],
            ["generated2", 40],
            ["generated3", 70],
            ["generated4", 60],
        ].map(([userKey, daysAgo]) => ({
            user: ctx.users.find((user) => user.key === userKey),
            type: "subscription_activated",
            title: "Subscrição registada",
            message: "O estado da tua subscrição FaithFlix foi atualizado.",
            daysAgo,
        })),
        ...["pro", "familyOwner", "familyMember", "familyInvitee"].map(
            (userKey, index) => ({
                user: ctx.users.find((user) => user.key === userKey),
                type: "payment_failed",
                title: "Pagamento não concluído",
                message: "O pagamento simulado não foi concluído. Revê os dados do plano.",
                daysAgo: index + 1,
            }),
        ),
        {
            user: ctx.users.find((user) => user.key === "trial"),
            type: "trial_started",
            title: "Período experimental iniciado",
            message: "O teu período experimental FaithFlix está ativo durante 14 dias.",
            daysAgo: 1,
        },
        ...[
            ["familyInvitee", 3],
            ["generated5", 20],
            ["generated6", 30],
            ["generated7", 40],
        ].map(
            ([userKey, daysAgo]) => ({
                user: ctx.users.find((user) => user.key === userKey),
                type: "family_invitation",
                title: "Convite para um plano Família",
                message: "Recebeste um convite para integrar um plano Família FaithFlix.",
                daysAgo,
            }),
        ),
        ...[["familyMember", 9], ["generated7", 38]].map(([userKey, daysAgo]) => ({
            user: ctx.users.find((user) => user.key === userKey),
            type: "family_invitation_accepted",
            title: "Convite familiar aceite",
            message: "A adesão ao plano Família FaithFlix ficou registada.",
            daysAgo,
        })),
        {
            user: ctx.users.find((user) => user.key === "generated6"),
            type: "family_member_removed",
            title: "Alteração no plano Família",
            message: "A participação no plano Família FaithFlix terminou.",
            daysAgo: 28,
        },
    ];
    const notifications = notificationSpecs.map((spec, index) => {
        const createdAt = addDays(
            ctx.referenceDate,
            -(spec.daysAgo ?? 1 + (index % 25)),
        );
        return {
            _id: deterministicId("notification", index + 1, ctx.dataSeed),
            userId: spec.user._id,
            type: spec.type,
            title: spec.title,
            message: spec.message,
            ...(spec.dedupeKey ? { dedupeKey: spec.dedupeKey } : {}),
            readAt: index % 2 === 0 ? addDays(createdAt, 1) : null,
            demoFixture: DEMO_FIXTURE,
            createdAt,
        };
    });

    await db.collection("user_content_lists").insertMany(listEntries);
    await db.collection("playback_progress").insertMany(playbackProgress);
    await db.collection("content_ratings").insertMany(ratings);
    await db.collection("content_comments").insertMany(comments);
    await db.collection("media_preferences").insertMany(mediaPreferences);
    await db.collection("notification_preferences").insertMany(notificationPreferences);
    await db.collection("notifications").insertMany(notifications);

    return {
        listEntries: listEntries.length,
        playbackProgress: playbackProgress.length,
        ratings: ratings.length,
        comments: comments.length,
        notifications: notifications.length,
    };
}
