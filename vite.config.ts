import { defineConfig } from "vite";
import { resolve } from "path";
import { cpSync, mkdirSync, rmSync } from "fs";

// Which entry to build is controlled by the ENTRY env var.
// The build script runs this config 3 times with different ENTRY values.
const ENTRIES: Record<string, { input: string; format: "iife" | "es" }> = {
  "service-worker": {
    input: resolve(__dirname, "src/background/service-worker.ts"),
    format: "es",
  },
  content: {
    input: resolve(__dirname, "src/content/index.ts"),
    format: "iife",
  },
  popup: {
    input: resolve(__dirname, "src/popup/popup.ts"),
    format: "iife",
  },
};

const entryName = process.env.ENTRY || "content";
const entry = ENTRIES[entryName];

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: entry.input,
      name: entryName,
      formats: [entry.format === "es" ? "es" : "iife"],
      fileName: () => `${entryName}.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: "es2022",
    minify: false,
    sourcemap: false,
  },
  plugins: [
    {
      name: "copy-extension-assets",
      closeBundle() {
        if (entryName !== "content") return; // only copy once
        cpSync(
          resolve(__dirname, "manifest.json"),
          resolve(__dirname, "dist/manifest.json")
        );
        mkdirSync(resolve(__dirname, "dist/icons"), { recursive: true });
        cpSync(
          resolve(__dirname, "public/icons"),
          resolve(__dirname, "dist/icons"),
          { recursive: true }
        );
        mkdirSync(resolve(__dirname, "dist/fonts"), { recursive: true });
        cpSync(
          resolve(__dirname, "public/fonts"),
          resolve(__dirname, "dist/fonts"),
          { recursive: true }
        );
        cpSync(
          resolve(__dirname, "src/popup/popup.html"),
          resolve(__dirname, "dist/popup.html")
        );
        cpSync(
          resolve(__dirname, "src/popup/popup.css"),
          resolve(__dirname, "dist/popup.css")
        );
      },
    },
  ],
});
