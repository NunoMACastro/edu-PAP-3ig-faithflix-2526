// apps/backend/tests/unit/mf5-integrations.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
} from "../../src/modules/integrations/integrations.validation.js";

test("MF5 valida integração admin controlada", () => {
    // A chave válida confirma que só integrações da lista fechada podem avançar.
    assert.equal(assertIntegrationKey("internal_notifications"), "internal_notifications");

    // A atualização válida mostra que apenas configuração pública entra no contrato.
    assert.deepEqual(
        assertIntegrationUpdate({
            enabled: true,
            mode: "internal",
            publicConfig: { channel: "in_app" },
        }),
        {
            enabled: true,
            mode: "internal",
            publicConfig: { channel: "in_app" },
        },
    );

    // Os negativos impedem fornecedores reais ou modos fora do MVP.
    assert.throws(() => assertIntegrationKey("provider_real"), /Integração/);
    assert.throws(
        () => assertIntegrationUpdate({ enabled: true, mode: "real" }),
        /Modo/,
    );
});