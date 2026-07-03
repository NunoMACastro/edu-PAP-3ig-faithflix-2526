/**
 * @file Gera embeddings de conteúdos publicados do FaithFlix.
 *
 * O script é idempotente: conteúdos cujo texto editorial não mudou são ignorados.
 * Com `EMBEDDINGS_PROVIDER=disabled`, termina sem erro e sem chamar providers.
 */

import { generatePublishedContentEmbeddings } from "../src/modules/recommendations/content-embeddings.js";

try {
    const summary = await generatePublishedContentEmbeddings();

    if (summary.provider === "disabled") {
        console.log(
            "Embeddings desativados: define EMBEDDINGS_PROVIDER=deterministic ou external para gerar vectores.",
        );
    } else {
        console.log(
            [
                `Embeddings processados com provider ${summary.provider}.`,
                `model=${summary.model}`,
                `processed=${summary.processed}`,
                `updated=${summary.updated}`,
                `skipped=${summary.skipped}`,
            ].join(" "),
        );
    }
} catch (error) {
    console.error(`Falha ao gerar embeddings de conteudo: ${error.message}`);
    process.exitCode = 1;
}
