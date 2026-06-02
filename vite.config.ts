import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  base: "/forge-signal-demo/",
  plugins: [react(), wasm()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  worker: {
    format: "es",
    plugins: () => [wasm()],
  },
});
