import axios from "axios";

// ─── Base instance pointing at our Express backend ────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,           // Send HttpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach token from localStorage if present ───────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-redirect on 401 if it's NOT an auth-check endpoint
    // Prevents redirect loop on initial /auth/me hydration
    const url = error.config?.url || "";
    const isAuthCheck = url.includes("/auth/me") || url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/forgot") || url.includes("/auth/reset");

    if (error.response?.status === 401 && !isAuthCheck) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
