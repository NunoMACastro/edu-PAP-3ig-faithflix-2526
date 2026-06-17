// apps/backend/tests/unit/mf5-privacy-delete.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertDeleteAccountPayload,
    DELETE_ACCOUNT_CONFIRMATION,
} from "../../src/modules/privacy/privacy.validation.js";

test("MF5 valida confirmação forte para eliminar conta", () => {
    assert.deepEqual(
        assertDeleteAccountPayload({ confirmation: DELETE_ACCOUNT_CONFIRMATION }),
        { confirmation: DELETE_ACCOUNT_CONFIRMATION },
    );

    assert.throws(
        () => assertDeleteAccountPayload({ confirmation: "eliminar conta" }),
        /ELIMINAR CONTA/,
    );
});