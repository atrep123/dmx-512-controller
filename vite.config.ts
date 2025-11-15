import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { realpathSync } from "node:fs";
import { resolve } from "path";

const projectRoot = realpathSync(
  process.env.PROJECT_ROOT || import.meta.dirname
);
const baseHref = process.env.PUBLIC_URL || "/";
const serverPort = Number(process.env.PORT || 3000);

if (process.cwd() !== projectRoot) {
  process.chdir(projectRoot);
}

// https://vite.dev/config/
export default defineConfig({
  root: projectRoot,
  base: baseHref,
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin({ port: serverPort }) as PluginOption,
  ],
  server: {
    port: serverPort,
    strictPort: false,
    host: true,
    open: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },
  optimizeDeps: {
    entries: ["./src/main.tsx"],
    exclude: ["@tauri-apps/api"],
  },
});
