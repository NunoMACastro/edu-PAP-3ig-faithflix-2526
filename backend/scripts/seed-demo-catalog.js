/**
 * @file Seed de catalogo e taxonomias de demonstracao FaithFlix.
 */

import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.service.js";
import { ensureTaxonomyIndexes } from "../src/modules/catalog/taxonomy.service.js";
import { ensureContentEmbeddingIndexes } from "../src/modules/recommendations/content-embeddings.service.js";
import {
    DEMO_FIXTURE,
    assertDemoUsersReady,
    DEMO_NOW,
    assertNoManualConflicts,
    deleteDemoDocs,
    demoContentIdList,
    demoContentIds,
    demoDate,
    demoTaxonomyIds,
    demoTaxonomyIdList,
    demoUserIds,
    getDemoDb,
    runSeedCli,
} from "./demo-seed-utils.js";

const taxonomies = [
    {
        _id: demoTaxonomyIds.family,
        name: "Familia",
        slug: "familia",
        description: "Conteudos para ver e conversar em familia.",
    },
    {
        _id: demoTaxonomyIds.documentaries,
        name: "Documentarios",
        slug: "documentarios",
        description: "Historias reais de fe, comunidade e servico.",
    },
    {
        _id: demoTaxonomyIds.youth,
        name: "Juventude",
        slug: "juventude",
        description: "Conteudos pensados para jovens e grupos de estudo.",
    },
    {
        _id: demoTaxonomyIds.testimonies,
        name: "Testemunhos",
        slug: "testemunhos",
        description: "Narrativas pessoais de transformacao e esperanca.",
    },
    {
        _id: demoTaxonomyIds.bible,
        name: "Biblia",
        slug: "biblia",
        description: "Conteudos ligados a passagens e temas biblicos.",
    },
    {
        _id: demoTaxonomyIds.service,
        name: "Servico",
        slug: "servico",
        description: "Historias de missao, voluntariado e apoio comunitario.",
    },
];

/**
 * Cria URL visual estavel para cartazes e fundos de demo.
 *
 * @param {string} slug Slug do conteudo.
 * @param {string} title Titulo do conteudo.
 * @param {"poster" | "backdrop"} kind Tipo de imagem.
 * @returns {string} URL placeholder segura.
 */
function imageUrl(slug, title, kind) {
    const size = kind === "poster" ? "600x900" : "1200x675";
    return `https://placehold.co/${size}/172033/f7f4ea?text=${encodeURIComponent(title)}&font=montserrat`;
}

/**
 * Constroi opcoes de qualidade com URLs deterministicas.
 *
 * @param {string} slug Slug do conteudo.
 * @param {boolean} include4k Se deve incluir 4K.
 * @returns {object[]} Opcoes de qualidade.
 */
function qualityOptions(slug, include4k = false) {
    const options = [
        { label: "HD", value: "720p", playbackUrl: `/media/demo/${slug}-720p.mp4` },
        { label: "Full HD", value: "1080p", playbackUrl: `/media/demo/${slug}-1080p.mp4` },
    ];

    if (include4k) {
        options.push({
            label: "4K",
            value: "2160p",
            playbackUrl: `/media/demo/${slug}-2160p.mp4`,
        });
    }

    return options;
}

/**
 * Cria um documento de conteudo com metadados repetiveis.
 *
 * @param {object} input Dados do conteudo.
 * @returns {object} Documento MongoDB.
 */
function content(input) {
    const publishedAt = input.status === "published" ? input.publishedAt : null;
    const common = {
        _id: input._id,
        title: input.title,
        slug: input.slug,
        synopsis: input.synopsis,
        type: input.type,
        ageRating: input.ageRating,
        status: input.status,
        taxonomyIds: input.taxonomyIds,
        assets: {
            posterUrl: imageUrl(input.slug, input.title, "poster"),
            backdropUrl: imageUrl(input.slug, input.title, "backdrop"),
        },
        createdBy: demoUserIds.admin,
        updatedBy: demoUserIds.moderator,
        demoFixture: DEMO_FIXTURE,
        publishedAt,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };

    if (input.type === "series") {
        return common;
    }

    return {
        ...common,
        durationSeconds: input.durationSeconds,
        media: { playbackUrl: `/media/demo/${input.slug}-720p.mp4` },
        tracks: {
            subtitles: [
                {
                    language: "pt",
                    label: "Portugues",
                    src: `/media/demo/${input.slug}.pt.vtt`,
                },
            ],
            audio: [
                {
                    language: "pt",
                    label: "Portugues",
                    src: `/media/demo/${input.slug}-pt.mp4`,
                },
                {
                    language: "en",
                    label: "Ingles",
                    src: `/media/demo/${input.slug}-en.mp4`,
                },
            ],
        },
        qualityOptions: qualityOptions(input.slug, input.include4k),
        ...(input.type === "episode"
            ? {
                  seriesId: input.seriesId,
                  seasonNumber: input.seasonNumber,
                  episodeNumber: input.episodeNumber,
              }
            : {}),
    };
}

const contents = [
    content({
        _id: demoContentIds.jornadaElias,
        title: "A Jornada de Elias",
        slug: "a-jornada-de-elias",
        synopsis: "Um drama familiar sobre perda, coragem e reconciliacao espiritual depois de uma decisao que mudou uma comunidade inteira.",
        type: "movie",
        durationSeconds: 6420,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.testimonies, demoTaxonomyIds.bible],
        include4k: true,
        publishedAt: demoDate(-20),
        createdAt: demoDate(-40),
        updatedAt: demoDate(-19),
    }),
    content({
        _id: demoContentIds.luzesVale,
        title: "Luzes no Vale",
        slug: "luzes-no-vale",
        synopsis: "Documentario sobre voluntarios que acompanham familias vulneraveis e transformam pequenas visitas em redes de apoio local.",
        type: "documentary",
        durationSeconds: 3180,
        ageRating: 12,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.documentaries, demoTaxonomyIds.service],
        publishedAt: demoDate(-18),
        createdAt: demoDate(-38),
        updatedAt: demoDate(-18),
    }),
    content({
        _id: demoContentIds.familiaOracao,
        title: "Familia em Oracao",
        slug: "familia-em-oracao",
        synopsis: "Serie curta que acompanha uma familia a reconstruir rotinas, conversa e fe atraves de desafios quotidianos.",
        type: "series",
        durationSeconds: 2400,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.bible],
        publishedAt: demoDate(-16),
        createdAt: demoDate(-36),
        updatedAt: demoDate(-16),
    }),
    content({
        _id: demoContentIds.familiaOracaoEp1,
        title: "Familia em Oracao: Episodio 1",
        slug: "familia-em-oracao-episodio-1",
        synopsis: "O primeiro episodio apresenta uma noite dificil em casa e uma conversa simples que abre caminho para perdao.",
        type: "episode",
        seriesId: demoContentIds.familiaOracao,
        seasonNumber: 1,
        episodeNumber: 1,
        durationSeconds: 1320,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.bible],
        publishedAt: demoDate(-15),
        createdAt: demoDate(-35),
        updatedAt: demoDate(-15),
    }),
    content({
        _id: demoContentIds.caminhoServico,
        title: "Caminho de Servico",
        slug: "caminho-de-servico",
        synopsis: "Um grupo de jovens prepara uma missao comunitaria e descobre que servir exige organizacao, humildade e perseveranca.",
        type: "movie",
        durationSeconds: 5520,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.youth, demoTaxonomyIds.service],
        publishedAt: demoDate(-13),
        createdAt: demoDate(-33),
        updatedAt: demoDate(-13),
    }),
    content({
        _id: demoContentIds.juventudeProposito,
        title: "Juventude com Proposito",
        slug: "juventude-com-proposito",
        synopsis: "Serie documental sobre grupos de jovens que transformam talentos, musica e tecnologia em projetos de impacto social.",
        type: "series",
        durationSeconds: 2760,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.youth, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-11),
        createdAt: demoDate(-31),
        updatedAt: demoDate(-11),
    }),
    content({
        _id: demoContentIds.depoisTempestade,
        title: "Depois da Tempestade",
        slug: "depois-da-tempestade",
        synopsis: "Documentario intimista sobre comunidades que reconstroem casas, memorias e esperanca depois de uma grande cheia.",
        type: "documentary",
        durationSeconds: 4020,
        ageRating: 12,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.documentaries, demoTaxonomyIds.testimonies, demoTaxonomyIds.service],
        include4k: true,
        publishedAt: demoDate(-9),
        createdAt: demoDate(-29),
        updatedAt: demoDate(-9),
    }),
    content({
        _id: demoContentIds.mesaAberta,
        title: "Mesa Aberta",
        slug: "mesa-aberta",
        synopsis: "Episodio especial onde uma comunidade local organiza jantares semanais para combater solidao e criar amizade.",
        type: "episode",
        seriesId: demoContentIds.entreGeracoes,
        seasonNumber: 1,
        episodeNumber: 1,
        durationSeconds: 1680,
        ageRating: 0,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.service],
        publishedAt: demoDate(-7),
        createdAt: demoDate(-27),
        updatedAt: demoDate(-7),
    }),
    content({
        _id: demoContentIds.cartasPaulo,
        title: "Cartas de Paulo",
        slug: "cartas-de-paulo",
        synopsis: "Documentario de estudo biblico que liga contexto historico, comunidades antigas e perguntas atuais sobre perseveranca.",
        type: "documentary",
        durationSeconds: 3600,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.documentaries, demoTaxonomyIds.bible],
        include4k: true,
        publishedAt: demoDate(-5),
        createdAt: demoDate(-25),
        updatedAt: demoDate(-5),
    }),
    content({
        _id: demoContentIds.bomPastor,
        title: "O Bom Pastor",
        slug: "o-bom-pastor",
        synopsis: "Filme familiar sobre lideranca cuidadora, responsabilidade e a coragem de procurar quem ficou para tras.",
        type: "movie",
        durationSeconds: 5880,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.bible, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-3),
        createdAt: demoDate(-23),
        updatedAt: demoDate(-3),
    }),
    content({
        _id: demoContentIds.raizesGraca,
        title: "Raizes de Graca",
        slug: "raizes-de-graca",
        synopsis: "Uma familia regressa a aldeia dos avos e descobre cartas antigas que reacendem memoria, fe e reconciliacao.",
        type: "movie",
        durationSeconds: 6120,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.testimonies],
        include4k: true,
        publishedAt: demoDate(-2),
        createdAt: demoDate(-22),
        updatedAt: demoDate(-2),
    }),
    content({
        _id: demoContentIds.vozesCapela,
        title: "Vozes da Capela",
        slug: "vozes-da-capela",
        synopsis: "Documentario musical sobre um coro pequeno que encontra uma forma simples de acompanhar idosos isolados.",
        type: "documentary",
        durationSeconds: 2940,
        ageRating: 0,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.documentaries, demoTaxonomyIds.service, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-1),
        createdAt: demoDate(-21),
        updatedAt: demoDate(-1),
    }),
    content({
        _id: demoContentIds.planoSabado,
        title: "Plano de Sabado",
        slug: "plano-de-sabado",
        synopsis: "Episodio leve sobre um grupo de jovens que troca uma tarde de lazer por uma acao de apoio comunitario.",
        type: "episode",
        seriesId: demoContentIds.juventudeProposito,
        seasonNumber: 1,
        episodeNumber: 1,
        durationSeconds: 1560,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.youth, demoTaxonomyIds.family, demoTaxonomyIds.service],
        publishedAt: demoDate(-4),
        createdAt: demoDate(-24),
        updatedAt: demoDate(-4),
    }),
    content({
        _id: demoContentIds.ponteBairro,
        title: "A Ponte do Bairro",
        slug: "a-ponte-do-bairro",
        synopsis: "Dois vizinhos de geracoes diferentes organizam uma rede de explicacoes, refeicoes e visitas semanais.",
        type: "movie",
        durationSeconds: 5400,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.service, demoTaxonomyIds.family],
        include4k: true,
        publishedAt: demoDate(-6),
        createdAt: demoDate(-26),
        updatedAt: demoDate(-6),
    }),
    content({
        _id: demoContentIds.salmosCasa,
        title: "Salmos em Casa",
        slug: "salmos-em-casa",
        synopsis: "Serie curta com devocionais familiares inspirados em salmos, musica simples e conversas ao fim do dia.",
        type: "series",
        durationSeconds: 2280,
        ageRating: 0,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.bible, demoTaxonomyIds.family],
        publishedAt: demoDate(-8),
        createdAt: demoDate(-28),
        updatedAt: demoDate(-8),
    }),
    content({
        _id: demoContentIds.diarioMissao,
        title: "Diario de Missao",
        slug: "diario-de-missao",
        synopsis: "Documentario em formato diario sobre jovens voluntarios durante uma semana de servico fora da sua cidade.",
        type: "documentary",
        durationSeconds: 3360,
        ageRating: 12,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.service, demoTaxonomyIds.youth],
        publishedAt: demoDate(-10),
        createdAt: demoDate(-30),
        updatedAt: demoDate(-10),
    }),
    content({
        _id: demoContentIds.pequenosRecomecos,
        title: "Pequenos Recomecos",
        slug: "pequenos-recomecos",
        synopsis: "Drama sobre uma professora que acompanha alunos em risco e aprende que a perseveranca tambem se ensina.",
        type: "movie",
        durationSeconds: 4980,
        ageRating: 12,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-12),
        createdAt: demoDate(-32),
        updatedAt: demoDate(-12),
    }),
    content({
        _id: demoContentIds.laboratorioEsperanca,
        title: "Laboratorio de Esperanca",
        slug: "laboratorio-de-esperanca",
        synopsis: "Documentario sobre jovens que usam tecnologia, reparacoes e mentoria para apoiar projetos sociais locais.",
        type: "documentary",
        durationSeconds: 2820,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.youth, demoTaxonomyIds.service],
        publishedAt: demoDate(-14),
        createdAt: demoDate(-34),
        updatedAt: demoDate(-14),
    }),
    content({
        _id: demoContentIds.noiteLouvor,
        title: "Noite de Louvor",
        slug: "noite-de-louvor",
        synopsis: "Episodio especial com testemunhos, musica acustica e pequenas reflexoes para grupos de jovens.",
        type: "episode",
        seriesId: demoContentIds.juventudeProposito,
        seasonNumber: 1,
        episodeNumber: 2,
        durationSeconds: 1740,
        ageRating: 0,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.youth, demoTaxonomyIds.bible, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-17),
        createdAt: demoDate(-37),
        updatedAt: demoDate(-17),
    }),
    content({
        _id: demoContentIds.cuidarQuemCuida,
        title: "Cuidar de Quem Cuida",
        slug: "cuidar-de-quem-cuida",
        synopsis: "Documentario sobre equipas pastorais, voluntarios e familias que aprendem limites saudaveis no cuidado ao outro.",
        type: "documentary",
        durationSeconds: 3540,
        ageRating: 10,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.service, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-19),
        createdAt: demoDate(-39),
        updatedAt: demoDate(-19),
    }),
    content({
        _id: demoContentIds.entreGeracoes,
        title: "Entre Geracoes",
        slug: "entre-geracoes",
        synopsis: "Serie documental sobre conversas entre jovens e idosos que partilham memoria, duvidas e fe pratica.",
        type: "series",
        durationSeconds: 2460,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.family, demoTaxonomyIds.testimonies],
        publishedAt: demoDate(-21),
        createdAt: demoDate(-41),
        updatedAt: demoDate(-21),
    }),
    content({
        _id: demoContentIds.chamadosServir,
        title: "Chamados para Servir",
        slug: "chamados-para-servir",
        synopsis: "Filme sobre uma comunidade que prepara uma resposta organizada a uma crise local sem perder humildade.",
        type: "movie",
        durationSeconds: 5700,
        ageRating: 6,
        status: "published",
        taxonomyIds: [demoTaxonomyIds.service, demoTaxonomyIds.bible],
        include4k: true,
        publishedAt: demoDate(-23),
        createdAt: demoDate(-43),
        updatedAt: demoDate(-23),
    }),
    content({
        _id: demoContentIds.projetoNeemias,
        title: "Projeto Neemias",
        slug: "projeto-neemias",
        synopsis: "Rascunho editorial sobre reconstrucao comunitaria, planeamento e lideranca com base numa narrativa biblica.",
        type: "documentary",
        durationSeconds: 3300,
        ageRating: 10,
        status: "draft",
        taxonomyIds: [demoTaxonomyIds.bible, demoTaxonomyIds.service],
        createdAt: demoDate(-4),
        updatedAt: demoDate(-2),
    }),
    content({
        _id: demoContentIds.arquivoTestemunho,
        title: "Arquivo Testemunho 2024",
        slug: "arquivo-testemunho-2024",
        synopsis: "Conteudo arquivado usado para demonstrar gestao editorial sem aparecer no catalogo publico.",
        type: "movie",
        durationSeconds: 2700,
        ageRating: 12,
        status: "archived",
        taxonomyIds: [demoTaxonomyIds.testimonies],
        createdAt: demoDate(-80),
        updatedAt: demoDate(-1),
    }),
];

/**
 * Cria taxonomias, conteudos e uma revisao editorial de exemplo.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoCatalog() {
    const db = await getDemoDb();
    await assertDemoUsersReady(db);
    await ensureTaxonomyIndexes();
    await ensureCatalogIndexes();
    await ensureContentEmbeddingIndexes();

    await assertNoManualConflicts(
        db,
        "taxonomies",
        [
            { _id: { $in: demoTaxonomyIdList } },
            { slug: { $in: taxonomies.map((taxonomy) => taxonomy.slug) } },
        ],
        "Taxonomia de demo",
    );
    await assertNoManualConflicts(
        db,
        "contents",
        [
            { _id: { $in: demoContentIdList } },
            { slug: { $in: contents.map((item) => item.slug) } },
        ],
        "Conteudo de demo",
    );

    await deleteDemoDocs(db, "content_revisions", [{ contentId: { $in: demoContentIdList } }]);
    await deleteDemoDocs(db, "content_embeddings", [{ contentId: { $in: demoContentIdList } }]);
    await deleteDemoDocs(db, "taxonomies");
    await deleteDemoDocs(db, "contents");

    await db.collection("taxonomies").insertMany(
        taxonomies.map((taxonomy) => ({
            ...taxonomy,
            demoFixture: DEMO_FIXTURE,
            createdAt: DEMO_NOW,
            updatedAt: DEMO_NOW,
        })),
    );
    await db.collection("contents").insertMany(contents);
    await db.collection("content_revisions").insertOne({
        contentId: demoContentIds.projetoNeemias,
        action: "demo-initial-draft",
        snapshot: {
            ...contents.find((item) => item._id.equals(demoContentIds.projetoNeemias)),
            title: "Projeto Neemias - versao inicial",
        },
        changedBy: demoUserIds.moderator,
        demoFixture: DEMO_FIXTURE,
        createdAt: demoDate(-1),
    });

    return {
        taxonomies: taxonomies.length,
        contents: contents.length,
        published: contents.filter((item) => item.status === "published").length,
    };
}

await runSeedCli(import.meta.url, seedDemoCatalog, "Seed demo catalog");
