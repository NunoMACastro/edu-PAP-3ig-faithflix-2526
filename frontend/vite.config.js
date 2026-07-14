/**
 * @file Ficheiro `real_dev/frontend/vite.config.js` da implementação real_dev.
 */

import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolveApiBaseUrl } from "./src/config/apiBaseUrl.js";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
    const publicEnvironment = loadEnv(mode, frontendRoot, "VITE_");

    // Falhar no build/arranque evita publicar um bundle que só quebraria no browser.
    resolveApiBaseUrl({
        rawValue: publicEnvironment.VITE_API_BASE_URL,
        mode,
    });

    return {
        // Keep Vite cache out of node_modules so local installs with stricter
        // as permissões não bloqueiam o servidor de desenvolvimento.
        cacheDir: ".cache/vite",
        plugins: [react()],
        server: {
            port: 5181,
            strictPort: true,
        },
    };
});
