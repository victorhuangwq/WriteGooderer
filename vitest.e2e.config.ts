import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["e2e/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    environment: "node",
    // Run sequentially - tests share a browser instance
    sequence: {
      concurrent: false,
    },
  },
});
