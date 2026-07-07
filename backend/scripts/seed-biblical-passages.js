/**
 * @file Seed editorial seguro de passagens bíblicas.
 *
 * Insere exemplos marcados com `e2eFixture` e associa alguns deles a conteúdos
 * publicados existentes, sem apagar dados manuais.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { ensureBiblicalPassageIndexes } from "../src/modules/biblical-passages/biblical-passages.service.js";

const E2E_TAG = "biblical-passages-v1";
const editorId = new ObjectId("64fb10000000000000000001");
const passageIds = [
    new ObjectId("64fb11000000000000000001"),
    new ObjectId("64fb11000000000000000002"),
    new ObjectId("64fb11000000000000000003"),
    new ObjectId("64fb11000000000000000004"),
    new ObjectId("64fb11000000000000000005"),
    new ObjectId("64fb11000000000000000006"),
    new ObjectId("64fb11000000000000000007"),
    new ObjectId("64fb11000000000000000008"),
];

/**
 * Remove documentos pertencentes ao fixture.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {string} collectionName Coleção.
 * @param {object[]} clauses Condições alternativas.
 * @returns {Promise<void>} Termina depois da remoção.
 */
async function deleteByAny(db, collectionName, clauses) {
    await db.collection(collectionName).deleteMany({ $or: clauses });
}

/**
 * Cria uma passagem de exemplo com metadados consistentes.
 *
 * @param {number} index Índice de passagem.
 * @param {Record<string, unknown>} data Dados bíblicos.
 * @param {Date} now Instante de seed.
 * @returns {Record<string, unknown>} Documento.
 */
function passage(index, data, now) {
    return {
        _id: passageIds[index],
        translation: "Parafraseado",
        status: "published",
        createdBy: editorId,
        updatedBy: editorId,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        e2eFixture: E2E_TAG,
        ...data,
    };
}

const db = await getDb();
const now = new Date();

await ensureBiblicalPassageIndexes();
await deleteByAny(db, "content_biblical_passages", [
    { e2eFixture: E2E_TAG },
    { passageId: { $in: passageIds } },
]);
await deleteByAny(db, "biblical_passages", [
    { e2eFixture: E2E_TAG },
    { _id: { $in: passageIds } },
]);

await db.collection("biblical_passages").insertMany([
    passage(0, {
        book: "Joao",
        chapterStart: 3,
        verseStart: 16,
        chapterEnd: 3,
        verseEnd: 16,
        text:
            "Deus amou o mundo e entregou o seu Filho para que a fe abra caminho para a vida eterna.",
        theme: "amor sacrificial",
        reflection:
            "Esta passagem liga historias de entrega, perda e esperanca a uma leitura cristã de amor ativo.",
    }, now),
    passage(1, {
        book: "Romanos",
        chapterStart: 8,
        verseStart: 28,
        chapterEnd: 8,
        verseEnd: 28,
        text:
            "Deus trabalha em todas as coisas para bem daqueles que o amam e procuram o seu proposito.",
        theme: "esperanca na adversidade",
        reflection:
            "Ajuda a enquadrar narrativas onde a dor nao desaparece, mas ganha sentido no caminho.",
    }, now),
    passage(2, {
        book: "Miqueias",
        chapterStart: 6,
        verseStart: 8,
        chapterEnd: 6,
        verseEnd: 8,
        text:
            "O Senhor pede que pratiques a justica, ames a misericordia e caminhes humildemente com Deus.",
        theme: "justica e humildade",
        reflection:
            "Funciona bem em documentarios ou filmes sobre servico, comunidade e responsabilidade social.",
    }, now),
    passage(3, {
        book: "Salmos",
        chapterStart: 23,
        verseStart: 1,
        chapterEnd: 23,
        verseEnd: 4,
        text:
            "O Senhor conduz, cuida e acompanha mesmo quando o caminho passa por lugares de sombra.",
        theme: "consolo e cuidado",
        reflection:
            "Aproxima a experiencia de medo ou luto da imagem de Deus como pastor presente.",
    }, now),
    passage(4, {
        book: "Mateus",
        chapterStart: 5,
        verseStart: 14,
        chapterEnd: 5,
        verseEnd: 16,
        text:
            "A luz deve brilhar diante dos outros para que as boas obras apontem para Deus.",
        theme: "testemunho publico",
        reflection:
            "Boa associação para conteudos sobre coragem, influencia positiva e vida coerente.",
    }, now),
    passage(5, {
        book: "Filipenses",
        chapterStart: 4,
        verseStart: 6,
        chapterEnd: 4,
        verseEnd: 7,
        text:
            "A ansiedade pode ser entregue a Deus em oracao, recebendo uma paz que guarda o coracao.",
        theme: "paz interior",
        reflection:
            "Ajuda a contextualizar historias de cura emocional, pressao familiar ou medo do futuro.",
    }, now),
    passage(6, {
        book: "Tiago",
        chapterStart: 1,
        verseStart: 22,
        chapterEnd: 1,
        verseEnd: 22,
        text:
            "A fe deve ser praticada, nao apenas ouvida, para se tornar visivel na vida concreta.",
        theme: "fe em acao",
        reflection:
            "Rascunho editorial util para conteudos centrados em compromisso e pratica diaria.",
        status: "draft",
        publishedAt: null,
    }, now),
    passage(7, {
        book: "Isaías",
        chapterStart: 40,
        verseStart: 31,
        chapterEnd: 40,
        verseEnd: 31,
        text:
            "Quem espera no Senhor renova as forças e encontra folego para continuar.",
        theme: "renovacao",
        reflection:
            "Rascunho para historias de perseveranca depois de queda, cansaco ou desilusao.",
        status: "draft",
        publishedAt: null,
    }, now),
]);

const publishedContents = await db
    .collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .limit(4)
    .toArray();
const associations = [];

for (const [index, content] of publishedContents.entries()) {
    associations.push({
        contentId: content._id,
        passageId: passageIds[index],
        note: "Associacao inicial criada pelo seed editorial.",
        sortOrder: index,
        createdBy: editorId,
        createdAt: now,
        e2eFixture: E2E_TAG,
    });
}

if (associations.length > 0) {
    await db.collection("content_biblical_passages").insertMany(associations);
}

console.log(
    [
        "Seed de passagens biblicas concluido:",
        `passages=${passageIds.length}`,
        `associations=${associations.length}`,
        `fixture=${E2E_TAG}`,
    ].join(" "),
);

process.exit(0);
