import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      // Force ESM import for vitest-chrome (CJS entry tries to require vitest)
      "vitest-chrome": resolve(
        __dirname,
        "node_modules/vitest-chrome/lib/index.esm.js"
      ),
    },
  },
});
