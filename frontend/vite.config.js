/**
 * @file Ficheiro `real_dev/frontend/vite.config.js` da implementação real_dev.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    // Keep Vite cache out of node_modules so local installs with stricter
    // as permissões não bloqueiam o servidor de desenvolvimento.
    cacheDir: ".cache/vite",
    plugins: [react()],
});
