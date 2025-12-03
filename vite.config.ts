import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 一些第三方库（如 sockjs-client）在浏览器环境中仍然使用 Node 的 global 变量，
// 这里为打包环境提供一个简单的 polyfill，避免 "global is not defined" 报错。
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window"
  },
  server: {
    port: 5173,
    proxy: {
      // 统一以 /exam-online 前缀转发到后端应用，避免浏览器直接跨域
      "/exam-online": {
        target: process.env.VITE_API_BASE_URL ?? "http://localhost:8080",
        changeOrigin: true
      },
      "/api": {
        target: process.env.VITE_API_BASE_URL ?? "http://localhost:8080",
        changeOrigin: true
      },
      "/ws": {
        target: process.env.VITE_WS_BASE_URL ?? "http://localhost:8080",
        changeOrigin: true,
        ws: true
      }
    }
  }
});

