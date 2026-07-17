import { defineConfig } from "vitest/config";
export default defineConfig({
  esbuild: { jsx: "automatic" },
  build: { outDir: "dist" },
  test: { environment: "jsdom" },
});
