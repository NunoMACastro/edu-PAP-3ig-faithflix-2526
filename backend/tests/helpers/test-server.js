/**
 * @file Ficheiro `real_dev/backend/tests/helpers/test-server.js` da implementação real_dev.
 */

import { createApp } from "../../src/app.js";

/**
 * Arranca a app Express numa porta local aleatória para testes smoke.
 *
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>} Controlos do servidor de teste.
 * @throws {Error} Lança erro quando o Node não expõe a porta de teste atribuída.
 */
export async function startTestServer() {
    const app = createApp();
    const server = app.listen(0, "127.0.0.1");

    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    const address = server.address();
    const port =
        typeof address === "object" && address !== null ? address.port : null;

    if (port === null) {
        throw new Error("Nao foi possivel obter a porta do servidor de teste.");
    }

    return {
        baseUrl: `http://127.0.0.1:${port}`,

        /**
         * Para o servidor de teste depois da suite smoke terminar.
         *
         * @returns {Promise<void>} Termina quando o servidor é fechado.
         */
        close: () =>
            new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            }),
    };
}
