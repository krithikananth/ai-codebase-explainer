// ──────────────────────────────────────────────────────────────
// api/axios.js — Axios instance with JWT interceptor
// Centralizes all API requests with auth token injection
// ──────────────────────────────────────────────────────────────
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 300000, // 5 min timeout for AI analysis
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;