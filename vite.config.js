import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/home'),
      },
      "/productdetail": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/productdetail/, '/productdetail'),
      },
      '/images': { 
        target: 'http://localhost:8080', 
        changeOrigin: true,
      },
      "/productcount": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/productcount/, "/productcount"),
      },
      "/addproduct": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/addproduct/, "/addproduct"),
      },
      "/deleteproduct": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
