/**
 * @file Contrato da copy dinâmica que pode ser devolvida pelo backend à interface.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const PUBLIC_COPY_BOUNDARIES = [
  "src/modules/auth/auth.service.js",
  "src/modules/demo-mailbox/demo-mailbox.service.js",
  "src/modules/integrations/integrations.validation.js",
  "src/modules/recommendations/recommendation-explanations.js",
  "scripts/seed-demo-charities.js",
  "scripts/seed-demo-engagement.js",
];
const FORBIDDEN_PUBLIC_COPY = [
  "Pagamentos simulados",
  "Notificações internas",
  "Evento representativo da atividade FaithFlix de demonstração.",
  "Documentação insuficiente para a demonstração.",
  "Utiliza o token abaixo",
  "Token de recuperacao invalido ou expirado.",
  "recomendacao baseline",
];

/**
 * Remove comentários para analisar apenas strings e lógica que podem alimentar
 * respostas públicas, preservando vocabulário técnico legítimo na documentação.
 *
 * @param {string} source Código-fonte do boundary.
 * @returns {string} Código sem comentários.
 */
function withoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

test("copy pública dinâmica não expõe simulações ou fases internas", () => {
  const violations = PUBLIC_COPY_BOUNDARIES.flatMap((file) => {
    const source = withoutComments(readFileSync(resolve(process.cwd(), file), "utf8"));

    return FORBIDDEN_PUBLIC_COPY.flatMap((copy) =>
      source.includes(copy) ? [{ file, copy }] : [],
    );
  });

  assert.deepEqual(violations, []);
});
