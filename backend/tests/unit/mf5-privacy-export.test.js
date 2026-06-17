// real_dev/backend/tests/unit/mf5-privacy-export.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { buildUserDataExport } from "../../src/modules/privacy/privacy.service.js";

/**
 * Cria uma coleção mínima compatível com as consultas deste BK.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, unknown>} Coleção de teste.
 */
function collection(rows) {
    return {
        async findOne(query) {
            return rows.find((row) => String(row._id) === String(query._id)) ?? null;
        },
        find(query) {
            const result = rows.filter((row) => String(row.userId) === String(query.userId));

            return {
                sort() {
                    return this;
                },
                async toArray() {
                    return result;
                },
            };
        },
    };
}

test("MF5 exporta apenas dados do utilizador autenticado sem campos sensíveis", async () => {
    const userId = new ObjectId();
    const otherUserId = new ObjectId();

    setDbForTests({
        collection(name) {
            if (name === "users") {
                return collection([
                    {
                        _id: userId,
                        name: "Ana Faith",
                        email: "ana@example.test",
                        role: "user",
                        passwordHash: "nao-deve-sair",
                    },
                ]);
            }

            if (name === "notifications") {
                return collection([
                    { _id: new ObjectId(), userId, title: "Bem-vinda" },
                    { _id: new ObjectId(), userId: otherUserId, title: "Outra conta" },
                ]);
            }

            if (name === "content_comments") {
                return collection([
                    { _id: new ObjectId(), userId, body: "Comentário visível" },
                ]);
            }

            if (name === "media_preferences") {
                return collection([
                    {
                        _id: new ObjectId(),
                        userId,
                        values: { subtitleLanguage: "pt", quality: "720p" },
                    },
                ]);
            }

            return collection([]);
        },
    });

    const result = await buildUserDataExport(String(userId));

    assert.equal(result.user.email, "ana@example.test");
    assert.equal("passwordHash" in result.user, false);
    assert.equal(result.sections.notifications.length, 1);
    assert.equal(result.sections.notifications[0].title, "Bem-vinda");
    assert.equal(result.sections.content_comments[0].body, "Comentário visível");
    assert.equal(result.sections.media_preferences[0].values.quality, "720p");

    setDbForTests(null);
});