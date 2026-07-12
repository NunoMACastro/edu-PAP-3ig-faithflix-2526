/**
 * @file Seed de passagens biblicas de demonstracao FaithFlix.
 */

import { ensureBiblicalPassageIndexes } from "../src/modules/biblical-passages/biblical-passages.service.js";
import {
    DEMO_FIXTURE,
    DEMO_NOW,
    assertDemoUsersReady,
    deleteDemoDocs,
    demoContentIds,
    demoContentIdList,
    demoDate,
    demoPassageIds,
    demoUserIds,
    getDemoDb,
    runSeedCli,
} from "./demo-seed-utils.js";

/**
 * Cria uma passagem biblica demo.
 *
 * @param {number} index Indice no vetor de ids.
 * @param {object} input Dados da passagem.
 * @returns {object} Documento MongoDB.
 */
function passage(index, input) {
    return {
        _id: demoPassageIds[index],
        translation: "Parafraseado",
        status: "published",
        createdBy: demoUserIds.moderator,
        updatedBy: demoUserIds.moderator,
        publishedAt: DEMO_NOW,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        demoFixture: DEMO_FIXTURE,
        ...input,
    };
}

/**
 * Cria passagens e associa-as a conteudos demo publicados.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoBiblical() {
    const db = await getDemoDb();
    await assertDemoUsersReady(db);
    await ensureBiblicalPassageIndexes();

    await deleteDemoDocs(db, "content_biblical_passages", [
        { passageId: { $in: demoPassageIds } },
        { contentId: { $in: demoContentIdList } },
    ]);
    await deleteDemoDocs(db, "biblical_passages");
    await deleteDemoDocs(db, "content_embeddings", [{ contentId: { $in: demoContentIdList } }]);

    const passages = [
        passage(0, {
            book: "Joao",
            chapterStart: 3,
            verseStart: 16,
            chapterEnd: 3,
            verseEnd: 16,
            text: "Deus ama o mundo de forma concreta e chama cada pessoa a viver a fe como caminho de vida.",
            theme: "amor sacrificial",
            reflection: "Liga historias de entrega e reconciliacao a uma leitura crista de amor ativo.",
        }),
        passage(1, {
            book: "Romanos",
            chapterStart: 8,
            verseStart: 28,
            chapterEnd: 8,
            verseEnd: 28,
            text: "Deus trabalha no meio de todas as circunstancias para bem daqueles que procuram o seu proposito.",
            theme: "esperanca na adversidade",
            reflection: "Ajuda a enquadrar narrativas de dor, perda e reconstrucao.",
        }),
        passage(2, {
            book: "Miqueias",
            chapterStart: 6,
            verseStart: 8,
            chapterEnd: 6,
            verseEnd: 8,
            text: "O Senhor pede justica, misericordia e humildade no caminho diario com Deus.",
            theme: "justica e humildade",
            reflection: "Funciona bem em conteudos sobre servico comunitario e responsabilidade social.",
        }),
        passage(3, {
            book: "Salmos",
            chapterStart: 23,
            verseStart: 1,
            chapterEnd: 23,
            verseEnd: 4,
            text: "O Senhor cuida, conduz e acompanha mesmo quando o caminho atravessa lugares de sombra.",
            theme: "cuidado e consolo",
            reflection: "Aproxima momentos de medo ou luto da imagem biblica de cuidado presente.",
        }),
        passage(4, {
            book: "Mateus",
            chapterStart: 5,
            verseStart: 14,
            chapterEnd: 5,
            verseEnd: 16,
            text: "A luz deve ser visivel diante dos outros para que as boas obras apontem para Deus.",
            theme: "testemunho publico",
            reflection: "Boa associacao para historias sobre influencia positiva e vida coerente.",
        }),
        passage(5, {
            book: "Filipenses",
            chapterStart: 4,
            verseStart: 6,
            chapterEnd: 4,
            verseEnd: 7,
            text: "A ansiedade pode ser entregue a Deus em oracao, recebendo paz para guardar o coracao.",
            theme: "paz interior",
            reflection: "Enquadra conteudos sobre pressao, futuro e cura emocional.",
        }),
        passage(6, {
            book: "Neemias",
            chapterStart: 2,
            verseStart: 18,
            chapterEnd: 2,
            verseEnd: 18,
            text: "Quando a comunidade reconhece a mao de Deus, ganha coragem para reconstruir em conjunto.",
            theme: "reconstrucao comunitaria",
            reflection: "Rascunho editorial para conteudos sobre planeamento, servico e lideranca.",
            status: "draft",
            publishedAt: null,
        }),
        passage(7, {
            book: "Tiago",
            chapterStart: 1,
            verseStart: 22,
            chapterEnd: 1,
            verseEnd: 22,
            text: "A fe torna-se visivel quando e praticada, nao apenas escutada.",
            theme: "fe em acao",
            reflection: "Rascunho para historias de compromisso pratico e discipulado diario.",
            status: "draft",
            publishedAt: null,
        }),
    ];

    await db.collection("biblical_passages").insertMany(passages);
    await db.collection("content_biblical_passages").insertMany([
        {
            contentId: demoContentIds.jornadaElias,
            passageId: demoPassageIds[0],
            note: "Referencia principal para discutir amor sacrificial e reconciliacao.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            contentId: demoContentIds.depoisTempestade,
            passageId: demoPassageIds[1],
            note: "Ajuda a enquadrar o tema de reconstrucao depois da perda.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            contentId: demoContentIds.luzesVale,
            passageId: demoPassageIds[2],
            note: "Associada ao eixo de justica, misericordia e servico local.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            contentId: demoContentIds.bomPastor,
            passageId: demoPassageIds[3],
            note: "Referencia pastoral para cuidado e acompanhamento.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            contentId: demoContentIds.caminhoServico,
            passageId: demoPassageIds[4],
            note: "Liga boas obras, testemunho publico e servico juvenil.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            contentId: demoContentIds.cartasPaulo,
            passageId: demoPassageIds[5],
            note: "Base para conversa sobre ansiedade, oracao e perseveranca.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
        {
            contentId: demoContentIds.raizesGraca,
            passageId: demoPassageIds[0],
            note: "Liga memoria familiar, graca e reconciliacao ao eixo de amor sacrificial.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.ponteBairro,
            passageId: demoPassageIds[2],
            note: "Enquadra o servico de bairro como pratica de justica e misericordia.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.salmosCasa,
            passageId: demoPassageIds[3],
            note: "Referencia pastoral para devocionais familiares sobre cuidado e descanso.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.diarioMissao,
            passageId: demoPassageIds[4],
            note: "Associa missao juvenil a testemunho publico e boas obras.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.pequenosRecomecos,
            passageId: demoPassageIds[1],
            note: "Ajuda a conversar sobre esperanca quando a mudanca e lenta.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.noiteLouvor,
            passageId: demoPassageIds[5],
            note: "Relaciona louvor, ansiedade e paz interior em contexto de juventude.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.cuidarQuemCuida,
            passageId: demoPassageIds[3],
            note: "Apoia a reflexao sobre cuidado pastoral e limites saudaveis.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            contentId: demoContentIds.chamadosServir,
            passageId: demoPassageIds[2],
            note: "Liga resposta comunitaria a justica, misericordia e humildade.",
            sortOrder: 0,
            createdBy: demoUserIds.moderator,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
    ]);

    return {
        passages: passages.length,
        published: passages.filter((item) => item.status === "published").length,
        associations: 14,
    };
}

await runSeedCli(import.meta.url, seedDemoBiblical, "Seed demo biblical");
