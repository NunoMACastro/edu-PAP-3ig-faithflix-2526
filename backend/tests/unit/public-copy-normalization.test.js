/**
 * @file Regressão da linguagem editorial exposta por dados de apresentação legacy.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import { publicBiblicalPassage } from "../../src/modules/biblical-passages/biblical-passages.service.js";
import { publicComment } from "../../src/modules/comments/comments.service.js";

test("comentários legacy perdem marcadores operacionais sem alterar texto real", () => {
    const baseComment = {
        _id: new ObjectId(),
        contentId: new ObjectId(),
        status: "visible",
        moderationReason: null,
        createdAt: new Date("2026-07-12T10:00:00.000Z"),
        updatedAt: new Date("2026-07-12T10:00:00.000Z"),
    };

    assert.equal(
        publicComment({
            ...baseComment,
            body: "Comentário de demonstração 7 sobre fé e esperança.",
            demoFixture: "faithflix-demo-v2",
        }).body,
        "Partilha 7 sobre fé e esperança.",
    );
    assert.equal(
        publicComment({
            ...baseComment,
            body: "Uma demonstração pessoal de esperança.",
        }).body,
        "Uma demonstração pessoal de esperança.",
    );
});

test("passagens legacy usam texto editorial sem modificar documentos comuns", () => {
    const basePassage = {
        _id: new ObjectId(),
        book: "João",
        chapterStart: 3,
        verseStart: 16,
        chapterEnd: 3,
        verseEnd: 16,
        translation: "Parafraseado",
        theme: "amor",
        reflection: "Reflexão editorial.",
    };
    const legacy = publicBiblicalPassage(
        {
            ...basePassage,
            text: "Paráfrase de demonstração sobre amor, preparada para contextualização editorial FaithFlix.",
            demoFixture: "faithflix-demo-v2",
        },
        {
            note: "Associação bíblica de demonstração 3.",
            demoFixture: "faithflix-demo-v2",
        },
    );

    assert.equal(
        legacy.text,
        "Paráfrase editorial sobre amor, preparada para contextualização FaithFlix.",
    );
    assert.equal(legacy.note, "Associação bíblica editorial 3.");
    assert.equal(
        publicBiblicalPassage({
            ...basePassage,
            text: "Texto comum sobre uma demonstração de fé.",
        }).text,
        "Texto comum sobre uma demonstração de fé.",
    );
});
