/**
 * @file Ficheiro `real_dev/backend/scripts/show-dev-reset-token.js` da implementação real_dev.
 */

import { getLatestDevPasswordResetToken } from "../src/modules/auth/auth.service.js";

const email = process.argv[2]?.trim();

if (!email) {
    console.error(
        "Uso: ENABLE_DEV_RESET_TOKEN_OUTBOX=true npm run dev:reset-token -- email@exemplo.test",
    );
    process.exit(1);
}

try {
    const tokenRecord = await getLatestDevPasswordResetToken(email);

    console.log(
        JSON.stringify(
            {
                email: tokenRecord.email,
                resetToken: tokenRecord.resetToken,
                expiresAt: tokenRecord.expiresAt,
            },
            null,
            2,
        ),
    );
    process.exit(0);
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
