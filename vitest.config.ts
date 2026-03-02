import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: "happy-dom",
        setupFiles: ["./tests/setup.ts"],
        include: ["app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        globals: true,
        css: {
            include: [],  // Ignore all css imports
        },
        server: {
            deps: {
                inline: ["@asamuzakjp/css-color", "@csstools/css-calc"]
            }
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "lcov"],
            include: ["app/**/*.{ts,tsx}"],
            exclude: [
                "app/**/*.test.{ts,tsx}",
                "app/entry.client.tsx",
                "app/entry.server.tsx",
                "app/root.tsx",
                "app/routes.ts",
                "app/localization/i18n.ts",
                "app/**/types.ts",
                "app/**/*.server.ts",
                "app/services/**/*"
            ]
        }
    },
});
