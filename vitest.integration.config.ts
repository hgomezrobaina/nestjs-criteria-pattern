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
    include: ["__test__/integration/**/*.spec.ts"],
    environment: "node",
    // Starting a real mongod the first time downloads its binary.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
