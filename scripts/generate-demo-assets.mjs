/**
 * @file Gera exclusivamente artwork público para a demo FaithFlix.
 *
 * Playback e faixas nunca são copiados para `frontend/public`; o seed backend
 * instala o MP4 sintético auditado no `MEDIA_STORAGE_ROOT` privado.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
    DEMO_CONTENT_TITLES,
    slugify,
} from "../real_dev/backend/scripts/demo-seed-utils.js";

const outputRoot = resolve("real_dev/frontend/public/media/demo");
const artworkRoot = resolve(outputRoot, "artwork");
await mkdir(artworkRoot, { recursive: true });

const palettes = [
    ["#172033", "#d7b45a"], ["#1d3a35", "#8fd3b6"],
    ["#3b2434", "#e8a8bd"], ["#28254a", "#b9b0ff"],
    ["#46321f", "#f2c078"], ["#19364a", "#89c7ed"],
];

/** @param {string} value Texto. @returns {string} XML seguro. */
function escapeXml(value) {
    return value.replace(/[&<>"']/gu, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
    })[character]);
}

/**
 * Cria um SVG simples e legível sem fontes ou recursos externos.
 *
 * @param {string} title Título.
 * @param {number} index Índice.
 * @param {"poster"|"backdrop"} kind Formato.
 * @returns {string} SVG.
 */
function artwork(title, index, kind) {
    const poster = kind === "poster";
    const width = poster ? 600 : 1200;
    const height = poster ? 900 : 675;
    const [background, accent] = palettes[index % palettes.length];
    const safeTitle = escapeXml(title);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${safeTitle}">
  <rect width="${width}" height="${height}" fill="${background}"/>
  <circle cx="${Math.round(width * 0.78)}" cy="${Math.round(height * 0.22)}" r="${Math.round(width * 0.18)}" fill="${accent}" opacity="0.3"/>
  <path d="M0 ${Math.round(height * 0.72)} L${width} ${Math.round(height * 0.42)} V${height} H0 Z" fill="${accent}" opacity="0.18"/>
  <text x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.12)}" fill="${accent}" font-family="system-ui,sans-serif" font-size="${poster ? 30 : 34}" font-weight="700">FAITHFLIX</text>
  <foreignObject x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.3)}" width="${Math.round(width * 0.78)}" height="${Math.round(height * 0.42)}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#f7f4ea;font:700 ${poster ? 54 : 64}px/1.12 system-ui,sans-serif;overflow-wrap:anywhere">${safeTitle}</div>
  </foreignObject>
  <text x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.9)}" fill="#f7f4ea" font-family="system-ui,sans-serif" font-size="${poster ? 22 : 26}">Asset sintético de demonstração</text>
</svg>\n`;
}

for (const [index, title] of DEMO_CONTENT_TITLES.entries()) {
    const slug = slugify(title);
    await Promise.all([
        writeFile(resolve(artworkRoot, `${slug}-poster.svg`), artwork(title, index, "poster")),
        writeFile(resolve(artworkRoot, `${slug}-backdrop.svg`), artwork(title, index, "backdrop")),
    ]);
}

console.log(`Assets demo gerados: artwork=${DEMO_CONTENT_TITLES.length * 2}, playback_publico=0.`);
