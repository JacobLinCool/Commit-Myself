import { defineConfig } from "tsup";

export default defineConfig(() => ({
    entry: ["src/commit-myself.ts"],
    outDir: "dist",
    target: "node12",
    format: ["cjs"],
    clean: true,
    splitting: false,
}));
