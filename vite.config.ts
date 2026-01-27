import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    // TanStack Router/Start plugins must come before viteReact
    tanstackStart(),
    viteReact({
      jsxRuntime: "automatic",
      fastRefresh: true,
    }),
  ],
  server: {
    hmr: {
      overlay: true,
      clientPort: 3000,
    },
    watch: {
      usePolling: false,
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});

export default config;
