import { defineConfig } from "vitest/config";

// Explicit config so Vitest resolves this package's own config instead of
// walking up to and loading an unrelated vite.config.ts from a parent directory.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
