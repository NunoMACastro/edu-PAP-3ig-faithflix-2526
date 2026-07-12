/**
 * @file Seed de atividade, biblioteca, ratings, comentarios e notificacoes.
 */

import { ensureCommentIndexes } from "../src/modules/comments/comments.service.js";
import { ensureLibraryIndexes } from "../src/modules/library/library.service.js";
import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePlaybackIndexes } from "../src/modules/playback/playback.service.js";
import { ensureRatingIndexes } from "../src/modules/ratings/ratings.service.js";
import {
    DEMO_FIXTURE,
    assertDemoUsersReady,
    deleteDemoDocs,
    demoContentIds,
    demoContentIdList,
    demoDate,
    demoUserIds,
    demoUserIdList,
    getDemoDb,
    oid,
    runSeedCli,
} from "./demo-seed-utils.js";

/**
 * Cria uma entrada de lista pessoal.
 *
 * @param {object} input Dados da lista.
 * @returns {object} Documento.
 */
function listEntry(input) {
    return {
        userId: input.userId,
        contentId: input.contentId,
        type: input.type,
        demoFixture: DEMO_FIXTURE,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

/**
 * Cria progresso de reproducao para historico e continuar a ver.
 *
 * @param {object} input Dados de progresso.
 * @returns {object} Documento.
 */
function progress(input) {
    return {
        userId: input.userId,
        contentId: input.contentId,
        currentTimeSeconds: input.currentTimeSeconds,
        durationSeconds: input.durationSeconds,
        completed: input.completed,
        lastWatchedAt: input.lastWatchedAt,
        demoFixture: DEMO_FIXTURE,
        createdAt: input.createdAt,
        updatedAt: input.lastWatchedAt,
    };
}

/**
 * Cria ou recria sinais de utilizador suficientes para biblioteca,
 * recomendacoes e detalhe de conteudo.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoEngagement() {
    const db = await getDemoDb();
    await assertDemoUsersReady(db);
    await ensurePlaybackIndexes();
    await ensureLibraryIndexes();
    await ensureRatingIndexes();
    await ensureCommentIndexes();
    await ensureNotificationIndexes();

    await deleteDemoDocs(db, "playback_progress", [
        { userId: { $in: demoUserIdList } },
        { contentId: { $in: demoContentIdList } },
    ]);
    await deleteDemoDocs(db, "user_content_lists", [
        { userId: { $in: demoUserIdList } },
        { contentId: { $in: demoContentIdList } },
    ]);
    await deleteDemoDocs(db, "media_preferences", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "content_ratings", [
        { userId: { $in: demoUserIdList } },
        { contentId: { $in: demoContentIdList } },
    ]);
    await deleteDemoDocs(db, "content_comments", [
        { userId: { $in: demoUserIdList } },
        { contentId: { $in: demoContentIdList } },
    ]);
    await deleteDemoDocs(db, "notification_preferences", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "notifications", [{ userId: { $in: demoUserIdList } }]);

    const listEntries = [
        listEntry({ userId: demoUserIds.pro, contentId: demoContentIds.jornadaElias, type: "favorite", createdAt: demoDate(-9), updatedAt: demoDate(-2) }),
        listEntry({ userId: demoUserIds.pro, contentId: demoContentIds.luzesVale, type: "favorite", createdAt: demoDate(-8), updatedAt: demoDate(-2) }),
        listEntry({ userId: demoUserIds.pro, contentId: demoContentIds.familiaOracao, type: "watchlist", createdAt: demoDate(-7), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyOwner, contentId: demoContentIds.cartasPaulo, type: "favorite", createdAt: demoDate(-6), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyOwner, contentId: demoContentIds.bomPastor, type: "watchlist", createdAt: demoDate(-5), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyMember, contentId: demoContentIds.entreGeracoes, type: "favorite", createdAt: demoDate(-4), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.caminhoServico, type: "watchlist", createdAt: demoDate(-3), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.pro, contentId: demoContentIds.raizesGraca, type: "favorite", createdAt: demoDate(-3), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.pro, contentId: demoContentIds.vozesCapela, type: "watchlist", createdAt: demoDate(-2), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.pro, contentId: demoContentIds.diarioMissao, type: "watchlist", createdAt: demoDate(-2), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyOwner, contentId: demoContentIds.ponteBairro, type: "favorite", createdAt: demoDate(-4), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyOwner, contentId: demoContentIds.salmosCasa, type: "watchlist", createdAt: demoDate(-3), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyOwner, contentId: demoContentIds.entreGeracoes, type: "favorite", createdAt: demoDate(-2), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyMember, contentId: demoContentIds.juventudeProposito, type: "watchlist", createdAt: demoDate(-4), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.familyMember, contentId: demoContentIds.salmosCasa, type: "favorite", createdAt: demoDate(-3), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.diarioMissao, type: "favorite", createdAt: demoDate(-4), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.cuidarQuemCuida, type: "favorite", createdAt: demoDate(-3), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.chamadosServir, type: "watchlist", createdAt: demoDate(-2), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.moderator, contentId: demoContentIds.laboratorioEsperanca, type: "watchlist", createdAt: demoDate(-2), updatedAt: demoDate(-1) }),
        listEntry({ userId: demoUserIds.admin, contentId: demoContentIds.vozesCapela, type: "favorite", createdAt: demoDate(-1), updatedAt: demoDate(-1) }),
    ];

    const progressRows = [
        progress({ userId: demoUserIds.pro, contentId: demoContentIds.jornadaElias, currentTimeSeconds: 1860, durationSeconds: 6420, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-8) }),
        progress({ userId: demoUserIds.pro, contentId: demoContentIds.caminhoServico, currentTimeSeconds: 5520, durationSeconds: 5520, completed: true, lastWatchedAt: demoDate(-3), createdAt: demoDate(-7) }),
        progress({ userId: demoUserIds.familyOwner, contentId: demoContentIds.cartasPaulo, currentTimeSeconds: 1440, durationSeconds: 3600, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-5) }),
        progress({ userId: demoUserIds.familyMember, contentId: demoContentIds.familiaOracaoEp1, currentTimeSeconds: 620, durationSeconds: 1320, completed: false, lastWatchedAt: demoDate(-2), createdAt: demoDate(-6) }),
        progress({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.luzesVale, currentTimeSeconds: 3180, durationSeconds: 3180, completed: true, lastWatchedAt: demoDate(-4), createdAt: demoDate(-9) }),
        progress({ userId: demoUserIds.pro, contentId: demoContentIds.raizesGraca, currentTimeSeconds: 2140, durationSeconds: 6120, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-3) }),
        progress({ userId: demoUserIds.pro, contentId: demoContentIds.vozesCapela, currentTimeSeconds: 2940, durationSeconds: 2940, completed: true, lastWatchedAt: demoDate(-2), createdAt: demoDate(-3) }),
        progress({ userId: demoUserIds.pro, contentId: demoContentIds.diarioMissao, currentTimeSeconds: 880, durationSeconds: 3360, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-2) }),
        progress({ userId: demoUserIds.familyOwner, contentId: demoContentIds.ponteBairro, currentTimeSeconds: 2700, durationSeconds: 5400, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-4) }),
        progress({ userId: demoUserIds.familyOwner, contentId: demoContentIds.pequenosRecomecos, currentTimeSeconds: 4980, durationSeconds: 4980, completed: true, lastWatchedAt: demoDate(-2), createdAt: demoDate(-5) }),
        progress({ userId: demoUserIds.familyMember, contentId: demoContentIds.planoSabado, currentTimeSeconds: 1560, durationSeconds: 1560, completed: true, lastWatchedAt: demoDate(-2), createdAt: demoDate(-4) }),
        progress({ userId: demoUserIds.familyMember, contentId: demoContentIds.noiteLouvor, currentTimeSeconds: 920, durationSeconds: 1740, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-2) }),
        progress({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.laboratorioEsperanca, currentTimeSeconds: 1640, durationSeconds: 2820, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-3) }),
        progress({ userId: demoUserIds.charityRepresentative, contentId: demoContentIds.cuidarQuemCuida, currentTimeSeconds: 3540, durationSeconds: 3540, completed: true, lastWatchedAt: demoDate(-2), createdAt: demoDate(-4) }),
        progress({ userId: demoUserIds.moderator, contentId: demoContentIds.mesaAberta, currentTimeSeconds: 740, durationSeconds: 1680, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-3) }),
        progress({ userId: demoUserIds.admin, contentId: demoContentIds.chamadosServir, currentTimeSeconds: 1980, durationSeconds: 5700, completed: false, lastWatchedAt: demoDate(-1), createdAt: demoDate(-3) }),
    ];

    const ratings = [
        [demoUserIds.pro, demoContentIds.jornadaElias, 5],
        [demoUserIds.pro, demoContentIds.luzesVale, 4],
        [demoUserIds.familyOwner, demoContentIds.cartasPaulo, 5],
        [demoUserIds.familyOwner, demoContentIds.depoisTempestade, 4],
        [demoUserIds.familyMember, demoContentIds.entreGeracoes, 5],
        [demoUserIds.charityRepresentative, demoContentIds.caminhoServico, 4],
        [demoUserIds.familyInvitee, demoContentIds.bomPastor, 3],
        [demoUserIds.moderator, demoContentIds.juventudeProposito, 5],
        [demoUserIds.admin, demoContentIds.luzesVale, 5],
        [demoUserIds.pro, demoContentIds.raizesGraca, 5],
        [demoUserIds.familyOwner, demoContentIds.raizesGraca, 4],
        [demoUserIds.admin, demoContentIds.raizesGraca, 5],
        [demoUserIds.pro, demoContentIds.vozesCapela, 4],
        [demoUserIds.familyOwner, demoContentIds.vozesCapela, 5],
        [demoUserIds.charityRepresentative, demoContentIds.vozesCapela, 5],
        [demoUserIds.familyOwner, demoContentIds.juventudeProposito, 4],
        [demoUserIds.moderator, demoContentIds.ponteBairro, 5],
        [demoUserIds.familyOwner, demoContentIds.ponteBairro, 5],
        [demoUserIds.pro, demoContentIds.salmosCasa, 4],
        [demoUserIds.familyMember, demoContentIds.salmosCasa, 5],
        [demoUserIds.charityRepresentative, demoContentIds.diarioMissao, 5],
        [demoUserIds.pro, demoContentIds.diarioMissao, 4],
        [demoUserIds.familyOwner, demoContentIds.pequenosRecomecos, 5],
        [demoUserIds.moderator, demoContentIds.pequenosRecomecos, 4],
        [demoUserIds.charityRepresentative, demoContentIds.laboratorioEsperanca, 4],
        [demoUserIds.moderator, demoContentIds.laboratorioEsperanca, 5],
        [demoUserIds.familyMember, demoContentIds.juventudeProposito, 5],
        [demoUserIds.pro, demoContentIds.juventudeProposito, 4],
        [demoUserIds.charityRepresentative, demoContentIds.cuidarQuemCuida, 5],
        [demoUserIds.admin, demoContentIds.cuidarQuemCuida, 4],
        [demoUserIds.familyOwner, demoContentIds.entreGeracoes, 5],
        [demoUserIds.moderator, demoContentIds.entreGeracoes, 4],
        [demoUserIds.admin, demoContentIds.chamadosServir, 5],
        [demoUserIds.charityRepresentative, demoContentIds.chamadosServir, 4],
    ].map(([userId, contentId, value], index) => ({
        userId,
        contentId,
        value,
        demoFixture: DEMO_FIXTURE,
        createdAt: demoDate(-10 + index),
        updatedAt: demoDate(-2),
    }));

    const comments = [
        {
            _id: oid("65f620000000000000000001"),
            userId: demoUserIds.pro,
            contentId: demoContentIds.jornadaElias,
            body: "A historia e simples, mas abre uma conversa muito boa sobre perdao em familia.",
            status: "visible",
            moderationReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-3),
            updatedAt: demoDate(-3),
        },
        {
            _id: oid("65f620000000000000000002"),
            userId: demoUserIds.familyOwner,
            contentId: demoContentIds.cartasPaulo,
            body: "Bom ponto de partida para um grupo de estudo biblico.",
            status: "visible",
            moderationReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
            updatedAt: demoDate(-2),
        },
        {
            _id: oid("65f620000000000000000003"),
            userId: demoUserIds.familyInvitee,
            contentId: demoContentIds.bomPastor,
            body: "Sugiro ver tambem em www.exemplo.test porque tem uma discussao parecida.",
            status: "pending_review",
            moderationReason: "Comentario com link aguarda revisao.",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
        {
            _id: oid("65f620000000000000000004"),
            userId: demoUserIds.pro,
            contentId: demoContentIds.raizesGraca,
            body: "Gostei muito da ligacao entre memoria familiar e reconciliacao.",
            status: "visible",
            moderationReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
        {
            _id: oid("65f620000000000000000005"),
            userId: demoUserIds.familyOwner,
            contentId: demoContentIds.vozesCapela,
            body: "Bom documentario para mostrar como uma comunidade pequena pode cuidar melhor.",
            status: "visible",
            moderationReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
        {
            _id: oid("65f620000000000000000006"),
            userId: demoUserIds.familyMember,
            contentId: demoContentIds.juventudeProposito,
            body: "Curto e facil de ver em grupo de jovens.",
            status: "visible",
            moderationReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
        {
            _id: oid("65f620000000000000000007"),
            userId: demoUserIds.charityRepresentative,
            contentId: demoContentIds.diarioMissao,
            body: "Representa bem a preparacao e o cansaco de uma semana de voluntariado.",
            status: "visible",
            moderationReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
        {
            _id: oid("65f620000000000000000008"),
            userId: demoUserIds.moderator,
            contentId: demoContentIds.laboratorioEsperanca,
            body: "Comentario interno de demo para testar moderacao editorial.",
            status: "pending_review",
            moderationReason: "Comentario mantido em revisao para demonstrar a fila de moderacao.",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
    ];

    await db.collection("user_content_lists").insertMany(listEntries);
    await db.collection("playback_progress").insertMany(progressRows);
    await db.collection("content_ratings").insertMany(ratings);
    await db.collection("content_comments").insertMany(comments);
    await db.collection("media_preferences").insertMany([
        {
            userId: demoUserIds.pro,
            values: { subtitleLanguage: "pt", audioLanguage: "pt", quality: "1080p" },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-4),
            updatedAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyOwner,
            values: { subtitleLanguage: "", audioLanguage: "pt", quality: "2160p" },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-4),
            updatedAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyMember,
            values: { subtitleLanguage: "pt", audioLanguage: "pt", quality: "720p" },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-4),
            updatedAt: demoDate(-1),
        },
    ]);
    await db.collection("notification_preferences").insertMany([
        {
            userId: demoUserIds.pro,
            settings: { inApp: true, email: false, continueWatching: true },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-6),
            updatedAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyMember,
            settings: { inApp: true, email: false, continueWatching: false },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-6),
            updatedAt: demoDate(-1),
        },
    ]);
    await db.collection("notifications").insertMany([
        {
            userId: demoUserIds.pro,
            type: "subscription_activated",
            title: "Subscricao ativa",
            message: "O plano Pro de demonstracao esta ativo.",
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-8),
        },
        {
            userId: demoUserIds.familyInvitee,
            type: "family_invitation",
            title: "Convite familiar",
            message: "Tens um convite pendente para a familia FaithFlix Demo.",
            readAt: null,
            dedupeKey: "demo-family-invite",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyInvitee,
            type: "payment_failed",
            title: "Pagamento recusado",
            message: "O pagamento simulado foi recusado para demonstracao.",
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            userId: demoUserIds.pro,
            type: "continue_watching",
            title: "Continua a ver",
            message: "Tens \"A Jornada de Elias\" por terminar.",
            dedupeKey: `continue:${String(demoContentIds.jornadaElias)}`,
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            userId: demoUserIds.charityRepresentative,
            type: "trial_started",
            title: "Trial iniciado",
            message: "O trial de demonstracao esta ativo durante 14 dias.",
            readAt: demoDate(-1),
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            userId: demoUserIds.pro,
            type: "continue_watching",
            title: "Continua a ver",
            message: "Tens \"Raizes de Graca\" por terminar.",
            dedupeKey: `continue:${String(demoContentIds.raizesGraca)}`,
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyOwner,
            type: "new_family_content",
            title: "Novos conteudos familiares",
            message: "\"Salmos em Casa\" e \"Entre Geracoes\" foram adicionados ao catalogo.",
            dedupeKey: "demo-family-content-batch",
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            userId: demoUserIds.charityRepresentative,
            type: "recommendation",
            title: "Sugestao para associacoes",
            message: "\"Cuidar de Quem Cuida\" pode ajudar a preparar equipas de voluntariado.",
            dedupeKey: "demo-charity-care-recommendation",
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
    ]);

    return {
        listEntries: listEntries.length,
        progress: progressRows.length,
        ratings: ratings.length,
        comments: comments.length,
    };
}

await runSeedCli(import.meta.url, seedDemoEngagement, "Seed demo engagement");
