/**
 * @file Manifesto e geradores determinísticos do dataset FaithFlix demo-v2.
 */

import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { DEMO_FIXTURE_VERSION } from "./seed-safety.js";

export const DEMO_FIXTURE = DEMO_FIXTURE_VERSION;
export const DEMO_MEDIA_FIXTURE_SHA256 =
    "8275def5ed2b836720880da54bce49f8de0aeb137f85b6ded5543e5883a93e20";
export const DEMO_MEDIA_FIXTURE_SIZE_BYTES = 9_065;
export const DEMO_EXPECTED_COUNTS = Object.freeze({
    users: 36,
    taxonomies: 6,
    contents: 48,
    publishedContents: 44,
    userContentLists: 120,
    playbackProgress: 240,
    ratings: 300,
    comments: 60,
    notifications: 48,
    subscriptions: 8,
    familyMemberships: 5,
    paymentAttempts: 52,
    charityApplications: 34,
    charities: 6,
    charityMemberships: 3,
    poolDistributions: 12,
    biblicalPassages: 16,
    contentPassages: 32,
    consents: 12,
    consentEvents: 24,
    deletionRequests: 2,
    embeddings: 34,
    subscriptionPlans: 4,
    trials: 1,
    contentRevisions: 2,
    mediaPreferences: 12,
    notificationPreferences: 12,
    integrations: 3,
    anonymousMetricEvents: 24,
    mediaAssets: 36,
});

const DAY_MS = 24 * 60 * 60 * 1000;
let context;

/**
 * Cria um ObjectId estável a partir da data seed e de uma chave semântica.
 *
 * @param {string} namespace Espaço lógico.
 * @param {string|number} key Chave estável.
 * @param {string} dataSeed Seed textual.
 * @returns {ObjectId} Identificador determinístico.
 */
export function deterministicId(namespace, key, dataSeed) {
    const hex = createHash("sha256")
        .update(`${dataSeed}:${namespace}:${key}`)
        .digest("hex")
        .slice(0, 24);
    return new ObjectId(hex);
}

/** @param {string} value Texto. @returns {string} Slug PT seguro. */
export function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, "-")
        .replace(/^-|-$/gu, "");
}

/** @param {Date} source Data. @param {number} days Dias. @returns {Date} Data. */
export function addDays(source, days) {
    return new Date(source.getTime() + days * DAY_MS);
}

/** @param {Date} source Data. @param {number} months Meses UTC. @returns {Date} Data. */
export function addMonths(source, months) {
    const result = new Date(source);
    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + months);
    return result;
}

/** @param {Date} date Data. @returns {string} Mês YYYY-MM. */
export function monthKey(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Constrói um PRNG simples e repetível.
 *
 * @param {string} seed Seed textual.
 * @returns {() => number} Número no intervalo [0, 1).
 */
export function createDeterministicRandom(seed) {
    let state = createHash("sha256").update(seed).digest().readUInt32LE(0);
    return () => {
        state += 0x6d2b79f5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

const PERSONAS = [
    ["admin", "Admin FaithFlix Demo", "admin@faithflix.demo", "admin", 18],
    ["adminBackup", "Admin Secundário Demo", "admin-secundario@faithflix.demo", "admin", 18],
    ["moderator", "Moderadora Editorial Demo", "moderador@faithflix.demo", "moderator", 18],
    ["pro", "Utilizador Pro Demo", "pro@faithflix.demo", "user", 18],
    ["familyOwner", "Responsável Família Demo", "familia-owner@faithflix.demo", "user", 18],
    ["familyMember", "Membro Família Demo", "familia-membro@faithflix.demo", "user", 12],
    ["familyInvitee", "Convidado Família Demo", "familia-convidado@faithflix.demo", "user", 18],
    ["trial", "Utilizador Trial Demo", "trial@faithflix.demo", "user", 18],
    ["charityRepresentative", "Representante Associação Demo", "associacao@faithflix.demo", "user", 18],
    ["coldStart", "Utilizador Cold Start Demo", "cold-start@faithflix.demo", "user", 12],
];

export const DEMO_CONTENT_TITLES = [
    "A Jornada de Elias", "Luzes no Vale", "Família em Oração", "Caminho de Serviço",
    "Juventude com Propósito", "Depois da Tempestade", "Mesa Aberta", "Cartas de Paulo",
    "O Bom Pastor", "Raízes de Graça", "Vozes da Capela", "Plano de Sábado",
    "A Ponte do Bairro", "Salmos em Casa", "Diário de Missão", "Pequenos Recomeços",
    "Laboratório de Esperança", "Noite de Louvor", "Cuidar de Quem Cuida", "Entre Gerações",
    "Chamados para Servir", "Projeto Neemias", "Sementes de Coragem", "Casa sobre a Rocha",
    "O Caminho de Emaús", "Retratos de Misericórdia", "Uma Fé que Acolhe", "Além do Horizonte",
    "Canções da Comunidade", "Oração no Quotidiano", "Pontes de Esperança", "A Oficina do Bairro",
    "Cartas à Próxima Geração", "O Valor do Silêncio", "Missão na Cidade", "Recomeçar Juntos",
    "A Alegria de Partilhar", "Caminhos de Paz", "Histórias à Mesa", "O Farol da Aldeia",
    "Jovens em Movimento", "Memórias de Gratidão", "Servir sem Fronteiras", "Tempo de Escuta",
    "Projeto Reconstruir", "Arquivo de Testemunhos", "Caderno de Produção", "Especial de Esperança",
];

const DEMO_CONTENT_SYNOPSES = [
    "Elias deixa a segurança da sua aldeia para cumprir uma promessa antiga, descobrindo no caminho que a coragem nasce da confiança e do serviço aos outros.",
    "Depois de um apagão isolar uma comunidade num vale remoto, várias famílias unem-se para levar luz, alimento e esperança às casas mais vulneráveis.",
    "Uma família afastada pelo ritmo do quotidiano aceita o desafio de rezar em conjunto durante trinta dias e reencontra espaço para o diálogo e o perdão.",
    "Um jovem voluntário acompanha uma equipa de apoio domiciliário e aprende que servir também significa escutar, respeitar limites e deixar-se transformar.",
    "Um grupo de adolescentes organiza uma missão solidária no bairro e precisa de conciliar sonhos, responsabilidades e diferentes formas de viver a fé.",
    "Após uma tempestade destruir parte da vila, uma bombeira regressa à comunidade onde cresceu para ajudar na reconstrução e reconciliar-se com o passado.",
    "Uma paróquia abre semanalmente uma grande mesa comunitária, onde desconhecidos partilham refeições e histórias que mudam a forma como se veem uns aos outros.",
    "Através de uma viagem pelos lugares e comunidades das primeiras igrejas, especialistas e crentes exploram a atualidade humana e espiritual das cartas de Paulo.",
    "Um pastor habituado a cuidar de todos enfrenta o desaparecimento de um jovem da comunidade e percebe que também ele precisa de aceitar ajuda.",
    "Três gerações regressam à terra dos avós para recuperar uma pequena quinta e redescobrem tradições de fé, trabalho e gratidão que julgavam perdidas.",
    "Os membros de um coro de bairro preparam o concerto mais importante do ano enquanto enfrentam conflitos pessoais que ameaçam silenciar a harmonia do grupo.",
    "Durante um sábado sem ecrãs, uma família segue um plano simples de descanso, natureza e serviço, descobrindo novas maneiras de estar verdadeiramente presente.",
    "Moradores de lados opostos de um bairro juntam-se para recuperar uma ponte pedonal e transformam a obra num símbolo de reconciliação comunitária.",
    "Cada episódio acompanha uma família diferente que escolhe um salmo para atravessar uma mudança, uma perda ou um momento de celebração.",
    "Uma equipa missionária regista num diário as dúvidas, os encontros e as aprendizagens de um projeto comunitário realizado longe de casa.",
    "Pessoas que recomeçaram depois de perdas profundas contam como pequenos gestos, novas rotinas e apoio comunitário devolveram sentido aos seus dias.",
    "Jovens investigadores desenvolvem soluções simples para combater o isolamento social, testando se a tecnologia pode aproximar sem substituir a presença humana.",
    "Músicos de diferentes tradições cristãs preparam uma noite de louvor conjunta e procuram uma linguagem comum que respeite a identidade de cada comunidade.",
    "Cuidadores informais revelam o desgaste invisível de acompanhar familiares dependentes e as redes locais que os ajudam a preservar dignidade, descanso e esperança.",
    "Avós, pais e adolescentes conversam sobre fé, escolhas e futuro, descobrindo o que muda e o que permanece quando uma história passa de geração em geração.",
    "Voluntários com percursos muito diferentes mostram como reconhecer uma necessidade concreta, preparar uma resposta responsável e servir sem procurar protagonismo.",
    "Uma comunidade recupera um edifício abandonado para criar um centro de apoio, enfrentando burocracia, falta de recursos e divisões internas à maneira de Neemias.",
    "Crianças e adultos recordam momentos em que um pequeno ato de coragem desencadeou mudanças inesperadas na escola, na família ou na comunidade.",
    "Um casal reconstrói a casa herdada junto ao mar enquanto aprende que relações duradouras exigem fundamentos mais sólidos do que planos perfeitos.",
    "Dois viajantes desiludidos percorrem um antigo caminho de peregrinação e, através dos encontros da jornada, reaprendem a reconhecer esperança no que parecia perdido.",
    "Fotógrafos acompanham projetos de apoio social e procuram retratar a misericórdia sem transformar vulnerabilidade em espetáculo ou apagar a voz de quem é ajudado.",
    "Uma pequena comunidade recebe famílias deslocadas e enfrenta os desafios concretos de transformar boas intenções em acolhimento seguro, digno e duradouro.",
    "Uma jovem parte em busca do irmão desaparecido numa região costeira, guiada por pistas deixadas num caderno e pela esperança que recusou abandonar.",
    "Um grupo musical reúne moradores de várias idades para compor canções inspiradas nas histórias, dificuldades e celebrações da sua comunidade.",
    "Pessoas com rotinas muito diferentes experimentam formas simples de oração no trabalho, nos transportes e em casa, avaliando como a prática altera o quotidiano.",
    "Duas associações de cidades vizinhas colaboram para apoiar famílias isoladas, superando rivalidades antigas e construindo pontes onde antes existiam fronteiras.",
    "Uma oficina comunitária ensina reparações a jovens em risco, mas o seu futuro fica ameaçado quando o proprietário decide vender o edifício.",
    "Pais, professores e jovens escrevem cartas para quem viverá daqui a vinte anos, refletindo sobre as escolhas que podem proteger a fé, a comunidade e o planeta.",
    "Uma jornalista habituada ao ruído permanente passa uma semana num lugar de retiro e confronta as perguntas que sempre evitou escutar.",
    "Uma equipa de voluntários identifica idosos que vivem sozinhos no centro urbano e organiza uma rede de visitas sem invadir a sua autonomia.",
    "Depois de um conflito dividir a associação local, antigos amigos regressam à mesma mesa para reconstruir confiança através de compromissos pequenos e verificáveis.",
    "Uma campanha de recolha transforma-se numa celebração quando os participantes descobrem que partilhar tempo e competências pode valer mais do que oferecer objetos.",
    "Líderes de comunidades rivais percorrem juntos uma rota marcada por conflitos antigos, procurando gestos concretos que permitam iniciar um caminho de paz.",
    "À volta de refeições preparadas por várias gerações, moradores contam memórias de migração, fé e pertença que nunca tinham encontrado espaço para partilhar.",
    "Quando o farol da aldeia deixa de funcionar, uma adolescente mobiliza pescadores e vizinhos para o recuperar antes da chegada da época das tempestades.",
    "Jovens de diferentes bairros criam uma iniciativa itinerante de desporto e voluntariado, aprendendo a liderar sem deixar ninguém para trás.",
    "Uma família encontra antigas gravações da avó e decide visitar as pessoas mencionadas, reconstruindo uma memória coletiva feita de gratidão e encontros.",
    "Uma equipa médica e pastoral viaja por comunidades remotas, adaptando a ajuda a cada cultura e aprendendo que servir exige humildade e preparação.",
    "Num centro comunitário sempre ocupado, voluntários criam momentos de escuta individual e descobrem necessidades que os formulários nunca tinham revelado.",
    "Moradores planeiam recuperar um conjunto habitacional degradado, mas o projeto só avançará se conseguirem incluir quem perdeu confiança nas instituições.",
    "Testemunhos gravados ao longo de vários anos são organizados num arquivo digital que preserva as vozes da comunidade sem expor histórias privadas.",
    "A equipa acompanha os bastidores de uma produção solidária, registando decisões criativas, dificuldades técnicas e aprendizagens que não chegaram à versão final.",
    "Num episódio especial, várias personagens regressam para preparar uma celebração comunitária e mostrar como os seus percursos se cruzaram através da esperança.",
];

/**
 * Resolve o artwork WebP local e determinístico da demo.
 *
 * @param {string} slug Slug canónico do conteúdo.
 * @param {"poster" | "backdrop"} kind Tipo de artwork.
 * @returns {string} URL pública local do asset.
 */
function artworkUrl(slug, kind) {
    return `/media/demo/artwork/${slug}-${kind}.webp`;
}

/**
 * Gera uma storage key opaca e determinística, sem incluir título ou slug.
 *
 * @param {string} dataSeed Seed explícita da demo.
 * @param {ObjectId} contentId Conteúdo dono do asset.
 * @returns {string} Chave privada aceite pelo storage local.
 */
function demoMediaStorageKey(dataSeed, contentId) {
    return `${createHash("sha256")
        .update(`${dataSeed}:private-media:${String(contentId)}`)
        .digest("hex")}.mp4`;
}

const CONTENT_TYPES = [
    ...Array(14).fill("movie"),
    ...Array(12).fill("documentary"),
    ...Array(8).fill("series"),
    ...Array(14).fill("episode"),
];
// Mapping editorial explícito: índices de episódios 34..47 para séries 26..33.
// As posições são declaradas, nunca inferidas a partir de títulos ou slugs.
const EPISODE_HIERARCHY = Object.freeze([
    [26, 1, 1],
    [26, 1, 2],
    [27, 1, 1],
    [27, 1, 2],
    [28, 1, 1],
    [28, 2, 1],
    [29, 1, 1],
    [29, 1, 2],
    [30, 1, 1],
    [30, 1, 2],
    [31, 1, 1],
    [31, 1, 2],
    [32, 1, 1],
    [33, 1, 1],
]);
const AGE_RATINGS = [0, 6, 10, 12, 16, 18];
const DEMO_DIRECTORS = [
    "Marta Figueiredo",
    "Tiago Nascimento",
    "Inês Carvalho",
    "Rui Almeida",
    "Leonor Matos",
    "Miguel Correia",
];
const DEMO_CAST = [
    "Ana Martins",
    "Diogo Ferreira",
    "Beatriz Lopes",
    "Tomás Silva",
    "Mariana Rocha",
    "Gonçalo Costa",
    "Sofia Neves",
    "Pedro Cardoso",
];

/**
 * Configura o manifesto uma única vez por processo.
 *
 * @param {{ referenceDate: Date, dataSeed: string, adminPassword: string, userPassword: string }} input Ambiente validado.
 * @returns {object} Contexto completo.
 */
export function configureDemoSeedContext(input) {
    const referenceDate = new Date(input.referenceDate);
    const dataSeed = input.dataSeed;
    const userIds = Object.fromEntries(
        PERSONAS.map(([key]) => [key, deterministicId("user", key, dataSeed)]),
    );
    const users = PERSONAS.map(([key, name, email, role, parentalMaxAgeRating]) => ({
        key,
        _id: userIds[key],
        name,
        email,
        role,
        parentalMaxAgeRating,
        accountStatus: "active",
    }));

    for (let index = 0; index < 26; index += 1) {
        const key = `generated${index + 1}`;
        const accountStatus = index < 20 ? "active" : index < 24 ? "blocked" : "deleted";
        users.push({
            key,
            _id: deterministicId("user", key, dataSeed),
            name: accountStatus === "deleted" ? "Conta eliminada" : `Utilizador Demo ${String(index + 1).padStart(2, "0")}`,
            email: accountStatus === "deleted"
                ? `deleted-${String(index + 1).padStart(2, "0")}@faithflix.local`
                : `utilizador-${String(index + 1).padStart(2, "0")}@faithflix.demo`,
            role: index === 0 ? "moderator" : "user",
            parentalMaxAgeRating: AGE_RATINGS[index % AGE_RATINGS.length],
            accountStatus,
        });
        userIds[key] = users.at(-1)._id;
    }

    const taxonomyDefinitions = [
        ["family", "Família", "familia"],
        ["documentaries", "Documentários", "documentarios"],
        ["youth", "Juventude", "juventude"],
        ["testimonies", "Testemunhos", "testemunhos"],
        ["bible", "Bíblia", "biblia"],
        ["service", "Serviço", "servico"],
    ];
    const taxonomies = taxonomyDefinitions.map(([key, name, slug]) => ({
        key,
        _id: deterministicId("taxonomy", key, dataSeed),
        name,
        slug,
        description: `Conteúdos FaithFlix associados ao tema ${name.toLowerCase()}.`,
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(referenceDate, -200),
        updatedAt: addDays(referenceDate, -30),
    }));
    const taxonomyIds = Object.fromEntries(taxonomies.map((item) => [item.key, item._id]));

    const contentIds = DEMO_CONTENT_TITLES.map((_title, index) =>
        deterministicId("content", index + 1, dataSeed));
    const contents = DEMO_CONTENT_TITLES.map((title, index) => {
        const slug = slugify(title);
        const status = index < 44 ? "published" : index < 46 ? "draft" : "archived";
        const type = CONTENT_TYPES[index];
        const episodeHierarchy =
            type === "episode" ? EPISODE_HIERARCHY[index - 34] : null;
        const mediaAssetId = deterministicId("media-asset", index + 1, dataSeed);
        const isPlayable = status === "published" && type !== "series";
        return {
            _id: contentIds[index],
            title,
            slug,
            synopsis: DEMO_CONTENT_SYNOPSES[index],
            type,
            ...(episodeHierarchy
                ? {
                      seriesId: contentIds[episodeHierarchy[0]],
                      seasonNumber: episodeHierarchy[1],
                      episodeNumber: episodeHierarchy[2],
                  }
                : {}),
            durationSeconds: 1200 + (index % 12) * 420,
            ageRating: AGE_RATINGS[index % AGE_RATINGS.length],
            releaseYear: 2021 + (index % 6),
            status,
            taxonomyIds: [
                taxonomies[index % taxonomies.length]._id,
                taxonomies[(index + 2) % taxonomies.length]._id,
            ],
            assets: {
                posterUrl: artworkUrl(slug, "poster"),
                backdropUrl: artworkUrl(slug, "backdrop"),
                previewUrl: "",
            },
            credits: {
                directors: [DEMO_DIRECTORS[index % DEMO_DIRECTORS.length]],
                creators: index % 3 === 0
                    ? [DEMO_DIRECTORS[(index + 2) % DEMO_DIRECTORS.length]]
                    : [],
                cast: Array.from({ length: 3 }, (_, castIndex) => ({
                    name: DEMO_CAST[(index + castIndex) % DEMO_CAST.length],
                    role: castIndex === 0
                        ? "Protagonista"
                        : castIndex === 1
                          ? "Participação principal"
                          : "Participação",
                })),
            },
            mediaStatus: isPlayable ? "ready" : "pending",
            media: isPlayable
                ? {
                    url: `/api/media/${mediaAssetId}`,
                    protocol: "progressive",
                    mimeType: "video/mp4",
                    quality: "720p",
                }
                : { playbackUrl: "" },
            tracks: { subtitles: [], audio: [] },
            qualityOptions: [],
            createdBy: userIds.admin,
            updatedBy: userIds.moderator,
            demoFixture: DEMO_FIXTURE,
            publishedAt: status === "published" ? addDays(referenceDate, -(44 - index)) : null,
            createdAt: addDays(referenceDate, -(160 - index)),
            updatedAt: addDays(referenceDate, -(44 - Math.min(index, 43))),
        };
    });
    const mediaAssets = contents
        .filter((content) => content.mediaStatus === "ready")
        .map((content) => {
            const index = contentIds.findIndex(
                (contentId) => String(contentId) === String(content._id),
            );
            const assetId = deterministicId("media-asset", index + 1, dataSeed);
            return {
                _id: assetId,
                contentId: content._id,
                storageKey: demoMediaStorageKey(dataSeed, content._id),
                quality: "720p",
                mimeType: "video/mp4",
                sizeBytes: DEMO_MEDIA_FIXTURE_SIZE_BYTES,
                sha256: DEMO_MEDIA_FIXTURE_SHA256,
                status: "ready",
                active: true,
                createdBy: userIds.admin,
                activatedBy: userIds.admin,
                demoFixture: DEMO_FIXTURE,
                createdAt: content.createdAt,
                updatedAt: content.updatedAt,
                uploadedAt: content.updatedAt,
                activatedAt: content.updatedAt,
            };
        });

    const firstClosedMonth = addMonths(
        new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1, 12)),
        -12,
    );
    context = {
        ...input,
        referenceDate,
        users,
        userIds,
        taxonomies,
        taxonomyIds,
        contents,
        contentIds,
        mediaAssets,
        publishedContents: contents.filter((item) => item.status === "published"),
        publicEngagementContents: contents.filter(
            (item) =>
                item.status === "published" &&
                ["movie", "series", "documentary"].includes(item.type),
        ),
        playablePublishedContents: contents.filter(
            (item) =>
                item.status === "published" && item.type !== "series",
        ),
        distributionMonths: Array.from({ length: 12 }, (_, index) =>
            monthKey(addMonths(firstClosedMonth, index))),
        random: createDeterministicRandom(`${dataSeed}:${referenceDate.toISOString()}`),
    };
    return context;
}

/** @returns {object} Contexto configurado. */
export function getDemoContext() {
    if (!context) throw new Error("Contexto demo-v2 ainda não foi configurado.");
    return context;
}

/** @returns {Promise<import("mongodb").Db>} Base configurada. */
export function getDemoDb() {
    return getDb();
}

/**
 * Constrói uma conta persistível sem guardar passwords em claro.
 *
 * @param {object} user Manifesto do utilizador.
 * @returns {Promise<object>} Documento MongoDB.
 */
export async function buildDemoUser(user) {
    const stateDate = addDays(context.referenceDate, -((Number(String(user.key).replace(/\D/gu, "")) || 1) % 90));
    const document = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        parentalMaxAgeRating: user.parentalMaxAgeRating,
        accountStatus: user.accountStatus,
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(stateDate, -90),
        updatedAt: stateDate,
    };
    if (user.accountStatus === "deleted") {
        return { ...document, deletedAt: stateDate };
    }
    const password = user.role === "admin" ? context.adminPassword : context.userPassword;
    return { ...document, passwordHash: await hashPassword(password) };
}
