import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: false, // JWT no usa cookie
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth");
    const { token } = raw ? JSON.parse(raw) : { token: null };
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    delete config.headers.Authorization;
  }
  return config;
});

// si el back devuelve 401, limpia sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("auth");
    }
    return Promise.reject(err);
  }
);

export default api;
