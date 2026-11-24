import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Isolated public demo preview; never used by `build` or `deploy`.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "preview-dist",
    rolldownOptions: { input: "preview/index.html" },
  },
  server: { host: "127.0.0.1", port: 5174, strictPort: true },
});
