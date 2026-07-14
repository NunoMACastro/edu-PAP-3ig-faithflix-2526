/** @file Verificador estrutural, temporal, financeiro e de media da demo-v2. */

import { createHash } from "node:crypto";
import { access, lstat, readFile, readdir } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { mediaStorageConfig } from "../src/modules/media/media-storage.service.js";
import { assertAnonymousMetricEvent } from "../src/modules/analytics/analytics.validation.js";
import { assertPersistedIntegration } from "../src/modules/integrations/integrations.validation.js";
import { NOTIFICATION_TYPES } from "../src/modules/notifications/notifications.validation.js";
import {
    DEMO_EXPECTED_COUNTS,
    DEMO_FIXTURE,
    DEMO_MEDIA_FIXTURE_SHA256,
} from "./demo-seed-utils.js";
import {
    DEMO_MARKER_COLLECTION,
    DEMO_MARKER_ID,
} from "./seed-safety.js";

const EXACT_COLLECTION_COUNTS = {
    users: DEMO_EXPECTED_COUNTS.users,
    taxonomies: DEMO_EXPECTED_COUNTS.taxonomies,
    contents: DEMO_EXPECTED_COUNTS.contents,
    user_content_lists: DEMO_EXPECTED_COUNTS.userContentLists,
    playback_progress: DEMO_EXPECTED_COUNTS.playbackProgress,
    content_ratings: DEMO_EXPECTED_COUNTS.ratings,
    content_comments: DEMO_EXPECTED_COUNTS.comments,
    notifications: DEMO_EXPECTED_COUNTS.notifications,
    subscriptions: DEMO_EXPECTED_COUNTS.subscriptions,
    subscription_family_memberships: DEMO_EXPECTED_COUNTS.familyMemberships,
    payment_attempts: DEMO_EXPECTED_COUNTS.paymentAttempts,
    charity_applications: DEMO_EXPECTED_COUNTS.charityApplications,
    charities: DEMO_EXPECTED_COUNTS.charities,
    charity_memberships: DEMO_EXPECTED_COUNTS.charityMemberships,
    pool_distributions: DEMO_EXPECTED_COUNTS.poolDistributions,
    biblical_passages: DEMO_EXPECTED_COUNTS.biblicalPassages,
    content_biblical_passages: DEMO_EXPECTED_COUNTS.contentPassages,
    user_consents: DEMO_EXPECTED_COUNTS.consents,
    user_consent_events: DEMO_EXPECTED_COUNTS.consentEvents,
    privacy_deletion_requests: DEMO_EXPECTED_COUNTS.deletionRequests,
    content_embeddings: DEMO_EXPECTED_COUNTS.embeddings,
    subscription_plans: DEMO_EXPECTED_COUNTS.subscriptionPlans,
    trials: DEMO_EXPECTED_COUNTS.trials,
    content_revisions: DEMO_EXPECTED_COUNTS.contentRevisions,
    media_preferences: DEMO_EXPECTED_COUNTS.mediaPreferences,
    notification_preferences: DEMO_EXPECTED_COUNTS.notificationPreferences,
    integration_settings: DEMO_EXPECTED_COUNTS.integrations,
    anonymous_metric_events: DEMO_EXPECTED_COUNTS.anonymousMetricEvents,
    media_assets: DEMO_EXPECTED_COUNTS.mediaAssets,
};

// Estas coleções obedecem a contratos fechados que proíbem o marker demo ou
// representam estado operacional efémero criado pelo uso normal da demo.
const UNMARKED_BY_DESIGN_COLLECTIONS = new Set([
    "anonymous_metric_events",
    "integration_settings",
    "sessions",
    "rate_limit_counters",
    "password_reset_tokens",
    "password_reset_dev_outbox",
    "demo_email_outbox",
]);
const DAY_MS = 24 * 60 * 60 * 1000;

/** @param {boolean} condition Condição. @param {string} message Mensagem. */
function assert(condition, message) {
    if (!condition) throw new Error(`DEMO_VERIFY_FAILED: ${message}`);
}

/** @param {unknown} value Valor. @returns {string} Chave pública. */
function key(value) {
    return String(value ?? "");
}

/**
 * Confirma que todas as referências existem no respetivo conjunto.
 *
 * @param {object[]} rows Documentos.
 * @param {string} field Campo de referência.
 * @param {Set<string>} allowed IDs existentes.
 * @param {string} label Domínio.
 */
function assertReferences(rows, field, allowed, label) {
    const orphan = rows.find((row) => !allowed.has(key(row[field])));
    assert(!orphan, `${label} contém referência órfã em ${field}.`);
}

/**
 * Lista ficheiros descendentes sem seguir symlinks de diretório.
 *
 * @param {string} root Diretório raiz.
 * @returns {Promise<string[]>} Paths absolutos de ficheiros e symlinks.
 */
async function listDescendantFiles(root) {
    const entries = await readdir(root, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const path = resolve(root, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await listDescendantFiles(path)));
        } else {
            files.push(path);
        }
    }
    return files;
}

/**
 * Verifica a demo persistida sem a modificar.
 *
 * @param {import("mongodb").Db} db Base demo.
 * @param {{ assetRoot?: string, mediaRoot?: string, allowSeedingMarker?: boolean }} [options] Opções.
 * @returns {Promise<object>} Manifesto verificado.
 */
export async function verifyDemoDataset(db, options = {}) {
    const marker = await db.collection(DEMO_MARKER_COLLECTION).findOne({ _id: DEMO_MARKER_ID });
    assert(marker, "marcador de propriedade ausente.");
    assert(
        marker.status === "complete" || (options.allowSeedingMarker && marker.status === "seeding"),
        `marcador com estado inválido: ${marker.status ?? "ausente"}.`,
    );
    assert(marker.fixtureVersion === DEMO_FIXTURE, "versão do marcador inesperada.");
    const referenceDate = new Date(marker.referenceDate);
    assert(!Number.isNaN(referenceDate.getTime()), "referenceDate do marcador inválida.");

    const counts = {};
    for (const [collectionName, expected] of Object.entries(EXACT_COLLECTION_COUNTS)) {
        counts[collectionName] = await db.collection(collectionName).countDocuments();
        assert(counts[collectionName] === expected, `${collectionName}: esperado ${expected}, obtido ${counts[collectionName]}.`);
    }
    const auditLogs = await db.collection("admin_audit_logs").countDocuments();
    assert(auditLogs >= 30, `admin_audit_logs: esperado pelo menos 30, obtido ${auditLogs}.`);

    const persistentCollections = (await db.listCollections({}, { nameOnly: true }).toArray())
        .map((collection) => collection.name)
        .filter((name) =>
            !name.startsWith("system.") &&
            !UNMARKED_BY_DESIGN_COLLECTIONS.has(name));
    for (const collectionName of persistentCollections) {
        const unmarked = await db.collection(collectionName).countDocuments({ demoFixture: { $ne: DEMO_FIXTURE } });
        assert(unmarked === 0, `${collectionName} contém ${unmarked} documentos sem demoFixture.`);
    }

    const [users, contents, ratings, comments, playback, lists, notifications, payments, distributions, applications, charities, familyMemberships, passages, contentPassages, deletionRequests, embeddings, mediaAssets] = await Promise.all([
        db.collection("users").find({}).toArray(),
        db.collection("contents").find({}).toArray(),
        db.collection("content_ratings").find({}).toArray(),
        db.collection("content_comments").find({}).toArray(),
        db.collection("playback_progress").find({}).toArray(),
        db.collection("user_content_lists").find({}).toArray(),
        db.collection("notifications").find({}).toArray(),
        db.collection("payment_attempts").find({}).toArray(),
        db.collection("pool_distributions").find({}).toArray(),
        db.collection("charity_applications").find({}).toArray(),
        db.collection("charities").find({}).toArray(),
        db.collection("subscription_family_memberships").find({}).toArray(),
        db.collection("biblical_passages").find({}).toArray(),
        db.collection("content_biblical_passages").find({}).toArray(),
        db.collection("privacy_deletion_requests").find({}).toArray(),
        db.collection("content_embeddings").find({}).toArray(),
        db.collection("media_assets").find({}).toArray(),
    ]);
    const userIds = new Set(users.map((row) => key(row._id)));
    const contentIds = new Set(contents.map((row) => key(row._id)));
    const charityIds = new Set(charities.map((row) => key(row._id)));
    const passageIds = new Set(passages.map((row) => key(row._id)));
    const [operationalSessions, rateLimitCounters, sessionIndexes, rateLimitIndexes] =
        await Promise.all([
            db.collection("sessions").find({}).toArray(),
            db.collection("rate_limit_counters").find({}).toArray(),
            db.collection("sessions").indexes(),
            db.collection("rate_limit_counters").indexes(),
        ]);
    assert(
        sessionIndexes.some(
            (index) =>
                index.key?.expiresAt === 1 && index.expireAfterSeconds === 0,
        ),
        "sessions sem índice TTL em expiresAt.",
    );
    assert(
        rateLimitIndexes.some(
            (index) =>
                index.key?.expiresAt === 1 && index.expireAfterSeconds === 0,
        ),
        "rate_limit_counters sem índice TTL em expiresAt.",
    );
    for (const session of operationalSessions) {
        const createdAt = new Date(session.createdAt);
        const expiresAt = new Date(session.expiresAt);
        assert(userIds.has(key(session.userId)), "sessão operacional órfã.");
        assert(/^[a-f\d]{64}$/u.test(session.tokenHash), "sessão sem tokenHash SHA-256.");
        assert(
            Number.isFinite(createdAt.getTime()) &&
                Number.isFinite(expiresAt.getTime()) &&
                expiresAt > createdAt &&
                expiresAt.getTime() - createdAt.getTime() <= DAY_MS,
            "sessão fora do TTL absoluto de 24 horas.",
        );
        assert(
            !["token", "sessionToken", "cookie", "email", "ip"].some(
                (field) => Object.hasOwn(session, field),
            ),
            "sessão contém identificador ou segredo bruto.",
        );
        assert(
            session.csrfTokenHash === undefined ||
                /^[a-f\d]{64}$/u.test(session.csrfTokenHash),
            "sessão contém csrfTokenHash inválido.",
        );
        assert(
            session.csrfTokenHashes === undefined ||
                (Array.isArray(session.csrfTokenHashes) &&
                    session.csrfTokenHashes.length <= 4 &&
                    session.csrfTokenHashes.every(
                        (entry) =>
                            /^[a-f\d]{64}$/u.test(entry?.hash) &&
                            Number.isFinite(new Date(entry?.createdAt).getTime()),
                    )),
            "sessão contém histórico CSRF inválido.",
        );
    }
    for (const counter of rateLimitCounters) {
        const windowStart = new Date(counter.windowStart);
        const expiresAt = new Date(counter.expiresAt);
        assert(
            typeof counter.scope === "string" &&
                /^[a-z0-9:_-]{1,80}$/u.test(counter.scope),
            "contador de rate limit contém scope inválido.",
        );
        assert(
            /^[a-f\d]{64}$/u.test(counter.keyHash),
            "contador de rate limit sem keyHash HMAC SHA-256.",
        );
        assert(
            Number.isInteger(counter.count) && counter.count >= 0,
            "contador de rate limit contém count inválido.",
        );
        assert(
            Number.isFinite(windowStart.getTime()) &&
                Number.isFinite(expiresAt.getTime()) &&
                expiresAt > windowStart,
            "contador de rate limit contém janela/TTL inválido.",
        );
        assert(
            !["ip", "email", "userId", "subject", "key"].some((field) =>
                Object.hasOwn(counter, field),
            ),
            "contador de rate limit contém identificador bruto.",
        );
    }
    const [taxonomies, subscriptions, plans, charityMemberships, consents, consentEvents, mediaPreferences, notificationPreferences, trials, auditDocuments, integrations, anonymousMetricEvents] = await Promise.all([
        db.collection("taxonomies").find({}).toArray(),
        db.collection("subscriptions").find({}).toArray(),
        db.collection("subscription_plans").find({}).toArray(),
        db.collection("charity_memberships").find({}).toArray(),
        db.collection("user_consents").find({}).toArray(),
        db.collection("user_consent_events").find({}).toArray(),
        db.collection("media_preferences").find({}).toArray(),
        db.collection("notification_preferences").find({}).toArray(),
        db.collection("trials").find({}).toArray(),
        db.collection("admin_audit_logs").find({}).toArray(),
        db.collection("integration_settings").find({}).toArray(),
        db.collection("anonymous_metric_events").find({}).toArray(),
    ]);
    const taxonomyIds = new Set(taxonomies.map((row) => key(row._id)));
    const planCodes = new Set(plans.map((row) => row.code));
    const paymentIds = new Set(payments.map((row) => key(row._id)));
    const applicationIds = new Set(applications.map((row) => key(row._id)));
    assert(new Set(users.map((row) => row.email?.toLowerCase())).size === users.length, "emails de utilizador duplicados.");
    for (const [rows, field, allowed, label] of [
        [ratings, "userId", userIds, "ratings"], [ratings, "contentId", contentIds, "ratings"],
        [comments, "userId", userIds, "comments"], [comments, "contentId", contentIds, "comments"],
        [playback, "userId", userIds, "playback"], [playback, "contentId", contentIds, "playback"],
        [lists, "userId", userIds, "listas"], [lists, "contentId", contentIds, "listas"],
        [notifications, "userId", userIds, "notificações"],
        [payments, "userId", userIds, "pagamentos"],
        [contentPassages, "contentId", contentIds, "associações bíblicas"],
        [contentPassages, "passageId", passageIds, "associações bíblicas"],
        [subscriptions, "userId", userIds, "subscrições"],
        [familyMemberships, "ownerUserId", userIds, "família"],
        [familyMemberships, "memberUserId", userIds, "família"],
        [consents, "userId", userIds, "consentimentos"],
        [consentEvents, "userId", userIds, "eventos de consentimento"],
        [mediaPreferences, "userId", userIds, "preferências media"],
        [notificationPreferences, "userId", userIds, "preferências de notificação"],
        [trials, "userId", userIds, "trials"],
        [mediaAssets, "contentId", contentIds, "assets media"],
    ]) assertReferences(rows, field, allowed, label);
    for (const content of contents) {
        assert((content.taxonomyIds ?? []).every((id) => taxonomyIds.has(key(id))), "conteúdo com taxonomia órfã.");
    }
    assert(subscriptions.every((row) => row.planCode === "trial" || planCodes.has(row.planCode)), "subscrição com plano órfão.");
    assert(payments.every((row) => planCodes.has(row.planCode)), "pagamento com plano órfão.");
    assert(charities.every((row) => applicationIds.has(key(row.applicationId))), "associação com candidatura órfã.");
    assert(
        new Set(charities.map((row) => row.mission?.trim()).filter(Boolean)).size === charities.length,
        "associações demo devem ter missões públicas distintas.",
    );
    for (const membership of charityMemberships) {
        assert(userIds.has(key(membership.userId)) && charityIds.has(key(membership.charityId)), "membership de associação órfã.");
    }
    for (const distribution of distributions) {
        assert((distribution.paymentSnapshots ?? []).every((row) => paymentIds.has(key(row.paymentAttemptId))), "distribuição com pagamento órfão.");
        assert((distribution.items ?? []).every((row) => charityIds.has(key(row.charityId))), "distribuição com associação órfã.");
    }
    assert(auditDocuments.every((row) => !row.actorUserId || userIds.has(key(row.actorUserId))), "audit log com ator órfão.");

    const expectedIntegrationKeys = new Set([
        "internal_notifications",
        "simulated_payments",
        "aggregate_analytics_export",
    ]);
    assert(
        integrations.every((row) => expectedIntegrationKeys.has(row.key)) &&
            new Set(integrations.map((row) => row.key)).size === expectedIntegrationKeys.size,
        "integration_settings não contém exatamente as chaves canónicas.",
    );
    for (const integration of integrations) {
        try {
            const setting = assertPersistedIntegration(integration.key, integration);
            assert(setting.enabled === true, `integração demo ${integration.key} desativada.`);
        } catch (error) {
            if (error?.message?.startsWith?.("DEMO_VERIFY_FAILED:")) throw error;
            throw new Error(
                `DEMO_VERIFY_FAILED: integration_settings inválida em ${integration.key}.`,
                { cause: error },
            );
        }
    }

    const allowedMetricFields = new Set([
        "_id",
        "type",
        "category",
        "day",
        "expiresAt",
    ]);
    const metricTypeCounts = new Map();
    for (const event of anonymousMetricEvents) {
        assert(
            Object.keys(event).every((field) => allowedMetricFields.has(field)),
            "anonymous_metric_events contém identificadores ou campos livres.",
        );
        try {
            assertAnonymousMetricEvent({
                type: event.type,
                ...(event.category ? { category: event.category } : {}),
            });
        } catch (error) {
            throw new Error(
                "DEMO_VERIFY_FAILED: anonymous_metric_events contém tipo ou categoria inválidos.",
                { cause: error },
            );
        }
        assert(
            event.day instanceof Date &&
                !Number.isNaN(event.day.getTime()) &&
                event.day.getUTCHours() === 0 &&
                event.day.getUTCMinutes() === 0 &&
                event.day.getUTCSeconds() === 0 &&
                event.day.getUTCMilliseconds() === 0 &&
                event.day <= referenceDate,
            "anonymous_metric_events contém dia UTC inválido.",
        );
        assert(
            event.expiresAt instanceof Date &&
                event.expiresAt.getTime() === event.day.getTime() + 90 * DAY_MS,
            "anonymous_metric_events contém retenção diferente de 90 dias.",
        );
        metricTypeCounts.set(event.type, (metricTypeCounts.get(event.type) ?? 0) + 1);
    }
    assert(
        [...metricTypeCounts.values()].length === 4 &&
            [...metricTypeCounts.values()].every((count) => count === 6),
        "anonymous_metric_events não contém seis amostras de cada tipo.",
    );

    const contentById = new Map(contents.map((row) => [key(row._id), row]));
    const usersById = new Map(users.map((row) => [key(row._id), row]));
    const seriesContents = contents.filter((row) => row.type === "series");
    const episodeContents = contents.filter((row) => row.type === "episode");
    assert(
        seriesContents.length === 8 && episodeContents.length === 14,
        "hierarquia demo deve conter oito series e catorze episodios.",
    );
    const episodePositions = new Set();
    for (const episode of episodeContents) {
        const series = contentById.get(key(episode.seriesId));
        assert(
            series?.type === "series",
            `episodio ${episode.slug} referencia uma serie inexistente.`,
        );
        assert(
            Number.isSafeInteger(episode.seasonNumber) &&
                episode.seasonNumber > 0 &&
                Number.isSafeInteger(episode.episodeNumber) &&
                episode.episodeNumber > 0,
            `episodio ${episode.slug} tem posicao invalida.`,
        );
        const position = `${key(episode.seriesId)}:${episode.seasonNumber}:${episode.episodeNumber}`;
        assert(
            !episodePositions.has(position),
            `episodio ${episode.slug} ocupa uma posicao duplicada.`,
        );
        episodePositions.add(position);
        assert(
            episode.status !== "published" || series.status === "published",
            `episodio ${episode.slug} esta publicado sem serie publicada.`,
        );
    }
    assert(
        episodeContents.filter((row) => row.status === "published").length === 10,
        "a demo deve conter dez episodios publicados.",
    );
    assert(
        [...lists, ...ratings, ...comments].every((row) =>
            ["movie", "series", "documentary"].includes(
                contentById.get(key(row.contentId))?.type,
            )),
        "engagement editorial ligado diretamente a episodio.",
    );
    assert(
        playback.every((row) => {
            const content = contentById.get(key(row.contentId));
            return content?.status === "published" && content.type !== "series";
        }),
        "progresso ligado a serie agregadora ou conteudo nao publicado.",
    );
    for (const [rows, label] of [
        [lists, "listas"],
        [playback, "progresso"],
        [ratings, "ratings"],
        [comments, "comentários"],
    ]) {
        assert(
            rows.every((row) => {
                const user = usersById.get(key(row.userId));
                const content = contentById.get(key(row.contentId));
                return content?.ageRating <= user?.parentalMaxAgeRating;
            }),
            `${label} contém atividade acima do limite parental do utilizador.`,
        );
    }

    const statusCount = (rows, status) => rows.filter((row) => row.status === status).length;
    const accountStatusCount = (status) => users.filter((row) => row.accountStatus === status).length;
    assert(accountStatusCount("active") === 30 && accountStatusCount("blocked") === 4 && accountStatusCount("deleted") === 2, "distribuição de estados de utilizador inválida.");
    assert(statusCount(contents, "published") === 44 && statusCount(contents, "draft") === 2 && statusCount(contents, "archived") === 2, "estados do catálogo inválidos.");
    assert([1, 2, 3, 4, 5].every((value, index) => ratings.filter((row) => row.value === value).length === [20, 30, 70, 100, 80][index]), "distribuição de ratings inválida.");
    assert(statusCount(comments, "visible") === 42 && statusCount(comments, "pending_review") === 10 && statusCount(comments, "rejected") === 8, "estados de comentários inválidos.");
    assert(notifications.filter((row) => row.readAt).length === 24, "a demo deve ter 24 notificações lidas.");
    assert(
        notifications.every((row) => NOTIFICATION_TYPES.includes(row.type)),
        "a demo contém tipos de notificação fora do contrato canónico.",
    );
    assert(["pending", "active", "declined", "removed", "left"].every((status) => statusCount(familyMemberships, status) === 1), "estados familiares incompletos.");
    assert(statusCount(applications, "approved") === 6 && statusCount(applications, "pending") === 24 && statusCount(applications, "rejected") === 4, "estados de candidaturas inválidos.");
    assert(statusCount(passages, "published") === 12 && statusCount(passages, "draft") === 4, "estados das passagens inválidos.");
    assert(users.filter((row) => row.role === "admin").length === 2 && users.filter((row) => row.role === "moderator").length === 2 && users.filter((row) => row.role === "user").length === 32, "distribuição de perfis inválida.");
    assert(["active", "trialing", "past_due", "expired", "canceled"].every((status) => statusCount(subscriptions, status) > 0), "estados de subscrição incompletos.");
    for (const email of ["pro@faithflix.demo", "familia-owner@faithflix.demo"]) {
        const user = users.find((row) => row.email === email);
        const subscription = subscriptions.find(
            (row) => key(row.userId) === key(user?._id),
        );
        assert(
            subscription?.status === "active" &&
                new Date(subscription.currentPeriodEnd) > referenceDate,
            `persona ${email} sem ciclo premium ativo.`,
        );
    }
    assert([0, 6, 10, 12, 16, 18].every((age) => contents.some((row) => row.ageRating === age)), "níveis de parental control incompletos.");

    for (const [rows, fields, label] of [
        [lists, ["userId", "contentId", "type"], "listas pessoais"],
        [playback, ["userId", "contentId"], "progressos"],
        [ratings, ["userId", "contentId"], "ratings"],
        [contentPassages, ["contentId", "passageId"], "associações bíblicas"],
    ]) {
        const combinations = rows.map((row) => fields.map((field) => key(row[field])).join("|"));
        assert(new Set(combinations).size === combinations.length, `${label} contém combinações duplicadas.`);
    }
    const personalListPairs = lists.map((row) =>
        [key(row.userId), key(row.contentId)].join("|"));
    assert(
        new Set(personalListPairs).size === personalListPairs.length,
        "o mesmo conteúdo está simultaneamente nos favoritos e na watchlist.",
    );

    const engagedUsers = users.filter(
        (user) =>
            user.accountStatus === "active" &&
            user.email !== "cold-start@faithflix.demo",
    );
    for (const user of engagedUsers) {
        const owns = (rows) => rows.filter((row) => key(row.userId) === key(user._id));
        assert(
            owns(lists).length >= 2 &&
                owns(playback).length >= 7 &&
                owns(ratings).length >= 6 &&
                owns(ratings).some((row) => row.value >= 4),
            `utilizador ativo ${user.email} sem sinais suficientes para recomendação.`,
        );
    }

    const ratingCoverage = contents
        .filter(
            (content) =>
                content.status === "published" &&
                ["movie", "series", "documentary"].includes(content.type),
        )
        .map((content) =>
            ratings.filter((row) => key(row.contentId) === key(content._id)).length);
    assert(
        ratingCoverage.every((count) => count >= 8 && count <= 12),
        "ratings não cobrem o catálogo público de forma representativa.",
    );

    const watchCounts = new Map();
    playback.forEach((row) => watchCounts.set(key(row.contentId), (watchCounts.get(key(row.contentId)) ?? 0) + 1));
    const topWatchCounts = [...watchCounts.values()].sort((left, right) => right - left).slice(0, 4);
    assert(JSON.stringify(topWatchCounts) === JSON.stringify([24, 18, 12, 8]), `popularidade inesperada: ${topWatchCounts.join(",")}.`);
    const pro = users.find((user) => user.email === "pro@faithflix.demo");
    assert(lists.filter((row) => key(row.userId) === key(pro?._id) && row.type === "favorite").length >= 13, "biblioteca Pro não ultrapassa a paginação.");
    assert(
        lists.some(
            (row) =>
                key(row.userId) === key(pro?._id) && row.type === "watchlist",
        ) &&
            playback.some((row) => key(row.userId) === key(pro?._id)) &&
            ratings.some(
                (row) => key(row.userId) === key(pro?._id) && row.value >= 4,
            ),
        "persona Pro não cobre favoritos, watchlist, histórico e rating positivo.",
    );

    const approvedPayments = payments.filter((row) => row.status === "approved");
    assert(approvedPayments.length === 48 && payments.filter((row) => row.status === "failed").length === 4, "estados dos pagamentos inválidos.");
    assert(approvedPayments.every((row) => row.schemaVersion === 2 && row.accountingEstimate === false && Number.isInteger(row.amountCents) && row.approvedAt), "pagamentos aprovados sem snapshot v2.");
    const currentMonth = `${referenceDate.getUTCFullYear()}-${String(referenceDate.getUTCMonth() + 1).padStart(2, "0")}`;
    for (const distribution of distributions) {
        assert(distribution.month < currentMonth, `distribuição ${distribution.month} não pertence a um mês fechado.`);
        assert(distribution.status === "completed", `distribuição ${distribution.month} não está concluída.`);
        const snapshotTotal = (distribution.paymentSnapshots ?? []).reduce((sum, row) => sum + row.poolCents, 0);
        const itemTotal = (distribution.items ?? []).reduce((sum, row) => sum + row.amountCents, 0);
        assert(snapshotTotal === distribution.totalPoolCents && itemTotal === distribution.totalPoolCents, `distribuição ${distribution.month} não reconcilia.`);
    }
    assert(new Set(distributions.map((row) => row.month)).size === 12, "meses financeiros duplicados.");
    const firstFinancialStart = new Date(`${distributions.map((row) => row.month).sort()[0]}-01T00:00:00.000Z`);
    assert(charities.every((row) => row.approvedAt && new Date(row.approvedAt) < firstFinancialStart), "associação aprovada depois do início financeiro.");

    assert(deletionRequests.every((row) => usersById.get(key(row.userId))?.accountStatus === "deleted"), "pedido de eliminação ligado a conta não eliminada.");
    const publicPublishedContentIds = new Set(
        contents
            .filter(
                (row) =>
                    row.status === "published" &&
                    ["movie", "series", "documentary"].includes(row.type),
            )
            .map((row) => key(row._id)),
    );
    const embeddedContentIds = embeddings.map((row) => key(row.contentId));
    assert(new Set(embeddedContentIds).size === embeddings.length, "existem embeddings duplicados.");
    assert(
        publicPublishedContentIds.size === DEMO_EXPECTED_COUNTS.embeddings,
        "volume publico elegivel para embeddings inesperado.",
    );
    assert(
        embeddedContentIds.every((contentId) => publicPublishedContentIds.has(contentId)),
        "embedding órfão, de episódio ou de conteúdo não publicado.",
    );
    assert(
        [...publicPublishedContentIds].every((contentId) => embeddedContentIds.includes(contentId)),
        "conteúdo público publicado sem embedding.",
    );

    const coldStart = users.find((row) => row.email === "cold-start@faithflix.demo");
    assert(consents.some((row) => key(row.userId) === key(coldStart?._id) && row.consents?.personalizedRecommendations === true), "persona cold-start sem personalização ativa.");
    assert(![ratings, comments, playback, lists].some((rows) => rows.some((row) => key(row.userId) === key(coldStart?._id))), "persona cold-start contém atividade.");
    assert(consents.some((row) => key(row.userId) === key(pro?._id) && row.consents?.personalizedRecommendations === true), "persona Pro sem personalização ativa.");
    assert(consents.some((row) => row.consents?.personalizedRecommendations === false), "falta persona com personalização recusada.");

    const activityCollections = [ratings, comments, playback, notifications];
    const activityLowerBound = new Date(referenceDate);
    activityLowerBound.setUTCDate(activityLowerBound.getUTCDate() - 180);
    const eventCollections = [users, contents, ...activityCollections, lists, applications, passages];
    for (const rows of eventCollections) {
        for (const row of rows) {
            for (const field of ["createdAt", "updatedAt", "publishedAt", "submittedAt", "reviewedAt", "lastWatchedAt", "readAt"]) {
                if (row[field]) assert(new Date(row[field]) <= referenceDate, `${field} no futuro em ${key(row._id)}.`);
            }
        }
    }
    for (const rows of activityCollections) {
        for (const row of rows) {
            const activityDate = row.lastWatchedAt ?? row.createdAt;
            assert(activityDate && new Date(activityDate) >= activityLowerBound, `atividade anterior à janela de 180 dias em ${key(row._id)}.`);
        }
    }

    const publicRoot = resolve(
        options.assetRoot ?? resolve(process.cwd(), "../frontend/public"),
    );
    const privateMediaRoot = resolve(options.mediaRoot ?? mediaStorageConfig.root);
    const privateFromPublic = relative(publicRoot, privateMediaRoot);
    assert(
        privateFromPublic.startsWith("..") || isAbsolute(privateFromPublic),
        "MEDIA_STORAGE_ROOT nao pode estar dentro de frontend/public.",
    );
    const privateRootStats = await lstat(privateMediaRoot);
    assert(
        privateRootStats.isDirectory() &&
            !privateRootStats.isSymbolicLink() &&
            (privateRootStats.mode & 0o077) === 0,
        "MEDIA_STORAGE_ROOT nao e um diretorio privado regular.",
    );
    const publicFiles = await listDescendantFiles(publicRoot);
    assert(
        !publicFiles.some((file) => /\.(?:mp4|m4s|m3u8|mpd|vtt)$/iu.test(file)),
        "frontend/public contem playback ou faixas de media.",
    );

    const assetsByContent = new Map();
    for (const asset of mediaAssets) {
        const contentId = key(asset.contentId);
        const ownerAssets = assetsByContent.get(contentId) ?? [];
        ownerAssets.push(asset);
        assetsByContent.set(contentId, ownerAssets);

        const content = contentById.get(contentId);
        assert(
            content?.status === "published" && content.type !== "series",
            `asset ativo ligado a conteudo nao reproduzivel ${contentId}.`,
        );
        assert(asset.status === "ready" && asset.active === true, `asset ${key(asset._id)} nao esta ativo.`);
        assert(asset.mimeType === "video/mp4" && asset.quality === "720p", `metadata invalida no asset ${key(asset._id)}.`);
        assert(/^[a-f0-9]{64}\.mp4$/u.test(asset.storageKey), `storageKey invalida no asset ${key(asset._id)}.`);
        assert(asset.sha256 === DEMO_MEDIA_FIXTURE_SHA256, `SHA persistido invalido no asset ${key(asset._id)}.`);

        const filePath = resolve(privateMediaRoot, asset.storageKey);
        const fromStorageRoot = relative(privateMediaRoot, filePath);
        assert(
            fromStorageRoot !== "" &&
                !fromStorageRoot.startsWith("..") &&
                !isAbsolute(fromStorageRoot),
            `path privado invalido no asset ${key(asset._id)}.`,
        );
        const fileStats = await lstat(filePath);
        assert(fileStats.isFile() && !fileStats.isSymbolicLink(), `asset ${key(asset._id)} nao e ficheiro regular.`);
        assert((fileStats.mode & 0o077) === 0, `permissoes publicas no asset ${key(asset._id)}.`);
        assert(fileStats.size === asset.sizeBytes, `tamanho invalido no asset ${key(asset._id)}.`);
        const checksum = createHash("sha256")
            .update(await readFile(filePath))
            .digest("hex");
        assert(checksum === asset.sha256, `checksum privado invalido no asset ${key(asset._id)}.`);
    }

    const publicLocations = new Set();
    for (const content of contents) {
        assert(
            Number.isSafeInteger(content.releaseYear) &&
                content.releaseYear >= 1888 &&
                content.releaseYear <= referenceDate.getUTCFullYear() + 1,
            `ano editorial invalido em ${content.slug}.`,
        );
        assert(
            Array.isArray(content.credits?.directors) &&
                content.credits.directors.length > 0 &&
                Array.isArray(content.credits?.cast) &&
                content.credits.cast.length > 0,
            `creditos editoriais em falta em ${content.slug}.`,
        );
        assert(
            content.assets?.previewUrl === "",
            `preview demo nao fornecido em ${content.slug}.`,
        );
        for (const location of [
            content.assets?.posterUrl,
            content.assets?.backdropUrl,
        ]) {
            assert(typeof location === "string" && location.startsWith("/media/demo/artwork/"), `artwork nao local em ${content.slug}.`);
            await access(resolve(publicRoot, location.slice(1)));
            publicLocations.add(location);
        }

        const ownerAssets = assetsByContent.get(key(content._id)) ?? [];
        const shouldBePlayable =
            content.status === "published" && content.type !== "series";
        assert(ownerAssets.length === (shouldBePlayable ? 1 : 0), `contagem de assets invalida em ${content.slug}.`);
        assert(Array.isArray(content.qualityOptions) && content.qualityOptions.length === 0, `variantes legacy em ${content.slug}.`);
        assert(
            Array.isArray(content.tracks?.subtitles) &&
                content.tracks.subtitles.length === 0 &&
                Array.isArray(content.tracks?.audio) &&
                content.tracks.audio.length === 0,
            `faixas publicas ou legacy em ${content.slug}.`,
        );

        if (shouldBePlayable) {
            const asset = ownerAssets[0];
            assert(content.mediaStatus === "ready", `media pronta em falta em ${content.slug}.`);
            assert(
                content.media?.url === `/api/media/${key(asset._id)}` &&
                    content.media?.protocol === "progressive" &&
                    content.media?.mimeType === "video/mp4" &&
                    content.media?.quality === asset.quality,
                `URL privada incoerente em ${content.slug}.`,
            );
        } else {
            assert(content.mediaStatus === "pending", `conteudo nao reproduzivel marcado ready em ${content.slug}.`);
            assert(
                !content.media?.url && !content.media?.playbackUrl,
                `conteudo nao reproduzivel contem fonte em ${content.slug}.`,
            );
        }
    }
    assert([...publicLocations].every((location) => !/^https?:\/\//iu.test(location)), "artwork externo detetado.");

    return {
        verified: true,
        fixtureVersion: DEMO_FIXTURE,
        referenceDate: referenceDate.toISOString(),
        counts: { ...counts, admin_audit_logs: auditLogs },
    };
}
