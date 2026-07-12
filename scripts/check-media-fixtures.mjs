/**
 * @file Validação estática das fixtures locais de media e ausência de URLs externas.
 */

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const expectedBinarySha256 = new Map([
    [
        "tests/fixtures/media/synthetic-progressive.mp4",
        "8275def5ed2b836720880da54bce49f8de0aeb137f85b6ded5543e5883a93e20",
    ],
    ["tests/fixtures/media/synthetic-init.mp4", "a310f52c490f9b3b04dfbd8c355265c4f918bc92207bbf36e574a72cc5e5e917"],
    [
        "tests/fixtures/media/synthetic-segment.m4s",
        "50c9b1272b5f225c244a405a06ba7a41b18a3a7c30e034138ee396df5e5ca004",
    ],
]);
const files = [
    "tests/fixtures/media/synthetic.m3u8",
    "tests/fixtures/media/synthetic.mpd",
    "tests/fixtures/media/README.md",
];

for (const file of files) {
    const content = await readFile(file, "utf8");

    if (/https?:\/\//u.test(content)) {
        throw new Error(`Fixture ${file} contém URL externa.`);
    }
}

for (const [file, expectedSha256] of expectedBinarySha256) {
    const binary = await readFile(file);
    const actualSha256 = createHash("sha256").update(binary).digest("hex");
    if (actualSha256 !== expectedSha256) {
        throw new Error(`Checksum da fixture ${file} não corresponde ao auditado.`);
    }
}

const artworkDirectory = "real_dev/frontend/public/media/demo/artwork";
const artworkFiles = (await readdir(artworkDirectory)).filter((file) => file.endsWith(".svg"));
if (artworkFiles.length !== 96) {
    throw new Error(`Artwork demo inválido: esperado 96, obtido ${artworkFiles.length}.`);
}
for (const file of artworkFiles) {
    const content = await readFile(`${artworkDirectory}/${file}`, "utf8");
    const withoutXmlNamespace = content
        .replace("http://www.w3.org/2000/svg", "")
        .replace("http://www.w3.org/1999/xhtml", "");
    if (/https?:\/\//u.test(withoutXmlNamespace)) {
        throw new Error(`Artwork ${file} contém URL externa.`);
    }
}

/** @param {string} root Diretório. @returns {Promise<string[]>} Ficheiros descendentes. */
async function descendantFiles(root) {
    const entries = await readdir(root, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const path = resolve(root, entry.name);
        if (entry.isDirectory()) files.push(...(await descendantFiles(path)));
        else files.push(path);
    }
    return files;
}

const frontendPublicRoot = resolve("real_dev/frontend/public");
const publicPlaybackFiles = (await descendantFiles(frontendPublicRoot)).filter(
    (file) => /\.(?:mp4|m4s|m3u8|mpd|vtt)$/iu.test(file),
);
if (publicPlaybackFiles.length > 0) {
    throw new Error(
        `Playback público proibido: ${publicPlaybackFiles.join(", ")}.`,
    );
}

console.log("Fixtures media: PASS (fixtures de teste auditadas; frontend/public contém apenas artwork).");
