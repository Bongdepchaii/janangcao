import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { 
        historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
        rewrite: (path) => path.replace(/^\/api/, '/home'),
      },
      "/cart":{
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
        rewrite: (path) => path.replace(/^\/cart/, '/cart'),
      },
      "/cartcount":{
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
        rewrite: (path) => path.replace(/^\/cartcount/, '/cartcount'),
      },
      "/productdetail": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
        // rewrite: (path) => path.replace(/^\/productdetail/, '/productdetail'),
      },
      '/images': { 
        target: 'http://localhost:8080', 
        changeOrigin: true,
         historyApiFallback: true,
      },
      "/productcount": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
        rewrite: (path) => path.replace(/^\/productcount/, "/productcount"),
      },
      "/addproduct": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
        rewrite: (p) => p.replace(/^\/addproduct/, "/addproduct"),
      },
      "/updateproduct": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
      },
      "/deleteproduct": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
      },
      "/addtocart": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
      },
      "/deletecart": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
      },
      "/order": {
        target: "http://localhost:8080",
        changeOrigin: true,
         historyApiFallback: true,
      },
    },
  },
});
