import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      generatedRouteTree: "src/routeTree.gen.ts",
      routesDirectory: "src/routes",
    }),
    react(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
      },
      "/healthz": {
        target: "http://127.0.0.1:3001",
      },
    },
  },
});
