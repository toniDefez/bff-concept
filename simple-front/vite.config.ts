import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiBaseUrl = (process.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiBaseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
});
