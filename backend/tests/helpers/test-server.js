import { createApp } from "../../src/app.js";

/**
 * Starts the Express app on a random local port for smoke tests.
 *
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>} Test server controls.
 * @throws {Error} Throws when Node does not expose the assigned test port.
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
         * Stops the test server after the smoke suite finishes.
         *
         * @returns {Promise<void>} Resolves when the server is closed.
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
