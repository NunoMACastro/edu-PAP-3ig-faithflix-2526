/**
 * @file Gera uma fixture de vídeo fMP4 a partir de canvas, sem conteúdo real.
 *
 * Requer apenas o Chromium já instalado pelo Playwright. O output inclui o
 * ficheiro progressivo completo e os pares init/media reutilizados pelos
 * manifests HLS e DASH mantidos em `tests/fixtures/media`.
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const outputArgument = process.argv.find((argument) =>
    argument.startsWith("--output-dir="),
);
const outputDirectory = resolve(
    outputArgument?.slice("--output-dir=".length) ||
        "tests/fixtures/media",
);

/**
 * Lê as caixas ISO BMFF de topo sem interpretar payload audiovisual.
 *
 * @param {Buffer} buffer Ficheiro MP4 completo.
 * @returns {{ type: string, start: number, end: number }[]} Caixas validadas.
 */
function topLevelBoxes(buffer) {
    const boxes = [];
    let offset = 0;

    while (offset + 8 <= buffer.length) {
        const size32 = buffer.readUInt32BE(offset);
        const type = buffer.toString("ascii", offset + 4, offset + 8);
        let headerSize = 8;
        let size = size32;

        if (size32 === 1) {
            if (offset + 16 > buffer.length) {
                throw new Error("Caixa MP4 extensa truncada.");
            }
            size = Number(buffer.readBigUInt64BE(offset + 8));
            headerSize = 16;
        } else if (size32 === 0) {
            size = buffer.length - offset;
        }

        if (
            !Number.isSafeInteger(size) ||
            size < headerSize ||
            offset + size > buffer.length
        ) {
            throw new Error(`Caixa MP4 inválida em ${offset}.`);
        }

        boxes.push({ type, start: offset, end: offset + size });
        offset += size;
    }

    if (offset !== buffer.length) {
        throw new Error("Bytes residuais após as caixas MP4.");
    }

    return boxes;
}

/** @param {Buffer} value Conteúdo. @returns {string} SHA-256 hexadecimal. */
function sha256(value) {
    return createHash("sha256").update(value).digest("hex");
}

/**
 * Normaliza os tempos do primeiro fragmento emitido pelo encoder.
 *
 * Algumas versões Chromium mantêm o primeiro frame durante toda a latência de
 * arranque do encoder e escrevem a duração da movie timescale diretamente no
 * media header. HLS tolera ambos os valores, mas Chromium MSE via dash.js não.
 * A normalização limita o primeiro sample à mediana dos restantes e recalcula
 * `mvhd`, `tkhd` e `mdhd` nas respetivas timescales.
 *
 * @param {Buffer} buffer fMP4 mutável.
 * @returns {number} Duração final em segundos.
 */
function normalizeMediaTiming(buffer) {
    const movieType = buffer.indexOf(Buffer.from("mvhd"));
    const trackType = buffer.indexOf(Buffer.from("tkhd"));
    const mediaType = buffer.indexOf(Buffer.from("mdhd"));
    const runType = buffer.indexOf(Buffer.from("trun"));
    if (movieType < 4 || trackType < 4 || mediaType < 4 || runType < 4) {
        throw new Error("fMP4 sem `mvhd`/`tkhd`/`mdhd`/`trun`.");
    }

    const movieVersion = buffer[movieType + 4];
    const trackVersion = buffer[trackType + 4];
    const mediaVersion = buffer[mediaType + 4];
    const movieTimescaleOffset = movieType + (movieVersion === 1 ? 24 : 16);
    const movieDurationOffset = movieType + (movieVersion === 1 ? 28 : 20);
    const trackDurationOffset = trackType + (trackVersion === 1 ? 32 : 24);
    const mediaTimescaleOffset = mediaType + (mediaVersion === 1 ? 24 : 16);
    const mediaDurationOffset = mediaType + (mediaVersion === 1 ? 28 : 20);
    const movieTimescale = buffer.readUInt32BE(movieTimescaleOffset);
    const mediaTimescale = buffer.readUInt32BE(mediaTimescaleOffset);
    const runFlags = buffer.readUInt32BE(runType + 4) & 0x00ffffff;
    const sampleCount = buffer.readUInt32BE(runType + 8);
    let cursor = runType + 12;
    if (runFlags & 0x000001) cursor += 4;
    if (runFlags & 0x000004) cursor += 4;
    const durationOffsets = [];

    for (let index = 0; index < sampleCount; index += 1) {
        if (runFlags & 0x000100) {
            durationOffsets.push(cursor);
            cursor += 4;
        }
        if (runFlags & 0x000200) cursor += 4;
        if (runFlags & 0x000400) cursor += 4;
        if (runFlags & 0x000800) cursor += 4;
    }

    if (durationOffsets.length !== sampleCount || sampleCount < 2) {
        throw new Error("`trun` sem durações explícitas suficientes.");
    }

    const laterDurations = durationOffsets
        .slice(1)
        .map((offset) => buffer.readUInt32BE(offset))
        .sort((left, right) => left - right);
    const medianDuration = laterDurations[
        Math.floor(laterDurations.length / 2)
    ];
    const firstDuration = buffer.readUInt32BE(durationOffsets[0]);
    if (firstDuration > medianDuration * 2) {
        buffer.writeUInt32BE(medianDuration, durationOffsets[0]);
    }

    const mediaDuration = durationOffsets.reduce(
        (total, offset) => total + buffer.readUInt32BE(offset),
        0,
    );
    const movieDuration = Math.round(
        (mediaDuration * movieTimescale) / mediaTimescale,
    );

    if (
        !movieTimescale ||
        !mediaTimescale ||
        !Number.isSafeInteger(mediaDuration) ||
        !Number.isSafeInteger(movieDuration) ||
        mediaDuration <= 0 ||
        movieDuration <= 0
    ) {
        throw new Error("Timescale/duração fMP4 inválida.");
    }

    const writeDuration = (version, offset, value) => {
        if (version === 1) buffer.writeBigUInt64BE(BigInt(value), offset);
        else buffer.writeUInt32BE(value, offset);
    };
    writeDuration(movieVersion, movieDurationOffset, movieDuration);
    writeDuration(trackVersion, trackDurationOffset, movieDuration);
    if (mediaVersion === 1) {
        buffer.writeBigUInt64BE(BigInt(mediaDuration), mediaDurationOffset);
    } else {
        buffer.writeUInt32BE(mediaDuration, mediaDurationOffset);
    }

    return mediaDuration / mediaTimescale;
}

const browser = await chromium.launch();
let recording;

try {
    const page = await browser.newPage();
    recording = await page.evaluate(async () => {
        const mimeType = "video/mp4;codecs=avc1.42E01E";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            throw new Error(`MediaRecorder sem suporte para ${mimeType}.`);
        }

        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const context = canvas.getContext("2d");
        const stream = canvas.captureStream(12);
        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 180_000,
        });
        const chunks = [];
        recorder.addEventListener("dataavailable", (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        });

        let frame = 0;
        const paint = () => {
            const hue = (frame * 7) % 360;
            context.fillStyle = `hsl(${hue} 55% 18%)`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#f2d675";
            context.fillRect((frame * 4) % 260, 55, 60, 60);
            context.fillStyle = "#ffffff";
            context.font = "bold 20px sans-serif";
            context.fillText("FaithFlix fixture sintética", 22, 32);
            context.font = "16px monospace";
            context.fillText(`frame ${String(frame).padStart(3, "0")}`, 96, 150);
            frame += 1;
        };

        paint();
        const interval = setInterval(paint, 1000 / 12);
        const stopped = new Promise((resolveStopped) =>
            recorder.addEventListener("stop", resolveStopped, { once: true }),
        );
        recorder.start(250);
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 2_200));
        recorder.stop();
        await stopped;
        clearInterval(interval);
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunks, { type: mimeType });
        const dataUrl = await new Promise((resolveDataUrl, rejectDataUrl) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolveDataUrl(reader.result));
            reader.addEventListener("error", () => rejectDataUrl(reader.error));
            reader.readAsDataURL(blob);
        });

        return { dataUrl, mimeType, durationSeconds: 2.2 };
    });
} finally {
    await browser.close();
}

const base64 = String(recording.dataUrl).split(",", 2)[1];
const progressive = Buffer.from(base64, "base64");
const normalizedDurationSeconds = normalizeMediaTiming(progressive);
const boxes = topLevelBoxes(progressive);
const firstMediaBox = boxes.findIndex(({ type }) => type === "moof");

if (firstMediaBox < 0) {
    throw new Error(
        `MediaRecorder não produziu fMP4 fragmentado: ${boxes.map(({ type }) => type).join(", ")}`,
    );
}

const splitOffset = boxes[firstMediaBox].start;
const initialization = progressive.subarray(0, splitOffset);
const mediaBoxes = boxes.slice(firstMediaBox).filter(({ type }) =>
    type === "moof" || type === "mdat",
);
const segment = Buffer.concat(
    mediaBoxes.map(({ start, end }) => progressive.subarray(start, end)),
);

if (!boxes.slice(0, firstMediaBox).some(({ type }) => type === "moov")) {
    throw new Error("A inicialização fMP4 não contém `moov`.");
}

if (
    mediaBoxes.length < 2 ||
    mediaBoxes[0].type !== "moof" ||
    !mediaBoxes.some(({ type }) => type === "mdat")
) {
    throw new Error("O fragmento fMP4 não contém o par `moof`/`mdat`.");
}

await mkdir(outputDirectory, { recursive: true });
const outputs = [
    ["synthetic-progressive.mp4", progressive],
    ["synthetic-init.mp4", initialization],
    ["synthetic-segment.m4s", segment],
];

for (const [name, value] of outputs) {
    await writeFile(resolve(outputDirectory, name), value);
    console.log(`${name} ${value.length} bytes sha256=${sha256(value)}`);
}

console.log(
    `mime=${recording.mimeType} duration=${normalizedDurationSeconds.toFixed(6)}s boxes=${boxes.map(({ type }) => type).join(",")}`,
);
