import axios from "axios";
import { API_BASE_URL } from "../config";

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

http.interceptors.request.use((config) => {
  const stored = localStorage.getItem("exam-system-auth");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default http;

