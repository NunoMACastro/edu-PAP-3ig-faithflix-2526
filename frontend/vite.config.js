import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    // Keep Vite cache out of node_modules so local installs with stricter
    // permissions do not block the development server.
    cacheDir: ".cache/vite",
    plugins: [react()],
});
