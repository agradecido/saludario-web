import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["localhost", "saludario-web.monkey-muskellunge.ts.net", "ai-ubuntu-server.monkey-muskellunge.ts.net", "192.168.0.162", "hp-laptop.monkey-muskellunge.ts.net"],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
