/**
 * @file Gera embeddings locais determinísticos para conteúdos publicados.
 */

import { generateContentEmbeddings } from "../src/modules/recommendations/content-embeddings.service.js";

const force = process.argv.includes("--force");
const summary = await generateContentEmbeddings({ force });

console.log(
    [
        "Embeddings de conteudo gerados:",
        `model=${summary.model}`,
        `dimensions=${summary.dimensions}`,
        `scanned=${summary.scanned}`,
        `generated=${summary.generated}`,
        `skipped=${summary.skipped}`,
        `pruned=${summary.pruned}`,
    ].join(" "),
);

process.exit(0);
