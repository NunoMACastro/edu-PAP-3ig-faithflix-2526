/** @file Geração interna de atividade representativa FaithFlix demo-v2. */

import {
    DEMO_FIXTURE,
    addDays,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

/**
 * Produz pares user/content únicos, excluindo conteúdos indicados.
 *
 * @param {object[]} users Utilizadores elegíveis.
 * @param {object[]} contents Conteúdos publicados.
 * @param {number} count Quantidade.
 * @param {Set<string>} [used=new Set()] Pares já usados.
 * @param {Set<string>} [excludedContentIds=new Set()] Conteúdos excluídos.
 * @returns {Array<[object, object]>} Pares.
 */
function uniquePairs(users, contents, count, used = new Set(), excludedContentIds = new Set()) {
    const pairs = [];
    const maximumCandidates = users.length * contents.length;
    for (
        let offset = 0;
        offset < maximumCandidates && pairs.length < count;
        offset += 1
    ) {
        const user = users[offset % users.length];
        const content = contents[Math.floor(offset / users.length)];
        const key = `${user._id}:${content._id}`;
        if (excludedContentIds.has(String(content._id)) || used.has(key)) continue;
        used.add(key);
        pairs.push([user, content]);
    }
    if (pairs.length !== count) {
        const error = new Error(
            `Nao existem pares demo unicos suficientes: ${pairs.length}/${count}.`,
        );
        error.code = "DEMO_ENGAGEMENT_CAPACITY_EXCEEDED";
        throw error;
    }
    return pairs;
}

/**
 * Produz pares únicos distribuindo primeiro por conteúdo.
 *
 * Esta ordem impede que o preenchimento residual de progresso crie picos de
 * popularidade superiores aos quatro picos editoriais declarados.
 *
 * @param {object[]} users Utilizadores elegíveis.
 * @param {object[]} contents Conteúdos reproduzíveis.
 * @param {number} count Quantidade.
 * @param {Set<string>} used Pares já usados.
 * @param {Set<string>} excludedContentIds Conteúdos reservados aos picos.
 * @returns {Array<[object, object]>} Pares equilibrados.
 */
function balancedUniquePairs(
    users,
    contents,
    count,
    used,
    excludedContentIds,
) {
    const eligibleContents = contents.filter(
        (content) => !excludedContentIds.has(String(content._id)),
    );
    const pairs = [];
    const maximumCandidates = users.length * eligibleContents.length;

    for (
        let offset = 0;
        offset < maximumCandidates && pairs.length < count;
        offset += 1
    ) {
        const content = eligibleContents[offset % eligibleContents.length];
        const user = users[Math.floor(offset / eligibleContents.length)];
        const pairKey = `${user._id}:${content._id}`;
        if (used.has(pairKey)) continue;
        used.add(pairKey);
        pairs.push([user, content]);
    }

    if (pairs.length !== count) {
        const error = new Error(
            `Nao existem pares demo equilibrados suficientes: ${pairs.length}/${count}.`,
        );
        error.code = "DEMO_ENGAGEMENT_CAPACITY_EXCEEDED";
        throw error;
    }

    return pairs;
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

    const favoritePairs = [];
    const pro = ctx.users.find((user) => user.key === "pro");
    for (let index = 0; index < 13; index += 1) favoritePairs.push([pro, contents[index]]);
    const favoriteUsed = new Set(favoritePairs.map(([user, content]) => `${user._id}:${content._id}`));
    favoritePairs.push(...uniquePairs(users, contents, 47, favoriteUsed));

    const watchlistPairs = [];
    const familyOwner = ctx.users.find((user) => user.key === "familyOwner");
    for (let index = 13; index < 26; index += 1) watchlistPairs.push([familyOwner, contents[index]]);
    const watchlistUsed = new Set(watchlistPairs.map(([user, content]) => `${user._id}:${content._id}`));
    watchlistPairs.push(...uniquePairs(users, contents, 47, watchlistUsed));
    const listEntries = [...favoritePairs.map((pair) => [...pair, "favorite"]), ...watchlistPairs.map((pair) => [...pair, "watchlist"])]
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
    const popularityCounts = [24, 18, 12, 8];
    popularityCounts.forEach((count, contentIndex) => {
        users.slice(0, count).forEach((user) => {
            const content = playableContents[contentIndex];
            progressUsed.add(`${user._id}:${content._id}`);
            progressPairs.push([user, content]);
        });
    });
    progressPairs.push(...balancedUniquePairs(
        users,
        playableContents,
        240 - progressPairs.length,
        progressUsed,
        new Set(playableContents.slice(0, 4).map((content) => String(content._id))),
    ));
    const playbackProgress = progressPairs.map(([user, content], index) => {
        const completed = index % 4 === 0;
        const durationSeconds = content.durationSeconds;
        const lastWatchedAt = addDays(ctx.referenceDate, -(index % 90));
        return {
            _id: deterministicId("playback", index + 1, ctx.dataSeed),
            userId: user._id,
            contentId: content._id,
            currentTimeSeconds: completed ? durationSeconds : Math.max(60, Math.floor(durationSeconds * (0.15 + (index % 60) / 100))),
            durationSeconds,
            completed,
            lastWatchedAt,
            demoFixture: DEMO_FIXTURE,
            createdAt: addDays(lastWatchedAt, -Math.min(index % 20, 10)),
            updatedAt: lastWatchedAt,
        };
    });

    const ratingValues = [
        ...Array(20).fill(1),
        ...Array(30).fill(2),
        ...Array(70).fill(3),
        ...Array(100).fill(4),
        ...Array(80).fill(5),
    ];
    const ratingPairs = uniquePairs(users, contents, ratingValues.length);
    const ratings = ratingPairs.map(([user, content], index) => {
        const createdAt = addDays(ctx.referenceDate, -(1 + (index % 180)));
        return {
            _id: deterministicId("rating", index + 1, ctx.dataSeed),
            userId: user._id,
            contentId: content._id,
            value: ratingValues[index],
            demoFixture: DEMO_FIXTURE,
            createdAt,
            updatedAt: createdAt,
        };
    });

    const commentStatuses = [...Array(42).fill("visible"), ...Array(10).fill("pending_review"), ...Array(8).fill("rejected")];
    const comments = commentStatuses.map((status, index) => {
        const createdAt = addDays(ctx.referenceDate, -(1 + (index % 120)));
        return {
            _id: deterministicId("comment", index + 1, ctx.dataSeed),
            userId: users[index % users.length]._id,
            contentId: contents[(index * 5) % contents.length]._id,
            body: status === "pending_review"
                ? `Comentário ${index + 1} com www.exemplo.test para revisão.`
                : `Partilha ${index + 1} sobre fé, comunidade e esperança.`,
            status,
            moderationReason: status === "visible" ? null : status === "pending_review" ? "Comentário com link aguarda revisão." : "Comentário rejeitado pela moderação.",
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
            quality: ["720p", "1080p", "2160p"][index % 3],
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
    const notificationTypes = ["continue_watching", "subscription_activated", "family_invitation", "payment_failed", "trial_started", "recommendation"];
    const notifications = Array.from({ length: 48 }, (_, index) => {
        const createdAt = addDays(ctx.referenceDate, -(1 + (index % 25)));
        return {
            _id: deterministicId("notification", index + 1, ctx.dataSeed),
            userId: users[index % 10]._id,
            type: notificationTypes[index % notificationTypes.length],
            title: `Atualização FaithFlix ${index + 1}`,
            message: "Há uma nova atualização na tua conta FaithFlix.",
            readAt: index < 24 ? addDays(createdAt, 1) : null,
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
