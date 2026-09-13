import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fallback to CJS/JS entry when ESM .mjs is missing (e.g. corrupted install)
      "react-hook-form": path.resolve(
        __dirname,
        "node_modules/react-hook-form/dist/index.cjs.js"
      ),
      "@hookform/resolvers/zod": path.resolve(
        __dirname,
        "node_modules/@hookform/resolvers/zod/dist/zod.module.js"
      ),
    },
  },
  optimizeDeps: {
    include: ["react-hook-form", "@hookform/resolvers"],
  },
});
