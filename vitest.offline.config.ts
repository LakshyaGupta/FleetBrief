// Pure product tests and public-page SSR. No app identity is fabricated.
// Full SDK/build checks still require `deepspace app init` first.
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: [
      "src/fleet/**/*.test.{ts,tsx}",
      "src/actions/**/*.test.ts",
      "src/schemas/fleet-schema.test.ts",
      "src/prerender-entry.test.tsx",
    ],
    environment: "node",
  },
});
