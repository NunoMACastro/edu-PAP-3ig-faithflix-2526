/**
 * @file Regressões de calendário para ciclos financeiros.
 *
 * Valida os limites que o `Date#setMonth` nativo não preserva, sem abrir DB,
 * rede, worker ou qualquer processo externo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { addBillingCycle } from "../../src/modules/subscriptions/subscriptions.validation.js";

test("ciclo mensal limita 31 de janeiro ao fim de fevereiro", () => {
  assert.equal(
    addBillingCycle(
      new Date("2024-01-31T18:45:30.123Z"),
      "monthly",
    ).toISOString(),
    "2024-02-29T18:45:30.123Z",
  );
  assert.equal(
    addBillingCycle(
      new Date("2025-01-31T18:45:30.123Z"),
      "monthly",
    ).toISOString(),
    "2025-02-28T18:45:30.123Z",
  );
});

test("ciclo anual limita 29 de fevereiro ao fim de fevereiro seguinte", () => {
  assert.equal(
    addBillingCycle(
      new Date("2024-02-29T09:00:00.000Z"),
      "yearly",
    ).toISOString(),
    "2025-02-28T09:00:00.000Z",
  );
});

test("âncora distingue fim do mês de um dia apenas limitado", () => {
  const endOfMonth = { anchorDay: 31, anchorEndOfMonth: true };
  const dayThirty = { anchorDay: 30, anchorEndOfMonth: false };
  assert.equal(
    addBillingCycle(
      new Date("2024-02-29T12:00:00.000Z"),
      "monthly",
      endOfMonth,
    ).toISOString(),
    "2024-03-31T12:00:00.000Z",
  );
  assert.equal(
    addBillingCycle(
      new Date("2024-02-29T12:00:00.000Z"),
      "monthly",
      dayThirty,
    ).toISOString(),
    "2024-03-30T12:00:00.000Z",
  );
});

test("ciclo rejeita intervalos fora do contrato fechado", () => {
  assert.throws(
    () => addBillingCycle(new Date("2026-01-01T00:00:00.000Z"), "weekly"),
    /Ciclo de plano inválido/,
  );
});
