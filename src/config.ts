// 前端在开发环境下通过 Vite 代理转发到后端，避免直接跨域请求。
// 如果需要自定义后端地址，可以在 .env 文件里配置 VITE_API_BASE_URL / VITE_WS_BASE_URL。
// API_BASE_URL 只是作为 axios 的 baseURL 前缀，这里默认留空，让各个接口自己写完整路径（如 /exam-online/auth/login）。
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "/ws";

