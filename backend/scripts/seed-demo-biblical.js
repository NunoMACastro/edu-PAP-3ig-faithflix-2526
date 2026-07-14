/** @file Passagens e associações editoriais FaithFlix demo-v2. */

import {
    DEMO_FIXTURE,
    addDays,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

const PASSAGE_DATA = [
    ["João", 3, 16, "amor sacrificial"], ["Romanos", 8, 28, "esperança na adversidade"],
    ["Miqueias", 6, 8, "justiça e humildade"], ["Salmos", 23, 1, "cuidado e consolo"],
    ["Mateus", 5, 14, "testemunho público"], ["Filipenses", 4, 6, "paz interior"],
    ["Neemias", 2, 18, "reconstrução comunitária"], ["Tiago", 1, 22, "fé em ação"],
    ["Isaías", 40, 31, "renovação"], ["Gálatas", 6, 9, "perseverança"],
    ["Hebreus", 10, 24, "encorajamento"], ["Lucas", 10, 33, "misericórdia"],
    ["Provérbios", 3, 5, "confiança"], ["Colossenses", 3, 13, "perdão"],
    ["1 Coríntios", 13, 4, "amor paciente"], ["Efésios", 4, 2, "unidade"],
];

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoBiblical() {
    const db = await getDemoDb();
    const ctx = getDemoContext();
    const passages = PASSAGE_DATA.map(([book, chapterStart, verseStart, theme], index) => {
        const status = index < 12 ? "published" : "draft";
        return {
            _id: deterministicId("biblical-passage", index + 1, ctx.dataSeed),
            book,
            chapterStart,
            verseStart,
            chapterEnd: chapterStart,
            verseEnd: verseStart,
            translation: "Parafraseado",
            text: `Paráfrase editorial sobre ${theme}, preparada para contextualização FaithFlix.`,
            theme,
            reflection: `Ponto de partida para conversar sobre ${theme} no quotidiano.`,
            status,
            createdBy: ctx.userIds.moderator,
            updatedBy: ctx.userIds.moderator,
            publishedAt: status === "published" ? addDays(ctx.referenceDate, -(30 - index)) : null,
            demoFixture: DEMO_FIXTURE,
            createdAt: addDays(ctx.referenceDate, -(90 - index)),
            updatedAt: addDays(ctx.referenceDate, -(30 - Math.min(index, 11))),
        };
    });
    await db.collection("biblical_passages").insertMany(passages);
    const associations = Array.from({ length: 32 }, (_, index) => ({
        _id: deterministicId("content-passage", index + 1, ctx.dataSeed),
        contentId: ctx.publishedContents[index % ctx.publishedContents.length]._id,
        passageId: passages[index % 12]._id,
        note: `Associação bíblica editorial ${index + 1}.`,
        sortOrder: index % 2,
        createdBy: ctx.userIds.moderator,
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -(1 + (index % 30))),
    }));
    await db.collection("content_biblical_passages").insertMany(associations);
    return { passages: passages.length, published: 12, associations: associations.length };
}
