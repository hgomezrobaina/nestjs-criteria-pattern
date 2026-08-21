import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@book": resolve(__dirname, "src/book"),
    },
  },
  test: {
    include: ["__test__/**/*.spec.ts"],
    // Every test in THIS suite runs against plain objects: no database, no container,
    // no network. That is the point being measured in the article, so the one test
    // that does need an engine lives apart and runs with its own config.
    exclude: ["**/node_modules/**", "__test__/integration/**"],
    environment: "node",
  },
});
