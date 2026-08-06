import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// React is a dependency of apps/web, not the workspace root, so bare "react"
// imports from tests/web/** have no node_modules to resolve against.
const webPackage = (name: string) =>
  fileURLToPath(new URL(`./apps/web/node_modules/${name}`, import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "convex",
          environment: "edge-runtime",
          include: ["tests/convex/**/*.test.ts"],
          // convex-test ships ESM that must be transformed rather than externalized.
          server: { deps: { inline: ["convex-test"] } },
        },
      },
      {
        plugins: [react()],
        resolve: {
          alias: [
            { find: /^react$/, replacement: webPackage("react") },
            { find: /^react\//, replacement: `${webPackage("react")}/` },
            { find: /^react-dom$/, replacement: webPackage("react-dom") },
            { find: /^react-dom\//, replacement: `${webPackage("react-dom")}/` },
          ],
        },
        test: {
          name: "web",
          environment: "jsdom",
          include: ["tests/web/**/*.test.{ts,tsx}"],
          setupFiles: ["./tests/setup/web.ts"],
        },
      },
    ],
  },
});
