import { defineConfig } from "vite";
export default defineConfig({
  esbuild: { jsx: "automatic" },
  build: { outDir: "dist" },
  test: { environment: "jsdom" },
});
