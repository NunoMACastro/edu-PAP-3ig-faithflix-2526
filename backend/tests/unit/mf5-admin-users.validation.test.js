// apps/backend/tests/unit/mf5-admin-users.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
} from "../../src/modules/users/user.validation.js";

test("MF5 valida atualização admin de utilizadores", () => {
    // O caso válido confirma o contrato que o service pode persistir.
    assert.deepEqual(
        assertAdminUserUpdate({ role: "moderator", accountStatus: "blocked" }),
        { role: "moderator", accountStatus: "blocked" },
    );

    // A pesquisa é tratada como texto literal, não como expressão regular livre.
    assert.deepEqual(assertAdminUserFilters({ search: "ana.*", status: "active" }), {
        search: "ana\\.\\*",
        status: "active",
    });

    assert.throws(() => assertAdminUserUpdate({ role: "owner" }), /Role/);
    assert.throws(
        () => assertAdminUserUpdate({ accountStatus: "archived" }),
        /Estado/,
    );
    assert.throws(() => assertAdminUserUpdate({}), /Indica/);
    assert.throws(() => assertAdminUserFilters({ status: "deleted" }), /estado/);
});